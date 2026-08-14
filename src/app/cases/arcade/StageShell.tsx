import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C, dither, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../../components/Pixel";
import { TopHud } from "../../components/Hud";
import { StarRow } from "../../components/Stars";
import { usePrefs } from "../../prefs";
import type { CaseDef } from "../../game/cases";
import { POINTS_PER_CALL, STAGE_LIVES, STAGE_STARS, type Drill, type DrillApi, type StageResult } from "./stage";

/* The frame every drill runs inside: stage HUD, drill card, gameplay slot,
   the wipe between drills, and the success / failure outcome. Nothing in a
   drill draws chrome of its own, so both stages pace and read identically. */

/** setInterval with a live callback. Pass ms = null to stop the clock. */
export function useInterval(cb: () => void, ms: number | null) {
  const saved = useRef(cb);
  saved.current = cb;
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => saved.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

type Phase = "card" | "play" | "wipe" | "win" | "lose";

export function StageShell({
  cs,
  tips,
  rank,
  index,
  drills,
  clockFrame,
  onComplete,
  onExit,
}: {
  cs: CaseDef;
  tips: number;
  rank: string;
  /** stage number on the board, for the "STAGE 2 OF 8" readout */
  index: number;
  drills: Drill[];
  clockFrame: number;
  onComplete: (r: StageResult) => void;
  onExit: () => void;
}) {
  const { prefs } = usePrefs();
  const [run, setRun] = useState(0); // bumped on retry to remount the drills
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("card");
  const [lives, setLives] = useState(STAGE_LIVES);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [calls, setCalls] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(drills[0].seconds);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const reported = useRef(false);

  const drill = drills[Math.min(idx, drills.length - 1)];

  /* ------------------------------------------------------------- drill api */
  const advance = useCallback(() => {
    if (idx >= drills.length - 1) {
      setPhase("win");
      return;
    }
    setIdx(idx + 1);
    setPhase("wipe");
  }, [idx, drills.length]);

  const call = useCallback(
    (right: boolean, why?: string) => {
      setCalls((n) => n + 1);
      setFlash(right ? "good" : "bad");
      window.setTimeout(() => setFlash(null), 220);
      if (why) {
        setNote(why);
        window.setTimeout(() => setNote((n) => (n === why ? null : n)), 1800);
      }
      if (right) {
        setCorrect((n) => n + 1);
        setScore((s) => s + POINTS_PER_CALL);
        return;
      }
      setWrong((n) => n + 1);
      setLives(Math.max(0, lives - 1));
      if (lives - 1 <= 0) setPhase("lose");
    },
    [lives],
  );

  const api = useMemo<DrillApi>(
    () => ({ call, finish: advance, lives, running: phase === "play" }),
    [call, advance, lives, phase],
  );

  /* -------------------------------------------------------------- pacing */
  // the drill clock only runs while the gameplay is live
  useInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), phase === "play" ? 1000 : null);

  useEffect(() => {
    if (phase === "play" && timeLeft <= 0) advance();
  }, [phase, timeLeft, advance]);

  // the wipe is three chunky frames, or a beat with motion reduced
  useEffect(() => {
    if (phase !== "wipe") return;
    const t = window.setTimeout(() => setPhase("card"), prefs.reduceMotion ? 240 : 780);
    return () => window.clearTimeout(t);
  }, [phase, prefs.reduceMotion]);

  const startDrill = useCallback(() => {
    setTimeLeft(drill.seconds);
    setPhase("play");
  }, [drill.seconds]);

  /* ------------------------------------------------------------- outcome */
  const stars = useMemo(() => {
    if (phase !== "win") return [false, false, false];
    return [true, lives >= 2, wrong === 0];
  }, [phase, lives, wrong]);

  const clearBonus = phase === "win" ? 30 + timeLeft : 0;
  const payout = score + clearBonus;

  const report = useCallback(
    (cleared: boolean) => {
      if (reported.current) return;
      reported.current = true;
      onComplete({
        cleared,
        stars: cleared ? stars.filter(Boolean).length : 0,
        tips: cleared ? payout : Math.floor(score / 2),
        correct,
        calls,
      });
    },
    [onComplete, stars, payout, score, correct, calls],
  );

  const retry = useCallback(() => {
    report(phase === "win");
    reported.current = false;
    setRun((r) => r + 1);
    setIdx(0);
    setLives(STAGE_LIVES);
    setScore(0);
    setCorrect(0);
    setCalls(0);
    setWrong(0);
    setTimeLeft(drills[0].seconds);
    setPhase("card");
  }, [report, phase, drills]);

  const leave = useCallback(
    (cleared: boolean) => {
      report(cleared);
      onExit();
    },
    [report, onExit],
  );

  const mins = Math.floor(Math.max(0, timeLeft) / 60);
  const secs = Math.max(0, timeLeft) % 60;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <TopHud
        tips={tips}
        rank={rank}
        onMap={() => leave(false)}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name={cs.sprite} scale={0.9} />
            <Display size={8} color={C.brassLight}>
              {cs.tag}
            </Display>
            <Body size={13} color={C.paper3}>
              {drill.name}
            </Body>
          </div>
        }
        right={
          <>
            {/* lives, score and the drill clock — the same three readouts all stage long */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                padding: "3px 6px",
                backgroundColor: C.ink2,
                boxShadow: `0 0 0 2px ${lives <= 1 ? C.red : C.ink3}`,
              }}
            >
              {Array.from({ length: STAGE_LIVES }, (_, i) => (
                <PixelSprite
                  key={i}
                  name={i < lives ? "heart" : "heartOff"}
                  scale={1.2}
                  title={i < lives ? "Life remaining" : "Life lost"}
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 6px",
                backgroundColor: C.ink2,
                boxShadow: `0 0 0 2px ${C.ink3}`,
              }}
            >
              <Mono size={12} color={C.brass}>
                SCORE
              </Mono>
              <Mono size={18} color={C.brassLight}>
                {score}
              </Mono>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 6px",
                backgroundColor: C.ink2,
                boxShadow: `0 0 0 2px ${timeLeft <= 10 ? C.red : C.ink3}`,
              }}
            >
              <PixelSprite name={clockFrame % 2 ? "clock2" : "clock1"} scale={1.2} />
              <Mono size={16} color={timeLeft <= 10 ? C.red : C.paper2}>
                {mins}:{String(secs).padStart(2, "0")}
              </Mono>
            </div>
          </>
        }
      />

      {/* objective strip — the drill's one job, always on screen */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 8px",
          backgroundColor: C.ink2,
          boxShadow: `inset 0 -2px 0 0 ${C.brassDark}`,
        }}
      >
        <PixelSprite name={drill.sprite} scale={1} />
        <Display size={7} color={C.brassLight}>
          DRILL {idx + 1}/{drills.length}
        </Display>
        <Body size={13} color={C.paper2}>
          {drill.objective}
        </Body>
        <div style={{ flex: 1 }} />
        <Mono size={13} color={C.brass}>
          STAGE {index + 1}
        </Mono>
      </div>

      {/* --------------------------------------------------------- gameplay */}
      <div style={{ flex: 1, minHeight: 0, position: "relative", backgroundColor: "transparent" }}>
        {phase === "play" || phase === "card" ? (
          <drill.Component key={`${run}-${drill.id}`} api={api} />
        ) : null}

        {/* wrong-call / right-call frame flash, two hard frames only */}
        {flash ? (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              boxShadow: `inset 0 0 0 6px ${flash === "good" ? C.green : C.red}`,
            }}
          />
        ) : null}

        {note ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 8,
              transform: "translateX(-50%)",
              padding: "4px 8px",
              backgroundColor: C.ink,
              boxShadow: `0 0 0 2px ${C.brassDark}`,
              maxWidth: "86%",
            }}
          >
            <Body size={13} color={C.paper2}>
              {note}
            </Body>
          </div>
        ) : null}

        {phase === "card" ? (
          <DrillCard drill={drill} n={idx + 1} total={drills.length} onStart={startDrill} />
        ) : null}
        {phase === "wipe" ? <Wipe /> : null}
        {phase === "win" || phase === "lose" ? (
          <Outcome
            cleared={phase === "win"}
            cs={cs}
            stars={stars}
            score={score}
            bonus={clearBonus}
            payout={phase === "win" ? payout : Math.floor(score / 2)}
            wrong={wrong}
            lives={lives}
            onRetry={retry}
            onLeave={() => leave(phase === "win")}
          />
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- drill card */

function DrillCard({
  drill,
  n,
  total,
  onStart,
}: {
  drill: Drill;
  n: number;
  total: number;
  onStart: () => void;
}) {
  return (
    <Overlay>
      <div
        style={{
          width: 430,
          maxWidth: "94%",
          padding: 14,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ boxShadow: `0 0 0 2px ${C.ink}` }}>
            <PixelSprite name={drill.sprite} scale={2} title={drill.name} />
          </div>
          <div>
            <Mono size={13} color={C.paper4}>
              DRILL {n} OF {total}
            </Mono>
            <br />
            <Display size={11} color={C.ink}>
              {drill.name}
            </Display>
          </div>
        </div>

        <div style={{ marginTop: 8, padding: "6px 8px", backgroundColor: C.paper3, boxShadow: `0 0 0 2px ${C.ink}` }}>
          <Display size={7} color={C.red}>
            OBJECTIVE
          </Display>
          <div style={{ marginTop: 3 }}>
            <Body size={14} color={C.ink}>
              {drill.objective}
            </Body>
          </div>
        </div>

        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {drill.how.map((h) => (
            <div key={h} style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
              <div
                style={{
                  flex: "0 0 auto",
                  width: 10,
                  height: 10,
                  marginTop: 3,
                  backgroundColor: C.ink,
                  boxShadow: `inset 2px 2px 0 0 ${C.paper4}`,
                }}
              />
              <Body size={13} color={C.ink}>
                {h}
              </Body>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <Mono size={13} color={C.paper4}>
            {drill.seconds}s ON THE CLOCK
          </Mono>
          <div style={{ flex: 1 }} />
          <PixelButton variant="red" size={10} icon="magnifier" iconScale={1.1} onClick={onStart} label="Button — Begin drill">
            BEGIN DRILL
          </PixelButton>
        </div>
      </div>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ wipe */

/** Three-frame ink wipe between drills — the same chunky step the folder uses. */
function Wipe() {
  const [f, setF] = useState(0);
  useInterval(() => setF((v) => Math.min(v + 1, 3)), 200);
  const cols = 12;
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex" }}>
      {Array.from({ length: cols }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.min(100, f * 34 + (i % 3) * 6)}%`,
            ...speckle(C.ink, C.ink3, 4),
            boxShadow: `inset -2px 0 0 0 ${C.ink2}`,
          }}
        />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- outcome */

function Outcome({
  cleared,
  cs,
  stars,
  score,
  bonus,
  payout,
  wrong,
  lives,
  onRetry,
  onLeave,
}: {
  cleared: boolean;
  cs: CaseDef;
  stars: boolean[];
  score: number;
  bonus: number;
  payout: number;
  wrong: number;
  lives: number;
  onRetry: () => void;
  onLeave: () => void;
}) {
  return (
    <Overlay>
      <div
        style={{
          width: 460,
          maxWidth: "94%",
          padding: 14,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <PixelSprite name={cleared ? "check" : "cross"} scale={2} />
          <Display size={14} color={cleared ? C.green : C.red}>
            {cleared ? "STAGE CLEAR" : "STAGE FAILED"}
          </Display>
        </div>
        <br />
        <Mono size={14} color={C.paper4}>
          {cs.tag} · {cs.building.toUpperCase()}
        </Mono>

        <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
          <StarRow earned={stars} scale={2.4} animate={cleared} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
          {STAGE_STARS.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <PixelSprite name={stars[i] ? "starOn" : "starOff"} scale={1} />
              <Mono size={13} color={stars[i] ? C.ink : C.paper4}>
                {label.toUpperCase()}
              </Mono>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            padding: "6px 8px",
            backgroundColor: C.ink,
            boxShadow: `0 0 0 2px ${C.brassDark}`,
          }}
        >
          <Mono size={14} color={C.paper3}>
            SCORE {score}
          </Mono>
          {cleared ? (
            <Mono size={14} color={C.paper3}>
              · CLEAR BONUS {bonus}
            </Mono>
          ) : null}
          <Mono size={14} color={C.paper3}>
            · WRONG CALLS {wrong}
          </Mono>
          <Mono size={14} color={C.paper3}>
            · LIVES {lives}
          </Mono>
        </div>

        <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <PixelSprite name="coin" scale={1.4} />
          <Display size={11} color={C.ink}>
            {payout} TIPS EARNED
          </Display>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
          <PixelButton variant="paper" size={9} onClick={onRetry} label="Button — Run the stage again">
            RUN IT AGAIN
          </PixelButton>
          <PixelButton variant="red" size={9} icon="pin" iconScale={1.1} onClick={onLeave} label="Button — Back to the map">
            {cleared ? "NEXT STAGE ▸" : "BACK TO MAP"}
          </PixelButton>
        </div>
      </div>
    </Overlay>
  );
}

/** Shared modal scrim — flat ink, never a blur. */
export function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        backgroundColor: "rgba(20,24,28,0.86)",
        zIndex: 20,
      }}
    >
      {children}
    </div>
  );
}
