import _ from 'lodash'
import React from 'react'
// import {applyMiddleware, compose} from 'redux'
// import createLogger from 'redux-logger'
import Mirror from '../../../index'

// const logger = createLogger({
//   titleFormatter(action) {
//     const state = window.rootStore.getState()
//     const storeName = _.get(state.stores[action.meta.store], 'meta.name', null)
//     return `${action.type} @ ${storeName}`
//   },
//   collapsed: true
// })

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
    console.log('render @ Input')
    return <input type='number' name={name} {...props} onChange={e => dispatch('CHANGE', 'BMICalculator', _.pick(e.target, ['value', 'checked', 'name']))} />
  }
)

export const BMICalculatorUsingContext = Mirror({
  reducer: (state, {type, payload}) => {
    switch (type) {
    case 'INITIALIZE': return {weight: 70, height: 170}
    case 'CHANGE': return {...state, [payload.name]: Number(payload.value)}
    default: return state
    }
  },
  // enhancer: compose(
  //   next => (...args) => {
  //     window.rootStore = next(...args)
  //     return window.rootStore
  //   },
  //   applyMiddleware(logger)
  // ),
  contextPublish: 'BMICalculator'
})(
  function BMICalculatorUsingContext({weight, height}) {
    const BMI = Math.round(Number(weight) * ((Number(height) * 0.01) ** 2))
    return (
      <div>
        <span className='value'>BMI: {BMI}</span>
        <label>
          Weight (kg)
          <Input name='weight' value={weight} />
        </label>
        {/* <label>
          Height (cm)
          <Input name='height' type='number' value={height} min={140} max={210} />
        </label> */}
      </div>
    )
  }
)

export default BMICalculatorUsingContext
