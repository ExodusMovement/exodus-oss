import { HARDENED_OFFSET } from '@exodus/bip32'
import BIPPath from 'bip32-path'
import assert from 'minimalistic-assert'

export const BIP32_PURPOSES = [44, 49, 84, 86]

// stolen from #/bip44
// or from #/trezor/meta.js
export const parsePath = (path) => {
  let [purpose, accountIndex] = BIPPath.fromString(path, true).toPathArray()
  purpose -= HARDENED_OFFSET
  accountIndex -= HARDENED_OFFSET

  return {
    purpose,
    accountIndex,
  }
}

export const isValidBIPPath = (path) => {
  // TODO: improve regex for scenario: m/44'/60''///45'1'
  return /^m\/[\d'/]*$/.test(path)
}

export const buildBip32Path = ({ asset, purpose, accountIndex, chainIndex, addressIndex }) => {
  assert(BIP32_PURPOSES.includes(purpose), `invalid bip purpose ${purpose}`)
  assert(
    typeof accountIndex === 'number' && accountIndex >= 0,
    'accountIndex must be positive number'
  )

  const regexDigits = /^(\d+)$/
  const regexDigitsApostrophe = /^(\d+)'$/

  let hasAddressIndex = true
  switch (typeof addressIndex) {
    case 'number': {
      assert(addressIndex >= 0, 'addressIndex must be positive number')
      break
    }

    case 'string': {
      assert(
        regexDigits.test(addressIndex) || regexDigitsApostrophe.test(addressIndex),
        "addressIndex must be number or number' e.g 0 or 0'"
      )
      break
    }

    case 'undefined': {
      hasAddressIndex = false
      // We allow undefined for when we want to derive xpubs for whole address ranges.
      break
    }

    default: {
      assert(
        ['string', 'number'].includes(typeof addressIndex),
        'addressIndex must be number or string'
      )
    }
  }

  let hasChainIndex = true
  switch (typeof chainIndex) {
    case 'number': {
      assert(chainIndex >= 0, 'chainIndex must be positive number')
      break
    }

    case 'string': {
      assert(
        regexDigits.test(chainIndex) || regexDigitsApostrophe.test(chainIndex),
        "chainIndex must be number or number' e.g 0 or 0'"
      )
      break
    }

    case 'undefined': {
      assert(!hasAddressIndex, 'can not have addressIndex when chainIndex is undefined')
      hasChainIndex = false
      // We allow undefined for when we want to derive xpubs for whole address ranges.
      break
    }

    default: {
      assert(
        ['string', 'number'].includes(typeof addressIndex),
        'addressIndex must be number or string'
      )
    }
  }

  let fullPath = `m/${purpose}'/${asset.bip44 - HARDENED_OFFSET}'/${accountIndex}'`
  if (hasChainIndex) {
    fullPath = `${fullPath}/${chainIndex}`
    if (hasAddressIndex) fullPath = `${fullPath}/${addressIndex}`
  }

  // This should't be required but does not hurt
  assert(isValidBIPPath(fullPath), `BIP32 path validation failed for ${fullPath}`)
  return fullPath
}
