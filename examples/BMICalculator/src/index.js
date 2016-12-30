import React from 'react'
import ReactDOM from 'react-dom'
import {BMICalculatorUsingContext} from './BMICalculator'
import Mirror from '../../../index'

const MyComponent = Mirror()(
  () => (
    <div>
      <BMICalculatorUsingContext />
      <hr />
      {/* <BMICalculatorUsingSubscribe /> */}
    </div>
  )
)

ReactDOM.render(
  <MyComponent />,
  document.getElementById('root')
)
