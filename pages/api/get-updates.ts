import type { NextApiRequest, NextApiResponse } from 'next'
import { getUpdatesSimple } from './datastore'
import { asString } from '../../common'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const updates = await getUpdatesSimple(asString(req.query.yDocId))
  res.json({ updates })
}
