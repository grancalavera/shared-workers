import { BehaviorSubject, Subject, delay, map, scan, share, tap } from "rxjs";

const slowFactor = parseInt(import.meta.env.VITE_SLOW_FACTOR ?? "10");
console.log({ slowFactor });

const cache$ = new BehaviorSubject<number | undefined>(0);
const increment$ = new Subject<void>();
const counter$ = increment$.pipe(
  tap(() => cache$.next(undefined)),
  delay(10),
  map(() => simulateSlowPerformance(slowFactor)),
  scan((x) => x + 1, 0),
  share()
);

counter$.subscribe((count) => {
  cache$.next(count);
});

function simulateSlowPerformance(baseNumber: number) {
  console.time("simulateSlowPerformance");
  let result = 0;
  for (let i = Math.pow(baseNumber, 7); i >= 0; i--) {
    result += Math.atan(i) * Math.tan(i);
  }
  console.timeEnd("simulateSlowPerformance");
  return result;
}

export const count$ = cache$.asObservable();
export const getSnapshot = () => cache$.getValue();
export const increment = () => increment$.next();
