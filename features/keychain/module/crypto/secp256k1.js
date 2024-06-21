import assert from 'minimalistic-assert'
import elliptic from '@exodus/elliptic'
import { mapValues, pick } from '@exodus/basic-utils'
import ecc from '@exodus/bitcoinerlab-secp256k1'

import { tweakPrivateKey } from './tweak'

const isValidEcOptions = (ecOptions) =>
  !ecOptions || Object.keys(ecOptions).every((key) => ['canonical'].includes(key))

export const create = ({ getPrivateHDKey }) => {
  const EC = elliptic.ec
  const curve = new EC('secp256k1')

  const getUncompressedPublicKey = (privateKey) => {
    const keyPair = curve.keyFromPrivate(privateKey)
    return Buffer.from(keyPair.getPublic().encode('array', false))
  }

  const createInstance = () => ({
    signBuffer: async ({ seedId, keyId, data, ecOptions, enc = 'der' }) => {
      assert(
        keyId.keyType === 'secp256k1',
        `ECDSA signatures are not supported for ${keyId.keyType}`
      )
      assert(['der', 'raw'].includes(enc), 'signBuffer: invalid enc')
      assert(isValidEcOptions(ecOptions), 'signBuffer: invalid EC option')
      const { privateKey } = getPrivateHDKey({ seedId, keyId })
      const signature = curve.sign(data, privateKey, pick(ecOptions, ['canonical']))
      return enc === 'der' ? Buffer.from(signature.toDER()) : { ...signature }
    },
    signSchnorr: async ({ seedId, keyId, data, tweak, extraEntropy }) => {
      assert(
        keyId.keyType === 'secp256k1',
        `Schnorr signatures are not supported for ${keyId.keyType}`
      )
      const hdkey = getPrivateHDKey({ seedId, keyId })
      const privateKey = tweak ? tweakPrivateKey({ hdkey, tweak }) : hdkey.privateKey
      return ecc.signSchnorr(data, privateKey, extraEntropy)
    },
    getPublicKey: async ({ seedId, keyId, compressed = true }) => {
      const { privateKey, publicKey } = getPrivateHDKey({ seedId, keyId })
      if (compressed) return publicKey

      return getUncompressedPublicKey(privateKey)
    },
  })

  // For backwards compatibility
  // Remove after createSecp256k1Signer is deprecated
  const createSigner = ({ keyId }) => {
    const instance = createInstance()
    const signer = mapValues(instance, (fn) => async (args) => fn({ ...args, keyId }))
    return Object.freeze(signer)
  }

  return Object.freeze({ ...createInstance(), createSigner, getCompressedPublicKey })
}
