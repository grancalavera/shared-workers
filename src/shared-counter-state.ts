import { useSyncExternalStore } from "react";
import SharedCounterWorker from "./shared-counter-worker?sharedworker";
import { createSuspender } from "./suspender";

type Subscriber = () => void;

let snapshot: number | undefined;
const subscribers = new Set<Subscriber>();
const worker = new SharedCounterWorker();
const suspender = createSuspender();

worker.port.onmessage = (e: MessageEvent<number | undefined>) => {
  console.log("snapshot received", e.data);
  snapshot = e.data;

  if (snapshot !== undefined) {
    suspender.resume();
  }

  subscribers.forEach((notify) => notify());
};

const store = {
  subscribe(subscriber: Subscriber) {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
  },
  getSnapshot(): number {
    if (snapshot === undefined) {
      worker.port.postMessage("snapshot");
      throw suspender.suspend();
    }

    return snapshot;
  },
};

export const useSharedCounter = () =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);

export const incrementSharedCounter = () => {
  worker.port.postMessage("increment");
};
