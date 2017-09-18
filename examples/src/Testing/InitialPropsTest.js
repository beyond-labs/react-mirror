import React from 'react'
import Mirror from '../../index'

const Child = Mirror({
  state(mirror, dispatch) {
    return mirror.$props
  }
})(function Child({prop}) {
  return (
    <span>
      {prop}
    </span>
  )
})

const Parent = () => <Child prop={'text'} />

export default Parent
