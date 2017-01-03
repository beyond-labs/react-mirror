import _ from 'lodash'
import {Component, PropTypes, createElement} from 'react'
import createRootStore from './createRootStore'
import createLocalStore from './createLocalStore'

const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired,
})

export const Mirror = (config = {}, options = {}) => {
  const {enhancer} = config

  return function wrapWithMirror(WrappedComponent) {
    // TODO: throw if:
    // WrappedComponent is not a component

    let _setStateFailed = false

    class Mirror extends Component {
      path: null
      rootStore: null
      localStore: null
      getWrappedInstance: () => {}
      replaceKey: () => {}
      constructor(props, context) {
        // TODO: throw if:
        // enhancer provided to non top-level component
        // OR store from contextSubscribe not found
        // OR getWrappedInstance is called & wrapped component is pure
        super()
        const key = Math.random().toString().slice(2)
        if (!context.rootStore) {
          this.rootStore = createRootStore({enhancer})
          this.path = [key]
        }
        else {
          this.rootStore = context.rootStore
          this.path = context.path.concat(key)
        }
        this.localStore = createLocalStore(this, config, options)
        this.localStore.subscribeParent(props.subscribe)
        this.localStore.subscribe((action, state) => {
          if (!['INITIALIZE', 'UNMOUNT_COMPONENT'].includes(action.type)) {
            console.group(`this.setState @ ${this.constructor.displayName}, state:`)
            console.log(state)
            console.groupEnd()
            const context = this.localStore.getStateContext()
            this.setState({state, context}, () => {
              if (this.state.state !== state || this.state.context !== context) {
                setTimeout(() => {
                  _setStateFailed = true
                  this.setState({state, context})
                })
              }
            })
          }
        })
        this.localStore.dispatch('INITIALIZE', _.omit(props, 'subscribe'))
        this.state = {state: this.localStore.getState(), context: this.localStore.getStateContext()}
      }
      getChildContext() {
        return {rootStore: this.rootStore, path: this.path}
      }
      shouldComponentUpdate(nextProps, nextState) {
        if (_setStateFailed) _setStateFailed = false
        else {
          this.localStore.subscribeParent(nextProps.subscribe)
          this.localStore.dispatch('UPDATE_PROPS', _.omit(nextProps, 'subscribe'))
        }
        return nextState !== this.state
      }
      componentWillUnmount() {
        this.localStore.dispatch('UNMOUNT_COMPONENT')
        this.localStore.destroy()
        // these are just to guard against extra memory leakage if a parent element doesn't
        // dereference this instance properly, such as an async callback that never finishes
        this.path = null
        this.rootStore = null
        this.localStore = null
        this.getWrappedInstance = () => {}
        this.replaceKey = () => {}
      }
      render() {
        const {state, context} = this.state
        const props = {...state, context, dispatch: this.localStore.dispatch, subscribe: this.localStore.subscribe}

        return createElement(WrappedComponent, props)
      }
    }

    Mirror.displayName = `Mirror(${getDisplayName(WrappedComponent)})`
    Mirror.WrappedComponent = WrappedComponent
    Mirror.contextTypes = {
      rootStore: storeShape,
      path: PropTypes.arrayOf(PropTypes.string),
    }
    Mirror.childContextTypes = {
      rootStore: storeShape.isRequired,
      path: PropTypes.arrayOf(PropTypes.string).isRequired,
    }

    return Mirror
  }
}

export default Mirror
