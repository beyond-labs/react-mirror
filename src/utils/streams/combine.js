import {combine as combineMost} from 'most'
import Enum from '../Enum'

export const combine = (...streams) => {
  return combineMost((...enumCollection) => {
    const result = {}
    enumCollection.forEach(_enum_ => {
      _enum_.forEach((value, i, key) => {
        result[key] = value
      })
    })
    return new Enum(result)
  }, ...streams)
}

export default combine
