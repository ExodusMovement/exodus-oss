import { mnemonicToSeed } from 'bip39'

import createKeychain from './create-keychain.js'
import { getSeedId } from '../crypto/seed-id.js'
import { hash, hashSync } from '@exodus/crypto/hash'
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
    const signature = await signer.signBuffer({ seedId, data: await hash('sha256', plaintext) })
    const expected =
      '30440220722491f3d490960c4fc16b56b8dacafa9d446e17d9321dbbe3b216da845adc9802203afd466c1450c60f7ef0fcdf55b1e3bb206d9f989530996059890a9d92ab1ef9'
    expect(signature.toString('hex')).toBe(expected)
  })

  it('should signBuffer (using secp256k1 instance)', async () => {
    const keychain = createKeychain({ seed })
    const plaintext = Buffer.from('I really love keychains')
    const signature = await keychain.secp256k1.signBuffer({
      seedId,
      keyId,
      data: await hash('sha256', plaintext),
    })

    const expected =
      '30440220722491f3d490960c4fc16b56b8dacafa9d446e17d9321dbbe3b216da845adc9802203afd466c1450c60f7ef0fcdf55b1e3bb206d9f989530996059890a9d92ab1ef9'
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
        data: await hash('sha256', plaintext),
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
      data: await hash('sha256', plaintext),
    })

    const expected =
      '30440220722491f3d490960c4fc16b56b8dacafa9d446e17d9321dbbe3b216da845adc9802203afd466c1450c60f7ef0fcdf55b1e3bb206d9f989530996059890a9d92ab1ef9'
    expect(signature.toString('hex')).toBe(expected)
  })
})

describe('EcDSA Signer Signature Encoding', () => {
  const keychain = createKeychain({ seed })
  const data = hashSync('sha256', 'I really love keychains')
  const expected = {
    default:
      '30440220722491f3d490960c4fc16b56b8dacafa9d446e17d9321dbbe3b216da845adc9802203afd466c1450c60f7ef0fcdf55b1e3bb206d9f989530996059890a9d92ab1ef9',
    binary:
      '722491f3d490960c4fc16b56b8dacafa9d446e17d9321dbbe3b216da845adc983afd466c1450c60f7ef0fcdf55b1e3bb206d9f989530996059890a9d92ab1ef900',
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

  it('sig|rec encoding', async () => {
    const signature = await keychain.secp256k1.signBuffer({ seedId, keyId, data, enc: 'sig|rec' })
    expect(signature instanceof Buffer).toBe(true)
    expect(signature.toString('hex')).toBe(expected.binary)
  })

  it('rec|sig encoding', async () => {
    const signature = await keychain.secp256k1.signBuffer({ seedId, keyId, data, enc: 'rec|sig' })
    expect(signature instanceof Buffer).toBe(true)
    const recsig = expected.binary.slice(128) + expected.binary.slice(0, 128)
    expect(signature.toString('hex')).toBe(recsig)
  })

  it('sig,rec encoding', async () => {
    const res = await keychain.secp256k1.signBuffer({ seedId, keyId, data, enc: 'sig,rec' })
    expect(typeof res === 'object').toBe(true)
    const { signature, recovery } = res
    expect(signature instanceof Buffer).toBe(true)
    expect(signature.toString('hex')).toBe(expected.binary.slice(0, 128))
    expect(recovery === 0 || recovery === 1).toBe(true)
    expect(recovery).toBe(Buffer.from(expected.binary, 'hex')[64])
  })

  it('Raw encoding', async () => {
    const signature = await keychain.secp256k1.signBuffer({ seedId, keyId, data, enc: 'raw' })
    expect(typeof signature === 'object').toBe(true)
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
