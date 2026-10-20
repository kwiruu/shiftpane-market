import { generateKeyPair } from './signing.ts'

// Makes a new signing key pair. The private key goes into the API's SIGNING_KEY config var and
// nowhere else; the public key goes into keys.ts, and from there into the app.
const { privateKey, publicKey } = generateKeyPair()
console.info(`SIGNING_KEY=${privateKey}`)
console.info(`public key: ${publicKey}`)
