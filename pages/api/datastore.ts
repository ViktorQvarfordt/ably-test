import * as Y from 'yjs'

let state: any = {}
let crdt: Y.Doc = new Y.Doc()

export const setState = (newState: any) => { state = newState }
export const getState = () => state

export const setCrdt = (newCrdt: any) => { crdt = newCrdt }
export const getCrdt = () => crdt
