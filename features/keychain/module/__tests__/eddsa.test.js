import { mnemonicToSeed } from 'bip39'
import { createKeyIdentifierForExodus } from '@exodus/key-ids'
import KeyIdentifier from '@exodus/key-identifier'
import createKeychain from './create-keychain.js'
import { getSeedId } from '../crypto/seed-id.js'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const seedId = getSeedId(seed)

const secondSeed = mnemonicToSeed(
  'wine system mean beyond filter human meat rubber episode wash stomach aunt'
)

const fusionKeyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
const plaintextMessage = Buffer.from('I really love keychains')
const plaintextTx = Buffer.from(
  '010001030bc08d0b03ca1bc9e72e91084d4f001c5e13270acb4fc2853efe7e6b6560b2d85fc00ab3d38d5424af5b90ea447f1f474a1144be96a6d871ee39587522da7239000000000000000000000000000000000000000000000000000000000000000058c46d1f0395440b25e73ab095b539a5b45c7746dd713131e2cfe2755d03958701020200010c0200000000f2052a01000000',
  'hex'
)

describe('EdDSA Signer', () => {
  it('should signBuffer', async () => {
    const keychain = createKeychain({ seed })
    const signer = keychain.createEd25519Signer(fusionKeyId)
    const signature = await signer.signBuffer({ seedId, data: plaintextMessage })
    const expected =
      'a929fd6e7e37524320e9f422caef1fefa14d9a70740626116b3570eac7e992893bea708c1b9004e222a779400c7ccabbd344c2399a2e4508f1de1cc602b0590a'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer (using ed25519 instance)', async () => {
    const keychain = createKeychain({ seed })
    const signature = await keychain.ed25519.signBuffer({
      seedId,
      keyId: fusionKeyId,
      data: plaintextMessage,
    })
    const expected =
      'a929fd6e7e37524320e9f422caef1fefa14d9a70740626116b3570eac7e992893bea708c1b9004e222a779400c7ccabbd344c2399a2e4508f1de1cc602b0590a'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer', async () => {
    const keychain = createKeychain({ seed })
    const keyId = new KeyIdentifier({
      assetName: 'solana',
      derivationAlgorithm: 'SLIP10',
      derivationPath: "m/44'/501'/0'/0'/0'",
    })
    const signer = keychain.createEd25519Signer(keyId)
    const signature = await signer.signBuffer({ seedId, data: plaintextTx })
    const expected =
      '90ff0a2a3311957e2920223e1c5b495b731f00834ea431769a5b21cc194a6a7aa14377f1736060f5a685202efe152c18b2db87be300f93fd6a75552464567b00'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer with solana key (using ed25519 instance)', async () => {
    const keychain = createKeychain({ seed })
    const keyId = new KeyIdentifier({
      assetName: 'solana',
      derivationAlgorithm: 'SLIP10',
      derivationPath: "m/44'/501'/0'/0'/0'",
    })
    const signature = await keychain.ed25519.signBuffer({ seedId, keyId, data: plaintextTx })
    const expected =
      '90ff0a2a3311957e2920223e1c5b495b731f00834ea431769a5b21cc194a6a7aa14377f1736060f5a685202efe152c18b2db87be300f93fd6a75552464567b00'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should throw for keyType != nacl', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = Buffer.from('I really love keychains')
    const keyId = new KeyIdentifier({
      derivationPath: 'm/0',
      keyType: 'secp256k1',
      derivationAlgorithm: 'BIP32',
    })

    await expect(
      keychain.ed25519.signBuffer({
        seedId,
        keyId,
        data: plaintext,
      })
    ).rejects.toThrow('ED25519 signatures are not supported for secp256k1')
  })
})

describe.each([
  // reduce fixtures by switching seeds
  {
    primarySeed: seed,
    secondarySeed: secondSeed,
    seedId,
  },
  {
    primarySeed: secondSeed,
    secondarySeed: seed,
    seedId,
  },
])('EdDSA Signer (multi-seed-keychain)', ({ primarySeed, secondarySeed, seedId }) => {
  const solanaKeyId = new KeyIdentifier({
    assetName: 'solana',
    derivationAlgorithm: 'SLIP10',
    derivationPath: "m/44'/501'/0'/0'/0'",
  })

  const keychain = createKeychain({ seed: primarySeed })
  keychain.addSeed(secondarySeed)

  it('should signBuffer (using ed25519 instance)', async () => {
    const signature = await keychain.ed25519.signBuffer({
      keyId: fusionKeyId,
      data: plaintextMessage,
      seedId,
    })
    const expected =
      'a929fd6e7e37524320e9f422caef1fefa14d9a70740626116b3570eac7e992893bea708c1b9004e222a779400c7ccabbd344c2399a2e4508f1de1cc602b0590a'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer with solana key (using ed25519 instance)', async () => {
    const signature = await keychain.ed25519.signBuffer({
      keyId: solanaKeyId,
      data: plaintextTx,
      seedId,
    })

    const expected =
      '90ff0a2a3311957e2920223e1c5b495b731f00834ea431769a5b21cc194a6a7aa14377f1736060f5a685202efe152c18b2db87be300f93fd6a75552464567b00'
    expect(signature.toString('hex')).toBe(expected)
  })
})
