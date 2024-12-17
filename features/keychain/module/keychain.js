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
import { getSeedId, getUniqueSeedIds } from './crypto/seed-id.js'

const MAP_KDF = Object.freeze({
  BIP32: bip32FromMasterSeed,
  SLIP10: SLIP10.fromSeed,
})

export const MODULE_ID = 'keychain'

export class Keychain {
  #masters = Object.create(null)
  #legacyPrivToPub = null
  #seedLockStatus = Object.create(null)
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

  #assertPrivateKeysUnlocked(seedIds) {
    const locked = this.#checkPrivateKeysLocked(seedIds)
    assert(!locked, 'private keys are locked')
  }

  #checkPrivateKeysLocked(seedIds) {
    if (!seedIds?.length) {
      return Object.values(this.#seedLockStatus).some(Boolean)
    }

    return seedIds.some((seedId) => {
      assert(
        Object.hasOwn(this.#seedLockStatus, seedId),
        `cannot check lock state for unknown seed "${seedId}"`
      )
      return this.#seedLockStatus[seedId]
    })
  }

  arePrivateKeysLocked(seeds = []) {
    assert(Array.isArray(seeds), 'seeds must be an array')
    const seedIds = getUniqueSeedIds(seeds)
    return this.#checkPrivateKeysLocked(seedIds)
  }

  lockPrivateKeys() {
    const seedIds = Object.keys(this.#masters)
    this.#seedLockStatus = seedIds.reduce((acc, seedId) => {
      acc[seedId] = true
      return acc
    }, Object.create(null))
  }

  unlockPrivateKeys(seeds = []) {
    const seedIds = getUniqueSeedIds(seeds)

    const existingSeedIds = Object.keys(this.#masters)
    for (const seedId of seedIds) {
      const hasSeed = existingSeedIds.includes(seedId)
      assert(hasSeed, 'must pass in existing seed')
    }

    for (const seedId of seedIds) {
      this.#seedLockStatus[seedId] = false
    }
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
    // manually unlock here since unlockPrivateKeys requires seed to already exist
    this.#seedLockStatus[seedId] = false
    return seedId
  }

  removeAllSeeds() {
    this.#masters = Object.create(null)
    this.#seedLockStatus = Object.create(null)
  }

  removeSeeds(seeds = []) {
    const seedIds = getUniqueSeedIds(seeds)
    const existingSeedIds = new Set([
      ...Object.keys(this.#masters),
      ...Object.keys(this.#seedLockStatus),
    ])
    const seedIdsToRemove = seedIds.filter((seedId) => existingSeedIds.has(seedId))

    for (const id of seedIdsToRemove) {
      delete this.#masters[id]
      delete this.#seedLockStatus[id]
    }

    return seedIdsToRemove
  }

  #getPrivateHDKey = ({ seedId, keyId, getPrivateHDKeySymbol }) => {
    if (getPrivateHDKeySymbol !== this.#getPrivateHDKeySymbol) {
      this.#assertPrivateKeysUnlocked(seedId ? [seedId] : undefined)
    }

    throwIfInvalidKeyIdentifier(keyId)
    assert(typeof seedId === 'string', 'seedId must be a BIP32 key identifier in hex encoding')
    assert(this.#masters[seedId], `seed "${seedId}" is not initialized`)

    throwIfInvalidMasters(this.#masters[seedId])

    const { derivationAlgorithm, derivationPath } = keyId
    return this.#masters[seedId][derivationAlgorithm].derive(derivationPath)
  }

  #getPublicKeyFromHDKey = async (hdkey) => {
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

    return publicKey
  }

  async exportKey({ seedId, keyId, exportPrivate }) {
    assert(typeof seedId === 'string', 'seedId must be a string')

    if (exportPrivate) {
      this.#assertPrivateKeysUnlocked([seedId])
    }

    const hdkey = this.#getPrivateHDKey({
      seedId,
      keyId: new KeyIdentifier(keyId),
      getPrivateHDKeySymbol: this.#getPrivateHDKeySymbol,
    })
    const publicKey = await this.#getPublicKeyFromHDKey(hdkey)

    const { xpriv, xpub } = hdkey.toJSON()
    return {
      xpub,
      xpriv: exportPrivate ? xpriv : null,
      publicKey,
      privateKey: exportPrivate ? hdkey.privateKey : null,
    }
  }

  async getPublicKey({ seedId, keyId }) {
    assert(typeof seedId === 'string', 'seedId must be a string')

    const hdkey = this.#getPrivateHDKey({
      seedId,
      keyId: new KeyIdentifier(keyId),
      getPrivateHDKeySymbol: this.#getPrivateHDKeySymbol,
    })

    return this.#getPublicKeyFromHDKey(hdkey)
  }

  async signBuffer({ seedId, keyId, data, signatureType, enc, tweak, extraEntropy }) {
    const noTweak = tweak === undefined
    const noEnc = enc === undefined
    const noOpts = noEnc && noTweak && extraEntropy === undefined

    assert(data instanceof Uint8Array, `expected "data" to be a Uint8Array, got: ${typeof data}`)
    assert(
      (['ecdsa', 'schnorr', 'schnorrZ'].includes(signatureType) && keyId.keyType === 'secp256k1') ||
        (signatureType === 'ed25519' && keyId.keyType === 'nacl'),
      `"keyId.keyType" ${keyId.keyType} does not support "signatureType" ${signatureType}`
    )

    if (signatureType === 'ed25519') {
      assert(noOpts, 'unsupported options supplied for ed25519 signature')
      return this.ed25519.signBuffer({ seedId, keyId, data })
    }

    if (signatureType === 'schnorrZ') {
      assert(noOpts, 'unsupported options supplied for schnorrZ signature')
      return this.secp256k1.signSchnorrZ({ seedId, keyId, data })
    }

    // only accept 32 byte buffers for ecdsa
    assert(data.length === 32, `expected "data" to have 32 bytes, got: ${data.length}`)

    if (signatureType === 'schnorr') {
      assert(noEnc, 'unsupported options supplied for schnorr signature')
      return this.secp256k1.signSchnorr({ seedId, keyId, data, tweak, extraEntropy })
    }

    // signatureType === 'ecdsa'
    assert(noTweak, 'unsupported options supplied for ecdsa signature')
    return this.secp256k1.signBuffer({ seedId, keyId, data, enc, extraEntropy })
  }

  // @deprecated use keychain.signBuffer() instead
  async signTx({ seedId, keyIds, signTxCallback, unsignedTx }) {
    this.#assertPrivateKeysUnlocked(seedId ? [seedId] : undefined)
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
  public: true,
  factory: createKeychain,
  dependencies: ['legacyPrivToPub'],
}

export default keychainDefinition
