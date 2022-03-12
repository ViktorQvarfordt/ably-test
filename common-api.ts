import Ably from "ably/promises"
import Pusher from "pusher"

const getEnvVar = (name: string): string => {
  const envVar = process.env[name]
  
  if (envVar === undefined || envVar === '') {
    throw new Error(`Expected env variable ${name} to be set`)
  }
  
  return envVar
}

export function auth (userId: unknown): asserts userId is string {
  // Mock
  if (typeof userId !== 'string') {
    throw new Error(`Bad userId ${userId}`)
  }
}

export const ablyClient = new Ably.Realtime(getEnvVar('ABLY_API_KEY'))

export const pusherClient = new Pusher({
  appId: '1359829',
  key: getEnvVar('PUSHER_API_KEY'),
  secret: getEnvVar('PUSHER_API_SECRET'),
  cluster: 'eu',
  useTLS: true,
})
