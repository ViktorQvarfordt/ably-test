import type { NextApiRequest, NextApiResponse } from 'next'
import { getDoc } from './datastore'
import { fromUint8Array } from 'js-base64'
import { asString } from '../../common'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const doc = await getDoc(asString(req.query.yDocId))
  if (!doc) return res.json(null)
  res.json({ stateAsUpdate: fromUint8Array(doc.stateAsUpdate), timestamp: doc.timestamp })
}
