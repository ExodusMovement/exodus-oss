const path = require('path')
module.exports = {
  extends: '../../.eslintrc.js',
  parserOptions: {
    tsconfigRootDir: '../../',
    babelOptions: {
      configFile: path.join(path.dirname(__filename), 'babel.config.js'),
    },
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js'],
      rules: {
        'import/no-unresolved': 'off', // TODO: add required deps once open-sourced and remove this
      },
    },
  ],
}
