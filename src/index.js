import React, { useRef, useMemo, useCallback, useEffect } from "react";

import SNOWFLAKE_1 from "./assets/snowflakes/1.png";
import SNOWFLAKE_2 from "./assets/snowflakes/2.png";
import SNOWFLAKE_3 from "./assets/snowflakes/3.png";
import SNOWFLAKE_4 from "./assets/snowflakes/4.png";
import SNOWFLAKE_5 from "./assets/snowflakes/5.png";
import SNOWFLAKE_6 from "./assets/snowflakes/6.png";
import SNOWFLAKE_7 from "./assets/snowflakes/7.png";
import SNOWFLAKE_8 from "./assets/snowflakes/8.png";
import SNOWFLAKE_9 from "./assets/snowflakes/9.png";
import SNOWFLAKE_10 from "./assets/snowflakes/10.png";
import useResize from "./utils/useResize";

import "./style.css";

const SNOWFLAKES = [
  SNOWFLAKE_1,
  SNOWFLAKE_2,
  SNOWFLAKE_3,
  SNOWFLAKE_4,
  SNOWFLAKE_5,
  SNOWFLAKE_6,
  SNOWFLAKE_7,
  SNOWFLAKE_8,
  SNOWFLAKE_9,
  SNOWFLAKE_10,
].map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

const SNOWFLAKES_COUNT = 200;
const SNOWFLAKES_PLACEMENT_FREQUENCY = 1;
const SNOWFLAKE_SIZE = [32, 32];
const WIND_SPEED = 4;

const Blizzard = () => {
  const ref = useRef();
  const ctx = useRef();
  const raf = useRef();

  // default to 45~135°
  const windDirection = useRef(Math.PI / 4 + Math.random() * (Math.PI / 2));
  const windIntensity = useRef(1);
  const snowIntensity = useRef(1);
  const snowflakes = useRef([]);

  const { width, height } = useResize();
  const radius = useMemo(
    () => (width && height ? Math.hypot(width, height) / 2 : 0),
    [width, height]
  );

  const handleRAF = useCallback(
    (t) => {
      // update any existing snowflake
      snowflakes.current.forEach((s) => {
        s.x +=
          WIND_SPEED * windIntensity.current * Math.cos(windDirection.current);
        s.y +=
          WIND_SPEED * windIntensity.current * Math.sin(windDirection.current);

        if (s.y - SNOWFLAKE_SIZE[1] / 2 > height) {
          // snoflake is out of screen
          s.deleted = true;
          return;
        }

        s.rotation += Math.random() * Math.PI * 0.01 * windIntensity.current;
      });
      snowflakes.current = snowflakes.current.filter((s) => !s.deleted);

      // place any new snowflake
      const lastSnowflakeCreationTime = snowflakes.current.reduce(
        (a, b) => (a > b.createdAt ? a : b.createdAt),
        0
      );

      if (
        radius > 0 &&
        // is there room for new snowflakes
        snowflakes.current.length < SNOWFLAKES_COUNT * snowIntensity.current &&
        // enough time passed from last creation
        t - lastSnowflakeCreationTime >
          1 / (SNOWFLAKES_PLACEMENT_FREQUENCY * snowIntensity.current)
      ) {
        const alpha = Math.random() * -Math.PI;

        const snowflake = {
          x: width / 2 + radius * Math.cos(alpha),
          y: height / 2 + radius * Math.sin(alpha),
          rotation: Math.random() * 2 * Math.PI,
          source:
            SNOWFLAKES[Math.round(Math.random() * (SNOWFLAKES.length - 1))],
          createdAt: t,
        };

        snowflakes.current.push(snowflake);
      }

      // draw canvas
      ctx.current.clearRect(0, 0, width, height);
      snowflakes.current.forEach((s) => {
        if (!s.source.complete) {
          return;
        }

        ctx.current.translate(
          s.x - SNOWFLAKE_SIZE[0] / 2,
          s.y - SNOWFLAKE_SIZE[1] / 2
        );
        ctx.current.rotate(s.rotation);
        ctx.current.drawImage(
          s.source,
          SNOWFLAKE_SIZE[0] / 2,
          SNOWFLAKE_SIZE[1] / 2
        );
        ctx.current.rotate(-s.rotation);
        ctx.current.translate(
          -s.x + SNOWFLAKE_SIZE[0] / 2,
          -s.y + SNOWFLAKE_SIZE[1] / 2
        );
      });

      if (raf.current) {
        raf.current = requestAnimationFrame(handleRAF);
      }
    },
    [radius, width, height]
  );

  useEffect(() => {
    ctx.current = ref.current.getContext("2d");
    raf.current = requestAnimationFrame(handleRAF);

    return () => {
      if (raf.current) {
        raf.current = cancelAnimationFrame(raf.current);
      }
    };
  }, [handleRAF]);

  return (
    <canvas ref={ref} className="blizzard" width={width} height={height} />
  );
};

export default Blizzard;
