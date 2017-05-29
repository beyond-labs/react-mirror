'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('regenerator-runtime/runtime');
var most = require('most');
var invariant = _interopDefault(require('invariant'));
var warning = _interopDefault(require('warning'));
var React = _interopDefault(require('react'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};









var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

















var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var traverse = function traverse(tree, onVisit) {
  var q = [tree];

  while (q.length) {
    var node = q.shift();
    q.push.apply(q, toConsumableArray(Object.values(node.children)));
    onVisit(node);
  }
};

var getChildren = function getChildren(node) {
  var children = [];
  traverse(node, function (node) {
    return children.push(node);
  });
  return children;
};

var getParents = function getParents(node) {
  var parents = [];
  while (node.parent) {
    node = node.parent;
    parents.push(node);
  }
  return parents;
};

var testFilter = function testFilter(node, filter) {
  if (!filter || filter === node.id || filter === node.component || node.identifiers.includes(filter)) {
    return true;
  }
  return false;
};

var runQuery = function runQuery(tree, originIds, query) {
  if (!query.length) return originIds;

  var operator = void 0;var _query = query;

  var _query2 = toArray(_query);

  operator = _query2[0];
  query = _query2.slice(1);


  if (operator.op === 'root') return runQuery(tree, [tree.id], query);

  var originNodes = [];
  traverse(tree, function (node) {
    if (originIds.includes(node.id)) {
      originNodes.push(node);
    }
  });

  var result = function () {
    var _ref;

    var result = originNodes.map(function (node) {
      var getMatches = operator.op === 'children' ? getChildren : getParents;
      var matches = getMatches(node);
      matches = matches.filter(function (node) {
        return testFilter(node, operator.filter);
      });
      matches = matches.slice(0, operator.maxStores);
      matches = matches.map(function (node) {
        return node.id;
      });
      return matches;
    });
    result = (_ref = []).concat.apply(_ref, toConsumableArray(result));
    result = Array.from(new Set(result));
    return result;
  }();

  return runQuery(tree, result, query);
};

var createCursorBackend$1 = function createCursorBackend() {
  var prevTree = void 0;

  return {
    query: function query(origin, _query3) {
      return runQuery(prevTree, [origin], _query3);
    },
    updateNode: function updateNode(tree, op) {
      prevTree = tree;
      var results = {};
      traverse(tree, function (node) {
        results[node.id] = node.queries.map(function (query) {
          return runQuery(tree, [node.id], query);
        });
      });
      return results;
    }
  };
};

var createCursorAPI = function createCursorAPI(enhancer) {
  var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var cursorMethods = {
    root: function root() {
      var newQuery = [{ op: 'root' }];
      return createCursorAPI(enhancer, newQuery);
    },
    parents: function parents() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var maxStores = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter);
      var newQuery = query.concat({ op: 'parents', filter: filter, maxStores: maxStores });
      return createCursorAPI(enhancer, newQuery);
    },
    children: function children() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var maxStores = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter);
      var newQuery = query.concat({ op: 'children', filter: filter, maxStores: maxStores });
      return createCursorAPI(enhancer, newQuery);
    },
    all: function all() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var maxStores = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter);
      var newQuery = [{ op: 'root' }, { op: 'children', filter: filter, maxStores: maxStores }];
      return createCursorAPI(enhancer, newQuery);
    },
    one: function one() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter);
      var newQuery = [{ op: 'root' }, { op: 'children', filter: filter, maxStores: 1 }];
      return createCursorAPI(enhancer, newQuery);
    },
    parent: function parent() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter);
      var newQuery = query.concat({ op: 'parents', filter: filter, maxStores: 1 });
      return createCursorAPI(enhancer, newQuery);
    },
    child: function child() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      filter = filter && (filter.__COMPONENT_IDENTIFIER__ || filter);
      var newQuery = query.concat({ op: 'children', filter: filter, maxStores: 1 });
      return createCursorAPI(enhancer, newQuery);
    }
  };
  return enhancer(cursorMethods, query);
};

/*
  Store ids should:

    * Be easy to read / recognise
    * Not conflict with filters
    * Communicate how many components have been mounted during session
*/
var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var counter = [0, -1];

var generateStoreId = function generateStoreId() {
  for (var i = counter.length - 1; i >= 0; i--) {
    if (counter[i] === 25) {
      counter[i] = 0;
      if (!i) counter.unshift(0);
    } else {
      counter[i] += 1;
      break;
    }
  }
  return '$' + counter.map(function (char) {
    return ALPHABET[char];
  }).join('');
};

var couldBeStoreId = RegExp.prototype.test.bind(/^\$[A-Z]{2,12}$/);

var Enum = function (_Array) {
  inherits(Enum, _Array);

  function Enum() {
    var _babelHelpers$get;

    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Enum);

    var keys = Object.keys(obj);
    var values = keys.map(function (key) {
      return obj[key];
    });

    var _this = possibleConstructorReturn(this, (Enum.__proto__ || Object.getPrototypeOf(Enum)).call(this));

    (_babelHelpers$get = get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), 'push', _this)).call.apply(_babelHelpers$get, [_this].concat(toConsumableArray(values)));
    Object.defineProperty(_this, 'keys', { value: keys });
    Object.defineProperty(_this, 'indexes', {
      value: new Array(values.length).fill().map(function (v, i) {
        return i;
      })
    });
    keys.forEach(function (key) {
      return Object.defineProperty(_this, key, { value: obj[key] });
    });
    return _this;
  }

  createClass(Enum, [{
    key: 'map',
    value: function map(f) {
      var obj = {};
      this.forEach(function map(value, index, key, arr) {
        obj[key] = f(value, index, key, arr);
      });
      return new Enum(obj);
    }
  }, {
    key: 'filter',
    value: function filter(f) {
      var obj = {};
      this.forEach(function filter(value, index, key, arr) {
        if (f(value, index, key, arr)) {
          obj[key] = value;
        }
      });
      return new Enum(obj);
    }
  }, {
    key: 'forEach',
    value: function forEach(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), 'forEach', this).call(this, function forEach(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: 'every',
    value: function every(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), 'every', this).call(this, function every(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: 'find',
    value: function find(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), 'find', this).call(this, function find(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: 'findIndex',
    value: function findIndex(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), 'findIndex', this).call(this, function findIndex(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: 'some',
    value: function some(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), 'some', this).call(this, function some(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: 'reduce',
    value: function reduce(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), 'reduce', this).call(this, function reduce(prev, value, index, arr) {
        return f(prev, value, index, this.keys[index], arr);
      });
    }
  }, {
    key: 'reduceRight',
    value: function reduceRight(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), 'reduceRight', this).call(this, function reduceRight(prev, value, index, arr) {
        return f(prev, value, index, this.keys[index], arr);
      });
    }
  }]);
  return Enum;
}(Array);

var SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__';

/*
  Combines streams of normal values into a stream of Enums

  Emits values immediately, w/o waiting for input streams to emit their first value
*/
var combineEnum = function combineEnum(streams, ids) {
  if (!streams.length) return most.of(new Enum());
  return most.combineArray(function () {
    for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
      values[_key] = arguments[_key];
    }

    var result = {};
    values.forEach(function (value, i) {
      if (value !== SKIP_TOKEN) result[ids[i]] = value;
    });
    return new Enum(result);
  }, streams.map(function ($stream) {
    var $start = most.of(SKIP_TOKEN).until($stream);
    return $start.concat($stream);
  }));
};

var eventSource$1 = function eventSource() {
  var _marked = [eventGenerator].map(regeneratorRuntime.mark);

  var buffer = [];
  var next = void 0;
  var push = function push(event) {
    if (next) {
      next(event);
      next = null;
    } else {
      buffer.push(event);
    }
  };
  var setResolve = function setResolve(resolve, reject) {
    return next = resolve;
  };
  function eventGenerator() {
    return regeneratorRuntime.wrap(function eventGenerator$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            

            if (!buffer.length) {
              _context.next = 6;
              break;
            }

            _context.next = 4;
            return Promise.resolve(buffer.shift());

          case 4:
            _context.next = 8;
            break;

          case 6:
            _context.next = 8;
            return new Promise(setResolve);

          case 8:
            _context.next = 0;
            break;

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _marked[0], this);
  }
  return {
    push: push,
    $stream: most.generate(eventGenerator)
  };
};

var SKIP_TOKEN$1 = '__MIRROR_SKIP_TOKEN__';

var filterUnchanged = function filterUnchanged(equalityCheck, $stream) {
  return $stream.loop(function (prevValue, value) {
    var isEqual = equalityCheck(prevValue, value);
    if (isEqual) return { seed: value, value: SKIP_TOKEN$1 };
    return { seed: value, value: value };
  }, undefined).filter(function (value) {
    return value !== SKIP_TOKEN$1;
  });
};

var keyArrayEqual = function keyArrayEqual(_ref, keyArray) {
  var oldKeyArray = _ref.oldKeyArray,
      oldKeySet = _ref.oldKeySet;

  if (oldKeyArray === keyArray) return true;
  if (oldKeyArray === undefined) return false;

  for (var i in keyArray) {
    if (!oldKeySet.has(keyArray[i])) return false;
  }

  return keyArray.length === oldKeyArray.length;
};

var filterUnchangedKeyArrays = function filterUnchangedKeyArrays($stream) {
  return $stream.loop(function (seed, keyArray) {
    var isEqual = keyArrayEqual(seed, keyArray);
    if (isEqual) return { seed: seed, value: SKIP_TOKEN$1 };
    return {
      seed: { oldKeyArray: keyArray, oldKeySet: new Set(keyArray) },
      value: keyArray
    };
  }, {}).filter(function (value) {
    return value !== SKIP_TOKEN$1;
  });
};

var createMirrorBackend = function createMirrorBackend() {
  var root = void 0;
  var storeMap = {};
  var cursorBackend = createCursorBackend$1();

  var _createEventSource = eventSource$1(),
      onStoreUpdated = _createEventSource.push,
      $storeUpdated = _createEventSource.$stream;

  var $queryResults = $storeUpdated.map(function (_ref) {
    var store = _ref.store,
        op = _ref.op;

    return cursorBackend.updateNode(root, { path: store.path, op: op });
  }).multicast();

  var _updateStore = function _updateStore(store, _ref2) {
    var _ref2$requesting = _ref2.requesting,
        requesting = _ref2$requesting === undefined ? [] : _ref2$requesting,
        streams = _ref2.streams,
        _ref2$identifiers = _ref2.identifiers,
        identifiers = _ref2$identifiers === undefined ? [] : _ref2$identifiers,
        _ref2$metadata = _ref2.metadata,
        metadata = _ref2$metadata === undefined ? {} : _ref2$metadata;

    Object.assign(store, { identifiers: identifiers, metadata: metadata });

    invariant(!identifiers.some(couldBeStoreId), 'Cannot precede all-uppercase identifiers with "$" ("%s") because they could conflict with internally-used IDs', identifiers.find(couldBeStoreId));

    var $storeDeleted = $queryResults.filter(function () {
      return !storeMap[store.id];
    });

    var ADD_STREAMS_ASYNC = void 0;

    store.mirror = createCursorAPI(function (cursorMethods, query) {
      var cursor = {};
      requesting.concat('$actions').forEach(function (streamName) {
        Object.defineProperty(cursor, streamName, {
          get: function get() {
            var queryIndex = store.queries.length;
            store.queries.push(query);
            store.queryTypes.push(streamName);
            store.queryResults.push([]);
            if (ADD_STREAMS_ASYNC) {
              warning(false, 'Accessing "mirror.%s" after a store has been added is ineffcient, you can batch queries with `updateStore` to improve performance', streamName);
              onStoreUpdated({ store: store, op: 'update' });
            }

            return $queryResults.map(function (queryResults) {
              return queryResults[store.id] ? queryResults[store.id][queryIndex] : [];
            }).thru(filterUnchangedKeyArrays).map(function (stores) {
              store.queryResults[queryIndex] = stores;
              return (streamName === '$actions' ? most.mergeArray : combineEnum)(stores.map(function (id) {
                if (id === store.id && query.length && streamName === '$state') {
                  return undefined;
                }
                var $stream = storeMap[id] && storeMap[id].streams[streamName];
                if ($stream && storeMap[id] && storeMap[id].tails[streamName]) {
                  $stream = $stream.startWith(storeMap[id].tails[streamName]);
                }
                return $stream;
              }).filter(function (s) {
                return s;
              }), stores);
            }).switchLatest().until($storeDeleted);
          }
        });
      });
      Object.defineProperty(cursor, '$stores', {
        get: function get() {
          return $queryResults.map(function () {
            return {
              cursor: cursorBackend.query(store.id, query),
              store: store
            };
          }).until($storeDeleted);
        }
      });
      Object.assign(cursor, cursorMethods);
      return cursor;
    });

    store.dispatch = createCursorAPI(function (cursorMethods, query) {
      var dispatch = function dispatch(type, payload) {
        var retryIfSelectionEmpty = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        invariant(storeMap[store.id], 'Cannot dispatch actions ("%s") from a store ("%s") that does not exist', type, store.id);
        var stores = cursorBackend.query(store.id, query);
        if (stores.length || !retryIfSelectionEmpty) {
          stores.forEach(function (id) {
            storeMap[id] && storeMap[id].streams.$actions.push({ type: type, payload: payload, store: id });
          });
          return;
        }

        $queryResults.until($storeDeleted.tap(function () {
          warning(false, 'No store matched an action ("%s"), & the dispatcher ("%s") was removed. We\'ve discarded the action. You could try dispatching the action via a proxy.', type, store.id);
        })).map(function () {
          return cursorBackend.query(store.id, query);
        }).filter(function (stores) {
          return stores.length;
        }).take(1).observe(function (stores) {
          stores.forEach(function (id) {
            if (storeMap[id]) {
              storeMap[id].streams.$actions.push({ type: type, payload: payload, store: id });
            }
          });
        });
      };
      Object.assign(dispatch, cursorMethods);
      return dispatch;
    });

    if (!store.streams.$actions) {
      var _createEventSource2 = eventSource$1(),
          dispatch = _createEventSource2.push,
          $actions = _createEventSource2.$stream;

      store.streams.$actions = $actions.until($storeDeleted).multicast();
      store.streams.$actions.push = dispatch;
    }

    if (streams) {
      var _streams = streams(store.mirror, store.dispatch);
      Object.keys(_streams).forEach(function (streamName) {
        _streams[streamName] = _streams[streamName].tap(function (evt) {
          return store.tails[streamName] = evt;
        }).multicast();
      });
      store.streams = Object.assign(_streams, {
        $actions: store.streams.$actions
      });
    }

    ADD_STREAMS_ASYNC = true;
  };

  var backend = {
    addStore: function addStore(parentId, _ref3) {
      var requesting = _ref3.requesting,
          streams = _ref3.streams,
          identifiers = _ref3.identifiers,
          metadata = _ref3.metadata;

      if (!parentId) parentId = root && root.id;
      var parent = storeMap[parentId];
      invariant(parent || !root, 'Cannot add store as a child of "%s", because "%s" does not exist', parentId, parentId);

      var store = {
        id: generateStoreId(),
        path: root ? parent.path.concat(parentId) : [],
        streams: {},
        tails: {},
        queries: [],
        queryTypes: [],
        queryResults: [],
        children: {},
        parent: parent
      };

      if (store.parent) store.parent.children[store.id] = store;

      _updateStore(store, { requesting: requesting, streams: streams, identifiers: identifiers, metadata: metadata });
      storeMap[store.id] = store;
      onStoreUpdated({ store: store, op: 'add' });
      store.dispatch('INITIALIZE');

      return store;
    },
    removeStore: function removeStore(storeId) {
      var store = storeMap[storeId];
      if (!store) return;
      invariant(store !== root, 'Cannot remove root store');

      var traverse = function traverse(store) {
        Object.values(store.children).forEach(traverse);
        store.dispatch('TEARDOWN');
        delete storeMap[store.id];
        onStoreUpdated({ store: store, op: 'remove' });
      };
      traverse(store);

      if (store && store.parent) {
        delete store.parent.children[storeId];
      }
    },
    updateStore: function updateStore(storeId, _ref4) {
      var requesting = _ref4.requesting,
          streams = _ref4.streams,
          identifiers = _ref4.identifiers,
          metadata = _ref4.metadata;

      var store = storeMap[storeId];
      invariant(store, 'Cannot update a store ("%s") that does not exist', storeId);

      _updateStore(store, { requesting: requesting, streams: streams, identifiers: identifiers, metadata: metadata });
      onStoreUpdated({ store: store, op: 'update' });

      return store;
    },

    query: createCursorAPI(function (cursorMethods, query) {
      var runQuery = function runQuery() {
        return cursorBackend.query(root.id, query);
      };
      Object.assign(runQuery, cursorMethods);
      return runQuery;
    }),
    stores: storeMap
  };

  backend.root = root = backend.addStore(null, {
    identifiers: ['MIRROR/root'],
    metadata: { root: true }
  });

  return backend;
};

var MirrorBackend = createMirrorBackend();

var hasOwn = Object.prototype.hasOwnProperty;

var shallowEqual = function shallowEqual(a, b) {
  if (a === b) return true;
  if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== 'object' || (typeof b === 'undefined' ? 'undefined' : _typeof(b)) !== 'object' || !a !== !b) return false;

  var countA = 0;
  var countB = 0;

  for (var key in a) {
    if (hasOwn.call(a, key) && a[key] !== b[key]) return false;
    countA++;
  }

  for (var _key in b) {
    if (hasOwn.call(b, _key)) countB++;
  }

  return countA === countB;
};

var instantiseMapToProps = function instantiseMapToProps(mapToProps) {
  var CALLED_ONCE = void 0;
  var instantisedMapToProps = function instantisedMapToProps(state, props) {
    var result = mapToProps(state, props);
    if (!CALLED_ONCE && typeof result === 'function') {
      mapToProps = result;
      result = mapToProps(state, props);
    }
    CALLED_ONCE = true;
    return result;
  };
  return instantisedMapToProps;
};

function createMirrorDecorator() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function decorateWithMirror(WrappedComponent) {
    var _config$name = config.name,
        name = _config$name === undefined ? [] : _config$name,
        state = config.state,
        mapToProps = config.mapToProps,
        _config$pure = config.pure,
        pure = _config$pure === undefined ? true : _config$pure;

    if (!(name instanceof Array)) name = [name];
    if (typeof mapToProps !== 'function') {
      mapToProps = function mapToProps(state, _ref) {
        var withName = _ref.withName,
            props = objectWithoutProperties(_ref, ['withName']);
        return _extends({}, props, state);
      };
    }
    if (!pure) pure = {
      propsEqual: function propsEqual() {},
      stateEqual: function stateEqual() {},
      propsStateEqual: function propsStateEqual() {}
    };
    if (pure === true) pure = {};
    pure = Object.assign({
      propsEqual: shallowEqual,
      stateEqual: shallowEqual,
      propsStateEqual: shallowEqual
    }, pure);

    if (!WrappedComponent) {
      WrappedComponent = function Noop() {
        return null;
      };
    }
    var _name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    var stateless = !WrappedComponent.prototype.render;
    invariant(name.every(function (name) {
      return typeof name === 'string';
    }), '`name` should be a string or array of strings (at "%s")', _name);

    var getPropNames = function getPropNames() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (!(name instanceof Array)) name = [name];
      return name.filter(function (name) {
        return typeof name === 'string';
      }).sort();
    };

    var Mirror = function (_React$Component) {
      inherits(Mirror, _React$Component);

      function Mirror(props, context) {
        classCallCheck(this, Mirror);

        var _this = possibleConstructorReturn(this, (Mirror.__proto__ || Object.getPrototypeOf(Mirror)).call(this));

        _this.props = props;
        _this.state = { updateCount: 0, props: undefined };

        var _createEventSource = eventSource$1(),
            onReceivedProps = _createEventSource.push,
            $props = _createEventSource.$stream;

        Object.assign(_this, { onReceivedProps: onReceivedProps });

        var _MirrorBackend$addSto = MirrorBackend.addStore(context.id, {
          requesting: ['$state', '$props'],
          identifiers: [].concat(toConsumableArray(name), toConsumableArray(getPropNames(_this.props.withName)), [Mirror.__COMPONENT_IDENTIFIER__]),
          streams: function streams(mirror, dispatch) {
            $props = filterUnchanged(pure.propsEqual.bind(_this), $props.startWith(props));
            var $state = typeof state === 'function' && state.call(_this, mirror, dispatch);
            warning(!state || $state && $state.subscribe, '`state` should return a stream, did you forget a "return" statement? (at "%s")', [_name].concat(name.filter(function (name) {
              return typeof name === 'string';
            }).join(', ')));
            if (!state || !$state || !$state.subscribe) return { $props: $props };
            $state = filterUnchanged(pure.stateEqual.bind(_this), $state).filter(function (state) {
              return state !== undefined;
            });
            return { $state: $state, $props: $props };
          },
          metadata: {
            instance: _this
          }
        }),
            id = _MirrorBackend$addSto.id,
            mirror = _MirrorBackend$addSto.mirror,
            dispatch = _MirrorBackend$addSto.dispatch,
            streams = _MirrorBackend$addSto.streams;

        Object.assign(_this, { id: id, mirror: mirror, dispatch: dispatch });

        var $propsState = streams.$state ? most.combine(instantiseMapToProps(mapToProps.bind(_this)), streams.$state, streams.$props) : streams.$props.map(instantiseMapToProps(mapToProps.bind(_this, undefined)));

        filterUnchanged(pure.propsStateEqual.bind(_this), $propsState).observe(function (propsState) {
          _this.setState(function (_ref2) {
            var updateCount = _ref2.updateCount;
            return { updateCount: updateCount + 1, propsState: propsState };
          });
        });
        return _this;
      }

      createClass(Mirror, [{
        key: 'getWrappedInstance',
        value: function getWrappedInstance() {
          invariant(!stateless, "Stateless components (eg, `() => {}`) don't have refs, and therefore can't be unwrapped.");
          return this.wrappedInstance;
        }
      }, {
        key: 'getChildContext',
        value: function getChildContext() {
          return { id: this.id };
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          var nextName = getPropNames(nextProps.withName);
          var currentName = getPropNames(this.props.withName);
          if (JSON.stringify(nextName) !== JSON.stringify(currentName)) {
            MirrorBackend.updateStore(this.id, {
              requesting: ['$state', '$props'],
              identifiers: [].concat(toConsumableArray(name), toConsumableArray(nextName), [Mirror.__COMPONENT_IDENTIFIER__]),
              metadata: { instance: this }
            });
          }
          this.onReceivedProps(nextProps);
        }
      }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
          return nextState.updateCount > this.state.updateCount;
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          MirrorBackend.removeStore(this.id);
        }
      }, {
        key: 'render',
        value: function render() {
          var _this2 = this;

          if (this.state.updateCount === 0 && state) {
            return null;
          }

          var props = _extends({}, this.state.propsState, {
            dispatch: this.dispatch
          });
          if (!stateless) props.ref = function (ref) {
            return _this2.wrappedInstance = ref;
          };

          return React.createElement(WrappedComponent, props);
        }
      }]);
      return Mirror;
    }(React.Component);

    Mirror.displayName = 'Mirror(' + _name + ')';
    Mirror.contextTypes = {
      id: function id() {}
    };
    Mirror.childContextTypes = {
      id: function id() {}
    };
    Mirror.__COMPONENT_IDENTIFIER__ = Mirror;

    var createStaticCursors = function createStaticCursors() {
      delete Mirror.mirror;
      delete Mirror.dispatch;
      if (Mirror !== Mirror.__COMPONENT_IDENTIFIER__) {
        Mirror.mirror = Mirror.__COMPONENT_IDENTIFIER__.mirror;
        Mirror.dispatch = Mirror.__COMPONENT_IDENTIFIER__.dispatch;
        return;
      }

      var _MirrorBackend$addSto2 = MirrorBackend.addStore(null, {
        identifiers: ['MIRROR/static', 'MIRROR/static/' + _name],
        metadata: {
          static: Mirror
        }
      }),
          mirror = _MirrorBackend$addSto2.mirror,
          dispatch = _MirrorBackend$addSto2.dispatch;

      Object.assign(Mirror, {
        mirror: mirror.all(Mirror),
        dispatch: dispatch.all(Mirror)
      });
    };

    Object.defineProperties(Mirror, {
      mirror: { get: function get$$1() {
          return createStaticCursors(), Mirror.mirror;
        } },
      dispatch: { get: function get$$1() {
          return createStaticCursors(), Mirror.dispatch;
        } }
    });

    Mirror.__WITH_NAME_CACHE__ = Mirror.__COMPONENT_IDENTIFIER__.__WITH_NAME_CACHE__ || {};

    Mirror.withName = function withName() {
      var _name2;

      for (var _len = arguments.length, withName = Array(_len), _key = 0; _key < _len; _key++) {
        withName[_key] = arguments[_key];
      }

      withName = (_name2 = name).concat.apply(_name2, toConsumableArray(withName));
      var key = JSON.stringify(withName.sort());
      var cachedComponent = Mirror.__WITH_NAME_CACHE__[key];
      if (cachedComponent) return cachedComponent;

      var renamedComponent = createMirrorDecorator(_extends({}, config, {
        name: withName
      }))(WrappedComponent);
      renamedComponent.__COMPONENT_IDENTIFIER__ = Mirror.__COMPONENT_IDENTIFIER__;
      if (withName.length) Mirror.__WITH_NAME_CACHE__[key] = renamedComponent;
      return renamedComponent;
    };

    return Mirror;
  };
}

var isAction = function isAction(action) {
  if (action && typeof action.type === 'string' && action.hasOwnProperty('payload') && typeof action.store === 'string') {
    return true;
  }
  return false;
};

var findAction = function findAction(args) {
  var i = args.length;
  while (i--) {
    if (isAction(args[i])) return args[i];
    if (args[i] && isAction(args[i].action)) return args[i].action;
  }
  return null;
};

var handleActions = function handleActions(handlers, initialState) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var action = findAction(args);
    var state = args[0] === undefined ? initialState : args[0];

    if (!action || !handlers[action.type]) return state;
    if (initialState !== undefined) return handlers[action.type](state, action);
    return handlers[action.type](action);
  };
};

var combine$1 = function combine$$1() {
  for (var _len = arguments.length, streams = Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  if (streams[0] instanceof Array) streams = streams[0];
  invariant(streams.every(function ($stream) {
    return $stream && $stream.subscribe;
  }), '`combine` only accepts streams');
  return most.combineArray(function () {
    for (var _len2 = arguments.length, enumCollection = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      enumCollection[_key2] = arguments[_key2];
    }

    var result = {};
    enumCollection.forEach(function (_enum_) {
      _enum_.forEach(function (value, i, key) {
        result[key] = value;
      });
    });
    return new Enum(result);
  }, streams);
};

var SKIP_TOKEN$2 = '__MIRROR_SKIP_TOKEN__';

var combineEventsWithDefault = function combineEventsWithDefault(eventStream, otherStream) {
  return most.combine(function (event, other) {
    return { event: event, other: other };
  }).loop(function (_ref, _ref2) {
    var prevAction = _ref.prevAction,
        before = _ref.before;
    var event = _ref2.event,
        after = _ref2.other;
    return {
      seed: {
        prevAction: event,
        before: prevAction === event ? SKIP_TOKEN$2 : after
      },
      value: before === SKIP_TOKEN$2 ? { before: before, event: event, after: after } : SKIP_TOKEN$2
    };
  }, {}).filter(function (value) {
    return value !== SKIP_TOKEN$2;
  });
};

var combineEventsWithBefore = function combineEventsWithBefore(eventStream, otherStream) {
  return eventStream.sample(function (event, other) {
    return { before: other, event: event };
  }, otherStream);
};

var combineEventsWithAfter = function combineEventsWithAfter(eventStream, otherStream) {
  return combineEventsWithDefault(eventStream, otherStream).map(function (value) {
    delete value.before;
    return value;
  });
};

var combineEventsWithNothing = function combineEventsWithNothing(eventStream) {
  return eventStream.map(function (event) {
    return { event: event };
  });
};

var combineEventsWith = function combineEventsWith(eventStream, otherStream) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { before: true, after: true };

  invariant(eventStream && otherStream && eventStream.subscribe && otherStream.subscribe, '`combineEventsWith` only accepts streams');
  if (options.before && options.after) {
    return combineEventsWithDefault(eventStream, otherStream);
  } else if (options.before) {
    return combineEventsWithBefore(eventStream, otherStream);
  } else if (options.after) {
    return combineEventsWithAfter(eventStream, otherStream);
  }

  return combineEventsWithNothing(eventStream);
};

var combineNested = function combineNested(streamMap) {
  var keys = Object.keys(streamMap);
  var streams = keys.map(function (key) {
    return streamMap[key];
  });
  invariant(streams.every(function ($stream) {
    return $stream && $stream.subscribe;
  }), '`combine` only accepts streams');
  return most.combineArray(function () {
    for (var _len = arguments.length, enumCollection = Array(_len), _key = 0; _key < _len; _key++) {
      enumCollection[_key] = arguments[_key];
    }

    var result = {};
    enumCollection.forEach(function (_enum_) {
      _enum_.forEach(function (value, i, key) {
        if (!result[key]) result[key] = result[key];
        result[key][keys[i]] = value;
      });
    });
    return new Enum(result);
  }, streams);
};

var combineSimple = function combineSimple() {
  for (var _len = arguments.length, streams = Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  if (streams[0] instanceof Array) streams = streams[0];
  invariant(streams.every(function ($stream) {
    return $stream && $stream.subscribe;
  }), '`combineSimple` only accepts streams');
  return most.combineArray(function () {
    for (var _len2 = arguments.length, values = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      values[_key2] = arguments[_key2];
    }

    return [].concat(values);
  }, streams);
};

var addStore = MirrorBackend.addStore;
var removeStore = MirrorBackend.removeStore;
var updateStore = MirrorBackend.updateStore;
var query = MirrorBackend.query;
var root = MirrorBackend.root;
var stores = MirrorBackend.stores;

exports.addStore = addStore;
exports.removeStore = removeStore;
exports.updateStore = updateStore;
exports.query = query;
exports.root = root;
exports.stores = stores;
exports.handleActions = handleActions;
exports.Enum = Enum;
exports.shallowEqual = shallowEqual;
exports.combine = combine$1;
exports.combineEventsWith = combineEventsWith;
exports.combineNested = combineNested;
exports.combineSimple = combineSimple;
exports.filterUnchanged = filterUnchanged;
exports['default'] = createMirrorDecorator;
//# sourceMappingURL=index.js.map
