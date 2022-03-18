import { useCallback, useEffect, useState } from "react";
import { useAblyChannel } from "./use-channel";
import { userId } from "../common-client";
import { channelName, jsonMessageName } from "../common";
import { useAblyPresence } from "./use-presence";

export const View = (): JSX.Element => {
  const [state, setState] = useState()

  const onAblyMessage = useCallback(async message => {
    if (message.name === jsonMessageName) {
      console.log('Received Ably JSON message', message)
      setState(message.data)
    }
  }, [])

  useEffect(() => {
    const getInitialState = async () => setState(await (await fetch(`/api/get-state`)).json())
    void getInitialState()
  }, [])

  const ablyChannel = useAblyChannel(channelName, onAblyMessage)
  const [ablyPresence, setLocalAblyPresence] = useAblyPresence(ablyChannel)

  useEffect(() => {
    setLocalAblyPresence({
      text: 'Initial presence',
      clientTimestamp: new Date().toISOString()
    })
  }, [setLocalAblyPresence])

  return <div>
    <p>Ably presence:</p>
    <pre>{JSON.stringify(ablyPresence, null, 2)}</pre>

    <p>State:</p>
    <pre>{JSON.stringify(state, null, 2)}</pre>

    <hr />

    <button onClick={() => {
      setLocalAblyPresence({
        text: 'Updated presence',
        clientTimestamp: new Date().toISOString()
      })
    }}>Update Ably presence</button>

    <button onClick={() => {
      void fetch(`/api/update-json?userId=${userId}`)
    }}>Request state update</button>
  </div>
}
