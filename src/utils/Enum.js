export class Enum extends Array {
  constructor(obj) {
    const keys = Object.keys(obj)
    const values = keys.map(key => obj[key])
    super(...values)
    this.keys = keys
    keys.forEach(key => (this[key] = obj[key]))
  }
  map(f) {
    const obj = {}
    this.forEach((value, index, key, arr) => {
      obj[key] = f(value, index, key, arr)
    })
    return new Enum(obj)
  }
  filter(f) {
    const obj = {}
    this.forEach((value, index, key, arr) => {
      if (f(value, index, key, arr)) {
        obj[key] = value
      }
    })
    return new Enum(obj)
  }
  forEach(f) {
    return super.forEach((value, index, arr) => f(value, index, this.keys[index], arr))
  }
  every(f) {
    return super.every((value, index, arr) => f(value, index, this.keys[index], arr))
  }
  find(f) {
    return super.find((value, index, arr) => f(value, index, this.keys[index], arr))
  }
  findIndex(f) {
    return super.findIndex((value, index, arr) => f(value, index, this.keys[index], arr))
  }
  some(f) {
    return super.some((value, index, arr) => f(value, index, this.keys[index], arr))
  }
  reduce(f) {
    return super.reduce((prev, value, index, arr) =>
      f(prev, value, index, this.keys[index], arr)
    )
  }
  reduceRight(f) {
    return super.reduceRight((prev, value, index, arr) =>
      f(prev, value, index, this.keys[index], arr)
    )
  }
}

export default Enum
