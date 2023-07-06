import { mnemonicToSeed } from 'bip39'

import { createKeyIdentifierForExodus, KeyIdentifier } from '../key-identifier'
import createKeychain from './create-keychain'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

describe('EdDSA Signer', () => {
  it('should signBuffer', async () => {
    const keychain = createKeychain({ seed })
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    const signer = keychain.createEd25519Signer(keyId)
    const plaintext = Buffer.from('I really love keychains')
    const signature = await signer.signBuffer({ data: plaintext })
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
})
