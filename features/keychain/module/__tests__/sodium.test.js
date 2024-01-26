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

  it('should have sign keys compatibility with SLIP10 (using sodium instance)', async () => {
    const keychain = createKeychain({ seed })
    const exportedKeys = await keychain.exportKey(ALICE_KEY)

    const {
      sign: { publicKey },
    } = await keychain.sodium.getSodiumKeysFromSeed({ keyId: ALICE_KEY })

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

  it('should sign (using sodium instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = Buffer.from('I really love keychains')

    const signature = await keychain.sodium.sign({ keyId: ALICE_KEY, data: plaintext })
    const isVerified = await keychain.sodium.signOpen({ keyId: ALICE_KEY, data: signature })
    const signatureDetached = await keychain.sodium.signDetached({
      keyId: ALICE_KEY,
      data: plaintext,
    })
    const isVerifiedDetached = await keychain.sodium.verifyDetached({
      keyId: ALICE_KEY,
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

  it('should encryptSecretBox and decryptSecretBox (using sodim instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = 'I really love keychains'

    const ciphertext = await keychain.sodium.encryptSecretBox({
      keyId: ALICE_KEY,
      data: plaintext,
    })
    const decrypted = await keychain.sodium.decryptSecretBox({
      keyId: ALICE_KEY,
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

  it('should encryptBox and decryptBox (using sodium instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = 'I really love keychains'

    const {
      box: { publicKey: bobPublicKey },
    } = await keychain.sodium.getSodiumKeysFromSeed({ keyId: BOB_KEY })
    const ciphertext = await keychain.sodium.encryptBox({
      keyId: ALICE_KEY,
      data: plaintext,
      toPublicKey: bobPublicKey,
    })
    const {
      box: { publicKey: alicePublicKey },
    } = await keychain.sodium.getSodiumKeysFromSeed({ keyId: ALICE_KEY })
    const decrypted = await keychain.sodium.decryptBox({
      keyId: BOB_KEY,
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

  it('should encryptSealedBox and decryptSealedBox (using sodium instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = 'I really love keychains'

    const {
      box: { publicKey: bobPublicKey },
    } = await keychain.sodium.getSodiumKeysFromSeed({ keyId: BOB_KEY })
    const ciphertext = await keychain.sodium.encryptSealedBox({
      keyId: ALICE_KEY,
      data: plaintext,
      toPublicKey: bobPublicKey,
    })
    const decrypted = await keychain.sodium.decryptSealedBox({
      keyId: BOB_KEY,
      data: ciphertext,
    })

    expect(decrypted.toString()).toBe(plaintext)
  })
})
