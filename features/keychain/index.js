import multiSeedKeychainDefinition from './module/multi-seed-keychain'

const keychain = ({ cachePublicKeys }) => {
  return {
    id: 'keychain',
    definitions: [multiSeedKeychainDefinition],
  }
}

export default keychain
