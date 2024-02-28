import elliptic from '@exodus/elliptic'
import { mapValues } from '@exodus/basic-utils'

export const create = ({ getPrivateHDKey }) => {
  const EC = elliptic.ec
  const curve = new EC('secp256k1')

  const createInstance = () => ({
    signBuffer: async ({ seedId, keyId, data, ecOptions, rawSignature }) => {
      const { privateKey } = getPrivateHDKey({ seedId, keyId })
      const signature = curve.sign(data, privateKey, ecOptions)
      return rawSignature ? signature : Buffer.from(signature.toDER())
    },
  })

  // For backwards compatibility
  // Remove after createSecp256k1Signer is deprecated
  const createSigner = ({ keyId }) => {
    const instance = createInstance()
    const signer = mapValues(instance, (fn) => async (args) => fn({ ...args, keyId }))
    return Object.freeze(signer)
  }

  return Object.freeze({ ...createInstance(), createSigner })
}
