import * as most from 'most'

const eventSource = () => {
  let syncBuffer = []
  let push = event => syncBuffer.push(event)
  function* eventGenerator() {
    while (syncBuffer.length) {
      yield Promise.resolve(syncBuffer.shift())
    }
    const setPush = resolve => (push = resolve)
    while (true) {
      yield new Promise(setPush)
    }
  }
  return {
    push: event => push(event),
    end: () => eventGenerator.return(),
    $stream: most.from(eventGenerator())
  }
}

export default eventSource
