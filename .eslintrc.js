const shared = {
  'import/no-cycle': ['error', { ignoreExternal: true }],
  'unicorn/no-array-callback-reference': 'off',
  'unicorn/consistent-function-scoping': 'off',
  'unicorn/prefer-top-level-await': 'off',
  'unicorn/text-encoding-identifier-case': 'off',
  'no-restricted-imports': [
    'error',
    {
      name: '@exodus/fetch',
      message:
        'Do not use directly. Please inject and consume "fetch" and "fetchival" through the IOC',
    },
  ],
}

const sourceExts = ['js', 'json', 'ts', 'tsx', 'android.js', 'ios.js']

module.exports = {
  extends: [
    '@exodus/eslint-config/javascript-babel',
    'plugin:@exodus/ban-flow/recommended',
    'plugin:@exodus/basic-utils/recommended',
    'plugin:@exodus/restricted-imports/recommended',
    'plugin:@exodus/hydra/recommended',
    'plugin:@exodus/eslint-plugin-package/recommended',
  ],
  rules: shared,
  globals: {
    fetch: 'off',
  },
  settings: {
    // import/named cannot statically resolve React Native imports, see https://github.com/facebook/react-native/issues/28549
    'import/ignore': ['react-native'],
    'import/resolver': {
      node: {
        extensions: sourceExts.map((n) => `.${n}`),
      },
    },
  },
  overrides: [
    {
      extends: ['plugin:@exodus/hydra/features'],
      files: ['{features,modules}/**/*.{ts,js}'],
    },
    {
      files: ['*.{ts,tsx}'],
      extends: ['@exodus/eslint-config/typescript-react'],
      rules: shared,
    },
    {
      files: ['*.{tsx,jsx}', '*Context.{ts,js}'],
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
    {
      files: ['**/__tests__/**/*.{ts,js}', '*.{spec,test}.{ts,js}'],
      rules: {
        'no-restricted-syntax': 'off',
        'no-restricted-imports': 'off',
      },
    },
  ],
}
