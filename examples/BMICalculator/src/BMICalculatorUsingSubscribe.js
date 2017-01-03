import _ from 'lodash'
import React from 'react'
import Mirror from '../../../index'

const Input = Mirror({
  reducer: (state, {type, payload}) => {
    switch (type) {
    case 'INITIALIZE': return payload
    case 'UPDATE_PROPS': return payload
    case 'CHANGE': return {...state, ...payload}
    default: return state
    }
  }
}, {pure: false})(
  function Input({dispatch, subscribe, context, ...props}) {
    return <input {...props} onChange={e => dispatch('CHANGE', _.pick(e.target, ['value', 'checked', 'name']))} />
  }
)

export const BMICalculatorUsingSubscribe = Mirror({
  reducer: (state, {type, payload}) => {
    switch (type) {
    case 'INITIALIZE': return {weight: 70, height: 170}
    case 'CHANGE': return {...state, [payload.name]: payload.value}
    default: return state
    }
  },
})(
  function BMICalculatorUsingSubscribe({dispatch, weight, height}) {
    const BMI = Math.round(Number(weight) * ((Number(height) * 0.01) ** 2))
    const subscribe = ({type, payload}, {name}) => {
      if (type === 'CHANGE') dispatch('CHANGE', {...payload})
    }
    return (
      <div>
        <span className='value'>BMI: {BMI}</span>
        <label>
          Weight (kg)
          <Input name='weight' type='number' subscribe={subscribe} value={weight} min={40} max={140} />
        </label>
        <label>
          Height (cm)
          <Input name='height' type='number' subscribe={subscribe} value={height} min={140} max={210} />
        </label>
      </div>
    )
  }
)

export default BMICalculatorUsingSubscribe
