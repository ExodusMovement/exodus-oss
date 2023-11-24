[![Checks](https://github.com/ExodusMovement/exodus-oss/actions/workflows/checks.yaml/badge.svg?branch=master)](https://github.com/ExodusMovement/exodus-oss/actions/workflows/checks.yaml) [![Version](https://github.com/ExodusMovement/exodus-oss/actions/workflows/version.yaml/badge.svg)](https://github.com/ExodusMovement/exodus-oss/actions/workflows/version.yaml) [![Publish](https://github.com/ExodusMovement/exodus-oss/actions/workflows/publish.yaml/badge.svg)](https://github.com/ExodusMovement/exodus-oss/actions/workflows/publish.yaml) [![CodeQL](https://github.com/ExodusMovement/exodus-oss/actions/workflows/codeql.yml/badge.svg)](https://github.com/ExodusMovement/exodus-oss/actions/workflows/codeql.yml)

# exodus-oss

> [!WARNING]
> This repo still has some private dependencies and links out to private documentation. We're working on making those public, but it will take time. If you have not been explicitly granted access to those, expect tooling and tests not to work.

This is the mono repo that is home to the open source modules of the Exodus eco-system.

Before you leave your loving aunt and uncle and your comfortable attic on Privet Drive and venture down to fight Voldemort below, we recommend you go to [Hogwarts](https://coda.io/d/Exodus-Wallets-Architecture-and-Best-Practices_dDRDEoXvP_I/Wallets-Architecture_suyd3) and at least learn Lumos.

## Getting started

This repository uses a modern version of yarn that doesn't support `.npmrc` files anymore. To gain access to Exodus'
private packages, you have to invoke `yarn npm login` and login with your credentials. This has to be done once only.

After that, you can install dependencies as usual.

### Migrating an existing module

This section describes how to migrate an existing module and keep its git commit history.

#### Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [git-filter-repo](https://github.com/newren/git-filter-repo/blob/main/INSTALL.md)

GH SSH authentication [has to be configured](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh) or alternatively the `--https` flag has to be used.

#### Usage

Install `@exodus/migrate` globally (`npm i -g @exodus/migrate`), run `exodus-migrate` and specify the path to the repository, or subdirectory within the repository.

For the latter you can simply navigate to the subdirectory in the GH UI and copy the URL from your browser's
address bar. If the subdirectory does not contain a `package.json`, a basic `package.json` will be created on your
behalf. More info can be found in the [`@exodus/migrate` repository](https://github.com/ExodusMovement/exodus-migrate)

Examples:

```sh
# from a repository URL
exodus-migrate --url https://github.com/ExodusMovement/some-other-repo --target-dir modules/auto-enable-assets --scope @exodus --rename-tags


# from a subdirectory within a repository (can also be from a different branch than master)
exodus-migrate --url https://github.com/ExodusMovement/some-other-repo/tree/master/src/_local_modules/enabled-assets --target-dir modules/auto-enable-assets --scope @exodus --rename-tags
```

The script will replace the `repository`, `homepage`, and `bugs.url` properties in `package.json` to point to hydra
and set the homepage to the module's folder on master.

2. You should check for potentially broken badges in your README.md, no longer required ci folders,
   eslint configs, .gitignore files, and lockfiles on package level. `yarn postmigrate` can help to identify unwanted
   files and create new config files to extend the root configuration in this repository. If the last commit affects files inside the imported package's folder, `yarn postmigrate` will be able to determine the package automatically. Otherwise you can supply the module path manually: `yarn postmigrate modules/orders-monitor`.

3. Many `devDependencies` may no longer be required as they are hoisted to avoid duplication and use the same
   versions across all modules. Prune what you can from your imported module.

4. The changes cannot be merged using the GH UI without losing the history. Merging has to be done locally to `master`
   as fast-forward merge. This only works if no other PR has been merged in-between. Using the `--ff-only` flag will
   make git abort should a fast-forward merge not be possible. All the work was in vain then and you have to start over
   from `1.` Better be fast this time!

```bash
  git checkout master
  git merge $IMPORT_BRANCH --ff-only
```

5. Last, push to master directly.

Note: if your package is missing them you will most likely need to add `babel.config.js` and `jest.config.js`. `yarn postmigrate` also offers to add them (see 2.)

### Creating a new module

Different templates are available to scaffold a module.

#### Library

To generate a library, use the following:

```
yarn generate:library my-library
```

This will create a basic scaffold under the folder `./libraries/my-library`.

#### Module

To generate a module, use the following and select the language you'd like to use in the interactive
prompt that comes up:

```
yarn generate:module my-module
```

This will create a folder `./modules/my-module` in your desired target language. It has a basic test setup and
logging pre-configured.

## Development

While developing a package in this monorepo, you may want to test it in an app, e.g. your mobile dapp. Unfortunately we can't use `npm link` because mobile's packager `metro` doesn't support symlinks (yet). However, we have a similar tool here to help you sync your changes to the client repos before you publish a new version.

To link your module to a client repo, run:

```
yarn run -T sync module-name,other-module-name /path/to/client-repo
```

This will start a watch process that syncs the specified modules to `src/node_modules` in that repo. If you need them synced elsewhere, specify a different path as the 2nd argument.

Examples

```
yarn run -T sync module-name,other-module-name ../my-app
```

### Test

Examples:

```
# test one library
yarn test --scope @exodus/fiat-client
```

### Build

If your module needs transpiling (i.e. Babel or Typescript) before publishing, make sure to add
a `build` script to the `package.json` of the module.

Examples:

```
# build all
yarn build

# build one library
yarn build --scope @exodus/fiat-client
```

### Pack

Lerna uses npm/yarn pack and does not allow to specify a custom folder for packing, i.e.
the module's root where `package.json` resides is used for packing. This is less than ideal
for modules that require transpilation (i.e. Typescript modules) and do not re-export everything
from the entrypoint. Without further steps, imports would have to include the dist folder name such as
`@exodus/networking-spec/lib/shared`.

One option to achieve a clean import structure anyway, is to copy the build output to the top
level before packing. The lifecycle script `prepack` can be used for that.

For further information on the topic please refer to [this GH issue](https://github.com/lerna/lerna/issues/901)

### Version

To version your packages, either:

- merge a PR with eligible commit type. The following don't trigger a release: `chore`, `docs`, `test`, `ci`
- run `yarn release` and select the package(s) you want to release
- run `yarn release` and supply packages as a positional argument: `yarn release networking-mobile,kyc,storage-mobile`
- run [the version workflow](https://github.com/ExodusMovement/exodus-oss/actions/workflows/version.yaml) directly through the GH UI.

All of these derive version bumps from the conventional commit history and create a release PR, labeled with `publish-on-merge`. Make sure that the checks on the release PR pass, especially when releasing packages that depend on other packages from this repository.

For more options to `yarn release`, see the [CLI docs](https://github.com/ExodusMovement/lerna-release-action/tree/master/cli).

### Publish

All packages that received a version bump in the previous step are automatically published to npm after merging
the release PR. The tags listed in the PR body will be added to the merge commit.

Initial versions can be published by manually executing [the publish workflow](https://github.com/ExodusMovement/exodus-oss/actions/workflows/publish.yaml). All packages with versions not currently present in the registry will be published. If unclear how to run the publish workfow, please follow [these](https://user-images.githubusercontent.com/2863630/203893329-f0eca8d0-4f8c-4ccb-abc2-65bfd819fa61.png) instructions.

### Commit messages

Commit messages and PR titles should follow the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#specification). Breaking changes are denoted with a bang (`!`) before the colon (`:`) in the commit message and will result in a major version bump.

> feat!: all roads lead to Gotham

If your PR only affects a section of a package, you may use a scope. Please refrain from using scopes for package names as they will show up in the `CHANGELOG.md` and the scope is redundant there. PRs are labelled with the package names they affect, so it also doesn't add any value in the GH UI.

🟩 Good

> feat(redux): add hardware wallet account selector

🟥 Bad

> feat(wallet-accounts): add hardware wallet account selector

### Dependencies

#### Breaking changes

Occasionally, it is necessary to introduce a breaking change. Fixing downstream packages may only require a patch or minor, and not always warrant a breaking change. The solution is to create a PR chain. Changes that are breaking from a consumer perspective are isolated in the first PR, and non-breaking downstream errors are fixed in follow-up PRs. To avoid failing checks on master for an extended period, the chain should not be merged manually. Instead, apply the label `action/merge-chain` to the tip of the PR chain. It will merge the first PR, rebase the following PR onto master, and continue on merging until the entire chain is merged.

#### Inter-package

If your package requires referencing one of the packages maintained in this mono repo and you want
to consume the latest unpublished changes without having to set a specific version, you have to
manually add that dependency to `package.json` and set the version to `*`. This manual step is
currently required because of an incompatibility between more recent yarn versions (berry) and
lerna.

Latest code changes are automatically reflected in the import and versioning/publishing
takes care of keeping the version in the module's `package.json` up-to-date.

##### Typescript

For TS modules, a path mapping to resolve the import correctly from the `src`
folder has to be added. This can be done in the top level `tsconfig.json`:

```json5
{
  // ...
  compilerOptions: {
    // ...
    paths: {
      // ...
      '@exodus/networking-spec': ['./modules/networking-spec/src'],
      '@exodus/networking-spec/*': ['./modules/networking-spec/src/*'],
    },
  },
}
```

The jest config for these modules, then also has to define a custom `moduleNameMapper`
that can be created from the paths definitions in our tsconfig to avoid duplication:

```js
module.exports = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/../../',
  }),
}
```

A full example can be found [here](./modules/networking-node/jest.config.js)

Please note that referencing files outside/above the module's directory, will cause tsc to nest
its build output in `module-name/src` and copy the locally referenced dependency to `outDir`.
Make sure an adequate `prepack` script is provided to cleanup and prepare the build output before packing.

## CI

This repo uses sophisticated caching courtesy of nx and Github Actions. When changing non-module-local
configuration/code, you may want to clear the cache in the CI to force checks to re-run. You can do so
by running `yarn cache:delete` or use the [GH page](https://github.com/ExodusMovement/exodus-oss/actions/caches) for
managing caches. The CLI client has the advantage of being able to purge all caches for a given branch. This is
currently not supported in the UI.

## Conventions

First see [general conventions](https://coda.io/d/Engineering-Handbook_dWMI1pUBpME/Recipes-Patterns-Anti-Patterns_suk6k).

### Libraries vs Features vs API slices vs Modules vs Atoms vs Plugins

Refer to our [Lego manual](https://coda.io/d/Engineering-Handbook_dWMI1pUBpME/2-Libraries-modules-atoms-plugins_suw41#_luEGz) to understand key concepts/differences in our architecture.

### Modules

#### Async Initialization

If your module requires some async initialization, e.g. to load data from storage or an API, expose a public `load()` method, and call it the `load` and `unlock` application lifecycle hooks.

```js
load = async () => {
  this.#cache = await fetchival(this.#someServerUrl).get()
}
```

#### Consuming/Producing Data

Your module may need to consume data from `storage`, `fusion`, `remoteConfig` and/or other modules like `walletAccounts`, `blockchainMetadata`, etc.

In all of these cases, you should prefer accepting an `atom` for that piece of data rather than any of those modules. This lets your module avoid worrying about the specifics of where a value is coming from and instead have a simple API for retrieving and monitoring that value (`{ get, observe, set? }`). It will also make your module much easier to test.

Similarly, modules should produce/export data by writing it to atoms.

#### Configuration

If your module accepts some static configuration, e.g. `{ someServerUrl, maxSlippage }`, accept that as an option called `config` in your module's constructor.

If you're using Exodus's `@exodus/dependency-injection` or `@exodus/headless` to wire up the dependency tree, config values will be auto-magically binded for you from the passed global config by module id:

```js
import createHeadless from '@exodus/headless'
import createPreprocessors from '@exodus/dependency-preprocessors'

const config = {
  feri: {
    likesSandwiches: true,
    maxCachacaCapacity: Number.MAX_SAFE_INTEGER + 1,
  },
}

const exodus = createHeadless({ adapters, config })
exodus.register({
  definition: {
    id: 'feri',
    factory: createFeri, // will get called as `createFeri({ config: config.feri })`
    dependencies: ['config'],
  },
})

exodus.resolve()
```
