import React from 'react'
import * as most from 'most'
import Mirror, {combine} from '../../index'

const Child = Mirror({
  state(mirror, dispatch) {
    mirror.$actions.observe(({type}) => console.log(type))
    return most.of(true)
  }
})(function Child() {
  return <h2>Child</h2>
})

const Parent = Mirror({
  name: 'store',
  state(mirror, dispatch) {
    return combine(
      most.periodic(1000).scan(child => !child, false),
      mirror
        .child(Child)
        .$actions.scan(
          (counts, {type}) => ({...counts, [type]: (counts[type] || 0) + 1}),
          {INITIALIZE: 0, TEARDOWN: 0}
        )
    ).map(([child, counts]) => ({child, counts}))
  }
})(function Parent({child, counts}) {
  return (
    <div>
      <h1>Parent</h1>
      <h2>Child action counts:</h2>
      <ul>
        {Object.keys(counts).map(k =>
          <li key={k}>
            <strong>{k}</strong>: {counts[k]}
          </li>
        )}
      </ul>
      {child ? <Child /> : null}
    </div>
  )
})

export default Parent
