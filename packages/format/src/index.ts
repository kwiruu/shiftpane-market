// The widget package format is the ShiftPane app's own (`@shiftpane/widget-sdk`, copied into
// vendor/shiftpane): the same schemas, bindings, sources and permission words the app uses.
// This package adds what only the marketplace has: its checks and the gallery's types.
export * from '@shiftpane/widget-sdk'
export { type Check, type CheckReport, type CheckResult, checks, packageLimits } from './checks.ts'
export type { Author, ReviewStatus, Version, Widget } from './types.ts'
