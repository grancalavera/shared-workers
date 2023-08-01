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
  mySlowFunction(5);
  count++;
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
    result += Math.atan(i) * Math.tan(i);
  }
  console.timeEnd("mySlowFunction");
  return result;
}
