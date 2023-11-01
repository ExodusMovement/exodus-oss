const config = {
  plugins: ['@babel/plugin-proposal-export-default-from'],
  presets: [
    '@babel/flow',
    [
      '@babel/env',
      {
        targets: {
          node: '16',
        },
        loose: true,
      },
    ],
  ],
}

module.exports = config
