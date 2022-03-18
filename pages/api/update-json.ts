import type { NextApiRequest, NextApiResponse } from 'next'
import { channelName, jsonMessageName } from '../../common'
import { ablyRestClient } from '../../common-api'
import { setState } from './datastore'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const newState = {
    lastUpdateUserId: req.query.userId ?? null,
    timestamp: new Date().toISOString(),
  }
  
  setState(newState)

  try {
    await ablyRestClient.channels.get(channelName).publish(jsonMessageName, newState)
  } catch (err) {
    console.log(err)
  }
  
  res.end()
}
