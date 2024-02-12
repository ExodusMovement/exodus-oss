import {
  getPublicKey as getCardanoPublicKey,
  getShelleyAddress as getCardanoAddress,
} from '@exodus/cardano-lib'
import { encodePublic as encodePublicEthereum } from '@exodus/ethereum-lib'
import { createUnsignedTx } from '@exodus/solana-lib'
import { mnemonicToSeed } from 'bip39'

import { assets } from './fixtures/assets'
import simpleTx from './fixtures/simple-tx'

import { EXODUS_KEY_IDS, KeyIdentifier } from '../key-identifier'
import keychainDefinition from '../multi-seed-keychain'
import { getSeedId } from '../crypto/seed-id'

const { factory: createMultiSeedKeychain } = keychainDefinition

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const secondSeed = mnemonicToSeed(
  'wine system mean beyond filter human meat rubber episode wash stomach aunt'
)

describe.each([
  // reduce fixtures by switching seeds
  {
    primarySeed: seed,
    secondarySeed: secondSeed,
    seedIdentifier: getSeedId(seed),
  },
  {
    primarySeed: secondSeed,
    secondarySeed: seed,
    seedIdentifier: getSeedId(seed),
  },
])('multi-seed-keychain', ({ primarySeed, secondarySeed, seedIdentifier }) => {
  let keychain

  beforeEach(() => {
    keychain = createMultiSeedKeychain({
      legacyPrivToPub: {
        cardano: getCardanoPublicKey,
      },
    })

    keychain.setPrimarySeed(primarySeed)
    keychain.addSeed(secondarySeed)
  })

  describe('exportKeys', () => {
    it('should throw if not passed key id', async () => {
      const failures = [Buffer.from('failure'), 'failure', 0, null, undefined, true]
      for (const failure of failures) {
        await expect(keychain.exportKey({ keyId: failure })).rejects.toThrow()
      }
    })

    it('should generate solana addresses', async () => {
      const successes = [
        {
          expected: 'nsn7DmCMsKWGUWcL92XfPKXFbUz7KtFDRa4nnkc3RiF',
          exportOpts: {
            seedIdentifier,
            keyId: new KeyIdentifier({
              assetName: 'solana',
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/501'/0'/0/0",
              keyType: 'nacl',
            }),
          },
        },
        {
          expected: '7SmaJ41gFZ1LPsZJfb57npzdCFuqBRmgj3CScjbmkQwA',
          exportOpts: {
            seedIdentifier,
            keyId: new KeyIdentifier({
              assetName: 'solana',
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/501'/1'/0/0",
              keyType: 'nacl',
            }),
          },
        },
      ]

      const encodePublic = assets.solana.keys.encodePublic
      for (const { expected, exportOpts } of successes) {
        const key = await keychain.exportKey(exportOpts)
        expect(encodePublic(key.publicKey)).toBe(expected)
      }
    })

    it('should generate ethereum addresses', async () => {
      const fixtures = [
        {
          expected: '0xF3d46F0De925B28fDa1219BbD60F5ae2a0128F9F',
          exportOpts: {
            seedIdentifier,
            keyId: new KeyIdentifier({
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/60'/0'/0/0",
              assetName: 'ethereum',
            }),
          },
        },
        {
          expected: '0x55e60F7531a5c701F526f224FCC071EFCf3fFF61',
          exportOpts: {
            seedIdentifier,
            keyId: new KeyIdentifier({
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/60'/1'/0/0",
              assetName: 'ethereum',
            }),
          },
        },
        {
          expected: '0x780984e59eDdA8b1f4bB09dc297241f1Ed0Dcc17',
          exportOpts: {
            seedIdentifier,
            keyId: new KeyIdentifier({
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/60'/0'/0/1",
              assetName: 'ethereum',
            }),
          },
        },
      ]

      for (const { expected, exportOpts } of fixtures) {
        const key = await keychain.exportKey(exportOpts)
        expect(encodePublicEthereum(key.publicKey)).toBe(expected)
      }
    })

    it('should generate cardano addresses', async () => {
      const fixtures = [
        {
          expected:
            'addr1q8ftlrj30s8f3qks2l5cuv44f5cgflxqym0d0k4q22dusp7jh789zlqwnzpdq4lf3cet2nfssn7vqfk76ld2q55meqrstsxtqg',
          exportOpts: {
            seedIdentifier,
            keyId: new KeyIdentifier({
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/1815'/0'/0/0",
              keyType: 'legacy',
              assetName: 'cardano',
            }),
          },
        },
      ]

      for (const { expected, exportOpts } of fixtures) {
        const key = await keychain.exportKey(exportOpts)
        expect(getCardanoAddress(key.publicKey)).toBe(expected)
      }
    })

    it('should fail to generate addresses if assetname is not in legacy priv pub', async () => {
      await expect(
        keychain.exportKey({
          seedIdentifier,
          keyId: new KeyIdentifier({
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/1815'/0'/0/0",
            keyType: 'legacy',
            assetName: 'UNKNOWN',
          }),
        })
      ).rejects.toThrow('legacyPrivToPub')
    })

    it('should export SLIP10 keys', async () => {
      const key = await keychain.exportKey({
        seedIdentifier,
        keyId: EXODUS_KEY_IDS.TELEMETRY,
        exportPrivate: true,
      })

      expect(key).toEqual({
        publicKey: Buffer.from(
          'eeab6c9e861ed9f3a7f7917f6d972032e3e4d7a433eb6bc30f4b488ee13682c7',
          'hex'
        ),
        privateKey: Buffer.from(
          'e53af1d990800f321a31e5540a1e1f28cad3ff5acfe9a6c8b008dacbd04b7029',
          'hex'
        ),
        xpriv: {
          chainCode: '7d9f91fc9625449db2f97ecedca89b287f59057c29d51aac0a60d2c1f920475b',
          key: 'e53af1d990800f321a31e5540a1e1f28cad3ff5acfe9a6c8b008dacbd04b7029',
        },
        xpub: undefined,
      })
    })
  })

  describe('sign', () => {
    let unsignedTx

    const keyId = new KeyIdentifier({
      assetName: 'solana',
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/501'/0'/0/0",
      keyType: 'nacl',
    })

    const asset = assets.solana

    beforeAll(async () => {
      unsignedTx = await createUnsignedTx({
        asset,
        from: 'nsn7DmCMsKWGUWcL92XfPKXFbUz7KtFDRa4nnkc3RiF',
        to: '7SmaJ41gFZ1LPsZJfb57npzdCFuqBRmgj3CScjbmkQwA',
        amount: asset.currency.SOL('5'),
        fee: asset.currency.SOL('0.000005'),
        recentBlockhash: '6yWbfvhoDrgzStVnvpRvib2Q1LpuTYc6TtdMPPofCPh8',
      })
    })

    it('should sign solana tx', async () => {
      const result = await keychain.signTx({
        seedIdentifier,
        keyIds: [keyId],
        signTxCallback: ({ unsignedTx, hdkeys, privateKey }) => {
          expect(hdkeys[44].privateKey).toEqual(privateKey)
          return simpleTx(unsignedTx, privateKey)
        },
        unsignedTx,
      })

      expect(result.txId).toBe(
        'Lj2iFo1MKx3cWTLH1GbvxZjCtNTMBmB2rXR5JV7EFQnPySyxKssAReBJF56e7XzXiAFeYdMCwFvyR3NkFVbh8rS'
      )
    })

    it('should pass through all required hdkeys', async () => {
      const keyIds = [
        new KeyIdentifier({
          assetName: 'solana',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/44'/0'/0'/0/0",
          keyType: 'secp256k1',
        }),
        new KeyIdentifier({
          assetName: 'solana',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/84'/0'/0'/0/0",
          keyType: 'secp256k1',
        }),
      ]

      await keychain.signTx({
        seedIdentifier,
        keyIds,
        signTxCallback: ({ hdkeys, privateKey }) => {
          expect(privateKey).not.toBeDefined()
          expect(hdkeys[44].privateKey).toBeDefined()
          expect(hdkeys[84].privateKey).toBeDefined()
          return null
        },
        unsignedTx: Object.create(null),
      })
    })
  })

  describe('clone', () => {
    const solanaKeyId = new KeyIdentifier({
      assetName: 'solana',
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/501'/0'/0/0",
      keyType: 'nacl',
    })

    const cardanoKeyId = new KeyIdentifier({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/1815'/0'/0/0",
      keyType: 'legacy',
      assetName: 'cardano',
    })

    it('should return locked instance', async () => {
      const keychain = createMultiSeedKeychain()
      keychain.setPrimarySeed(seed)
      const clone = keychain.clone()

      await expect(
        keychain.exportKey({
          seedIdentifier,
          keyId: solanaKeyId,
        })
      ).resolves.toBeTruthy()

      await expect(
        clone.exportKey({
          seedIdentifier,
          keyId: solanaKeyId,
        })
      ).rejects.toThrow()
    })

    it('should have parent legacyPrivToPub config', async () => {
      const legacyPrivToPub = { cardano: jest.fn() }

      const keychain = createMultiSeedKeychain({ legacyPrivToPub })

      const clone = keychain.clone()
      clone.setPrimarySeed(seed)

      await clone.exportKey({
        seedIdentifier,
        keyId: cardanoKeyId,
      })

      expect(legacyPrivToPub.cardano).toBeCalled()
    })
  })
})
