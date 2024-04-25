import stableStringify from 'json-stable-stringify'
import { mnemonicToSeed } from 'bip39'
import BJSON from 'buffer-json'

import KeyIdentifier from '@exodus/key-identifier'
import memoizedKeychainDefinition from '../memoized-keychain'
import { getSeedId } from '../crypto/seed-id'

const mockStorage = {
  get: jest.fn(),
  set: jest.fn(),
}

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const seedId = getSeedId(seed)

const keyIdentifierEthereum0 = new KeyIdentifier({
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/60'/0'/0/0",
  assetName: 'ethereum',
})

const storage = mockStorage

describe('memoizedKeychain', () => {
  let memoizedKeychain

  beforeEach(() => {
    mockStorage.get.mockResolvedValue(null)
    memoizedKeychain = memoizedKeychainDefinition.factory({ storage })
    memoizedKeychain.addSeed(seed)
    jest.clearAllMocks()
  })

  it('should construct correctly', () => {
    expect(() => memoizedKeychainDefinition.factory({ storage })).not.toThrow()
  })

  it('should clone correctly', () => {
    expect(() => memoizedKeychainDefinition.factory({ storage }).clone()).not.toThrow()
  })

  describe.each([
    {
      name: 'memoized',
      factory: () => {
        const keychain = memoizedKeychainDefinition.factory({ storage })
        keychain.addSeed(seed)
        return keychain
      },
    },
    {
      name: 'memoizedClone',
      factory: () => {
        const clone = memoizedKeychain.clone()
        clone.addSeed(seed)
        return clone
      },
    },
  ])('memoization: $name', ({ factory }) => {
    const storageKey = stableStringify({
      seedId,
      keyId: {
        assetName: 'ethereum',
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/60'/0'/0/0",
        keyType: 'secp256k1',
      },
    })

    const storageData = {
      [storageKey]: {
        xpub: 'xpub6H8P7xAy1nvvefMui3rD6yK3cdkBSAhukKRcxeqydPqdm8L8FAvxu33Hgoajcr8PW1oBPDm7sRdPSoUz55kcCF9LNd5RatNgExPrn8Pvd5P',
        publicKey: Buffer.from('AgyNoIyo7xR+pkMj5TnXkQE/8NtK6dMck+KUghia9w3l', 'base64'),
      },
    }

    it('should retrieve publicKeys from storage at construction', async () => {
      mockStorage.get.mockResolvedValueOnce(BJSON.stringify(storageData))
      factory()
      expect(mockStorage.get).toHaveBeenCalledTimes(1)
    })

    it('should write publicKeys to storage if not found', async () => {
      mockStorage.get.mockResolvedValueOnce(null)
      const keychain = factory()
      const exported = await keychain.exportKey({ seedId, keyId: keyIdentifierEthereum0 })
      expect(mockStorage.set).toHaveBeenCalledTimes(1)
      expect(mockStorage.set).toHaveBeenCalledWith('data1', BJSON.stringify(storageData))
      const exportedFromCache = await keychain.exportKey({ seedId, keyId: keyIdentifierEthereum0 })
      expect(mockStorage.set).toHaveBeenCalledTimes(1)
      expect(exported).toStrictEqual({ privateKey: null, xpriv: null, ...exportedFromCache })
    })

    it('should still allow private keys', async () => {
      mockStorage.get.mockResolvedValueOnce(null)
      const keychain = factory()
      await expect(
        keychain.exportKey({ seedId, keyId: keyIdentifierEthereum0, exportPrivate: true })
      ).resolves.not.toThrow()
    })
  })
})
