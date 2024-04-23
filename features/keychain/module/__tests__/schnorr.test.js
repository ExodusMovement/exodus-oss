import { utils } from '@noble/secp256k1'
import ecc from '@exodus/bitcoinerlab-secp256k1'

import { create } from '../crypto/secp256k1'

const fixtures = [
  {
    // fixtures created by logging inside toAsyncSigner: https://github.com/ExodusMovement/assets/blob/5f93b19e7537f92519ec9bb7fe2514db9b4507e0/bitcoin/bitcoin-api/src/tx-sign/taproot.js#L48
    priv: '90de83eea26049afc40ba7d13fd8d4537331cd226f17051c97ca56c696af66b5',
    pub: '0273ae16fb2721654c8735487c024f9a137511eb2d4f2c39e3084bd87cf044ac91',
    priv2: 'c24e3641976a9f742cc41366506c89f8e0be792c86a40b853183a8d2fffc4f7b',
    pub2: '02c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92',
    buffer: '52be7b43a029336afb5bca87f33b5cbe1a84d70e321db62dc12c14eac3c8b3a3',
    entropy: '1230000000000000000000000000000000000000000000000000000000000000',
    sig: 'c2259b1fc27b846b7204b571a43e4951ef53e40b7486732673ac8d9187eb95d230ccdc5ab20e4e1e975fb211d13531de77f3ea70397fcca8d74629d20ffb4a3f',
  },
]

const tapTweakHash = (publicKey, h) => {
  const xOnlyPoint = ecc.xOnlyPointFromPoint(publicKey)
  const hash = utils.taggedHashSync('TapTweak', Buffer.concat(h ? [xOnlyPoint, h] : [xOnlyPoint]))
  return Buffer.from(hash)
}

describe('Schnorr signer', () => {
  it('signSchnorr should sign buffer with tweaked key', async () => {
    for (const fixture of fixtures) {
      const getPrivateHDKey = () => ({
        privateKey: Buffer.from(fixture.priv, 'hex'),
        publicKey: Buffer.from(fixture.pub, 'hex'),
      })
      const secp256k1Signer = create({ getPrivateHDKey })

      const publicKey = await secp256k1Signer.getPublicKey({})
      const scalar = tapTweakHash(publicKey)

      const result = await secp256k1Signer.signSchnorr({
        data: Buffer.from(fixture.buffer, 'hex'),
        tweak: {
          scalar,
          options: { extraEntropy: Buffer.from(fixture.entropy, 'hex') },
        },
      })

      expect(Buffer.from(result).toString('hex')).toBe(fixture.sig)
    }
  })

  it('getPublicKey should return public key', async () => {
    for (const fixture of fixtures) {
      const getPrivateHDKey = () => ({
        privateKey: Buffer.from(fixture.priv, 'hex'),
        publicKey: Buffer.from(fixture.pub, 'hex'),
      })
      const secp256k1Signer = create({ getPrivateHDKey })

      const publicKey = await secp256k1Signer.getPublicKey({})
      const scalar = tapTweakHash(publicKey)

      expect(publicKey.toString('hex')).toBe(fixture.pub)

      const tweakedPublicKey = await secp256k1Signer.getPublicKey({
        tweak: {
          scalar,
          options: { extraEntropy: Buffer.from(fixture.entropy, 'hex') },
        },
      })
      expect(tweakedPublicKey.toString('hex')).toBe(fixture.pub2)
    }
  })
})
