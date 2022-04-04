import { useCallback, useEffect, useState } from "react";
import { useAblyChannel } from "./use-channel";
import { userId } from "../common-client";
import { channelName, jsonMessageName } from "../common";
import { useAblyPresence } from "./use-presence";
import _ from "lodash";

export const View = (): JSX.Element => {
  const [state, setState] = useState();

  const onAblyMessage = useCallback(async (message) => {
    if (message.name === jsonMessageName) {
      console.log("Received Ably JSON message", message);
      setState(message.data);
    }
  }, []);

  useEffect(() => {
    const getInitialState = async () =>
      setState(await (await fetch(`/api/get-state`)).json());
    void getInitialState();
  }, []);

  const [client, ablyChannel] = useAblyChannel(channelName, onAblyMessage);

  const [client2, ablyChannel2] = useAblyChannel(channelName, onAblyMessage);
  const [ablyPresence, setLocalAblyPresence] = useAblyPresence(ablyChannel2);

  useEffect(() => {
    setLocalAblyPresence({
      text: "Initial presence",
      clientTimestamp: new Date().toISOString(),
    });
  }, [setLocalAblyPresence]);

  // useEffect(() => {
  //   const delay = 200
    
  //   const handler = _.debounce(
  //     (e: MouseEvent) => {
  //       console.log([e.clientX, e.clientY]);
  //       setLocalAblyPresence({ mouse: [e.clientX, e.clientY] })
  //     },
  //     delay,
  //     {
  //       leading: false,
  //       trailing: true,
  //       maxWait: delay,
  //     }
  //   );

  //   window.addEventListener("mousemove", handler);

  //   return () => window.removeEventListener("mousemove", handler);
  // }, [setLocalAblyPresence]);

  return (
    <div>
      <p>Ably presence:</p>
      <pre>{JSON.stringify(ablyPresence.map(p => _.pick(p, ['clientId', 'connectionId', 'data'])), null, 2)}</pre>

      {/* {ablyPresence.map(pres => pres.data.mouse && <div key={pres.connectionId} style={{
        width: '10px',
        height: '10px',
        backgroundColor: 'red',
        position: 'fixed',
        left: pres.data.mouse[0],
        top: pres.data.mouse[1],
      }} />)} */}

      <p>State:</p>
      <pre>{JSON.stringify(state, null, 2)}</pre>

      <hr />

      <button
        onClick={() => {
          setLocalAblyPresence({
            text: "Updated presence",
            clientTimestamp: new Date().toISOString(),
          });
        }}
      >
        Update Ably presence
      </button>

      <button
        onClick={() => {
          void fetch(`/api/update-json?userId=${userId}`);
        }}
      >
        Request state update
      </button>

      <button
        onClick={() => {
          console.log(client2, ablyChannel2)
        }}
      >
        Log ablyChannel2
      </button>

      <button
        onClick={() => {
          ablyChannel?.publish("hello", "data1");
        }}
      >
        Broadcast 1
      </button>

      <button
        onClick={() => {
          ablyChannel2?.publish("hello", "data2");
        }}
      >
        Broadcast 2
      </button>
    </div>
  );
};
