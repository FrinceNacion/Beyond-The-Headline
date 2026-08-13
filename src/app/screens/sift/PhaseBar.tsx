import React from "react";
import { C } from "../../game/palette";
import { Display, Mono, PixelSprite } from "../../components/Pixel";
import { PHASES, type PhaseId } from "../../game/mil";
import { usePrefs } from "../../prefs";

/* The SIFT rail. Four moves, in order, each one gated behind the last.
   The gating is the pedagogy: you cannot mark a claim you haven't checked. */

export function PhaseBar({
  phase,
  done,
  onGo,
}: {
  phase: PhaseId;
  done: Record<PhaseId, boolean>;
  onGo: (p: PhaseId) => void;
}) {
  const { tap } = usePrefs();
  return (
    <div
      role="group"
      aria-label="SIFT progress"
      style={{
        display: "flex",
        gap: 3,
        padding: "3px 4px",
        backgroundColor: C.ink,
        boxShadow: `inset 0 -2px 0 0 ${C.ink3}`,
      }}
    >
      {PHASES.map((p, i) => {
        const complete = done[p.id];
        const active = phase === p.id;
        const prior = i === 0 || done[PHASES[i - 1].id];
        const open = complete || prior;
        return (
          <React.Fragment key={p.id}>
            {i ? (
              <div style={{ alignSelf: "center", width: 8, height: 2, backgroundColor: open ? C.brass : C.ink4 }} />
            ) : null}
            <button
              type="button"
              data-interactive="phase"
              aria-label={`SIFT step ${i + 1} — ${p.label}${complete ? ", done" : open ? "" : ", locked"}`}
              aria-current={active ? "step" : undefined}
              disabled={!open}
              onClick={() => open && onGo(p.id)}
              style={{
                flex: 1,
                minHeight: Math.max(28, tap - 8),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                border: "none",
                cursor: open ? "pointer" : "not-allowed",
                padding: "2px 4px",
                backgroundColor: active ? C.brass : complete ? C.ink3 : C.ink2,
                boxShadow: active
                  ? `inset 2px 2px 0 0 ${C.brassLight}, inset -2px -2px 0 0 ${C.brassDark}, 0 0 0 2px ${C.ink}`
                  : `inset -2px -2px 0 0 ${C.ink}, 0 0 0 2px ${complete ? C.green : C.ink3}`,
              }}
            >
              <PixelSprite name={complete ? "check" : p.sprite} scale={1.1} desaturate={!open} />
              <Display size={7} color={active ? C.ink : complete ? C.greenLight : open ? C.paper3 : C.ink4}>
                {p.label}
              </Display>
              {!open ? <PixelSprite name="lock" scale={0.9} desaturate /> : null}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** The teaching line under the rail — what this move is for, in plain words.
 *  When marking is unlocked, also shows quick-access buttons to revisit completed research. */
export function PhaseHint({
  phase,
  done,
  canMark,
  onOpenRef,
}: {
  phase: PhaseId;
  done?: Record<PhaseId, boolean>;
  canMark?: boolean;
  onOpenRef?: (panel: "coverage" | "trace" | null) => void;
}) {
  const p = PHASES.find((x) => x.id === phase)!;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        backgroundColor: C.ink,
        boxShadow: `inset 0 -2px 0 0 ${C.brassDark}, inset 0 2px 0 0 ${C.ink3}`,
      }}
    >
      <PixelSprite name={p.sprite} scale={1.1} />
      <Mono size={14} color={C.brassLight} style={{ flex: 1 }}>
        {p.teaches}
      </Mono>
      {canMark && done && onOpenRef ? (
        <div style={{ display: "flex", gap: 4 }}>
          <button
            type="button"
            data-interactive="ref-toggle"
            aria-label="Re-open coverage research"
            onClick={() => onOpenRef("coverage")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 5px",
              border: "none",
              cursor: "pointer",
              backgroundColor: C.ink2,
              boxShadow: `0 0 0 2px ${C.brassDark}`,
            }}
          >
            <PixelSprite name="siftCoverage" scale={1} />
            <Mono size={11} color={C.brassLight}>COVERAGE</Mono>
          </button>
          <button
            type="button"
            data-interactive="ref-toggle"
            aria-label="Re-open trace chain"
            onClick={() => onOpenRef("trace")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 5px",
              border: "none",
              cursor: "pointer",
              backgroundColor: C.ink2,
              boxShadow: `0 0 0 2px ${C.brassDark}`,
            }}
          >
            <PixelSprite name="siftTrace" scale={1} />
            <Mono size={11} color={C.brassLight}>TRACE</Mono>
          </button>
        </div>
      ) : null}
    </div>
  );
}
