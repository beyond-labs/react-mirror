const hasOwn = Object.prototype.hasOwnProperty;

export const shallowEqual = (a, b) => {
  if (a === b) return true;

  let countA = 0;
  let countB = 0;

  /* eslint-disable prefer-const */
  for (let key in a) {
    if (hasOwn.call(a, key) && a[key] !== b[key]) return false;
    countA++;
  }

  for (let key in b) {
    if (hasOwn.call(b, key)) countB++;
  }
  /* eslint-enable prefer-const */

  return countA === countB;
};

export default shallowEqual;
