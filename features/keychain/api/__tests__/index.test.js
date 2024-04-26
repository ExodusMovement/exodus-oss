import KeyIdentifier from '@exodus/key-identifier'
import { mnemonicToSeed } from 'bip39'
import apiDefinition from '..'
import moduleDefinition from '../../module'
import { getSeedId } from '../../module/crypto/seed-id'

const mnemonic = 'cousin access oak tragic entire dynamic marine expand govern enjoy honey tissue'
const otherMnemonic =
  'menu memory fury language physical wonder dog valid smart edge decrease worth'

const seed = mnemonicToSeed(mnemonic)
const otherSeed = mnemonicToSeed(otherMnemonic)
const seedId = getSeedId(seed)
const otherSeedId = getSeedId(otherSeed)
const solanaKeyId = new KeyIdentifier({
  assetName: 'solana',
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/501'/0'/0/0",
})

// gen fixtures
// import { fromMasterSeed } from '@exodus/bip32'

// const genFixtures = () => {
//   const solanaKey = fromMasterSeed(seed).derive(solanaKeyId.derivationPath)
//   const otherSeedSolanaKey = fromMasterSeed(otherSeed).derive(solanaKeyId.derivationPath)
//   console.log(
//     JSON.stringify(
//       {
//         seedSolanaKey: {
//           ...solanaKey.toJSON(),
//           privateKey: solanaKey.privateKey.toString('hex'),
//           publicKey: solanaKey.publicKey.toString('hex'),
//         },
//         otherSeedSolanaKey: {
//           ...otherSeedSolanaKey.toJSON(),
//           privateKey: otherSeedSolanaKey.privateKey.toString('hex'),
//           publicKey: otherSeedSolanaKey.publicKey.toString('hex'),
//         },
//       },
//       null,
//       2
//     )
//   )
// }

// genFixtures()

describe('keychain api', () => {
  /** @type {import('../').KeychainApi} */
  let api

  beforeEach(() => {
    jest.clearAllMocks()

    const keychain = moduleDefinition.factory()
    api = apiDefinition.factory({ keychain }).keychain
    keychain.addSeed(seed)
    keychain.addSeed(otherSeed)
    return api
  })

  test('export privateKey', async () => {
    await expect(
      api.exportKey({ seedId, keyId: solanaKeyId, exportPrivate: true })
    ).resolves.toEqual({
      privateKey: Buffer.from(
        '89e0d7573648f0e08d62491cf8cf01404b198e5316789089845e0f9349f06e21',
        'hex'
      ),
      publicKey: Buffer.from(
        '0379c8ac8ec19111f49630e7d8b3c1cf87ecdb86f2ff9e9fc29269bfc19574bca9',
        'hex'
      ),
      xpriv:
        'xprvA3aSZco2ba6qU2FmVowiad82ZHahVhAo6RA9XX7APo9aCMhaJhEjJxRRAwCB6mojPMJKvuZmG1nKmuLZb2VgZF8WpjNA9QtBgAxnNshT1iN',
      xpub: 'xpub6GZny8KvRwf8gWLEbqUiwm4m7KRBu9teTe5kKuWmx8gZ5A2irEYyrkju2E3bcGXuW9fiqHURsYNuFJrzXQZZ27qTLrD7BWXjZddq4YqrBHp',
    })
    await expect(
      api.exportKey({ seedId: otherSeedId, keyId: solanaKeyId, exportPrivate: true })
    ).resolves.toEqual({
      privateKey: Buffer.from(
        '107bfcb5d268f0c8a6d5ade844607a96e42796fcc4410e49f5438f517f82ea1a',
        'hex'
      ),
      publicKey: Buffer.from(
        '03c7f3033e6943eb432df4488c2f430498d3dda3fadfff643480029ba9203ba3da',
        'hex'
      ),
      xpriv:
        'xprvA3ZsPdqNsXe4VXohMHUmVcfUDqUG2et8Nia5wTQQGERE8S4uipLuNQjYzhMrN32rquhFhCoBZwHB1HuYw9p16UxF36DwJmiaDL3xDjfAZVD',
      xpub: 'xpub6GZDo9NGhuCMi1tATK1mrkcCmsJkS7byjwVgjqp1pZxD1EQ4GMf9vD42r1jAM7teWuk63fPXDvWA8sBxrdVM9sEdhsbGH7jfCEgTg7mvVNh',
    })
  })

  test('export publicKey', async () => {
    await expect(api.exportKey({ seedId, keyId: solanaKeyId })).resolves.toEqual({
      privateKey: null,
      publicKey: Buffer.from(
        '0379c8ac8ec19111f49630e7d8b3c1cf87ecdb86f2ff9e9fc29269bfc19574bca9',
        'hex'
      ),
      xpriv: null,
      xpub: 'xpub6GZny8KvRwf8gWLEbqUiwm4m7KRBu9teTe5kKuWmx8gZ5A2irEYyrkju2E3bcGXuW9fiqHURsYNuFJrzXQZZ27qTLrD7BWXjZddq4YqrBHp',
    })

    await expect(api.exportKey({ seedId: otherSeedId, keyId: solanaKeyId })).resolves.toEqual({
      privateKey: null,
      publicKey: Buffer.from(
        '03c7f3033e6943eb432df4488c2f430498d3dda3fadfff643480029ba9203ba3da',
        'hex'
      ),
      xpriv: null,
      xpub: 'xpub6GZDo9NGhuCMi1tATK1mrkcCmsJkS7byjwVgjqp1pZxD1EQ4GMf9vD42r1jAM7teWuk63fPXDvWA8sBxrdVM9sEdhsbGH7jfCEgTg7mvVNh',
    })
  })

  const EXO = Number.parseInt(Buffer.from('exo').toString('hex'), '16')
  const keyId = new KeyIdentifier({
    __proto__: null,
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/5'/0'`,
    keyType: 'nacl',
  })

  describe('sodium', () => {
    test('signDetached signs data', async () => {
      const data = Buffer.from("Batman's identity was revealed as Harvey Dent")
      const signature = await api.sodium.signDetached({ seedId, keyId, data })

      expect(signature.toString('hex')).toBe(
        '5554a24c0885288135f5a4e6bc77b8e84c5e0a836b43b8ea578e3eef890e7d3a4b224d1a9b24960316c626546ff410d1bec918ddb455921c62acbc617c0c2d05'
      )
    })

    test('getKeysFromSeed returns public keys', async () => {
      const keys = await api.sodium.getKeysFromSeed({ seedId, keyId })

      expect(keys.secret).toBeUndefined()
      expect(keys.sign.publicKey.toString('hex')).toBe(
        '8154e21fbe0a6b3bd023b649114225633e472b61a8a011ac8385f668863f0439'
      )
      expect(keys.box.publicKey.toString('hex')).toBe(
        '250f5d2b0d4639b17eb68dc71f68fb69f7ef1d3c592a37c15b45be72f29c0358'
      )
    })
  })

  describe('ed25519', () => {
    test('signBuffer signs binary data', async () => {
      const data = Buffer.from("Batman's identity was revealed as Harvey Dent")
      const signature = await api.ed25519.signBuffer({ seedId, keyId, data })

      expect(signature.toString('hex')).toBe(
        '5554a24c0885288135f5a4e6bc77b8e84c5e0a836b43b8ea578e3eef890e7d3a4b224d1a9b24960316c626546ff410d1bec918ddb455921c62acbc617c0c2d05'
      )
    })
  })

  describe('secp256k1', () => {
    test('signBuffer signs binary data', async () => {
      const data = Buffer.from("Batman's identity was revealed as Harvey Dent")
      const signature = await api.secp256k1.signBuffer({ seedId, keyId, data })

      expect(signature.toString('hex')).toBe(
        '3045022100a41633f9330f8cd4f0b84c800f4d80a777bc9210da43132b1571a2753ce7131702200950d1031ddef3149d51a15b1a86c09cf2eac8b3467d76dbd067c117aada7c78'
      )
    })
  })
})
