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
        encryptBox: keychain.sodium.encryptBox,
        decryptBox: keychain.sodium.decryptBox,
        getKeysFromSeed: (...args) =>
          keychain.sodium.getKeysFromSeed(...args).then(({ box, sign }) => ({ box, sign })),
      },
      ed25519: {
        signBuffer: keychain.ed25519.signBuffer,
      },
      secp256k1: {
        signBuffer: keychain.secp256k1.signBuffer,
        signSchnorr: keychain.secp256k1.signSchnorr,
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
