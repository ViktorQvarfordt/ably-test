import type { NextApiRequest, NextApiResponse } from 'next'
import { assertIsString } from '../../common'
import { ablyRestClient } from '../../common-api'
import { saveUpdateSimple } from './datastore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const yDocId = req.query.yDocId
  const update = req.body.update
  
  assertIsString(yDocId)
  assertIsString(update)

  saveUpdateSimple(yDocId, update)

  try {
    await ablyRestClient.channels.get(`yjs-updates:${yDocId}`).publish('yjs-update', { ...req.body, serverTimestamp: Date.now() })
  } catch (err) {
    console.log(err)
  }
  
  res.end()
}
