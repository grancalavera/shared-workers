import { useSyncExternalStore } from "react";
import SharedCounterWorker from "./shared-counter-worker?sharedworker";
import { createSuspender } from "./suspender";

const worker = new SharedCounterWorker();
const suspender = createSuspender();

worker.port.onmessage = (e: MessageEvent<number | undefined>) => {
  console.log("snapshot received", e.data);
  count = e.data;

  if (count !== undefined) {
    suspender.resume();
  }
  subscribers.forEach((notify) => notify());
};

let count: number | undefined;
const subscribers = new Set<() => void>();

const store = {
  subscribe(subscriber: () => void) {
    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
    };
  },
  getSnapshot(): number {
    if (count === undefined) {
      worker.port.postMessage("snapshot");
      throw suspender.suspend();
    }

    return count;
  },
};

export const useSharedCounter = () =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);

export const incrementSharedCounter = () => {
  worker.port.postMessage("increment");
};
