type ConstructorParams = {
  derivationAlgorithm: 'BIP32' | 'SLIP10'
  derivationPath: string
  assetName?: string
  keyType: 'legacy' | 'nacl' | 'secp2561'
}

type KeyIdentifierLike = Partial<ConstructorParams>

export default class KeyIdentifier {
  derivationAlgorithm: ConstructorParams['derivationAlgorithm']
  derivationPath: ConstructorParams['derivationPath']
  assetName: ConstructorParams['assetName']
  keyType: ConstructorParams['keyType']

  constructor(params: ConstructorParams)

  static validate(potentialKeyIdentifier: KeyIdentifierLike): boolean
  static compare(a: KeyIdentifierLike, b: KeyIdentifierLike): boolean
}
