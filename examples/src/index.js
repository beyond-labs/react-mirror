import React from 'react'
import {storiesOf} from '@storybook/react'
import {action} from '@storybook/addon-actions'
import Counter, {MultiCounter} from './Counter'
import BMICalculator from './BMICalculator'
import CombineEventsWithTest from './CombineEventsWithTest'
import PremountEventOrderTest from './PremountEventOrderTest'

storiesOf('Counter', module)
  .add('default', () =>
    <Counter onIncrement={action('increment')} onDecrement={action('decrement')} />
  )
  .add('multi-counter', () => <MultiCounter />)

storiesOf('BMI Calculator', module).add('default', () => <BMICalculator />)
storiesOf('Testing', module)
  .add('CombineEventsWithTest', () => <CombineEventsWithTest />)
  .add('PremountEventOrderTest', () => <PremountEventOrderTest />)
