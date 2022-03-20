import type { NextApiRequest, NextApiResponse } from 'next'
import { getStore } from './datastore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json(getStore())
}
