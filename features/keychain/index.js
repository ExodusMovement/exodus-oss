import memoizedKeychainDefinition from './module/memoized-keychain'
import keychainDefinition from './module/keychain'
import multiSeedKeychainDefinition from './module/multi-seed-keychain'

const keychain = ({ cachePublicKeys }) => {
  return {
    id: 'keychain',
    definitions: [
      multiSeedKeychainDefinition,
      ...(cachePublicKeys
        ? [{ definition: memoizedKeychainDefinition, storage: { namespace: 'keychain' } }]
        : [{ definition: keychainDefinition }]),
    ],
  }
}

export default keychain
