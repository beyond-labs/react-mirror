import * as most from 'most'
import invariant from 'invariant'
import Enum from '../Enum'

const combineNested = streamMap => {
  const keys = Object.keys(streamMap)
  const streams = keys.map(key => streamMap[key])
  invariant(
    streams.every($stream => $stream && $stream.subscribe),
    '`combine` only accepts streams'
  )
  return most.combineArray((...enumCollection) => {
    const result = {}
    enumCollection.forEach(_enum_ => {
      _enum_.forEach((value, i, key) => {
        if (!result[key]) result[key] = {}
        result[key][keys[i]] = value
      })
    })
    return new Enum(result)
  }, streams)
}

export default combineNested
