export const cloneBuffer = (buf) => {
  const newBuffer = Buffer.alloc(buf.length)
  buf.copy(newBuffer)
  return newBuffer
}
