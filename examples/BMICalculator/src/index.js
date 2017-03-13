import './index.css';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import BMICalculatorUsingContext from './BMICalculatorUsingContext';
import BMICalculatorUsingSubscribe from './BMICalculatorUsingSubscribe';
import enhancer from './enhancer';
import Mirror from '../../../index';

const MyComponent = Mirror({
  enhancer
})(() => (
  <div>
    <BMICalculatorUsingContext />
    <hr />
    <BMICalculatorUsingSubscribe />
  </div>
));

ReactDOM.render(<MyComponent />, document.getElementById('root'));
