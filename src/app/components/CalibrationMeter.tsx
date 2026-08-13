import React from "react";
import { C } from "../game/palette";
import { Body, Mono, PixelSprite } from "./Pixel";
import type { Calibration } from "../game/mil";

/* The calibration meter.

   Accuracy alone rewards a player who flags everything. This axis reports the
   other failure: paranoia on the left of centre, credulity on the right, and
   "balanced" — the actual goal — dead in the middle. */

export function CalibrationMeter({ cal, width = 240 }: { cal: Calibration; width?: number }) {
  // index +1 = paranoid (left of the track), -1 = credulous (right).
  const t = (1 - cal.index) / 2;
  const cells = 15;
  const at = Math.round(t * (cells - 1));

  return (
    <div style={{ width }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <PixelSprite name="gauge" scale={1.1} />
        <Mono size={12} color={C.brass}>
          CALIBRATION
        </Mono>
        <span style={{ marginLeft: "auto" }}>
          <Mono size={13} color={cal.zone === "balanced" ? C.green : C.brassLight}>
            {cal.label}
          </Mono>
        </span>
      </div>

      {/* stepped track — 15 hard cells, no gradient */}
      <div
        role="img"
        aria-label={`Calibration — ${cal.label}. ${cal.note}`}
        style={{ display: "flex", gap: 1, marginTop: 3, boxShadow: `0 0 0 2px ${C.ink}` }}
      >
        {Array.from({ length: cells }, (_, i) => {
          const centre = i === Math.floor(cells / 2);
          const here = i === at;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 12,
                backgroundColor: here
                  ? centre
                    ? C.green
                    : C.red
                  : centre
                    ? C.brassDark
                    : i < cells / 2
                      ? "#4A5C6A"
                      : "#6B5B3E",
              }}
            />
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <Mono size={11} color={C.paper4}>
          PARANOID
        </Mono>
        <Mono size={11} color={cal.zone === "balanced" ? C.green : C.paper4}>
          BALANCED
        </Mono>
        <Mono size={11} color={C.paper4}>
          CREDULOUS
        </Mono>
      </div>

      <div style={{ marginTop: 3 }}>
        <Body size={12} color={C.paper3}>
          {cal.note}
        </Body>
      </div>
    </div>
  );
}
