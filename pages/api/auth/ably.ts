import type { NextApiRequest, NextApiResponse } from 'next'
import { ablyClient, auth } from "../../../common-api"

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.clientId
  console.log('auth/ably', req.query, req.body)
  auth(userId)
  const tokenRequestData = await ablyClient.auth.createTokenRequest({ clientId: userId })
  res.status(200).json(tokenRequestData)
}
