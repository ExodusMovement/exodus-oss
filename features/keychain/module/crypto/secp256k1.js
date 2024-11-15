import assert from 'minimalistic-assert'
import * as secp256k1 from '@exodus/crypto/secp256k1'
import { mapValues } from '@exodus/basic-utils'
import BN from 'bn.js'

import { tweakPrivateKey } from './tweak.js'

export const create = ({ getPrivateHDKey }) => {
  const createInstance = () => ({
    signBuffer: async ({ seedId, keyId, data, enc = 'der', extraEntropy = null }) => {
      assert(
        keyId.keyType === 'secp256k1',
        `ECDSA signatures are not supported for ${keyId.keyType}`
      )
      if (enc === 'binary') enc = 'sig|rec'
      assert(
        ['der', 'raw', 'sig', 'sig|rec', 'rec|sig', 'sig,rec'].includes(enc),
        'signBuffer: invalid enc'
      )
      const { privateKey } = getPrivateHDKey({ seedId, keyId })
      const res = await secp256k1.ecdsaSignHash({
        hash: data,
        privateKey,
        extraEntropy,
        der: enc === 'der',
        recovery: enc !== 'der' && enc !== 'sig',
        format: 'buffer',
      })
      if (enc === 'der' || enc === 'sig' || enc === 'sig,rec') return res
      const { signature, recovery } = res
      if (enc === 'sig|rec') return Buffer.concat([signature, new Uint8Array([recovery])])
      if (enc === 'rec|sig') return Buffer.concat([new Uint8Array([recovery]), signature])
      if (enc === 'raw') {
        // Deprecated, compatibility mode with manual signature encoding
        // TODO: remove in next semver-major together with bn.js dep, see https://github.com/ExodusMovement/exodus-oss/pull/159
        return {
          r: new BN(signature.subarray(0, signature.length / 2)),
          s: new BN(signature.subarray(signature.length / 2)),
          recoveryParam: recovery,
        }
      }

      throw new Error('Unreachable')
    },
    signSchnorr: async ({ seedId, keyId, data, tweak, extraEntropy }) => {
      assert(
        keyId.keyType === 'secp256k1',
        `Schnorr signatures are not supported for ${keyId.keyType}`
      )
      const hdkey = getPrivateHDKey({ seedId, keyId })
      const privateKey = tweak ? tweakPrivateKey({ hdkey, tweak }) : hdkey.privateKey
      return Buffer.from(await secp256k1.schnorrSign({ data, privateKey, extraEntropy }))
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
