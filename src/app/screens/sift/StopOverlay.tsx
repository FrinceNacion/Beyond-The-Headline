import React, { useEffect, useState } from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../../components/Pixel";
import { usePrefs } from "../../prefs";
import { PHASES } from "../../game/mil";

/* Screen 5a — STOP.

   The first move of SIFT is the one nobody does: notice you are reacting.
   The overlay holds the case shut for two seconds. The button is dead for
   that long on purpose — the delay is the lesson, not a loading screen. */

export function StopOverlay({ headline, onContinue }: { headline: string; onContinue: () => void }) {
  const { prefs } = usePrefs();
  const [left, setLeft] = useState(prefs.reduceMotion ? 0 : 2);

  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);

  const ready = left <= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Stop — pause before you react"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        backgroundColor: "rgba(20,24,28,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: 520,
          maxWidth: "100%",
          padding: 12,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PixelSprite name="siftStop" scale={2.2} />
          <div>
            <Display size={11} color={C.red}>
              STOP
            </Display>
            <br />
            <Mono size={13} color={C.paper4}>
              SIFT · STEP ONE OF FOUR
            </Mono>
          </div>
        </div>

        <div
          style={{
            margin: "9px 0",
            padding: 7,
            backgroundColor: C.paper3,
            boxShadow: `inset 2px 2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <Mono size={12} color={C.ink3}>
            THE HEADLINE THAT REACHED YOU
          </Mono>
          <br />
          <Body size={15} color={C.ink}>
            “{headline}”
          </Body>
        </div>

        {/* The Editor, saying the quiet part */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 auto", boxShadow: `0 0 0 2px ${C.ink}` }}>
            <PixelSprite name="editor" scale={1.6} title="The Editor" />
          </div>
          <Body size={14} color={C.ink}>
            Before you decide anything — notice what that headline just did to you. Anger, agreement, the urge to
            send it to someone. That feeling is the product. Read the whole thing first.
          </Body>
        </div>

        {/* The whole loop, laid out in order. Steps two to four are dead until
            you have done the one before — the sequence is the method. */}
        <div style={{ display: "flex", gap: 5, marginTop: 11 }}>
          {PHASES.filter((p) => p.id !== "mark").map((p, i) => {
            const first = i === 0;
            return (
              <div key={p.id} style={{ flex: 1, minWidth: 0 }}>
                <PixelButton
                  full
                  variant={first ? (ready ? "brass" : "ink") : "ink"}
                  size={7}
                  icon={first ? (ready ? "doc" : "hourglass") : p.sprite}
                  iconScale={1}
                  disabled={!first || !ready}
                  onClick={first ? onContinue : undefined}
                  label={`Button — ${first ? "Continue reading" : `${p.label} (locked)`}`}
                >
                  {first ? (ready ? "CONTINUE READING" : `HOLD… ${left}`) : p.label}
                </PixelButton>
                <div style={{ textAlign: "center", marginTop: 2 }}>
                  <Mono size={11} color={first ? C.red : C.paper4}>
                    STEP {i + 1}
                  </Mono>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 4 }}>
          <Mono size={12} color={C.paper4}>
            {ready ? "NOW READ IT PROPERLY. THE OTHER THREE UNLOCK IN ORDER." : "THE PAUSE IS THE POINT."}
          </Mono>
        </div>
      </div>
    </div>
  );
}
