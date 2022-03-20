import type { NextApiRequest, NextApiResponse } from 'next'
import { channelName } from '../../../common'
import { ablyRestClient, auth } from "../../../common-api"

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.clientId
  console.log('auth/ably', req.query, req.body)
  auth(userId)
  const tokenRequestData = await ablyRestClient.auth.createTokenRequest({
    clientId: userId,
    capability: {
      [channelName]: ['subscribe', 'publish', 'presence', 'history']
    }
  })
  res.status(200).json(tokenRequestData)
}
