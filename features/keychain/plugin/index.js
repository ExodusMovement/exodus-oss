const createKeychainPlugin = ({ storage }) => {
  const clearStorage = () => storage.clear()
  return {
    onClear: clearStorage,
    onImport: clearStorage,
  }
}

export default {
  id: 'keychainPlugin',
  type: 'plugin',
  factory: createKeychainPlugin,
  dependencies: ['storage'],
}
