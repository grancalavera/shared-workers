import { useSyncExternalStore } from "react";
import SharedCounterWorker from "./shared-counter-worker?sharedworker";

let count: number | undefined;
let subscribers: (() => void)[] = [];
const worker = new SharedCounterWorker();

worker.port.onmessage = (e) => {
  count = e.data;
  stopSuspending();
  notifySubscribers();
};

const increment = () => worker.port.postMessage("increment");
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

const store = {
  subscribe(subscriber: () => void) {
    subscribers = [...subscribers, subscriber];
    return () => {
      subscribers = subscribers.filter((candidate) => candidate !== subscriber);
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

export const pessimisticIncrement = () => {
  count = undefined;
  notifySubscribers();
  increment();
};

export const optimisticIncrement = () => {
  count = (count ?? 0) + 1;
  notifySubscribers();
  increment();
};

export const invalidate = () => {
  count = undefined;
  notifySubscribers();
  snapshot();
};

export const clearCache = () => {
  count = undefined;
};
