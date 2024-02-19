import moduleDefinition from './module/keychain'
import apiDefinition from './api'

const keychain = ({ cachePublicKeys }) => {
  // TODO: support caching
  return {
    id: 'keychain',
    definitions: [moduleDefinition, apiDefinition],
  }
}

export default keychain
