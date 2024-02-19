import { mnemonicToSeed } from 'bip39'
import { createKeyIdentifierForExodus } from '@exodus/key-ids'
import KeyIdentifier from '@exodus/key-identifier'
import createKeychain from './create-keychain'
import { getSeedId } from '../crypto/seed-id'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const seedId = getSeedId(seed)

describe('compatibility', () => {
  it('should have libsodium.sign keys compatible with SLIP10', async () => {
    // libodium signing keys are Ed25519 keys but with a small twist.
    // The privateKey is actually a concat of privateKey + publicKey.
    // This is because Ed25519 allows for multiple cofactors, allowing
    // multiple publicKeys (different order) for the same private key.

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

  it('should match libsodium.signDetached signature with tweetnacl.sign.detached', async () => {
    // libsodium should be fully compatible with tweetnacl with
    // the exception that tweetnacl doesn't support sealed boxes.
    // Any asset that uses tweetnacl for signing should be able to
    // use libsodium under the hood with minimal changes.
    const tweetnacl = {
      message:
        '010001030bc08d0b03ca1bc9e72e91084d4f001c5e13270acb4fc2853efe7e6b6560b2d85fc00ab3d38d5424af5b90ea447f1f474a1144be96a6d871ee39587522da7239000000000000000000000000000000000000000000000000000000000000000058c46d1f0395440b25e73ab095b539a5b45c7746dd713131e2cfe2755d03958701020200010c0200000000f2052a01000000',
      signature:
        '1102815ed29faa093f8365870c892e82ee2aff0e7ded7e337dee4e206613355c786b769cf48269e08ae1646ca70974b4bbfdeb0fd5f459f3ef8b4845b8dd6b0f',
    }

    const keychain = createKeychain({ seed })
    const keyId = new KeyIdentifier({
      assetName: 'solana',
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/501'/0'/0/0",
    })
    const signer = keychain.createEd25519Signer(keyId)
    const signature = await signer.signBuffer({
      seedId,
      data: Buffer.from(tweetnacl.message, 'hex'),
    })
    expect(signature.toString('hex')).toBe(tweetnacl.signature)
  })
})
