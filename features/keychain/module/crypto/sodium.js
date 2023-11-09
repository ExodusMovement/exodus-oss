import sodium from '@exodus/sodium-crypto'

export const createSodiumEncryptor = (sodiumSeed) => {
  // Sodium encryptor caches the private key and the return value holds
  // not refences to keychain internals, allowing the seed to be safely
  // garbage collected, clearing it from memory.
  const sodiumKeysPromise = sodium.getSodiumKeysFromSeed(sodiumSeed)
  return Object.freeze({
    getSodiumKeysFromSeed: async () => {
      const { box, sign, secret } = await sodiumKeysPromise
      // Do not allow mutation of the original key material.
      const clone = (buf) => {
        const newBuffer = Buffer.alloc(buf.length)
        buf.copy(newBuffer)
        return newBuffer
      }

      return {
        box: {
          publicKey: clone(box.publicKey),
        },
        sign: {
          publicKey: clone(sign.publicKey),
        },
        secret: clone(secret),
      }
    },
    sign: async ({ data }) => {
      const { sign } = await sodiumKeysPromise
      return sodium.sign({ message: data, privateKey: sign.privateKey })
    },
    signOpen: async ({ data }) => {
      const { sign } = await sodiumKeysPromise
      return sodium.signOpen({ signed: data, publicKey: sign.publicKey })
    },
    signDetached: async ({ data }) => {
      const { sign } = await sodiumKeysPromise
      return sodium.signDetached({ message: data, privateKey: sign.privateKey })
    },
    verifyDetached: async ({ data, signature }) => {
      const { sign } = await sodiumKeysPromise
      return sodium.verifyDetached({ message: data, sig: signature, publicKey: sign.publicKey })
    },
    encryptSecretBox: async ({ data }) => {
      return sodium.encryptSecret(data, sodiumSeed)
    },
    decryptSecretBox: async ({ data }) => {
      return sodium.decryptSecret(data, sodiumSeed)
    },
    encryptBox: async ({ data, toPublicKey }) => {
      const { box } = await sodiumKeysPromise
      return sodium.encryptBox(data, toPublicKey, box.privateKey)
    },
    decryptBox: async ({ data, fromPublicKey }) => {
      const { box } = await sodiumKeysPromise
      return sodium.decryptBox(data, fromPublicKey, box.privateKey)
    },
    encryptSealedBox: async ({ data, toPublicKey }) => {
      return sodium.encryptSealedBox(data, toPublicKey)
    },
    decryptSealedBox: async ({ data }) => {
      const { box } = await sodiumKeysPromise
      return sodium.decryptSealedBox(data, box.publicKey, box.privateKey)
    },
  })
}

export const privToPub = async (sodiumSeed) => {
  const {
    sign: { publicKey },
  } = await sodium.getSodiumKeysFromSeed(sodiumSeed)
  return Buffer.from(publicKey)
}
