import { toUint8Array } from 'js-base64'
import type { NextApiRequest, NextApiResponse } from 'next'
import { delYDocVersion, getYDocVersions, setYDocVersion } from './datastore'
import * as Y from 'yjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // console.log(req.headers, JSON.stringify(req.body, null, 2))

  const updates: Uint8Array[] = req.body.items.flatMap(
    item => item.data.messages.map(msg => toUint8Array(msg.data))
  )
  console.log(`\nreceived ${updates.length} updates`)

  const timestamp = req.body.items[req.body.items.length - 1].timestamp
  const yDocId = '123' // TODO

  const versions = await getYDocVersions(yDocId)
  const keys = Object.keys(versions)
  const yDocStateAsUpdates = keys.map(key => versions[key])

  console.log('keys:', keys)

  const yDoc = new Y.Doc()

  yDoc.transact(() => {
    yDocStateAsUpdates.forEach(update => Y.applyUpdateV2(yDoc, update))
    updates.forEach(update => Y.applyUpdateV2(yDoc, update))
  })

  console.log(`storing ${yDocId} version ${timestamp}`)
  setYDocVersion(yDocId, timestamp, Y.encodeStateAsUpdateV2(yDoc))

  console.log(`deleting ${yDocId} vesrsions ${keys.join(', ')}`)
  keys.forEach(key => delYDocVersion(yDocId, key))

  res.status(200).end()
}
