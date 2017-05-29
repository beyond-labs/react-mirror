import React from 'react'
import Mirror, {handleActions} from '../../index'

const Input = Mirror({
  name: 'input',
  state(mirror) {
    return mirror.$actions.scan(
      handleActions(
        {
          UPDATE_VALUE: (state, {payload: value}) => ({value})
        },
        {value: this.props.initialValue || this.props.value || ''}
      )
    )
  },
  mapToProps(state, {withName, ...props}) {
    return {...props, ...state, value: props.value || state.value}
  }
})(function Input({dispatch, ...props}) {
  return <input onChange={e => dispatch('UPDATE_VALUE', e.target.value)} {...props} />
})

export default Input
