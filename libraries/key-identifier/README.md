# @exodus/key-identifier

## Usage

To interact with a key, you must first specify how to derive it. This is done through the `KeyIdentifier` class provided by this library. A key identifier is most notably provided to the keychain for operations such as exporting a key or signing a transaction.

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
