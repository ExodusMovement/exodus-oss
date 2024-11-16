# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [7.6.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@7.5.1...@exodus/keychain@7.6.0) (2024-11-16)

### Features

- expose sodium encrypt/decrypt box in keychain api ([#174](https://github.com/ExodusMovement/exodus-oss/issues/174)) ([618bc35](https://github.com/ExodusMovement/exodus-oss/commit/618bc357ce470e1d26c79b5b85e7bcacfc89a332))

### Bug Fixes

- schnorrSign return type and type and signature ([#176](https://github.com/ExodusMovement/exodus-oss/issues/176)) ([7e8d8bb](https://github.com/ExodusMovement/exodus-oss/commit/7e8d8bb60fbd658607b54b76ceed8a43116a558a))

## [7.5.1](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@7.5.0...@exodus/keychain@7.5.1) (2024-11-13)

### Bug Fixes

- add signSchnorr to keychain api ([#171](https://github.com/ExodusMovement/exodus-oss/issues/171)) ([2da2b05](https://github.com/ExodusMovement/exodus-oss/commit/2da2b05fdcc382042d3084cf63eb7f2931699fa4))

## [7.5.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@7.4.0...@exodus/keychain@7.5.0) (2024-11-03)

### Features

- use exodus/crypto instead of sodium where possible ([#164](https://github.com/ExodusMovement/exodus-oss/issues/164)) ([fbaf8ae](https://github.com/ExodusMovement/exodus-oss/commit/fbaf8aedecfca8e91fe377925db8e843c1bf623b))

### Bug Fixes

- bump slip10 to remove dependance on elliptic fork ([#166](https://github.com/ExodusMovement/exodus-oss/issues/166)) ([29ca457](https://github.com/ExodusMovement/exodus-oss/commit/29ca4571382f3cd0829f5729b9011a2ba0560915))

## [7.4.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@7.3.0...@exodus/keychain@7.4.0) (2024-10-17)

### Features

- add `sodium.getKeysFromSeed` ([#160](https://github.com/ExodusMovement/exodus-oss/issues/160)) ([96496f2](https://github.com/ExodusMovement/exodus-oss/commit/96496f2b4cb693f05c888137c2d1220c4a49e201))
- expose `sodium.sign` ([#161](https://github.com/ExodusMovement/exodus-oss/issues/161)) ([457d201](https://github.com/ExodusMovement/exodus-oss/commit/457d201cf3d5bfd2361f198f2b062bc680b15e58))

## [7.3.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@7.2.0...@exodus/keychain@7.3.0) (2024-10-03)

### Features

- bump dependencies for unified secp256k1 impl ([#155](https://github.com/ExodusMovement/exodus-oss/issues/155)) ([0c17562](https://github.com/ExodusMovement/exodus-oss/commit/0c17562650812567927a83063a8b4a163bb3c1b7))
- switch to exodus/crypto for secp256k1 ([#152](https://github.com/ExodusMovement/exodus-oss/issues/152)) ([292dd33](https://github.com/ExodusMovement/exodus-oss/commit/292dd33249b9501c9469e05546d4f42786c38f9a))

## [7.2.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@7.1.0...@exodus/keychain@7.2.0) (2024-09-30)

### Features

- remove ecOptions from secp256k1 signer ([#150](https://github.com/ExodusMovement/exodus-oss/issues/150)) ([c1dd7e1](https://github.com/ExodusMovement/exodus-oss/commit/c1dd7e18a51e425440be3fdda60b3d9e0e3afca0))
- switch to exodus/crypto for schnorr signatures ([#148](https://github.com/ExodusMovement/exodus-oss/issues/148)) ([971221c](https://github.com/ExodusMovement/exodus-oss/commit/971221c84f478de35f39eb268de6d7d82b552f1c))

## [7.1.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@7.0.0...@exodus/keychain@7.1.0) (2024-09-19)

### Features

- expose sodium encryption through API ([#143](https://github.com/ExodusMovement/exodus-oss/issues/143)) ([6273ea6](https://github.com/ExodusMovement/exodus-oss/commit/6273ea6b955fa8835414bfb9c0127d2ee96f092a))

## [7.0.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.10.0...@exodus/keychain@7.0.0) (2024-09-13)

### ⚠ BREAKING CHANGES

- **keychain:** only export secret if "exportPrivate" flag is set (#139)

### Bug Fixes

- **keychain:** only export secret if "exportPrivate" flag is set ([#139](https://github.com/ExodusMovement/exodus-oss/issues/139)) ([7a01522](https://github.com/ExodusMovement/exodus-oss/commit/7a01522ba75a123a415f0cabbb625df3e953067b))

## [6.10.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.9.1...@exodus/keychain@6.10.0) (2024-09-04)

### Features

- **keychain:** allow exporting sodium private keys ([#135](https://github.com/ExodusMovement/exodus-oss/issues/135)) ([33400c8](https://github.com/ExodusMovement/exodus-oss/commit/33400c83e8a207086c8ce32ec89ecfe0409849fc))

## [6.9.1](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.9.0...@exodus/keychain@6.9.1) (2024-08-16)

### Bug Fixes

- upgrade slip10 to fix esm ([#127](https://github.com/ExodusMovement/exodus-oss/issues/127)) ([5658119](https://github.com/ExodusMovement/exodus-oss/commit/565811913bfb15dc78c2c98eb954ccc83c3a7c90))

## [6.9.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.8.0...@exodus/keychain@6.9.0) (2024-07-31)

### Features

- **keychain:** implement removing specific seeds ([#131](https://github.com/ExodusMovement/exodus-oss/issues/131)) ([e3856d4](https://github.com/ExodusMovement/exodus-oss/commit/e3856d43c45a2a40312f62dda7d0a2bf30698c12))

## [6.8.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.7.0...@exodus/keychain@6.8.0) (2024-07-24)

### Features

- declare keychain definitions as public ([#125](https://github.com/ExodusMovement/exodus-oss/issues/125)) ([d9ea888](https://github.com/ExodusMovement/exodus-oss/commit/d9ea888327925790c103d1a8bdee288e8c32330b))
- implement seed-specific locked boolean flag ([#123](https://github.com/ExodusMovement/exodus-oss/issues/123)) ([2f9dd29](https://github.com/ExodusMovement/exodus-oss/commit/2f9dd29a6b770088756d2decbd51cfa1bda9fdfe))

## [6.7.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.6.0...@exodus/keychain@6.7.0) (2024-07-10)

### Features

- **keychain:** default feature config ([#112](https://github.com/ExodusMovement/exodus-oss/issues/112)) ([ac8a86b](https://github.com/ExodusMovement/exodus-oss/commit/ac8a86bb10efdff2849a9577d0b8150c9247b886))

## [6.6.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.5.1...@exodus/keychain@6.6.0) (2024-07-05)

### Features

- add common signature encoding ([#107](https://github.com/ExodusMovement/exodus-oss/issues/107)) ([db4e478](https://github.com/ExodusMovement/exodus-oss/commit/db4e478a587a4945ba4c7908bc07db1086cbf58f))

## [6.5.1](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.5.0...@exodus/keychain@6.5.1) (2024-07-05)

### Bug Fixes

- use proper ESM ([#109](https://github.com/ExodusMovement/exodus-oss/issues/109)) ([28507b6](https://github.com/ExodusMovement/exodus-oss/commit/28507b6e1494deab2a0d2e5085a900fcf870214a))

## [6.5.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.4.0...@exodus/keychain@6.5.0) (2024-05-08)

### Features

- reject signing with invalid key types ([#101](https://github.com/ExodusMovement/exodus-oss/issues/101)) ([126801d](https://github.com/ExodusMovement/exodus-oss/commit/126801d237d9cfbd9b5e6471b4f142813b89725f))

## [6.4.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.3.0...@exodus/keychain@6.4.0) (2024-04-26)

### Features

- support for schnorr signatures ([#90](https://github.com/ExodusMovement/exodus-oss/issues/90)) ([4c9420d](https://github.com/ExodusMovement/exodus-oss/commit/4c9420d344ac79467a1bd3dff691751eaeaad0e1))

## [6.3.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.1.1...@exodus/keychain@6.3.0) (2024-04-24)

### Features

- expose signing functions from API ([#73](https://github.com/ExodusMovement/exodus-oss/issues/73)) ([75fcb83](https://github.com/ExodusMovement/exodus-oss/commit/75fcb830a5f0d5fe7ca08a1b1022ca9d012ab6ec))
- lockPrivateKeys and unlockPrivateKeys ([#78](https://github.com/ExodusMovement/exodus-oss/issues/78)) ([9753ae9](https://github.com/ExodusMovement/exodus-oss/commit/9753ae9061e02a026b3a62a80464e98eab528530))
- pass options to secp256k1 signBuffer ([#71](https://github.com/ExodusMovement/exodus-oss/issues/71)) ([a951bbd](https://github.com/ExodusMovement/exodus-oss/commit/a951bbd7ddbd5bc1feada3cae8d93bd112f16dd9))

### Bug Fixes

- privateKeysAreLocked should be false when seeds removed ([#87](https://github.com/ExodusMovement/exodus-oss/issues/87)) ([ad22118](https://github.com/ExodusMovement/exodus-oss/commit/ad221186a02c7dc5707c6749a024c5021938d15f))

## [6.1.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@6.0.0...@exodus/keychain@6.1.0) (2024-02-20)

### Features

- keychain api, to replace the one from the wallet feature ([#64](https://github.com/ExodusMovement/exodus-oss/issues/64)) ([f5fd3e1cc](https://github.com/ExodusMovement/exodus-oss/commit/f5fd3e1cc5d813c6da527ab972b5402c0a2508e3))
- add separate key-identifier package ([#61](https://github.com/ExodusMovement/exodus-oss/issues/61)) ([49dc7f6](https://github.com/ExodusMovement/exodus-oss/commit/49dc7f66040a9ecaba1d971858764532d695bbdc))

## [6.0.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@5.0.1...@exodus/keychain@6.0.0) (2024-02-15)

### ⚠ BREAKING CHANGES

- add multi-seed support ([#50](https://github.com/ExodusMovement/exodus-oss/issues/50)) ([82e5cf2e](https://github.com/ExodusMovement/exodus-oss/commit/82e5cf2e1b9334af150bf2a8bba4abbc0f74c764))

## [5.0.1](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@5.0.0...@exodus/keychain@5.0.1) (2024-01-26)

### Bug Fixes

- super.clear() call ([#44](https://github.com/ExodusMovement/exodus-oss/issues/44)) ([b8e0475](https://github.com/ExodusMovement/exodus-oss/commit/b8e0475f72f9fb156f1eb42a10c44b50fea6a2e0))

## [5.0.0](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@4.4.1...@exodus/keychain@5.0.0) (2024-01-26)

### ⚠ BREAKING CHANGES

- Expose clear method instead of clearing in plugin ([#20](https://github.com/ExodusMovement/exodus-oss/issues/20)) ([0db45ce6](https://github.com/ExodusMovement/exodus-oss/commits/0db45ce6c7f4848a48cf34ca4a12079169801de5))
- Remove atom factory ([#23](https://github.com/ExodusMovement/exodus-oss/issues/23)) ([99570d0](https://github.com/ExodusMovement/exodus-oss/commits/99570d039809b3bfdd3974a1153904f8a6f5d4d6))
- Deprecate create methods ([#21](https://github.com/ExodusMovement/exodus-oss/issues/21)) ([6fc00a81](https://github.com/ExodusMovement/exodus-oss/commit/6fc00a81255480de6e8a083c81b24390dd5a1282))
- Relicense under MIT license ([#38](https://github.com/ExodusMovement/exodus-oss/issues/38)) ([2512b75](https://github.com/ExodusMovement/exodus-oss/commit/2512b75330a4be507ef6675a03c2fe994cf4b0e3))

## [4.4.1](https://github.com/ExodusMovement/exodus-oss/compare/@exodus/keychain@4.4.0...@exodus/keychain@4.4.1) (2023-11-24)

- Add basic types

## 4.4.0 (2023-11-10)

### Features

- **keychain:** add compare function for keyidentifier ([#4540](https://github.com/ExodusMovement/exodus-hydra/issues/4540)) ([8c196db](https://github.com/ExodusMovement/exodus-hydra/commit/8c196db2cfb66d5229109046891b02e2cda4b9d6))
- move keychain to feature dir ([#2374](https://github.com/ExodusMovement/exodus-hydra/issues/2374)) ([0353822](https://github.com/ExodusMovement/exodus-hydra/commit/03538224746ce74192fd44ef811e6918869de6d5))

### Bug Fixes

- import from atoms index ([#4508](https://github.com/ExodusMovement/exodus-hydra/issues/4508)) ([e487b19](https://github.com/ExodusMovement/exodus-hydra/commit/e487b19dd9ae17a1ab777c7990ff7b9aa00a1ad6))

## [4.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@4.2.0...@exodus/keychain@4.3.0) (2023-10-23)

### Features

- **keychain:** add compare function for keyidentifier ([#4540](https://github.com/ExodusMovement/exodus-hydra/issues/4540)) ([71e32cc](https://github.com/ExodusMovement/exodus-hydra/commit/71e32ccb6bbb0989cb9b2d2006cbc0ea8c64f517))

## [4.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@4.1.0...@exodus/keychain@4.2.0) (2023-10-20)

### Features

- move keychain to feature dir ([#2374](https://github.com/ExodusMovement/exodus-hydra/issues/2374)) ([c8373a8](https://github.com/ExodusMovement/exodus-hydra/commit/c8373a84190d7861072a1cf5659f1fce227befee))

### Bug Fixes

- import from atoms index ([#4508](https://github.com/ExodusMovement/exodus-hydra/issues/4508)) ([923fb99](https://github.com/ExodusMovement/exodus-hydra/commit/923fb992328b63e45401c78176b5a6ef7b666eee))

## [4.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@4.1.0...@exodus/keychain@4.1.1) (2023-07-05)

### Bug Fixes

- **keychain:** plugin not published on npm ([#2278](https://github.com/ExodusMovement/exodus-hydra/issues/2278)) ([0e37c8a](https://github.com/ExodusMovement/exodus-hydra/commit/0e37c8ab8c44b08dd17cb89f1f29784e4cee8e86))

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@4.0.2...@exodus/keychain@4.1.0) (2023-07-03)

### Features

- memoizedKeychain module ([#2106](https://github.com/ExodusMovement/exodus-hydra/issues/2106)) ([ba92e86](https://github.com/ExodusMovement/exodus-hydra/commit/ba92e86b97eeef613d642837dc52702debd7e723))

## [4.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@4.0.1...@exodus/keychain@4.0.2) (2023-06-21)

### Bug Fixes

- **keychain:** enable tests & verify analytics id ([#1118](https://github.com/ExodusMovement/exodus-hydra/issues/1118)) ([4768265](https://github.com/ExodusMovement/exodus-hydra/commit/4768265ca43295b6619b7da82d2b4d7b8c422777))
- master ci ([#1613](https://github.com/ExodusMovement/exodus-hydra/issues/1613)) ([44e3063](https://github.com/ExodusMovement/exodus-hydra/commit/44e306304338d5ce3cbc21757b6b3e91f5d95210))

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@4.0.0...@exodus/keychain@4.0.1) (2023-04-27)

**Note:** Version bump only for package @exodus/keychain

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@3.5.0...@exodus/keychain@4.0.0) (2023-04-25)

### ⚠ BREAKING CHANGES

- **keychain)(3:** remove seed from constructor (#1337)
- **keychain)(2:** export module definition (#1133)
- **keychain:** differentiate module/atoms (#1094)

### Code Refactoring

- **keychain)(2:** export module definition ([#1133](https://github.com/ExodusMovement/exodus-hydra/issues/1133)) ([4c1117d](https://github.com/ExodusMovement/exodus-hydra/commit/4c1117d17c84c5a600e0883ce3de43b87fdcaa42))
- **keychain)(3:** remove seed from constructor ([#1337](https://github.com/ExodusMovement/exodus-hydra/issues/1337)) ([8ecccd4](https://github.com/ExodusMovement/exodus-hydra/commit/8ecccd4bf9f9089f585d8b70b0d4b1265328115f))
- **keychain:** differentiate module/atoms ([#1094](https://github.com/ExodusMovement/exodus-hydra/issues/1094)) ([10c38bb](https://github.com/ExodusMovement/exodus-hydra/commit/10c38bb33f340bd9a0369f540b2cfcd354988e77))

## [3.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@3.4.0...@exodus/keychain@3.5.0) (2023-04-13)

### Features

- keychain.clone for compatibility modes ([#1218](https://github.com/ExodusMovement/exodus-hydra/issues/1218)) ([b0cc050](https://github.com/ExodusMovement/exodus-hydra/commit/b0cc050eeced8b43fb0a973fa50e3c16f667a327))

## [3.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@3.3.1...@exodus/keychain@3.4.0) (2023-04-10)

### Features

- atom/waitUntil ([#1142](https://github.com/ExodusMovement/exodus-hydra/issues/1142)) ([4432b3c](https://github.com/ExodusMovement/exodus-hydra/commit/4432b3c645f37fc1de002b845c4253a684235d3e))

## [3.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@3.3.0...@exodus/keychain@3.3.1) (2023-04-04)

**Note:** Version bump only for package @exodus/keychain

## [3.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@3.2.1...@exodus/keychain@3.3.0) (2023-03-31)

### Features

- add seedDerivedId atom ([#1071](https://github.com/ExodusMovement/exodus-hydra/issues/1071)) ([05befdb](https://github.com/ExodusMovement/exodus-hydra/commit/05befdb525de7925b4bb5f0b544adbfeaf4641e3))

## [3.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@3.2.0...@exodus/keychain@3.2.1) (2023-03-23)

### Bug Fixes

- add privateKey shortcut to signTx param ([#993](https://github.com/ExodusMovement/exodus-hydra/issues/993)) ([c7f993c](https://github.com/ExodusMovement/exodus-hydra/commit/c7f993c16a125e869d5cb7337606a77d8a4879d1))
- **keychain:** update seedless derivationPath from 2'/4' to 5'/0' ([#1017](https://github.com/ExodusMovement/exodus-hydra/issues/1017)) ([05a15f6](https://github.com/ExodusMovement/exodus-hydra/commit/05a15f6b9e62972d99447661baca317865c08971))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@3.1.0...@exodus/keychain@3.2.0) (2023-02-28)

### Features

- **keychain:** add signOpen and verifyDetached to sodiumEncryptor ([#939](https://github.com/ExodusMovement/exodus-hydra/issues/939)) ([3a36086](https://github.com/ExodusMovement/exodus-hydra/commit/3a36086541129a1afcdf1ffb7248c0bd24167c8d))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@3.0.0...@exodus/keychain@3.1.0) (2023-02-23)

### Features

- add `restricted-imports` eslint rule ([#719](https://github.com/ExodusMovement/exodus-hydra/issues/719)) ([175de9c](https://github.com/ExodusMovement/exodus-hydra/commit/175de9c19ec00e5a12441022c313837d58f38882))
- **keychain:** add seedless key identifier ([#925](https://github.com/ExodusMovement/exodus-hydra/issues/925)) ([d62561b](https://github.com/ExodusMovement/exodus-hydra/commit/d62561bb9fd5d32ce2ad74508123c03d7a077ae5))

## 3.0.0 (2022-12-21)

### ⚠ BREAKING CHANGES

- new keychain.signTx method (#629)

### Refactor

- new keychain.signTx method ([#629](https://github.com/ExodusMovement/exodus-hydra/issues/629)) ([e4216a](https://github.com/ExodusMovement/exodus-hydra/commit/e4216a74edb384cf485a3574f60f699d390bd118))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@2.0.0...@exodus/keychain@2.1.0) (2022-12-15)

### Features

- keychain.exportKey to return hdkey ([#610](https://github.com/ExodusMovement/exodus-hydra/issues/610)) ([23004cb](https://github.com/ExodusMovement/exodus-hydra/commit/23004cb67ec89dd4d8de0a15f2e4e90e9615c54f))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@1.2.2...@exodus/keychain@2.0.0) (2022-10-25)

### ⚠ BREAKING CHANGES

- **keychain:** do not pass assetName to signTx function

### Features

- **keychain:** do not pass assetName to signTx function ([1899d6f](https://github.com/ExodusMovement/exodus-hydra/commit/1899d6f0d76de20d028082dfd64bd60068d62021))
- **keychain:** freeze all exported objects ([#168](https://github.com/ExodusMovement/exodus-hydra/issues/168)) ([179ab24](https://github.com/ExodusMovement/exodus-hydra/commit/179ab24186f062c64ea62070971250a716db85e9))
- **keychain:** rework privToPub mappers ([#181](https://github.com/ExodusMovement/exodus-hydra/issues/181)) ([0df08e6](https://github.com/ExodusMovement/exodus-hydra/commit/0df08e6fdd4c4790c019b40e4e6f95d2765e27e8))
- simplify `KeyIdentifierProvider` ([#262](https://github.com/ExodusMovement/exodus-hydra/issues/262)) ([f7e68e5](https://github.com/ExodusMovement/exodus-hydra/commit/f7e68e525088cd18d4aa1879036624467a46d539))

### Bug Fixes

- pin 0.0.1 versions back in keychain ([#149](https://github.com/ExodusMovement/exodus-hydra/issues/149)) ([588f1ce](https://github.com/ExodusMovement/exodus-hydra/commit/588f1ce30c43eebe1134af4c20905f1af5d15b13))

## [1.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@1.2.1...@exodus/keychain@1.2.2) (2022-08-08)

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/keychain@1.1.1...@exodus/keychain@1.2.1) (2022-07-28)

### Bug Fixes

- buildBip32Path addressIndex/chainIndex validation ([#99](https://github.com/ExodusMovement/exodus-hydra/issues/99)) ([1b6869f](https://github.com/ExodusMovement/exodus-hydra/commit/1b6869fbe11053467b0db0ed157b954ea52ed367))
- use null prototype for Keychain masters ([#100](https://github.com/ExodusMovement/exodus-hydra/issues/100)) ([01265e1](https://github.com/ExodusMovement/exodus-hydra/commit/01265e10e8d79fbe53127c5e9528ff9b88f510ec))
- use null prototype in privToPub ([#101](https://github.com/ExodusMovement/exodus-hydra/issues/101)) ([fb89442](https://github.com/ExodusMovement/exodus-hydra/commit/fb8944238f47d273d4422b4aace0c5579cce4c32))

### Reverts

- Revert "Publish" ([7bfc339](https://github.com/ExodusMovement/exodus-hydra/commit/7bfc339f6229b11110e6936422b935b8820abd8a))
- Revert "Publish" ([da7967e](https://github.com/ExodusMovement/exodus-hydra/commit/da7967ebfef69853d932a5ec3d71a5d4eea391a2))
- Revert "Publish" ([7e8a72b](https://github.com/ExodusMovement/exodus-hydra/commit/7e8a72b77aad4f2b7590439db9556f31dec530a7))
