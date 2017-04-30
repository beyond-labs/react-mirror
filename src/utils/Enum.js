export const Enum = (arr, mapper) => {
  let keys;

  if (arr instanceof Array) {
    if (typeof mapper === 'string') {
      const _mapper = mapper;
      mapper = value => value[_mapper];
    }

    keys = [];
    arr = arr.slice();

    arr.forEach((value, i) => {
      const key = mapper(value, i);
      keys.push(key);
      arr[key] = arr[i];
    });
  } else {
    keys = Object.keys(arr);
    arr = Object.assign([], arr);
    keys.forEach((key, i) => {
      arr[i] = arr[key];
    });
  }

  const methods = {};

  const methodNames = ['every', 'find', 'findIndex', 'forEach', 'some'];
  methodNames.forEach(name => {
    methods[name] = arr[name].bind(arr);
    arr[name] = f =>
      methods[name]((value, index, arr) => f(value, index, keys[index], arr));
  });

  const reduceMethodNames = ['reduce', 'reduceRight'];
  reduceMethodNames.forEach(name => {
    methods[name] = arr[name].bind(arr);
    arr[name] = f =>
      methods[name]((v, pv, index, arr) => f(v, pv, index, keys[index], arr));
  });

  const map = arr.map.bind(arr);
  arr.map = f =>
    new Enum(map((value, index, arr) => f(value, index, arr, keys[index])));

  arr.filter = f => {
    const values = [];
    const keys = [];
    arr.forEach((value, index, key) => {
      if (f(value, index, key)) {
        values.push(value);
        keys.push(key);
      }
    });
    return new Enum(values, (v, i) => keys[i]);
  };

  Object.freeze(arr);

  return arr;
};
