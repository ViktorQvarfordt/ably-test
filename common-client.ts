import Ably from "ably/promises"
// @ts-ignore
import vcdiffPlugin from '@ably/vcdiff-decoder'

export const getAblyClient = (userId: string) => {
  // Question: How to best do authentication with userId per connection?
  return new Ably.Realtime.Promise({
    authUrl: '/api/create-token-request',
    clientId: userId,
    // @ts-ignore
    // plugins: {
    //   vcdiff: vcdiffPlugin
    // }
  })
}

// Mock implementation
const getUserId = (): string => {
  const userId = window.sessionStorage.getItem('userId') ?? window.localStorage.getItem('userId')
  if (typeof userId !== 'string') {
    throw new Error('Invalid user id')
  }
  return userId
}

// Should probaly be in a context
export const ablyClient = getAblyClient(getUserId())
export const userId = getUserId()
