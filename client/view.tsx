import { useCallback, useEffect, useState } from "react";
import { useAblyChannel, usePusherChannel } from "./use-channel";
import { userId } from "../common-client";
import { ablyChannelName, pusherChannelName, pusherPresenceChannelName } from "../common";
import { useAblyPresence, usePusherPresence } from "./use-presence";

export const View = (): JSX.Element => {
  const [state, setState] = useState()

  const getNewState = async () => setState(await (await fetch(`/api/get-state`)).json())

  const onAblyMessage = useCallback(async message => {
    console.log('Received Ably channel message', message)
    getNewState()
  }, [])

  const onPusherMessage = useCallback(async message => {
    console.log('Received Pusher channel message', message)
    getNewState()
  }, [])

  useEffect(() => {
    void getNewState()
  }, [])

  const ablyChannel = useAblyChannel(ablyChannelName, onAblyMessage)
  const [ablyPresence, setLocalAblyPresence] = useAblyPresence(ablyChannel)

  usePusherChannel(pusherChannelName, onPusherMessage)
  const [pusherPresence, setLocalPusherPresence] = usePusherPresence(pusherPresenceChannelName)

  useEffect(() => {
    setLocalAblyPresence({
      text: 'Initial presence',
      clientTimestamp: new Date().toISOString()
    })
  }, [setLocalAblyPresence])

  return <div>
    <p>Ably presence:</p>
    <pre>{JSON.stringify(ablyPresence, null, 2)}</pre>

    <p>Pusher presence:</p>
    <pre>{JSON.stringify(pusherPresence, null, 2)}</pre>

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
      setLocalPusherPresence({
        text: 'Updated presence',
        clientTimestamp: new Date().toISOString()
      })
    }}>Update Pusher presence</button>

    {/* Question: Is this good or should actions be sent over a channel? */}
    <button onClick={() => {
      void fetch(`/api/update-state?userId=${userId}`)
    }}>Request state update</button>
  </div>
}
