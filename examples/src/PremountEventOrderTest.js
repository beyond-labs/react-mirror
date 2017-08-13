import React from 'react'
import Mirror from '../../index'

const Store = Mirror({
  name: 'store',
  state(mirror, dispatch) {
    return mirror.$actions
      .scan((state, {type}) => ({events: state.events.concat(type)}), {events: []})
  }
})(function Store({events}) {
  return (
    <div>
      <h1>Events</h1>
      <ul>
        {events.map((event, i) => <li key={i}>{event}</li>)}
      </ul>
    </div>
  )
})

Store.dispatch('AFTER_INITIALIZE')

export default Store
