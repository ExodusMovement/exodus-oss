import moduleDefinition from './module/keychain'
import memoizedModuleDefinition from './module/memoized-keychain'
import apiDefinition from './api'

const keychain = ({ cachePublicKeys }) => {
  return {
    id: 'keychain',
    definitions: [
      cachePublicKeys
        ? { definition: memoizedModuleDefinition, storage: { namespace: 'keychain' } }
        : { definition: moduleDefinition },
      { definition: apiDefinition },
    ],
  }
}

export default keychain
