import Ably from 'ably/promises'

// Mock implementation
const getUserId = (): string => {
  const userId = new URLSearchParams(window.location.search).get('userId')
  if (typeof userId !== 'string') {
    throw new Error('Invalid userId')
  }
  return userId
}

const getYDocId = (): string => {
  const yDocId = new URLSearchParams(window.location.search).get('yDocId')
  if (typeof yDocId !== 'string') {
    throw new Error('Missing query parameter yDocId')
  }
  return yDocId
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
export const yDocId = getYDocId()
export const ablyRealtimeClient = getAblyRealtimeClient(userId)
