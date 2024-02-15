import sodium from '@exodus/sodium-crypto'
import { mapValues } from '@exodus/basic-utils'

const cloneBuffer = (buf) => {
  const newBuffer = Buffer.alloc(buf.length)
  buf.copy(newBuffer)
  return newBuffer
}

export const create = ({ getPrivateHDKey }) => {
  // Sodium encryptor caches the private key and the return value holds
  // not refences to keychain internals, allowing the seed to be safely
  // garbage collected, clearing it from memory.
  const getSodiumKeysFromIdentifier = async ({ seedId, keyId }) => {
    const { privateKey: sodiumSeed } = getPrivateHDKey({ seedId, keyId })
    return sodium.getSodiumKeysFromSeed(sodiumSeed)
  }

  const createInstance = () => ({
    getSodiumKeysFromSeed: async ({ seedId, keyId }) => {
      const { box, sign, secret } = await getSodiumKeysFromIdentifier({ seedId, keyId })

      return {
        box: { publicKey: cloneBuffer(box.publicKey) },
        sign: { publicKey: cloneBuffer(sign.publicKey) },
        secret: cloneBuffer(secret),
      }
    },
    sign: async ({ seedId, keyId, data }) => {
      const { sign } = await getSodiumKeysFromIdentifier({ seedId, keyId })
      return sodium.sign({ message: data, privateKey: sign.privateKey })
    },
    signOpen: async ({ seedId, keyId, data }) => {
      const { sign } = await getSodiumKeysFromIdentifier({ seedId, keyId })
      return sodium.signOpen({ signed: data, publicKey: sign.publicKey })
    },
    signDetached: async ({ seedId, keyId, data }) => {
      const { sign } = await getSodiumKeysFromIdentifier({ seedId, keyId })
      return sodium.signDetached({ message: data, privateKey: sign.privateKey })
    },
    verifyDetached: async ({ seedId, keyId, data, signature }) => {
      const { sign } = await getSodiumKeysFromIdentifier({ seedId, keyId })
      return sodium.verifyDetached({ message: data, sig: signature, publicKey: sign.publicKey })
    },
    encryptSecretBox: async ({ seedId, keyId, data }) => {
      const { privateKey: sodiumSeed } = getPrivateHDKey({ seedId, keyId })
      return sodium.encryptSecret(data, sodiumSeed)
    },
    decryptSecretBox: async ({ seedId, keyId, data }) => {
      const { privateKey: sodiumSeed } = getPrivateHDKey({ seedId, keyId })
      return sodium.decryptSecret(data, sodiumSeed)
    },
    encryptBox: async ({ seedId, keyId, data, toPublicKey }) => {
      const { box } = await getSodiumKeysFromIdentifier({ seedId, keyId })
      return sodium.encryptBox(data, toPublicKey, box.privateKey)
    },
    decryptBox: async ({ seedId, keyId, data, fromPublicKey }) => {
      const { box } = await getSodiumKeysFromIdentifier({ seedId, keyId })
      return sodium.decryptBox(data, fromPublicKey, box.privateKey)
    },
    encryptSealedBox: async ({ data, toPublicKey }) => {
      return sodium.encryptSealedBox(data, toPublicKey)
    },
    decryptSealedBox: async ({ seedId, keyId, data }) => {
      const { box } = await getSodiumKeysFromIdentifier({ seedId, keyId })
      return sodium.decryptSealedBox(data, box.publicKey, box.privateKey)
    },
  })

  // For backwards compatibility
  // Remove after createSodiumEncryptor is deprecated
  const createEncryptor = ({ keyId }) => {
    const instance = createInstance()
    const encryptor = mapValues(instance, (fn) => async (args) => fn({ ...args, keyId }))
    return Object.freeze(encryptor)
  }

  return Object.freeze({ ...createInstance(), createEncryptor })
}

export const privToPub = async (sodiumSeed) => {
  const {
    sign: { publicKey },
  } = await sodium.getSodiumKeysFromSeed(sodiumSeed)
  return Buffer.from(publicKey)
}
