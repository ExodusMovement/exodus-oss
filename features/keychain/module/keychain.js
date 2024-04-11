import ExodusModule from '@exodus/module'
import { parseDerivationPath } from '@exodus/key-utils'
import { fromMasterSeed as bip32FromMasterSeed } from '@exodus/bip32'
import SLIP10 from '@exodus/slip10'
import { mapValues } from '@exodus/basic-utils'
import assert from 'minimalistic-assert'

import * as ed25519 from './crypto/ed25519'
import * as secp256k1 from './crypto/secp256k1'
import * as sodium from './crypto/sodium'
import {
  throwIfInvalidKeyIdentifier,
  throwIfInvalidMasters,
  throwIfInvalidLegacyPrivToPub,
} from './validate'

const MAP_KDF = Object.freeze({
  BIP32: bip32FromMasterSeed,
  SLIP10: SLIP10.fromSeed,
})

const getSeedId = (seed) => bip32FromMasterSeed(seed)._hdkey._identifier.toString('hex')

export const MODULE_ID = 'keychain'

export class Keychain extends ExodusModule {
  #masters = null
  #legacyPrivToPub = null
  #privateKeysAreLocked = false
  #getPrivateHDKeySymbol = Symbol('getPrivateHDKey')

  // TODO: remove default param. Use it temporarily for backward compatibility.
  constructor({ legacyPrivToPub = Object.create(null), logger }) {
    super({ name: MODULE_ID, logger })

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
    assert(seeds.length === 1, 'must pass in same number of seeds')

    const seedId = getSeedId(seeds[0])

    assert(
      seedId === this.#masters.BIP32._hdkey._identifier.toString('hex'),
      'must pass in existing seed'
    )

    this.#privateKeysAreLocked = false
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
    this.#privateKeysAreLocked = false
  }

  #getPrivateHDKey = ({ keyId, getPrivateHDKeySymbol }) => {
    if (getPrivateHDKeySymbol !== this.#getPrivateHDKeySymbol) this.#assertPrivateKeysUnlocked()
    throwIfInvalidKeyIdentifier(keyId)
    throwIfInvalidMasters(this.#masters)

    const { derivationAlgorithm, derivationPath } = keyId
    return this.#masters[derivationAlgorithm].derive(derivationPath)
  }

  async exportKey(keyId, { exportPrivate } = Object.create(null)) {
    if (exportPrivate) this.#assertPrivateKeysUnlocked()

    const hdkey = this.#getPrivateHDKey({
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

  async signTx(keyIds, signTxWithHD, unsignedTx) {
    this.#assertPrivateKeysUnlocked()
    assert(typeof signTxWithHD === 'function', 'signTxWithHD must be a function')
    const hdkeys = Object.fromEntries(
      keyIds.map((keyId) => {
        const hdkey = this.#getPrivateHDKey({ keyId })
        const { purpose } = parseDerivationPath(keyId.derivationPath)
        return [String(purpose), hdkey]
      })
    )

    const hdKeyList = Object.values(hdkeys)
    // most asset only care about the purpose 44 derived private key
    const privateKey = hdKeyList.length === 1 ? hdKeyList[0].privateKey : undefined
    // signTxWithHD is already an asset-specific signing function
    return signTxWithHD({ unsignedTx, hdkeys, privateKey })
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
  dependencies: ['legacyPrivToPub', 'logger'],
}

export default keychainDefinition
