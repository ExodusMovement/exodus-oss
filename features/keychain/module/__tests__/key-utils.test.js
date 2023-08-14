import { assets } from './fixtures/assets'

import { buildBip32Path, isValidBIPPath, parsePath } from '../key-utils'

describe('Key Utilities', () => {
  describe('parsePath', () => {
    it('should parse correctly', () => {
      const parsed = parsePath("m/44'/501'/0'")
      expect(parsed).toBeInstanceOf(Object)
      expect(parsed).toEqual({
        purpose: 44,
        accountIndex: 501,
      })
    })

    it('should throw when passing invalid input', () => {
      const failures = [Buffer.from('failure'), 'failure', 0, null, undefined, true]
      failures.forEach((failure) => {
        expect(() => parsePath(failure)).toThrow()
      })
    })
  })

  describe('buildBip32Path', () => {
    it('should parse correctly', () => {
      const path = buildBip32Path({
        asset: assets.solana,
        purpose: 44,
        accountIndex: 0,
        chainIndex: 0,
        addressIndex: 0,
      })
      expect(path).toBeDefined()
      expect(isValidBIPPath(path)).toBeTruthy()

      const parsed = parsePath(path)
      expect(parsed).toEqual({
        purpose: 44,
        accountIndex: 501,
      })
    })

    it('should throw when passing invalid input', () => {
      expect(() =>
        buildBip32Path({
          asset: assets.solana,
          purpose: 44,
          accountIndex: 0,
          chainIndex: 0,
          addressIndex: '123/456',
        })
      ).toThrow()
    })
  })
})
