import _ from 'lodash';
import React from 'react';
import Mirror from '../../../index';

const Input = Mirror(
  {
    reducer: (state, {type, payload}) => {
      switch (type) {
        case 'INITIALIZE':
          return payload;
        case 'UPDATE_PROPS':
          return payload;
        case 'CHANGE':
          return {...state, ...payload};
        default:
          return state;
      }
    }
  },
  {pure: false}
)(function Input({dispatch, subscribe, context, ...props}) {
  return (
    <input
      type="range"
      {...props}
      onChange={e => {
        e = _.pick(e.target, ['value', 'name']);
        e.value = Number(e.value);
        dispatch('CHANGE', e);
      }}
    />
  );
});

export const BMICalculatorUsingSubscribe = Mirror({
  reducer: (state, {type, payload}) => {
    switch (type) {
      case 'INITIALIZE':
        return {weight: 70, height: 170};
      case 'CHANGE':
        return {...state, [payload.name]: payload.value};
      default:
        return state;
    }
  }
})(function BMICalculatorUsingSubscribe({dispatch, weight, height}) {
  const BMI = Math.round(weight / (height * (0.01 ** 2)));
  const subscribe = ({type, payload}, {name}) => {
    if (type === 'CHANGE') dispatch('CHANGE', {...payload});
  };
  return (
    <div>
      Subscribe<br />
      <span className="value">BMI: {BMI}</span>
      <label>
        Weight ({weight} kg)
        <Input name="weight" subscribe={subscribe} value={weight} min={40} max={140} />
      </label>
      <label>
        Height ({height} cm)
        <Input name="height" subscribe={subscribe} value={height} min={140} max={210} />
      </label>
    </div>
  );
});

export default BMICalculatorUsingSubscribe;
