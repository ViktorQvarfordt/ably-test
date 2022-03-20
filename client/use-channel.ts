import type { Types } from "ably"
import { useEffect, useState } from 'react'
import { ablyRealtimeClient } from "../common-client"

export function useAblyChannel(channelName: string, callbackOnMessage?: (msg: Types.Message) => void): Types.RealtimeChannelPromise {
  const [channel] = useState(ablyRealtimeClient.channels.get(channelName))

  useEffect(() => {
    console.log(`useAblyChannel ${channelName}`)
    
    if (!callbackOnMessage) return

    channel.subscribe(callbackOnMessage)
    return () => { channel.unsubscribe(callbackOnMessage) }
  }, [channelName, channel, callbackOnMessage])

  return channel
}
