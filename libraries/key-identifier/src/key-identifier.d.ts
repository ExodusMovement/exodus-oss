import type { DerivationPath } from '@exodus/key-utils'

type PathIndex = number | string
type KeyType = 'legacy' | 'nacl' | 'secp256k1'
type DerivationAlgorithm = 'BIP32' | 'SLIP10'

type ConstructorParams = {
  derivationAlgorithm: DerivationAlgorithm
  derivationPath: string | PathIndex[]
  assetName?: string
  keyType: KeyType
}

type KeyIdentifierLike = Partial<ConstructorParams>

export default class KeyIdentifier {
  derivationAlgorithm: DerivationAlgorithm
  keyType: KeyType
  assetName?: string

  constructor(params: ConstructorParams)

  readonly derivationPath: string

  /**
   * Returns a new KeyIdentifier instance that has an updated derivation path extended with
   * the path indices or partial derivation path supplied to this method
   */
  derive(pathLike: string | PathIndex[]): KeyIdentifier

  getPath(): DerivationPath

  toJSON(): {
    assetName?: string
    derivationAlgorithm: DerivationAlgorithm
    keyType: KeyType
    derivationPath: string
  }

  toString(): string

  static validate(potentialKeyIdentifier: KeyIdentifierLike): boolean
  static compare(a: KeyIdentifierLike, b: KeyIdentifierLike): boolean
}
