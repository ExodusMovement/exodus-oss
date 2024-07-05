import createIOC from '@exodus/argo'
import keychain from '../index.js'

// 2. Create ioc container
describe('keychain feature', () => {
  let ioc

  beforeEach(() => {
    const adapters = {
      createLogger: () => console,
    }

    ioc = createIOC({ adapters })
  })

  test('can be registered', () => {
    expect(() => ioc.use(keychain({ cachePublicKeys: false }))).not.toThrow()
  })
})
