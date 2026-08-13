import React, { useEffect, useRef, useState } from "react";
import { C, dither, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { CastShadow } from "../components/TownProps";
import { useFrame } from "../components/useFrame";
import { PROLOGUE, type PanelArt } from "../game/story";

/* -------------------------------------------------------------- panel art
   Static pixel vignettes assembled from the existing town/desk sprite set —
   a page of the dossier, not a cutscene frame. */

function Vignette({ art, blink }: { art: PanelArt; blink: number }) {
  const sky = dither("#3B4A5C", "#2A3644", 6);
  const base: React.CSSProperties = {
    position: "relative",
    width: 372,
    height: 152,
    overflow: "hidden",
    boxShadow: `0 0 0 3px ${C.ink}, inset 3px 3px 0 0 rgba(246,240,226,0.10)`,
  };

  if (art === "town") {
    return (
      <div style={{ ...base, ...sky }}>
        {/* dusk band + low sun, single light source upper-left as everywhere else */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, height: 10, backgroundColor: "#5A4A4A" }} />
        <div style={{ position: "absolute", left: 34, top: 26, width: 20, height: 20, backgroundColor: C.brassLight, boxShadow: `0 0 0 3px #8A6A3C` }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 46, ...speckle("#3A4A3E", "#2E3B31", 4) }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, height: 16, ...speckle(C.ink3, C.ink2, 5) }} />
        <div style={{ position: "absolute", left: 18, bottom: 40 }}>
          <CastShadow name="house1" scale={2} />
          <PixelSprite name="house1" scale={2} />
        </div>
        <div style={{ position: "absolute", left: 120, bottom: 44 }}>
          <CastShadow name="house2" scale={2} />
          <PixelSprite name="house2" scale={2} />
        </div>
        <div style={{ position: "absolute", left: 236, bottom: 40 }}>
          <CastShadow name="house3" scale={2} />
          <PixelSprite name="house3" scale={2} />
        </div>
        <div style={{ position: "absolute", left: 208, bottom: 30 }}>
          <PixelSprite name={blink % 6 >= 3 ? "lamppostOn" : "lamppostOff"} scale={2} />
        </div>
        <div style={{ position: "absolute", left: 320, bottom: 26 }}>
          <PixelSprite name="tree1" scale={2} />
        </div>
        <div style={{ position: "absolute", left: 84, bottom: 20 }}>
          <PixelSprite name="bench" scale={1.6} />
        </div>
      </div>
    );
  }

  if (art === "clipping") {
    return (
      <div style={{ ...base, ...speckle(C.ink2, C.ink3, 5), display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ transform: "rotate(-5deg)", boxShadow: `0 0 0 3px ${C.ink}` }}>
          <PixelSprite name="tornlogo" scale={3} title="Torn newspaper clipping" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["4,112 SHARES", "912 REPOSTS", "1 CORRECTION"].map((t, i) => (
            <div
              key={t}
              style={{
                padding: "2px 6px",
                transform: `rotate(${i === 1 ? 3 : -2}deg)`,
                backgroundColor: i === 2 ? C.paper3 : C.red,
                boxShadow: `0 0 0 2px ${C.ink}`,
              }}
            >
              <Mono size={15} color={i === 2 ? C.ink : C.white}>
                {t}
              </Mono>
            </div>
          ))}
        </div>
        <div style={{ transform: "rotate(6deg)" }}>
          <PixelSprite name="phone" scale={2.4} />
        </div>
      </div>
    );
  }

  if (art === "editor") {
    return (
      <div style={{ ...base, ...speckle("#2E2A24", C.ink2, 5), display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ boxShadow: `0 0 0 3px ${C.ink}` }}>
          <PixelSprite name="editor" scale={5} title="Margaret Odell, Editor" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
          <PixelSprite name="typewriter" scale={2.4} />
          <PixelSprite name="coffee" scale={2} />
        </div>
      </div>
    );
  }

  if (art === "badge") {
    return (
      <div style={{ ...base, ...speckle(C.paper3, C.paper4, 4), display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ padding: 8, backgroundColor: C.ink, boxShadow: `0 0 0 3px ${C.brassDark}` }}>
          <PixelSprite name="badge" scale={4} title="Press credential" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Display size={9} color={C.ink}>
            THE ROSEWOOD LEDGER
          </Display>
          <Mono size={16} color={C.ink3}>
            FACT DESK — CREDENTIAL 0007
          </Mono>
          <div style={{ display: "flex", gap: 55, marginTop: 2 }}>
            <PixelSprite name="doc" scale={1.8} />
            <PixelSprite name="phone" scale={1.8} />
            <PixelSprite name="quotecard" scale={1.8} />
          </div>
          <Mono size={13} color={C.ink4}>
            ARTICLE · SOCIAL POST · ON THE RECORD
          </Mono>
        </div>
      </div>
    );
  }

  // map
  return (
    <div style={{ ...base, ...speckle("#3A4A3E", "#2E3B31", 4) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, height: 18, ...speckle(C.ink3, C.ink4, 5) }} />
      {[
        { s: "bakery", x: 16 },
        { s: "cityhall", x: 96 },
        { s: "market", x: 182 },
        { s: "newsoffice", x: 252 },
        { s: "school", x: 318 },
      ].map((n) => (
        <div key={n.s} style={{ position: "absolute", left: n.x, bottom: 22 }}>
          <CastShadow name={n.s} scale={1.5} />
          <PixelSprite name={n.s} scale={1.5} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 22, top: 8 }}>
        <PixelSprite name="pin" scale={1.6} />
      </div>
      <div style={{ position: "absolute", right: 8, bottom: 6 }}>
        <Mono size={14} color={C.paper3}>
          EIGHT OPEN FILES
        </Mono>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- prologue */

export function Prologue({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [turn, setTurn] = useState(0); // 0 = settled, 1-3 = page-turn frames
  const blink = useFrame(3);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const panel = PROLOGUE[i];
  const last = i === PROLOGUE.length - 1;

  const advance = () => {
    if (turn) return;
    if (last) {
      onDone();
      return;
    }
    // 3-frame pixel page turn, no easing
    timers.current = [1, 2, 3].map((f) =>
      window.setTimeout(() => {
        if (f === 3) {
          setI((n) => n + 1);
          setTurn(0);
        } else {
          setTurn(f);
        }
      }, f * 70),
    );
    setTurn(1);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      data-interactive="story-panel"
      aria-label="Story panel — tap to continue"
      onClick={advance}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") advance();
      }}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        ...dither(C.ink, C.ink2, 6),
      }}
    >
      {/* dossier header */}
      <div
        style={{
          flex: "0 0 30px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 8px",
          backgroundColor: C.ink,
          boxShadow: `inset 0 -2px 0 0 ${C.brassDark}`,
        }}
      >
        <PixelSprite name="briefcase" scale={1.2} />
        <Display size={8} color={C.brassLight}>
          CASE DOSSIER — BACKGROUND
        </Display>
        <Mono size={14} color={C.brass}>
          PAGE {i + 1} OF {PROLOGUE.length}
        </Mono>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          data-interactive="skip"
          aria-label="Button — Skip story"
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
          style={{ background: "none", border: "none", padding: "2px 4px", cursor: "pointer" }}
        >
          <Mono size={15} color={C.paper4}>
            SKIP STORY ▸
          </Mono>
        </button>
      </div>

      {/* page */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 0" }}>
        <Vignette art={panel.art} blink={blink} />

        <div
          style={{
            marginTop: 10,
            width: 700,
            maxWidth: "94%",
            flex: 1,
            padding: "8px 12px",
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
          }}
        >
          <Display size={8} color={C.red}>
            {panel.kicker}
          </Display>
          <div style={{ marginTop: 5 }}>
            {panel.lines.map((l, n) => (
              <div key={n} style={{ marginBottom: 4 }}>
                <Body size={14} color={C.ink}>
                  {l}
                </Body>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* tap-to-continue, same language as the tutorial */}
      <div
        style={{
          flex: "0 0 34px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor: C.ink,
          boxShadow: `inset 0 2px 0 0 ${C.brassDark}`,
        }}
      >
        {panel.cta ? (
          <PixelButton
            variant="brass"
            size={9}
            icon="pin"
            iconScale={1}
            onClick={onDone}
            label="Button — Begin Investigation"
          >
            {panel.cta}
          </PixelButton>
        ) : (
          <>
            <span className="bth-nudge" style={{ display: "inline-flex" }}>
              <PixelSprite name="arrowR" scale={1.4} />
            </span>
            <Mono size={16} color={C.paper3}>
              TAP TO CONTINUE
            </Mono>
          </>
        )}
      </div>

      {/* page-turn sheet, 3 hard frames */}
      {turn ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: `${(turn / 3) * 100}%`,
            ...speckle(C.paper2, C.paper3, 4),
            boxShadow: `inset 4px 0 0 0 ${C.ink}, inset 8px 0 0 0 ${C.paper}`,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
}
