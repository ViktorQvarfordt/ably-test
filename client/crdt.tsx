import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAblyChannel } from "./use-channel";
import { getYDocAblyRealtimeClient, userId, yDocId } from "../common-client";
import { channelName, yjsUpdateMessageName } from "../common";
import { useAblyPresence } from "./use-presence";
import * as Y from "yjs";
import { fromUint8Array, toUint8Array } from "js-base64";
import { Observable } from "lib0/observable";
import { Types } from "ably";

const useObserveDeepRerender = (yMap: Y.Map<unknown>) => {
  const [, _forceRerender] = useState(Date.now());

  useEffect(() => {
    const handler = (): void => _forceRerender(Date.now());

    yMap.observeDeep(handler);

    return () => yMap.unobserveDeep(handler);
  }, [yMap]);
};

abstract class AbstractYjsProvider extends Observable<
  "yDocStatusChanged" | "connectionStatusChanged"
> {
  yDoc = new Y.Doc();
  yDocStatus: "loading" | "loaded" | "error" = "loading";
  connectionStatus: "offline" | "online" = "offline";

  constructor() {
    super();
  }

  init(): void {
    this.subscribe(this.handleRemoteUpdate.bind(this));
    this.yDoc.on("updateV2", this.handleLocalUpdate.bind(this));
    this.getInitialUpdates().then(this.handleInitialUpdates.bind(this));
  }

  private handleRemoteUpdate(update: Uint8Array): void {
    Y.applyUpdateV2(this.yDoc, update, this);
  }

  private handleLocalUpdate(update: Uint8Array, origin?: any): void {
    if (origin === this) return;

    try {
      this.publish(update);
    } catch (err) {
      this.yDocStatus = "error";
      this.emit("yDocStatusChanged", [this.yDocStatus]);
      alert("Failed to publish ydoc update");
      throw err;
    }
  }

  private handleInitialUpdates(updates: Set<Uint8Array>): void {
    updates.forEach((update) => Y.applyUpdateV2(this.yDoc, update, this));
    this.yDocStatus = "loaded";
    this.emit("yDocStatusChanged", [this.yDocStatus]);
  }

  abstract publish(update: Uint8Array): Promise<void>;

  abstract subscribe(handler: (update: Uint8Array) => void): void;

  abstract getInitialUpdates(): Promise<Set<Uint8Array>>;

  destroy() {
    this.yDoc.destroy();
    super.destroy();
  }
}

class AblyYjsProvider extends AbstractYjsProvider {
  private readonly client: Types.RealtimePromise;
  private readonly subCh: Types.RealtimeChannelPromise;

  constructor(public readonly yDocId: string) {
    super();

    this.client = getYDocAblyRealtimeClient(userId, yDocId);

    this.client.connection.on(({ current }) => {
      const newConnectionStatus =
        current === "connected" ? "online" : "offline";
      if (newConnectionStatus !== this.connectionStatus) {
        this.connectionStatus = newConnectionStatus;
        this.emit("connectionStatusChanged", [this.connectionStatus]);
      }
    });

    this.subCh = this.client.channels.get(`yjs-updates:${yDocId}`);
  }

  async publish(update: Uint8Array): Promise<void> {
    void fetch(`/api/update?yDocId=${yDocId}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        clientTimestamp: Date.now(),
        update: fromUint8Array(update),
      }),
    });
  }

  subscribe(handler: (update: Uint8Array) => void): void {
    this.subCh.subscribe((msg) => {
      if (msg.name === "yjs-update") {
        console.log(`Received update with full roundtrip time: ${Date.now() - msg.data.clientTimestamp} ms and from server ${Date.now() - msg.data.serverTimestamp} ms`)
        handler(toUint8Array(msg.data.update));
      }
    });
  }

  async getInitialUpdates(): Promise<Set<Uint8Array>> {
    const { updates } = await (
      await fetch(`/api/get-updates?yDocId=${this.yDocId}`)
    ).json();

    if (updates === null) {
      const msg = `YDoc ${yDocId} does not exist`;
      console.log(msg);
      alert(msg);
    } else {
      updates.forEach((update) =>
        Y.applyUpdateV2(this.yDoc, toUint8Array(update), this)
      );
    }

    return new Set();
  }

  destroy(): void {
    console.log("destroy");

    this.client.close();
    super.destroy();
  }
}

// const useYjsAblyProvider = (httpEndpoint: string): Y.Doc | undefined => {
//   const [origin] = useState<string>(() => `yjsAblyProvider:${Math.random()}`)
//   const [yDoc] = useState<Y.Doc>(new Y.Doc())
//   const [loadedTimestamp, setLoadedTimestamp] = useState()

//   useEffect(() => {
//     const getInitialState = async () => {
//       const resData = await (await fetch(httpEndpoint)).json()
//       if (resData === null) {
//         const msg = `YDoc ${yDocId} does not exist`
//         console.log(msg)
//         alert(msg)
//         return
//       }
//       window.yDoc = yDoc
//       Y.applyUpdateV2(yDoc, toUint8Array(resData.stateAsUpdate), origin)
//       setLoadedTimestamp(resData.timestamp)
//     }
//     void getInitialState()
//   }, [httpEndpoint, origin, yDoc])

//   const onAblyMessage = useCallback(async message => {
//     if (message.name === yjsUpdateMessageName) {
//       console.log('Received Yjs update over Ably channel:', message)
//       Y.applyUpdateV2(yDoc, new Uint8Array(message.data), origin)
//     }
//   }, [origin, yDoc])

//   useEffect(() => {
//     ablyRealtimeClient.connection.on(({ current }) => {
//       console.log(`Online: ${current === 'connected'}`)
//     })
//   }, [])

//   const ablyChannel = useAblyChannel(channelName, onAblyMessage)

//   useEffect(() => {
//     if (loadedTimestamp === undefined) return

//     ablyChannel.history().then(async paginatedResult => {
//       console.log(paginatedResult.items)
//       if (paginatedResult.items.length === 0) {
//         console.log('No items in history')
//         return
//       }

//       let current = paginatedResult
//       let numHistoryItems = 0
//       let lastItem = paginatedResult.items[0]

//       whileLoop: while (current) {
//         for (const item of current.items) {
//           // // TODO: Change this, timestamps are not monotonically increasing
//           if (item.timestamp <= loadedTimestamp) { // TODO: Can there be two updates with the same timestamp? YES!
//             console.log(`Successfully applied ${numHistoryItems} updates from history`)
//             break whileLoop
//           }
//           Y.applyUpdateV2(yDoc, new Uint8Array(item.data), origin)
//           numHistoryItems += 1
//           lastItem = item
//         }
//         current = await current.next()
//       }

//       const historyAgeS = (loadedTimestamp - lastItem.timestamp) / 1000
//       if (historyAgeS > 10) {
//         throw new Error(`Appplied ${numHistoryItems} updates from history going back in time ${historyAgeS} seconds. This indicates that the document is not being properly persisted. The last received persisted document has timestmap ${loadedTimestamp}.`)
//       }
//     })
//   }, [ablyChannel, loadedTimestamp, origin, yDoc])

//   useEffect(() => {
//     const handler = (update: any, updateOrigin: any) => {
//       if (updateOrigin !== origin) {
//         ablyChannel.publish(yjsUpdateMessageName, update)
//       }
//     }

//     yDoc.on('updateV2', handler)
//     return () => yDoc.off('updateV2', handler)
//   }, [ablyChannel, origin, yDoc])

//   return loadedTimestamp === undefined ? undefined : yDoc
// }

const ReactiveYDoc = ({ yDoc }: { yDoc: Y.Doc }): JSX.Element => {
  useObserveDeepRerender(yDoc.getMap());

  const data = yDoc.getMap().toJSON();

  return (
    <>
      <div>lastUpdateBy: {data["lastUpdateBy"]}</div>
      <div>lastUpdateTimestamp: {data["lastUpdateTimestamp"]}</div>
      <div>array: {data["array"]?.join(", ")}</div>
    </>
  );
};

const useAblyYjsProvider = (): AblyYjsProvider | undefined => {
  const [provider, setProvider] = useState<AblyYjsProvider>();
  const [, _forceRerender] = useState(Date.now());

  useEffect(() => {
    const newProvider = new AblyYjsProvider(yDocId);

    setProvider(newProvider);
    newProvider.on("connectionStatusChanged", (...args) =>
      console.log("connectionStatusChanged", args)
    );
    newProvider.on("yDocStatusChanged", (newStatus) => {
      console.log("yDocStatusChanged", newStatus);
      _forceRerender(Date.now());
    });

    newProvider.init();

    return () => {
      console.log("cleanup");
      newProvider.destroy();
      setProvider(undefined);
    };
  }, []);

  return provider;
};

export const View = (): JSX.Element => {
  const [counter, setCounter] = useState(0);

  // const yDoc = useYjsAblyProvider(`/api/get-ydoc?yDocId=${yDocId}`)

  const provider = useAblyYjsProvider();

  // const [ablyPresence, setLocalAblyPresence] = useAblyPresence(useAblyChannel(channelName))

  // useEffect(() => {
  //   setLocalAblyPresence({
  //     text: 'Initial presence',
  //     clientTimestamp: new Date().toISOString()
  //   })
  // }, [setLocalAblyPresence])

  if (provider?.yDocStatus !== "loaded") {
    return <>Loading ...</>;
  }

  return (
    <div>
      {/* <Comp /> */}

      {/* <p>Ably presence:</p>
      <pre>{JSON.stringify(ablyPresence, null, 2)}</pre> */}

      <p>YDoc data:</p>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        <ReactiveYDoc yDoc={provider.yDoc} />
      </pre>

      <hr />

      <button
        onClick={() => {
          if (provider.yDoc === undefined) throw new Error("yDoc not 3ialized");
          provider.yDoc.transact(() => {
            const yMap = provider.yDoc.getMap();
            yMap.set("lastUpdateBy", userId);
            yMap.set("lastUpdateTimestamp", new Date().toISOString());
            let yArray = yMap.get("array") as Y.Array<unknown>;
            if (!yArray) {
              yArray = new Y.Array();
              yMap.set("array", yArray);
            }
            yArray.push([counter]);
          });

          setCounter(counter + 1);
        }}
      >
        Mutate YDoc
      </button>

      {/* <button onClick={() => {
          void fetch(`/api/init-ydoc?yDocId=${yDocId}`)
      }}>
        Initialize YDoc
      </button> */}

      <button
        onClick={() => {
          console.log(provider);
        }}
      >
        Log provider status
      </button>

      <button
        onClick={() => {
          provider.destroy();
        }}
      >
        Destroy
      </button>
    </div>
  );
};
