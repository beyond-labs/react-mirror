import most from 'most'

export const combineSimple = most.combine.bind(null, (...values) => [...values])
export default combineSimple
