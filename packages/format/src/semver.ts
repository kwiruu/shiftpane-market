/** Semver precedence (semver.org, section 11) for the `x.y.z(-pre)` versions the manifest allows. */
export function compareVersions(a: string, b: string): number {
  const [coreA = '', preA] = splitPre(a)
  const [coreB = '', preB] = splitPre(b)
  const partsA = coreA.split('.').map(Number)
  const partsB = coreB.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0)
    if (diff !== 0) return Math.sign(diff)
  }
  if (preA === undefined || preB === undefined) {
    // A release outranks its prereleases.
    return preA === preB ? 0 : preA === undefined ? 1 : -1
  }
  const idsA = preA.split('.')
  const idsB = preB.split('.')
  for (let i = 0; i < Math.max(idsA.length, idsB.length); i++) {
    const idA = idsA[i]
    const idB = idsB[i]
    if (idA === undefined) return -1
    if (idB === undefined) return 1
    const numA = /^\d+$/.test(idA)
    const numB = /^\d+$/.test(idB)
    if (numA && numB) {
      const diff = Number(idA) - Number(idB)
      if (diff !== 0) return Math.sign(diff)
    } else if (numA !== numB) {
      return numA ? -1 : 1
    } else if (idA !== idB) {
      return idA < idB ? -1 : 1
    }
  }
  return 0
}

function splitPre(version: string): [string, string | undefined] {
  const dash = version.indexOf('-')
  return dash === -1 ? [version, undefined] : [version.slice(0, dash), version.slice(dash + 1)]
}
