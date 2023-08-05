import { PropsWithChildren, Suspense } from "react";
import { Animation } from "./Animation";
import "./App.css";
import {
  incrementInefficientCounter,
  useInefficientCounter,
} from "./inefficient-counter-state";
import {
  incrementSharedCounter,
  useSharedCounter,
} from "./shared-counter-state";

function App() {
  return (
    <>
      <Animation />
      <Card>
        <h2>Shared Worker Counter</h2>
        <Fallback>
          <WorkerCounter />
        </Fallback>
      </Card>
      <Card>
        <h2>Main Thread Counter</h2>
        <Fallback>
          <InefficientCounter />
        </Fallback>
      </Card>
    </>
  );
}

const Card = ({ children }: PropsWithChildren) => (
  <div className="card">{children}</div>
);

const WorkerCounter = () => {
  const count = useSharedCounter();
  return (
    <button onClick={() => incrementSharedCounter()}>Count: {count}</button>
  );
};

const InefficientCounter = () => {
  const count = useInefficientCounter();
  return (
    <button onClick={() => incrementInefficientCounter()}>
      Count: {count}
    </button>
  );
};

const Fallback = ({ children }: PropsWithChildren) => (
  <Suspense fallback={<button disabled>Incrementing...</button>}>
    {children}
  </Suspense>
);

export default App;
