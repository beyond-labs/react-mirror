/*
  Store ids should:

    * Be easy to read / recognise
    * Not conflict with filters
    * Communicate how many components have been mounted during session
*/
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const counter = [0, -1]

const generateStoreId = () => {
  for (let i = counter.length - 1; i >= 0; i--) {
    if (counter[i] === 25) {
      counter[i] = 0
      if (!i) counter.unshift(0)
    } else {
      counter[i] += 1
      break
    }
  }
  return counter.map(char => ALPHABET[char]).join('')
}

export const couldBeStoreId = RegExp.prototype.test.bind(/^[A-Z]{2,12}$/)

export default generateStoreId
