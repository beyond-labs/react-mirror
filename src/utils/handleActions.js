import traverse from './traverseBreadthFirst';

const combineArrays = (arr1, arr2) => {
  const maxLength = Math.max(arr1.length, arr2.length);
  const arr = Array(maxLength).fill();
  return arr.map((v, i) => (arr1[i] !== undefined ? arr1[i] : arr2[i]));
};

export const handleActions = (handlers, ...defaultArgs) => (...args) => {
  args = combineArrays(args, defaultArgs);

  let action;
  traverse(
    args,
    (node, stop) => {
      if (
        node && typeof node.hasOwnProperty('type') && node.hasOwnProperty('payload') && typeof node.store === 'string'
      ) {
        action = node;
        stop();
      }
    },
    {reverse: true}
  );

  if (!action || !handlers[action.type]) return args[0];
  return handleActions[action.type](...args);
};
