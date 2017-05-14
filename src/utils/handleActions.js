const isAction = action => {
  if (
    action &&
    typeof action.type === 'string' &&
    action.hasOwnProperty('payload') &&
    typeof action.store === 'string'
  ) {
    return true
  }
  return false
}

const findAction = args => {
  let i = args.length
  while (i--) {
    if (isAction(args[i])) return args[i]
    if (isAction(args[i].action)) return args[i].action
  }
  return null
}

const combineArrays = (arr1, arr2) => {
  const maxLength = Math.max(arr1.length, arr2.length)
  const arr = Array(maxLength).fill()
  return arr.map((v, i) => (arr1[i] !== undefined ? arr1[i] : arr2[i]))
}

const handleActions = (handlers, ...defaultArgs) => (...args) => {
  args = combineArrays(args, defaultArgs)

  let action = findAction(args)

  if (!action || !handlers[action.type]) return args[0]
  return handlers[action.type](...args)
}

export default handleActions
