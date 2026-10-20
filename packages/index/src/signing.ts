import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto'

/**
 * Detached Ed25519 signatures over the exact bytes of `index.json` and `revoked.json` (PLAN, "Signed
 * distribution"). Keys travel as base64 DER: PKCS#8 for the private key, which lives only in the
 * API's `SIGNING_KEY` config var, and SPKI for the public keys the app ships.
 */

export interface KeyPair {
  privateKey: string
  publicKey: string
}

export function generateKeyPair(): KeyPair {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  return {
    privateKey: privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64'),
    publicKey: publicKey.export({ format: 'der', type: 'spki' }).toString('base64'),
  }
}

/** The public half of a private key, to check a config var against the keys the app ships. */
export function publicKeyOf(privateKey: string): string {
  return createPublicKey(loadPrivate(privateKey))
    .export({ format: 'der', type: 'spki' })
    .toString('base64')
}

/** A base64 signature, the whole content of a `.sig` file. */
export function signBytes(bytes: Uint8Array, privateKey: string): string {
  return sign(null, bytes, loadPrivate(privateKey)).toString('base64')
}

/** Whether any of `publicKeys` signed `bytes`. The app passes its current and next key. */
export function verifyBytes(bytes: Uint8Array, signature: string, publicKeys: readonly string[]) {
  const signed = Buffer.from(signature.trim(), 'base64')
  return publicKeys.some((key) => {
    try {
      const publicKey = createPublicKey({
        key: Buffer.from(key, 'base64'),
        format: 'der',
        type: 'spki',
      })
      return verify(null, bytes, publicKey, signed)
    } catch {
      return false
    }
  })
}

function loadPrivate(privateKey: string) {
  return createPrivateKey({ key: Buffer.from(privateKey, 'base64'), format: 'der', type: 'pkcs8' })
}
