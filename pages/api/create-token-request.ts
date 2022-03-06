import Ably from "ably/promises"
import type { NextApiRequest, NextApiResponse } from 'next'
import { ablyApiKey } from "../../common-api"

function auth (userId: unknown): asserts userId is string {
  if (typeof userId !== 'string') {
    throw new Error(`Bad userId ${userId}`)
  }
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.clientId
  auth(userId)
  const ablyClient = new Ably.Realtime(ablyApiKey)
  const tokenRequestData = await ablyClient.auth.createTokenRequest({ clientId: userId })
  res.status(200).json(tokenRequestData)
}
