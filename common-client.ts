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

export const getYDocAblyRealtimeClient = (userId: string, yDocId: string) => new Ably.Realtime.Promise({
  echoMessages: false,
  useBinaryProtocol: process.env.NODE_ENV === 'production',
  authMethod: 'POST',
  authUrl: '/api/auth/ably',
  authParams: {
    userId,
    yDocId
  }
})

// Should probaly be in a context
export const userId = getUserId()
export const yDocId = getYDocId()
export const ablyRealtimeClient = getYDocAblyRealtimeClient(userId, '123')
