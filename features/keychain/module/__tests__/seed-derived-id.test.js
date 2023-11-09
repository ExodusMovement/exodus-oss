import { createInMemoryAtom } from '@exodus/atoms'
import { mnemonicToSeed } from 'bip39'

import createKeychain from './create-keychain'
import { EXODUS_KEY_IDS } from '..'
import createSeedDerivedIdAtomFactory from '../../atoms/seed-derived-id'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)
const keychain = createKeychain({ seed })

describe('Seed Derived Id Atom test', () => {
  describe('get', () => {
    it('should await for being unlocked', async () => {
      const lockedAtom = createInMemoryAtom({ defaultValue: true })
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

    it('should be static analytics id', async () => {
      const lockedAtom = createInMemoryAtom({ defaultValue: false })
      const seedDerivedIdAtom = createSeedDerivedIdAtomFactory({ keychain, lockedAtom })({
        config: { identifier: EXODUS_KEY_IDS.TELEMETRY },
      })

      expect(await seedDerivedIdAtom.get()).toBe('7qtsnoYe2fOn95F/bZcgMuPk16Qz62vDD0tIjuE2gsc=')
    })
  })
})
