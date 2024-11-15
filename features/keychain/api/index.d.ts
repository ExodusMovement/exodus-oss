import KeyIdentifier from '@exodus/key-identifier'

type SeedId = string
type KeySource = { seedId: SeedId; keyId: KeyIdentifier }

type PublicKeys = {
  publicKey: Buffer
  xpub: string
}

type PrivateKeys = {
  privateKey: Buffer
  xpriv: string
}

export interface KeychainApi {
  exportKey(params: KeySource): Promise<PublicKeys>
  exportKey(params: { exportPrivate: false } & KeySource): Promise<PublicKeys>
  exportKey(params: { exportPrivate: true } & KeySource): Promise<PublicKeys & PrivateKeys>
  arePrivateKeysLocked(seeds: Buffer[]): boolean
  removeSeeds(seeds: Buffer[]): string[]
  sodium: {
    sign(params: { data: Buffer } & KeySource): Promise<Buffer>
    signDetached(params: { data: Buffer } & KeySource): Promise<Buffer>
    getKeysFromSeed(
      params: KeySource
    ): Promise<{ box: { publicKey: Buffer }; sign: { publicKey: Buffer } }>
    encryptSecretBox(params: { data: Buffer } & KeySource): Promise<Buffer>
    decryptSecretBox(params: { data: Buffer } & KeySource): Promise<Buffer>
    encryptBox(params: { data: Buffer; toPublicKey: Buffer } & KeySource): Promise<Buffer>
    decryptBox(params: { data: Buffer; fromPublicKey: Buffer } & KeySource): Promise<Buffer>
  }
  ed25519: {
    signBuffer(params: { data: Buffer } & KeySource): Promise<Buffer>
  }
  secp256k1: {
    signBuffer(params: { data: Buffer } & KeySource): Promise<Buffer>
    signBuffer(params: { data: Buffer; enc: 'der' } & KeySource): Promise<Buffer>
    signSchnorr(params: { data: Buffer; extraEntropy?: Buffer } & KeySource): Promise<Buffer>
  }
}

declare const keychainApiDefinition: {
  id: 'keychainApi'
  type: 'api'
  factory(): {
    keychain: KeychainApi
  }
}

export default keychainApiDefinition
