import assert from 'minimalistic-assert'
import ecc from '@exodus/bitcoinerlab-secp256k1'

export const tweakPrivateKey = ({ hdkey, scalar }) => {
  const { privateKey, publicKey } = hdkey
  assert(ecc.isPrivate(privateKey), 'tweakPrivateKey: expected valid private key')
  assert(ecc.isPointCompressed(publicKey), 'tweakPrivateKey: expected compressed public key')

  let tweakedPrivateKey = publicKey[0] === 3 ? ecc.privateNegate(privateKey) : privateKey
  tweakedPrivateKey = Buffer.from(ecc.privateAdd(tweakedPrivateKey, scalar))

  return tweakedPrivateKey
}

export const tweakPublicKey = ({ hdkey, scalar }) => {
  const privateKey = tweakPrivateKey({ hdkey, scalar })

  return Buffer.from(ecc.pointFromScalar(privateKey, true))
}
