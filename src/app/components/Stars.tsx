import React, { useEffect, useState } from "react";
import { C } from "../game/palette";
import { Mono, PixelSprite } from "./Pixel";

/** Three star slots. Empty outlines before the case, chunky pop-in after. */
export function StarRow({
  earned,
  scale = 2,
  /** stagger the fill so it reads as a payoff, not a state change */
  animate = false,
  gap = 4,
}: {
  earned: boolean[];
  scale?: number;
  animate?: boolean;
  gap?: number;
}) {
  const [shown, setShown] = useState(animate ? 0 : earned.length);

  useEffect(() => {
    if (!animate) return;
    setShown(0);
    const id = window.setInterval(() => {
      setShown((s) => {
        if (s >= earned.length) {
          window.clearInterval(id);
          return s;
        }
        return s + 1;
      });
    }, 260);
    return () => window.clearInterval(id);
  }, [animate, earned.length]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {earned.map((on, i) => {
        const live = i < shown;
        return (
          <span
            key={i}
            className={live && on && animate ? "bth-stamp" : undefined}
            style={{ display: "inline-flex", lineHeight: 0 }}
          >
            <PixelSprite
              name={live && on ? "starOn" : "starOff"}
              scale={scale}
              title={on ? "Star earned" : "Star slot"}
            />
          </span>
        );
      })}
    </div>
  );
}

/** Compact "★ 2/3" readout for the map nodes. */
export function StarCount({ count, scale = 1 }: { count: number; scale?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[0, 1, 2].map((i) => (
        <PixelSprite key={i} name={i < count ? "starOn" : "starOff"} scale={scale} />
      ))}
      <Mono size={11} color={C.brassLight}>
        {count}/3
      </Mono>
    </div>
  );
}
