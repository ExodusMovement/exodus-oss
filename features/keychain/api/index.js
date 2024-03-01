const createKeychainApi = ({ keychain }) => {
  return {
    keychain: {
      exportKey: (...args) => keychain.exportKey(...args),
    },
  }
}

const keychainApiDefinition = {
  id: 'keychainApi',
  type: 'api',
  factory: createKeychainApi,
  dependencies: ['keychain'],
}

export default keychainApiDefinition
