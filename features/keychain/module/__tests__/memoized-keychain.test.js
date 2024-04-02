import KeyIdentifier from '@exodus/key-identifier'
import BJSON from 'buffer-json'
import stableStringify from 'json-stable-stringify'

import memoizedKeychainDefinition, { CACHE_KEY } from '../memoized-keychain'
import { Keychain } from '../keychain'

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('MemoizedKeychain', () => {
  const keyId = new KeyIdentifier({
    assetName: 'ethereum',
    derivationAlgorithm: 'BIP32',
    derivationPath: "m/44'/60'/0'/0/1",
  })

  const cachedKey = {
    xpub: 'cached-xpub',
    publicKey: 'cached-compressed-public-key',
  }
  const retrievedKey = {
    xpub: 'retrieved-xpub',
    publicKey: 'retrieved-compressed-public-key',
    privateKey: 'retrieved-compressed-public-key',
  }

  const setup = async ({ prefilledCache = true } = {}) => {
    jest.spyOn(Keychain.prototype, 'exportKey').mockResolvedValue(retrievedKey)

    const storage = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }

    storage.get.mockResolvedValue(
      BJSON.stringify(
        prefilledCache
          ? {
              [stableStringify(keyId)]: cachedKey,
            }
          : {}
      )
    )

    const keychain = memoizedKeychainDefinition.factory({ storage })
    await tick()

    return {
      keychain,
      storage,
    }
  }

  it('should load storage into memory when initialized', async () => {
    const { keychain } = await setup()

    await expect(keychain.exportKey(keyId)).resolves.toEqual(cachedKey)
  })

  it('should get cached value when available', async () => {
    const { keychain } = await setup()

    await expect(keychain.exportKey(keyId)).resolves.toEqual(cachedKey)
  })

  it('should avoid cache when requesting private key', async () => {
    const { keychain } = await setup()

    await expect(keychain.exportKey(keyId, { exportPrivate: true })).resolves.toEqual(retrievedKey)
  })

  it('should only cache public key', async () => {
    const { keychain, storage } = await setup({ prefilledCache: false })

    await expect(keychain.exportKey(keyId)).resolves.toEqual(retrievedKey)
    expect(storage.set).toHaveBeenCalledWith(
      CACHE_KEY,
      BJSON.stringify({
        [stableStringify(keyId)]: {
          xpub: retrievedKey.xpub,
          publicKey: retrievedKey.publicKey,
        },
      })
    )
  })

  it('should properly clear all caches', async () => {
    const { keychain, storage } = await setup()
    await expect(keychain.exportKey(keyId)).resolves.toEqual(cachedKey)

    await keychain.clear()

    const key = await keychain.exportKey(keyId)
    expect(key).toEqual(retrievedKey)
    expect(storage.delete).toHaveBeenCalledWith(CACHE_KEY)
  })
})
