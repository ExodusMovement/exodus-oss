import assert from 'minimalistic-assert'
import elliptic from '@exodus/elliptic'
import { mapValues, pick } from '@exodus/basic-utils'
import ecc from '@exodus/bitcoinerlab-secp256k1'

import { tweakPrivateKey, tweakPublicKey } from './tweak'

const isValidEcOptions = (ecOptions) =>
  !ecOptions || Object.keys(ecOptions).every((key) => ['canonical'].includes(key))

const isValidTweak = (tweak) =>
  !tweak ||
  (tweak.scalar && Object.keys(tweak.options || {}).every((key) => ['extraEntropy'].includes(key)))

export const create = ({ getPrivateHDKey }) => {
  const EC = elliptic.ec
  const curve = new EC('secp256k1')

  const createInstance = () => ({
    signBuffer: async ({ seedId, keyId, data, ecOptions, enc = 'der' }) => {
      assert(['der', 'raw'].includes(enc), 'signBuffer: invalid enc')
      assert(isValidEcOptions(ecOptions), 'signBuffer: invalid EC option')
      const { privateKey } = getPrivateHDKey({ seedId, keyId })
      const signature = curve.sign(data, privateKey, pick(ecOptions, ['canonical']))
      return enc === 'der' ? Buffer.from(signature.toDER()) : { ...signature }
    },
    signSchnorr: async ({ seedId, keyId, data, tweak }) => {
      assert(isValidTweak(tweak), 'signSchnorr: invalid tweak data')
      const hdkey = getPrivateHDKey({ seedId, keyId })
      const privateKey = tweak ? tweakPrivateKey({ hdkey, scalar: tweak.scalar }) : hdkey.privateKey
      return ecc.signSchnorr(data, privateKey, tweak?.options?.extraEntropy)
    },
    getPublicKey: async ({ seedId, keyId, tweak }) => {
      assert(isValidTweak(tweak), 'getPublicKey: invalid tweak data')
      const hdkey = getPrivateHDKey({ seedId, keyId })
      return tweak ? tweakPublicKey({ hdkey, scalar: tweak.scalar }) : hdkey.publicKey
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
