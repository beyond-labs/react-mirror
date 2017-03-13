import _ from 'lodash';
import {applyMiddleware, compose} from 'redux';

import createLogger from 'redux-logger';
const logger = createLogger({
  titleFormatter(action) {
    const state = window.rootStore.getState();
    const storeName = _.get(state.stores[action.store], 'meta.name', null);
    return `${action.type} @ ${storeName}`;
  },
  collapsed: true
});

export const enhancer = compose(
  next => (...args) => {
    window.rootStore = next(...args);
    return window.rootStore;
  },
  applyMiddleware(logger)
);

export default enhancer;
