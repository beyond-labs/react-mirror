import * as most from 'most'
import invariant from 'invariant'
import warning from 'warning'
import createCursorBackend from '../cursor'
import createCursorAPI from '../utils/createCursorAPI'
import generateStoreId, {couldBeStoreId} from '../utils/generateStoreId'
import combine from '../utils/streams/combine'
import createEventSource from '../utils/streams/eventSource'
import {filterUnchangedKeyArrays} from '../utils/streams/filterUnchanged'

const createMirrorBackend = () => {
  let root
  const storeMap = {}
  const cursorBackend = createCursorBackend()

  const {push: onStoreUpdated, $stream: $storeUpdated} = createEventSource()

  const $queryResults = $storeUpdated.map(({store, op}) => {
    return cursorBackend.updateNode(root, {path: store.path, op})
  })

  const updateStore = (
    store,
    {requesting = [], streams, identifiers = [], metadata = {}}
  ) => {
    Object.assign(store, {identifiers, metadata})

    invariant(
      !identifiers.some(couldBeStoreId),
      'Identifiers cannot conflict with store IDs (all uppercase & alphabetical) %s',
      JSON.stringify(identifiers.filter(couldBeStoreId))
    )

    const $storeDeleted = $queryResults.filter(() => !storeMap[store.id])

    let ADD_STREAMS_ASYNC

    store.mirror = createCursorAPI((cursorMethods, query) => {
      const cursor = {}
      requesting.concat('$actions').forEach(streamName => {
        Object.defineProperty(cursor, streamName, {
          get() {
            const queryIndex = store.queries.length
            store.queries.push(query)
            if (ADD_STREAMS_ASYNC) {
              onStoreUpdated({store, op: 'update'})
            }

            // TODO: startWith last value emitted
            return $queryResults
              .map(queryResults => {
                return queryResults[store.id] ? queryResults[store.id][queryIndex] : []
              })
              .thru(filterUnchangedKeyArrays)
              .map(stores => {
                return (streamName === '$actions' ? most.mergeArray : combine)(
                  stores
                    .map(id => {
                      if (id === store.id && query.length && streamName === '$state') {
                        return undefined
                      }
                      return storeMap[id] && storeMap[id].streams[streamName]
                    })
                    .filter(s => s)
                )
              })
              .switchLatest()
          }
        })
      })
      Object.defineProperty(cursor, '$stores', {
        get() {
          return $queryResults
            .map(() => ({
              cursor: cursorBackend.query(store.id, query),
              store
            }))
            .until($storeDeleted)
        }
      })
      Object.assign(cursor, cursorMethods)
      return cursor
    })

    store.dispatch = createCursorAPI((cursorMethods, query) => {
      const dispatch = (type, payload, retryIfSelectionEmpty = true) => {
        invariant(
          storeMap[store.id],
          "dispatching from a store that doesn't exist, hasn't been added yet, or was removed [%s]",
          store.id
        )
        const stores = cursorBackend.query(store.id, query)
        if (stores.length || !retryIfSelectionEmpty) {
          stores.forEach(id => {
            storeMap[id] && storeMap[id].streams.$actions.push({type, payload, store: id})
          })
          return
        }

        $queryResults
          .until(
            $storeDeleted.tap(() => {
              warning(
                false,
                "No stores matched dispatch query. While waiting for a match the store which dispatched the action unmounted, so we've had to discard the action. You could try dispatching to an action proxy? [%s]",
                JSON.stringify({type, payload})
              )
            })
          )
          .map(() => cursorBackend.query(store.id, query))
          .filter(stores => stores.length)
          .take(1)
          .observe(stores => {
            stores.forEach(id => {
              if (storeMap[id]) {
                storeMap[id].streams.$actions.push({type, payload, store: id})
              }
            })
          })
      }
      Object.assign(dispatch, cursorMethods)
      return dispatch
    })

    if (!store.streams.$actions) {
      const {push: dispatch, $stream: $actions} = createEventSource()
      store.streams.$actions = $actions.until($storeDeleted)
      store.streams.$actions.push = dispatch
    }

    if (streams) {
      const $actions = store.streams.$actions
      store.streams = streams(store.mirror, store.dispatch)
      store.streams.$actions = $actions
    }

    ADD_STREAMS_ASYNC = true
  }

  const backend = {
    addStore(parentId, {requesting, streams, identifiers, metadata}) {
      if (!parentId) parentId = root && root.id
      const parent = storeMap[parentId]
      invariant(parent || !root, 'Cannot add store: parent not found [%s]', parentId)

      const store = {
        id: generateStoreId(),
        path: root ? parent.path.concat(parentId) : [],
        streams: {},
        queries: [],
        children: {},
        parent
      }

      if (store.parent) store.parent.children[store.id] = store

      updateStore(store, {requesting, streams, identifiers, metadata})
      storeMap[store.id] = store
      onStoreUpdated({store, op: 'add'})
      store.dispatch('INITIALIZE')

      return store
    },
    removeStore(storeId) {
      const store = storeMap[storeId]
      invariant(store, "Trying to remove store that doesn't exist [%s]", storeId)
      invariant(store !== root, 'Cannot remove root store')

      const traverse = store => {
        store.children.forEach(traverse)
        // TODO: test dispatch in response to TEARDOWN
        store.dispatch('TEARDOWN')
        delete storeMap[store.id]
        onStoreUpdated({store, op: 'remove'})
      }
      traverse(store)

      if (store && store.parent) {
        delete store.parent.children[storeId]
      }
    },
    updateStore(storeId, {requesting, streams, identifiers, metadata}) {
      const store = storeMap[storeId]
      invariant(store, 'Trying to update store that does not exist [%s]', storeId)

      updateStore(store, {requesting, streams, identifiers, metadata})
      onStoreUpdated({store, op: 'update'})

      return store
    }
  }

  root = backend.addStore(null, {identifiers: ['MIRROR/root'], metadata: {root: true}})

  return backend
}

export default createMirrorBackend
