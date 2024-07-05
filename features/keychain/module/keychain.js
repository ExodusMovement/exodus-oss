import KeyIdentifier from '@exodus/key-identifier'
import { parseDerivationPath } from '@exodus/key-utils'
import { fromMasterSeed as bip32FromMasterSeed } from '@exodus/bip32'
import SLIP10 from '@exodus/slip10'
import { mapValues } from '@exodus/basic-utils'
import assert from 'minimalistic-assert'

import * as ed25519 from './crypto/ed25519.js'
import * as secp256k1 from './crypto/secp256k1.js'
import * as sodium from './crypto/sodium.js'
import {
  throwIfInvalidKeyIdentifier,
  throwIfInvalidMasters,
  throwIfInvalidLegacyPrivToPub,
} from './validate.js'
import { getSeedId } from './crypto/seed-id.js'

const MAP_KDF = Object.freeze({
  BIP32: bip32FromMasterSeed,
  SLIP10: SLIP10.fromSeed,
})

export const MODULE_ID = 'keychain'

export class Keychain {
  #masters = Object.create(null)
  #legacyPrivToPub = null
  #privateKeysAreLocked = false
  #getPrivateHDKeySymbol = Symbol('getPrivateHDKey')

  // TODO: remove default param. Use it temporarily for backward compatibility.
  constructor({ legacyPrivToPub = Object.create(null) }) {
    throwIfInvalidLegacyPrivToPub(legacyPrivToPub)

    // Create a safe, cloned, frozen map of what was passed to us.
    // We can not deep freeze sadly, because the values are functions and this could
    // still have side-effects where the functions are referencing variables that are still mutable
    // but at this point in time this is the best we can do.
    this.#legacyPrivToPub = Object.assign(Object.create(null), legacyPrivToPub)
    Object.freeze(this.#legacyPrivToPub)

    this.sodium = sodium.create({ getPrivateHDKey: this.#getPrivateHDKey })
    this.ed25519 = ed25519.create({ getPrivateHDKey: this.#getPrivateHDKey })
    this.secp256k1 = secp256k1.create({ getPrivateHDKey: this.#getPrivateHDKey })
  }

  #assertPrivateKeysUnlocked() {
    assert(!this.#privateKeysAreLocked, 'private keys are locked')
  }

  arePrivateKeysLocked() {
    return this.#privateKeysAreLocked
  }

  lockPrivateKeys() {
    this.#privateKeysAreLocked = true
  }

  unlockPrivateKeys(seeds) {
    assert(this.#privateKeysAreLocked, 'already unlocked')
    assert(
      seeds?.length === Object.values(this.#masters).length,
      'must pass in same number of seeds'
    )
    const seedIds = new Set(seeds.map((seed) => getSeedId(seed)))
    for (const seedId of Object.keys(this.#masters)) {
      assert(seedIds.has(seedId), 'must pass in existing seed')
    }

    this.#privateKeysAreLocked = false
  }

  addSeed(seed) {
    assert(Buffer.isBuffer(seed) && seed.length === 64, 'seed must be buffer of 64 bytes')
    const masters = Object.assign(
      Object.create(null),
      mapValues(MAP_KDF, (fromSeed) => fromSeed(seed))
    )
    throwIfInvalidMasters(masters)

    const seedId = getSeedId(seed)
    this.#masters[seedId] = masters
    return seedId
  }

  removeAllSeeds() {
    this.#masters = Object.create(null)
    this.#privateKeysAreLocked = false
  }

  #getPrivateHDKey = ({ seedId, keyId, getPrivateHDKeySymbol }) => {
    if (getPrivateHDKeySymbol !== this.#getPrivateHDKeySymbol) this.#assertPrivateKeysUnlocked()
    throwIfInvalidKeyIdentifier(keyId)

    assert(typeof seedId === 'string', 'seedId must be a BIP32 key identifier in hex encoding')
    assert(this.#masters[seedId], `seed "${seedId}" is not initialized`)

    throwIfInvalidMasters(this.#masters[seedId])

    const { derivationAlgorithm, derivationPath } = keyId
    return this.#masters[seedId][derivationAlgorithm].derive(derivationPath)
  }

  async exportKey({ seedId, keyId, exportPrivate }) {
    if (exportPrivate) this.#assertPrivateKeysUnlocked()
    keyId = new KeyIdentifier(keyId)

    const hdkey = this.#getPrivateHDKey({
      seedId,
      keyId,
      getPrivateHDKeySymbol: this.#getPrivateHDKeySymbol,
    })
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

  async signTx({ seedId, keyIds, signTxCallback, unsignedTx }) {
    this.#assertPrivateKeysUnlocked()
    assert(typeof signTxCallback === 'function', 'signTxCallback must be a function')
    const hdkeys = Object.fromEntries(
      keyIds.map((keyId) => {
        const hdkey = this.#getPrivateHDKey({ seedId, keyId })
        const { purpose } = parseDerivationPath(keyId.derivationPath)
        return [String(purpose), hdkey]
      })
    )

    const hdKeyList = Object.values(hdkeys)
    // most asset only care about the purpose 44 derived private key
    const privateKey = hdKeyList.length === 1 ? hdKeyList[0].privateKey : undefined
    // signTxCallback is already an asset-specific signing function
    return signTxCallback({ unsignedTx, hdkeys, privateKey })
  }

  // @deprecated use keychain.sodium instead
  createSodiumEncryptor(keyId) {
    return this.sodium.createEncryptor({ keyId })
  }

  // @deprecated use keychain.ed25519 instead
  createEd25519Signer(keyId) {
    return this.ed25519.createSigner({ keyId })
  }

  // @deprecated use keychain.secp256k1 instead
  createSecp256k1Signer(keyId) {
    return this.secp256k1.createSigner({ keyId })
  }

  clone() {
    return new Keychain({ legacyPrivToPub: this.#legacyPrivToPub })
  }

  async clear() {
    // noop
  }
}

const createKeychain = (args = Object.create(null)) => new Keychain({ ...args })

const keychainDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createKeychain,
  dependencies: ['legacyPrivToPub'],
}

export default keychainDefinition
