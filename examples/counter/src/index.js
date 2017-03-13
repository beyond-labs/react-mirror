import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './Counter';
import Mirror from '../../../index';
import enhancer from './enhancer';

const MyComponent = Mirror({
  reducer: ({numberOfCounters = 2}, {type, payload = 1}) => {
    switch (type) {
      case 'ADD_COUNTERS':
        return {numberOfCounters: numberOfCounters + payload};
      case 'REMOVE_COUNTERS':
        return {numberOfCounters: numberOfCounters - payload};
      default:
        return {numberOfCounters};
    }
  },
  enhancer
})(({numberOfCounters, dispatch}) => (
  <div>
    {Array(numberOfCounters).fill().map((_, index) => <Counter key={index} />)}
    <br />
    <button name="increment" onClick={() => dispatch('ADD_COUNTERS')}>Add Counter</button>
    <button name="decrement" onClick={() => dispatch('REMOVE_COUNTERS')}>Remove Counter</button>
  </div>
));

ReactDOM.render(<MyComponent />, document.getElementById('root'));
