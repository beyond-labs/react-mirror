import React from 'react'
import Mirror, {handleActions, combineEventsWith} from '../../index'

const Child = Mirror({
  name: 'child',
  state(mirror, dispatch) {
    return combineEventsWith(
      mirror.parent('parent').$actions.filter(({type}) => type === 'LISTEN_TO_ME'),
      mirror.parent('parent').$state
    ).map(({after}) => after[0])
  }
})(function Child({listen, ignore}) {
  return (
    <div>
      CHILD
      <br />
      Ignore: {ignore}
      <br />
      Listen: {listen}
    </div>
  )
})

const Parent = Mirror({
  name: 'parent',
  state(mirror, dispatch) {
    return mirror.$actions.scan(
      handleActions(
        {
          IGNORE_ME: state => ({...state, ignore: state.ignore + 1}),
          LISTEN_TO_ME: state => ({...state, listen: state.listen + 1})
        },
        {ignore: 0, listen: 0}
      )
    )
  }
})(function Parent({ignore, listen, dispatch}) {
  return (
    <div>
      Ignore: {ignore}
      <br />
      Listen: {listen}
      <br />
      <button onClick={() => dispatch('IGNORE_ME')}>IGNORE</button>
      <button onClick={() => dispatch('LISTEN_TO_ME')}>LISTEN</button>
      <br />
      <br />
      <Child />
    </div>
  )
})

export default Parent
