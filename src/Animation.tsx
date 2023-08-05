import { animated, useTrail } from "@react-spring/web";
import { useEffect } from "react";
import useMeasure from "react-use-measure";
import styles from "./Animation.module.css";

const fast = { tension: 1200, friction: 40 };
const slow = { mass: 10, tension: 200, friction: 50 };
const trans = (x: number, y: number) =>
  `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;

function randInt(min: number, max: number): number {
  // Ensure min and max are integers (optional, depending on your use case)
  min = Math.floor(min);
  max = Math.floor(max);

  // Ensure min is less than or equal to max
  if (min > max) {
    [min, max] = [max, min];
  }

  // Generate a random number in the range [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const Animation = () => {
  const [trail, api] = useTrail(3, (i) => ({
    xy: [0, 0],
    config: i === 0 ? fast : slow,
  }));
  const [ref, { left, top, bottom, right }] = useMeasure();

  useEffect(() => {
    const iid = setInterval(() => {
      const xy = [randInt(left, right), randInt(top, bottom)];
      api.start({ xy });
    }, 1000);
    return () => {
      clearInterval(iid);
    };
  }, [bottom, right, api, left, top]);

  return (
    <div className={styles.container}>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="30" />
          <feColorMatrix
            in="blur"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -7"
          />
        </filter>
      </svg>
      <div ref={ref} className={styles.hooksMain}>
        {trail.map((props, index) => (
          <animated.div key={index} style={{ transform: props.xy.to(trans) }} />
        ))}
      </div>
    </div>
  );
};
