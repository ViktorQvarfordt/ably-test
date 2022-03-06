import { useCallback, useEffect, useState } from "react";
import { useChannel } from "./use-channel";
import type Ably from 'ably'
import { userId } from "../common-client";
import { channelName } from "../common";

const usePresence = (channel: Ably.Types.RealtimeChannelPromise): [Ably.Types.PresenceMessage[], (val: any) => void] => {
  const [presence, setPresence] = useState<Ably.Types.PresenceMessage[]>([])

  const setLocalPresence = useCallback((val: any) => {
    channel.presence.update(val)
  }, [channel.presence])

  useEffect(() => {
    // Question: On enter this is called once for each present user. How to mitigate?
    const handler = async (msg: Ably.Types.PresenceMessage) => {
      const presenceMessages = await channel.presence.get()
      console.log('Received presence update', msg)
      setPresence(presenceMessages)
    }

    channel.presence.subscribe(handler)

    return () => channel.presence.unsubscribe(handler)
  }, [channel])

  return [presence, setLocalPresence]
}

export const View = (): JSX.Element => {
  const onMessage = useCallback((message) => {
    console.log('Received channel message', message)
  }, [])
  
  const [channel, state] = useChannel(channelName, onMessage)

  const [presence, setLocalPresence] = usePresence(channel)

  useEffect(() => {
    setLocalPresence({
      text: 'Initial presence',
      clientTimestamp: new Date().toISOString()
    })
  }, [setLocalPresence])

  return <div>
    <p>Presence:</p>
    <pre>{JSON.stringify(presence, null, 2)}</pre>

    <p>State:</p>
    <pre>{JSON.stringify(state, null, 2)}</pre>

    <hr />

    <button onClick={() => {
      setLocalPresence({
        text: 'Updated presence',
        clientTimestamp: new Date().toISOString()
      })
    }}>Update my presence</button>

    {/* Question: Is this good or should actions be sent over a channel? */}
    <button onClick={() => {
      void fetch(`/api/update-state?userId=${userId}`)
    }}>Request state update</button>
  </div>
}
