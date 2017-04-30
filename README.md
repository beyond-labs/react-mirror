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

If nothing matches the `dispatch` cursor Mirror will wait until something does - and then dispatch the action.

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
  DECREMENT(value) { return value - 1; },
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

By comparison, `$stores` emits a value every time a store is added or removed. Each value contains the cursor `selection` (array of store IDs) & `tree` (structural metadata with reference to local store).

```js
{
  selection: ['oigkzfajky']
  tree: {
    id: 'oigkzfajky',
    name: 'counter'
    component: Counter,
    selection: [], // aggregated from $props / $state / $actions
    children: [/* ... */],
    parent: /* ... */
  }
}
```

#### **Combining Streams**

Mirror exports four helpers (`combine`, `combineSimple`, `combineNested` & `combineActionsWith`) for combining streams together. I've used plain objects in these examples for clarity; only streams work in practice, each value in the resulting stream matches the following patterns.

##### `combine`

`combine` joins enums together, & removes duplicates. Use `combine` to join multiple state streams, or multiple prop streams.

```js
combine(
  Enum({a: stateA}, {b: stateB}),
  Enum({a: stateA}, {c: stateC}),
)

// Enum({a: stateA, b: stateB, c: stateC})
```

##### `combineNested`

`combineNested` inverts an object of enums, creating a single enum whose values match the given argument. Use `combineNested` to join state & prop streams together.

```js
combineNested({
  state: Enum({a: stateA, b: stateB})
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

The `options` argument defaults to `{before: true, after: true}`. Pass `{before: true, after: false}` if you need access to the last value before the other stream emits an `after` (you probably don't).

### Store Configuration

The `Mirror` configuration accepts `name`, `state()`, `mapToProps()` & `pure`.

##### `name`

For querying stores

Stores can have multiple names, eg `Mirror({name: ['form', 'form/create-project']})`

##### `state(mirror, dispatch)`

Accepts a cursor & returns a state stream

##### `mapToProps(state, props)`

Maps state to props. Useful when using, for example, Immutable.js

`mapToProps` can return a function. In this case, *that* function will be used as `mapToProps` for a particular component instance. This allows you to do per-instance memoization.

##### `pure`

Avoids re-renders, state propagation, and calls to `mapToProps` if `true`

With `pure` enabled Mirror checks state & props equality with every update (shallow comparison). If either changes `mapToProps` is called. And if the value returned by `mapToProps` fails its equality check, the component re-renders.

### Wrapping Up

#### **Lifecycle Actions**

* `INITIALIZE` - Dispatched when component mounts
* `TEARDOWN` - Dispatched when component unmounts

#### **Static Cursors**

If no stores match a dispatch query, Mirror will wait until a store that *does* match the query mounts and then dispatch the action (disable by passing `false` as third argument)

Mirror components have a static cursor & dispatch API:

```js
const MyWrappedComponent = Mirror()(MyComponent)

MyComponent.mirror.$state // Combined state of every "MyComponent"
MyComponent.dispatch('MY_ACTION') // Dispatched to first "MyComponent" to mount

// Dispatched to every mounted "MyComponent" after app initializes
MyComponent.mirror.root().$actions.filter(({type}) => type === 'INITIALIZATION_COMPLETE').take(1).observe(() => {
  MyComponent.dispatch('MY_ACTION', undefined, false)
})
```

#### `withName`

#### `getWrappedInstance`

Access the wrapped component with `getWrappedInstance`:

```js
<MyWrappedComponent
  ref={ref => ref.getWrappedInstance().constructor === MyComponent}
/>
```

#### **Circular State Dependency**

If you access a store's own `$state` stream via traversal (eg, `mirror.all().$state`) it will be replaced with an empty stream. Avoiding this circular dependency helps prevent infinite loops. If you really need a store's own `$state` stream you can use `mirror.$state` (no traversal)

## Caveats

Prop race conditions

Stores might not be mounted

## Thanks

React Mirror was inspired by [Cycle.js onionify](https://github.com/staltz/cycle-onionify), [Redux](https://github.com/reactjs/redux) & the [Controller View](http://blog.andrewray.me/the-reactjs-controller-view-pattern/) [pattern](https://facebook.github.io/flux/docs/todo-list.html#listening-to-changes-with-a-controller-view).
