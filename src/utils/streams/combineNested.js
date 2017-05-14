import * as most from 'most'
import Enum from '../Enum'

const combineNested = streamMap => {
  const keys = Object.keys(streamMap)
  const streams = keys.map(key => streamMap[key])
  return most.combine((...enumCollection) => {
    const result = {}
    enumCollection.forEach(_enum_ => {
      _enum_.forEach((value, i, key) => {
        if (!result[key]) result[key] = result[key]
        result[key][keys[i]] = value
      })
    })
    return new Enum(result)
  }, ...streams)
}

export default combineNested
