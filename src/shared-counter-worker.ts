import { BehaviorSubject, Subject, map, scan, share, tap } from "rxjs";

const lastResult$ = new BehaviorSubject<number | undefined>(0);
const increment$ = new Subject<void>();
const increment = () => increment$.next();

const count$ = increment$.pipe(
  map(() => simulateSlowPerformance(11)),
  scan((x) => x + 1, 0),
  share()
);

count$.subscribe((count) => {
  lastResult$.next(count);
});

// public api
lastResult$.subscribe((lastResult) => {
  console.log("broadcast", lastResult);
  ports.forEach((port) => port.postMessage(lastResult));
});

const _ = self as unknown as SharedWorkerGlobalScope;
const ports: MessagePort[] = [];

_.onconnect = function (e) {
  const [port] = e.ports;
  ports.push(port);
  port.start();

  console.log("new client, count:", ports.length, e);

  port.onmessage = function (message) {
    if (message.data === "increment") {
      sendSnapshot(undefined, port);
      increment();
    }

    if (message.data === "snapshot") {
      sendSnapshot(lastResult$.getValue(), port);
    }
  };
};

const sendSnapshot = (snapshot: number | undefined, port: MessagePort) => {
  port.postMessage(snapshot);
  console.log("snapshot sent", snapshot);
};

function simulateSlowPerformance(baseNumber: number) {
  console.time("mySlowFunction");
  let result = 0;
  for (let i = Math.pow(baseNumber, 7); i >= 0; i--) {
    result += Math.atan(i) * Math.tan(i);
  }
  console.timeEnd("mySlowFunction");
  return result;
}
