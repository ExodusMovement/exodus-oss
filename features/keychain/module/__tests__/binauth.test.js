import { mnemonicToSeed } from 'bip39'

import { EXODUS_KEY_IDS } from '../key-identifier'
import createKeychain from './create-keychain'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

describe('binauth', () => {
  it('should create binauth key', async () => {
    const keychain = createKeychain({ seed })

    // Getting the public key to use as identifier
    const sodiumEncryptor = await keychain.createSodiumEncryptor(EXODUS_KEY_IDS.TELEMETRY)
    const {
      sign: { publicKey },
    } = await sodiumEncryptor.getSodiumKeysFromSeed()
    const expectedPublicKey = Buffer.from(
      'eeab6c9e861ed9f3a7f7917f6d972032e3e4d7a433eb6bc30f4b488ee13682c7',
      'hex'
    )
    expect(Buffer.compare(publicKey, expectedPublicKey)).toBe(0)

    // Client signing the challenge
    const challenge = Buffer.from('aabbccc', 'hex')
    const signedChallenge = await sodiumEncryptor.sign({
      data: challenge,
    })
    const expectedSignedChallenge = Buffer.from(
      'f87037abf6dd8e46cc691880c008ffa5646ba8bf9f523339a503e16b8f6c92c647e00940804ae64770456e8211c18e27234371e9a5f62505f6f50feafcbb2d0faabbcc',
      'hex'
    )
    expect(Buffer.compare(signedChallenge, expectedSignedChallenge)).toBe(0)
  })

  it('should create binauth key (using sodium instance)', async () => {
    const keychain = createKeychain({ seed })

    // Getting the public key to use as identifier
    const keyId = EXODUS_KEY_IDS.TELEMETRY
    const { sign: { publicKey } } = await keychain.sodium.getSodiumKeysFromSeed({ keyId })

    const expectedPublicKey = Buffer.from(
      'eeab6c9e861ed9f3a7f7917f6d972032e3e4d7a433eb6bc30f4b488ee13682c7',
      'hex'
    )
    expect(Buffer.compare(publicKey, expectedPublicKey)).toBe(0)

    // Client signing the challenge
    const challenge = Buffer.from('aabbccc', 'hex')
    const signedChallenge = await await keychain.sodium.sign({ keyId, data: challenge })

    const expectedSignedChallenge = Buffer.from(
      'f87037abf6dd8e46cc691880c008ffa5646ba8bf9f523339a503e16b8f6c92c647e00940804ae64770456e8211c18e27234371e9a5f62505f6f50feafcbb2d0faabbcc',
      'hex'
    )
    expect(Buffer.compare(signedChallenge, expectedSignedChallenge)).toBe(0)
  })
})
