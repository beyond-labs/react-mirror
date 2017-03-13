import _ from 'lodash';
import invariant from 'invariant';
import setPure from './utils/setPure';
import normalizeState from './utils/normalizeState';
import {createStore as createReduxStore, compose, applyMiddleware} from 'redux';

const addStore = (state, store) => {
  const key = store.path.slice(-1)[0];
  state = setPure(state, ['stores', key], {meta: store, state: {}});
  return state;
};

const removeStore = (state, key) => {
  state = _.omit(state, `stores.${key}`);
  return state;
};

const updateState = (state, action) => {
  if (!action.store) return state;
  const store = state.stores[action.store];
  invariant(store, `The store you're dispatching an action (${action.type}) to doesn't exist any more.`);
  const key = store.meta.path.slice(-1)[0];
  const nextState = store.meta.reducer(store.state, action, action.props, action.context);
  state = setPure(state, ['stores', key, 'state'], nextState);

  const isRoot = store.meta.path.length === 1;
  if (isRoot) {
    state = {...state.stores[key].state, stores: state.stores};
  }

  return state;
};

const defaultStoreMiddleware = store => next => action => {
  if (!action.store) {
    const state = store.getState();
    const rootStoreKey = _.get(Object.values(state.stores), '0.meta.path.0');
    action.store = rootStoreKey;
  }
  return next(action);
};

const propsMiddleware = store => next => action => {
  if (['@@redux/INIT', '@@mirror/ADD_STORE', '@@mirror/REMOVE_STORE'].includes(action.type)) return next(action);

  const state = store.getState();
  const localStore = state.stores[action.store];
  const {context} = normalizeState(localStore.meta.contextSubscribe, localStore.meta.path, state);
  action.context = context;
  action.props = localStore.meta.instance.props || {};

  return next(action);
};

const subscribeEnhancer = next => (...args) => {
  const store = next(...args);
  const _subscribe = store.subscribe;
  const _dispatch = store.dispatch;
  let action, prevState;
  store.dispatch = (_action, ...args) => {
    action = _action;
    prevState = store.getState();
    return _dispatch(_action, ...args);
  };
  store.subscribe = f => {
    return _subscribe(() => {
      f(action.store, action, store.getState(), prevState);
    });
  };
  return store;
};

export const createRootStore = ({enhancer}) => {
  enhancer = enhancer || (next => (...args) => next(...args));
  const reducer = (state = {stores: {}}, action) => {
    switch (action.type) {
      case '@@redux/INIT':
        return state;
      case '@@mirror/ADD_STORE':
        return addStore(state, action.payload);
      case '@@mirror/REMOVE_STORE':
        return removeStore(state, action.payload);
      default:
        return updateState(state, action);
    }
  };

  return createReduxStore(
    reducer,
    compose(applyMiddleware(defaultStoreMiddleware, propsMiddleware), subscribeEnhancer, enhancer)
  );
};

export default createRootStore;
