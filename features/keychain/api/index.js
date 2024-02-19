import KeyIdentifier from '@exodus/key-identifier'

const createKeychainApi = ({ keychain }) => {
  const exportKey = async ({ seedId, keyId, exportPrivate }) =>
    keychain.exportKey({ seedId, keyId, exportPrivate })

  return {
    keychain: {
      exportKey,
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
