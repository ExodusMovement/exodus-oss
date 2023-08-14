import assert from 'minimalistic-assert'

import { isValidBIPPath } from './key-utils'

// key identifier example:
// {
//   derivationAlgorithm: 'BIP32',
//   derivationPath: `m/44'/60'/0'/0/0`
//   // needed because some assets like `ethereum` and `matic` share the same constant but may have other differences
//   assetName: 'solana'
// }
const SUPPORTED_KDFS = new Set(['BIP32', 'SLIP10'])
const SUPPORTED_KEY_TYPES = new Set(['legacy', 'nacl', 'secp256k1'])

export class KeyIdentifier {
  constructor({ derivationAlgorithm, derivationPath, assetName, keyType }) {
    assert(typeof derivationAlgorithm === 'string', 'derivationAlgorithm not a string')
    assert(
      SUPPORTED_KDFS.has(derivationAlgorithm),
      `${derivationAlgorithm} is not a valid derivationAlgorithm`
    )

    assert(typeof derivationPath === 'string', 'derivationPath was not a string')
    assert(isValidBIPPath(derivationPath), 'derivationPath not formated properly')

    assert(['string', 'undefined'].includes(typeof assetName), 'assetName was not a string')

    keyType = keyType || (derivationAlgorithm === 'SLIP10' ? 'nacl' : 'secp256k1')
    assert(SUPPORTED_KEY_TYPES.has(keyType), 'keyType was not a valid option')

    if (derivationAlgorithm === 'SLIP10') {
      // We can't turn secp256k1 into ed25119 keys for now, this is not used
      // anywhere but serves as an extra check to ensure it never happens in the
      // future. You can however have BIP32 keys with keyType nacl.
      assert(keyType !== 'secp256k1', 'secp256k1 requires BIP32 derivation')
    }

    this.derivationAlgorithm = derivationAlgorithm
    this.derivationPath = derivationPath
    this.assetName = assetName
    this.keyType = keyType

    // Freeze the object on construction, disallow tampering with derivation path.
    // Ensures immutability of key identifiers passed to keychain.
    Object.freeze(this)
  }

  static validate = (potentialKeyIdentifier) => {
    try {
      // eslint-disable-next-line no-new
      new KeyIdentifier(potentialKeyIdentifier)
      return true
    } catch {
      return false
    }
  }
}

const EXO = Number.parseInt(Buffer.from('exo').toString('hex'), '16')
export const EXODUS_KEY_IDS = Object.freeze({
  WALLET_INFO: new KeyIdentifier({
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/1'/0`,
    keyType: 'nacl',
  }),
  BACKUP_FILE: new KeyIdentifier({
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/1'/1`,
    keyType: 'nacl',
  }),
  FUSION: new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/2'/0'`,
    keyType: 'nacl',
  }),
  '2FA_MODE': new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/2'/1'`,
    keyType: 'nacl',
  }),
  TELEMETRY: new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/2'/3'`,
    keyType: 'nacl',
  }),
  SEEDLESS: new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/5'/0'`,
    keyType: 'nacl',
  }),
})

export const createKeyIdentifierForExodus = ({ exoType }) => {
  assert(typeof exoType === 'string', 'exotype must be of type string')
  const keyId = EXODUS_KEY_IDS[exoType]
  if (!keyId) {
    throw new TypeError('Invalid exodus key requested')
  }

  return keyId
}
