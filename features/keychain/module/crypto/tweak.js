import ecc from '@exodus/bitcoinerlab-secp256k1'
import { utils } from '@noble/secp256k1'

const tapTweakHash = (publicKey, h) => {
  const xOnlyPoint = ecc.xOnlyPointFromPoint(publicKey)
  const hash = utils.taggedHashSync('TapTweak', Buffer.concat(h ? [xOnlyPoint, h] : [xOnlyPoint]))
  return Buffer.from(hash)
}

export const tweakPrivateKey = ({ hdkey, tweakOptions = {} }) => {
  const { publicKey } = hdkey
  const { tweakHash } = tweakOptions

  let privateKey = publicKey[0] === 3 ? ecc.privateNegate(hdkey.privateKey) : hdkey.privateKey
  privateKey = Buffer.from(ecc.privateAdd(privateKey, tapTweakHash(publicKey, tweakHash)))

  return privateKey
}

export const tweakPublicKey = ({ hdkey, tweakOptions }) => {
  const privateKey = tweakPrivateKey({ hdkey, tweakOptions })

  return Buffer.from(ecc.pointFromScalar(privateKey, true))
}
