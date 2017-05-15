import 'regenerator-runtime/runtime'
import MirrorBackend from './backend'
import Mirror from './bindings'
import Enum from './utils/Enum'
import handleActions from './utils/handleActions'
import shallowEqual from './utils/shallowEqual'
import combine from './utils/streams/combine'
import combineActionsWith from './utils/streams/combineActionsWith'
import combineNested from './utils/streams/combineNested'
import combineSimple from './utils/streams/combineSimple'
import filterUnchanged from './utils/streams/filterUnchanged'

const {addStore, removeStore, updateStore} = MirrorBackend

export {addStore, removeStore, updateStore}
export {handleActions, Enum, shallowEqual}
export {combine, combineActionsWith, combineNested, combineSimple, filterUnchanged}
export default Mirror
