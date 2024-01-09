import { assets } from './fixtures/assets'

import { KeyIdentifier, createKeyIdentifierForExodus } from '../key-identifier'

describe('KeyIdentifier', () => {
  it('should fail on incorrect construction', () => {
    const failures = [
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
      },
      {
        derivationPath: "m/44'/60'/0'/0/0",
        asset: assets.ethereum,
      },
      {
        asset: assets.ethereum,
      },
      {
        derivationAlgorithm: 0,
        asset: assets.ethereum,
        derivationPath: "m/44'/60'/0'/0/0",
      },
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
        derivationPath: 0,
      },
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
        derivationPath: "m/44'/60'/0'/0/0dddd",
      },
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
        derivationPath: "m\\44'/60'/0'/0/0",
      },
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
        derivationPath: "m44'/60'/0'/0/0",
      },
    ]

    const failuresAsFunctions = failures.map((failure) => () => {
      return new KeyIdentifier(failure)
    })
    failuresAsFunctions.forEach((failureFunc) => {
      expect(failureFunc).toThrow()
    })
  })

  it('validates KeyIdentifier-likes', () => {
    const valid = [
      new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      }),
      new KeyIdentifier({
        derivationAlgorithm: 'SLIP10',
        assetName: 'solana',
        derivationPath: "m/44'/501'/0'",
      }),
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      },
    ]

    const invalid = [
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
      },
    ]

    valid.forEach((item) => expect(KeyIdentifier.validate(item)).toEqual(true))
    invalid.forEach((item) => expect(KeyIdentifier.validate(item)).toEqual(false))
  })

  describe('.compare()', () => {
    it('should return true when equal', () => {
      const keyIdA = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      })

      const keyIdB = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      })

      expect(KeyIdentifier.compare(keyIdA, keyIdB)).toBe(true)
    })

    it('should return false when not equal', () => {
      const keyIdA = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      })

      const keyIdB = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/1",
      })

      expect(KeyIdentifier.compare(keyIdA, keyIdB)).toBe(false)
      expect(KeyIdentifier.compare('not-an-object', keyIdB)).toBe(false)
    })
  })
})

describe('createKeyIdentifierForExodus', () => {
  it('should work', () => {
    expect(() => createKeyIdentifierForExodus({ exoType: 'FUSION' })).not.toThrow()
  })

  it('should throw when incorrect exoType', async () => {
    expect(() => createKeyIdentifierForExodus({ exoType: 'INVALID' })).toThrow()
  })
})
