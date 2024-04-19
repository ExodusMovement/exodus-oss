import assert from 'minimalistic-assert'
import elliptic from '@exodus/elliptic'
import { mapValues, pick } from '@exodus/basic-utils'
import ecc from '@exodus/bitcoinerlab-secp256k1'

import { tweakPrivateKey, tweakPublicKey } from './tweak'

const validEcOptions = (ecOptions) =>
  !ecOptions || Object.keys(ecOptions).every((key) => ['canonical'].includes(key))

const validTweakOptions = (tweakOptions) =>
  !tweakOptions ||
  Object.keys(tweakOptions).every((key) => ['tweakHash', 'extraEntropy'].includes(key))

export const create = ({ getPrivateHDKey }) => {
  const EC = elliptic.ec
  const curve = new EC('secp256k1')

  const createInstance = () => ({
    signBuffer: async ({ seedId, keyId, data, ecOptions, enc = 'der' }) => {
      assert(['der', 'raw'].includes(enc), 'signBuffer: invalid enc')
      assert(validEcOptions(ecOptions), 'signBuffer: invalid EC option')
      const { privateKey } = getPrivateHDKey({ seedId, keyId })
      const signature = curve.sign(data, privateKey, pick(ecOptions, ['canonical']))
      return enc === 'der' ? Buffer.from(signature.toDER()) : { ...signature }
    },
    signSchnorr: async ({ seedId, keyId, data, tweak = false, tweakOptions }) => {
      assert(validTweakOptions(tweakOptions), 'signSchnorr: invalid tweak options')
      const hdkey = getPrivateHDKey({ seedId, keyId })
      const privateKey = tweak ? tweakPrivateKey({ hdkey, tweakOptions }) : hdkey.privateKey
      return ecc.signSchnorr(data, privateKey, tweakOptions?.extraEntropy)
    },
    getPublicKey: async ({ seedId, keyId, tweak = false, tweakOptions }) => {
      assert(validTweakOptions(tweakOptions), 'getPublicKey: invalid tweak options')
      const hdkey = getPrivateHDKey({ seedId, keyId })
      return tweak ? tweakPublicKey({ hdkey, tweakOptions }) : hdkey.publicKey
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
