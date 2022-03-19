import * as Y from 'yjs'

let state: any = {}
let yDoc: Y.Doc = new Y.Doc()

export const setState = (newState: any) => { state = newState }
export const getState = () => state

export const getYDoc = () => yDoc
