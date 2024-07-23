import { mnemonicToSeed } from 'bip39'
import { createKeyIdentifierForExodus } from '@exodus/key-ids'
import createKeychain from './create-keychain.js'
import { getSeedId } from '../crypto/seed-id.js'
import KeyIdentifier from '@exodus/key-identifier'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const seed1 = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease test'
)

const seedId = getSeedId(seed)

describe('lockPrivateKeys', () => {
  it('should allow private key usage when unlocked', async () => {
    const keychain = createKeychain({ seed })
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    const exportedKeys = await keychain.exportKey({
      seedId,
      keyId,
      exportPrivate: true,
    })

    // Public keys should be the same
    const sodiumEncryptor = keychain.createSodiumEncryptor(keyId)
    const {
      sign: { publicKey },
    } = await sodiumEncryptor.getSodiumKeysFromSeed({ seedId })
    expect(Buffer.compare(publicKey, exportedKeys.publicKey)).toBe(0)
  })

  it('should allow addSeed when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.addSeed(seed)
  })

  it('should allow removeAllSeeds when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.removeAllSeeds()
  })

  it('should allow usage when locked after removeAllSeeds and re-adding seeds', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.removeAllSeeds()
    keychain.addSeed(seed)

    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    await keychain.exportKey({
      seedId,
      keyId,
      exportPrivate: true,
    })
  })

  it('should allow exportKey for public keys when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    const exportedKeys = await keychain.exportKey({
      seedId,
      keyId,
    })

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

    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    const exportedKeys = await keychain.exportKey({
      seedId,
      keyId,
      exportPrivate: true,
    })

    // Public keys should be the same
    const sodiumEncryptor = keychain.createSodiumEncryptor(keyId)
    const {
      sign: { publicKey },
    } = await sodiumEncryptor.getSodiumKeysFromSeed({ seedId })
    expect(Buffer.compare(publicKey, exportedKeys.publicKey)).toBe(0)
  })

  it('should block unlock when already unlocked', async () => {
    const keychain = createKeychain({ seed })
    await expect(async () => keychain.unlockPrivateKeys([seed])).rejects.toThrow(/already unlocked/)
  })

  it('should block unlock for wrong seed ids', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()

    const wrongSeed = mnemonicToSeed('menu'.repeat(12))
    await expect(async () => keychain.unlockPrivateKeys([wrongSeed])).rejects.toThrow(
      /must pass in existing seed/
    )

    const keychain1 = createKeychain({ seed })
    keychain1.addSeed(seed1)
    keychain1.lockPrivateKeys()
    await expect(async () => keychain1.unlockPrivateKeys([seed, wrongSeed])).rejects.toThrow(
      /must pass in existing seed/
    )
  })

  it('either unlock all provided seeds or none', async () => {
    const keychain = createKeychain({ seed })

    keychain.addSeed(seed1)
    keychain.lockPrivateKeys()

    const wrongSeed = mnemonicToSeed('menu'.repeat(12))
    await expect(async () => keychain.unlockPrivateKeys([seed, wrongSeed])).rejects.toThrow(
      /must pass in existing seed/
    )

    expect(keychain.arePrivateKeysLocked([seed])).toBe(true)
  })

  it('should block exportKey for private keys when locked', async () => {
    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    await expect(
      keychain.exportKey({
        seedId,
        keyId,
        exportPrivate: true,
      })
    ).rejects.toThrow(/private keys are locked/)
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

    const keyId = new KeyIdentifier({
      derivationPath: 'm/0', // doesn't matter in this fixture as we don't use it
      derivationAlgorithm: 'SLIP10',
    })

    await expect(keychain.ed25519.signBuffer({ keyId })).rejects.toThrow(/private keys are locked/)
    await expect(keychain.createEd25519Signer(keyId).signBuffer({})).rejects.toThrow(
      /private keys are locked/
    )
  })

  it('should block secp256k1 when locked', async () => {
    const keyId = new KeyIdentifier({
      derivationPath: 'm/0', // doesn't matter in this fixture as we don't use it
      derivationAlgorithm: 'BIP32',
    })

    const keychain = createKeychain({ seed })
    keychain.lockPrivateKeys()
    await expect(keychain.secp256k1.signBuffer({ keyId })).rejects.toThrow(
      /private keys are locked/
    )
    await expect(keychain.createSecp256k1Signer(keyId).signBuffer({})).rejects.toThrow(
      /private keys are locked/
    )
  })
})
