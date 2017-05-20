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
        {value: this.props.initialValue || this.props.value || ''}
      )
    )
  },
  mapToProps(state, props) {
    return {...props, ...state, value: props.value || state.value}
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
    // return weight.map(weight => ({weight}))
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
      <span className="value">BMI: {BMI}</span><br />
      <label>
        Weight ({weight} kg)<br />
        <WeightInput value={weight} min={40} max={140} /><br />
      </label>
      <label>
        Height ({height} cm)<br />
        <HeightInput value={height} min={140} max={210} /><br />
      </label>
    </div>
  )
})

ReactDOM.render(<BMICalculator />, document.getElementById('root'))
