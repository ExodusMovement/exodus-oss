import memoizedKeychainDefinition from './module/memoized-keychain'
import keychainDefinition from './module/keychain'

const keychain = ({ cachePublicKeys }) => {
  return {
    id: 'keychain',
    definitions: cachePublicKeys
      ? [{ definition: memoizedKeychainDefinition, storage: { namespace: 'keychain' } }]
      : [{ definition: keychainDefinition }],
  }
}

export default keychain
