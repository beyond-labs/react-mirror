import * as most from 'most'

const combineSimple = most.combine.bind(null, (...values) => [...values])

export default combineSimple
