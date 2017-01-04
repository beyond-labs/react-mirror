import _ from 'lodash'
import React from 'react'
import Mirror from '../../../index'

const Input = Mirror({
  reducer: (state, {type, payload}) => {
    switch (type) {
    case 'INITIALIZE': return payload
    case 'UPDATE_PROPS': return payload
    default: return state
    }
  },
  contextSubscribe: 'BMICalculator'
})(
  function Input({dispatch, subscribe, context, name, ...props}) {
    return (
      <input
        type='range' name={name} value={context.BMICalculator[name]} {...props}
        onChange={e => {
          e = _.pick(e.target, ['value', 'name'])
          e.value = Number(e.value)
          dispatch('CHANGE', 'BMICalculator', e)
        }}
      />
    )
  }
)

export const BMICalculatorUsingContext = Mirror({
  reducer: (state, {type, payload}) => {
    switch (type) {
    case 'INITIALIZE': return {weight: 70, height: 170}
    case 'CHANGE': return {...state, [payload.name]: payload.value}
    default: return state
    }
  },
  contextPublish: 'BMICalculator'
})(
  function BMICalculatorUsingContext({weight, height}) {
    const BMI = Math.round(weight / ((height * 0.01) ** 2))
    return (
      <div>
        Context<br />
        <span className='value'>BMI: {BMI}</span>
        <label>
          Weight ({weight} kg)
          <Input name='weight' min={40} max={140} />
        </label>
        <label>
          Height ({height} cm)
          <Input name='height' min={140} max={210} />
        </label>
      </div>
    )
  }
)

export default BMICalculatorUsingContext
