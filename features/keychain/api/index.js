const createKeychainApi = ({ keychain }) => {
  return {
    keychain: {
      exportKey: (...args) => keychain.exportKey(...args),
      sodium: {
        signDetached: keychain.sodium.signDetached,
        getKeysFromSeed: (...args) =>
          keychain.sodium
            .getSodiumKeysFromSeed(...args)
            .then(({ box, sign }) => ({ box, sign })),
      },
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
