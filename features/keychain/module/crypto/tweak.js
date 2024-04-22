import assert from 'minimalistic-assert'
import ecc from '@exodus/bitcoinerlab-secp256k1'

export const tweakPrivateKey = ({ hdkey, tweakOptions = {} }) => {
  const { publicKey } = hdkey
  assert(ecc.isPointCompressed(publicKey), 'tweakPrivateKey: expected compressed public key')

  const { tweakHash } = tweakOptions
  assert(tweakHash, 'tweakPrivateKey: tweakHash is required')

  let { privateKey } = hdkey
  privateKey = publicKey[0] === 3 ? ecc.privateNegate(privateKey) : privateKey
  privateKey = Buffer.from(ecc.privateAdd(privateKey, tweakHash))

  return privateKey
}

export const tweakPublicKey = ({ hdkey, tweakOptions }) => {
  const privateKey = tweakPrivateKey({ hdkey, tweakOptions })

  return Buffer.from(ecc.pointFromScalar(privateKey, true))
}
