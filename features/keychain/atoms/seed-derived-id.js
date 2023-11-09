import { memoize } from 'lodash'

import { enforceObservableRules, waitUntil } from '@exodus/atoms'

const getSeedDerivedId = async ({ keychain, identifier }) => {
  const sodiumEncryptor = await keychain.createSodiumEncryptor(identifier)

  const {
    sign: { publicKey },
  } = await sodiumEncryptor.getSodiumKeysFromSeed()

  return Buffer.from(publicKey, 'hex').toString('base64')
}

const createSeedDerivedIdAtomFactory =
  ({ keychain, lockedAtom }) =>
  ({ config: { identifier } }) => {
    const get = memoize(async () => {
      await waitUntil({ atom: lockedAtom, predicate: (v) => v === false })

      return getSeedDerivedId({ keychain, identifier })
    })

    const observe = (callback) => {
      let observing = true
      get().then((value) => observing && callback(value))
      return () => {
        observing = false
      }
    }

    return enforceObservableRules({
      get,
      observe,
    })
  }

export default createSeedDerivedIdAtomFactory
