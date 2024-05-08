import { mnemonicToSeed } from 'bip39'

import createKeychain from './create-keychain'
import { getSeedId } from '../crypto/seed-id'
import KeyIdentifier from '@exodus/key-identifier'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

const seedId = getSeedId(seed)

const secondSeed = mnemonicToSeed(
  'wine system mean beyond filter human meat rubber episode wash stomach aunt'
)

const keyId = new KeyIdentifier({
  derivationPath: "m/44'/60'/0'/0/0",
  derivationAlgorithm: 'BIP32',
})

describe('EcDSA Signer', () => {
  it('should signBuffer', async () => {
    const keychain = createKeychain({ seed })

    const signer = keychain.createSecp256k1Signer(keyId)
    const plaintext = Buffer.from('I really love keychains')
    const signature = await signer.signBuffer({ seedId, data: plaintext })
    const expected =
      '30460221009288b22525674d76b0d5b8b20f333d4de4f4f88340a7d0a4cadd54b719e6162d022100f63e7591ce6b3bc0bf66fa2948d220e74ea2a74b63fc9dcb20e0f53191550b67'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer (using secp256k1 instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = Buffer.from('I really love keychains')
    const signature = await keychain.secp256k1.signBuffer({
      seedId,
      keyId,
      data: plaintext,
    })

    const expected =
      '30460221009288b22525674d76b0d5b8b20f333d4de4f4f88340a7d0a4cadd54b719e6162d022100f63e7591ce6b3bc0bf66fa2948d220e74ea2a74b63fc9dcb20e0f53191550b67'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should throw for keyType != secp256k1', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = Buffer.from('I really love keychains')
    const keyId = new KeyIdentifier({
      derivationPath: 'm/0',
      keyType: 'nacl',
      derivationAlgorithm: 'SLIP10',
    })

    await expect(
      keychain.secp256k1.signBuffer({
        seedId,
        keyId,
        data: plaintext,
      })
    ).rejects.toThrow('ECDSA signatures are not supported for nacl')
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
])('EcDSA Signer (multi-seed-keychain)', ({ primarySeed, secondarySeed, seedId }) => {
  it('should signBuffer (using secp256k1 instance)', async () => {
    const keychain = createKeychain({ seed: primarySeed })
    keychain.addSeed(secondarySeed)

    const plaintext = Buffer.from('I really love keychains')
    const signature = await keychain.secp256k1.signBuffer({
      seedId,
      keyId,
      data: plaintext,
    })

    const expected =
      '30460221009288b22525674d76b0d5b8b20f333d4de4f4f88340a7d0a4cadd54b719e6162d022100f63e7591ce6b3bc0bf66fa2948d220e74ea2a74b63fc9dcb20e0f53191550b67'
    expect(signature.toString('hex')).toBe(expected)
  })
})
