export const setPure = (obj = {}, path, value) => {
  if (typeof path === 'string') path = path.split('.')
  if (path.length === 0) return value
  if (obj instanceof Array) {
    obj = obj.slice()
    obj[path[0]] = setPure(obj[path[0]], path.slice(1), value)
  }
  else {
    obj = Object.assign({}, obj, {[path[0]]: setPure(obj[path[0]], path.slice(1), value)})
  }
  return obj
}

export default setPure
