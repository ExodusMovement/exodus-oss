if (process.env.CI === 'true') {
  console.log = () => {}
  console.debug = () => {}
  console.warn = () => {}
}
