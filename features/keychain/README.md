# `@exodus/keychain`

The keychain is a module designed to work more securely with private key material. It can be compared with a walled garden from which private keys should not escape. All operations using private keys, such as signing and encryption data should be executed within the module, with `KeyIdentifier`s used to specify which key to use for which operation. Notice the "should," as we're not quite there yet.

In its current state, this library aims to provide a good interface for working with cryptographic material. However, it has some security limitations, which are on our roadmap to address:

- Private key material IS passed directly to asset libraries which can contain code by third party developers. This is on our roadmap to eliminate by refactoring asset libraries to accept signing functions instead of keys.
- Private keys _can_ be exported, via `keychain.exportKey`
- `keychain.lock()` does not guarantee that private keys get completely cleared from memory

## Install

```
yarn add @exodus/keychain
```

## Usage

See examples in [./modules/\_\_tests\_\_/example.test.js](./module/__tests__/example.test.js).

### Documented Usage Paths

Check [here](https://github.com/ExodusMovement/exodus-desktop/tree/master/src/app/_local_modules/constants/bip43#documented-usage-paths)

### Create A Key Identifier

In order to interact with a private key, you must first specify how it's accessed. A `KeyIdentifier` must be created, for assets there is a helpful `KeyIdentifier` class that will do the heavy lifting.

```js
import { KeyIdentifier } from '@exodus/keychain/module'

const keyId = new KeyIdentifier({
  assetName: 'solana',
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/501'/0'/0/0",
  keyType: 'nacl',
})
```

### Lock/Unlock the Keychain

Before you can perform keychain operations, you must unlock the keychain by providing it a `seed`. Calling `keychain.lock()` will lock the keychain again and remove the seed and any derived cryptographic material from its internal fields.

```js
const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)

keychain.unlock({ seed })
```

### Sign a transaction

The function `keychain.signTx(...)` can sign transactions for you for a given key identifier.

```js
import {
  signUnsignedTx as signSolanaTx,
  createUnsignedTx as createUnsignedSolanaTx,
} from '@exodus/solana-lib'
import solanaAssets from '@exodus/solana-meta'
import { connectAssetsList } from '@exodus/assets'
import { mnemonicToSeed } from 'bip39'
import assert from 'minimalistic-assert'
import keychainDefinition, { KeyIdentifier } from '..'

const { solana: asset } = connectAssetsList(solanaAssets)

const unsignedTx = await createUnsignedSolanaTx({
  asset,
  from: 'nsn7DmCMsKWGUWcL92XfPKXFbUz7KtFDRa4nnkc3RiF',
  to: '7SmaJ41gFZ1LPsZJfb57npzdCFuqBRmgj3CScjbmkQwA',
  amount: asset.currency.SOL('5'),
  fee: asset.currency.SOL('0.000005'),
  recentBlockhash: '6yWbfvhoDrgzStVnvpRvib2Q1LpuTYc6TtdMPPofCPh8',
})

const signedTx = await keychain.signTx(
  // Note: this is an array as some assets require multiple keys to sign a single transaction,
  // e.g. bitcoin needs a keyId per UTXO
  [keyId],
  // in Exodus mobile/desktop/browser-extension clients, this is typically aggregated
  // for all assets into a single delegator function
  function signTx({ unsignedTx, hdkeys, privateKey }) {
    assert(unsignedTx.txMeta.assetName === 'solana', `expected "solana" tx`)
    return signSolanaTx(unsignedTx, privateKey)
  },
  unsignedTx
)

// signedTx.txId === 'Lj2iFo1MKx3cWTLH1GbvxZjCtNTMBmB2rXR5JV7EFQnPySyxKssAReBJF56e7XzXiAFeYdMCwFvyR3NkFVbh8rS'
```

### Encrypt/Decrypt Data

Note: the below follow libsodium terminology for `encryptSecretBox`/`encryptBox`/`encryptSealedBox`.

#### encryptSecretBox/decryptSecretBox

```js
const ALICE_KEY = new KeyIdentifier({
  derivationAlgorithm: 'SLIP10',
  derivationPath: `m/0'/2'/0'`,
  keyType: 'nacl',
})

const sodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
const plaintext = 'I really love keychains'
const ciphertext = await sodiumEncryptor.encryptSecretBox({
  data: plaintext,
})

const decrypted = await sodiumEncryptor.decryptSecretBox({
  data: ciphertext,
})

// decrypted.toString() === plaintext
```

#### encryptBox/decryptBox

```js
const aliceSodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
const bobSodiumEncryptor = await keychain.createSodiumEncryptor(BOB_KEY)
const plaintext = 'I really love keychains'
const {
  box: { publicKey: bobPublicKey },
} = await bobSodiumEncryptor.getSodiumKeysFromSeed()
const ciphertext = await aliceSodiumEncryptor.encryptBox({
  data: plaintext,
  toPublicKey: bobPublicKey,
})
const {
  box: { publicKey: alicePublicKey },
} = await aliceSodiumEncryptor.getSodiumKeysFromSeed()

const decrypted = await bobSodiumEncryptor.decryptBox({
  data: ciphertext,
  fromPublicKey: alicePublicKey,
})

// decrypted.toString() === plaintext
```

#### encryptSealedBox/decryptSealedBox

```js
const aliceSodiumEncryptor = await keychain.createSodiumEncryptor(ALICE_KEY)
const bobSodiumEncryptor = await keychain.createSodiumEncryptor(BOB_KEY)
const plaintext = 'I really love keychains'
const {
  box: { publicKey: bobPublicKey },
} = await bobSodiumEncryptor.getSodiumKeysFromSeed()

const ciphertext = await aliceSodiumEncryptor.encryptSealedBox({
  data: plaintext,
  toPublicKey: bobPublicKey,
})

const decrypted = await bobSodiumEncryptor.decryptSealedBox({
  data: ciphertext,
})

// decrypted.toString() === plaintext
```

### Export A Key

Export public and/or private key material.

```js
// { xpub, publicKey }
const publicKey = await keychain.exportKey(keyId)
// { xpub, xpriv, publicKey, privateKey }
const privateKey = await keychain.exportKey(keyId, { exportPrivate: true })
```

### Clone the Keychain Instance

Clone the keychain, _minus any cryptographic material_. This is equivalent to re-invoking the keychain factory with the same parameters.

### secp256k1 signer

Sign a buffer using ECDSA with curve `secp256k1`.

```js
const keyId = new KeyIdentifier({
  derivationAlgorithm: 'SLIP10',
  derivationPath: `m/73'/2'/0'`,
  keyType: 'nacl',
})

const signer = keychain.createSecp256k1Signer(keyId)
const plaintext = Buffer.from('I really love keychains')
const signature = await signer.signBuffer({ data: plaintext })
```

### ed25519 signer

Sign a buffer using EdDSA with curve `ed25519`.

```js
const keyId = new KeyIdentifier({
  derivationAlgorithm: 'SLIP10',
  derivationPath: `m/73'/2'/0'`,
  keyType: 'nacl',
})

const signer = keychain.createEd25519Signer(keyId)
const plaintext = Buffer.from('I really love keychains')
const signature = await signer.signBuffer({ data: plaintext })
```
