const createCursorAPI = (enhancer, query = []) => {
  const cursorMethods = {
    root() {
      const newQuery = [{op: 'root'}]
      return createCursorAPI(enhancer, newQuery)
    },
    parents(filter = null, maxStores = Infinity) {
      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter)
      const newQuery = query.concat({op: 'parents', filter, maxStores})
      return createCursorAPI(enhancer, newQuery)
    },
    children(filter = null, maxStores = Infinity) {
      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter)
      const newQuery = query.concat({op: 'children', filter, maxStores})
      return createCursorAPI(enhancer, newQuery)
    },
    all(filter = null, maxStores = Infinity) {
      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter)
      const newQuery = [{op: 'root'}, {op: 'children', filter, maxStores}]
      return createCursorAPI(enhancer, newQuery)
    },
    one(filter = null) {
      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter)
      const newQuery = [{op: 'root'}, {op: 'children', filter, maxStores: 1}]
      return createCursorAPI(enhancer, newQuery)
    },
    parent(filter = null) {
      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter)
      const newQuery = query.concat({op: 'parents', filter, maxStores: 1})
      return createCursorAPI(enhancer, newQuery)
    },
    child(filter = null) {
      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter)
      const newQuery = query.concat({op: 'children', filter, maxStores: 1})
      return createCursorAPI(enhancer, newQuery)
    }
  }
  return enhancer(cursorMethods, query)
}

export default createCursorAPI
