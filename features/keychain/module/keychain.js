import ExodusModule from '@exodus/module'
import { fromMasterSeed as bip32FromMasterSeed } from '@exodus/bip32'
import SLIP10 from '@exodus/slip10'
import { mapValues } from '@exodus/basic-utils'
import assert from 'minimalistic-assert'

import { createEd25519Signer } from './crypto/ed25519'
import { createSecp256k1Signer } from './crypto/secp256k1'
import * as sodium from './crypto/sodium'
import { parsePath } from './key-utils'
import {
  throwIfInvalidKeyIdentifier,
  throwIfInvalidMasters,
  throwIfInvalidLegacyPrivToPub,
} from './validate'

const MAP_KDF = Object.freeze({
  BIP32: bip32FromMasterSeed,
  SLIP10: SLIP10.fromSeed,
})

export const MODULE_ID = 'keychain'

export class Keychain extends ExodusModule {
  #masters = null
  #legacyPrivToPub = null

  // TODO: remove default param. Use it temporarily for backward compatibility.
  constructor({ legacyPrivToPub = {}, logger }) {
    super({ name: MODULE_ID, logger })

    throwIfInvalidLegacyPrivToPub(legacyPrivToPub)

    // Create a safe, cloned, frozen map of what was passed to us.
    // We can not deep freeze sadly, because the values are functions and this could
    // still have side-effects where the functions are referencing variables that are still mutable
    // but at this point in time this is the best we can do.
    this.#legacyPrivToPub = Object.assign(Object.create(null), legacyPrivToPub)
    Object.freeze(this.#legacyPrivToPub)
  }

  unlock({ seed }) {
    assert(Buffer.isBuffer(seed) && seed.length === 64, 'seed must be buffer of 64 bytes')
    const masters = Object.assign(
      Object.create(null),
      mapValues(MAP_KDF, (fromSeed) => fromSeed(seed))
    )
    throwIfInvalidMasters(masters)
    this.#masters = masters
  }

  lock() {
    this.#masters = null
  }

  // Note: keep as non-arrow function to allow subclassing
  #getPrivateHDKey = (keyId) => {
    throwIfInvalidKeyIdentifier(keyId)
    throwIfInvalidMasters(this.#masters)

    const { derivationAlgorithm, derivationPath } = keyId
    return this.#masters[derivationAlgorithm].derive(derivationPath)
  }

  async exportKey(keyId, { exportPrivate } = {}) {
    const hdkey = this.#getPrivateHDKey(keyId)
    const privateKey = hdkey.privateKey
    let publicKey = hdkey.publicKey

    if (keyId.keyType === 'legacy') {
      if (keyId.assetName in this.#legacyPrivToPub) {
        const legacyPrivToPub = this.#legacyPrivToPub[keyId.assetName]
        publicKey = await legacyPrivToPub(privateKey)
      } else {
        throw new Error(`asset name ${keyId.assetName} has no legacyPrivToPub mapper`)
      }
    } else if (keyId.derivationAlgorithm !== 'SLIP10' && keyId.keyType === 'nacl') {
      // SLIP10 already produces the correct public key for curve ed25119
      // so we can safely skip using the privToPub mapper.
      publicKey = await sodium.privToPub(privateKey)
    }

    const { xpriv, xpub } = hdkey.toJSON()
    return {
      xpub,
      xpriv: exportPrivate ? xpriv : null,
      publicKey,
      privateKey: exportPrivate ? privateKey : null,
    }
  }

  async signTx(keyIds, signTxWithHD, unsignedTx) {
    assert(typeof signTxWithHD === 'function', 'signTxWithHD must be a function')
    const hdkeys = Object.fromEntries(
      keyIds.map((keyId) => {
        const hdkey = this.#getPrivateHDKey(keyId)
        const { purpose } = parsePath(keyId.derivationPath)
        return [String(purpose), hdkey]
      })
    )

    const hdKeyList = Object.values(hdkeys)
    // most asset only care about the purpose 44 derived private key
    const privateKey = hdKeyList.length === 1 ? hdKeyList[0].privateKey : undefined
    // signTxWithHD is already an asset-specific signing function
    return signTxWithHD({ unsignedTx, hdkeys, privateKey })
  }

  createSodiumEncryptor(keyId) {
    const { privateKey: sodiumSeed } = this.#getPrivateHDKey(keyId)
    return sodium.createSodiumEncryptor(sodiumSeed)
  }

  // Ed25519 EdDSA
  createEd25519Signer(keyId) {
    const { privateKey } = this.#getPrivateHDKey(keyId)
    return createEd25519Signer(privateKey)
  }

  // Secp256k1 EcDSA
  createSecp256k1Signer(keyId) {
    const { privateKey } = this.#getPrivateHDKey(keyId)
    return createSecp256k1Signer(privateKey)
  }

  clone() {
    return new Keychain({ legacyPrivToPub: this.#legacyPrivToPub })
  }
}

const createKeychain = (args = {}) => new Keychain({ ...args })

export default {
  id: MODULE_ID,
  type: 'module',
  factory: createKeychain,
  dependencies: ['legacyPrivToPub', 'logger'],
}
