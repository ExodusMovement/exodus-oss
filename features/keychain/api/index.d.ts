import KeyIdentifier from '@exodus/key-identifier'
import BN from 'bn.js'

type SeedId = string
type KeySource = { seedId: SeedId; keyId: KeyIdentifier }

type Tx = Record<string, unknown>
type HdKeys = { privateKey: Buffer; publicKey: Buffer }

type SignTxCallback = (params: {
  unsignedTx: Tx
  hdkeys: HdKeys
  privateKey: Buffer
}) => void | Promise<void>

type TxSignParams = KeySource & { signTxCallback: SignTxCallback; unsignedTx: Tx }

type EcOptions = {
  canonical?: boolean
}

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

type PubKeyWrapper = {
  publicKey: Buffer
}

type SignerInput = { seedId: string; keyId: string; data: Buffer }

type Encryptor = {
  getSodiumKeysFromSeed: (
    args: KeySource
  ) => Promise<{ box: PubKeyWrapper; sign: PubKeyWrapper; secret: Buffer }>
  sign: (args: SignerInput) => Promise<Buffer>
  signOpen: (args: SignerInput) => Promise<Buffer>
  signDetached: (args: SignerInput) => Promise<Buffer>
  verifyDetached: (
    args: SignerInput & {
      signature: Buffer
    }
  ) => Promise<boolean>
  encryptSecretBox: (args: SignerInput) => Promise<Buffer>
  decryptSecretBox: (args: SignerInput) => Promise<Buffer>
  encryptBox: (args: SignerInput & { toPublicKey: Buffer }) => Promise<Buffer>
  decryptBox: (
    args: SignerInput & {
      fromPublicKey: Buffer
    }
  ) => Promise<Buffer>
  encryptSealedBox: (args: { data: Buffer; toPublicKey: Buffer }) => Promise<Buffer>
  decryptSealedBox: (args: SignerInput) => Promise<Buffer>
}

type KeyId = Record<string, string>

type Ed25519Signer = {
  signBuffer: (args: SignerInput) => Promise<Buffer>
}

type Secp256k1Signer = {
  signBuffer: (args: SignerInput) => Promise<Buffer>
  signSchnorr: (args: SignerInput & { tweak: Buffer; extraEntropy: Buffer }) => Promise<Buffer>
}

type CreateSignerArgs = {
  keyId: KeyId
}

export interface KeychainApi {
  syncTx(params: TxSignParams): Promise<Tx>
  addSeed(seed: Buffer): Promise<SeedId>
  removeAllSeeds(): void
  clear(): void
  clone(): KeychainApi
  createSodiumEncryptor(keyId: string): Encryptor
  createEd25519Signer(args: CreateSignerArgs): Ed25519Signer
  createSecp256k1Signer(args: CreateSignerArgs): Secp256k1Signer
  exportKey(params: KeySource): Promise<PublicKeys>
  exportKey(params: { exportPrivate: false } & KeySource): Promise<PublicKeys>
  exportKey(params: { exportPrivate: true } & KeySource): Promise<PublicKeys & PrivateKeys>
  arePrivateKeysLocked(seeds: Buffer[]): boolean
  sodium: {
    signDetached(params: { data: Buffer } & KeySource): Promise<Buffer>
    getKeysFromSeed(params: KeySource): Promise<{ box: PubKeyWrapper; sign: PubKeyWrapper }>
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
