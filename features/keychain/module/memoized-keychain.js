import typeforce from '@exodus/typeforce'
import BJSON from 'buffer-json'
import stableStringify from 'json-stable-stringify'

import { Keychain } from './keychain'

const cacheParamsType = {
  seedId: 'String',
  keyId: 'Object',
}

const keyIdToCacheKey = (opts) => {
  typeforce(cacheParamsType, opts, true)
  return stableStringify(opts)
}

const CACHE_KEY = 'data1'

const getPublicKeyData = ({ xpub, publicKey }) => ({ xpub, publicKey })

class MemoizedKeychain extends Keychain {
  #storage
  #publicKeys = Object.create(null)
  #cloneOpts

  constructor({ storage, legacyPrivToPub }) {
    super({ legacyPrivToPub })

    this.#storage = storage
    this.#storage.get(CACHE_KEY).then((data) => {
      this.#publicKeys = data ? BJSON.parse(data) : Object.create(null)
    })

    this.#cloneOpts = { storage, legacyPrivToPub }
  }

  #getCachedKey = async (cacheParams) => {
    const cacheKey = keyIdToCacheKey(cacheParams)
    return this.#publicKeys[cacheKey]
  }

  #setCachedKey = async (cacheParams, value) => {
    this.#publicKeys[keyIdToCacheKey(cacheParams)] = value
    await this.#storage.set(CACHE_KEY, BJSON.stringify(this.#publicKeys))
  }

  async exportKey(opts) {
    typeforce({ ...cacheParamsType, exportPrivate: '?Boolean' }, opts, true)

    const { seedId, keyId, exportPrivate } = opts
    const cacheParams = { seedId, keyId }
    if (!exportPrivate) {
      // take advantage of public key cache
      const cached = await this.#getCachedKey(cacheParams)
      if (cached) return cached
    }

    const result = await super.exportKey(opts)
    // don't wait for this to finish
    this.#setCachedKey(cacheParams, getPublicKeyData(result))
    return result
  }

  clone = () => new MemoizedKeychain(this.#cloneOpts)

  clear = async () => {
    await super.clear()
    await this.#storage.delete(CACHE_KEY)
  }

  removeAllSeeds = () => {
    super.removeAllSeeds()
    this.#publicKeys = Object.create(null)
  }
}

const memoizedKeychainDefinition = {
  id: 'keychain',
  type: 'module',
  factory: (opts) => new MemoizedKeychain(opts),
  dependencies: ['storage', 'legacyPrivToPub'],
}

export default memoizedKeychainDefinition
