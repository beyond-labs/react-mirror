import * as most from 'most'
import createCursorBackend from '../cursor'
import createCursorAPI from '../utils/createCursorAPI'
import generateStoreId, {couldBeStoreId} from '../utils/generateStoreId'
import combine from '../utils/streams/combine'
import {filterUnchangedKeyArrays} from '../utils/streams/filterUnchanged'

const createMirrorBackend = () => {
  let root
  const storeMap = {}
  const cursorBackend = createCursorBackend()

  let onStoreUpdated
  function* storeUpdatedGenerator() {
    const f = resolve => (onStoreUpdated = resolve)
    while (true) {
      yield new Promise(f)
    }
  }

  const $queryResults = most.from(storeUpdatedGenerator).map(({store, op}) => {
    if (op === 'add') storeMap[store.id] = store
    if (op === 'remove') delete storeMap[store.id]
    return cursorBackend.updateNode(root, {path: store.path, op})
  })

  const updateStore = (store, {requesting, streams, identifiers = [], metadata = {}}) => {
    Object.assign(store, {identifiers, metadata})

    if (identifiers.some(couldBeStoreId)) {
      // warning()
    }

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

            return $queryResults
              .map(queryResults => queryResults[store.id][queryIndex])
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
        if (!store.id) return // warning()
        const stores = cursorBackend.query(store.id, query)
        if (stores.length || !retryIfSelectionEmpty) {
          stores.forEach(id => {
            storeMap[id].dispatch(type, payload)
          })
          return
        }

        $queryResults
          .until(
            $storeDeleted.tap(() => {
              // warning()
            })
          )
          .map(() => cursorBackend.query(store.id, query))
          .filter(stores => stores.length)
          .take(1)
          .observe(stores => {
            stores.forEach(id => {
              storeMap[id].dispatch(type, payload)
            })
          })
      }
      Object.assign(dispatch, cursorMethods)
      return dispatch
    })

    if (!store.streams.$actions) {
      function* actionGenerator() {
        while (true) {
          yield new Promise(resolve => (store.dispatch = resolve))
        }
      }
      store.streams.$actions = most.from(actionGenerator).until($storeDeleted)
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
      if (!parent && root) return // warning()

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
      onStoreUpdated({store, op: 'add'})
      store.dispatch('INITIALIZE')

      return store
    },
    removeStore(storeId) {
      const store = storeMap[storeId]
      if (!store) return // warning()
      if (store === root) return // warning()

      const traverse = store => {
        store.children.forEach(traverse)
        // TODO: test dispatch in response to TEARDOWN
        store.dispatch('TEARDOWN')
        onStoreUpdated({store, op: 'remove'})
      }
      traverse(store)

      if (store && store.parent) {
        delete store.parent.children[storeId]
      }
    },
    updateStore(storeId, {requesting, streams, identifiers, metadata}) {
      const store = storeMap[storeId]
      if (!store) return // warning()

      updateStore(store, {requesting, streams, identifiers, metadata})
      onStoreUpdated({store, op: 'update'})

      return store
    }
  }

  root = backend.addStore(null, {metadata: {root: true}})

  return backend
}

export default createMirrorBackend
