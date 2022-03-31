import type { NextApiRequest, NextApiResponse } from 'next'
import { channelName } from '../../../common'
import { ablyRealtimeClient, auth } from "../../../common-api"

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  console.log('auth/ably', JSON.stringify(req.body))
  
  const userId = req.body.userId
  const yDocId = req.body.yDocId
  
  auth(userId)
  
  const tokenRequestData = await ablyRealtimeClient.auth.createTokenRequest({
    clientId: userId,
    capability: {
      [`yjs-updates:${yDocId}`]: ['subscribe'],
      [channelName]: ['subscribe', 'publish', 'presence', 'history']
    }
  })
  res.status(200).json(tokenRequestData)
}
