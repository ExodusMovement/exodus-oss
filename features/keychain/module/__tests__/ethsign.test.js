import { create } from '../crypto/secp256k1.js'
import KeyIdentifier from '@exodus/key-identifier'

const fixtures = [
  {
    buffer: '45819f5903df1754ac9e570f0d5dfecaf9c204bcd52eb23c8850d337a73bf115',
    pk: '164122e5d39e9814ca723a749253663bafb07f6af91704d9754c361eb315f0c1',
    signature:
      'c71d5e344d0ea6f2a453b10fdd390cfb8ad3ba79147b1d2003946ac315dda26d65183e9008cb732e340e21c7f7fb0c5621ff26bedc584d650894bef2cd555306',
    recid: 1,
  },
  {
    buffer: 'adfbf5a2accc98c5046e8bf42e2e315bc2f81a37cd930674f8ae8bd9345ff93a',
    pk: '4646464646464646464646464646464646464646464646464646464646464646',
    signature:
      'a9b97cb071ceae096999de5184000c5db2ce394dae436f8bd7fdab2c3f5437b7188f6bdf224529a21b6b915a51002f645196a228b5ec80c237186c0154bf52c5',
    recid: 1,
  },
  {
    buffer: 'c68ddb8e0ffdf28caabdf1f4e6b85476515442fa4b96bbf41ae8ef5da28d76ef',
    pk: 'e0a462586887362a18a318b128dbc1e3a0cae6d4b0739f5d0419ec25114bc722',
    signature:
      '5288e2aeac147ab07a3748d4989ccafc038b4287310a16ae1c65a5bc6e94df463e57d447ebedbe7d2c04be7a68f1fd2ef56b1f18c3c277933e33e8d595bfa736',
    recid: 0,
  },
  {
    buffer: 'aad787b6c7cfb13feab05f6175089c95f0b54839365fab43c7c4245bd32b3d65',
    pk: '164122e5d39e9814ca723a749253663bafb07f6af91704d9754c361eb315f0c1',
    signature:
      '055ba80267103f44de6acd0d2dc69b805c02358bbc7c024b2b9961a3884ac5b473327be0ca0ca0e2ce5775cda73c3a985810869703cbea708c6e8c15b7cddf1d',
    recid: 1,
  },
  {
    buffer: 'f999cebf59f8139dfc6f29538bdb53c82523bb973c529c8ec8f05217f710ff33',
    pk: 'e0a462586887362a18a318b128dbc1e3a0cae6d4b0739f5d0419ec25114bc722',
    signature:
      '57bce6dcfe018f05b4528b62f9f00a6b21060f82cdd29a3db946937b82f933817211ea21c740fa08c313d7c6c074c31fbc5c2d299f39e6f3c9fd8032a650599d',
    recid: 1,
  },
  {
    buffer: 'a3491b82987a48227a915318085d93d709d8650530fa017153f6366d884799d8',
    pk: 'e0a462586887362a18a318b128dbc1e3a0cae6d4b0739f5d0419ec25114bc722',
    signature:
      '85895e1fa45198b1c10e3e6982a5d5cfcf29ac95b6a3386ee42be1af72c2f054362876f8aec05f0bd18fcaffda1a6019198e79da256d848194cedba27b568024',
    recid: 1,
  },
]

describe('ETH Signer', () => {
  it('should signBuffer', async () => {
    for (const fixture of fixtures) {
      const getPrivateHDKey = () => ({ privateKey: Buffer.from(fixture.pk, 'hex') })
      const secp256k1Signer = create({ getPrivateHDKey })

      const ethSigner = async (buffer) => {
        const sig = await secp256k1Signer.signBuffer({
          data: buffer,
          keyId: new KeyIdentifier({
            keyType: 'secp256k1',
            derivationPath: 'm/0', // doesn't matter in this fixture as we don't use it
            derivationAlgorithm: 'BIP32',
          }),
          ecOptions: { canonical: true },
          enc: 'raw',
        })
        const signature = new Uint8Array(64)
        signature.set(sig.r.toArrayLike(Uint8Array, 'be', 32), 0)
        signature.set(sig.s.toArrayLike(Uint8Array, 'be', 32), 32)
        return { signature, recid: sig.recoveryParam }
      }

      const { signature, recid } = await ethSigner(fixture.buffer)

      expect(recid).toBe(fixture.recid)
      expect(Buffer.from(signature).toString('hex')).toBe(fixture.signature)
    }
  })
})
