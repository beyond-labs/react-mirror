import React from 'react'
import {mount} from 'enzyme'
import Counter from './Counter'
import Mirror from '../../../index'

it('renders without crashing', () => {
  mount(<Counter />)
})

it('has a displayName', () => {
  expect((<Counter />).displayName).toEqual('Mirror(Counter)')
})

it('updates the state', () => {
  const wrapper = mount(<Counter />)
  const value = () => wrapper.getNode().localStore.getState().value
  expect(value()).toEqual(0)
  wrapper.find({name: 'increment'}).simulate('click')
  wrapper.find({name: 'increment'}).simulate('click')
  expect(value()).toEqual(2)
  wrapper.find({name: 'decrement'}).simulate('click')
  expect(value()).toEqual(1)
})

it('updates the counter', () => {
  const wrapper = mount(<Counter />)
  const value = () => wrapper.find('.value').text()
  expect(value()).toEqual('Value: 0')
  wrapper.find({name: 'increment'}).simulate('click')
  wrapper.find({name: 'increment'}).simulate('click')
  expect(value()).toEqual('Value: 2')
  wrapper.find({name: 'decrement'}).simulate('click')
  expect(value()).toEqual('Value: 1')
})

it('updates multiple counters independently', () => {
  const MyComponent = Mirror()(
    () => (
      <div>
        <Counter id='1' />
        <Counter id='2' />
      </div>
    )
  )
  const wrapper = mount(<MyComponent />)
  const simulate = (id, button) => wrapper.find({id}).find({name: button}).simulate('click')
  const value = (id) => wrapper.find({id}).find('.value').text()
  expect(value('1')).toEqual('Value: 0')
  expect(value('2')).toEqual('Value: 0')
  simulate('1', 'INCREMENT')
  expect(value('1')).toEqual('Value: 1')
  expect(value('2')).toEqual('Value: 0')
  simulate('2', 'DECREMENT')
  expect(value('1')).toEqual('Value: 1')
  expect(value('2')).toEqual('Value: -1')
})
