import * as most from 'most'
import React from 'react'
import warning from 'warning'
import invariant from 'invariant'
import MirrorBackend from '../backend'
import shallowEqual from '../utils/shallowEqual'
import createEventSource from '../utils/streams/eventSource'
import filterUnchanged from '../utils/streams/filterUnchanged'

const instantiseMapToProps = mapToProps => {
  let CALLED_ONCE
  const instantisedMapToProps = (state, props) => {
    let result = mapToProps(state, props)
    if (!CALLED_ONCE && typeof result === 'function') {
      mapToProps = result
      result = mapToProps(state, props)
    }
    CALLED_ONCE = true
    return result
  }
  return instantisedMapToProps
}

function createMirrorDecorator(config = {}) {
  return function decorateWithMirror(WrappedComponent) {
    let {name = [], state, mapToProps, pure = true} = config
    if (!(name instanceof Array)) name = [name]
    if (typeof mapToProps !== 'function') {
      mapToProps = (state, {withName, ...props}) => ({...props, ...state})
    }
    if (!pure) pure = {propsEqual() {}, stateEqual() {}, propsStateEqual() {}}
    if (pure === true) pure = {}
    pure = Object.assign(
      {
        propsEqual: shallowEqual,
        stateEqual: shallowEqual,
        propsStateEqual: shallowEqual
      },
      pure
    )

    if (!WrappedComponent) {
      WrappedComponent = function Noop() {
        return null
      }
    }
    const _name = WrappedComponent.displayName || WrappedComponent.name || 'Component'
    const stateless = !WrappedComponent.prototype.render
    invariant(
      name.every(name => typeof name === 'string'),
      '`name` should be a string or array of strings (at "%s")',
      _name
    )

    const getPropNames = (name = []) => {
      if (!(name instanceof Array)) name = [name]
      return name.filter(name => typeof name === 'string').sort()
    }

    class Mirror extends React.Component {
      constructor(props, context) {
        super()
        this.props = props
        this.state = {updateCount: 0, props: undefined}

        let {push: onReceivedProps, $stream: $props} = createEventSource()
        Object.assign(this, {onReceivedProps})

        const {id, mirror, dispatch, streams} = MirrorBackend.addStore(context.id, {
          requesting: ['$state', '$props'],
          identifiers: [
            ...name,
            ...getPropNames(this.props.withName),
            Mirror.__COMPONENT_IDENTIFIER__
          ],
          streams: (mirror, dispatch) => {
            $props = filterUnchanged(pure.propsEqual.bind(this), $props.startWith(props))
            let $state = typeof state === 'function' && state.call(this, mirror, dispatch)
            warning(
              !state || ($state && $state.subscribe),
              '`state` should return a stream, did you forget a "return" statement? (at "%s")',
              [_name].concat(name.filter(name => typeof name === 'string').join(', '))
            )
            if (!state || !$state || !$state.subscribe) return {$props}
            $state = filterUnchanged(pure.stateEqual.bind(this), $state).filter(
              state => state !== undefined
            )
            return {$state, $props}
          },
          metadata: {
            instance: this
          }
        })
        Object.assign(this, {id, mirror, dispatch})

        const $propsState = streams.$state
          ? most.combine(
              instantiseMapToProps(mapToProps.bind(this)),
              streams.$state,
              streams.$props
            )
          : streams.$props.map(instantiseMapToProps(mapToProps.bind(this, undefined)))

        filterUnchanged(
          pure.propsStateEqual.bind(this),
          $propsState
        ).observe(propsState => {
          this.setState(({updateCount}) => ({updateCount: updateCount + 1, propsState}))
        })
      }
      getWrappedInstance() {
        invariant(
          !stateless,
          "Stateless components (eg, `() => {}`) don't have refs, and therefore can't be unwrapped."
        )
        return this.wrappedInstance
      }
      getChildContext() {
        return {id: this.id}
      }
      componentWillReceiveProps(nextProps) {
        const nextName = getPropNames(nextProps.withName)
        const currentName = getPropNames(this.props.withName)
        if (JSON.stringify(nextName) !== JSON.stringify(currentName)) {
          MirrorBackend.updateStore(this.id, {
            requesting: ['$state', '$props'],
            identifiers: [...name, ...nextName, Mirror.__COMPONENT_IDENTIFIER__],
            metadata: {instance: this}
          })
        }
        this.onReceivedProps(nextProps)
      }
      shouldComponentUpdate(nextProps, nextState) {
        return nextState.updateCount > this.state.updateCount
      }
      componentWillUnmount() {
        MirrorBackend.removeStore(this.id)
      }
      render() {
        if (this.state.updateCount === 0 && state) {
          return null
        }

        const props = {
          ...this.state.propsState,
          dispatch: this.dispatch
        }
        if (!stateless) props.ref = ref => (this.wrappedInstance = ref)

        return React.createElement(WrappedComponent, props)
      }
    }

    Mirror.displayName = `Mirror(${_name})`
    Mirror.contextTypes = {id() {}}
    Mirror.childContextTypes = {id() {}}
    Mirror.__COMPONENT_IDENTIFIER__ = Mirror

    const createStaticCursors = () => {
      delete Mirror.mirror
      delete Mirror.dispatch
      if (Mirror !== Mirror.__COMPONENT_IDENTIFIER__) {
        Mirror.mirror = Mirror.__COMPONENT_IDENTIFIER__.mirror
        Mirror.dispatch = Mirror.__COMPONENT_IDENTIFIER__.dispatch
        return
      }

      const {mirror, dispatch} = MirrorBackend.addStore(null, {
        identifiers: ['MIRROR/static', `MIRROR/static/${_name}`],
        metadata: {
          static: Mirror
        }
      })

      Object.assign(Mirror, {
        mirror: mirror.all(Mirror),
        dispatch: dispatch.all(Mirror)
      })
    }

    Object.defineProperties(Mirror, {
      mirror: {get: () => (createStaticCursors(), Mirror.mirror)},
      dispatch: {get: () => (createStaticCursors(), Mirror.dispatch)}
    })

    Mirror.__WITH_NAME_CACHE__ = Mirror.__COMPONENT_IDENTIFIER__.__WITH_NAME_CACHE__ || {}

    Mirror.withName = function withName(...withName) {
      withName = name.concat(...withName)
      const key = JSON.stringify(withName.sort())
      const cachedComponent = Mirror.__WITH_NAME_CACHE__[key]
      if (cachedComponent) return cachedComponent

      const renamedComponent = createMirrorDecorator({
        ...config,
        name: withName
      })(WrappedComponent)
      renamedComponent.__COMPONENT_IDENTIFIER__ = Mirror.__COMPONENT_IDENTIFIER__
      if (withName.length) Mirror.__WITH_NAME_CACHE__[key] = renamedComponent
      return renamedComponent
    }

    return Mirror
  }
}

export default createMirrorDecorator
