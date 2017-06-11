import createEventSource from '../utils/streams/eventSource'

const createScheduler = () => {
  const samplers = {}
  let buffer = {}
  let BUFFERING = false
  return {
    addStream(priority, id, $stream) {
      samplers[id] = createEventSource()

      return $stream
        .tap(evt => {
          buffer[id] = evt
          if (!BUFFERING) {
            BUFFERING = true
            setTimeout(() => {
              Object.keys(buffer).forEach(id => samplers[id] && samplers[id].push(true))
              BUFFERING = false
              buffer = {}
            })
          }
        })
        .sampleWith(samplers[id].$stream)
    },
    removeStream(id) {
      delete samplers[id]
      delete buffer[id]
    }
  }
}

const scheduler = createScheduler()
export default scheduler
