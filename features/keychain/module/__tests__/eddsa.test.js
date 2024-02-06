import { mnemonicToSeed } from 'bip39'
import { createKeyIdentifierForExodus } from '@exodus/key-ids'
import { KeyIdentifier } from '../key-identifier'
import createKeychain from './create-keychain'
import multiSeedKeychainDefinition from '../multi-seed-keychain'
import { getSeedId } from '../crypto/seed-id'
import { WalletAccount } from '@exodus/models'

const { factory: createMultiSeedKeychain } = multiSeedKeychainDefinition

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const secondSeed = mnemonicToSeed(
  'wine system mean beyond filter human meat rubber episode wash stomach aunt'
)

const fusionKeyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })

describe('EdDSA Signer', () => {
  it('should signBuffer', async () => {
    const keychain = createKeychain({ seed })
    const signer = keychain.createEd25519Signer(fusionKeyId)
    const plaintext = Buffer.from('I really love keychains')
    const signature = await signer.signBuffer({ data: plaintext })
    const expected =
      'a929fd6e7e37524320e9f422caef1fefa14d9a70740626116b3570eac7e992893bea708c1b9004e222a779400c7ccabbd344c2399a2e4508f1de1cc602b0590a'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer (using ed25519 instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = Buffer.from('I really love keychains')
    const signature = await keychain.ed25519.signBuffer({ keyId: fusionKeyId, data: plaintext })
    const expected =
      'a929fd6e7e37524320e9f422caef1fefa14d9a70740626116b3570eac7e992893bea708c1b9004e222a779400c7ccabbd344c2399a2e4508f1de1cc602b0590a'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer', async () => {
    const keychain = createKeychain({ seed })
    const keyId = new KeyIdentifier({
      assetName: 'solana',
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/501'/0'/0/0",
    })
    const signer = keychain.createEd25519Signer(keyId)
    const plaintext = Buffer.from(
      '010001030bc08d0b03ca1bc9e72e91084d4f001c5e13270acb4fc2853efe7e6b6560b2d85fc00ab3d38d5424af5b90ea447f1f474a1144be96a6d871ee39587522da7239000000000000000000000000000000000000000000000000000000000000000058c46d1f0395440b25e73ab095b539a5b45c7746dd713131e2cfe2755d03958701020200010c0200000000f2052a01000000',
      'hex'
    )
    const signature = await signer.signBuffer({ data: plaintext })
    const expected =
      '1102815ed29faa093f8365870c892e82ee2aff0e7ded7e337dee4e206613355c786b769cf48269e08ae1646ca70974b4bbfdeb0fd5f459f3ef8b4845b8dd6b0f'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer with solana key (using ed25519 instance)', async () => {
    const keychain = createKeychain({ seed })
    const keyId = new KeyIdentifier({
      assetName: 'solana',
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/501'/0'/0/0",
    })
    const plaintext = Buffer.from(
      '010001030bc08d0b03ca1bc9e72e91084d4f001c5e13270acb4fc2853efe7e6b6560b2d85fc00ab3d38d5424af5b90ea447f1f474a1144be96a6d871ee39587522da7239000000000000000000000000000000000000000000000000000000000000000058c46d1f0395440b25e73ab095b539a5b45c7746dd713131e2cfe2755d03958701020200010c0200000000f2052a01000000',
      'hex'
    )
    const signature = await keychain.ed25519.signBuffer({ keyId, data: plaintext })
    const expected =
      '1102815ed29faa093f8365870c892e82ee2aff0e7ded7e337dee4e206613355c786b769cf48269e08ae1646ca70974b4bbfdeb0fd5f459f3ef8b4845b8dd6b0f'
    expect(signature.toString('hex')).toBe(expected)
  })
})

describe('EdDSA Signer', () => {
  const plaintextMessage = Buffer.from('I really love keychains')
  const plaintextTx = Buffer.from(
    '010001030bc08d0b03ca1bc9e72e91084d4f001c5e13270acb4fc2853efe7e6b6560b2d85fc00ab3d38d5424af5b90ea447f1f474a1144be96a6d871ee39587522da7239000000000000000000000000000000000000000000000000000000000000000058c46d1f0395440b25e73ab095b539a5b45c7746dd713131e2cfe2755d03958701020200010c0200000000f2052a01000000',
    'hex'
  )

  const solanaKeyId = new KeyIdentifier({
    assetName: 'solana',
    derivationAlgorithm: 'BIP32',
    derivationPath: "m/44'/501'/0'/0/0",
  })

  const defaultWalletAccount = new WalletAccount({
    index: 0,
    source: 'seed',
    id: getSeedId(seed),
  })

  const otherWalletAccount = new WalletAccount({
    index: 0,
    source: 'seed',
    id: getSeedId(secondSeed),
  })

  const multiSeedKeychain = createMultiSeedKeychain()
  multiSeedKeychain.setDefaultSeed(seed)
  multiSeedKeychain.addSeed(secondSeed)

  it('should signBuffer with default seed walletAccount (using ed25519 instance)', async () => {
    const signature = await multiSeedKeychain.ed25519.signBuffer({
      keyId: fusionKeyId,
      data: plaintextMessage,
      walletAccount: defaultWalletAccount,
    })
    const expected =
      'a929fd6e7e37524320e9f422caef1fefa14d9a70740626116b3570eac7e992893bea708c1b9004e222a779400c7ccabbd344c2399a2e4508f1de1cc602b0590a'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer with non-default seed walletAccount (using ed25519 instance)', async () => {
    const signature = await multiSeedKeychain.ed25519.signBuffer({
      keyId: fusionKeyId,
      data: plaintextMessage,
      walletAccount: otherWalletAccount,
    })
    const expected =
      'ce16bd9a915063283249fd39ffe1aa1cadcb669b8aad65a1b28d701732b7d90bf84bd99f79056c274288053105e0f367c72a643a8f0987e6b2db28be5475230b'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer with solana key (using ed25519 instance)', async () => {
    const signature = await multiSeedKeychain.ed25519.signBuffer({
      keyId: solanaKeyId,
      data: plaintextTx,
      walletAccount: defaultWalletAccount,
    })

    const expected =
      '1102815ed29faa093f8365870c892e82ee2aff0e7ded7e337dee4e206613355c786b769cf48269e08ae1646ca70974b4bbfdeb0fd5f459f3ef8b4845b8dd6b0f'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer with solana key (using ed25519 instance)', async () => {
    const signature = await multiSeedKeychain.ed25519.signBuffer({
      keyId: solanaKeyId,
      data: plaintextTx,
      walletAccount: otherWalletAccount,
    })

    const expected =
      'ad784079538d18932514b5a1f9620ea346fb657b2836e117c95c78df968879a2c9a64a353bff3bb985df683ac87dc5f3b9c6390df79d87aa44ac4ce6d9967701'
    expect(signature.toString('hex')).toBe(expected)
  })
})
