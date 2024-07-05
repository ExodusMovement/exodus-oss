import baseConfig from '../../jest.config.js'

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...baseConfig,
  testMatch: ['**/__tests__/**.test.js'],
}

export default config
