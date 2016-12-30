import _ from 'lodash'
import React from 'react'
import Mirror from '../../../index'

const InputContext = Mirror({
  contextSubscribe: 'BMICalculator'
})(
  function Input({dispatch, subscribe, context, name, ...props}) {
    return <input name={name} {...props} onChange={e => dispatch('CHANGE', 'BMICalculator', e.target)} />
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
})(({weight, height}) => {
  const BMI = Math.round(weight * ((height * 0.01) ** 2))
  return (
    <div>
      <span className='value'>BMI: {BMI}</span>
      <label>
        Weight (kg)
        <InputContext name='weight' type='range' value={weight} min={40} max={140} />
      </label>
      <label>
        Height (cm)
        <InputContext name='height' type='range' value={height} min={140} max={210} />
      </label>
    </div>
  )
})

const InputSubscribe = Mirror({
  reducer: (state, {type, payload}) => {
    switch (type) {
    case 'INITIALIZE': return payload
    case 'UPDATE_PROPS': return payload
    case 'CHANGE': return {...state, ...payload}
    default: return state
    }
  }
})(
  function Input({dispatch, subscribe, context, ...props}) {
    return <input onChange={e => dispatch('CHANGE', _.pick(e.target, ['value', 'checked']))} {...props} />
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
})(({dispatch, weight, height}) => {
  const BMI = Math.round(weight * ((height * 0.01) ** 2))
  const subscribe = ({type, payload}, {name}) => {
    if (type === 'CHANGE') dispatch('CHANGE', {...payload, name})
  }
  return (
    <div>
      <span className='value'>BMI: {BMI}</span>
      <label>
        Weight (kg)
        <InputSubscribe name='weight' type='range' subscribe={subscribe} value={weight} min={40} max={140} />
      </label>
      <label>
        Height (cm)
        <InputSubscribe name='height' type='range' subscribe={subscribe} value={height} min={140} max={210} />
      </label>
    </div>
  )
})
