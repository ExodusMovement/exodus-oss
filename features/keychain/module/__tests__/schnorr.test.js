import { utils } from '@noble/secp256k1'
import ecc from '@exodus/bitcoinerlab-secp256k1'

import { create } from '../crypto/secp256k1.js'
import KeyIdentifier from '@exodus/key-identifier'

import { createHmac, createHash } from 'crypto'

if (!utils.hmacSha256Sync) {
  utils.hmacSha256Sync = (k, ...m) =>
    createHmac('sha256', k)
      .update(utils.concatBytes(...m))
      .digest()
}

if (!utils.sha256Sync) {
  utils.sha256Sync = (...m) =>
    createHash('sha256')
      .update(utils.concatBytes(...m))
      .digest()
}

const fixtures = [
  {
    // fixtures created by logging inside toAsyncSigner: https://github.com/ExodusMovement/assets/blob/5f93b19e7537f92519ec9bb7fe2514db9b4507e0/bitcoin/bitcoin-api/src/tx-sign/taproot.js#L48
    priv: '90de83eea26049afc40ba7d13fd8d4537331cd226f17051c97ca56c696af66b5',
    pub: '0273ae16fb2721654c8735487c024f9a137511eb2d4f2c39e3084bd87cf044ac91',
    tweak: '316fb252f50a55c468b86b951093b5a56d8cac0a178d066899b9520c694ce8c6',
    priv2: 'c24e3641976a9f742cc41366506c89f8e0be792c86a40b853183a8d2fffc4f7b',
    pub2: '02c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92',
    buffer: '52be7b43a029336afb5bca87f33b5cbe1a84d70e321db62dc12c14eac3c8b3a3',
    entropy: '1230000000000000000000000000000000000000000000000000000000000000',
    sig: 'c2259b1fc27b846b7204b571a43e4951ef53e40b7486732673ac8d9187eb95d230ccdc5ab20e4e1e975fb211d13531de77f3ea70397fcca8d74629d20ffb4a3f',
  },
  {
    priv: 'fc7458de3d5616e7803fdc81d688b9642641be32fee74c4558ce680cac3d4111',
    pub: '03d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151',
    priv2: '8c28b8720947067702dc9e0b81c2c89d6f97e14cc65db22a1849d9ce685202e9',
    pub2: '0351adaba657ce3a0758dc1a3e37be9d86048288f26674f503d2d2366010680f17',
    buffer: '7cb987eb16b030b09f34e3ae52e8fb3a9b6e0caaea3021e0ab4dc15ccd0188bb',
    entropy: '0000000000000000000000000000000000000000000000000000000000000000',
    sig: 'e397d713d4832069e7a6794f62d23e7f7f8d8670aa1ebb72872ad8cb908a2575b2c71746f795bbfdba3e433e80b08ce1b5454cb2a349b25111c269b9f625cf8d',
  },
]

const tapTweakHash = (publicKey, h) => {
  const xOnlyPoint = ecc.xOnlyPointFromPoint(publicKey)
  const hash = utils.taggedHashSync('TapTweak', Buffer.concat(h ? [xOnlyPoint, h] : [xOnlyPoint]))
  return Buffer.from(hash)
}

describe('Schnorr signer', () => {
  test.each(fixtures)('signSchnorr should sign buffer with tweaked key', async (fixture) => {
    const getPrivateHDKey = () => ({
      privateKey: Buffer.from(fixture.priv, 'hex'),
      publicKey: Buffer.from(fixture.pub, 'hex'),
    })
    const secp256k1Signer = create({ getPrivateHDKey })

    let tweak
    if (fixture.tweak) {
      const publicKey = getPrivateHDKey().publicKey
      tweak = tapTweakHash(publicKey)
      expect(tweak.toString('hex')).toBe(fixture.tweak)
    }

    const keyId = new KeyIdentifier({
      derivationPath: "m/0'", // doesn't matter in this fixture as we don't use it
      derivationAlgorithm: 'BIP32',
    })

    const result = await secp256k1Signer.signSchnorr({
      keyId,
      data: Buffer.from(fixture.buffer, 'hex'),
      tweak,
      extraEntropy: Buffer.from(fixture.entropy, 'hex'),
    })

    expect(Buffer.from(result).toString('hex')).toBe(fixture.sig)
  })

  it('should throw for keyType != secp256k1', async () => {
    const secp256k1Signer = create({ getPrivateHDKey: jest.fn() })

    const keyId = new KeyIdentifier({
      derivationPath: 'm/0',
      keyType: 'nacl',
      derivationAlgorithm: 'SLIP10',
    })

    await expect(
      secp256k1Signer.signSchnorr({
        keyId,
        data: Buffer.from('Bruce Wayne', 'utf8'),
      })
    ).rejects.toThrow('Schnorr signatures are not supported for nacl')
  })
})
