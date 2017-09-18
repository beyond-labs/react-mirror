import React from 'react'
import {storiesOf} from '@storybook/react'
import {action} from '@storybook/addon-actions'
import Counter, {MultiCounter} from './Counter'
import BMICalculator from './BMICalculator'
import {
  ChildrenExcludesSelfTest,
  CombineEventsWithTest,
  InitialPropsTest,
  PremountEventOrderTest,
  TeardownExcludesIsolatedTest,
  TeardownTest,
  UnmountErrorTest
} from './Testing'

storiesOf('Counter', module)
  .add('default', () =>
    <Counter onIncrement={action('increment')} onDecrement={action('decrement')} />
  )
  .add('multi-counter', () => <MultiCounter />)

storiesOf('BMI Calculator', module).add('default', () => <BMICalculator />)
storiesOf('Testing', module)
  .add('ChildrenExcludesSelf', () => <ChildrenExcludesSelfTest />)
  .add('CombineEventsWith', () => <CombineEventsWithTest />)
  .add('InitialProps', () => <InitialPropsTest />)
  .add('PremountEventOrder', () => <PremountEventOrderTest />)
  .add('TeardownExcludesIsolated', () => <TeardownExcludesIsolatedTest />)
  .add('Teardown', () => <TeardownTest />)
  .add('UnmountError', () => <UnmountErrorTest />)
