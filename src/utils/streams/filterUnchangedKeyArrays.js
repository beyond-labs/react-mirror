const SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__'

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

export default filterUnchangedKeyArrays
