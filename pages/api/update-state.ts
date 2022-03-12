import type { NextApiRequest, NextApiResponse } from 'next'
import { ablyChannelName, messageName, pusherChannelName } from '../../common'
import { ablyClient, pusherClient } from '../../common-api'
import { setState } from './datastore'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setState({
    lastUpdateUserId: req.query.userId ?? null,
    timestamp: new Date().toISOString(),
  })

  try {
    await ablyClient.channels.get(ablyChannelName).publish(messageName, null)
    await pusherClient.trigger(pusherChannelName, messageName, null)
  } catch (err) {
    console.log(err)
  }
  
  res.end()
}
