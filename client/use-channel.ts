import type { Types } from "ably"
import type { Channel } from "pusher-js"
import { useEffect, useState } from 'react'
import { messageName } from "../common"
import { ablyClient, pusherClient } from "../common-client"

export function useAblyChannel(channelName: string, callbackOnMessage: (msg: Types.Message) => void): Types.RealtimeChannelPromise {
  const [channel] = useState(ablyClient.channels.get(channelName))

  useEffect(() => {
    console.log(`useAblyChannel ${channelName}`)
    channel.subscribe(messageName, callbackOnMessage)
    return () => { channel.unsubscribe(messageName, callbackOnMessage) }
  }, [channelName, channel, callbackOnMessage])

  return channel
}


export function usePusherChannel(channelName: string, callbackOnMessage: (msg: Types.Message) => void): Channel {
  const [channel] = useState(pusherClient.subscribe(channelName))

  useEffect(() => {
    console.log(`usePusherChannel ${channelName}`)
    channel.bind(messageName, callbackOnMessage)
    return () => { channel.unbind(messageName, callbackOnMessage) }
  }, [channelName, channel, callbackOnMessage])

  return channel
}
