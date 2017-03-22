import _ from 'lodash';
import subNamesToKeys from './subNamesToKeys';

export const normalizeState = (subscriptions, path, rootState) => {
  const ownKey = path.slice(-1)[0];
  const subscriptionKeys = subNamesToKeys(subscriptions, path, rootState);
  let [state, ...context] = [ownKey, ...subscriptionKeys].map(key => key ? rootState.stores[key].state : undefined);
  context = _.zipObject(subscriptions, context);
  return {state, context};
};

export default normalizeState;
