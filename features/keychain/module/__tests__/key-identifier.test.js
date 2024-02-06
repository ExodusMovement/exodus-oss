import { KeyIdentifier, createKeyIdentifierForExodus } from '../key-identifier'

describe('KeyIdentifier', () => {
  it('should fail on incorrect construction', () => {
    const failures = [
      null,
      undefined,
      Object.create(null),
      // Missing parameters

      {
        derivationAlgorithm: 'BIP32',
      },
      {
        derivationPath: "m/44'/60'/0'/0/0",
      },

      // Incorrect types
      {
        derivationAlgorithm: 'BIP32',
        assetName: 0,
        derivationPath: "m/44'/60'/0'/0/0",
      },

      // Non-existing assetNames
      // {
      //  derivationAlgorithm: 'BIP32',
      //  asset: { name: 'i-do-not-exist' },
      //  derivationPath: `m/44'/60'/0'/0/0`,
      // },
      // Incorrect paths
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

  describe('.toString()', () => {
    it('should show derivation path and algorithm', () => {
      const keyIdentifier = new KeyIdentifier({
        derivationAlgorithm: 'SLIP10',
        assetName: 'solana',
        derivationPath: "m/44'/501'/0'",
      })

      expect(keyIdentifier.toString()).toBe("m/44'/501'/0' (SLIP10)")
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
