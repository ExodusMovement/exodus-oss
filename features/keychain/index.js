import moduleDefinition from './module/keychain'
import apiDefinition from './api'

const keychain = ({ cachePublicKeys }) => {
  // TODO: support caching
  return {
    id: 'keychain',
    definitions: [{ definition: moduleDefinition }, { definition: apiDefinition }],
  }
}

export default keychain
