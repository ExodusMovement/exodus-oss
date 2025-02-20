import sodium from '@exodus/sodium-crypto'
import { mapValues, memoize } from '@exodus/basic-utils'
import * as curve25519 from '@exodus/crypto/curve25519'
import { getSodiumKeysFromSeed } from '@exodus/crypto/sodium'

const cloneBuffer = (buf) => {
  const newBuffer = Buffer.alloc(buf.length)
  buf.copy(newBuffer)
  return newBuffer
}

const cloneKeypair = ({ keys, exportPrivate }) => {
  return {
    publicKey: cloneBuffer(keys.publicKey),
    privateKey: exportPrivate ? cloneBuffer(keys.privateKey) : null,
  }
}

export const getMemoizedSodiumKeysFromSeed = memoize(getSodiumKeysFromSeed, (seed) =>
  seed.toString('hex')
)

export const create = ({ getPrivateHDKey }) => {
  // Sodium encryptor caches the private key and the return value holds
  // not refences to keychain internals, allowing the seed to be safely
  // garbage collected, clearing it from memory.

  const getSodiumKeysFromIdentifier = async ({ seedId, keyId }) => {
    const { privateKey: sodiumSeed } = getPrivateHDKey({ seedId, keyId })
    return getMemoizedSodiumKeysFromSeed(sodiumSeed)
  }

  const getKeysFromSeed = async ({ seedId, keyId, exportPrivate }) => {
    const { box, sign, secret } = await getSodiumKeysFromIdentifier({ seedId, keyId })

    return {
      box: cloneKeypair({ keys: box, exportPrivate }),
      sign: cloneKeypair({ keys: sign, exportPrivate }),
      secret: exportPrivate ? cloneBuffer(secret) : null,
    }
  }

  const createInstance = () => ({
    getKeysFromSeed,
    /** @deprecated use getKeysFromSeed instead */
    getSodiumKeysFromSeed: getKeysFromSeed,
    sign: async ({ seedId, keyId, data }) => {
      const { privateKey } = getPrivateHDKey({ seedId, keyId })
      return curve25519.signAttached({ message: data, privateKey, format: 'buffer' })
    },
    signOpen: async ({ seedId, keyId, data }) => {
      const { publicKey } = getPrivateHDKey({ seedId, keyId })
      return curve25519.signOpen({ signed: data, publicKey, format: 'buffer' })
    },
    signDetached: async ({ seedId, keyId, data }) => {
      const { privateKey } = getPrivateHDKey({ seedId, keyId })
      return curve25519.signDetached({ message: data, privateKey, format: 'buffer' })
    },
    verifyDetached: async ({ seedId, keyId, data, signature }) => {
      const { publicKey } = getPrivateHDKey({ seedId, keyId })
      return curve25519.verifyDetached({ message: data, signature, publicKey })
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
  return curve25519.edwardsToPublic({ privateKey: sodiumSeed, format: 'buffer' })
}
