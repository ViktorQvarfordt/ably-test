import type { NextApiRequest, NextApiResponse } from 'next'
import { getJsonState } from './datastore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json(getJsonState())
}
