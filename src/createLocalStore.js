import _ from 'lodash'
import shallowEqual from './utils/shallowEqual'
import subNamesToKeys from './utils/subNamesToKeys'
import normalizeState from './utils/normalizeState'

const shouldUpdate = (pure, storeUpdated, subscribedTo, state, prevState) => {
  if (!subscribedTo.some((key) => key === storeUpdated)) return false
  if (!pure) return true
  if (typeof pure === 'function') return pure(state, prevState)
  if (!shallowEqual(state, prevState)) return true
  if (subscribedTo) {
    for (let key in subscribedTo) { // eslint-disable-line prefer-const
      if (!shallowEqual(state.context[key], prevState.context[key])) return true
    }
  }
}

const _dispatch = (action = {}, context, instance) => {
  // TODO: throw if:
  // store from context not found
  const key = instance.path.slice(-1)[0]
  let store = key
  if (context) {
    const candidates = instance.path.map(key => instance.rootStore.getState().stores[key])
    store = candidates.reverse().find(store => store.meta.contextPublish === context).key
  }
  action = _.set(action, 'meta.store', store)
  action = _.set(action, 'meta.origin', key)
  instance.rootStore.dispatch(action)
}

const dispatch = (instance) => (...args) => {
  const [type, context, payload, metadata] = args
  if (typeof type !== 'string') return _dispatch(type, context, instance)
  if (args.length === 1) return _dispatch({type}, null, instance)
  if (args.length === 2) return _dispatch({type, payload: context}, null, instance)
  if (args.length === 3) return _dispatch({type, payload}, context, instance)
  return _dispatch({type, payload, ...metadata}, context, instance)
}

export const createLocalStore = (instance, config, options) => {
  let {reducer, middleware, contextSubscribe = [], contextPublish} = config
  if (typeof contextSubscribe === 'string') contextSubscribe = [contextSubscribe]
  const {pure = true} = options
  const {rootStore, path} = instance
  const key = path.slice(-1)[0]
  rootStore.dispatch({
    type: '@@mirror/ADD_STORE',
    payload: {
      path, name: instance.displayName || instance.name, instance,
      reducer, middleware, contextSubscribe, contextPublish
    }
  })
  let subscriptions = []
  let _state = {}
  let _context = {}
  const store = {
    dispatch: dispatch(instance),
    subscribe: f => {
      // TODO: throw if:
      // f is not a function
      const _id = Math.random().toString().slice(2)
      const cancel = () => subscriptions = subscriptions.filter(({id}) => id === _id)
      subscriptions.push({f, cancel, id: _id})
      return cancel
    },
    subscribeParent: (f = () => {}) => {
      const cancel = () => subscriptions = subscriptions.filter(({id}) => id === 'parent')
      cancel()
      subscriptions.push({f, cancel, id: 'parent'})
    },
    getState: () => _state,
    getStateContext: () => _context,
  }
  const contextSubscribeKeys = subNamesToKeys(contextSubscribe, path, rootStore.getState())
  const cancelRootSubscription =
    rootStore.subscribe((storeUpdated, action, rootState, rootPrevState) => {
      const {state, context} = normalizeState(contextSubscribe, path, rootState)
      const {state: prevState, context: prevContext} = normalizeState(contextSubscribe, path, rootPrevState)
      _state = state
      _context = context
      const updatedContextName = contextSubscribe[contextSubscribeKeys.indexOf(storeUpdated)]
      if (updatedContextName) store.dispatch('UPDATE_CONTEXT', updatedContextName)
      if (shouldUpdate(pure, storeUpdated, [...contextSubscribeKeys, key], {...state, context}, {...prevState, context: prevContext})) {
        subscriptions.forEach(({f}) => f(action, state, prevState))
      }
    })
  store.destroy = () => {
    subscriptions.forEach(({cancel}) => cancel())
    cancelRootSubscription()
    rootStore.dispatch({
      type: '@@mirror/REMOVE_STORE',
      payload: key
    })
  }
  return store
}

export default createLocalStore
