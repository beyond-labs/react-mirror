import * as most from 'most'

const eventSource = () => {
  let buffer = []
  let resolve
  let push = event => {
    if (resolve) {
      resolve(event)
      resolve = null
    } else {
      buffer.push(event)
    }
  }
  const setResolve = r => (resolve = r)
  function* eventGenerator() {
    while (true) {
      if (buffer.length) yield Promise.resolve(buffer.shift())
      else yield new Promise(setResolve)
    }
  }
  return {
    push,
    end: () => eventGenerator.return(),
    $stream: most.generate(eventGenerator)
  }
}

export default eventSource
