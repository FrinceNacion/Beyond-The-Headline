import React from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { TopHud } from "../components/Hud";
import { TIERS, formatTime, type Tier } from "../game/timeattack";

/** Corkboard tier picker for Beat the Clock. Red accents throughout — this is not story mode. */
export function ModeSelect({
  tips,
  rank,
  bestTimes,
  onStart,
  onBack,
}: {
  tips: number;
  rank: string;
  bestTimes: Record<string, number>;
  onStart: (tier: Tier) => void;
  onBack: () => void;
}) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopHud
        tips={tips}
        rank={rank}
        accent={C.red}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name="stopwatch" scale={1.2} />
            <Display size={8} color={C.red}>
              BEAT THE CLOCK
            </Display>
          </div>
        }
        right={
          <PixelButton variant="ink" size={8} onClick={onBack} label="Button — Back to title">
            ◂ BACK
          </PixelButton>
        }
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          ...speckle("#6B573A", "#54452E", 4),
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* corkboard frame */}
        <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 0 6px #4A3B27, inset 0 0 0 9px ${C.ink}`, pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Display size={9} color={C.white}>
            PICK YOUR SHIFT
          </Display>
          <Body size={13} color={C.paper2}>
            Shuffled claims every run. The clock does not care how right you are.
          </Body>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, minHeight: 0 }}>
          {TIERS.map((t, i) => {
            const best = bestTimes[t.id];
            return (
              <div
                key={t.id}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  padding: 8,
                  transform: `rotate(${i === 1 ? 0 : i === 0 ? -1.5 : 1.5}deg)`,
                  ...speckle(C.paper, C.paper2, 4),
                  boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}, 6px 6px 0 0 rgba(12,16,20,0.35)`,
                }}
              >
                <div style={{ position: "absolute", left: "50%", top: -8, marginLeft: -6 }}>
                  <PixelSprite name="pin" scale={1.1} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <PixelSprite name="stopwatch" scale={1.6} />
                  <Display size={8} color={C.ink}>
                    {t.name}
                  </Display>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <div>
                    <Mono size={12} color={C.paper4}>
                      TARGET
                    </Mono>
                    <br />
                    <Mono size={20} color={C.red}>
                      {formatTime(t.target)}
                    </Mono>
                  </div>
                  <div>
                    <Mono size={12} color={C.paper4}>
                      LIMIT
                    </Mono>
                    <br />
                    <Mono size={20} color={C.ink3}>
                      {formatTime(t.limit)}
                    </Mono>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span style={{ backgroundColor: C.paper3, boxShadow: `0 0 0 2px ${C.ink}`, padding: "1px 4px" }}>
                    <Mono size={13} color={C.ink}>
                      {t.cases} SOURCE SET{t.cases > 1 ? "S" : ""}
                    </Mono>
                  </span>
                  <span style={{ backgroundColor: C.paper3, boxShadow: `0 0 0 2px ${C.ink}`, padding: "1px 4px" }}>
                    <Mono size={13} color={C.ink}>
                      {t.claimsPerCase} CLAIMS EACH
                    </Mono>
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <Body size={12} color={C.ink}>
                    {t.blurb}
                  </Body>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "2px 5px",
                    backgroundColor: C.ink2,
                    boxShadow: `0 0 0 2px ${C.ink}`,
                  }}
                >
                  <PixelSprite name="medal" scale={1.1} />
                  <Mono size={13} color={C.brass}>
                    BEST
                  </Mono>
                  <Mono size={18} color={best ? C.brassLight : C.ink4}>
                    {best ? formatTime(best) : "--:--"}
                  </Mono>
                </div>

                <PixelButton full variant="red" size={8} icon="clock1" iconScale={1.1} onClick={() => onStart(t)} label={`Button — Start ${t.name} run`}>
                  START RUN
                </PixelButton>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
