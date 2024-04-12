import assert from 'minimalistic-assert'
import elliptic from '@exodus/elliptic'
import { mapValues, pick } from '@exodus/basic-utils'

const validEcOptions = (ecOptions) =>
  !ecOptions || Object.keys(ecOptions).every((key) => ['canonical'].includes(key))

export const create = ({ getPrivateHDKey }) => {
  const EC = elliptic.ec
  const curve = new EC('secp256k1')

  const createInstance = () => ({
    signBuffer: async ({ keyId, data, ecOptions, enc = 'der' }) => {
      assert(['der', 'raw'].includes(enc), 'signBuffer: invalid enc')
      assert(validEcOptions(ecOptions), 'signBuffer: invalid EC option')
      const { privateKey } = getPrivateHDKey({ keyId })
      const signature = curve.sign(data, privateKey, pick(ecOptions, ['canonical']))
      return enc === 'der' ? Buffer.from(signature.toDER()) : { ...signature }
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
