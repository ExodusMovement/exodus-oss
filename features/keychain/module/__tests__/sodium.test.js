import { mnemonicToSeed } from 'bip39'

import { KeyIdentifier } from '../key-identifier'
import createKeychain from './create-keychain'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

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

describe('libsodium', () => {
  it('should have sign keys compatibility with SLIP10', async () => {
    const keychain = createKeychain({ seed })
    const exportedKeys = await keychain.exportKey(ALICE_KEY)

    const sodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
    const {
      sign: { publicKey },
    } = await sodiumEncryptor.getSodiumKeysFromSeed()
    expect(Buffer.compare(publicKey, exportedKeys.publicKey)).toBe(0)
  })

  it('should sign', async () => {
    const keychain = createKeychain({ seed })
    const sodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
    const plaintext = Buffer.from('I really love keychains')
    const signature = await sodiumEncryptor.sign({ data: plaintext })
    const isVerified = await sodiumEncryptor.signOpen({ data: signature })
    const signatureDetached = await sodiumEncryptor.signDetached({
      data: plaintext,
    })
    const isVerifiedDetached = await sodiumEncryptor.verifyDetached({
      data: plaintext,
      signature: signatureDetached,
    })
    expect(isVerified).toBeTruthy()
    expect(isVerifiedDetached).toBeTruthy()
  })

  it('should encryptSecretBox and decryptSecretBox', async () => {
    const keychain = createKeychain({ seed })
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

  it('should encryptBox and decryptBox', async () => {
    const keychain = createKeychain({ seed })
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

  it('should encryptSealedBox and decryptSealedBox', async () => {
    const keychain = createKeychain({ seed })
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
})
