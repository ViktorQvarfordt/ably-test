import Ably from 'ably/promises'
import Pusher from 'pusher-js'
import { pusherApiKey } from './common'

// Mock implementation
const getUserId = (): string => {
  const userId = window.sessionStorage.getItem('userId') ?? window.localStorage.getItem('userId')
  if (typeof userId !== 'string') {
    throw new Error('Invalid user id')
  }
  return userId
}

// Question: How to best do authentication with userId per connection?
const getAblyClient = (userId: string) => new Ably.Realtime.Promise({
  authUrl: '/api/auth/ably',
  clientId: userId,
})

const getPusherClient = (userId: string) => new Pusher(pusherApiKey, {
  cluster: 'eu',
  auth: {
    params: { userId }
  },
  authEndpoint: '/api/auth/pusher'
})

// Should probaly be in a context
export const userId = getUserId()
export const ablyClient = getAblyClient(userId)
export const pusherClient = getPusherClient(userId)
