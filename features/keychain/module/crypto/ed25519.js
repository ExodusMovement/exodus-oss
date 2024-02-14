import sodium from '@exodus/sodium-crypto'
import { mapValues } from '@exodus/basic-utils'

export const create = ({ getPrivateHDKey }) => {
  const getSodiumKeysFromIdentifier = async ({ seedId, keyId }) => {
    const { privateKey: sodiumSeed } = getPrivateHDKey({ seedId, keyId })
    return sodium.getSodiumKeysFromSeed(sodiumSeed)
  }

  const createInstance = () => ({
    signBuffer: async ({ seedId, keyId, data }) => {
      const { sign } = await getSodiumKeysFromIdentifier({ seedId, keyId })
      return sodium.signDetached({ message: data, privateKey: sign.privateKey })
    },
  })

  // For backwards compatibility
  // Remove after createEd25519Signer is deprecated
  const createSigner = ({ keyId }) => {
    const instance = createInstance()
    const signer = mapValues(instance, (fn) => async (args) => fn({ ...args, keyId }))
    return Object.freeze(signer)
  }

  return Object.freeze({ ...createInstance(), createSigner })
}
