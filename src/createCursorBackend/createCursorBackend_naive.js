const traverse = (tree, onVisit) => {
  const q = [tree]

  while (q.length) {
    const node = q.shift()
    q.push(...node.children)
    onVisit(node)
  }
}

const getChildren = node => {
  const children = []
  traverse(node, node => children.push(node))
  return children
}

const getParents = node => {
  const parents = []
  while (node.parent) {
    node = node.parent
    parents.push(node)
  }
  return parents
}

const testFilter = (node, filter) => {
  if (
    !filter ||
    filter === node.id ||
    filter === node.component ||
    node.name.includes(filter)
  ) {
    return true
  }
  return false
}

const runQuery = (tree, originIds, query) => {
  if (!query.length) return originIds

  let operator
  ;[operator, ...query] = query

  if (operator.op === 'root') return runQuery(tree, [tree.id], query)

  const originNodes = []
  traverse(tree, node => {
    if (originIds.includes(node.id)) {
      originNodes.push(node)
    }
  })

  const result = (() => {
    let result = originNodes.map(node => {
      const getMatches = operator.op === 'children' ? getChildren : getParents
      let matches = getMatches(node)
      matches = matches.filter(node => testFilter(node, operator.filter))
      matches = matches.slice(0, operator.maxStores)
      matches = matches.map(node => node.id)
      return matches
    })
    result = [].concat(...result)
    result = Array.from(new Set(result))
    return result
  })()

  return runQuery(tree, result, query.slice(1))
}

export const createCursorBackend = () => {
  let prevTree

  return {
    query(origin, query) {
      runQuery(prevTree, [origin], query)
    },
    addOrRemoveNode(tree, op) {
      prevTree = tree
      const results = {}
      traverse(tree, node => {
        results[node.id] = node.queries.map(query => {
          return runQuery(tree, [node.id], query)
        })
      })
      return results
    }
  }
}

export default createCursorBackend
