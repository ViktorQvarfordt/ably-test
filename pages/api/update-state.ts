import type { NextApiRequest, NextApiResponse } from 'next'
import Ably from "ably/promises"
import { ablyApiKey } from '../../common-api'
import { channelName, messageName } from '../../common'
import { setState } from './datastore'

const ablyClient = new Ably.Realtime(ablyApiKey)
const channel = ablyClient.channels.get(channelName)

let state = null

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  setState({
    lastUpdateUserId: req.query.userId ?? null,
    timestamp: new Date().toISOString(),
  })
  channel.publish(messageName, 'There is a new state!')
  res.end()
}
