import { useCallback, useEffect, useState } from "react"
import type Ably from 'ably'

export const useAblyPresence = (channel: Ably.Types.RealtimeChannelPromise | undefined): [Ably.Types.PresenceMessage[], (val: any) => void] => {
  const [presence, setPresence] = useState<Ably.Types.PresenceMessage[]>([])

  const setLocalPresence = useCallback((val: any) => {
    channel?.presence.update(val)
  }, [channel?.presence])

  useEffect(() => {
    if (channel === undefined) return

    const handler = async () => {
      setPresence(await channel.presence.get())
    }

    const actions: Ably.Types.PresenceAction[] = ['enter', 'leave', 'update']

    channel.presence.subscribe(actions, handler)

    return () => channel.presence.unsubscribe(actions, handler)
  }, [channel])

  return [presence, setLocalPresence]
}
