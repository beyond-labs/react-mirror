import React from 'react'
import ReactDOM from 'react-dom'
import Mirror, {handleActions, combineSimple, stores} from '../../../index'

console.log(stores)

const Input = Mirror({
  name: 'input',
  state(mirror) {
    return mirror.$actions
      .tap(action => console.log('action', action))
      .scan(
        handleActions(
          {
            UPDATE_VALUE: (state, {payload: value}) => ({value})
          },
          {value: ''}
        )
      )
      .tap(evt => console.log('state', evt))
  },
  mapToProps(state, {initialValue, ...props}) {
    return {...props, value: (state && state.value) || initialValue}
  }
})(function Input({dispatch, ...props}) {
  return (
    <input
      type="range"
      onChange={e => dispatch('UPDATE_VALUE', e.target.value)}
      {...props}
    />
  )
})

export const BMICalculator = Mirror({
  state(mirror) {
    const weight = mirror
      .child('input/weight')
      .$state.map(([state = {value: 70}]) => Number(state.value))
    const height = mirror
      .child('input/height')
      .$state.map(([state = {value: 170}]) => Number(state.value))

    return combineSimple(weight, height).map(([weight, height]) => ({weight, height}))
  }
})(function BMICalculator({weight, height}) {
  const BMI = Math.round(weight / Math.pow(height * 0.01, 2))
  const WeightInput = Input.withName('input/weight')
  const HeightInput = Input.withName('input/height')
  return (
    <div>
      Context<br />
      <span className="value">BMI: {BMI}</span>
      <label>
        Weight ({weight} kg)
        <WeightInput value={weight} min={40} max={140} />
      </label>
      <label>
        Height ({height} cm)
        <HeightInput value={height} min={140} max={210} />
      </label>
    </div>
  )
})

ReactDOM.render(<BMICalculator />, document.getElementById('root'))
