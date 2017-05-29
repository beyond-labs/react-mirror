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
    return mirror.$actions.scan(
      ({value}, {type, payload = 1}) => {
        switch (type) {
          case 'INCREMENT': return {value: value + payload}
          case 'DECREMENT': return {value: value - payload}
          default: return {value}
        }
      },
      {value: 0}
    )
  }
})(({value, dispatch}) => (
  <div>
    Value: {value}
    <button onClick={() => dispatch('INCREMENT')}>+</button>
    <button onClick={() => dispatch('DECREMENT')}>-</button>
  </div>
))
```

## Rationale

Some state-management solutions like Redux put everything in a single global store. That's great for predictability, debugging, convenience and tooling. But tying components to a global store means they're *no longer self-contained*; unnecessarily distributing view, state & effects code across your app hampers reusability, while increasing cognitive overhead and architectural complexity.

Other solutions like Cycle.js suggest composing local state into a single state tree. The *lack of context* however is very inconvenient - actions are forced to percolate through your app layer-by-layer. Orchestrating views together (eg. search & results) often requires updating intermediate components and is a pain in the ass. Many of these solutions also have isolated ecosystems.

**Mirror composes local stores into a single tree (like Cycle.js), and gives every store access to the entire tree (like Redux).**

Stores can dispatch actions to, and query, (the action/state streams of) any other store (or collection of). Each store injects props from it's state stream into the component they decorate.

## Usage

### Cursors

Cursors point to a collection of stores, relative to another store. eg, "every `Todo` which is a child of this store (a `TodoList`)"

#### **Examples**

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

#### **Methods**

`filter` can be a store ID, name or component.

```js
root()                      // Get the root store
parents(filter, maxStores)  // Get one or more parent stores (all ancestors)
children(filter, maxStores) // Get one or more child stores (all descendants)

all(filter, maxStores) // Same as `root().children(filter, maxStores)`
one(filter)            // Same as `all(filter, 1)`
parent(filter)         // Same as `parents(filter, 1)`
child(filter)          // Same as `children(filter, 1)`
```

#### **Two types of cursor**

The `mirror` cursor. `mirror` is the first argument of `state`, it has four getters (`$props`, `$state`, `$actions` & `$stores`) for querying selected stores.

```js
mirror.$actions
mirror.children('todo-item').$state
```

The `dispatch` cursor. `dispatch` is the second argument of `state`, it is also injected as a prop to decorated components. Call it like a function to dispatch actions.

```js
dispatch('ACTION_TYPE', payload)
dispatch.parent('todo-list')('ACTION_TYPE', payload)
```

If nothing matches the `dispatch` cursor Mirror will wait until something does - and then dispatch the action. Disable this behaviour by passing `false` as the third argument.

### Working with streams

Streams are basically arrays of events. You can map, reduce, combine, and do [all sorts of cool things](www.rxmarbles.com) with them. `state` returns a stream - the first value represents the store's state when it's initialized, and the last value in the stream represents the store's current state. This section describes some patterns for creating, and using streams with Mirror.

Mirror uses [most.js](https://github.com/cujojs/most) (it's really fast). But you can use any streaming library that supports the `Observable` API like RxJS or XStream.

#### **Scanning actions**

Every action has a `type`, `payload` & `store` (id). Scanning actions means applying them to the current state one-by-one to produce new state.

```js
// For every action, emit a value 1 greater than the previous value
$actions.scan(value => value + 1, 0)
```

`handleActions` combines multiple action handlers into one function.

```js
import {handleActions} from 'react-mirror'

handleActions({
  INCREMENT(value) { return value + 1; },
  DECREMENT(value) { return value - 1; }
}, 0)
```

#### **Effects**

For every value in a stream, `tap` calls a function & ignores the result.

I like using `tap` & `dispatch` together to describe effects.

```js
$actions
  .tap(
    handleActions({
      INITIALIZE() {
        dispatch('LOAD_DATA')
      },
      LOAD_DATA() {
        loadData()
          .then(data => dispatch('LOAD_DATA_SUCCESS', data))
          .catch(error => dispatch('LOAD_DATA_FAILURE', error))
      }
    })
  )
  .scan(/* ... */)
```

#### **Multi-Store Streams**

Streams taken from `mirror` contain values from multiple stores. Mirror will `merge` actions & `combine` state / props.

##### `merge`

```txt
----a----b--------c------>
--1----------2----------->

--1-a----b---2----c------>
```

Use `most.merge` to include additional action streams.

```js
most.merge(
  mirror.children('field').$actions,
  mirror.$actions
)
```

##### `combine`

```txt
a--------b---c----------->
1---2---------------3---->

a1--a2---b2--c2-----c3--->
```

Every value in a state / prop stream is an `Enum`. That's an array with object-like properties for each value.

```js
stores = Enum({
  oigkzfajky: {title: 'Permutation City'}
})

stores[0] === stores['oigkzfajky']
```

##### `$stores`

By comparison, `$stores` emits a value every time a store is added, removed or updated. Each value in `$state` contains low-level structural metadata with reference to the local store. Use `$state` for advanced use cases like accessing component instances, getting children up to a certain depth or generating dependency graphs.

#### **Combining Streams**

Mirror exports four helpers (`combine`, `combineSimple`, `combineNested` & `combineActionsWith`) for combining streams together. I've used plain objects in these examples for clarity; only streams work in practice, each value in the resulting stream matches the following patterns.

##### `combine`

`combine` joins enums together, & removes duplicates. Use `combine` to join multiple state streams, or multiple prop streams.

```js
combine(
  Enum({a: stateA}, {b: stateB}),
  Enum({a: stateA}, {c: stateC})
)

// Enum({a: stateA, b: stateB, c: stateC})
```

##### `combineNested`

`combineNested` inverts an object of enums, creating a single enum whose values match the given argument. Use `combineNested` to join state & prop streams together.

```js
combineNested({
  state: Enum({a: stateA, b: stateB}),
  props: Enum({a: propsA})
})

// Enum({a: {state: stateA, props: propsA}, b: {state: stateB}})
```

##### `combineSimple`

`combineSimple` joins each value into an array. Use `combineSimple` to join different kinds of streams together, like a cursor selection & state stream.

```js
combineSimple(
  'a',
  Enum({a: stateA, b: stateB})
)

// ['a', Enum({a: stateA, b: stateB})]
```

##### `combineActionsWith`

`combineActionsWith` joins a stream of actions with the value before & after that action from another stream.

```js
combineActionsWith(
  {type: 'ACTION_TYPE', payload, store},
  Enum({a: stateA}),
  {before: true, after: true}
)

// {action, before: stateBeforeAction, after: stateAfterAction}
```

The `options` argument defaults to `{before: true, after: true}`. Pass `{before: true, after: false}` if you need access to the last action before the other stream emits an `after` (you probably don't).

### Store Configuration

The `Mirror` configuration accepts `name`, `state()`, `mapToProps()` & `pure`. Every property is optional.

##### `name`

Mirror uses `name` inside filters. `name` is a string, or array of strings.

You can add additional names to a store by passing `withName` as a prop, or calling the static `withName` method. `withName` is useful for distinguishing particular instances of a component.

```js
const Form = Mirror({
  name: 'form',
  /* ... */
})(/* ... */)

const CreateProjectForm = Form.withName('form/create-project')
```

##### `state(mirror, dispatch)`

Called when the store mounts, and returns the instance's state stream. Mirror derives props from the latest value in the state stream, and injects those props into the wrapped component. Other stores can read (a filtered version of) the state stream.

If provided, the wrapped component only renders once the state stream emits it's first value.

##### `mapToProps(state, props)`

Accepts the current state & parent props, and returns props to inject into the wrapped component. Called whenever state or props change; and useful when using, for example, Immutable.js.

Note that Mirror ignores parent props not handled by `mapToProps()`.

`mapToProps()` can return a function. In this case, *that* function will be used as `mapToProps()` for a particular component instance. This allows you to do per-instance memoization.

##### `pure`

If `true`, avoids unnecessary computation:

* Only emit props / state changes if either changed
* Only call `mapToProps` if props / state changed
* Only re-render if value returned by `mapToProps` changed

The equality check is based on `shallowEqual`. You can alternatively provide an object with three functions (`stateEqual`, `propsEqual`, `statePropsEqual`) which accept the previous and current props / state.

If disabled (by passing a falsey value), Mirror will re-render the wrapped component on every state / prop change.

### Wrapping Up

#### **Lifecycle Actions**

Mirror dispatches `INITIALIZE` to stores when they're created, and `TEARDOWN` immediately before they unmount.

#### **Static Cursors**

Each component exposes `mirror` & `dispatch` as static cursors.

```js
const MyComponent = Mirror({
  /* ... */
})(/* ... */)

MyComponent.mirror // Every "MyComponent"
MyComponent.dispatch('MY_ACTION') // First "MyComponent" to mount

// Every mounted "MyComponent" after "INITIALIZATION_COMPLETE"
MyComponent.mirror
  .root()
  .$actions.filter(({type}) => type === 'INITIALIZATION_COMPLETE')
  .take(1)
  .observe(() => {
    MyComponent.dispatch('MY_ACTION', undefined, false)
  })
```

#### **Instance Properties**

##### `getWrappedInstance`

Access the wrapped component instance with `this.getWrappedInstance()`.

##### Cursors

`mirror` & `dispatch` can be accessed via `this.mirror` / `this.dispatch`.

#### **Circular State Dependency**

The `mirror` cursor omits local state that's part of a query (eg, `mirror.all().$state`). Avoiding this circular dependency avoids infinite rendering loops. If you really want this access `$state` directly without any traversal.

```js
combine(
  mirror.$state,
  mirror.all().$state
)
```

This doesn't apply to static cursors.

## Caveats

Mirror makes it easy to build predictable applications. But things go wrong sometimes. This section will help you avoid things going wrong.

#### **Commutative Updates**

Mirror cannot guarantee the order stores are updated in, or the order of prop changes. Except for when handling actions `state` should be commutative (order of state / prop values must not affect final state), for example:

1. `state` is subscribed to multiple state / props streams
2. These streams emit some values in a random order
3. The state stream's last value should be the same after every run

If `state` is not commutative then dispatching an action with cascading effects can cause race conditions / unpredictable state. Tips to keep `state` commutative:

* Streams that depend on actions-only are always commutative
* Reduce state from multiple sources to a single value
* Prefer `mapToProps` over using `$props` inside `state`
* Props which never change are safe to use inside `state`

#### **Uninitialized Stores**

Because:

1. Mirror cannot guarantee the order stores are initialized in
2. Stores are dynamically added / removed at runtime

Actions might not be dispatched to every store they're intended for consistently. Mirror behaves consistently when `dispatch` can be guaranteed to match one store only, but problems may arise when dispatching actions to a dynamic collection of stores. Tips to alleviate these problems:

* Avoid dispatching actions to collections as part of an effect
* Dispatching actions as part of asynchronous user interaction is safe
* Use container stores if children have reactive dependencies

## Thanks

React Mirror was inspired by [Cycle.js onionify](https://github.com/staltz/cycle-onionify), [Redux](https://github.com/reactjs/redux) & the [Controller View](http://blog.andrewray.me/the-reactjs-controller-view-pattern/) [pattern](https://facebook.github.io/flux/docs/todo-list.html#listening-to-changes-with-a-controller-view).
