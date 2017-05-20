import React from 'react'
import {storiesOf} from '@storybook/react'
import {action} from '@storybook/addon-actions'
import Counter from './Counter'
import BMICalculator from './BMICalculator'

storiesOf('Counter', module).add('basic', () => (
  <Counter onIncrement={action('increment')} onDecrement={action('decrement')} />
))

storiesOf('BMI Calculator', module).add('basic', () => <BMICalculator />)
