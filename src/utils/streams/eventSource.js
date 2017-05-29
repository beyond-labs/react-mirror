import * as most from 'most'

const eventSource = () => {
  let buffer = []
  let next
  let push = event => {
    if (next) {
      next(event)
      next = null
    } else {
      buffer.push(event)
    }
  }
  const setResolve = (resolve, reject) => (next = resolve)
  function* eventGenerator() {
    while (true) {
      if (buffer.length) yield Promise.resolve(buffer.shift())
      else yield new Promise(setResolve)
    }
  }
  return {
    push,
    $stream: most.generate(eventGenerator)
  }
}

export default eventSource
