import './css/todos.css'
import React from 'react'
import cl from 'classnames'
import Mirror, {handleActions, combineSimple} from '../../index'
import Input from './Input'

const filters = {
  ALL: 'ALL',
  ACTIVE: 'ACTIVE',
  COMPLETE: 'COMPLETE'
}

const actions = {
  MARK_COMPLETE: 'MARK_COMPLETE',
  MARK_ACTIVE: 'MARK_ACTIVE',
  SET_FILTER: 'SET_FILTER',
  ADD_TODO: 'ADD_TODO',
  CLEAR_COMPLETED: 'CLEAR_COMPLETED',
  REHYDRATE: 'REHYDRATE'
}

const ENTER = 13

const TodoItem = ({completed, editing, value}) => (
  <li className={cl({completed, editing})}>
    <div className="view">
      <input className="toggle" type="checkbox" />
      <label>
        {value}
      </label>
      <button className="destroy" />
    </div>
    <input className="edit" value={value} />
  </li>
)

const TodoList = Mirror({
  state(mirror) {
    const $todos = mirror
      .children('todo-item')
      .$state.map(todos => todos.slice().sort((a, b) => a.index > b.index))

    const $state = mirror.$actions.scan(
      handleActions(
        {
          ADD_TODO(state, {payload: value}) {},
          SET_FILTER(state, {payload: filter}) {}
        },
        {filter: filters.ALL}
      )
    )
  }
})(({todos, dispatch}) => ( // display:hidden if no todos
  <section className="main">
    <Input
      className="toggle-all"
      type="checkbox"
      checked={todos.every(todo => todo.completed)}
      onChange={e => {
        const action = e.target.checked ? 'COMPLETE' : 'NOT_COMPLETE'
        dispatch.children('todo-item')(action)
      }}
    />
    <label htmlFor="toggle-all">Mark all as complete</label>
    <ul className="todo-list">
      {todos.map(todo => <TodoItem {...todo} />)}
    </ul>
  </section>
))

const Header = Mirror()(({dispatch}) => (
  <header className="header">
    <h1>todos</h1>
    <Input
      className="new-todo"
      onKeyDown={e => {
        if (e.keyCode === ENTER) {
          dispatch.one('todo-list')('NEW_TODO', e.target.value)
          dispatch.child('input')('UPDATE_VALUE', '')
        }
      }}
      placeholder="What needs to be done?"
    />
  </header>
))

const Footer = Mirror()(() => (
  <footer className="footer">
    <span className="todo-count">
      {/* "item" if =1 */}
      <strong>2</strong>{' '}
      items left
    </span>
    <ul className="filters">
      <li>
        <a className="selected">All</a>
      </li>
      <li style={{listStyle: 'none'}}><span /></li>
      <li>
        <a>Active</a>
      </li>
      <li style={{listStyle: 'none'}}><span /></li>
      <li>
        <a>Completed</a>
      </li>
    </ul>
    {/* no render if nothing completed */}
    <button className="clear-completed">Clear completed</button>
  </footer>
))

const Todos = () => (
  <div className="todoContainer">
    <div className="background" />
    <section className="todoapp">
      <div>
        <Header />
        <TodoList />
        <Footer />
      </div>
    </section>
  </div>
)

export default Todos
