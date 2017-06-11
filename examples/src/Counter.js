import React from 'react'
import Mirror, {handleActions, combineSimple} from '../../index'

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
})(function Counter({value, dispatch}) {
  return (
    <div>
      Value: {value}<br />
      <button onClick={() => dispatch('INCREMENT')}>+</button>
      <button onClick={() => dispatch('DECREMENT')}>-</button>
    </div>
  )
})

const MultiCounter = Mirror({
  state(mirror) {
    const $numCounters = mirror.$actions.scan(
      handleActions(
        {
          ADD_COUNTER: (value, {payload = 1}) => value + payload,
          REMOVE_COUNTER: (value, {payload = 1}) => Math.max(0, value - payload)
        },
        5
      )
    )

    const $total = mirror
      .children('counter')
      .$state.map(state => state.reduce((pv, v) => pv + v, 0))

    return combineSimple($total, $numCounters).map(([total, numCounters]) => ({
      total,
      numCounters
    }))
  }
})(function MultiCounter({numCounters, total, dispatch}) {
  return (
    <div>
      Total: {total}<br />
      <button onClick={() => dispatch('ADD_COUNTER')}>+1 counters</button>
      <button onClick={() => dispatch('REMOVE_COUNTER')}>-1 counters</button>
      {Array(numCounters).fill().map((v, i) => <Counter key={i} />)}
    </div>
  )
})

export {MultiCounter}
export default Counter
