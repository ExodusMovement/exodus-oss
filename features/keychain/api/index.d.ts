import type KeyIdentifier from '@exodus/key-identifier'
import type { UnsignedTransaction } from '@exodus/tx-signer'
import BN from 'bn.js'

type SeedId = string
type KeySource = { seedId: SeedId; keyId: KeyIdentifier }

type HdKeys = { privateKey: Buffer; publicKey: Buffer }

type SignTxCallback = (params: {
  unsignedTx: Tx
  hdkeys: HdKeys
  privateKey: Buffer
}) => void | Promise<void>

type TxSignParams = KeySource & { signTxCallback: SignTxCallback; unsignedTx: UnsignedTransaction }

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

type SignerParam = KeychainSignerParams & { seedId: string }

type Encryptor = {
  getSodiumKeysFromSeed: (
    args: KeySource
  ) => Promise<{ box: PubKeyWrapper; sign: PubKeyWrapper; secret: Buffer }>
  sign: (args: SignerParam) => Promise<Buffer>
  signOpen: (args: SignerParam) => Promise<Buffer>
  signDetached: (args: SignerParam) => Promise<Buffer>
  verifyDetached: (
    args: SignerParam & {
      signature: Buffer
    }
  ) => Promise<boolean>
  encryptSecretBox: (args: SignerParam) => Promise<Buffer>
  decryptSecretBox: (args: SignerParam) => Promise<Buffer>
  encryptBox: (args: SignerParam & { toPublicKey: Buffer }) => Promise<Buffer>
  decryptBox: (
    args: SignerParam & {
      fromPublicKey: Buffer
    }
  ) => Promise<Buffer>
  encryptSealedBox: (args: { data: Buffer; toPublicKey: Buffer }) => Promise<Buffer>
  decryptSealedBox: (args: SignerParam) => Promise<Buffer>
}

type KeyId = Record<string, string>

type Ed25519Signer = {
  signBuffer: (args: SignerParam) => Promise<Buffer>
}

type Secp256k1Signer = {
  signBuffer: (args: SignerParam) => Promise<Buffer>
  signSchnorr: (args: SignerParam) => Promise<Buffer>
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
