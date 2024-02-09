const path = require('path')
const fs = require('fs')

const buffer = fs.readFileSync(path.join(__dirname, 'lerna.json'))
const { packages: packageRoots } = JSON.parse(buffer.toString())

const repoPackages = packageRoots.flatMap((root) => {
  const directory = path.dirname(root)
  return fs
    .readdirSync(path.join(__dirname, directory))
    .filter((it) => !it.startsWith('.'))
    .map((folder) => `@exodus/${folder}`)
})

const untranspiledModulePatterns = [
  ...repoPackages,
  'react-native',
  '@exodus/solana-*',
  '@exodus/core-selectors',
  '@exodus/ethereum-*',
  '@exodus/bitcoin-*',
  '@exodus/dogecoin-*',
  '@noble/*',
  '@exodus/find-optimistic-orders',
  '@exodus/ethersproject-*',
  '@exodus/algorand-*',
  '@exodus/cardano-*',
  '@exodus/cosmos-*',
  '@exodus/cosmjs-fork',
  '@exodus/osmosis-*',
  '@exodus/key-utils',
  '@exodus/module',
  '@exodus/atoms',
  '@exodus/storage-memory',
  '@exodus/basic-utils',
  '@exodus/timer',
  '@exodus/serialization',
  '@exodus/solidity-contract',
  '@exodus/web3-solana-utils',
  '@exodus/feature-control',
  '@exodus/nfts-proxy',
  '@exodus/key-ids',
  '@exodus/wild-emitter',
  '@exodus/solidity-contract',
  '@exodus/fiat-client',
  'ethereum-cryptography',
  'p-defer',
  'p-debounce', // TODO: remove me after updating basic-utils
  'p-event',
  'p-timeout',
  'delay',
]

/** @type {import('@jest/types').Config.InitialOptions} */
const CI_CONFIG = {
  reporters: ['summary', 'github-actions'],
  coverageReporters: ['json-summary', 'text-summary', 'json'],
}

/** @type {import('@jest/types').Config.InitialOptions} */
const DEV_CONFIG = {
  coverageReporters: ['json-summary', 'text-summary', 'lcov', 'json'],
}

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  transformIgnorePatterns: [`node_modules/(?!((jest-)?${untranspiledModulePatterns.join('|')}))`],
  // https://jestjs.io/docs/en/configuration#testmatch-array-string
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  setupFilesAfterEnv: [path.join(__dirname, 'jest.setup.js')],
  collectCoverage: true,
  testTimeout: 10_000,
  bail: true,
  forceExit: true,
  ...(process.env.CI === 'true' ? CI_CONFIG : DEV_CONFIG),
}
