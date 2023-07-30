let count = 0;

const _ = self as unknown as SharedWorkerGlobalScope;
const ports: MessagePort[] = [];

_.onconnect = function (e) {
  console.log("new client");

  const [port] = e.ports;
  ports.push(port);
  port.start();

  port.onmessage = function (message) {
    if (message.data === "increment") {
      increment();
    }

    if (message.data === "snapshot") {
      sendSnapshot(port);
    }
  };
};

const increment = () => {
  count++;
  console.log(`send snapshot to ${ports.length} clients`);
  ports.forEach(sendSnapshot);
};

const pendingSnapshots = new Map<MessagePort, number>();

const sendSnapshot = (port: MessagePort) => {
  const delay = 1500;
  console.log(`snapshot requested, delay ${delay / 1000} seconds`);

  if (pendingSnapshots.has(port)) {
    console.log("abort snapshot");
    clearInterval(pendingSnapshots.get(port));
  }

  const tid = setTimeout(() => {
    port.postMessage(count);
    console.log("snapshot sent");
    pendingSnapshots.delete(port);
  }, delay);

  pendingSnapshots.set(port, tid);
};
