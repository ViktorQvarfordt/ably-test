export const channelName = 'channel'
export const jsonMessageName = 'update-json'
export const yjsUpdateMessageName = 'update-yjs'

export function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== 'string') throw new Error(`Expected ${val} to be string`)
}

export function asString(val: unknown): string {
  assertIsString(val)
  return val
}
