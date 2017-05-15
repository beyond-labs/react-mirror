import * as most from 'most'
import Enum from '../Enum'

const SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__'

/*
  Combines streams of normal values into a stream of Enums

  Emits values immediately, w/o waiting for input streams to emit their first value
*/
const combineEnum = (streams, ids) => {
  if (!streams.length) return most.of(new Enum())
  return most.combineArray(
    (...values) => {
      const result = {}
      values.forEach((value, i) => {
        if (value !== SKIP_TOKEN) result[ids[i]] = value
      })
      return new Enum(result)
    },
    streams.map($stream => {
      const $start = most.of([SKIP_TOKEN]).until($stream)
      return $start.concat($stream)
    })
  )
}

export default combineEnum
