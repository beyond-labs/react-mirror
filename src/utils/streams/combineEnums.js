import * as most from 'most'
import invariant from 'invariant'
import Enum from '../Enum'

const combineEnums = (...streams) => {
  if (streams[0] instanceof Array) streams = streams[0]
  invariant(
    streams.every($stream => $stream && $stream.subscribe),
    '`combineEnums` only accepts streams'
  )
  return most.combineArray((...enumCollection) => {
    const result = {}
    enumCollection.forEach(_enum_ => {
      _enum_.forEach((value, i, key) => {
        result[key] = value
      })
    })
    return new Enum(result)
  }, streams)
}

export default combineEnums
