import React from 'react'
import ReactDOM from 'react-dom'
// import {applyMiddleware} from 'redux'
// import createLogger from 'redux-logger'
import BMICalculatorUsingContext from './BMICalculatorUsingContext'
// import Mirror from '../../../index'

// const logger = createLogger({titleFormatter: (action) => `action @ ${action.meta.store} ${action.type}`, collapsed: true})

// const MyComponent = Mirror({
//   enhancer: applyMiddleware(logger),
// })(
//   () => (
//     <div>
//       <BMICalculatorUsingContext />
//       <hr />
//       {/* <BMICalculatorUsingSubscribe /> */}
//     </div>
//   )
// )

ReactDOM.render(
  <BMICalculatorUsingContext />,
  document.getElementById('root')
)
