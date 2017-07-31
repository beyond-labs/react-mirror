import * as most from 'most'
import invariant from 'invariant'

const SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__'

const combineEventsWithDefault = (eventStream, otherStream) => {
  return most
    .combine((event, other) => ({event, other}), eventStream, otherStream)
    .loop(
      ({prevAction, before}, {event, other: after}) => ({
        seed: {
          prevAction: event,
          before: prevAction === event ? SKIP_TOKEN : after
        },
        value: before === SKIP_TOKEN ? SKIP_TOKEN : {before, event, after}
      }),
      {}
    )
    .filter(value => value !== SKIP_TOKEN)
}

const combineEventsWithBefore = (eventStream, otherStream) => {
  return eventStream.sample((event, other) => ({before: other, event}), otherStream)
}

const combineEventsWithAfter = (eventStream, otherStream) => {
  return combineEventsWithDefault(eventStream, otherStream).map(value => {
    delete value.before
    return value
  })
}

const combineEventsWithNothing = eventStream => {
  return eventStream.map(event => ({event}))
}

const combineEventsWith = (
  eventStream,
  otherStream,
  options = {before: true, after: true}
) => {
  invariant(
    eventStream && otherStream && eventStream.subscribe && otherStream.subscribe,
    '`combineEventsWith` only accepts streams'
  )
  if (options.before && options.after) {
    return combineEventsWithDefault(eventStream, otherStream)
  } else if (options.before) {
    return combineEventsWithBefore(eventStream, otherStream)
  } else if (options.after) {
    return combineEventsWithAfter(eventStream, otherStream)
  }

  return combineEventsWithNothing(eventStream)
}

export default combineEventsWith
