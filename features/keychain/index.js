import keychainDefinition from './module/keychain'

const keychain = ({ cachePublicKeys }) => {
  // TODO: support caching
  return {
    id: 'keychain',
    definitions: [keychainDefinition],
  }
}

export default keychain
