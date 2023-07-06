export class ExpectedKeyIdentifier extends TypeError {
  constructor(got) {
    // ES6 compliant
    super(
      `Expected object of type KeyIdentifier, instead received ${
        got?.constructor?.name || typeof got
      }`
    )
  }
}

export class NotInitializedError extends Error {
  constructor() {
    super(`Expected Keychain to be inialized with seed from mnemonic`)
  }
}
