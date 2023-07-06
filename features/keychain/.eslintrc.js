const path = require('path')
module.exports = {
  extends: '../../.eslintrc.js',
  parserOptions: {
    babelOptions: {
      configFile: path.join(path.dirname(__filename), 'babel.config.js'),
    },
  },
}
