export const subNamesToKeys = (subscriptions, path, state) => {
  const keys = Array(subscriptions.length).fill()
  path.forEach(key => {
    const i = subscriptions.indexOf(state.stores[key].meta.contextPublish)
    if (i !== -1) keys[i] = key
  })
  return keys
}

export default subNamesToKeys
