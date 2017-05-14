`createCursorBackend`
=====================

`createCursorBackend` is a performance-critical modules for Mirror. This document describes `createCursorBackend` in detail & is intended to aid the implementer.

All stores share a cursor backend. The cursor backend identifies which stores match a set of queries, whenever a store is added/removed/updated, or an action is dispatched. While implementing `createCursorBackend` naively is fairly trivial creating a performant solution isn't. Computation can likely be avoided with dynamic programming techniques and memoization between subsequent calls. Performant cache invalidation could be challenging here. Some queries will only occur once, and others will occur many times, so it may be beneficial to process some queries differently to others.

**API**

```js
:: Query
[...{
  op: 'root' | 'children' | 'parents',
  filter: null | String<id> | Any<identifier>,
  maxStores: Number
}]

:: Node
{
  id: String,
  identifiers: [...Any],
  queries: [...Query],
  children: [...Node],
  parent: Node | null
}

:: createCursorBackend()
Void => {
  query: (String<origin>, Query) => [...String<id>]
  updateNode:
    (Node<root>, {op: 'add' | 'remove' | 'update', path: [...String<id>]}) =>
    {...[String<id>]: [...[...String<id>]<query_result>]}
}
```

**Problem Size**

* Number of nodes (max): **100s**
* Number of queries (max): **1000s**
* Number of calls to `query` per second (during spikes): **10s**
* Number of calls to `updateNode` per second (during spikes): **10s**

**Example**

```js
const cursorBackend = createCursorBackend()

cursorBackend.updateNode(/* ... */) // add root store
cursorBackend.updateNode(/* ... */) // add form
cursorBackend.updateNode(/* ... */) // add first field
// add second field
const queries = cursorBackend.updateNode(
  {
    id: 'oigkzfajky',
    identifiers: ['root', Root],
    queries: [
      [{op: 'children', filter: 'form', maxStores: 1}, {op: 'children', filter: 'field', maxStores: Infinity}]
    ],
    children: [
      {
        id: 'hsmfbtmqka'
        identifiers: ['form', 'form/create-project', Form],
        children: [
          {
            id: 'renxqnmjjk',
            identifiers: ['field', 'field/title', Input],
            queries: [
              [{op: 'root'}, {op: 'children', filter: Form, maxStores: 1}]
            ]
            children: []
          },
          {
            id: 'ljejmzqowf',
            identifiers: ['field', 'field/description', Input],
            children: []
          }
        ]
      }
    ]
  },
  {
    op: 'add',
    path: ['oigkzfajky', 'hsmfbtmqka', 'ljejmzqowf']
  }
)

// {
//   oigkzfajky: [['renxqnmjjk', 'ljejmzqowf']],
//   hsmfbtmqka: [],
//   renxqnmjjk: [['hsmfbtmqka']],
//   ljejmzqowf: []
// }
console.log(queries)

const query = cursorBackend.query('ljejmzqowf', [{op: 'parents', maxStores: 1}, {op: 'children', filter: 'field/title'}])

// ['renxqnmjjk']
console.log(query)
```

**Tips**

* `children` is an enum. You can iterate over it like an array or access nodes by ID.
* `Map` can accept functions as keys. This enables `O(n)` component lookups without converting to a string.
* You can ignore all ops before the first `root` op.
* You can ignore all ops before an op which uses an id for `filter`.
* If the `filter` is an id it's guaranteed to match a maximum of one store.
* In most cases `parents.maxStores === 1`, and `children.maxStores === Infinity`.
* In many cases `children` will match one store only.
* You cannot make any changes to `tree` inside `createCursorBackend`.
* If `query` returns an empty array it is likely to be recalled with the same arguments after a node is added.
* Query result cannot contain duplicates.
* `children` should match shallow stores first, and `parents` should match deep stores first.
* The returned object can safely be reused between subsequent calls.
* Some node structures are likely to recur many times over a single session.
* Queries can only be added, never removed or updated (without removing the store)
