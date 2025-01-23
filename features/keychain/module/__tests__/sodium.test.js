import { mnemonicToSeed } from 'bip39'

import KeyIdentifier from '@exodus/key-identifier'
import { getSeedId } from '../crypto/seed-id.js'
import { getSodiumKeysFromSeed } from '@exodus/crypto/sodium'

const sodiumKeysFromSeedMock = jest.fn(getSodiumKeysFromSeed)

jest.mock('@exodus/crypto/sodium', () => ({
  __esModule: true,
  getSodiumKeysFromSeed: sodiumKeysFromSeedMock,
}))

const { default: createKeychain } = await import('./create-keychain.js')

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const seedId = getSeedId(seed)

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
  it('should cache sodium keys', async () => {
    const keychain = createKeychain({ seed })

    await keychain.sodium.getSodiumKeysFromSeed({
      seedId,
      keyId: BOB_KEY,
    })

    await keychain.sodium.getSodiumKeysFromSeed({
      seedId,
      keyId: BOB_KEY,
    })

    await keychain.sodium.getSodiumKeysFromSeed({
      seedId,
      keyId: BOB_KEY,
    })

    expect(sodiumKeysFromSeedMock).toHaveBeenCalledOnce()
  })

  it('should have sign keys compatibility with SLIP10', async () => {
    const keychain = createKeychain({ seed })
    const exportedKeys = await keychain.exportKey({ seedId, keyId: ALICE_KEY })

    const sodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
    const {
      sign: { publicKey },
    } = await sodiumEncryptor.getSodiumKeysFromSeed({ seedId })
    expect(Buffer.compare(publicKey, exportedKeys.publicKey)).toBe(0)
  })

  it('should not export private keys by default', async () => {
    const keychain = createKeychain({ seed })

    const {
      sign: { privateKey: signPrivateKey },
      box: { privateKey: boxPrivateKey },
      secret,
    } = await keychain.sodium.getSodiumKeysFromSeed({ seedId, keyId: ALICE_KEY })

    expect(signPrivateKey).toBeNull()
    expect(boxPrivateKey).toBeNull()
    expect(secret).toBeNull()
  })

  it('should allow exporting private keys', async () => {
    const keychain = createKeychain({ seed })

    const {
      sign: { privateKey: signPrivateKey },
      box: { privateKey: boxPrivateKey },
      secret,
    } = await keychain.sodium.getSodiumKeysFromSeed({
      seedId,
      keyId: ALICE_KEY,
      exportPrivate: true,
    })

    expect(signPrivateKey).toBeDefined()
    expect(boxPrivateKey).toBeDefined()
    expect(secret).toBeDefined()
  })

  it('should have sign keys compatibility with SLIP10 (using sodium instance)', async () => {
    const keychain = createKeychain({ seed })
    const exportedKeys = await keychain.exportKey({ seedId, keyId: ALICE_KEY })

    const {
      sign: { publicKey },
    } = await keychain.sodium.getSodiumKeysFromSeed({ seedId, keyId: ALICE_KEY })

    expect(Buffer.compare(publicKey, exportedKeys.publicKey)).toBe(0)
  })

  it('should sign', async () => {
    const keychain = createKeychain({ seed })
    const sodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
    const plaintext = Buffer.from('I really love keychains')
    const signature = await sodiumEncryptor.sign({ seedId, data: plaintext })
    const isVerified = await sodiumEncryptor.signOpen({ seedId, data: signature })
    const signatureDetached = await sodiumEncryptor.signDetached({
      seedId,
      data: plaintext,
    })
    const isVerifiedDetached = await sodiumEncryptor.verifyDetached({
      seedId,
      data: plaintext,
      signature: signatureDetached,
    })
    expect(isVerified).toBeTruthy()
    expect(isVerifiedDetached).toBeTruthy()
  })

  it('should sign (using sodium instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = Buffer.from('I really love keychains')

    const signature = await keychain.sodium.sign({ seedId, keyId: ALICE_KEY, data: plaintext })
    const isVerified = await keychain.sodium.signOpen({ seedId, keyId: ALICE_KEY, data: signature })
    const signatureDetached = await keychain.sodium.signDetached({
      seedId,
      keyId: ALICE_KEY,
      data: plaintext,
    })
    const isVerifiedDetached = await keychain.sodium.verifyDetached({
      seedId,
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
      seedId,
      data: plaintext,
    })
    const decrypted = await sodiumEncryptor.decryptSecretBox({
      seedId,
      data: ciphertext,
    })
    expect(decrypted.toString()).toBe(plaintext)
  })

  it('should encryptSecretBox and decryptSecretBox (using sodim instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = 'I really love keychains'

    const ciphertext = await keychain.sodium.encryptSecretBox({
      seedId,
      keyId: ALICE_KEY,
      data: plaintext,
    })
    const decrypted = await keychain.sodium.decryptSecretBox({
      seedId,
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
    } = await bobSodiumEncryptor.getSodiumKeysFromSeed({ seedId })
    const ciphertext = await aliceSodiumEncryptor.encryptBox({
      seedId,
      data: plaintext,
      toPublicKey: bobPublicKey,
    })
    const {
      box: { publicKey: alicePublicKey },
    } = await aliceSodiumEncryptor.getSodiumKeysFromSeed({ seedId })
    const decrypted = await bobSodiumEncryptor.decryptBox({
      seedId,
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
    } = await keychain.sodium.getSodiumKeysFromSeed({ seedId, keyId: BOB_KEY })
    const ciphertext = await keychain.sodium.encryptBox({
      seedId,
      keyId: ALICE_KEY,
      data: plaintext,
      toPublicKey: bobPublicKey,
    })
    const {
      box: { publicKey: alicePublicKey },
    } = await keychain.sodium.getSodiumKeysFromSeed({ seedId, keyId: ALICE_KEY })
    const decrypted = await keychain.sodium.decryptBox({
      seedId,
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
    } = await bobSodiumEncryptor.getSodiumKeysFromSeed({ seedId })
    const ciphertext = await aliceSodiumEncryptor.encryptSealedBox({
      seedId,
      data: plaintext,
      toPublicKey: bobPublicKey,
    })
    const decrypted = await bobSodiumEncryptor.decryptSealedBox({
      seedId,
      data: ciphertext,
    })
    expect(decrypted.toString()).toBe(plaintext)
  })

  it('should encryptSealedBox and decryptSealedBox (using sodium instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = 'I really love keychains'

    const {
      box: { publicKey: bobPublicKey },
    } = await keychain.sodium.getSodiumKeysFromSeed({
      seedId,
      keyId: BOB_KEY,
    })

    const ciphertext = await keychain.sodium.encryptSealedBox({
      seedId,
      keyId: ALICE_KEY,
      data: plaintext,
      toPublicKey: bobPublicKey,
    })

    const decrypted = await keychain.sodium.decryptSealedBox({
      seedId,
      keyId: BOB_KEY,
      data: ciphertext,
    })

    expect(decrypted.toString()).toBe(plaintext)
  })
})
