import React from 'react'
import ReactDOM from 'react-dom'
import Mirror, {handleActions} from '../../../index'

const Counter = Mirror({
  name: 'counter',
  state(mirror, dispatch) {
    return mirror.$actions.scan(
      handleActions(
        {
          INCREMENT: (value, {payload = 1}) => value + payload,
          DECREMENT: (value, {payload = 1}) => value - payload
        },
        0
      )
    )
  },
  mapToProps(value) {
    return {value}
  }
})(({value, dispatch}) => (
  <div>
    Value: {value}
    <button onClick={() => dispatch('INCREMENT')}>+</button>
    <button onClick={() => dispatch('DECREMENT')}>-</button>
  </div>
))

ReactDOM.render(<Counter />, document.getElementById('root'))
