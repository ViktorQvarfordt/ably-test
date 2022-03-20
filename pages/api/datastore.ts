import * as Y from 'yjs'
import fs from 'fs'
import { fromUint8Array, toUint8Array } from 'js-base64'

// JSON

let jsonState: any = {}

export const setJsonState = (newState: any) => { jsonState = newState }
export const getJsonState = () => jsonState

// Yjs

const filename = 'data.json'

export const getStore = (): any => JSON.parse(fs.readFileSync(filename, 'utf8'))

const setStore = (store: any): void => fs.writeFileSync(filename, JSON.stringify(store, null, 2))

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const getYDocVersions = async (yDocId: string): Promise<Record<string, Uint8Array>> => {
  await delay(500 + Math.random() * 1000)

  const versions = getStore()[yDocId] ?? {}
  for (const versionId in versions) {
    versions[versionId] = toUint8Array(versions[versionId])
  }
  return versions
}

export const setYDocVersion = async (yDocId: string, versionId: number, version: Uint8Array) => {
  await delay(1500 + Math.random() * 1000)

  const store = getStore()
  
  if (store[yDocId] === undefined) {
    store[yDocId] = {}
  }

  store[yDocId][versionId] = fromUint8Array(version)

  setStore(store)
}

export const delYDocVersion = async (yDocId: string, versionId: string) => {
  await delay(1500 + Math.random() * 1000)

  const store = getStore()
  
  if (store[yDocId] === undefined) return

  delete store[yDocId][versionId]

  setStore(store)
}

export const getDoc = async (yDocId: string): Promise<undefined | { stateAsUpdate: Uint8Array, timestamp: number }> => {
  const versions = await getYDocVersions(yDocId)
  if (versions === undefined) return undefined

  const keys = Object.keys(versions)
  if (keys.length === 0) return undefined

  if (keys.length === 1) return { stateAsUpdate: versions[keys[0]], timestamp: parseInt(keys[0]) }

  const intKeys = keys.map(key => parseInt(key))
  console.log(`mitigating divergence of ${Math.max(...intKeys) - Math.min(...intKeys)}ms with diff`, Y.diffUpdateV2(versions[keys[0]], Y.encodeStateVectorFromUpdateV2(versions[keys[1]])))

  const yDoc = new Y.Doc()
  yDoc.transact(() => keys.forEach(key => Y.applyUpdateV2(yDoc, versions[key])))
  return { stateAsUpdate: Y.encodeStateAsUpdateV2(yDoc), timestamp: Math.max(...keys.map(key => parseInt(key))) }
}
