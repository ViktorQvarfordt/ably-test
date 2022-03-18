import Ably from "ably/promises"

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

export const ablyRestClient = new Ably.Rest({ key: getEnvVar('ABLY_API_KEY') })

