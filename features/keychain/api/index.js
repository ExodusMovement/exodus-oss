const createKeychainApi = ({ keychain }) => {
  return {
    keychain: {
      exportKey: (...args) => keychain.exportKey(...args),
      arePrivateKeysLocked: (seeds) => keychain.arePrivateKeysLocked(seeds),
      sodium: {
        sign: keychain.sodium.sign,
        signDetached: keychain.sodium.signDetached,
        encryptSecretBox: keychain.sodium.encryptSecretBox,
        decryptSecretBox: keychain.sodium.decryptSecretBox,
        getKeysFromSeed: (...args) =>
          keychain.sodium.getKeysFromSeed(...args).then(({ box, sign }) => ({ box, sign })),
      },
      ed25519: {
        signBuffer: keychain.ed25519.signBuffer,
      },
      secp256k1: {
        signBuffer: keychain.secp256k1.signBuffer,
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
