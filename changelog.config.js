const config = require('conventional-changelog-conventionalcommits')

const commitPartial = `
* {{header}}
`

module.exports = config({
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'perf', section: 'Performance' },
    { type: 'license', section: 'License' },
    { type: 'chore', hidden: true },
    { type: 'docs', hidden: true },
    { type: 'style', hidden: true },
    { type: 'refactor', hidden: true },
    { type: 'test', hidden: true },
  ],
}).then((preset) => {
  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  preset.conventionalChangelog.writerOpts.commitPartial = commitPartial
  return preset
})
