const isAction = action => {
  if (action && typeof action.type === 'string') {
    return true
  }
  return false
}

const findAction = args => {
  let i = args.length
  while (i--) {
    if (isAction(args[i])) return args[i]
    if (args[i] && isAction(args[i].action)) return args[i].action
  }
  return null
}

const handleActions = (handlers, initialState) => (...args) => {
  let action = findAction(args)
  const state = args[0] === undefined ? initialState : args[0]

  if (!action || !handlers[action.type]) return state
  if (initialState !== undefined) return handlers[action.type](state, action)
  return handlers[action.type](action)
}

export default handleActions
