import { PropsWithChildren, Suspense, useState } from "react";
import "./App.css";
import {
  clearCache,
  invalidate,
  optimisticIncrement,
  pessimisticIncrement,
  useSharedCounter,
} from "./shared-counter-store";

function App() {
  const [isOpen, setOpen] = useState(false);
  return isOpen ? (
    <>
      <Card>
        <Counter optimistic />
      </Card>
      <Card>
        <Counter />
      </Card>
      <Card>
        <button onClick={() => invalidate()}>Invalidate</button>
      </Card>
      <Card>
        <button
          onClick={() => {
            clearCache();
            setOpen(false);
          }}
        >
          Close (clear cache)
        </button>
      </Card>
      <Card>
        <button onClick={() => setOpen(false)}>Close (keep cache)</button>
      </Card>
    </>
  ) : (
    <Card>
      <button onClick={() => setOpen(true)}>Open</button>
    </Card>
  );
}

const Card = ({ children }: PropsWithChildren) => (
  <div className="card">
    <Suspense fallback={<button disabled>Loading ...</button>}>
      {children}
    </Suspense>
  </div>
);

const Counter = (props: { optimistic?: boolean }) => {
  const count = useSharedCounter();
  return (
    <button
      onClick={() =>
        props.optimistic ? optimisticIncrement() : pessimisticIncrement()
      }
    >
      {props.optimistic ? "Optimistic" : "Pessimistic"} Count: {count}
    </button>
  );
};

export default App;
