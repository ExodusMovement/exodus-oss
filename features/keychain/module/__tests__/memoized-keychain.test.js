import createInMemoryStorage from '@exodus/storage-memory'
import { mnemonicToSeed } from 'bip39'

import keychainDefinition from '../keychain'
import { KeyIdentifier } from '../key-identifier'
import memoizedKeychainDefinition from '../memoized-keychain'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const keyIdentifierEthereum0 = new KeyIdentifier({
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/60'/0'/0/0",
  assetName: 'ethereum',
})

const keyIdentifierEthereum1 = new KeyIdentifier({
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/60'/0'/0/1",
  assetName: 'ethereum',
})

const logger = console

describe('memoizedKeychain', () => {
  let keychain
  let memoizedKeychain
  let storage
  beforeEach(() => {
    keychain = keychainDefinition.factory({ logger })
    storage = createInMemoryStorage()
    memoizedKeychain = memoizedKeychainDefinition.factory({
      storage,
      logger,
    })

    memoizedKeychain.unlock({ seed })
  })

  it('should construct correctly', () => {
    expect(() => memoizedKeychainDefinition.factory({ keychain, storage, logger })).not.toThrow()
  })

  describe.each([
    { name: 'memoized', factory: () => memoizedKeychain },
    {
      name: 'memoizedClone',
      factory: () => {
        const clone = memoizedKeychain.clone()
        clone.unlock({ seed })
        return clone
      },
    },
  ])('memoization: $name', ({ factory }) => {
    it('should memoize publicKeys in storage', async () => {
      const exported = await memoizedKeychain.exportKey(keyIdentifierEthereum0)
      await memoizedKeychain.exportKey(keyIdentifierEthereum1)
      const exportedFromCache = await memoizedKeychain.exportKey(keyIdentifierEthereum0)

      keychain.unlock({ seed })
      const actual = await keychain.exportKey(keyIdentifierEthereum0)
      ;[exported, exportedFromCache].forEach((expected) => {
        expect(actual.xpub).toEqual(expected.xpub)
        expect(actual.publicKey).toEqual(expected.publicKey)
        expect(actual.xpriv).toBeFalsy()
        expect(actual.privateKey).toBeFalsy()
      })
    })
  })
})
