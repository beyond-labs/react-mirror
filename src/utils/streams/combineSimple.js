import * as most from 'most'

const combineSimple = (...streams) => {
  if (streams[0] instanceof Array) streams = streams[0]
  return most.combineArray((...values) => [...values], streams)
}

export default combineSimple
