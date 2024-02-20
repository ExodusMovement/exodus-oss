import keychainDefinition from '..'

const createKeychain = ({ seed, ...rest }) => {
  const instance = keychainDefinition.factory(rest)
  instance.addSeed(seed)

  return instance
}

export default createKeychain
