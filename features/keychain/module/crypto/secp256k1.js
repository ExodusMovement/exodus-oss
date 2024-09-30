import assert from 'minimalistic-assert'
import * as secp256k1 from '@exodus/crypto/secp256k1'
import elliptic from '@exodus/elliptic'
import { mapValues } from '@exodus/basic-utils'

import { tweakPrivateKey } from './tweak.js'

const isValidEcOptions = (ecOptions) =>
  !ecOptions || Object.keys(ecOptions).every((key) => ['canonical', 'pers'].includes(key))

const encodeSignature = ({ signature, enc }) => {
  if (enc === 'der') return Buffer.from(signature.toDER())

  if (enc === 'raw') return { ...signature }

  const r = Buffer.from(signature.r.toArray('be', 32))
  const s = Buffer.from(signature.s.toArray('be', 32))
  return Buffer.concat([r, s, Buffer.from([signature.recoveryParam])])
}

export const create = ({ getPrivateHDKey }) => {
  const EC = elliptic.ec
  const curve = new EC('secp256k1')

  const createInstance = () => ({
    signBuffer: async ({ seedId, keyId, data, ecOptions, enc = 'der' }) => {
      assert(
        keyId.keyType === 'secp256k1',
        `ECDSA signatures are not supported for ${keyId.keyType}`
      )
      assert(['der', 'raw', 'binary'].includes(enc), 'signBuffer: invalid enc')
      assert(isValidEcOptions(ecOptions), 'signBuffer: invalid EC option')
      const { privateKey } = getPrivateHDKey({ seedId, keyId })
      const signature = curve.sign(data, privateKey, ecOptions)
      return encodeSignature({ signature, enc })
    },
    signSchnorr: async ({ seedId, keyId, data, tweak, extraEntropy }) => {
      assert(
        keyId.keyType === 'secp256k1',
        `Schnorr signatures are not supported for ${keyId.keyType}`
      )
      const hdkey = getPrivateHDKey({ seedId, keyId })
      const privateKey = tweak ? tweakPrivateKey({ hdkey, tweak }) : hdkey.privateKey
      return secp256k1.schnorrSign({ data, privateKey, extraEntropy })
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
