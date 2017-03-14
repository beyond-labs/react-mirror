import _ from 'lodash';
import invariant from 'invariant';
import {Component, PropTypes, createElement} from 'react';
import createRootStore from './createRootStore';
import createLocalStore from './createLocalStore';
import findStoreByContext from './utils/findStoreByContext';

const getDisplayName = WrappedComponent => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

const createStoreStub = () => ({dispatch() {}, getState() {}, subscribe() {}});

const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired
});

export const Mirror = (config = {}, options = {}) => {
  // TODO: warn if:
  // reducer accepts context but no contextSubscribe in config
  const {enhancer} = config;

  return function wrapWithMirror(WrappedComponent) {
    invariant(
      typeof WrappedComponent === 'function',
      'You must pass a component to the function returned by ' +
        `Mirror. Instead received ${JSON.stringify(WrappedComponent)}`
    );

    class Mirror extends Component {
      path: null;
      rootStore: null;
      localStore: null;
      getWrappedInstance: () => {};
      replaceKey: () => {};
      constructor(props, context) {
        // TODO: throw if:
        // getWrappedInstance is called & wrapped component is pure
        super();
        const key = Math.random().toString().slice(2);
        if (!context.rootStore) {
          this.rootStore = createRootStore({enhancer});
          this.path = [key];
        } else {
          invariant(!enhancer, 'You can only pass an enhancer to the top-level store');
          this.rootStore = context.rootStore;
          this.path = context.path.concat(key);
        }
        (props.contextSubscribe || []).forEach(context => {
          const store = findStoreByContext(this, context);
          invariant(
            store,
            `Could not find "${context}" among the ancestors of ` +
              `"${this.constructor.displayName}". ` +
              'Check you passed the correct value to contextSubscribe and ' +
              `passed "${context}" to contextPublish for a parent store.`
          );
        });
        this.props = props;
        this.localStore = createLocalStore(this, config, options);
        this.localStore.subscribeParent(props.subscribe);
        this.localStore.subscribe((action, state) => {
          if (!['INITIALIZE', 'UNMOUNT_COMPONENT'].includes(action.type)) {
            this.setState({state});
          }
        });
        this.localStore.dispatch('INITIALIZE');
        this.state = {state: this.localStore.getState()};
      }
      getChildContext() {
        return {rootStore: this.rootStore, path: this.path};
      }
      shouldComponentUpdate(nextProps, nextState) {
        if (nextProps !== this.props) {
          this.localStore.subscribeParent(nextProps.subscribe);
          setTimeout(() => this.localStore.dispatch('UPDATE_PROPS'));
        }
        return nextState !== this.state;
      }
      componentWillUnmount() {
        this.localStore.dispatch('UNMOUNT_COMPONENT');
        this.localStore.destroy();
        // these are just to guard against extra memory leakage if a parent element doesn't
        // dereference this instance properly, such as an async callback that never finishes
        this.path = null;
        this.rootStore = createStoreStub();
        this.localStore = createStoreStub();
        this.getWrappedInstance = () => {};
        this.replaceKey = () => {};
      }
      render() {
        const {state} = this.state;
        const props = {...state, dispatch: this.localStore.dispatch, subscribe: this.localStore.subscribe};

        return createElement(WrappedComponent, props);
      }
    }

    Mirror.displayName = `Mirror(${getDisplayName(WrappedComponent)})`;
    Mirror.WrappedComponent = WrappedComponent;
    Mirror.contextTypes = {
      rootStore: storeShape,
      path: PropTypes.arrayOf(PropTypes.string)
    };
    Mirror.childContextTypes = {
      rootStore: storeShape.isRequired,
      path: PropTypes.arrayOf(PropTypes.string).isRequired
    };

    return Mirror;
  };
};

export default Mirror;
