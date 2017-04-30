import {combine} from 'most';

export const combineSimple = combine.bind(null, (...values) => [...values]);
export default combineSimple;
