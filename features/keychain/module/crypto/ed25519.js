import sodium from '@exodus/sodium-crypto'

export const createEd25519Signer = (privateKey) => {
  const sodiumKeysPromise = sodium.getSodiumKeysFromSeed(privateKey)
  return Object.freeze({
    signBuffer: async ({ data }) => {
      const { sign } = await sodiumKeysPromise
      return sodium.signDetached({ message: data, privateKey: sign.privateKey })
    },
  })
}
