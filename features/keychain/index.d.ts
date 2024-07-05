import keychainApiDefinition from './api/index.js'

declare const keychain: () => {
  id: 'keychain'
  definitions: [{ definition: typeof keychainApiDefinition }]
}

export default keychain
