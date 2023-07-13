import keychainDefinition from '..'

const createKeychain = ({ seed, ...rest }) => {
  const instance = keychainDefinition.factory(rest)
  if (seed) {
    instance.unlock({ seed })
  }

  return instance
}

export default createKeychain
