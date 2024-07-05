import BJSON from 'buffer-json'
import stableStringify from 'json-stable-stringify'

import { Keychain } from './keychain.js'

const keyIdToCacheKey = stableStringify

const CACHE_KEY = 'data'

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

    this.#cloneOpts = { storage }
  }

  #getCachedKey = async (keyId) => {
    const cacheKey = keyIdToCacheKey(keyId)
    return this.#publicKeys[cacheKey]
  }

  #setCachedKey = async (keyId, value) => {
    this.#publicKeys[keyIdToCacheKey(keyId)] = value
    await this.#storage.set(CACHE_KEY, BJSON.stringify(this.#publicKeys))
  }

  exportKey = async (keyId, opts) => {
    if (!opts?.exportPrivate) {
      // take advantage of public key cache
      const cached = await this.#getCachedKey(keyId)
      if (cached) return cached
    }

    const result = await super.exportKey(keyId, opts)
    // don't wait for this to finish
    this.#setCachedKey(keyId, getPublicKeyData(result))
    return result
  }

  clone = () => new MemoizedKeychain(this.#cloneOpts)

  clear = async () => {
    await super.clear()
    await this.#storage.delete(CACHE_KEY)
  }
}

const memoizedKeychainDefinition = {
  id: 'keychain',
  type: 'module',
  factory: (opts) => new MemoizedKeychain(opts),
  dependencies: ['storage', 'legacyPrivToPub'],
}

// eslint-disable-next-line @exodus/hydra/no-unused-ioc-nodes
export default memoizedKeychainDefinition
