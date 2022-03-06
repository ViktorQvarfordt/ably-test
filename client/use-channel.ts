import type { Types } from "ably"
import { useEffect, useState } from 'react'
import { messageName } from "../common"
import { ablyClient } from "../common-client"

export function useChannel(
  channelName: string,
  callbackOnMessage: (msg: Types.Message) => void
  ): [channel: Types.RealtimeChannelPromise, lastMessageData: any] {
  const [channel] = useState(ablyClient.channels.get(channelName))
  
  // Question: Deltas don't work as intended.
  channel.setOptions({
    params: {
      delta: 'vcdiff'
    }
  })
  
  const [lastMessageData, setLastMessageData] = useState()

  useEffect(() => {
    console.log(`useChannel ${channelName}`)
    
    const handler = (msg: Types.Message) => {
      setLastMessageData(msg.data)
      callbackOnMessage(msg)
    }

    channel.subscribe(messageName, handler)

    return () => channel.unsubscribe(messageName, handler)
  }, [callbackOnMessage, channel, channelName])

  useEffect(() => {
    channel.history({ limit: 1 }).then(async values => {
      console.log(values.items)
      const data = values.items.length === 0 ? undefined : values.items[0].data
      setLastMessageData(data)
    })
  }, [channel])

  return [channel, lastMessageData]
}
