# @exodus/key-identifier

## Usage

In order to interact with a private key, you must first specify how it's accessed. This is done through the `KeyIdentifier` class provided by this library. A key identifier is most notably provided to the keychain for operations such as exporting a key or signing a transaction.

```js
import KeyIdentifier from '@exodus/key-identifier'

const keyId = new KeyIdentifier({
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/501'/0'/0/0",
  keyType: 'nacl',
})

const { privateKey, publicKey, xpub, xpriv } = await keychain.exportKey({
  seedId,
  keyId,
  exportPrivate: true,
})
```
