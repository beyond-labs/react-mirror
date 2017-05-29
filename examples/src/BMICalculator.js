import React from 'react'
import Mirror, {combineSimple} from '../../index'
import Input from './Input'

const BMICalculator = Mirror({
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
      <span className="value">BMI: {BMI}</span><br />
      <label>
        Weight ({weight} kg)<br />
        <WeightInput value={weight} type="range" min={40} max={140} /><br />
      </label>
      <label>
        Height ({height} cm)<br />
        <HeightInput value={height} type="range" min={140} max={210} /><br />
      </label>
    </div>
  )
})

export default BMICalculator
