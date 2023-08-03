import { useSyncExternalStore } from "react";
import SharedCounterWorker from "./shared-counter-worker?sharedworker";
const worker = new SharedCounterWorker();

worker.port.onmessage = (e: MessageEvent<number | undefined>) => {
  console.log("snapshot received", e.data);
  count = e.data;

  if (count !== undefined) {
    stopSuspending();
  }

  notifySubscribers();
};

const snapshot = () => worker.port.postMessage("snapshot");
const notifySubscribers = () => subscribers.forEach((notify) => notify());

type Suspender = {
  promise?: Promise<void>;
  resolve?: () => void;
};

const suspender: Suspender = {};

const restoreSuspender = () => {
  suspender.promise = new Promise((resolve) => (suspender.resolve = resolve));
};

const stopSuspending = () => {
  suspender.resolve?.();
  suspender.promise = undefined;
  suspender.resolve = undefined;
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
    if (count === undefined && suspender.promise === undefined) {
      snapshot();
      restoreSuspender();
      throw suspender.promise;
    }

    if (count === undefined) {
      snapshot();
      throw suspender.promise;
    }

    return count;
  },
};

export const useSharedCounter = () =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);

export const increment = () => {
  worker.port.postMessage("increment");
};
