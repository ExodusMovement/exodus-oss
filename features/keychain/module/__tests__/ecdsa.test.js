import { mnemonicToSeed } from 'bip39'

import { createKeyIdentifierForExodus } from '@exodus/key-ids'
import createKeychain from './create-keychain'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

describe('EcDSA Signer', () => {
  it('should signBuffer', async () => {
    const keychain = createKeychain({ seed })

    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    const signer = keychain.createSecp256k1Signer(keyId)
    const plaintext = Buffer.from('I really love keychains')
    const signature = await signer.signBuffer({ data: plaintext })
    const expected =
      '3045022100e3c37a346dcb717552e9591a43b3f099898cb0a7d2c5aa37447fb0146926bbec022057a2e393efbd154f55278844f402e05c5bedd6a6c205c4b293e50c83813e67a5'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer (using secp256k1 instance)', async () => {
    const keychain = createKeychain({ seed })
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    const plaintext = Buffer.from('I really love keychains')
    const signature = await keychain.secp256k1.signBuffer({ keyId, data: plaintext })
    const expected =
      '3045022100e3c37a346dcb717552e9591a43b3f099898cb0a7d2c5aa37447fb0146926bbec022057a2e393efbd154f55278844f402e05c5bedd6a6c205c4b293e50c83813e67a5'
    expect(signature.toString('hex')).toBe(expected)
  })
})
