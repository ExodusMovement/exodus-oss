import assert from 'minimalistic-assert'
import ecc from '@exodus/bitcoinerlab-secp256k1'

export const tweakPrivateKey = ({ hdkey, tweak }) => {
  const { privateKey, publicKey } = hdkey
  assert(ecc.isPrivate(privateKey), 'tweakPrivateKey: expected valid private key')
  assert(ecc.isPointCompressed(publicKey), 'tweakPrivateKey: expected compressed public key')

  let tweakedPrivateKey = publicKey[0] === 3 ? ecc.privateNegate(privateKey) : privateKey
  tweakedPrivateKey = ecc.privateAdd(tweakedPrivateKey, tweak)

  return Buffer.from(tweakedPrivateKey)
}
