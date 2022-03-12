import { useCallback, useEffect, useState } from "react"
import type Ably from 'ably'
import { pusherClient } from "../common-client"
import { PresenceChannel } from "pusher-js"

export const useAblyPresence = (channel: Ably.Types.RealtimeChannelPromise): [Ably.Types.PresenceMessage[], (val: any) => void] => {
  const [presence, setPresence] = useState<Ably.Types.PresenceMessage[]>([])

  const setLocalPresence = useCallback((val: any) => {
    channel.presence.update(val)
  }, [channel.presence])

  useEffect(() => {
    const handler = async () => {
      setPresence(await channel.presence.get())
    }

    const actions: Ably.Types.PresenceAction[] = ['enter', 'leave', 'update']

    channel.presence.subscribe(actions, handler)

    return () => channel.presence.unsubscribe(actions, handler)
  }, [channel])

  return [presence, setLocalPresence]
}

export function usePusherPresence(channelName: string): any {
  const [channel] = useState(pusherClient.subscribe(channelName) as PresenceChannel)
  const [presence, setPresence] = useState<any>()

  const setLocalPresence = useCallback((val: any) => {
    // TODO
  }, [])

  useEffect(() => {
    console.log(`usePusherPresenceChannel ${channelName}`)
    const handler = (...args: any[]) => {
      console.log(channelName, args)
      setPresence(channel.members.members)
    }
    channel.bind_global(handler)

    return () => {
      channel.unbind_global(handler)
    }
  }, [channelName, channel])

  return [presence, setLocalPresence]
}
