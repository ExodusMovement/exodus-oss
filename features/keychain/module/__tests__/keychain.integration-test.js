import createInMemoryStorage from '@exodus/storage-memory'
import {
  getPublicKey as getCardanoPublicKey,
  getShelleyAddress as getCardanoAddress,
} from '@exodus/cardano-lib'
import { encodePublic as encodePublicEthereum } from '@exodus/ethereum-lib'
import { createUnsignedTx } from '@exodus/solana-lib'
import { mnemonicToSeed } from 'bip39'

import { assets } from './fixtures/assets'
import simpleTx from './fixtures/simple-tx'

import { Keychain } from '../keychain'
import { EXODUS_KEY_IDS, KeyIdentifier } from '../key-identifier'
import createKeychain from './create-keychain'
import memoizedKeychain from '../memoized-keychain'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

describe.each([
  { module: 'keychain', factory: () => createKeychain({ seed }) },
  {
    module: 'memoizedKeychain',
    factory: () =>
      memoizedKeychain.factory({
        keychain: createKeychain({ seed }),
        storage: createInMemoryStorage(),
        logger: console,
      }),
  },
])('$module', ({ factory }) => {
  describe('constructor', () => {
    it('should construct correctly', () => {
      expect(factory()).toBeInstanceOf(Keychain)
    })

    it('should throw when constructing incorrectly', () => {
      const failures = [Buffer.from('failure'), 'failure', 1, true]
      failures.forEach((failure) => {
        expect(() => createKeychain({ seed: failure })).toThrow()
      })
    })
  })

  describe('exportKeys', () => {
    it('should throw if not passed key id', async () => {
      const keychain = factory()
      const failures = [Buffer.from('failure'), 'failure', 0, null, undefined, true]
      for (const failure of failures) {
        await expect(keychain.exportKey(failure)).rejects.toThrow()
      }
    })

    it('should generate solana addresses', async () => {
      const keychain = createKeychain({ seed })
      const successes = [
        {
          expected: 'nsn7DmCMsKWGUWcL92XfPKXFbUz7KtFDRa4nnkc3RiF',
          keyid: new KeyIdentifier({
            assetName: 'solana',
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/501'/0'/0/0",
            keyType: 'nacl',
          }),
        },
        {
          expected: '7SmaJ41gFZ1LPsZJfb57npzdCFuqBRmgj3CScjbmkQwA',
          keyid: new KeyIdentifier({
            assetName: 'solana',
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/501'/1'/0/0",
            keyType: 'nacl',
          }),
        },
      ]

      const encodePublic = assets.solana.keys.encodePublic
      for (const success of successes) {
        const key = await keychain.exportKey(success.keyid)
        expect(encodePublic(key.publicKey)).toBe(success.expected)
      }
    })

    it('should generate ethereum addresses', async () => {
      const keychain = createKeychain({ seed })
      const fixtures = [
        {
          expected: '0xF3d46F0De925B28fDa1219BbD60F5ae2a0128F9F',
          keyid: new KeyIdentifier({
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/60'/0'/0/0",
            assetName: 'ethereum',
          }),
        },
        {
          expected: '0x55e60F7531a5c701F526f224FCC071EFCf3fFF61',
          keyid: new KeyIdentifier({
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/60'/1'/0/0",
            assetName: 'ethereum',
          }),
        },
        {
          expected: '0x780984e59eDdA8b1f4bB09dc297241f1Ed0Dcc17',
          keyid: new KeyIdentifier({
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/60'/0'/0/1",
            assetName: 'ethereum',
          }),
        },
      ]

      for (const fixture of fixtures) {
        const key = await keychain.exportKey(fixture.keyid)
        expect(encodePublicEthereum(key.publicKey)).toBe(fixture.expected)
      }
    })

    it('should generate cardano addresses', async () => {
      const keychain = createKeychain({
        seed,
        legacyPrivToPub: {
          cardano: getCardanoPublicKey,
        },
      })
      const fixtures = [
        {
          expected:
            'addr1q8ftlrj30s8f3qks2l5cuv44f5cgflxqym0d0k4q22dusp7jh789zlqwnzpdq4lf3cet2nfssn7vqfk76ld2q55meqrstsxtqg',
          keyid: new KeyIdentifier({
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/1815'/0'/0/0",
            keyType: 'legacy',
            assetName: 'cardano',
          }),
        },
      ]

      for (const fixture of fixtures) {
        const key = await keychain.exportKey(fixture.keyid, { exportPrivate: true })
        expect(getCardanoAddress(key.publicKey)).toBe(fixture.expected)
      }
    })

    it('should fail to generate addresses if assetname is not in legacy priv pub', async () => {
      const keychain = createKeychain({
        seed,
        legacyPrivToPub: {
          cardano: getCardanoPublicKey,
        },
      })

      await expect(
        keychain.exportKey(
          new KeyIdentifier({
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/1815'/0'/0/0",
            keyType: 'legacy',
            assetName: 'UNKNOWN',
          })
        )
      ).rejects.toThrow('legacyPrivToPub')
    })

    it('should export SLIP10 keys', async () => {
      const keychain = createKeychain({ seed })
      const key = await keychain.exportKey(EXODUS_KEY_IDS.TELEMETRY, { exportPrivate: true })
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
    it('should sign solana tx', async () => {
      const keychain = createKeychain({ seed })
      const keyId = new KeyIdentifier({
        assetName: 'solana',
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/501'/0'/0/0",
        keyType: 'nacl',
      })
      const asset = assets.solana
      const unsignedTx = await createUnsignedTx({
        asset,
        from: 'nsn7DmCMsKWGUWcL92XfPKXFbUz7KtFDRa4nnkc3RiF',
        to: '7SmaJ41gFZ1LPsZJfb57npzdCFuqBRmgj3CScjbmkQwA',
        amount: asset.currency.SOL('5'),
        fee: asset.currency.SOL('0.000005'),
        recentBlockhash: '6yWbfvhoDrgzStVnvpRvib2Q1LpuTYc6TtdMPPofCPh8',
      })

      const result = await keychain.signTx(
        [keyId],
        ({ unsignedTx, hdkeys, privateKey }) => {
          expect(hdkeys[44].privateKey).toEqual(privateKey)
          return simpleTx(unsignedTx, privateKey)
        },
        unsignedTx
      )
      expect(result.txId).toBe(
        'Lj2iFo1MKx3cWTLH1GbvxZjCtNTMBmB2rXR5JV7EFQnPySyxKssAReBJF56e7XzXiAFeYdMCwFvyR3NkFVbh8rS'
      )
    })

    it('should sign solana tx', async () => {
      const keychain = createKeychain({ seed })
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
      const unsignedTx = {}

      await keychain.signTx(
        keyIds,
        ({ hdkeys, privateKey }) => {
          expect(privateKey).not.toBeDefined()
          expect(hdkeys[44].privateKey).toBeDefined()
          expect(hdkeys[84].privateKey).toBeDefined()
          return null
        },
        unsignedTx
      )
    })
  })

  describe('clone', () => {
    it('should return locked instance', async () => {
      const keychain = createKeychain({ seed })
      const clone = keychain.clone()

      const keyid = new KeyIdentifier({
        assetName: 'solana',
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/501'/0'/0/0",
        keyType: 'nacl',
      })

      await expect(keychain.exportKey(keyid)).resolves.toBeTruthy()
      await expect(clone.exportKey(keyid)).rejects.toThrow()
    })

    it('should have parent legacyPrivToPub config', async () => {
      const legacyPrivToPub = { cardano: jest.fn() }

      const keychain = createKeychain({ seed, legacyPrivToPub })

      const clone = keychain.clone()
      clone.unlock({ seed })

      const keyid = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/1815'/0'/0/0",
        keyType: 'legacy',
        assetName: 'cardano',
      })

      await clone.exportKey(keyid)

      expect(legacyPrivToPub.cardano).toBeCalled()
    })
  })
})
