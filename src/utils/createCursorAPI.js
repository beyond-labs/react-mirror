export const createCursorAPI = (enhancer, query = {}) => {
  const cursorMethods = {
    root() {
      query = [{op: 'root'}]
      return createCursorAPI(cursorMethods, query)
    },
    parents(filter = null, maxStores = Infinity) {
      query = query.concat({op: 'parents', filter, maxStores})
      return createCursorAPI(cursorMethods, query)
    },
    children(filter = null, maxStores = Infinity) {
      query = query.concat({op: 'children', filter, maxStores})
      return createCursorAPI(cursorMethods, query)
    },
    all(filter = null, maxStores = Infinity) {
      query = [{op: 'root'}, {op: 'children', filter, maxStores}]
      return createCursorAPI(cursorMethods, query)
    },
    one(filter = null) {
      query = [{op: 'root'}, {op: 'children', filter, maxStores: 1}]
      return createCursorAPI(cursorMethods, query)
    },
    parent(filter = null) {
      query = query.concat({op: 'parents', filter, maxStores: 1})
      return createCursorAPI(cursorMethods, query)
    }
  }
  return enhancer(cursorMethods, query)
}
