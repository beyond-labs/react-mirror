import React from 'react'
import * as most from 'most'
import Mirror from '../../index'

const Child = Mirror()(function Child() {
  // light color to reduce risk of injury to epileptic viewers
  return <h2 style={{color: '#eee'}}>Child</h2>
})

const Parent = Mirror({
  name: 'store',
  state(mirror, dispatch) {
    return most.periodic(50).scan(({child}) => ({child: !child}), {child: false})
  }
})(function Parent({child}) {
  return (
    <div>
      <h1>Parent</h1>
      {child ? <Child /> : null}
    </div>
  )
})

export default Parent
