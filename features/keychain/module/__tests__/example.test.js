import {
  signUnsignedTx as signSolanaTx,
  createUnsignedTx as createUnsignedSolanaTx,
} from '@exodus/solana-lib'
import { connectAssetsList } from '@exodus/assets'
import solanaAssets from '@exodus/solana-meta'
import { mnemonicToSeed } from 'bip39'
import assert from 'minimalistic-assert'
import keychainDefinition, { KeyIdentifier } from '..'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const { solana: asset } = connectAssetsList(solanaAssets)

const keychain = keychainDefinition.factory({
  logger: console,
  legacyPrivToPub: {},
})

keychain.unlock({ seed })

const solanaKeyId = new KeyIdentifier({
  assetName: 'solana',
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/501'/0'/0/0",
  keyType: 'nacl',
})

const ALICE_KEY = new KeyIdentifier({
  derivationAlgorithm: 'SLIP10',
  derivationPath: "m/0'/2'/0'",
  keyType: 'nacl',
})

const BOB_KEY = new KeyIdentifier({
  derivationAlgorithm: 'SLIP10',
  derivationPath: "m/0'/2'/1'",
  keyType: 'nacl',
})

test('unlock', async () => {
  const keychain = keychainDefinition.factory({
    logger: console,
    legacyPrivToPub: {},
  })

  await expect(keychain.exportKey(solanaKeyId)).rejects.toThrow()

  keychain.unlock({ seed })

  await expect(keychain.exportKey(solanaKeyId)).resolves.not.toThrow()
})

test('lock', async () => {
  const keychain = keychainDefinition.factory({
    logger: console,
    legacyPrivToPub: {},
  })

  keychain.unlock({ seed })
  keychain.lock({ seed })

  await expect(keychain.exportKey(solanaKeyId)).rejects.toThrow()
})

test('signTx', async () => {
  const unsignedTx = await createUnsignedSolanaTx({
    asset,
    from: 'nsn7DmCMsKWGUWcL92XfPKXFbUz7KtFDRa4nnkc3RiF',
    to: '7SmaJ41gFZ1LPsZJfb57npzdCFuqBRmgj3CScjbmkQwA',
    amount: asset.currency.SOL('5'),
    fee: asset.currency.SOL('0.000005'),
    recentBlockhash: '6yWbfvhoDrgzStVnvpRvib2Q1LpuTYc6TtdMPPofCPh8',
  })

  const signedTx = await keychain.signTx(
    // Note: this is an array as some assets require multiple keys to sign a single transaction,
    // e.g. bitcoin needs a keyId per UTXO
    [solanaKeyId],
    function signTx({ unsignedTx, hdkeys, privateKey }) {
      assert(unsignedTx.txMeta.assetName === 'solana', 'expected "solana" tx')
      return signSolanaTx(unsignedTx, privateKey)
    },
    unsignedTx
  )

  expect(signedTx.txId).toBe(
    'Lj2iFo1MKx3cWTLH1GbvxZjCtNTMBmB2rXR5JV7EFQnPySyxKssAReBJF56e7XzXiAFeYdMCwFvyR3NkFVbh8rS'
  )
})

test('exportKey', async () => {
  // { xpub, publicKey }
  const publicKey = await keychain.exportKey(solanaKeyId)
  // { xpub, xpriv, publicKey, privateKey }
  const privateKey = await keychain.exportKey(solanaKeyId, { exportPrivate: true })

  expect(publicKey.xpub).toEqual(
    'xpub6GZDo9NGhuCMi1tATK1mrkcCmsJkS7byjwVgjqp1pZxD1EQ4GMf9vD42r1jAM7teWuk63fPXDvWA8sBxrdVM9sEdhsbGH7jfCEgTg7mvVNh'
  )
  expect(publicKey.publicKey).toEqual(
    Buffer.from('0bc08d0b03ca1bc9e72e91084d4f001c5e13270acb4fc2853efe7e6b6560b2d8', 'hex')
  )
  expect(publicKey.xpriv).toBeFalsy()
  expect(publicKey.privateKey).toBeFalsy()

  expect(privateKey).toEqual({
    ...publicKey,
    xpriv:
      'xprvA3ZsPdqNsXe4VXohMHUmVcfUDqUG2et8Nia5wTQQGERE8S4uipLuNQjYzhMrN32rquhFhCoBZwHB1HuYw9p16UxF36DwJmiaDL3xDjfAZVD',
    privateKey: Buffer.from(
      '107bfcb5d268f0c8a6d5ade844607a96e42796fcc4410e49f5438f517f82ea1a',
      'hex'
    ),
  })
})

test('encryptSecretBox/decryptSecretBox', async () => {
  const sodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
  const plaintext = 'I really love keychains'
  const ciphertext = await sodiumEncryptor.encryptSecretBox({
    data: plaintext,
  })

  const decrypted = await sodiumEncryptor.decryptSecretBox({
    data: ciphertext,
  })
  expect(decrypted.toString()).toBe(plaintext)
})

test('encryptBox/decryptBox', async () => {
  const aliceSodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
  const bobSodiumEncryptor = await keychain.createSodiumEncryptor(BOB_KEY)
  const plaintext = 'I really love keychains'
  const {
    box: { publicKey: bobPublicKey },
  } = await bobSodiumEncryptor.getSodiumKeysFromSeed()
  const ciphertext = await aliceSodiumEncryptor.encryptBox({
    data: plaintext,
    toPublicKey: bobPublicKey,
  })
  const {
    box: { publicKey: alicePublicKey },
  } = await aliceSodiumEncryptor.getSodiumKeysFromSeed()

  const decrypted = await bobSodiumEncryptor.decryptBox({
    data: ciphertext,
    fromPublicKey: alicePublicKey,
  })

  expect(decrypted.toString()).toBe(plaintext)
})

test('should encryptSealedBox and decryptSealedBox', async () => {
  const aliceSodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
  const bobSodiumEncryptor = await keychain.createSodiumEncryptor(BOB_KEY)
  const plaintext = 'I really love keychains'
  const {
    box: { publicKey: bobPublicKey },
  } = await bobSodiumEncryptor.getSodiumKeysFromSeed()
  const ciphertext = await aliceSodiumEncryptor.encryptSealedBox({
    data: plaintext,
    toPublicKey: bobPublicKey,
  })
  const decrypted = await bobSodiumEncryptor.decryptSealedBox({
    data: ciphertext,
  })
  expect(decrypted.toString()).toBe(plaintext)
})

test('EcDSA Signer', async () => {
  const keyId = new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: "m/73'/2'/0'",
    keyType: 'nacl',
  })

  const signer = keychain.createSecp256k1Signer(keyId)
  const plaintext = Buffer.from('I really love keychains')
  const signature = await signer.signBuffer({ data: plaintext })
  const expected =
    '304402206102dd19cf16e4d88b5bbc07843dae29fb62b13b65207667898363c90b548bf60220577d77bed19009157593f884bfc8a951dbfc9fe4e4fe99ddaed9ab8b558e208c'
  expect(signature.toString('hex')).toBe(expected)
})

test('EdDSA Signer', async () => {
  const keyId = new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: "m/73'/2'/0'",
    keyType: 'nacl',
  })

  const signer = keychain.createEd25519Signer(keyId)
  const plaintext = Buffer.from('I really love keychains')
  const signature = await signer.signBuffer({ data: plaintext })
  const expected =
    'd28f13d22ef56c7c5b89a68f67a581ecb01358ed4782dca4f5bc672c4e11d669f853d8110c56dec8bcbafd96bf319d27fa8d8a73dabd95d4c18bf65788a9680d'
  expect(signature.toString('hex')).toBe(expected)
})
