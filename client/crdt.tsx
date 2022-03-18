import { useCallback, useEffect, useState } from "react";
import { useAblyChannel } from "./use-channel";
import { userId } from "../common-client";
import { channelName, crdtMessageName } from "../common";
import { useAblyPresence } from "./use-presence";
import * as Y from 'yjs'
import { toUint8Array } from 'js-base64'
import { Types } from 'ably'

const useObserveDeepRerender = (yMap: Y.Map<unknown>) => {
  const [, _forceRerender] = useState(Date.now())

  useEffect(() => {
    const handler = (): void => _forceRerender(Date.now())

    yMap.observeDeep(handler)

    return () => yMap.unobserveDeep(handler)
  }, [yMap])
}

const useAblyProvider = (yDoc: Y.Doc) => {
  const [origin] = useState<string>(() => `useAblyProvider:${Math.random()}`)

  const onAblyMessage = useCallback(async message => {
    if (message.name === crdtMessageName) {
      console.log('Received Ably CRDT message', message)
      const update = new Uint8Array(message.data)
      Y.applyUpdateV2(yDoc, update, origin)
    }
  }, [origin, yDoc])

  const ablyChannel = useAblyChannel(channelName, onAblyMessage)

  useEffect(() => {
    yDoc.on('updateV2', (update, updateOrigin) => {
      if (updateOrigin !== origin) {
        ablyChannel.publish(crdtMessageName, update)
      }
    })
  }, [ablyChannel, origin, yDoc])
}

export const View = (): JSX.Element => {
  const [yDoc] = useState(new Y.Doc())
  useObserveDeepRerender(yDoc.getMap())

  useEffect(() => {
    const getInitialState = async () => {
      const { stateAsUpdate } = await (await fetch(`/api/get-crdt`)).json()
      Y.applyUpdateV2(yDoc, toUint8Array(stateAsUpdate))
    }
    void getInitialState()
  }, [yDoc])

  const ablyChannel = useAblyChannel(channelName)
  const [ablyPresence, setLocalAblyPresence] = useAblyPresence(ablyChannel)

  useAblyProvider(yDoc)

  useEffect(() => {
    setLocalAblyPresence({
      text: 'Initial presence',
      clientTimestamp: new Date().toISOString()
    })
  }, [setLocalAblyPresence])

  return <div>
    <p>Ably presence:</p>
    <pre>{JSON.stringify(ablyPresence, null, 2)}</pre>

    <p>CRDT:</p>
    <pre>{JSON.stringify(yDoc.getMap().toJSON(), null, 2)}</pre>

    <hr />

    <button onClick={() => {
      yDoc.getMap().set('key', new Date().toISOString())
    }}>
      Mutate CRDT
    </button>

  </div>
}
