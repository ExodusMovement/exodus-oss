#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const watchman = require('fb-watchman')
const { normalizePackages } = require('@exodus/lerna-utils')
const { readJson } = require('@exodus/lerna-utils/lib/utils/fs')
const { spawnSync } = require('child_process')

const BASE_SUBSCRIPTION = {
  expression: [
    'anyof',
    ['match', '*.js'],
    ['match', '*.json'],
    ['match', '*.png'],
    ['match', '*.d.ts'],
  ],
  fields: ['name', 'exists', 'type'],
}

const { npm_lifecycle_event: scriptName, INIT_CWD, PROJECT_CWD } = process.env
const DEPENDENCY_ROOT = 'src'

function printUsage() {
  console.log(
    chalk.blue`
Usage:

yarn sync:browser pkg1,pkg2,...,pkgN
yarn sync:mobile pkg1,pkg2,...,pkgN
yarn sync pkg1,pkg2,...,pkgN [toTargetPath]

Examples:

yarn sync:browser wallet
yarn sync:mobile wallet,blockchain-metadata
yarn sync wallet ../my-browser-app
yarn sync wallet,blockchain-metadata ../my-mobile-app`
  )
}

async function main() {
  const [packagesCsv, repositoryPath] = process.argv.slice(2)
  const packagePaths = await normalizePackages({ packagesCsv })
  const isRoot = INIT_CWD === PROJECT_CWD

  if (packagePaths.length === 1 && isRoot) {
    const { name } = await readJson(path.join(packagePaths[0], 'package.json'), { filesystem: fs })
    spawnSync('yarn', ['lerna', 'run', '--scope', name, scriptName], { stdio: 'inherit' })
  }

  const client = new watchman.Client()

  client.capabilityCheck({ optional: [], required: ['relative_root'] }, (error, resp) => {
    if (error) {
      console.log(error)
      return client.end()
    }
  })

  const absoluteRepositoryPath = path.resolve(repositoryPath)
  if (!fs.existsSync(absoluteRepositoryPath)) {
    console.error(
      chalk.red(
        `Sync target folder not found at: ${repositoryPath}. 'Please supply the sync target path as the 2nd positional arg. Example: yarn sync wallet ../path/to/my-mobile-app'`
      )
    )
    printUsage()
    process.exit(1)
  }

  const dependencyRoot = path.join(absoluteRepositoryPath, DEPENDENCY_ROOT)

  client.command(['watch-project', process.cwd()], (error, resp) => {
    if (error) return console.error(chalk.red('Error initiating watch:'), error)

    packagePaths.forEach((packagePath) =>
      watchPackage({ client, resp, packagePath, target: dependencyRoot })
    )
  })
}

function watchPackage({ client, packagePath, resp, target }) {
  const id = path.basename(packagePath)
  const targetDirectory = path.join(target, `node_modules/@exodus/${id}`)
  const subscription = {
    ...BASE_SUBSCRIPTION,
    relative_root: packagePath,
  }
  const absolutePackagePath = path.join(process.cwd(), packagePath)

  fs.removeSync(targetDirectory)
  fs.mkdirSync(targetDirectory)

  client.command(['subscribe', resp.watch, id, subscription])

  client.on('subscription', function (resp) {
    if (resp.subscription !== id) return

    resp.files.forEach(function (file) {
      const source = path.resolve(absolutePackagePath, file.name)
      const target = path.resolve(targetDirectory, file.name)
      if (file.type !== 'f') return

      if (file.exists) {
        fs.ensureFileSync(target)
        fs.copyFileSync(source, target)
        return
      }

      fs.removeSync(target)
    })

    console.log(chalk.yellow('Files updated!'), chalk.gray(`(${resp.files.length})`))
  })
}

main()
