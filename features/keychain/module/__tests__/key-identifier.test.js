import { assets } from './fixtures/assets'

import { KeyIdentifier } from '../key-identifier'

describe('KeyIdentifier', () => {
  it('should fail on incorrect construction', () => {
    const failures = [
      null,
      undefined,
      {},
      // Missing parameters
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
      },
      {
        derivationPath: `m/44'/60'/0'/0/0`,
        asset: assets.ethereum,
      },
      {
        derivationAlgorithm: 'BIP32',
      },
      {
        derivationPath: `m/44'/60'/0'/0/0`,
      },
      {
        asset: assets.ethereum,
      },
      // Incorrect types
      {
        derivationAlgorithm: 0,
        asset: assets.ethereum,
        derivationPath: `m/44'/60'/0'/0/0`,
      },
      {
        derivationAlgorithm: 'BIP32',
        assetName: 0,
        derivationPath: `m/44'/60'/0'/0/0`,
      },
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
        derivationPath: 0,
      },
      // Non-existing assetNames
      // {
      //  derivationAlgorithm: 'BIP32',
      //  asset: { name: 'i-do-not-exist' },
      //  derivationPath: `m/44'/60'/0'/0/0`,
      // },
      // Incorrect paths
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
        derivationPath: `m/44'/60'/0'/0/0dddd`,
      },
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
        derivationPath: `m\\44'/60'/0'/0/0`,
      },
      {
        derivationAlgorithm: 'BIP32',
        asset: assets.ethereum,
        derivationPath: `m44'/60'/0'/0/0`,
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
        derivationPath: `m/44'/60'/0'/0/0`,
      }),
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: `m/44'/60'/0'/0/0`,
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
})
