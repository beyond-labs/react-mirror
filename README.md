React Mirror
============

> React Mirror is WIP, you can't use it yet

A fractal state tree that wraps your views.

* **Atomicity** - all state lives in one place only
* **Co-location** - views don't rely on external modules

Quick demo:

```js
import React from 'react'
import Mirror from 'react-mirror'

const Counter = Mirror({
  reducer: ({value}, {type, payload = 1}) => {
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

#### `Mirror({reducer, enhancer, middleware, contextSubscribe, contextPublish})`

`reducer` (*Function*):

Returns the next state, given the current state, an action & contextual state.

`enhancer` (*Function*):

**Top-level only**. You can use most Redux store enhancers to add third-party capabilities to React Mirror, we have examples for apollo, redux-form, redux-dev-tools, redux-logger & react-router-redux.

`middleware` (*Function | Function[]*):



`contextSubscribe` (*String | String[]*)

`contextPublish` (*String*)

### Props

### Actions

## How to extend React Mirror

React Mirror uses [redux](https://github.com/reactjs/redux) under the hood, you may optionally provide an `enhancer` to the root `Mirror` component.

Example:

```js
import {applyMiddleware} from 'redux'
import Mirror from 'react-mirror'

const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}

let App = Mirror({
  enhancer: applyMiddleware(logger)
})(
  () => { /* ... */ }
)

```

## API reference

`Mirror({reducer, enhancer, contextSubscribe, contextPublish})`

**Arguments**

1. `reducer` (*Function*): Returns the next state, given the current state, an action & contextual state.

2. `enhancer` (*Function*): Enhances the store with third-party capabilities such as middleware.

3. `contextSubscribe` (*Array[String]*): List of ancestors component reads state from.

4. `contextPublish` (*String*): Allows descendents to read state & dispatch actions to component.

**Props**

1. `subscribe` (*Function*): Optionally supplied by parent component & callable by child (best done inside `constructor` life-cycle method), accepts a listener which in turn accepts `action`, `state` & `prevState`.

2. `dispatch` (*Function*)

**Actions**

1. `INITIALIZE`

2. `UPDATE_PROPS`

3. `UNMOUNT_COMPONENT`

## vs Redux

## vs this.setState

## vs Cycle.js onionify
