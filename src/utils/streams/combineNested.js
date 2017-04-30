import {combine as combineMost} from 'most';
import Enum from '../Enum';

export const combineNested = streamMap => {
  const keys = Object.keys(streamMap);
  const streams = keys.map(key => streamMap[key]);
  return combineMost((...enumCollection) => {
    const result = {};
    enumCollection.forEach(_enum_ => {
      _enum_.forEach((value, i, key) => {
        if (!result[key]) result[key] = result[key];
        result[key][keys[i]] = value;
      });
    });
    return new Enum(result);
  }, ...streams);
};

export default combine;
