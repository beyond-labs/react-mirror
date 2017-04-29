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

Stores can dispatch actions to, and query, (the action/state streams of) any other store (or collection of). Each store injects props from it's state stream into the component they decorate.

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

The `mirror` cursor. `mirror` is the first argument of `state`, it has four getters (`$props`, `$state`, `$actions` & `$stores`) for querying selected stores.

```js
mirror.$actions
mirror.children('todo-item').$state
```

The `dispatch` cursor. `dispatch` is the second argument of `state`, it is also injected as a prop to decorated components. Call it like a function to dispatch an action.

```js
dispatch('ACTION_TYPE', payload)
dispatch.parent('todo-list')('ACTION_TYPE', payload)
```

### Working with streams

Streams are basically arrays of events. You can map, reduce, combine, and do [all sorts of cool things](www.rxmarbles.com) with them. `state` returns a stream - the first value represents the store's state when it's initialized, and the last value in the stream represents the store's current state. This section describes some patterns for creating, and using streams with Mirror.

Mirror uses [most.js](https://github.com/cujojs/most) (it's really fast). But you can use any streaming library that supports the `Observable` API like RxJS or XStream.

**Scanning actions**

Every action has a `type`, `payload` & `store` (id). Scanning actions means applying them to the current state one-by-one to produce new state.

```js
// For every action, emit a value 1 greater than the previous value
$actions.scan(value => value + 1, 0)
```

`handleActions` combines multiple action handlers into one function.

```js
import {handleActions} from 'react-mirror'

handleActions({
  INCREMENT(value) { return value + 1; }
  DECREMENT(value) { return value - 1; }
})
```

**Effects**

I like using `tap` (never modifies values) & `dispatch` together to describe effects.

```js
$actions
  .tap(
    handleActions({
      INITIALIZE() {
        dispatch('LOAD_DATA');
      },
      LOAD_DATA() {
        loadData()
          .then(data => dispatch('LOAD_DATA_SUCCESS', data))
          .catch(error => dispatch('LOAD_DATA_FAILURE', error));
      },
    })
  )
  .scan(/* ... */);
```

**Multi-Store Streams**

Streams taken from `mirror` combine values from multiple stores. So it's important

```
----a----b--------c------>
--1----------2----------->

--1-a----b---2----c------>
```

Combining props

```
a--------b---c----------->
1---2---------------3---->

a1--a2---b2--c2-----c3--->
```

**Combining streams**


Print out the state before & after every

`[1, 2, 3].reduce((pv, v) => pv + v, 0) === 6`

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
