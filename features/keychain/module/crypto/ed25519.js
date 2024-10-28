import { signDetached } from '@exodus/crypto/curve25519'
import { mapValues } from '@exodus/basic-utils'
import assert from 'minimalistic-assert'

export const create = ({ getPrivateHDKey }) => {
  const createInstance = () => ({
    signBuffer: async ({ seedId, keyId, data }) => {
      assert(keyId.keyType === 'nacl', `ED25519 signatures are not supported for ${keyId.keyType}`)
      const { privateKey } = getPrivateHDKey({ seedId, keyId })
      return signDetached({ message: data, privateKey, format: 'buffer' })
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
