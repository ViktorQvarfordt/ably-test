import type { NextApiRequest, NextApiResponse } from 'next'
import { auth, pusherClient } from '../../../common-api'

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const userId = req.body.userId
  const socketId = req.body.socket_id
  const channel = req.body.channel_name
  console.log('/api/auth/pusher', req.query, req.body)
  auth(userId)
  const authRes = pusherClient.authenticate(socketId, channel, {
    user_id: `${userId}:${socketId}`,
    user_info: { timestamp: new Date().toISOString() },
  })
  res.send(authRes)
}
