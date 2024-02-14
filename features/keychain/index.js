import multiSeedKeychainDefinition from './module/multi-seed-keychain'

const keychain = ({ cachePublicKeys }) => {
  // TODO: support caching
  return {
    id: 'keychain',
    definitions: [multiSeedKeychainDefinition],
  }
}

export default keychain
