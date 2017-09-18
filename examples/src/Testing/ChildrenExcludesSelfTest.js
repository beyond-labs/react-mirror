import React from 'react'
import Mirror from '../../index'

const Child = Mirror({name: 'child'})(() => <p>Child</p>)

const Parent = Mirror({
  name: 'parent',
  state(mirror, dispatch) {
    return mirror
      .children('parent')
      .children('child')
      .$state.map(_enum => ({matched: _enum.length}))
  }
})(function Parent({matched}) {
  return (
    <span>
      <p>
        {matched} stores matched (expected 0)
      </p>
      <Child />
    </span>
  )
})

export default Parent
