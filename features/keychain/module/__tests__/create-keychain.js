import keychainDefinition from '..'

export default ({ seed, ...rest }) => {
  const instance = keychainDefinition.factory(rest)
  if (seed) {
    instance.unlock({ seed })
  }

  return instance
}
