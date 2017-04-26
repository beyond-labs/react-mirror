### Counter

Click the buttons to increment or decrement the `Counter` value

```js
import React from 'react'
import Mirror from 'react-mirror'

const Counter = Mirror({
  state(mirror) {
    return mirror.$actions.fold((state, {type, payload = 1}) => {
      switch (type) {
        case 'INCREMENT': return {value: value + payload}
        case 'DECREMENT': return {value: value - payload}
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

### Logger "middleware"

Drop `Logger` anywhere in your app (under the root store) and it'll log every action

```js
import React from 'react'
import Mirror from 'react-mirror'
import xs from 'xstream'

const Logger = Mirror({
  state(mirror) {
    const {$state, $actions} = mirror.root().children()

    xs.sampleCombine($actions, $state.startWith(undefined).pairwise())
      .tap(([action, [prevState, nextState]]) => {
        prevState = prevState[action.store]
        nextState = nextState[action.store]
        console.log('prevState = ', prevState)
        console.log('action = ', action)
        console.log('nextState = ', nextState)
      })

    return xs.never()
  }
})()
```

### Remote-controlled section

Click `MyButton` to show `MySection`

```js
import React from 'react'
import Mirror, {handleActions} from 'react-mirror'

const MySection = Mirror({
  name: 'my-section',
  state(mirror) {
    return mirror.$actions.fold(handleActions({
      SHOW(state) { return {isOpen: true} }
      HIDE(state) { return {isOpen: false} }
    }, {isOpen: false}))
  }
})(
  ({isOpen, children}) => {
    return isOpen ? children : null
  }
)

const MyButton = Mirror()(({dispatch}) => <button onClick={() => dispatch.root().child('my-section')('SHOW')}></button>)
```

### Radio group

`RadioGroup` aggregates state from children to compute own state

```js
import React from 'react'
import Mirror, {handleActions} from 'react-mirror'
import xs from 'xstream'

const RadioOption = Mirror({
  name: 'radio-option',
  state(mirror) {
    return mirror.$actions.fold(handleActions({
      SELECT(state) { return {selected: true} }
      DESELECT(state) { return {selected: false} }
    }, {selected: false}))
  }
})(
  ({selected, store}) => (
    <button
      className={cl('RadioOption', {selected})}
      onClick={() => {
        dispatch('SELECT')
        dispatch.parent('radio-group').children('radio-option').omit(store)('DESELECT')
      }}
    >
      {label}
    </button>
  )
)

const RadioGroup = Mirror({
  name: 'radio-group',
  state(mirror) {
    const {$state, $props} = mirror.children('radio-option')

    return xs.sampleCombine($state, $props).map(([state, props]) => {
      const selectedOptionIndex = state.findIndex(({selected}) => selected)
      const value = selectedOptionIndex === -1 ? null : props[selectedOptionIndex].value
      return {value}
    }).tap(state => this.props.onChange(state))
  },
})(({value, children}) => (
  <div>
    Selected value: {value}
    {children}
  </div>
))
```

### Network request

`MyComponent` requests some data to display when the component mounts

```js
import React from 'react'
import Mirror, {handleActions} from 'react-mirror'
import loadData from './loadData'

const MyComponent = Mirror({
  state(mirror, dispatch) {
    return mirror.$actions
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
        LOAD_DATA_SUCCESS(state, {payload: data}) { return {...state, data, loading: false} }
        LOAD_DATA_FAILURE(state, {payload: error}) { return {...state, error, loading: false} }
      }, {loading: false, data: null}))
  }
})(
  ({loading, data}) => {
    <div>
      {loading ? 'Loading' : null}
      {data ? data : null}
    </div>
  }
)
```
