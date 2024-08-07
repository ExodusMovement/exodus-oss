import { fromMasterSeed } from '@exodus/bip32'

export const getSeedId = (seed) => fromMasterSeed(seed).identifier.toString('hex')

export const getManySeedIds = (seeds) => seeds.map(getSeedId)

export const getUniqueSeedIds = (seeds) => {
  const seedIds = getManySeedIds(seeds)
  const uniqueSeedIds = new Set(seedIds)
  return [...uniqueSeedIds]
}
