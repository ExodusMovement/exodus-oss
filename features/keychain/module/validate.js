import assert from 'minimalistic-assert'
import KeyIdentifier from '@exodus/key-identifier'

import { ExpectedKeyIdentifier, NotInitializedError } from './errors'

export const throwIfInvalidKeyIdentifier = (potentialKeyIdentifier) => {
  if (!KeyIdentifier.validate(potentialKeyIdentifier) || !Object.isFrozen(potentialKeyIdentifier)) {
    throw new ExpectedKeyIdentifier(potentialKeyIdentifier)
  }
}

export const throwIfInvalidMasters = (masters) => {
  const isObject = typeof masters === 'object' && masters !== null
  // TODO: add more validation
  const valid = isObject
  if (!valid) {
    throw new NotInitializedError()
  }
}

export const throwIfInvalidLegacyPrivToPub = (legacyPrivToPub) => {
  assert(typeof legacyPrivToPub === 'object', 'legacyPrivToPub was not an object')
  // Assert that all keys are strings, and all values are functions
  for (const [baseAssetName, getPubkeyFromPrivKey] of Object.entries(legacyPrivToPub)) {
    assert(typeof baseAssetName === 'string', 'baseAssetName was not a string')
    assert(
      typeof getPubkeyFromPrivKey === 'function',
      `GetPubKeyFromPriv for baseAssetName ${baseAssetName} was not a function`
    )
  }
}
