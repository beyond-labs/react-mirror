import './index.css';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {applyMiddleware, compose} from 'redux';
import createLogger from 'redux-logger';
import BMICalculatorUsingContext from './BMICalculatorUsingContext';
import BMICalculatorUsingSubscribe from './BMICalculatorUsingSubscribe';
import Mirror from '../../../index';

const logger = createLogger({
  titleFormatter(action) {
    const state = window.rootStore.getState();
    const storeName = _.get(state.stores[action.meta.store], 'meta.name', null);
    return `${action.type} @ ${storeName}`;
  },
  collapsed: true
});

const MyComponent = Mirror({
  enhancer: compose(
    next => (...args) => {
      window.rootStore = next(...args);
      return window.rootStore;
    },
    applyMiddleware(logger)
  )
})(() => (
  <div>
    <BMICalculatorUsingContext />
    <hr />
    <BMICalculatorUsingSubscribe />
  </div>
));

ReactDOM.render(<MyComponent />, document.getElementById('root'));
