import 'regenerator-runtime/runtime'
import MirrorBackend from './backend'
import Mirror from './bindings'
import Enum from './utils/Enum'
import handleActions from './utils/handleActions'
import shallowEqual from './utils/shallowEqual'
import combine from './utils/streams/combine'
import combineEventsWith from './utils/streams/combineEventsWith'
import combineNested from './utils/streams/combineNested'
import combineSimple from './utils/streams/combineSimple'

const {addStore, removeStore, updateStore, query, root, stores} = MirrorBackend

export {addStore, removeStore, updateStore, query, root, stores}
export {handleActions, Enum, shallowEqual}
export {combine, combineEventsWith, combineNested, combineSimple}
export default Mirror
