import { signUnsignedTx } from '@exodus/solana-lib'

export default function (unsignedTx, privateKey) {
  return signUnsignedTx(unsignedTx, privateKey)
}
