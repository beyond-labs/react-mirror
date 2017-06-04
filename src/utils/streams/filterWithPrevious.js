const SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__'

const filterWithPreviousBase = (reverse, f, $stream) => {
  return $stream
    .loop((prevValue, value) => {
      let include = f(prevValue, value)
      if (reverse) include = !reverse
      if (include) return {seed: value, value}
      return {seed: value, value: SKIP_TOKEN}
    }, undefined)
    .filter(value => value !== SKIP_TOKEN)
}

const filterUnchanged = filterWithPreviousBase.bind(null, true)
const filterWithPrevious = filterWithPreviousBase.bind(null, false)

const keyArrayEqual = ({oldKeyArray, oldKeySet}, keyArray) => {
  if (oldKeyArray === keyArray) return true
  if (oldKeyArray === undefined) return false

  for (let i in keyArray) {
    if (!oldKeySet.has(keyArray[i])) return false
  }

  return keyArray.length === oldKeyArray.length
}

const filterUnchangedKeyArrays = $stream => {
  return $stream
    .loop((seed, keyArray) => {
      let isEqual = keyArrayEqual(seed, keyArray)
      if (isEqual) return {seed, value: SKIP_TOKEN}
      return {
        seed: {oldKeyArray: keyArray, oldKeySet: new Set(keyArray)},
        value: keyArray
      }
    }, {})
    .filter(value => value !== SKIP_TOKEN)
}

export {filterUnchanged, filterUnchangedKeyArrays}
export default filterWithPrevious
