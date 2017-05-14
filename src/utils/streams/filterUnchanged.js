import {loop, filter} from 'most'

const SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__'

export const filterUnchanged = (equalityCheck, $stream) => {
  const newStream = loop(
    (prevValue, value) => {
      const isEqual = equalityCheck(prevValue, value)
      if (isEqual) return {seed: value, value: SKIP_TOKEN}
      return {seed: value, value}
    },
    undefined,
    $stream
  )
  return filter(value => value !== SKIP_TOKEN, newStream)
}

const keyArrayEqual = ({oldKeyArray, oldKeySet}, keyArray) => {
  if (oldKeyArray === keyArray) return true

  for (let i in keyArray) {
    if (!oldKeySet.has(keyArray[i])) return false
  }

  return keyArray.length === oldKeyArray.length
}

export const filterUnchangedKeyArrays = $stream => {
  const newStream = loop(
    (seed, keyArray) => {
      let isEqual = keyArrayEqual(seed, keyArray)
      if (isEqual) return {seed, value: SKIP_TOKEN}
      return {
        seed: {oldKeyArray: keyArray, oldKeySet: new Set(keyArray)},
        value: keyArray
      }
    },
    {oldKeyArray: [], oldKeySet: new Set()},
    $stream
  )
  return filter(value => value !== SKIP_TOKEN, newStream)
}

export default filterUnchanged
