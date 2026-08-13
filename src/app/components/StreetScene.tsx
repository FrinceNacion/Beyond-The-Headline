import React from "react";
import { C, speckle } from "../game/palette";
import { PixelSprite } from "./Pixel";
import { useFrame } from "./useFrame";
import { CastShadow } from "./TownProps";

/**
 * Looping ambient establishing shot: the street outside the newsroom at dusk.
 * Everything moves on a low-rate step clock — 4-frame walk cycles, 2-frame flickers.
 * This is a permanent ambient loop, not an intro cutscene.
 */
export function StreetScene() {
  const walk = useFrame(6); // 6fps step clock drives every cycle below
  const slow = useFrame(1.5);

  const f4 = walk % 4;
  // citizen crosses left→right, paperboy tracks right→left, both wrap and repeat
  const citizenX = ((walk * 6) % 900) - 40;
  const paperboyX = 860 - (((walk * 5) % 940) - 30);
  // the hook: a page blows across the street on its own slower loop
  const pageT = walk % 60;
  const pageX = pageT * 16 - 60;
  const pageY = 250 + Math.round(Math.sin(pageT / 3) * 14);
  // a single window flicks on and stays on for a beat
  const windowLit = slow % 6 >= 3;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#1B242C" }}>
      {/* ---------------------------------------------------------- sky bands */}
      {[
        { c: "#3A4A5E", h: 44 },
        { c: "#4A4E5C", h: 30 },
        { c: "#5A4E52", h: 24 },
        { c: "#6A5148", h: 18 },
      ].map((b, i, arr) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: arr.slice(0, i).reduce((s, x) => s + x.h, 0),
            height: b.h,
            ...speckle(b.c, "#2E3A48", 4),
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 96, top: 68, width: 26, height: 26, backgroundColor: "#C97A4A", boxShadow: "0 0 0 3px #8C4A3A" }} />

      {/* --------------------------------------------------- distant skyline */}
      <svg width={844} height={140} shapeRendering="crispEdges" style={{ position: "absolute", top: 40 }}>
        <polygon points="0,140 0,96 60,96 60,64 130,64 130,104 210,104 210,72 300,72 300,110 400,110 400,80 470,80 470,112 560,112 560,70 640,70 640,102 730,102 730,76 800,76 800,108 844,108 844,140" fill="#26343E" />
      </svg>

      {/* ------------------------------------------------ newsroom facade, right */}
      <div style={{ position: "absolute", right: 0, top: 62, width: 300, height: 214 }}>
        <div style={{ position: "absolute", inset: 0, ...speckle("#33404A", "#2A3138", 4), boxShadow: `inset 3px 0 0 0 #3E4A52, 0 0 0 3px ${C.ink}` }} />
        {/* windows — one of them flicks on */}
        {Array.from({ length: 12 }, (_, i) => {
          const lit = i === 5 ? windowLit : [0, 3, 4, 8, 10].includes(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 22 + (i % 4) * 68,
                top: 20 + Math.floor(i / 4) * 54,
                width: 40,
                height: 32,
                backgroundColor: lit ? "#E8C36B" : "#222B31",
                boxShadow: `0 0 0 3px ${C.ink}, inset -3px -3px 0 0 ${lit ? "#B08D57" : "#1A2126"}`,
              }}
            />
          );
        })}
        {/* masthead plate over the door */}
        <div
          style={{
            position: "absolute",
            left: 60,
            bottom: 6,
            padding: "2px 6px",
            backgroundColor: C.paper2,
            boxShadow: `0 0 0 2px ${C.ink}`,
            fontFamily: '"VT323", monospace',
            fontSize: 15,
            color: C.ink,
            letterSpacing: "0.08em",
          }}
        >
          THE ROSEWOOD LEDGER
        </div>
      </div>

      {/* --------------------------------------------------------- street bed */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 276, bottom: 0, ...speckle("#3A3830", "#2E2C26", 4) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 276, height: 8, backgroundColor: "#4A4438", boxShadow: `0 2px 0 0 ${C.ink}` }} />
      {/* lane dashes */}
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: i * 64 + 8, top: 330, width: 28, height: 4, backgroundColor: "#5A5344" }} />
      ))}

      {/* ----------------------------------------------------------- fixtures */}
      <div style={{ position: "absolute", left: 60, top: 214 }}>
        <CastShadow name="lamppostOn" scale={2.4} />
        <PixelSprite name={walk % 12 === 0 ? "lamppostOff" : "lamppostOn"} scale={2.4} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 236 }}>
        <CastShadow name="noticeboard" scale={2} />
        <PixelSprite name="noticeboard" scale={2} />
      </div>
      <div style={{ position: "absolute", left: 190, top: 268 }}>
        <PixelSprite name="tree2" scale={2.2} />
      </div>
      <div style={{ position: "absolute", left: 470, top: 262 }}>
        <PixelSprite name="bench" scale={2} />
      </div>
      <div style={{ position: "absolute", left: 540, top: 258 }}>
        <PixelSprite name="bicycle" scale={2} />
      </div>

      {/* ---------------------------------------------------------- NPC loops */}
      {/* citizen crossing the street — 4-frame walk cycle */}
      <div style={{ position: "absolute", left: citizenX, top: 300 }}>
        <CastShadow name={`npcA${f4 + 1}`} scale={2.2} />
        <PixelSprite name={`npcA${f4 + 1}`} scale={2.2} />
      </div>
      {/* paperboy on his round — 4-frame cycle, mirrored to face the other way */}
      <div style={{ position: "absolute", left: paperboyX, top: 330, transform: "scaleX(-1)" }}>
        <PixelSprite name={`npcB${f4 + 1}`} scale={2} />
      </div>
      {/* figure paused at the notice board — 2-frame idle */}
      <div style={{ position: "absolute", left: 344, top: 292 }}>
        <CastShadow name="npcC1" scale={2.2} />
        <PixelSprite name={`npcC${(walk % 8 < 4 ? 1 : 2)}`} scale={2.2} />
      </div>

      {/* the hook: a newspaper page tumbling across the street — 4-frame flutter */}
      <div style={{ position: "absolute", left: pageX, top: pageY }}>
        <PixelSprite name={`news${f4 + 1}`} scale={2} />
      </div>
    </div>
  );
}
