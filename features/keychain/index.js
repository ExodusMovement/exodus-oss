import memoizedKeychainDefinition from './module/memoized-keychain'
import keychainDefinition from './module/keychain'
import keychainPluginDefinition from './plugin'

const storageOpts = {
  storage: { namespace: 'keychain' },
}

const keychain = ({ cachePublicKeys }) => {
  return {
    id: 'keychain',
    definitions: cachePublicKeys
      ? [
          {
            definition: memoizedKeychainDefinition,
            ...storageOpts,
          },
          {
            definition: keychainPluginDefinition,
            ...storageOpts,
          },
        ]
      : [{ definition: keychainDefinition }],
  }
}

export default keychain
