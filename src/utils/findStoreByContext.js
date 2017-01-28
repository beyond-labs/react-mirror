export const findStoreByContext = (instance, context) => {
  const candidates = instance.path.map(key => instance.rootStore.getState().stores[key])
  const store = candidates.reverse().find(store => store.meta.contextPublish === context)
  return store
}

export default findStoreByContext
