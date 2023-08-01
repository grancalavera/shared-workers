let count = 0;

const _ = self as unknown as SharedWorkerGlobalScope;
const ports: MessagePort[] = [];

_.onconnect = function (e) {
  const [port] = e.ports;
  ports.push(port);
  port.start();

  console.log("new client, count:", ports.length);

  port.onmessage = function (message) {
    if (message.data === "increment") {
      increment();
    }

    if (message.data === "snapshot") {
      sendSnapshot(port);
    }
  };
};

const increment = async () => {
  await new Promise<void>((resolve) => {
    mySlowFunction(6);
    count++;
    resolve();
  });

  console.log(`send snapshot to ${ports.length} clients`);
  ports.forEach(sendSnapshot);
};

const sendSnapshot = (port: MessagePort) => {
  port.postMessage(count);
  console.log("snapshot sent");
};

function mySlowFunction(baseNumber: number) {
  console.time("mySlowFunction");
  let result = 0;
  for (let i = Math.pow(baseNumber, 7); i >= 0; i--) {
    console.count("iteration...");
    result += Math.atan(i) * Math.tan(i);
  }
  console.timeEnd("mySlowFunction");
  return result;
}
