'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('regenerator-runtime/runtime');
var most = require('most');
var React = _interopDefault(require('react'));

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
    q.push.apply(q, toConsumableArray(node.children));
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
  if (!filter || filter === node.id || filter === node.component || node.name.includes(filter)) {
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

  return runQuery(tree, result, query.slice(1));
};

var createCursorBackend$1 = function createCursorBackend() {
  var prevTree = void 0;

  return {
    query: function query(origin, _query3) {
      runQuery(prevTree, [origin], _query3);
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
      query = [{ op: 'root' }];
      return createCursorAPI(cursorMethods, query);
    },
    parents: function parents() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var maxStores = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

      query = query.concat({ op: 'parents', filter: filter, maxStores: maxStores });
      return createCursorAPI(cursorMethods, query);
    },
    children: function children() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var maxStores = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

      query = query.concat({ op: 'children', filter: filter, maxStores: maxStores });
      return createCursorAPI(cursorMethods, query);
    },
    all: function all() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var maxStores = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

      query = [{ op: 'root' }, { op: 'children', filter: filter, maxStores: maxStores }];
      return createCursorAPI(cursorMethods, query);
    },
    one: function one() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      query = [{ op: 'root' }, { op: 'children', filter: filter, maxStores: 1 }];
      return createCursorAPI(cursorMethods, query);
    },
    parent: function parent() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      query = query.concat({ op: 'parents', filter: filter, maxStores: 1 });
      return createCursorAPI(cursorMethods, query);
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
  return counter.map(function (char) {
    return ALPHABET[char];
  }).join('');
};

var couldBeStoreId = RegExp.prototype.test.bind(/^[A-Z]{2,12}$/);

var Enum = function (_Array) {
  inherits(Enum, _Array);

  function Enum(obj) {
    var _ref;

    classCallCheck(this, Enum);

    var keys = Object.keys(obj);
    var values = keys.map(function (key) {
      return obj[key];
    });

    var _this = possibleConstructorReturn(this, (_ref = Enum.__proto__ || Object.getPrototypeOf(Enum)).call.apply(_ref, [this].concat(toConsumableArray(values))));

    _this.keys = keys;
    keys.forEach(function (key) {
      return _this[key] = obj[key];
    });
    return _this;
  }

  createClass(Enum, [{
    key: "map",
    value: function map(f) {
      var obj = {};
      this.forEach(function map(value, index, key, arr) {
        obj[key] = f(value, index, key, arr);
      });
      return new Enum(obj);
    }
  }, {
    key: "filter",
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
    key: "forEach",
    value: function forEach(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), "forEach", this).call(this, function forEach(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: "every",
    value: function every(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), "every", this).call(this, function every(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: "find",
    value: function find(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), "find", this).call(this, function find(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: "findIndex",
    value: function findIndex(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), "findIndex", this).call(this, function findIndex(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: "some",
    value: function some(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), "some", this).call(this, function some(value, index, arr) {
        return f(value, index, this.keys[index], arr);
      });
    }
  }, {
    key: "reduce",
    value: function reduce(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), "reduce", this).call(this, function reduce(prev, value, index, arr) {
        return f(prev, value, index, this.keys[index], arr);
      });
    }
  }, {
    key: "reduceRight",
    value: function reduceRight(f) {
      return get(Enum.prototype.__proto__ || Object.getPrototypeOf(Enum.prototype), "reduceRight", this).call(this, function reduceRight(prev, value, index, arr) {
        return f(prev, value, index, this.keys[index], arr);
      });
    }
  }]);
  return Enum;
}(Array);

var combine$1 = function combine$$1() {
  for (var _len = arguments.length, streams = Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  return most.combine.apply(most, [function () {
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
  }].concat(streams));
};

var eventSource$1 = function eventSource() {
  var _marked = [eventGenerator].map(regeneratorRuntime.mark);

  var syncBuffer = [];
  var _push = function push(event) {
    return syncBuffer.push(event);
  };
  function eventGenerator() {
    var setPush;
    return regeneratorRuntime.wrap(function eventGenerator$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!syncBuffer.length) {
              _context.next = 5;
              break;
            }

            _context.next = 3;
            return Promise.resolve(syncBuffer.shift());

          case 3:
            _context.next = 0;
            break;

          case 5:
            setPush = function setPush(resolve) {
              return _push = resolve;
            };

          case 6:
            

            _context.next = 9;
            return new Promise(setPush);

          case 9:
            _context.next = 6;
            break;

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _marked[0], this);
  }
  return {
    push: function push(event) {
      return _push(event);
    },
    end: function end() {
      return eventGenerator.return();
    },
    $stream: most.from(eventGenerator())
  };
};

var SKIP_TOKEN = '__MIRROR_SKIP_TOKEN__';

var filterUnchanged = function filterUnchanged(equalityCheck, $stream) {
  return $stream.loop(function (prevValue, value) {
    var isEqual = equalityCheck(prevValue, value);
    if (isEqual) return { seed: value, value: SKIP_TOKEN };
    return { seed: value, value: value };
  }, undefined).filter(function (value) {
    return value !== SKIP_TOKEN;
  });
};

var keyArrayEqual = function keyArrayEqual(_ref, keyArray) {
  var oldKeyArray = _ref.oldKeyArray,
      oldKeySet = _ref.oldKeySet;

  if (oldKeyArray === keyArray) return true;

  for (var i in keyArray) {
    if (!oldKeySet.has(keyArray[i])) return false;
  }

  return keyArray.length === oldKeyArray.length;
};

var filterUnchangedKeyArrays = function filterUnchangedKeyArrays($stream) {
  return $stream.loop(function (seed, keyArray) {
    var isEqual = keyArrayEqual(seed, keyArray);
    if (isEqual) return { seed: seed, value: SKIP_TOKEN };
    return {
      seed: { oldKeyArray: keyArray, oldKeySet: new Set(keyArray) },
      value: keyArray
    };
  }, { oldKeyArray: [], oldKeySet: new Set() }).filter(function (value) {
    return value !== SKIP_TOKEN;
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
  });

  var _updateStore = function _updateStore(store, _ref2) {
    var _ref2$requesting = _ref2.requesting,
        requesting = _ref2$requesting === undefined ? [] : _ref2$requesting,
        streams = _ref2.streams,
        _ref2$identifiers = _ref2.identifiers,
        identifiers = _ref2$identifiers === undefined ? [] : _ref2$identifiers,
        _ref2$metadata = _ref2.metadata,
        metadata = _ref2$metadata === undefined ? {} : _ref2$metadata;

    Object.assign(store, { identifiers: identifiers, metadata: metadata });

    if (identifiers.some(couldBeStoreId)) {
      // warning()
    }

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
            if (ADD_STREAMS_ASYNC) {
              onStoreUpdated({ store: store, op: 'update' });
            }

            return $queryResults.map(function (queryResults) {
              return queryResults[store.id][queryIndex];
            }).thru(filterUnchangedKeyArrays).map(function (stores) {
              return (streamName === '$actions' ? most.mergeArray : combine$1)(stores.map(function (id) {
                if (id === store.id && query.length && streamName === '$state') {
                  return undefined;
                }
                return storeMap[id] && storeMap[id].streams[streamName];
              }).filter(function (s) {
                return s;
              }));
            }).switchLatest();
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

        if (!store.id) return; // warning()
        var stores = cursorBackend.query(store.id, query);
        if (stores.length || !retryIfSelectionEmpty) {
          stores.forEach(function (id) {
            storeMap[id].dispatch(type, payload);
          });
          return;
        }

        $queryResults.until($storeDeleted.tap(function () {
          // warning()
        })).map(function () {
          return cursorBackend.query(store.id, query);
        }).filter(function (stores) {
          return stores.length;
        }).take(1).observe(function (stores) {
          stores.forEach(function (id) {
            storeMap[id].dispatch(type, payload);
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

      store.dispatch = dispatch;
      store.streams.$actions = $actions.until($storeDeleted);
    }

    if (streams) {
      var _$actions = store.streams.$actions;
      store.streams = streams(store.mirror, store.dispatch);
      store.streams.$actions = _$actions;
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
      if (!parent && root) return; // warning()

      var store = {
        id: generateStoreId(),
        path: root ? parent.path.concat(parentId) : [],
        streams: {},
        queries: [],
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
      if (!store) return; // warning()
      if (store === root) return; // warning()

      var traverse = function traverse(store) {
        store.children.forEach(traverse);
        // TODO: test dispatch in response to TEARDOWN
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
      if (!store) return; // warning()

      _updateStore(store, { requesting: requesting, streams: streams, identifiers: identifiers, metadata: metadata });
      onStoreUpdated({ store: store, op: 'update' });

      return store;
    }
  };

  root = backend.addStore(null, { identifiers: ['MIRROR/root'], metadata: { root: true } });

  return backend;
};

var MirrorBackend = createMirrorBackend();

var hasOwn = Object.prototype.hasOwnProperty;

var shallowEqual = function shallowEqual(a, b) {
  if (a === b) return true;

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
        pure = config.pure;

    if (!(name instanceof Array)) name = [name];
    if (typeof mapToProps !== 'function') {
      mapToProps = function mapToProps(state, props) {
        return _extends({}, props, state);
      };
    }
    if (!pure) pure = {
      propsEqual: function propsEqual() {},
      stateEqual: function stateEqual() {},
      propsStateEqual: function propsStateEqual() {}
    };
    if (pure === true) pure = {};
    Object.assign({
      propsEqual: shallowEqual,
      shallowEqual: shallowEqual,
      propsStateEqual: shallowEqual
    }, pure);

    if (!WrappedComponent) {
      WrappedComponent = function Noop() {
        return null;
      };
    }

    var Mirror = function (_React$Component) {
      inherits(Mirror, _React$Component);

      function Mirror(props, context) {
        classCallCheck(this, Mirror);

        var _this = possibleConstructorReturn(this, (Mirror.__proto__ || Object.getPrototypeOf(Mirror)).call(this));

        _this.state = { updateCount: 0, props: undefined };

        var _createEventSource = eventSource$1(),
            onReceivedProps = _createEventSource.push,
            endReceivedPropsEventSource = _createEventSource.end,
            $props = _createEventSource.$stream;

        Object.assign(_this, { onReceivedProps: onReceivedProps, endReceivedPropsEventSource: endReceivedPropsEventSource });
        var $stateEnd = most.fromPromise(new Promise(function (resolve) {
          return _this.onStateEnd = resolve;
        }));

        var _MirrorBackend$addSto = MirrorBackend.addStore(context.id, {
          requesting: ['$state', '$props'],
          identifiers: [].concat(toConsumableArray(config.name), [Mirror.__COMPONENT_IDENTIFIER__]),
          streams: function streams(mirror, dispatch) {
            $props = filterUnchanged(pure.propsEqual.bind(_this), $props);
            if (!state) return { $props: $props };
            var $state = filterUnchanged(pure.stateEqual.bind(_this), state.call(_this, mirror, dispatch)).until($stateEnd);
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

        filterUnchanged(pure.propsStateEqual.bind(_this), most.combine(instantiseMapToProps(mapToProps).bind(_this), streams.$state, streams.$props)).observe(function (propsState) {
          _this.setState(function (_ref) {
            var updateCount = _ref.updateCount;
            return { updateCount: updateCount + 1, propsState: propsState };
          });
        });
        return _this;
      }

      createClass(Mirror, [{
        key: 'getWrappedInstance',
        value: function getWrappedInstance() {
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
          this.endReceivedPropsEventSource();
          this.onStateEnd();
          MirrorBackend.removeStore(this.id);
        }
      }, {
        key: 'render',
        value: function render() {
          var _this2 = this;

          if (this.state.updateCount === 0 && config.state) {
            return null;
          }

          return React.createElement(WrappedComponent, _extends({}, this.state.props, {
            ref: function ref(_ref2) {
              return _this2.wrappedInstance = _ref2;
            },
            dispatch: this.dispatch
          }));
        }
      }]);
      return Mirror;
    }(React.Component);

    var _name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
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

    Mirror.__WITH_NAME_CACHE__ = {};
    var withNameCache = Mirror.__COMPONENT_IDENTIFIER__.__WITH_NAME_CACHE__;
    Mirror.withName = function withName() {
      var _ref3;

      for (var _len = arguments.length, name = Array(_len), _key = 0; _key < _len; _key++) {
        name[_key] = arguments[_key];
      }

      name = (_ref3 = []).concat.apply(_ref3, toConsumableArray(name).concat([config.name])).sort();
      var key = JSON.stringify(name); // TODO: support non-string names
      if (withNameCache[key]) return withNameCache[key];

      var renamedComponent = createMirrorDecorator(_extends({}, config, { name: name }))(WrappedComponent);
      renamedComponent.__COMPONENT_IDENTIFIER__ = Mirror.__COMPONENT_IDENTIFIER__;
      withNameCache[key] = renamedComponent;
    };

    return Mirror;
  };
}

var SKIP_TOKEN$1 = '__MIRROR_SKIP_TOKEN__';

var combineActionsWithDefault = function combineActionsWithDefault(actionStream, otherStream) {
  return most.combine(function (action, other) {
    return { action: action, other: other };
  }).loop(function (_ref, _ref2) {
    var prevAction = _ref.prevAction,
        before = _ref.before;
    var action = _ref2.action,
        after = _ref2.other;
    return {
      seed: {
        prevAction: action,
        before: prevAction === action ? SKIP_TOKEN$1 : after
      },
      value: before === SKIP_TOKEN$1 ? { before: before, action: action, after: after } : SKIP_TOKEN$1
    };
  }, {}).filter(function (value) {
    return value !== SKIP_TOKEN$1;
  });
};

var combineActionsWithBefore = function combineActionsWithBefore(actionStream, otherStream) {
  return actionStream.sample(function (action, other) {
    return { before: other, action: action };
  }, otherStream);
};

var combineActionsWithAfter = function combineActionsWithAfter(actionStream, otherStream) {
  return combineActionsWithDefault(actionStream, otherStream).map(function (value) {
    delete value.before;
    return value;
  });
};

var combineActionsWithNothing = function combineActionsWithNothing(actionStream) {
  return actionStream.map(function (action) {
    return { action: action };
  });
};

var combineActionsWith = function combineActionsWith(actionStream, otherStream) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { before: true, after: true };

  if (options.before && options.after) {
    return combineActionsWithDefault(actionStream, otherStream);
  } else if (options.before) {
    return combineActionsWithBefore(actionStream, otherStream);
  } else if (options.after) {
    return combineActionsWithAfter(actionStream, otherStream);
  }

  return combineActionsWithNothing(actionStream);
};

var combineNested = function combineNested(streamMap) {
  var keys = Object.keys(streamMap);
  var streams = keys.map(function (key) {
    return streamMap[key];
  });
  return most.combine.apply(most, [function () {
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
  }].concat(toConsumableArray(streams)));
};

var combineSimple = most.combine.bind(null, function () {
  for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
    values[_key] = arguments[_key];
  }

  return [].concat(values);
});

var addStore = MirrorBackend.addStore;
var removeStore = MirrorBackend.removeStore;
var updateStore = MirrorBackend.updateStore;

exports.addStore = addStore;
exports.removeStore = removeStore;
exports.updateStore = updateStore;
exports.combine = combine$1;
exports.combineActionsWith = combineActionsWith;
exports.combineNested = combineNested;
exports.combineSimple = combineSimple;
exports['default'] = createMirrorDecorator;
//# sourceMappingURL=index.js.map
