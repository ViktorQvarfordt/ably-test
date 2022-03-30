import type { NextApiRequest, NextApiResponse } from 'next'
import { channelName } from '../../../common'
import { ablyRestClient, auth } from "../../../common-api"

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  console.log('auth/ably', req.body)
  
  const userId = req.body.userId
  const yDocId = req.body.yDocId
  
  auth(userId)
  
  const tokenRequestData = await ablyRestClient.auth.createTokenRequest({
    clientId: userId,
    capability: {
      [`${yDocId}:sub`]: ['subscribe'],
      [`${yDocId}:pub`]: ['publish'],
      [channelName]: ['subscribe', 'publish', 'presence', 'history']
    }
  })
  res.status(200).json(tokenRequestData)
}
