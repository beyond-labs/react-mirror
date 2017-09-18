import React from 'react'
import * as most from 'most'
import Mirror, {handleActions} from '../../index'

const ChildOfIsolated = Mirror({
  name: 'child-of-isolated'
})(function ChildOfIsolated() {
  return <p>Child of Isolated</p>
})

const Isolated = Mirror({
  name: 'isolated',
  state(mirror, dispatch) {
    return most
      .periodic(1000)
      .scan(({childVisible}) => ({childVisible: !childVisible}), {childVisible: true})
  }
})(function Isolated({childVisible}) {
  return (
    <div>
      <h2>Isolated</h2>
      {childVisible ? <ChildOfIsolated /> : null}
    </div>
  )
})

const Observer = Mirror({
  state(mirror, dispatch) {
    return most
      .merge(
        mirror
          .one('child-of-isolated')
          .$actions.filter(({type}) => type === 'TEARDOWN')
          .map(() => ({type: 'TEARDOWN_CHILD'})),
        mirror
          .one('child-of-isolated')
          .parent('isolated')
          .$actions.filter(({type}) => type === 'TEARDOWN')
          .map(() => ({type: 'TEARDOWN_ISOLATED'}))
      )
      .scan(
        handleActions(
          {
            TEARDOWN_CHILD: state => ({...state, child: state.child + 1}),
            TEARDOWN_ISOLATED: state => ({...state, isolated: state.isolated + 1})
          },
          {child: 0, isolated: 0}
        )
      )
  }
})(function Observer({child, isolated}) {
  return (
    <div>
      <h1>Observer</h1>
      <p>
        TEARDOWN_CHILD recieved {child} times
      </p>
      <p>
        TEARDOWN_ISOLATED recieved {isolated} times (expected 0)
      </p>
    </div>
  )
})

const Container = () =>
  <div>
    <Observer />
    <Isolated />
  </div>

export default Container
