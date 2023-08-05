import { PropsWithChildren, Suspense, useState } from "react";
import "./App.css";
import { Blob } from "./Blob";
import {
  incrementSharedCounter,
  useSharedCounter,
} from "./shared-counter-state";
import {
  incrementInefficientCounter,
  useInefficientCounter,
} from "./inefficient-counter-state";

function App() {
  return (
    <>
      <Blob />
      <Reveal title="Worker Counter">
        <Card>
          <Fallback>
            <WorkerCounter />
          </Fallback>
        </Card>
      </Reveal>
      <Reveal title="Inefficient Counter">
        <Card>
          <Fallback>
            <InefficientCounter />
          </Fallback>
        </Card>
      </Reveal>
    </>
  );
}

const Reveal = ({ children, title }: PropsWithChildren<{ title: string }>) => {
  const [isOpen, setOpen] = useState(false);

  const header = (
    <Card>
      <h2>{title}</h2>
      <button onClick={() => setOpen((current) => !current)}>
        {isOpen ? "Close" : "Open"}
      </button>
    </Card>
  );

  return (
    <>
      {header}
      {isOpen ? children : null}
    </>
  );
};

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
