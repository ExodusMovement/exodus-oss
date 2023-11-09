import { createInMemoryAtom } from '@exodus/atoms'
import { mnemonicToSeed } from 'bip39'

import keychainDefinition, { EXODUS_KEY_IDS } from '../../module'
import createSeedDerivedIdAtomFactory from '../seed-derived-id'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)
const keychain = keychainDefinition.factory()
keychain.unlock({ seed })

const lockedAtom = createInMemoryAtom({ defaultValue: true })

describe('Seed Derived Id Atom test', () => {
  describe('get', () => {
    it('should await for being unlocked', async () => {
      const seedDerivedIdAtom = createSeedDerivedIdAtomFactory({ keychain, lockedAtom })({
        config: { identifier: EXODUS_KEY_IDS.TELEMETRY },
      })

      let locked = true
      const valuePromise = seedDerivedIdAtom.get()

      // eslint-disable-next-line no-new
      new Promise((resolve) =>
        setTimeout(() => {
          lockedAtom.set(false)
          locked = false
          resolve()
        }, 1000)
      )

      await valuePromise
      expect(locked).toBe(false)
    })
  })

  describe('observe()', () => {
    it('should emit when ready', async () => {
      const seedDerivedIdAtom = createSeedDerivedIdAtomFactory({ keychain, lockedAtom })({
        config: { identifier: EXODUS_KEY_IDS.TELEMETRY },
      })

      const callback = jest.fn()
      const observed = new Promise((resolve) => {
        seedDerivedIdAtom.observe((value) => {
          callback(value)
          resolve()
        })
      })

      await lockedAtom.set(false)
      await observed
      await expect(callback).toHaveBeenCalledWith('7qtsnoYe2fOn95F/bZcgMuPk16Qz62vDD0tIjuE2gsc=')
    })

    it('should not emit when stopped before unlocked', async () => {
      const seedDerivedIdAtom = createSeedDerivedIdAtomFactory({ keychain, lockedAtom })({
        config: { identifier: EXODUS_KEY_IDS.TELEMETRY },
      })

      const callback = jest.fn()
      const stop = seedDerivedIdAtom.observe(callback)

      stop()
      await lockedAtom.set(false)
      expect(callback).not.toHaveBeenCalled()
    })
  })
})
