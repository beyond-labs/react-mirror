import React from 'react'
import ReactDOM from 'react-dom'
import Mirror from '../../../index'

const Counter = Mirror({
  name: 'counter',
  state(mirror, dispatch) {
    return mirror.$actions.scan(
      ({value}, {type, payload = 1}) => {
        switch (type) {
          case 'INCREMENT':
            return {value: value + payload}
          case 'DECREMENT':
            return {value: value - payload}
          default:
            return {value}
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

ReactDOM.render(<Counter />, document.getElementById('root'))
