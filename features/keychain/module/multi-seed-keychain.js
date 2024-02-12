import assert from 'minimalistic-assert'
import { Keychain } from './keychain'
import { getSeedId } from './crypto/seed-id'

const MODULE_ID = 'multiSeedKeychain'

class MultiSeedKeychain {
  #keychains = Object.create(null)
  #primarySeedId
  #legacyPrivToPub
  #logger

  constructor({ legacyPrivToPub = Object.create(null), logger }) {
    this.#legacyPrivToPub = legacyPrivToPub
    this.#logger = logger
    this.sodium = new Proxy(
      {},
      {
        get:
          (target, key) =>
          async ({ seedIdentifier, ...rest }) =>
            this.#getKeychainForSeed(seedIdentifier).sodium[key](rest),
      }
    )

    this.secp256k1 = new Proxy(
      {},
      {
        get:
          (target, key) =>
          async ({ seedIdentifier, ...rest }) =>
            this.#getKeychainForSeed(seedIdentifier).secp256k1[key](rest),
      }
    )

    this.ed25519 = new Proxy(
      {},
      {
        get:
          (target, key) =>
          async ({ seedIdentifier, ...rest }) =>
            this.#getKeychainForSeed(seedIdentifier).ed25519[key](rest),
      }
    )
  }

  #getKeychainForSeed = (seedIdentifier) => {
    assert(this.#keychains, 'keychain is locked')
    assert(typeof seedIdentifier === 'string', 'expected seedIdentifier')

    const seedIdentifierHex = seedIdentifier.toString('hex')
    const keychain = this.#keychains[seedIdentifierHex]
    assert(keychain, `keychain not found for seed id: ${seedIdentifierHex}`)
    return keychain
  }

  lock = () => {
    this.#keychains = null
    this.#primarySeedId = null
  }

  #initKeychain = (seed) => {
    assert(Buffer.isBuffer(seed) && seed.length === 64, 'seed must be a 64 byte buffer')

    if (!this.#keychains) this.#keychains = Object.create(null)

    const seedId = getSeedId(seed)
    if (this.#keychains[seedId]) throw new Error(`already have seed with id: ${seedId}`)

    const keychain = new Keychain({
      legacyPrivToPub: this.#legacyPrivToPub,
      logger: this.#logger,
    })

    keychain.unlock({ seed })

    this.#keychains[seedId] = keychain
    return seedId
  }

  setPrimarySeed = (seed) => {
    this.#primarySeedId = this.#initKeychain(seed)
    return this.#primarySeedId
  }

  addSeed = (seed) => {
    assert(this.#keychains, 'keychain is locked')
    assert(this.#primarySeedId, 'primary seed not set')
    return this.#initKeychain(seed)
  }

  // unlock({ seeds, primarySeed }) {
  //   assert(
  //     seeds.find((seed) => seed.equals(primarySeed)),
  //     'default seed not found'
  //   )

  //   this.#primarySeedId = getSeedId(primarySeed)
  //   this.#keychains = Object.fromEntries(
  //     seeds.map((seed) => {
  //       const keychain = new Keychain({
  //         legacyPrivToPub: this.#legacyPrivToPub,
  //         logger: this.#logger,
  //       })

  //       keychain.unlock({ seed })
  //       return [keychain.getSeedId(), keychain]
  //     })
  //   )
  // }

  async signTx({ seedIdentifier, keyIds, signTxCallback, unsignedTx }) {
    return this.#getKeychainForSeed(seedIdentifier).signTx(keyIds, signTxCallback, unsignedTx)
  }

  async exportKey({ seedIdentifier, keyId, exportPrivate }) {
    return this.#getKeychainForSeed(seedIdentifier).exportKey(keyId, {
      exportPrivate,
    })
  }

  async clear() {
    if (!this.#keychains) return

    await Promise.all(Object.values(this.#keychains).map((keychain) => keychain.clear()))
  }

  clone() {
    return new MultiSeedKeychain({
      legacyPrivToPub: this.#legacyPrivToPub,
      logger: this.#logger,
    })
  }
}

const createMultiSeedKeychain = (opts = Object.create(null)) => new MultiSeedKeychain(opts)

const multiSeedKeychainDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createMultiSeedKeychain,
  dependencies: ['legacyPrivToPub', 'logger'],
}

export default multiSeedKeychainDefinition
