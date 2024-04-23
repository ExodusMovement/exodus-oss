import keychainApiDefinition from './api'

declare const keychain: () => {
  id: 'keychain'
  definitions: [{ definition: typeof keychainApiDefinition }]
}

export default keychain
