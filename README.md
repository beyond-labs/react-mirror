React Mirror
============

> This guide assumes deep familarity with [Redux](https://github.com/reactjs/redux)

A fractal state tree that wraps your views.

* **Atomicity** - all state lives in one place only
* **Co-location** - views don't rely on external modules

Quick demo:

```js
import React from 'react'
import Mirror from 'react-mirror'

const Counter = Mirror({
  reducer: ({value = 0}, {type, payload = 1}) => {
    switch (type) {
      case 'INCREMENT': return {value: value + payload}
      case 'DECREMENT': return {value: value - payload}
    }
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

## What is React Mirror

React Mirror wraps components with redux-like stores. Stores are automatically composed into a single state tree that mirrors your view tree. You can pass state up (via `subscribe`) & down (via props). You can also pass state down multiple levels at once with React Mirror's powerful context feature. Parents cannot freely change the props of a component decorated by React Mirror, instead appropiate actions are dispatched to the child's reducer.

> You've probably heard context is fundamentally broken in React, that's true. React Mirror's implementation avoids React's pitfalls & works reliably.

## Why use React Mirror

Some popular state-management solutions put everything in a single global store. This improves debugging, introspection, convenience & enables some features like time-travel. Downsides include tight coupling between seperate modules & complex architecture that's tedious to write code for (eg, action creators, thunks).

By realizing local stores can be composed just like views & allowing context you can mitigate those disadvantages whilst keeping the perks of single-store solutions. Local state is ideal for reusing components & fast feature iteration, whilst context is an essential convenience for behaviour that depends on several views.

## Usage

#### `Mirror(config, options)`

Creates a decorator you can pass a component to. The decorated component's props are controlled by the store which can be updated indirectly via actions.

##### `config`

`reducer(currentState, {type, payload, ...}, context)` (*Function*):

Returns the next state, given the current state, an action & contextual state. `context`'s object properties include the state of ancestors picked via `contextSubscribe`.

`enhancer()` (*Function*):

**Top-level only**. You can use most Redux store enhancers to add third-party capabilities to React Mirror.

`contextSubscribe` (*String | String[]*):

Allows child components to access ancestor state (via props & reducer). Child components can also dispatch actions to thier ancestors.

`contextPublish` (*String*):

Allows all descendants to access a component's state & dispatch actions to the component.

```js
const Ancestor = Mirror({
  reducer: (currentState, {type}) => {
    switch (type) {
      case 'ACTION_DISPATCHED_BY_DESCENDANT': return /* ... */
      /* ... */
    }
  },
  contextPublish: 'ancestor'
})(
  () => { /* ... */ }
)

const Descendant = Mirror({
  reducer: (currentState, action, {ancestor}) => { /* ... */ },
  contextSubscribe: 'ancestor'
})(
  ({dispatch, context: {ancestor}, ...state}) => (
    <div>
      { /* ... */ }
      <button
        onClick={() => dispatch('ACTION_DISPATCHED_BY_DESCENDANT', 'ancestor', null)}
      >Click me!</button>
    </div>
  )
)
```

##### `options`

`pure` (*Boolean|Function*):

If `true`, `Mirror` will avoid re-renders if, after dispatching an action, the following equality check returns `true`:

```js
const pure = (state, prevState) => {
  if (!shallowEqual(state, prevState)) return true
  if (state.context) {
    for (key in state.context) {
      if (!shallowEqual(state.context[key], prevState.context[key])) return true
    }
  }
}
```

You can use your own equality check by providing a function. Default value: `true`.

#### Props

You can pass `subscribe` to decorated components, this might be useful for reacting to input changes within a form. The decorator passes the reducer state & some props to the wrapped component: `subscribe`, `dispatch` & `context`.

`subscribe(action, state, prevState)` (*Function*):

Called immediately after reducer handles action & before component renders. Useful for running side-effects in response to actions. Subscriptions are automatically cancelled when the component unmounts, but you can unsubscribe earlier by calling the function returned by `subscribe`. I suggest creating subscriptions inside `componentWillMount`.

```js
const Input = Mirror({ /* ... */ })(() => { /* ... */ })

const Form = () => (
  <form>
    <Input subscribe((action, {value}) => console.log(`New input value: ${value}`)) />
  </form>
)
```

```js
const MyComponent = Mirror({ /* ... */ })(
  React.createClass({
    componentWillMount() {
      this.unsubscribe = this.props.subscribe((action, state, prevState) => { /* ... */ })
    },
    render() { /* ... */ },
  })
)
```

`dispatch(type, [context], [payload], [metadata]) | ({type, payload, ...metadata}, [context])` (*Function*):

Calls the reducer with an action. If `context` is undefined the action is dispatched to the local store.

`context` (*Object*):

`context`'s object properties include the state of ancestors picked via `contextSubscribe`.

#### Actions

`INITIALIZE(props)`:

Called before component mounts with initial props. All props are intercepted by the store, you'll need to return them from the reducer to access parent props.

`UPDATE_PROPS(nextProps)`:

Called when parent updates child props. Parents cannot freely update wrapped child props, you'll need to return the updated state from the reducer for prop changes to have any effect.

`UPDATE_CONTEXT(updatedContextName)`:

Called immediately after parent reducer handles action & before rendering.

`UNMOUNT_COMPONENT()`:

Called before child unmounts.

## Caveats

React Mirror isn't complete yet. & some of this functionality may be essential for your use case. For example:

* Store IDs are non-deterministic. This makes state rehydration much harder, & snapshot testing slightly harder.
* No API exists for accessing the wrapped component.
* Root store isn't destroyed when top-level component unmounts.
* Ancestors cannot dispatch actions to children. Not architectually sound, but escape hatch should be available.
* Cannot add middleware to child stores.
* Cannot access instance inside `pure` / `reducer`.
* No interface exists for selectors

Additionally:

* Parents cannot directly update child props.
* Root state changes as stores are added / removed & may be tricky to debug.

If you have a potential solution to any of these open an issue & we can discuss it.

## Thanks

React Mirror was inspired by [Cycle.js onionify](https://github.com/staltz/cycle-onionify), [Redux](https://github.com/reactjs/redux) & the [Controller View](http://blog.andrewray.me/the-reactjs-controller-view-pattern/) [pattern](https://facebook.github.io/flux/docs/todo-list.html#listening-to-changes-with-a-controller-view).

> [Share React Mirror on Twitter](https://twitter.com/?status=Cool%20state%20management%20library%3A%20https%3A//github.com/ashtonwar/react-mirror) if you like it
