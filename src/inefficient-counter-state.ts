import { useSyncExternalStore } from "react";
import { count$, getSnapshot, increment } from "./inefficient-counter";
import { createSuspender } from "./suspender";

type StoreSubscriber = () => void;
const subscribers = new Set<StoreSubscriber>();
const suspender = createSuspender();

count$.subscribe((count) => {
  if (count !== undefined) {
    suspender.resume();
  }

  subscribers.forEach((notify) => notify());
});

const store = {
  subscribe(subscriber: StoreSubscriber) {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
  },

  getSnapshot(): number {
    const snapshot = getSnapshot();

    if (snapshot === undefined) {
      throw suspender.suspend();
    }

    return snapshot;
  },
};

export const useInefficientCounter = () =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);

export const incrementInefficientCounter = () => increment();
