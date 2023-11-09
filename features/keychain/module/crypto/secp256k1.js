import elliptic from '@exodus/elliptic'

export const createSecp256k1Signer = (privateKey) => {
  const EC = elliptic.ec
  const curve = new EC('secp256k1')
  return Object.freeze({
    signBuffer: async ({ data }) => {
      return Buffer.from(curve.sign(data, privateKey).toDER())
    },
  })
}
