const createCursorAPI = (enhancer, query = []) => {
  const cursorMethods = {
    root() {
      query = [{op: 'root'}]
      return createCursorAPI(enhancer, query)
    },
    parents(filter = null, maxStores = Infinity) {
      query = query.concat({op: 'parents', filter, maxStores})
      return createCursorAPI(enhancer, query)
    },
    children(filter = null, maxStores = Infinity) {
      query = query.concat({op: 'children', filter, maxStores})
      return createCursorAPI(enhancer, query)
    },
    all(filter = null, maxStores = Infinity) {
      query = [{op: 'root'}, {op: 'children', filter, maxStores}]
      return createCursorAPI(enhancer, query)
    },
    one(filter = null) {
      query = [{op: 'root'}, {op: 'children', filter, maxStores: 1}]
      return createCursorAPI(enhancer, query)
    },
    parent(filter = null) {
      query = query.concat({op: 'parents', filter, maxStores: 1})
      return createCursorAPI(enhancer, query)
    },
    child(filter = null) {
      query = query.concat({op: 'children', filter, maxStores: 1})
      return createCursorAPI(enhancer, query)
    }
  }
  return enhancer(cursorMethods, query)
}

export default createCursorAPI
