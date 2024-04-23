import KeyIdentifier from '@exodus/key-identifier'
import BN from 'bn.js'

type SeedId = string
type KeySource = { seedId: SeedId; keyId: KeyIdentifier }

type EcOptions = {
  canonical?: boolean
}

type EcSignature = {
  r: BN
  s: BN
  recoveryParam?: number
}

export interface KeychainApi {
  exportKey(params: KeySource): Promise<{
    publicKey: Buffer
    xpub: string
  }>
  exportKey(params: { exportPrivate: false } & KeySource): Promise<{
    publicKey: Buffer
    xpub: string
  }>
  exportKey(params: { exportPrivate: true } & KeySource): Promise<{
    publicKey: Buffer
    xpub: string
    privateKey: Buffer
    xpriv: string
  }>
  arePrivateKeysLocked(): Promise<boolean>
  sodium: {
    signDetached(params: { data: Buffer } & KeySource): Promise<Buffer>
    getKeysFromSeed(
      params: KeySource
    ): Promise<{ box: { publicKey: Buffer }; sign: { publicKey: Buffer } }>
  }
  ed25519: {
    signBuffer(params: { data: Buffer } & KeySource): Promise<Buffer>
  }
  secp256k1: {
    signBuffer(params: { data: Buffer; ecOptions?: EcOptions } & KeySource): Promise<Buffer>
    signBuffer(
      params: { data: Buffer; ecOptions?: EcOptions; enc: 'der' } & KeySource
    ): Promise<Buffer>
    signBuffer(
      params: { data: Buffer; ecOptions?: EcOptions; enc: 'raw' } & KeySource
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
