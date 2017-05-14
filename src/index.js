import 'regenerator-runtime/runtime'
import MirrorBackend from './backend'
import Mirror from './bindings'
import combine from './utils/streams/combine'
import combineActionsWith from './utils/streams/combineActionsWith'
import combineNested from './utils/streams/combineNested'
import combineSimple from './utils/streams/combineSimple'

const {addStore, removeStore, updateStore} = MirrorBackend

export {addStore, removeStore, updateStore}
export {combine, combineActionsWith, combineNested, combineSimple}
export default Mirror
