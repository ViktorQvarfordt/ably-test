import type { NextApiRequest, NextApiResponse } from 'next'
import { getCrdt } from './datastore'
import * as Y from 'yjs'
import { fromUint8Array } from 'js-base64'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json({ stateAsUpdate: fromUint8Array(Y.encodeStateAsUpdateV2(getCrdt())) })
}
