import * as most from "most";
import invariant from "invariant";
import warning from "warning";
import createCursorBackend from "../cursor";
import createCursorAPI from "../utils/createCursorAPI";
import generateStoreId, { couldBeStoreId } from "../utils/generateStoreId";
import { multicast, prioritise } from "../utils/multicast";
import combineValuesIntoEnum from "../utils/streams/combineValuesIntoEnum";
import createEventSource from "../utils/streams/eventSource";
import filterUnchangedKeyArrays from "../utils/streams/filterUnchangedKeyArrays";

const createMirrorBackend = () => {
  let root;
  const storeMap = {};
  const cursorBackend = createCursorBackend();

  const { push: onStoreUpdated, $stream: $storeUpdated } = createEventSource();

  const $queryResults = $storeUpdated
    .map(({ store, op }) => {
      return cursorBackend.updateNode(root, { path: store.path, op });
    })
    .multicast();

  const updateStore = (
    store,
    { requesting = [], streams, identifiers = [], metadata = {} }
  ) => {
    Object.assign(store, { identifiers, metadata });

    invariant(
      !identifiers.some(couldBeStoreId),
      'Cannot precede all-uppercase identifiers with "_" ("%s") because they could ' +
        "conflict with internally-used IDs",
      identifiers.find(couldBeStoreId)
    );

    const $storeDeleted = $queryResults
      .filter(() => !storeMap[store.id])
      .multicast();

    let ADD_STREAMS_ASYNC;

    store.mirror = createCursorAPI((cursorMethods, query) => {
      const cursor = {};
      requesting.concat("$actions").forEach(streamName => {
        Object.defineProperty(cursor, streamName, {
          get() {
            const queryIndex = store.queries.length;
            store.queries.push(query);
            store.queryTypes.push(streamName);
            store.queryResults.push([]);
            if (ADD_STREAMS_ASYNC) {
              // warning(
              //   false,
              //   'Accessing "mirror.%s" after a store has been added is inefficient, you ' +
              //     'can batch queries with `updateStore` to improve performance',
              //   streamName
              // )
              onStoreUpdated({ store, op: "update" });
            }

            const teardown = store => ({
              type: "TEARDOWN",
              payload: undefined,
              store
            });

            const $stream = $queryResults
              .map(queryResults => {
                return queryResults[store.id]
                  ? queryResults[store.id][queryIndex]
                  : [];
              })
              .thru(filterUnchangedKeyArrays)
              .map(stores => {
                const prev = store.queryResults[queryIndex];
                store.queryResults[queryIndex] = stores;
                const $stores = stores
                  .map(id => {
                    if (
                      id === store.id &&
                      query.length &&
                      streamName === "$state"
                    ) {
                      return undefined;
                    }
                    let $stream =
                      storeMap[id] && storeMap[id].streams[streamName];
                    if (store.id === id) $stream = $stream.thru(prioritise(-1));
                    if (
                      $stream &&
                      storeMap[id] &&
                      storeMap[id].tails[streamName]
                    ) {
                      $stream = $stream.startWith(
                        storeMap[id].tails[streamName]
                      );
                    }
                    return $stream;
                  })
                  .filter(s => s);
                if (streamName === "$actions") {
                  const deletedStores = [];
                  const next = new Set(stores);
                  for (const id of prev)
                    if (!next.has(id)) deletedStores.push(id);
                  return most
                    .from(deletedStores.map(teardown))
                    .concat(most.mergeArray($stores));
                } else {
                  return combineValuesIntoEnum($stores, stores);
                }
              })
              .switchLatest()
              .until($storeDeleted);

            return streamName === "$actions"
              ? $stream.concat(most.of(teardown(store.id)))
              : $stream;
          }
        });
      });
      Object.defineProperty(cursor, "$stores", {
        get() {
          return $queryResults
            .map(() => ({
              cursor: cursorBackend.query(store.id, query),
              store
            }))
            .until($storeDeleted);
        }
      });
      Object.assign(cursor, cursorMethods);
      return cursor;
    });

    store.dispatch = createCursorAPI((cursorMethods, query) => {
      const dispatch = (type, payload, retryIfSelectionEmpty = true) => {
        if (!storeMap[store.id]) {
          warning(
            false,
            'Cannot dispatch actions ("%s") from a store ("%s") that does not exist',
            type,
            store.id
          );
          return;
        }
        const stores = cursorBackend.query(store.id, query);
        if (stores.length || !retryIfSelectionEmpty) {
          stores.forEach(id => {
            storeMap[id] &&
              storeMap[id].streams.$actions.push({ type, payload, store: id });
          });
          return;
        }

        $queryResults
          .until(
            $storeDeleted.tap(() => {
              warning(
                false,
                'No store matched an action ("%s"), & the dispatcher ("%s") was ' +
                  "removed. We've discarded the action. You could try dispatching the " +
                  "action via a proxy.",
                type,
                store.id
              );
            })
          )
          .map(() => cursorBackend.query(store.id, query))
          .filter(stores => stores.length)
          .take(1)
          .observe(stores => {
            stores.forEach(id => {
              if (storeMap[id]) {
                storeMap[id].streams.$actions.push({
                  type,
                  payload,
                  store: id
                });
              }
            });
          });
      };
      Object.assign(dispatch, cursorMethods);
      return dispatch;
    });

    if (!store.streams.$actions) {
      const { push: dispatch, $stream: $actions } = createEventSource();
      const initialize = {
        type: "INITIALIZE",
        payload: undefined,
        store: store.id
      };
      store.streams.$actions = $actions
        .startWith(initialize)
        .until($storeDeleted)
        .thru(multicast);
      store.streams.$actions.push = dispatch;
    }

    if (streams) {
      const _streams = streams(store.mirror, store.dispatch);
      Object.keys(_streams).forEach(streamName => {
        _streams[streamName] = _streams[streamName]
          .tap(evt => (store.tails[streamName] = evt))
          .thru(multicast);
      });
      store.streams = Object.assign(_streams, {
        $actions: store.streams.$actions
      });
    }

    ADD_STREAMS_ASYNC = true;
  };

  const backend = {
    addStore(parentId, { requesting, streams, identifiers, metadata }) {
      if (!parentId) parentId = root && root.id;
      const parent = storeMap[parentId];
      invariant(
        parent || !root,
        'Cannot add store as a child of "%s", because "%s" does not exist',
        parentId,
        parentId
      );

      const store = {
        /*
          '_AAC'
        */
        id: generateStoreId(),
        /*
          ['_AA', '_BX']
        */
        path: root ? parent.path.concat(parentId) : [],
        /* {$actions, $state, $props} */
        streams: {},
        /*
          {
            $actions: {type: 'INCREMENT', payload: 1},
            $state: {value: 2},
            $props: {}
          }
        */
        tails: {},
        queries: [],
        queryTypes: [],
        queryResults: [],
        children: {},
        parent
      };

      if (store.parent) store.parent.children[store.id] = store;

      updateStore(store, { requesting, streams, identifiers, metadata });
      storeMap[store.id] = store;
      onStoreUpdated({ store, op: "add" });

      return store;
    },
    removeStore(storeId) {
      const store = storeMap[storeId];
      if (!store) return;
      invariant(store !== root, "Cannot remove root store");

      const traverse = store => {
        Object.values(store.children).forEach(traverse);
        delete storeMap[store.id];
        onStoreUpdated({ store, op: "remove" });
      };
      traverse(store);

      if (store && store.parent) {
        delete store.parent.children[storeId];
      }
    },
    updateStore(storeId, { requesting, streams, identifiers, metadata }) {
      const store = storeMap[storeId];
      invariant(
        store,
        'Cannot update a store ("%s") that does not exist',
        storeId
      );

      updateStore(store, { requesting, streams, identifiers, metadata });
      onStoreUpdated({ store, op: "update" });

      return store;
    },
    query: createCursorAPI((cursorMethods, query) => {
      const runQuery = id => cursorBackend.query(id || root.id, query);
      Object.assign(runQuery, cursorMethods);
      return runQuery;
    }),
    stores: storeMap
  };

  backend.root = root = backend.addStore(null, {
    identifiers: ["MIRROR/root"],
    metadata: { root: true }
  });

  return backend;
};

export default createMirrorBackend;
