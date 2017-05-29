import React from 'react'
import ReactDOM from 'react-dom'
import Mirror, {handleActions, combineWithNext} from 'react-mirror'
import cl from 'classnames'
import xs from 'xstream'

const http = url => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.send()
  const request = {
    then: f => (xhr.onload(() => f(JSON.parse(xhr.responseText))), request),
    cancel: () => xhr.abort()
  }
  return request
}

const startSocket = url => {
  const ws = new WebSocket(url)
  const socket = {
    next: f => ((ws.onmessage = msg => f(JSON.parse(msg.data))), socket)
  }
  return socket
}

const PlanetMonitor = Mirror({
  name: 'planet-monitor',
  state(mirror, dispatch) {
    startSocket('ws://localhost:4000').next(planet => dispatch('UPDATE_PLANET', planet))

    return mirror.$actions.fold(
      handleActions(
        {UPDATE_PLANET: (state, {payload: planet}) => ({planet})},
        {planet: null}
      )
    )
  }
})(({planet}) => (
  <h1 className="css-planet-monitor">
    {planet ? `Obi-Wan currently on ${planet}` : null}
  </h1>
))

const JediList = Mirror({
  name: 'jedi-list',
  state(mirror) {
    const $activeJediIndex = xs
      .combine(
        mirror
          .one('planet-monitor')
          .$actions.filter(({type}) => type === 'UPDATE_PLANET'),
        combineWithNext(
          mirror.$actions.filter(({type}) => type === 'LOAD_JEDI'),
          mirror.$state
        )
      )
      .map(([{payload: planet}, [, {jedi}]]) =>
        jedi.findIndex(({homeworld}) => homeworld === planet)
      )

    const $jedi = mirror.$actions.fold(
      handleActions(
        {
          SCROLL(jedi, {payload: shift}) {
            return shift > 0
              ? Array(shift).fill({loading: true}).concat(jedi).slice(0, 4)
              : jedi.concat(Array(-shift).fill({loading: true})).slice(0, 4)
          },
          LOAD_JEDI(jediPlural, {payload: {jedi, index}}) {
            return [...jediPlural.slice(0, index), jedi, ...jediPlural.slice(index + 1)]
          }
        },
        Array(4).fill({loading: true})
      )
    )

    // TODO: request jedi, cancel requests on scroll or active jedi & default to darth sidious
    const $activeRequest = $jedi.fold((activeRequest, jedi) => {})

    return xs.combine($activeJediIndex, $jedi).map(([activeJediIndex, jedi]) => ({
      jedi: jedi.map(
        (jedi, i) => (activeJediIndex === i ? {...jedi, active: true} : jedi)
      )
    }))
  }
})(({jedi}) => (
  <ul className="css-slots">
    {jedi.map(
      ({loading, active, name, homeworld}) =>
        loading
          ? <li className="css-slot" />
          : <li className="css-slot" style={{color: active ? 'red' : null}}>
              <h3>{name}</h3>
              <h6>Homeworld: {homeworld}</h6>
            </li>
    )}
  </ul>
))

const ScrollButtons = Mirror({
  state(mirror) {
    return mirror.one('jedi-list').$state.map(jedi => ({
      // TODO: ignore loading jedi
      upDisabled: jedi.find(({active}) => active) || !jedi[0].master,
      downDisabled: jedi.find(({active}) => active) || !jedi.slice(-1)[0].apprentice
    }))
  }
})(({upDisabled, downDisabled, dispatch}) => (
  <div className="css-scroll-buttons">
    <button
      onClick={upDisabled ? undefined : () => dispatch.one('jedi-list')('SCROLL', 2)}
      className={cl('css-button-up', {'css-button-disabled': upDisabled})}
    />
    <button
      onClick={downDisabled ? undefined : () => dispatch.one('jedi-list')('SCROLL', -2)}
      className={cl('css-button-down', {'css-button-disabled': downDisabled})}
    />
  </div>
))

const App = () => (
  <div className="app-container">
    <div className="css-root">
      <PlanetMonitor />
      <section className="css-scrollable-list">
        <JediList />
        <ScrollButtons />
      </section>
    </div>
  </div>
)

ReactDOM.render(<App />, document.getElementById('root'))
