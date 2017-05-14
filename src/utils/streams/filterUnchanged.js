import most from 'most'

const SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__'

export const filterUnchanged = (equalityCheck, $stream) => {
  return $stream
    .loop((prevValue, value) => {
      const isEqual = equalityCheck(prevValue, value)
      if (isEqual) return {seed: value, value: SKIP_TOKEN}
      return {seed: value, value}
    }, undefined)
    .filter(value => value !== SKIP_TOKEN, newStream)
}

const keyArrayEqual = ({oldKeyArray, oldKeySet}, keyArray) => {
  if (oldKeyArray === keyArray) return true

  for (let i in keyArray) {
    if (!oldKeySet.has(keyArray[i])) return false
  }

  return keyArray.length === oldKeyArray.length
}

export const filterUnchangedKeyArrays = $stream => {
  return $stream
    .loop(
      (seed, keyArray) => {
        let isEqual = keyArrayEqual(seed, keyArray)
        if (isEqual) return {seed, value: SKIP_TOKEN}
        return {
          seed: {oldKeyArray: keyArray, oldKeySet: new Set(keyArray)},
          value: keyArray
        }
      },
      {oldKeyArray: [], oldKeySet: new Set()}
    )
    .filter(value => value !== SKIP_TOKEN)
}

export default filterUnchanged
