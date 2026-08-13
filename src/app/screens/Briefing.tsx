import React, { useEffect, useState } from "react";
import { C, dither, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { TopHud } from "../components/Hud";
import { StarRow } from "../components/Stars";
import type { CaseDef } from "../game/cases";
import { briefingFor, starConds } from "../game/story";
import { CASE_GAMES } from "../cases/index";
import { STAGE_STARS } from "../cases/arcade/stage";

/** 3-frame folder open: the card is dealt out of the folder, then it settles. */
const OPEN_FRAMES = [
  { h: 0.34, x: -14, r: -5 },
  { h: 0.72, x: -6, r: -2 },
  { h: 1, x: 0, r: 0 },
];

export function Briefing({
  cs,
  index,
  tips,
  rank,
  bestStars,
  onStart,
  onBack,
}: {
  cs: CaseDef;
  index: number;
  tips: number;
  rank: string;
  /** stars already banked on this case, so replays show what to beat */
  bestStars?: number;
  onStart: () => void;
  onBack: () => void;
}) {
  const [frame, setFrame] = useState(0);
  const b = briefingFor(cs.id);
  // drill stages promise their own three stars, judged by the stage shell
  const isDrill = CASE_GAMES[cs.id] === "stage";
  const conds = isDrill
    ? STAGE_STARS.map((label, i) => ({ id: `drill${i}`, label }))
    : starConds(cs.id);

  useEffect(() => {
    setFrame(0);
    const id = window.setInterval(() => {
      setFrame((f) => {
        if (f >= OPEN_FRAMES.length - 1) {
          window.clearInterval(id);
          return f;
        }
        return f + 1;
      });
    }, 90);
    return () => window.clearInterval(id);
  }, [cs.id]);

  const f = OPEN_FRAMES[frame];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", ...dither(C.ink, C.ink2, 6) }}>
      <TopHud
        tips={tips}
        rank={rank}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name="briefcase" scale={1.2} />
            <Display size={8} color={C.brassLight}>
              BRIEFING — {cs.tag}
            </Display>
          </div>
        }
        right={
          <PixelButton variant="ink" size={8} onClick={onBack} label="Button — Back to map">
            ◂ MAP
          </PixelButton>
        }
      />

      {/* manila folder, opening */}
      <div style={{ flex: 1, minHeight: 0, margin: 6, padding: 6, display: "flex", gap: 8, ...speckle(C.paper3, C.paper4, 4), boxShadow: `inset 3px 3px 0 0 ${C.paper2}, inset -3px -3px 0 0 #8f8467, 0 0 0 3px ${C.ink}` }}>
        {/* briefing card */}
        <div
          style={{
            flex: "1 1 58%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            transform: `translateX(${f.x}px) rotate(${f.r}deg)`,
            height: `${f.h * 100}%`,
            overflow: "hidden",
            padding: 8,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ boxShadow: `0 0 0 2px ${C.ink}` }}>
              <PixelSprite name={cs.sprite} scale={1.6} title={cs.building} />
            </div>
            <div style={{ minWidth: 0 }}>
              <Mono size={14} color={C.paper4}>
                {cs.tag} · FILE 0{index + 1} · {cs.building.toUpperCase()}
              </Mono>
            <br />
              <Display size={11} color={C.ink}>
                {cs.title}
              </Display>
            </div>
            {bestStars ? (
              <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <Mono size={12} color={C.paper4}>
                  BEST
                </Mono>
                <StarRow earned={[0, 1, 2].map((i) => i < bestStars)} scale={1.2} gap={2} />
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 6, display: "flex", gap: 6, flex: 1, minHeight: 0 }}>
            <div style={{ flex: "0 0 auto", boxShadow: `0 0 0 2px ${C.ink}`, alignSelf: "flex-start" }}>
              <PixelSprite name="editor" scale={2} title="Margaret Odell, Editor" />
            </div>
            <div className="bth-scroll" style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
              <Display size={7} color={C.red}>
                FROM THE EDITOR
              </Display>
              <div style={{ marginTop: 3 }}>
                <Body size={14} color={C.ink}>
                  “{b.setup}”
                </Body>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
            <PixelSprite name="doc" scale={1} />
            <Mono size={13} color={C.paper4}>
              {isDrill
                ? "TWO DRILLS ATTACHED · THREE LIVES ON THE DESK"
                : `THREE SOURCES ATTACHED · ${cs.hotspots.length} CLAIMS TO JUDGE`}
            </Mono>
          </div>
        </div>

        {/* missions + star promise */}
        <div style={{ flex: "1 1 42%", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ padding: 6, backgroundColor: C.ink2, boxShadow: `0 0 0 2px ${C.ink}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <PixelSprite name="notebook" scale={1.2} />
              <Display size={8} color={C.brassLight}>
                MISSION
              </Display>
            </div>
            <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
              {b.missions.map((m) => (
                <div key={m} style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                  <div
                    style={{
                      flex: "0 0 auto",
                      width: 12,
                      height: 12,
                      marginTop: 2,
                      backgroundColor: C.ink,
                      boxShadow: `inset 2px 2px 0 0 ${C.ink3}, 0 0 0 2px ${C.brassDark}`,
                    }}
                  />
                  <Body size={13} color={C.paper2}>
                    {m}
                  </Body>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 6, backgroundColor: C.ink, boxShadow: `0 0 0 2px ${C.brassDark}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StarRow earned={[false, false, false]} scale={2} />
              <Mono size={13} color={C.brass}>
                THREE STARS ON OFFER
              </Mono>
            </div>
            <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
              {conds.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <PixelSprite name="starOff" scale={1} />
                  <Mono size={13} color={C.paper3}>
                    {c.label.toUpperCase()}
                  </Mono>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "auto" }}>
            <PixelButton
              full
              variant="red"
              size={10}
              icon="magnifier"
              iconScale={1.2}
              onClick={onStart}
              label={isDrill ? "Button — Start Drills" : "Button — Start Investigation"}
            >
              {isDrill ? "START THE DRILLS" : "START INVESTIGATION"}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
