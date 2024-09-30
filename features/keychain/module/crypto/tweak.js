import assert from 'minimalistic-assert'
import * as secp256k1 from '@exodus/crypto/secp256k1'

export const tweakPrivateKey = ({ hdkey, tweak }) => {
  const { privateKey, publicKey } = hdkey
  assert(secp256k1.privateKeyIsValid({ privateKey }), 'tweakPrivateKey: expected valid private key')
  assert(
    secp256k1.publicKeyIsValid({ publicKey, compressed: true }),
    'tweakPrivateKey: expected compressed public key'
  )

  const tweakedPrivateKey =
    publicKey[0] === 3 ? secp256k1.privateKeyTweakNegate({ privateKey }) : privateKey

  return secp256k1.privateKeyTweakAdd({ privateKey: tweakedPrivateKey, tweak, format: 'buffer' })
}
