#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const cwd = process.cwd()

const run = (cmd) => execSync(cmd, { encoding: 'utf8' })

const pkgJsonPaths = run(`find . -name package.json -type f | grep -v /node_modules/`)
  .trim()
  .split('\n')
  .map((filePath) => filePath.trim())
  .filter(Boolean)
  .map((filePath) => path.resolve(cwd, filePath))

for (const pkgJsonPath of pkgJsonPaths) {
  const pkgJson = require(pkgJsonPath)
  if (!pkgJson.devDependencies) continue

  console.log(`found devDependencies in: ${pkgJsonPath}`)
  delete pkgJson.devDependencies
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2))
}

run(`yarn install && \
  echo "yarn.lock now contains only prod deps. After you're done with it, don't forget to kill all unstaged changes."`)
