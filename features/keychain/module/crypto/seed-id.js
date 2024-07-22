import { fromMasterSeed } from '@exodus/bip32'

export const getSeedId = (seed) => fromMasterSeed(seed).identifier.toString('hex')

export const getManySeedIds = (seeds) => new Set(seeds.map(getSeedId))
