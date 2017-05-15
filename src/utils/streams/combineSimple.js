import * as most from 'most'

const combineSimple = (...streams) => most.combineArray(values => [...values], streams)

export default combineSimple
