React Mirror
============

A fractal state tree that decorates your views with local stores.

* **Co-location** - views are self-contained
* **Composable** - state tree is queryable
* **Single-paradigm** - everything is a component

Quick demo:

```js
import React from 'react'
import Mirror from 'react-mirror'

const Counter = Mirror({
  name: 'counter',
  state(mirror, dispatch) {
    return mirror.$actions.fold(({value}, {type, payload = 1}) => {
      switch (type) {
        case 'INCREMENT': return {value: value + payload}
        case 'DECREMENT': return {value: value - payload}
        default: return {value}
      }
    }, {value: 0})
  }
})(
  ({value, dispatch}) => (
    <div>
      Value: {value}
      <button onClick={() => dispatch('INCREMENT')}>+</button>
      <button onClick={() => dispatch('DECREMENT')}>-</button>
    </div>
  )
)
```

## Rationale

Some state-management solutions like Redux put everything in a single global store. That's great for predictability, debugging, convenience and tooling. But tying components to a global store means they're *no longer self-contained*; unnecessarily distributing view, state & effects code across your app hampers reusability, while increasing cognitive overhead and architectural complexity.

Other solutions like Cycle.js suggest composing local state into a single state tree. The *lack of context* however is very inconvenient - actions are forced to percolate through your app layer-by-layer. Orchestrating views together (eg. search & results) often requires updating intermediate components and is a pain in the ass. Many of these solutions also have isolated ecosystems.

**Mirror composes local stores into a single tree (like Cycle.js), and gives every store access to the entire tree (like Redux).**

Any store can dispatch actions to, and query, (the action/state streams of) any other store (or collection of). Each store injects props from it's state stream into the component they decorate.

## Usage

### Cursors

Cursors point to a collection of stores, relative to another store. eg, "every `Todo` which is a child of this store (a `TodoList`)"

**Examples**

```js
mirror                     // Local store
mirror.parent()            // Immediate parent
mirror.parent('todo-list') // Parent named "todo-list"
mirror.parent(TodoList)    // As above
mirror.all()               // Every store
mirror.all('todo-list')    // Every "todo-list"
mirror.all('todo-list').children('todo-item')          // Every "todo-item" inside a "todo-list"
mirror.one('todo-list/shopping').children('todo-item') // Every "todo-item" inside "todo-list/shopping"
```

**Methods**

`filter` can be a store ID, name or component.

```js
root()                      // Get the root store
parents(filter, maxStores)  // Get one or more parent stores (all ancestors)
children(filter, maxStores) // Get one or more child stores (all descendants)

all(filter, maxStores) // Same as `root().children(filter, maxStores)`
one(filter)            // Same as `all(filter, 1)`
parent(filter)         // Same as `parents(filter, 1)`
```

**Two types of cursor**

1. The `mirror` cursor (first argument of `state`). It has three getters (`$props`, `$state` & `$actions`) for querying selected stores. eg,
  * `mirror.$actions`
  * `mirror.children('todo-list').$state`
2. The `dispatch` cursor (second argument of `state` & injected as a prop). Call it like a function to dispatch actions to selected stores. eg,
  * `dispatch('ACTION_TYPE', payload)`
  * `dispatch.parent('todo-list')('ACTION_TYPE', payload)`

### Working with streams

You can think of streams as arrays of events - and programs as streams that map user interaction to UI. Mirror uses XStream, but is compatible with other stream libraries like RxJS & most.js

**Streams**

* `$actions` - Actions dispatched to selected stores. Each action has a `type`, `payload` and `store` (id)
* `$state` - Each value in the stream is an enum (array/object mashup) with the combined state of selected stores
* `$props` - As above, but with props. It's advisable to avoid using `$props` (see caveats for details)
* `$cursor` - Selected store IDs & tree describing your app's state structure. Emits a value every time a store is added or removed

**Examples**

```js
// the "reducer" pattern
mirror.$actions.fold((state, action) => {
  /* ...; */
  return nextState;
})

// network requests (Mirror exports handleActions, see Utilities for details)
mirror.$actions
  .tap(handleActions({
    INITIALIZE() { dispatch('LOAD_DATA') }
    LOAD_DATA() {
      loadData()
        .then(data => dispatch('LOAD_DATA_SUCCESS', data))
        .catch(error => dispatch('LOAD_DATA_FAILURE', error))
    }
  }))
  .fold(handleActions({
    LOAD_DATA(state) { return {...state, loading: true} }
    LOAD_DATA_SUCCESS(state, {payload: data}) { return {...state, loading: false, data} }
    LOAD_DATA_FAILURE(state, {payload: error}) { return {...state, loading: false, error} }
  }, {loading: false, data: null, error: null}))

// querying children
mirror.children('option').$state
  .map(state => {
    const selectedOption = state.find(({selected}) => selected)
    return {value: selectedOption.value}
  })

// promise "middleware"
mirror.all().$actions
  .tap(({type, payload, store}) => {
    if (!(payload instanceof Promise)) return
    payload.then((payload) => {
      dispatch.all(store)(`${type}_SUCCESS`, payload)
    }).catch((error) => {
      dispatch.all(store)(`${type}_FAILURE`, error)
    })
  })
```

### Stores

The `Mirror` configuration accepts:

* `name` (_string_) - For querying stores
* `state(mirror, dispatch)` (_function_) - Accepts a cursor & returns a state stream
* `mapToProps(state, props)` (_function_) - Maps state to props. Useful when using, for example, Immutable.js
* `pure` (_boolean_) - Avoids re-renders, state propagation, and calls to `mapToProps` if `true`

There are two lifecycle actions (no payload):

* `INITIALIZE` - Dispatched when component mounts
* `TEARDOWN` - Dispatched when component unmounts

`Mirror` injects the state into your wrapped component, and these additional props:

* `dispatch(type, payload)` - pushes values onto `$action` streams
* `store` - a unique, (non-deterministic) ID for the store

**Dispatching Actions**

`dispatch` shares the cursor traversal API, allowing you to dispatch actions to any store in your app.

```js
// dispatch an action to the local store
dispatch('MY_ACTION', someValue)

// mark every "todo-item" in a "todo-list" as done
dispatch.parent('todo-list').children('todo-item')('MARK_AS_DONE')
```

### API details

`mapToProps` can return a function. In this case, *that* function will be used as `mapToProps` for a particular component instance. This allows you to do per-instance memoization.

Access the wrapped component with `getWrappedInstance`:

```js
<MyWrappedComponent
  ref={ref => ref.getWrappedInstance().constructor === MyComponent}
/>
```

Query filters can accept components, instead of an ID / name, eg `mirror.children(MyComponent)`

Stores can have multiple names, eg `Mirror({name: ['form', 'form/create-project']})`

With `pure` enabled Mirror checks state & props equality with every update (shallow comparison). If either changes `mapToProps` is called. And if the value returned by `mapToProps` fails its equality check, the component re-renders.

If you access a store's own `$state` stream via traversal (eg, `mirror.all().$state`) it will be replaced with an empty stream. Avoiding this circular dependency helps prevent infinite loops. If you really need a store's own `$state` stream you can use `mirror.$state` (no traversal)

If no stores match a dispatch query, Mirror will wait until a store that *does* match the query mounts and then dispatch the action (disable by passing `false` as third argument)

Mirror components have a static cursor & dispatch API:

```js
const MyWrappedComponent = Mirror()(MyComponent)

MyComponent.$state // Combined state of every "MyComponent"
MyComponent.dispatch('MY_ACTION') // Dispatched to first "MyComponent" to mount

// Dispatched to every mounted "MyComponent" after app initializes
MyComponent.root().$actions.filter(({type}) => type === 'INITIALIZATION_COMPLETE').take(1).tap(() => {
  MyComponent.dispatch('MY_ACTION', undefined, false)
})
```

## Caveats

Prop race conditions

Stores might not be mounted

## Thanks

React Mirror was inspired by [Cycle.js onionify](https://github.com/staltz/cycle-onionify), [Redux](https://github.com/reactjs/redux) & the [Controller View](http://blog.andrewray.me/the-reactjs-controller-view-pattern/) [pattern](https://facebook.github.io/flux/docs/todo-list.html#listening-to-changes-with-a-controller-view).
