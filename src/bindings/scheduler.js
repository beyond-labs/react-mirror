import createEventSource from '../utils/streams/eventSource'

const createScheduler = () => {
  const samplers = []
  let BUFFERING = false
  return {
    addStream(priority, $stream) {
      if (!samplers[priority]) {
        samplers[priority] = createEventSource()
        samplers[priority].$stream = samplers[priority].$stream.multicast()
      }

      return $stream
        .tap(evt => {
          if (!BUFFERING) {
            BUFFERING = true
            setTimeout(() => {
              BUFFERING = false
              samplers.forEach(sampler => sampler.push(true))
            })
          }
        })
        .sampleWith(samplers[priority].$stream)
        .skipRepeats()
    }
  }
}

const scheduler = createScheduler()
export default scheduler
