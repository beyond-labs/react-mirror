import * as most from 'most'
import Enum from '../Enum'

const combine = (...streams) => {
  if (streams[0] instanceof Array) streams = streams[0]
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

export default combine
