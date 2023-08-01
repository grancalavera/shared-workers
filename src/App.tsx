import { PropsWithChildren, Suspense, useState } from "react";
import "./App.css";
import { Blob } from "./Blob";
import { pessimisticIncrement, useSharedCounter } from "./shared-counter-state";

function App() {
  return (
    <>
      <Blob />
      <Reveal>
        <Card>
          <Suspense fallback={<button disabled>Incrementing...</button>}>
            <Counter />
          </Suspense>
        </Card>
      </Reveal>
    </>
  );
}

const Reveal = ({ children }: PropsWithChildren) => {
  const [isOpen, setOpen] = useState(false);

  const header = (
    <Card>
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

const Counter = () => {
  const count = useSharedCounter();
  return <button onClick={() => pessimisticIncrement()}>Count: {count}</button>;
};

export default App;
