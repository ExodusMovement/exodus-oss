import ecc from '@exodus/bitcoinerlab-secp256k1'

export const tweakPrivateKey = ({ hdkey, tweakOptions = {} }) => {
  const { publicKey } = hdkey
  const { tweakHash } = tweakOptions

  let privateKey = publicKey[0] === 3 ? ecc.privateNegate(hdkey.privateKey) : hdkey.privateKey
  privateKey = Buffer.from(ecc.privateAdd(privateKey, tweakHash))

  return privateKey
}

export const tweakPublicKey = ({ hdkey, tweakOptions }) => {
  const privateKey = tweakPrivateKey({ hdkey, tweakOptions })

  return Buffer.from(ecc.pointFromScalar(privateKey, true))
}
