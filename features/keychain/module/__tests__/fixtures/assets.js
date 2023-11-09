import { asset as solana } from '@exodus/solana-meta'
import { getAddressFromPublicKey } from '@exodus/solana-lib'

export const assets = {
  solana: {
    ...solana,
    bip44: 0x80_00_01_f5,
    keys: {
      encodePublic: getAddressFromPublicKey,
    },
  },
}
