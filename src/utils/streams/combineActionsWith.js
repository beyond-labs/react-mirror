import {map, filter, sample, combine, loop} from 'most'

const SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__'

const combineActionsWithDefault = (actionStream, otherStream) => {
  let combinedStream = combine((action, other) => ({action, other}))
  combinedStream = loop(
    ({prevAction, before}, {action, other: after}) => ({
      seed: {
        prevAction: action,
        before: prevAction === action ? SKIP_TOKEN : after
      },
      value: before === SKIP_TOKEN ? {before, action, after} : SKIP_TOKEN
    }),
    {},
    combinedStream
  )
  return filter(value => value !== SKIP_TOKEN, combinedStream)
}

const combineActionsWithBefore = (actionStream, otherStream) => {
  return sample((action, other) => ({before: other, action}), actionStream, otherStream)
}

const combineActionsWithAfter = (actionStream, otherStream) => {
  map(value => {
    delete value.before
    return value
  }, combineActionsWithDefault(actionStream, otherStream))
}

const combineActionsWithNothing = actionStream => {
  return map(actionStream, action => ({action}))
}

export const combineActionsWith = (
  actionStream,
  otherStream,
  options = {before: true, after: true}
) => {
  if (options.before && options.after) {
    return combineActionsWithDefault(actionStream, otherStream)
  } else if (options.before) {
    return combineActionsWithBefore(actionStream, otherStream)
  } else if (options.after) {
    return combineActionsWithAfter(actionStream, otherStream)
  }

  return combineActionsWithNothing(actionStream)
}

export default combineActionsWith
