import { toUint8Array } from 'js-base64'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getYDoc } from './datastore'
import * as Y from 'yjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(JSON.stringify(req.body, null, 2))
  const updates = req.body.items.flatMap(
    item => item.data.messages.map(msg => toUint8Array(msg.data))
  )
  console.log(`got ${updates.length} updates`)
  Y.applyUpdateV2(getYDoc(), Y.mergeUpdatesV2(updates))

  res.status(200).end()
}
