import assert from 'minimalistic-assert'
import { Keychain } from './keychain'
import { getSeedId } from './crypto/seed-id'

const MODULE_ID = 'multiSeedKeychain'

class MultiSeedKeychain {
  #keychains = Object.create(null)
  #defaultSeedId
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
          async ({ walletAccount, ...rest }) =>
            this.#getKeychainForWalletAccount(walletAccount).sodium[key](rest),
      }
    )

    this.secp256k1 = new Proxy(
      {},
      {
        get:
          (target, key) =>
          async ({ walletAccount, ...rest }) =>
            this.#getKeychainForWalletAccount(walletAccount).secp256k1[key](rest),
      }
    )

    this.ed25519 = new Proxy(
      {},
      {
        get:
          (target, key) =>
          async ({ walletAccount, ...rest }) =>
            this.#getKeychainForWalletAccount(walletAccount).ed25519[key](rest),
      }
    )
  }

  #getKeychainForWalletAccount = (walletAccount) => {
    assert(this.#keychains, 'keychain is locked')

    const seedId = walletAccount.source === 'exodus' ? this.#defaultSeedId : walletAccount.id
    assert(seedId, `walletAccount has no seed id: ${seedId}`)
    assert(this.#keychains[seedId], `keychain not found for seed id: ${seedId}`)
    return this.#keychains[seedId]
  }

  lock = () => {
    this.#keychains = null
    this.#defaultSeedId = null
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

  setDefaultSeed = (seed) => {
    this.#defaultSeedId = this.#initKeychain(seed)
  }

  addSeed = (seed) => {
    assert(this.#keychains, 'keychain is locked')
    assert(this.#defaultSeedId, 'default seed not set')
    this.#initKeychain(seed)
  }

  // unlock({ seeds, defaultSeed }) {
  //   assert(
  //     seeds.find((seed) => seed.equals(defaultSeed)),
  //     'default seed not found'
  //   )

  //   this.#defaultSeedId = getSeedId(defaultSeed)
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

  async signTx({ walletAccount, keyIds, signTxWithHD, unsignedTx }) {
    return this.#getKeychainForWalletAccount(walletAccount).signTx(keyIds, signTxWithHD, unsignedTx)
  }

  async exportKey({ walletAccount, keyId, exportPrivate }) {
    return this.#getKeychainForWalletAccount(walletAccount).exportKey(keyId, {
      exportPrivate,
    })
  }

  async clear() {
    if (!this.#keychains) return

    await Promise.all(Object.values(this.#keychains).map((keychain) => keychain.clear()))
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
