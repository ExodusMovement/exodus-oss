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
const plaintextMessage = Buffer.from('I really love keychains')
const plaintextTx = Buffer.from(
  '010001030bc08d0b03ca1bc9e72e91084d4f001c5e13270acb4fc2853efe7e6b6560b2d85fc00ab3d38d5424af5b90ea447f1f474a1144be96a6d871ee39587522da7239000000000000000000000000000000000000000000000000000000000000000058c46d1f0395440b25e73ab095b539a5b45c7746dd713131e2cfe2755d03958701020200010c0200000000f2052a01000000',
  'hex'
)

describe('EdDSA Signer', () => {
  it('should signBuffer', async () => {
    const keychain = createKeychain({ seed })
    const signer = keychain.createEd25519Signer(fusionKeyId)
    const signature = await signer.signBuffer({ data: plaintextMessage })
    const expected =
      'a929fd6e7e37524320e9f422caef1fefa14d9a70740626116b3570eac7e992893bea708c1b9004e222a779400c7ccabbd344c2399a2e4508f1de1cc602b0590a'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer (using ed25519 instance)', async () => {
    const keychain = createKeychain({ seed })
    const signature = await keychain.ed25519.signBuffer({
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
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/501'/0'/0/0",
    })
    const signer = keychain.createEd25519Signer(keyId)
    const signature = await signer.signBuffer({ data: plaintextTx })
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
    const signature = await keychain.ed25519.signBuffer({ keyId, data: plaintextTx })
    const expected =
      '1102815ed29faa093f8365870c892e82ee2aff0e7ded7e337dee4e206613355c786b769cf48269e08ae1646ca70974b4bbfdeb0fd5f459f3ef8b4845b8dd6b0f'
    expect(signature.toString('hex')).toBe(expected)
  })
})

describe.each([
  // reduce fixtures by switching seeds
  {
    primarySeed: seed,
    secondarySeed: secondSeed,
    walletAccount: WalletAccount.DEFAULT,
  },
  {
    primarySeed: secondSeed,
    secondarySeed: seed,
    walletAccount: new WalletAccount({
      id: getSeedId(seed),
      index: 0,
      source: 'seed',
    }),
  },
])('EdDSA Signer (multi-seed-keychain)', ({ primarySeed, secondarySeed, walletAccount }) => {
  const solanaKeyId = new KeyIdentifier({
    assetName: 'solana',
    derivationAlgorithm: 'BIP32',
    derivationPath: "m/44'/501'/0'/0/0",
  })

  const multiSeedKeychain = createMultiSeedKeychain()
  multiSeedKeychain.setPrimarySeed(primarySeed)
  multiSeedKeychain.addSeed(secondarySeed)

  it('should signBuffer (using ed25519 instance)', async () => {
    const signature = await multiSeedKeychain.ed25519.signBuffer({
      keyId: fusionKeyId,
      data: plaintextMessage,
      walletAccount,
    })
    const expected =
      'a929fd6e7e37524320e9f422caef1fefa14d9a70740626116b3570eac7e992893bea708c1b9004e222a779400c7ccabbd344c2399a2e4508f1de1cc602b0590a'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer with solana key (using ed25519 instance)', async () => {
    const signature = await multiSeedKeychain.ed25519.signBuffer({
      keyId: solanaKeyId,
      data: plaintextTx,
      walletAccount,
    })

    const expected =
      '1102815ed29faa093f8365870c892e82ee2aff0e7ded7e337dee4e206613355c786b769cf48269e08ae1646ca70974b4bbfdeb0fd5f459f3ef8b4845b8dd6b0f'
    expect(signature.toString('hex')).toBe(expected)
  })
})
