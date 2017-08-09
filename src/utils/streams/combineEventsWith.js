import invariant from 'invariant'

const combineEventsWithDefault = (eventStream, otherStream) => {
  otherStream = otherStream.scan(([, before], after) => [before, after], []).multicast()
  return otherStream
    .sample(
      (event, [before, after]) => ({before, event, after}),
      eventStream,
      otherStream
    )
    .skipRepeatsWith((a, b) => a.event === b.event)
}

const combineEventsWithBefore = (eventStream, otherStream) => {
  return eventStream.sample(
    (event, other) => ({before: other, event}),
    eventStream,
    otherStream
  )
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
