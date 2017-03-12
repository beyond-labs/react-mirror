import _ from 'lodash';
import React from 'react';
import {mount} from 'enzyme';
import BMICalculatorUsingContext from './BMICalculatorUsingContext';
import BMICalculatorUsingSubscribe from './BMICalculatorUsingSubscribe';

const runTests = BMICalculator => {
  const simulate = async (wrapper, name, value) => {
    wrapper.find({name}).simulate('change', {target: {name, value}});
    await new Promise(resolve => setTimeout(resolve));
  };

  const testSuiteName = BMICalculator.displayName.match(/\(.+Using(.+)\)/)[1].toLowerCase();
  describe(testSuiteName, () => {
    it('renders without crashing', () => {
      mount(<BMICalculator />);
    });
    it('updates the state', async () => {
      const wrapper = mount(<BMICalculator />);
      const value = () => wrapper.getNode().localStore.getState();

      expect(value().weight).toEqual(70);
      await simulate(wrapper, 'weight', '100');
      expect(value().weight).toEqual(100);

      expect(value().height).toEqual(170);
      await simulate(wrapper, 'height', '200');
      expect(value().height).toEqual(200);
    });
    it('updates the input state', async () => {
      const wrapper = mount(<BMICalculator />);
      const value = name => {
        const store = wrapper
          .findWhere(node => node.prop('name') === name && node.name() === 'Mirror(Input)')
          .getNode().localStore;
        if (testSuiteName === 'context') return store.getStateContext().BMICalculator[name];
        return store.getState().value;
      };

      expect(value('weight')).toEqual(70);
      await simulate(wrapper, 'weight', '100');
      expect(value('weight')).toEqual(100);

      expect(value('height')).toEqual(170);
      await simulate(wrapper, 'height', '200');
      expect(value('height')).toEqual(200);
    });
    it('updates the BMI', async () => {
      const wrapper = mount(<BMICalculator />);
      const value = () => wrapper.find('.value').text();

      expect(value()).toEqual('BMI: 24');

      await simulate(wrapper, 'weight', '100');
      expect(value()).toEqual('BMI: 35');

      await simulate(wrapper, 'height', '200');
      expect(value()).toEqual('BMI: 25');
    });
    it('updates the inputs', async () => {
      const wrapper = mount(<BMICalculator />);
      const value = name => wrapper.find({name}).getDOMNode().value;

      expect(value('weight')).toEqual('70');
      await simulate(wrapper, 'weight', '100');
      expect(value('weight')).toEqual('100');

      expect(value('height')).toEqual('170');
      await simulate(wrapper, 'height', '200');
      expect(value('height')).toEqual('200');
    });
  });
};

runTests(BMICalculatorUsingContext);
runTests(BMICalculatorUsingSubscribe);
