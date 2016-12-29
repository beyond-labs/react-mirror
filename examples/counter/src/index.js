import React from 'react'
import ReactDOM from 'react-dom'
import Counter from './Counter'
import Mirror from '../../../index'

const MyComponent = Mirror()(
  <div>
    <Counter id='1' />
    <Counter id='2' />
  </div>
)

ReactDOM.render(
  <MyComponent />,
  document.getElementById('root')
)
