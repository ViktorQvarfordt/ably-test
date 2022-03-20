import type { NextApiRequest, NextApiResponse } from 'next'
import { setYDocVersion } from './datastore'
import { fromUint8Array } from 'js-base64'
import { asString } from '../../common'
import * as Y from 'yjs'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const yDoc = new Y.Doc()
  yDoc.transact(() => {
    const yMap = yDoc.getMap()
    yMap.set('lastUpdateBy', 'server')
    yMap.set('lastUpdateTimestamp', new Date().toISOString())
    yMap.set('array', new Y.Array())
  })

  const stateAsUpdate = Y.encodeStateAsUpdateV2(yDoc)

  setYDocVersion(asString(req.query.yDocId), Date.now(), stateAsUpdate)

  res.json({ stateAsUpdate: fromUint8Array(stateAsUpdate) })
}
