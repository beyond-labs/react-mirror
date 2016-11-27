React Mirror
============

A fractal state tree mirroring your views.

* **Atomic** - easy to debug, introspect & manipulate (eg, timetravel)
* **Composable** - reuse logic & model representations
* **Co-location** - view behaviour doesn't rely on external modules

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

## What is React Mirror?



## How to extend React Mirror

React Mirror uses [redux](https://githuib.com/reactjs/redux) under the hood, you may optionally provide an `enhancer` to the root `Mirror` component.

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
