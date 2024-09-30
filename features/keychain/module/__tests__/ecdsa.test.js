import { mnemonicToSeed } from 'bip39'

import createKeychain from './create-keychain.js'
import { getSeedId } from '../crypto/seed-id.js'
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
      '30450221009288b22525674d76b0d5b8b20f333d4de4f4f88340a7d0a4cadd54b719e6162d022009c18a6e3194c43f409905d6b72ddf176c0c359b4b4c02709ef1695b3ee135da'
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
      '30450221009288b22525674d76b0d5b8b20f333d4de4f4f88340a7d0a4cadd54b719e6162d022009c18a6e3194c43f409905d6b72ddf176c0c359b4b4c02709ef1695b3ee135da'
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
      '30450221009288b22525674d76b0d5b8b20f333d4de4f4f88340a7d0a4cadd54b719e6162d022009c18a6e3194c43f409905d6b72ddf176c0c359b4b4c02709ef1695b3ee135da'
    expect(signature.toString('hex')).toBe(expected)
  })
})

describe('EcDSA Signer Signature Encoding', () => {
  const keychain = createKeychain({ seed })
  const data = Buffer.from('I really love keychains')
  const expected = {
    default:
      '30450221009288b22525674d76b0d5b8b20f333d4de4f4f88340a7d0a4cadd54b719e6162d022009c18a6e3194c43f409905d6b72ddf176c0c359b4b4c02709ef1695b3ee135da',
    binary:
      '9288b22525674d76b0d5b8b20f333d4de4f4f88340a7d0a4cadd54b719e6162d09c18a6e3194c43f409905d6b72ddf176c0c359b4b4c02709ef1695b3ee135da01',
  }

  it('Default encoding', async () => {
    const signature = await keychain.secp256k1.signBuffer({ seedId, keyId, data })
    expect(signature instanceof Buffer).toBe(true)
    expect(signature.toString('hex')).toBe(expected.default)
  })

  it('DER encoding', async () => {
    const signature = await keychain.secp256k1.signBuffer({ seedId, keyId, data, enc: 'der' })
    expect(signature instanceof Buffer).toBe(true)
    expect(signature.toString('hex')).toBe(expected.default)
  })

  it('Binary encoding', async () => {
    const signature = await keychain.secp256k1.signBuffer({ seedId, keyId, data, enc: 'binary' })
    expect(signature instanceof Buffer).toBe(true)
    expect(signature.toString('hex')).toBe(expected.binary)
  })

  it('Raw encoding', async () => {
    const signature = await keychain.secp256k1.signBuffer({ seedId, keyId, data, enc: 'raw' })
    expect(typeof signature === 'object')
    expect(Object.getOwnPropertyNames(signature)).toStrictEqual(['r', 's', 'recoveryParam'])
    const r = Buffer.from(signature.r.toArray('be', 32))
    const s = Buffer.from(signature.s.toArray('be', 32))
    const binary = Buffer.concat([r, s, Buffer.from([signature.recoveryParam])])
    expect(binary.toString('hex')).toBe(expected.binary)
  })

  it('Invalid encoding', async () => {
    const sign = () => keychain.secp256k1.signBuffer({ seedId, keyId, data, enc: 'other' })
    await expect(sign()).rejects.toThrow(/signBuffer: invalid enc/)
  })
})
