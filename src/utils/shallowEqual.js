const hasOwn = Object.prototype.hasOwnProperty

const shallowEqual = (a, b) => {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || !a !== !b) return false

  let countA = 0
  let countB = 0

  for (let key in a) {
    if (hasOwn.call(a, key) && a[key] !== b[key]) return false
    countA++
  }

  for (let key in b) {
    if (hasOwn.call(b, key)) countB++
  }

  return countA === countB
}

export default shallowEqual
