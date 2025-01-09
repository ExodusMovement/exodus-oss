import { mnemonicToSeed } from 'bip39'

import createKeychain from './create-keychain.js'
import { getSeedId } from '../crypto/seed-id.js'
import { hashSync } from '@exodus/crypto/hash'
import KeyIdentifier from '@exodus/key-identifier'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)
const entropy = '0000000000000000000000000000000000000000000000000000000000000000'
const seedId = getSeedId(seed)
const data = hashSync('sha256', Buffer.from('I really love keychains'))

describe('keychain.signBuffer', () => {
  const keychain = createKeychain({ seed })

  it('signatureType "ecdsa" with "der" encoding', async () => {
    const keyId = new KeyIdentifier({
      derivationPath: "m/44'/60'/0'/0/0",
      derivationAlgorithm: 'BIP32',
      keyType: 'secp256k1',
    })
    const signatureType = 'ecdsa'
    const expected =
      '30440220722491f3d490960c4fc16b56b8dacafa9d446e17d9321dbbe3b216da845adc9802203afd466c1450c60f7ef0fcdf55b1e3bb206d9f989530996059890a9d92ab1ef9'

    const signature1 = await keychain.signBuffer({ seedId, keyId, signatureType, data })
    const signature2 = await keychain.signBuffer({ seedId, keyId, signatureType, data, enc: 'der' })

    expect(signature1.toString('hex')).toBe(expected)
    expect(signature2.toString('hex')).toBe(expected)
  })

  it('signatureType "ecdsa" with "sig" encoding', async () => {
    const keyId = new KeyIdentifier({
      derivationPath: "m/44'/60'/0'/0/0",
      derivationAlgorithm: 'BIP32',
      keyType: 'secp256k1',
    })
    const signatureType = 'ecdsa'
    const expected =
      '722491f3d490960c4fc16b56b8dacafa9d446e17d9321dbbe3b216da845adc983afd466c1450c60f7ef0fcdf55b1e3bb206d9f989530996059890a9d92ab1ef9'

    const signature = await keychain.signBuffer({ seedId, keyId, signatureType, data, enc: 'sig' })

    expect(signature.toString('hex')).toBe(expected)
  })

  it('signatureType "ecdsa" fails with invalid arg', async () => {
    const keyId = new KeyIdentifier({
      derivationPath: "m/44'/60'/0'/0/0",
      derivationAlgorithm: 'BIP32',
      keyType: 'secp256k1',
    })
    const signatureType = 'ecdsa'

    await expect(keychain.signBuffer({ keyId, signatureType, data, foo: null })).rejects.toThrow(
      'unsupported options supplied to signBuffer()'
    )
    await expect(keychain.signBuffer({ keyId, signatureType, data, tweak: null })).rejects.toThrow(
      'unsupported options supplied for ecdsa signature'
    )
  })

  it('signatureType "schnorr"', async () => {
    const keyId = new KeyIdentifier({
      derivationPath: "m/44'/60'/0'/0/0",
      derivationAlgorithm: 'BIP32',
      keyType: 'secp256k1',
    })
    const signatureType = 'schnorr'
    const expected =
      '10aa0975c224ea48e7d96f40b055d1b51ac257c7f177bb0f1e2c52bd3186fe112777756e2c0de7e2597849a7e3792483da717dcbe70ebf3f3d8d758730de7209'

    const signature = await keychain.signBuffer({
      seedId,
      keyId,
      signatureType,
      data,
      extraEntropy: Buffer.from(entropy, 'hex'),
    })

    expect(Buffer.from(signature).toString('hex')).toBe(expected)
  })

  it('signatureType "schnorrZ" fails with "extraEntropy" arg', async () => {
    const keyId = new KeyIdentifier({
      derivationPath: "m/44'/60'/0'/0/0",
      derivationAlgorithm: 'BIP32',
      keyType: 'secp256k1',
    })
    const data = hashSync('sha256', Buffer.from('I really love keychains'))
    const signatureType = 'schnorrZ'

    await expect(
      keychain.signBuffer({ keyId, signatureType, data, extraEntropy: null })
    ).rejects.toThrow('unsupported options supplied for schnorrZ signature')
  })

  it('signatureType "ed25519" fails with invalid params', async () => {
    let keyId = new KeyIdentifier({
      derivationPath: "m/44'/60'/0'/0/0",
      derivationAlgorithm: 'BIP32',
      keyType: 'secp256k1',
    })
    const signatureType = 'ed25519'

    await expect(keychain.signBuffer({ keyId, signatureType, data })).rejects.toThrow(
      '"keyId.keyType" secp256k1 does not support "signatureType" ed25519'
    )

    keyId = new KeyIdentifier({
      derivationPath: "m/44'/60'/0'/0/0",
      derivationAlgorithm: 'BIP32',
      keyType: 'nacl',
    })

    await expect(
      keychain.signBuffer({ keyId, signatureType, data, extraEntropy: null })
    ).rejects.toThrow('unsupported options supplied for ed25519 signature')
  })

  it('signatureType "ed25519"', async () => {
    const keyId = new KeyIdentifier({
      derivationPath: "m/44'/60'/0'/0/0",
      derivationAlgorithm: 'BIP32',
      keyType: 'nacl',
    })
    const signatureType = 'ed25519'
    const expected =
      'd0f019e45795a86d79542143483e22a2478498289490072c902408c01744f81d2d7769c7b6c5c28ade5336d20ea8b39c3723264d1d271a24a15dca509e3d5f03'

    const signature = await keychain.signBuffer({ seedId, keyId, signatureType, data })

    expect(signature.toString('hex')).toBe(expected)
  })
})
