import Ably from 'ably/promises'

// Mock implementation
const getUserId = (): string => {
  const userId = window.sessionStorage.getItem('userId') ?? window.localStorage.getItem('userId')
  if (typeof userId !== 'string') {
    throw new Error('Invalid user id')
  }
  return userId
}

// Question: How to best do authentication with userId per connection?
const getAblyRealtimeClient = (userId: string) => new Ably.Realtime.Promise({
  echoMessages: false,
  useBinaryProtocol: true, // Enable in production but not in development
  authUrl: '/api/auth/ably',
  clientId: userId,
})

// Should probaly be in a context
export const userId = getUserId()
export const ablyRealtimeClient = getAblyRealtimeClient(userId)
