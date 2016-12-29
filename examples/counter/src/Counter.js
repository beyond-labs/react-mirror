import React from 'react'
import Mirror from '../../../index'

export const Counter = Mirror({
  reducer: ({value = 0}, {type, payload = 1}) => {
    switch (type) {
    case 'INCREMENT': return {value: value + payload}
    case 'DECREMENT': return {value: value - payload}
    default: return {value}
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

export default Counter
