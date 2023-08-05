import { count$, getSnapshot, increment } from "./inefficient-counter";

const _ = self as unknown as SharedWorkerGlobalScope;
const ports = new Set<MessagePort>();

_.onconnect = function (e) {
  const [port] = e.ports;
  ports.add(port);
  port.start();

  console.log("new client, count:", ports.size, e);

  port.onmessage = function (message) {
    if (message.data === "increment") {
      increment();
    }

    if (message.data === "snapshot") {
      sendSnapshot(getSnapshot(), port);
    }
  };
};

const sendSnapshot = (snapshot: number | undefined, port: MessagePort) => {
  port.postMessage(snapshot);
  console.log("snapshot sent", snapshot);
};

const broadcast = (count: number | undefined) => {
  console.log("broadcast", count);
  ports.forEach((port) => port.postMessage(count));
};

count$.subscribe(broadcast);
