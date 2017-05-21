import React from 'react'
import {storiesOf} from '@storybook/react'
import {action} from '@storybook/addon-actions'
import Counter, {MultiCounter} from './Counter'
import BMICalculator from './BMICalculator'

storiesOf('BMI Calculator', module).add('basic', () => <BMICalculator />)

storiesOf('Counter', module)
  .add('basic', () => (
    <Counter onIncrement={action('increment')} onDecrement={action('decrement')} />
  ))
  .add('multi-counter', () => <MultiCounter />)
