import { hash } from '@exodus/crypto/hash'
import { hmac } from '@exodus/crypto/hmac'
import { randomBytes } from '@exodus/crypto/randomBytes'
import * as secp256k1 from '@noble/secp256k1'

async function singleRoundHmacDRBG(nonce) {
  const seed = randomBytes(32)
  let K = Buffer.alloc(32, 0)
  let V = Buffer.alloc(32, 1)
  K = await hmac('sha256', K, [V, new Uint8Array([0]), seed, nonce])
  V = await hmac('sha256', K, V)
  K = await hmac('sha256', K, [V, new Uint8Array([1]), seed, nonce])
  V = await hmac('sha256', K, V)
  return hmac('sha256', K, V)
}

/**
 *
 * // Based on The ZILLIQA Technical Whitepaper, Appendix A
 * // https://docs.zilliqa.com/whitepaper.pdf
 * // ---
 * // Algorithm is as follows
 * // 1. k = rand(1, n)
 * // 2. Q = [k]G
 * // 3. r = H(Q || pk || m) mod n
 * // 4. If r = 0 Goto 1
 * // 5. s = k - r * sk mod n
 * // 6. If s = 0 Goto 1
 * // 7. mu = (r, s)
 * // 8. return mu.
 *
 * @param {Buffer} data
 * @param {Buffer} privateKey
 * @returns {string}
 */
export async function schnorrZ({ data, privateKey }) {
  const { utils, Signature, CURVE, getPublicKey } = secp256k1
  const big = (buf) => BigInt('0x' + buf.toString('hex'))

  const pk = getPublicKey(privateKey, true)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // 1. k comes from drbg until satisfies 0 < k < n
    const k = await singleRoundHmacDRBG(data)
    const kn = big(k)
    if (!(kn > BigInt(0) && kn < CURVE.n)) continue // this is rechecked below

    const Q = getPublicKey(k, true) // 2. This is Q = G * k multiplication. Also checks 0 < k < n and throws
    const H = await hash('sha256', [Q, pk, data])
    const r = utils.mod(big(H), CURVE.n) // 3
    if (r === BigInt(0)) continue // 4

    const s = utils.mod(kn - r * big(privateKey), CURVE.n) // 5
    if (s === BigInt(0)) continue // 6

    const sig = new Signature(r, s) // 7
    return Buffer.from(sig.toCompactRawBytes()) // 8
  }

  // eslint-disable-next-line no-unreachable
  throw new Error('Makes Flow happy')
}
