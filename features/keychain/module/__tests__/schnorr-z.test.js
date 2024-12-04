jest.doMock('node:crypto', () => ({
  __esModule: false,
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(),
}))

const { create } = await import('../crypto/secp256k1.js')
const { randomBytes } = await import('node:crypto')

const extraEntropy = Buffer.from(
  '1230000000000000000000000000000000000000000000000000000000000000',
  'hex'
)

randomBytes.mockImplementation(() => {
  // fix entropy to assert signatures
  return extraEntropy
})

const fixture = {
  priv: 'e7ef6cc440b01b2473540541aee345f6a6585e532a2590e2ab8a2bef379b1b0a',
  pub: '03d219e7afe97792ce85e5ac18c79d86a3658f7f5ec7b53bc3f3ed334cc98b0366',
  buffer:
    '0881800410011a14a54e49719267e8312510d7b78598cef16ff127ce22230a210246e7178dc8253201101e18fd6f6eb9972451d121fc57aa2a06dd5c111e58dc6a2a120a100000000000000000000000000000001432120a100000000000000000000000000000000a38e901',
  sig: 'a019058cd148c2821a3a98c9ffaf2d9c5a4a68b1ca3a844c8c51ca95d7a60ad12863cf7f6c6bee55e5447ce621dc8808cc429576636556a4f22de0d702e69c9c',
}

describe('SchnorrZ signer', async () => {
  const getPrivateHDKey = () => ({
    privateKey: Buffer.from(fixture.priv, 'hex'),
    publicKey: Buffer.from(fixture.pub, 'hex'),
  })
  const secp256k1Signer = create({ getPrivateHDKey })
  const result = await secp256k1Signer.signSchnorrZ({
    keyId: { keyType: 'secp256k1' },
    data: Buffer.from(fixture.buffer, 'hex'),
  })

  expect(result.toString('hex')).toBe(fixture.sig)
})
