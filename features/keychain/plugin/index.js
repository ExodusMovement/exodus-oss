const createKeychainPlugin = ({ storage }) => {
  const clearStorage = () => storage.clear()
  return {
    onClear: clearStorage,
    onImport: clearStorage,
  }
}

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'keychainPlugin',
  type: 'plugin',
  factory: createKeychainPlugin,
  dependencies: ['storage'],
}
