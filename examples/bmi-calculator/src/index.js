import React from 'react'
import ReactDOM from 'react-dom'
import Mirror, {handleActions, combineSimple} from '../../../index'

const Input = Mirror({
  name: 'input',
  state(mirror) {
    return mirror.$actions.scan(
      handleActions(
        {
          UPDATE_VALUE: (state, {payload: value}) => ({value})
        },
        {value: ''}
      )
    )
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
    const weight = mirror.child('input/weight').$state
    const height = mirror.child('input/height').$state
    return combineSimple(weight, height)
      .map(([weight, height]) => ({
        weight: Number(weight.value),
        height: Number(height.value)
      }))
      .startWith({weight: 70, height: 170})
      .tap(evt => console.log(evt))
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
        <WeightInput initialValue={70} min={40} max={140} />
      </label>
      <label>
        Height ({height} cm)
        <HeightInput initialValue={170} min={140} max={210} />
      </label>
    </div>
  )
})

ReactDOM.render(<BMICalculator />, document.getElementById('root'))
