import KeyIdentifier from '@exodus/key-identifier'
import BN from 'bn.js'

type SeedId = string
type KeySource = { seedId: SeedId; keyId: KeyIdentifier }

type EcSignature = {
  r: BN
  s: BN
  recoveryParam?: number
}

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
    signDetached(params: { data: Buffer } & KeySource): Promise<Buffer>
    getKeysFromSeed(
      params: KeySource
    ): Promise<{ box: { publicKey: Buffer }; sign: { publicKey: Buffer } }>
    encryptSecretBox(params: { data: Buffer } & KeySource): Promise<Buffer>
    decryptSecretBox(params: { data: Buffer } & KeySource): Promise<Buffer>
  }
  ed25519: {
    signBuffer(params: { data: Buffer } & KeySource): Promise<Buffer>
  }
  secp256k1: {
    signBuffer(params: { data: Buffer } & KeySource): Promise<Buffer>
    signBuffer(
      params: { data: Buffer; enc: 'der' } & KeySource
    ): Promise<Buffer>
    signBuffer(
      params: { data: Buffer; enc: 'raw' } & KeySource
    ): Promise<EcSignature>
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
