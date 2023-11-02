module.exports = {
  ...require('../jest.config.js'),
  preset: 'ts-jest',
  testTimeout: 10_000,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['files/*', '<rootDir>/packages'],
  modulePathIgnorePatterns: ['generators'],
}
