import moduleDefinition from './module/keychain.js'
import apiDefinition from './api/index.js'

const keychain = ({ cachePublicKeys = false } = Object.create(null)) => {
  // TODO: support caching
  return {
    id: 'keychain',
    definitions: [{ definition: moduleDefinition }, { definition: apiDefinition }],
  }
}

export default keychain
