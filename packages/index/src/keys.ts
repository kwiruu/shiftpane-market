/**
 * The registry's public keys (base64 SPKI). The app ships both and accepts a signature from either,
 * so the key can be rotated: sign with `next`, ship an app that knows the key after it, then make
 * `next` the current one. The private half of `current` is the production API's `SIGNING_KEY`.
 */
export const registryKeys = {
  current: 'MCowBQYDK2VwAyEAj6uP43Nmal1S8BMaKaQ4aEtahnkEwoBrQECaPj3adNo=',
  next: undefined as string | undefined,
}

export const registryPublicKeys = [registryKeys.current, registryKeys.next].filter(
  (key): key is string => key !== undefined,
)
