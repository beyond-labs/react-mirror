import _ from 'lodash'
import {createStore as createReduxStore, compose, applyMiddleware} from 'redux'
import normalizeState from './utils/normalizeState'

const addStore = (state, store) => {
  const key = store.path.slice(-1)[0]
  state = _.set(state, ['stores', key], {meta: store, state: {}})
  return state
}

const removeStore = (state, key) => {
  state = _.omit(state, `stores.${key}`)
  return state
}

const updateState = (state, action) => {
  // TODO: throw if:
  // dispatching to non-existent store (probably removed before dispatch)
  if (!_.get(action, 'meta.store')) return state
  const store = state.stores[action.meta.store]
  const key = store.meta.path.slice(-1)[0]
  const {context} = normalizeState(store.meta.contextSubscribe, store.meta.path, state)
  const nextState = store.meta.reducer(store.state, action, context)
  state = _.set(state, ['stores', key, 'state'], nextState)

  const isRoot = store.meta.path.length === 1
  if (isRoot) {
    state = {...state.stores[key].state, stores: state.stores}
  }

  return state
}

const defaultStoreMiddleware = store => next => action => {
  if (_.get(action, 'meta.store')) {
    const state = store.getState()
    const rootStore = Object.values(state.stores).find(store => store.meta.path.length === 1)
    const key = _.get(rootStore, 'meta.path', []).slice(-1)[0] || null
    action = _.set(action, 'meta.store', key)
  }
  return next(action)
}

const subscribeEnhancer = next => (...args) => {
  const store = next(...args)
  const _subscribe = store.subscribe
  const _dispatch = store.dispatch
  let action, prevState
  store.dispatch = (_action, ...args) => {
    action = _action
    prevState = store.getState()
    return _dispatch(_action, ...args)
  }
  store.subscribe = (f) => {
    return _subscribe(() => {
      f(action.meta.store, action, store.getState(), prevState)
    })
  }
  return store
}

export const createRootStore = ({enhancer}) => {
  enhancer = enhancer || (next => (...args) => next(...args))
  const reducer = (state = {stores: {}}, action) => {
    switch (action.type) {
    case '@@redux/INIT': return state
    case '@@mirror/ADD_STORE': return addStore(state, action.payload)
    case '@@mirror/REMOVE_STORE': return removeStore(state, action.payload)
    default: return updateState(state, action)
    }
  }

  return createReduxStore(reducer, compose(applyMiddleware(defaultStoreMiddleware), subscribeEnhancer, enhancer))
}

export default createRootStore
