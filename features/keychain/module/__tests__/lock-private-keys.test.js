import { mnemonicToSeed } from 'bip39'
import { KeyIdentifier } from '../'
import createKeychain from './create-keychain'

const createKeyIdentifierForExodus = () =>
  new KeyIdentifier({
    assetName: 'solana',
    derivationAlgorithm: 'BIP32',
    derivationPath: "m/44'/501'/0'/0/0",
    keyType: 'nacl',
  })

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const seed1 = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease test'
)

describe('lockPrivateKeys', () => {
  it('should allow private key usage when unlocked', async () => {
    const keychain = createKeychain({ seed })
    const keyId = createKeyIdentifierForExodus()
    const exportedKeys = await keychain.exportKey(keyId, { exportPrivate: true })

    // Public keys should be the same
    const sodiumEncryptor = keychain.createSodiumEncryptor(keyId)
    const {
      sign: { publicKey },
    } = await sodiumEncryptor.getSodiumKeysFromSeed({ keyId })
    expect(Buffer.compare(publicKey, exportedKeys.publicKey)).toBe(0)
  })

  it('should allow unlock when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.unlock({ seed })
  })

  it('should allow lock when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.lock()
  })

  it('should allow usage when locked after lock and re-adding seeds', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.lock()
    keychain.unlock({ seed })

    const keyId = createKeyIdentifierForExodus()
    await keychain.exportKey(keyId, {
      exportPrivate: true,
    })
  })

  it('should allow exportKey for public keys when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    const keyId = createKeyIdentifierForExodus()
    const exportedKeys = await keychain.exportKey(keyId)

    expect(exportedKeys.publicKey).toBeDefined()
  })

  it('should allow clone when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.clone()
  })

  it('should allow exportKeys after lock/unlock', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.unlockPrivateKeys([seed])

    const keyId = createKeyIdentifierForExodus()
    const exportedKeys = await keychain.exportKey(keyId, { exportPrivate: true })

    // Public keys should be the same
    const sodiumEncryptor = keychain.createSodiumEncryptor(keyId)
    const {
      sign: { publicKey },
    } = await sodiumEncryptor.getSodiumKeysFromSeed({ keyId })
    expect(Buffer.compare(publicKey, exportedKeys.publicKey)).toBe(0)
  })

  it('should block unlock for wrong seeds length', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    await expect(async () => keychain.unlockPrivateKeys([])).rejects.toThrow(
      /must pass in same number of seeds/
    )
    await expect(async () => keychain.unlockPrivateKeys([seed, seed])).rejects.toThrow(
      /must pass in same number of seeds/
    )
  })

  it('should block unlock when already unlocked', async () => {
    const keychain = createKeychain({ seed })
    await expect(async () => keychain.unlockPrivateKeys([seed])).rejects.toThrow(/already unlocked/)
  })

  it('should block unlock for wrong seed ids', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    await expect(async () => keychain.unlockPrivateKeys([seed1])).rejects.toThrow(
      /must pass in existing seed/
    )
  })

  it('should block exportKey for private keys when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    const keyId = createKeyIdentifierForExodus()
    await expect(keychain.exportKey(keyId, { exportPrivate: true })).rejects.toThrow(
      /private keys are locked/
    )
  })

  it('should block signTx when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    await expect(keychain.signTx({})).rejects.toThrow(/private keys are locked/)
  })

  it('should block sodium when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    await expect(keychain.sodium.getSodiumKeysFromSeed({})).rejects.toThrow(
      /private keys are locked/
    )
    await expect(keychain.createSodiumEncryptor({}).getSodiumKeysFromSeed({})).rejects.toThrow(
      /private keys are locked/
    )
  })

  it('should block ed25519 when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    await expect(keychain.ed25519.signBuffer({})).rejects.toThrow(/private keys are locked/)
    await expect(keychain.createEd25519Signer({}).signBuffer({})).rejects.toThrow(
      /private keys are locked/
    )
  })

  it('should block secp256k1 when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    await expect(keychain.secp256k1.signBuffer({})).rejects.toThrow(/private keys are locked/)
    await expect(keychain.createSecp256k1Signer({}).signBuffer({})).rejects.toThrow(
      /private keys are locked/
    )
  })
})
