import type { Types } from "ably";
import { useEffect, useState } from "react";
import { getYDocAblyRealtimeClient, userId, yDocId } from "../common-client";

export function useAblyChannel(
  channelName: string,
  callbackOnMessage?: (msg: Types.Message) => void
): [
  Types.RealtimePromise | undefined,
  Types.RealtimeChannelPromise | undefined
] {
  const [client, setClient] = useState<Types.RealtimePromise>();
  const [channel, setChannel] = useState<Types.RealtimeChannelPromise>();

  useEffect(() => {
    console.log(`useAblyChannel ${channelName}`);

    const newClient = getYDocAblyRealtimeClient(userId, yDocId);
    const newChannel = newClient.channels.get(channelName);

    setClient(newClient);
    setChannel(newChannel);

    if (!callbackOnMessage) return;

    newChannel.subscribe(callbackOnMessage);

    return () => {
      newClient.close();
    };
  }, [channelName, callbackOnMessage]);

  return [client, channel];
}
