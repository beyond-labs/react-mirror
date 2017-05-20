import React from 'react'
import Mirror, {handleActions} from '../../index'

const Counter = Mirror({
  name: 'counter',
  state(mirror, dispatch) {
    return mirror.$actions
      .tap(
        handleActions({
          INCREMENT: this.props.onIncrement,
          DECREMENT: this.props.onDecrement
        })
      )
      .scan(
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

export default Counter
