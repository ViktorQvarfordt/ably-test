const getAblyApiKey = (): string => {
  const key = process.env.ABLY_API_KEY
  if (key === undefined || key === '') {
    throw new Error('Expected env variable ABLY_API_KEY to be set')
  }
  return key
}

export const ablyApiKey = getAblyApiKey()
