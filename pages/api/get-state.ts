import type { NextApiRequest, NextApiResponse } from 'next'
import { getState } from './datastore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json(getState())
}
