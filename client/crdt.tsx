import { useCallback, useEffect, useState } from "react";
import { useAblyChannel } from "./use-channel";
import { ablyRealtimeClient, userId, yDocId } from "../common-client";
import { channelName, yjsUpdateMessageName } from "../common";
import { useAblyPresence } from "./use-presence";
import * as Y from 'yjs'
import { toUint8Array } from 'js-base64'

const useObserveDeepRerender = (yMap: Y.Map<unknown>) => {
  const [, _forceRerender] = useState(Date.now())

  useEffect(() => {
    const handler = (): void => _forceRerender(Date.now())

    yMap.observeDeep(handler)

    return () => yMap.unobserveDeep(handler)
  }, [yMap])
}

const useYjsAblyProvider = (httpEndpoint: string): Y.Doc | undefined => {
  const [origin] = useState<string>(() => `yjsAblyProvider:${Math.random()}`)
  const [yDoc] = useState<Y.Doc>(new Y.Doc())
  const [loadedTimestamp, setLoadedTimestamp] = useState()

  useEffect(() => {
    const getInitialState = async () => {
      const doc = await (await fetch(httpEndpoint)).json()
      if (doc === null) {
        const msg = `YDoc ${yDocId} does not exist`
        console.log(msg)
        alert(msg)
        return
      }
      window.yDoc = yDoc
      Y.applyUpdateV2(yDoc, toUint8Array(doc.stateAsUpdate), origin)
      setLoadedTimestamp(doc.timestamp)
    }
    void getInitialState()
  }, [httpEndpoint, origin, yDoc])

  const onAblyMessage = useCallback(async message => {
    if (message.name === yjsUpdateMessageName) {
      console.log('Received Yjs update over Ably channel:', message)
      Y.applyUpdateV2(yDoc, new Uint8Array(message.data), origin)
    }
  }, [origin, yDoc])

  useEffect(() => {
    ablyRealtimeClient.connection.on(({ current }) => {
      console.log(`Online: ${current === 'connected'}`)
    })  
  }, [])

  const ablyChannel = useAblyChannel(channelName, onAblyMessage)

  useEffect(() => {
    if (loadedTimestamp === undefined) return

    ablyChannel.history().then(async paginatedResult => {
      console.log(paginatedResult.items)
      if (paginatedResult.items.length === 0) {
        console.log('No items in history')
        return
      }

      let current = paginatedResult
      let numHistoryItems = 0
      let lastItem = paginatedResult.items[0]

      whileLoop: while (current) {
        for (const item of current.items) {
          if (item.timestamp <= loadedTimestamp) {
            console.log(`Successfully applied ${numHistoryItems} updates from history`)
            break whileLoop
          }
          Y.applyUpdateV2(yDoc, new Uint8Array(item.data), origin)
          numHistoryItems += 1
          lastItem = item
        }
        current = await current.next()
      }

      const historyAgeS = (Date.now() - lastItem.timestamp) / 1000
      if (historyAgeS > 10) {
        throw new Error(`Appplied ${numHistoryItems} updates from history going back in time ${historyAgeS} seconds. This indicates that the document is not being properly persisted. The last received persisted document has timestmap ${loadedTimestamp}.`)
      }
    })
  }, [ablyChannel, loadedTimestamp, origin, yDoc])

  useEffect(() => {
    const handler = (update: any, updateOrigin: any) => {
      if (updateOrigin !== origin) {
        ablyChannel.publish(yjsUpdateMessageName, update)
      }
    }

    yDoc.on('updateV2', handler)
    return () => yDoc.off('updateV2', handler)
  }, [ablyChannel, origin, yDoc])

  return loadedTimestamp === undefined ? undefined : yDoc
}

const ReactiveYDoc = ({ yDoc }: { yDoc: Y.Doc }): JSX.Element => {
  useObserveDeepRerender(yDoc.getMap())

  const data = yDoc.getMap().toJSON()

  return <>
    <div>lastUpdateBy: {data['lastUpdateBy']}</div>
    <div>lastUpdateTimestamp: {data['lastUpdateTimestamp']}</div>
    <div>array: {data['array'].join(', ')}</div>
  </>
}

export const View = (): JSX.Element => {
  const [counter, setCounter] = useState(0)

  const yDoc = useYjsAblyProvider(`/api/get-ydoc?yDocId=${yDocId}`)

  const [ablyPresence, setLocalAblyPresence] = useAblyPresence(useAblyChannel(channelName))

  useEffect(() => {
    setLocalAblyPresence({
      text: 'Initial presence',
      clientTimestamp: new Date().toISOString()
    })
  }, [setLocalAblyPresence])

  return (
    <div>
      <p>Ably presence:</p>
      <pre>{JSON.stringify(ablyPresence, null, 2)}</pre>

      <p>CRDT:</p>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{yDoc === undefined ? 'Loading...' : <ReactiveYDoc yDoc={yDoc} />}</pre>

      <hr />

      <button onClick={() => {
        if (yDoc === undefined) throw new Error('yDoc not initialized')
        yDoc.transact(() => {
          const yMap = yDoc.getMap()
          yMap.set('lastUpdateBy', userId)
          yMap.set('lastUpdateTimestamp', new Date().toISOString())
          ;(yMap.get('array') as Y.Array<unknown>).push([counter])
        })

        setCounter(counter + 1)
      }}>
        Mutate CRDT
      </button>

      <button onClick={() => {
          void fetch(`/api/init-ydoc?yDocId=${yDocId}`)
      }}>
        Initialize CRDT
      </button>

    </div>
  )
}
