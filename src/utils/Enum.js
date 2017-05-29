class Enum extends Array {
  constructor(obj = {}) {
    const keys = Object.keys(obj)
    const values = keys.map(key => obj[key])
    super()
    super.push(...values)
    Object.defineProperty(this, 'keys', {value: keys})
    Object.defineProperty(this, 'indexes', {
      value: new Array(values.length).fill().map((v, i) => i)
    })
    keys.forEach(key => Object.defineProperty(this, key, {value: obj[key]}))
  }
  map(f) {
    const obj = {}
    this.forEach(function map(value, index, key, arr) {
      obj[key] = f(value, index, key, arr)
    })
    return new Enum(obj)
  }
  filter(f) {
    const obj = {}
    this.forEach(function filter(value, index, key, arr) {
      if (f(value, index, key, arr)) {
        obj[key] = value
      }
    })
    return new Enum(obj)
  }
  forEach(f) {
    return super.forEach(function forEach(value, index, arr) {
      return f(value, index, this.keys[index], arr)
    })
  }
  every(f) {
    return super.every(function every(value, index, arr) {
      return f(value, index, this.keys[index], arr)
    })
  }
  find(f) {
    return super.find(function find(value, index, arr) {
      return f(value, index, this.keys[index], arr)
    })
  }
  findIndex(f) {
    return super.findIndex(function findIndex(value, index, arr) {
      return f(value, index, this.keys[index], arr)
    })
  }
  some(f) {
    return super.some(function some(value, index, arr) {
      return f(value, index, this.keys[index], arr)
    })
  }
  reduce(f) {
    return super.reduce(function reduce(prev, value, index, arr) {
      return f(prev, value, index, this.keys[index], arr)
    })
  }
  reduceRight(f) {
    return super.reduceRight(function reduceRight(prev, value, index, arr) {
      return f(prev, value, index, this.keys[index], arr)
    })
  }
}

export default Enum
