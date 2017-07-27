import * as most from 'most'
import invariant from 'invariant'

const combine = (...streams) => {
  if (streams[0] instanceof Array) streams = streams[0]
  invariant(
    streams.every($stream => $stream && $stream.subscribe),
    '`combine` only accepts streams'
  )
  return most.combineArray((...values) => [...values], streams)
}

export default combine
