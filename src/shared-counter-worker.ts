import { BehaviorSubject, Subject, concatMap, map, scan, share } from "rxjs";

const countDisplay$ = new BehaviorSubject<number | undefined>(0);
const increment$ = new Subject<void>();
const increment = () => increment$.next();

const fork = <T>(value: T) =>
  new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, 0);
  });

const count$ = increment$.pipe(
  concatMap(fork),
  map(() => simulateSlowPerformance(15)),
  scan((x) => x + 1, 0),
  share()
);

count$.subscribe((count) => {
  countDisplay$.next(count);
});

increment$.subscribe(() => {
  countDisplay$.next(undefined);
});

const _ = self as unknown as SharedWorkerGlobalScope;
const ports: MessagePort[] = [];

countDisplay$.subscribe((count) => {
  console.log("broadcast", count);
  ports.forEach((port) => port.postMessage(count));
});

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
      sendSnapshot(countDisplay$.getValue())(port);
    }
  };
};

const sendSnapshot = (snapshot: number | undefined) => (port: MessagePort) => {
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
