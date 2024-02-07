import { WalletAccount } from '@exodus/models'
import { mnemonicToSeed } from 'bip39'

import { createKeyIdentifierForExodus } from '@exodus/key-ids'
import createKeychain from './create-keychain'
import multiSeedKeychainDefinition from '../multi-seed-keychain'
import { getSeedId } from '../crypto/seed-id'

const { factory: createMultiSeedKeychain } = multiSeedKeychainDefinition

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const secondSeed = mnemonicToSeed(
  'wine system mean beyond filter human meat rubber episode wash stomach aunt'
)

const fusionKeyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })

describe('EcDSA Signer', () => {
  it('should signBuffer', async () => {
    const keychain = createKeychain({ seed })

    const signer = keychain.createSecp256k1Signer(fusionKeyId)
    const plaintext = Buffer.from('I really love keychains')
    const signature = await signer.signBuffer({ data: plaintext })
    const expected =
      '3045022100e3c37a346dcb717552e9591a43b3f099898cb0a7d2c5aa37447fb0146926bbec022057a2e393efbd154f55278844f402e05c5bedd6a6c205c4b293e50c83813e67a5'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer (using secp256k1 instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = Buffer.from('I really love keychains')
    const signature = await keychain.secp256k1.signBuffer({ keyId: fusionKeyId, data: plaintext })
    const expected =
      '3045022100e3c37a346dcb717552e9591a43b3f099898cb0a7d2c5aa37447fb0146926bbec022057a2e393efbd154f55278844f402e05c5bedd6a6c205c4b293e50c83813e67a5'
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
])('EcDSA Signer (multi-seed-keychain)', ({ primarySeed, secondarySeed, walletAccount }) => {
  it('should signBuffer (using secp256k1 instance)', async () => {
    const multiSeedKeychain = createMultiSeedKeychain()
    multiSeedKeychain.setPrimarySeed(primarySeed)
    multiSeedKeychain.addSeed(secondarySeed)

    const plaintext = Buffer.from('I really love keychains')
    const signature = await multiSeedKeychain.secp256k1.signBuffer({
      walletAccount,
      keyId: fusionKeyId,
      data: plaintext,
    })

    const expected =
      '3045022100e3c37a346dcb717552e9591a43b3f099898cb0a7d2c5aa37447fb0146926bbec022057a2e393efbd154f55278844f402e05c5bedd6a6c205c4b293e50c83813e67a5'
    expect(signature.toString('hex')).toBe(expected)
  })
})
