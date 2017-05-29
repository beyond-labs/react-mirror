import * as most from 'most'

const SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__'

const combineActionsWithDefault = (actionStream, otherStream) => {
  return most
    .combine((action, other) => ({action, other}))
    .loop(
      ({prevAction, before}, {action, other: after}) => ({
        seed: {
          prevAction: action,
          before: prevAction === action ? SKIP_TOKEN : after
        },
        value: before === SKIP_TOKEN ? {before, action, after} : SKIP_TOKEN
      }),
      {}
    )
    .filter(value => value !== SKIP_TOKEN)
}

const combineActionsWithBefore = (actionStream, otherStream) => {
  return actionStream.sample((action, other) => ({before: other, action}), otherStream)
}

const combineActionsWithAfter = (actionStream, otherStream) => {
  return combineActionsWithDefault(actionStream, otherStream).map(value => {
    delete value.before
    return value
  })
}

const combineActionsWithNothing = actionStream => {
  return actionStream.map(action => ({action}))
}

const combineActionsWith = (
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
