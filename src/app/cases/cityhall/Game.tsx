import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelMeter, PixelSprite } from "../../components/Pixel";
import { StageShell, useInterval } from "../arcade/StageShell";
import type { Drill, DrillApi, StageResult } from "../arcade/stage";
import type { CaseDef } from "../../game/cases";

/* Stage 3 — Privacy Protection. A notch quicker than the library: the first
   drill is pure reflex against a stranger crossing the room, the second keeps
   the reflex but puts a three-way judgement on every message. Same shell,
   same HUD, same lives — only the play area changes. */

/* ---------------------------------------------------------- privacy rescue */

type Datum = { id: string; label: string; tell: string };

const PERSONAL: Datum[] = [
  { id: "d1", label: "PHONE NUMBER", tell: "A number is all a scammer needs to start a conversation you didn't ask for." },
  { id: "d2", label: "BIRTHDAY", tell: "Date of birth is half of most identity checks. Keep it off the timeline." },
  { id: "d3", label: "HOME ADDRESS", tell: "Never the house. Not even the street. A postcode is a map." },
  { id: "d4", label: "SCHOOL", tell: "Your school plus your uniform plus a timetable is a place and a time." },
  { id: "d5", label: "EMAIL ADDRESS", tell: "One posted address is a year of phishing mail. You already met that drill." },
  { id: "d6", label: "CURRENT LOCATION", tell: "Live location says where you are and, just as loudly, where you are not." },
  { id: "d7", label: "BANK CARD", tell: "The long number, the date, the three on the back. All of it, locked." },
  { id: "d8", label: "PASSWORD HINT", tell: "Mother's maiden name is not a hint, it is the answer to a security question." },
  { id: "d9", label: "HOLIDAY DATES", tell: "Posting the dates you're away tells a stranger when the house is empty." },
  { id: "d10", label: "PHOTO GEOTAG", tell: "The picture is fine. The coordinates stitched into it are not traceable." },
];

type Bubble = { id: string; x: number; y: number; vx: number; vy: number; d: Datum };
type Pop = { id: number; x: number; y: number; f: number };

/** The play area is worked in percentages so it fits both canvases unchanged. */
const GRAB_DIST = 6;

function PrivacyRescue({ api }: { api: DrillApi }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]); // stores all infos currently on screen
  const [snoop, setSnoop] = useState({ x: 88, y: 70 }); // location ng "thief" snoop
  const [locked, setLocked] = useState<string[]>([]); // stores infos succesfully protected
  const [grabbed, setGrabbed] = useState(0); // num of infos stolen by snoop
  const [pops, setPops] = useState<Pop[]>([]);
  const next = useRef(0);
  const wait = useRef(0);
  const resolved = useRef(0);
  const popSeq = useRef(0);

  const started = locked.length + grabbed;

  const lock = useCallback(
    (id: string) => {
      if (!api.running) return;
      const b = bubbles.find((x) => x.id === id);
      if (!b) return;
      resolved.current += 1;
      setBubbles((cur) => cur.filter((x) => x.id !== id));
      setLocked((cur) => [...cur, b.d.label]);
      // the lock lands where the bubble was, four hard frames
      setPops((cur) => [...cur, { id: popSeq.current++, x: b.x, y: b.y, f: 0 }]);
      api.call(true, b.d.tell);
    },
    [bubbles, api],
  );

  useInterval(() => {
    // everything speeds up as the round runs on, the stranger fastest of all
    const step = 1 + Math.min(0.12, resolved.current * 0.16); // speed ng buble (infos)
    const reach = 1 + Math.min(0.5, resolved.current * 0.28); // speed ng snoop
    // and the drift gets less predictable the longer you leave a detail out
    const jitter = Math.min(0.34, resolved.current * 0.045);

    const keep: Bubble[] = [];
    for (const b of bubbles) {
      let { x, y, vx, vy } = b;
      vx += (Math.random() - 0.5) * jitter;
      vy += (Math.random() - 0.5) * jitter;
      vx = Math.max(-1.6, Math.min(1.6, vx));
      vy = Math.max(-1.4, Math.min(1.4, vy));
      x += vx * step;
      y += vy * step;
      if (x < 4 || x > 92) vx = -vx;
      if (y < 6 || y > 84) vy = -vy;
      keep.push({ ...b, x: Math.max(4, Math.min(92, x)), y: Math.max(6, Math.min(84, y)), vx, vy });
    }

    // the stranger walks at the nearest unlocked detail
    let target = keep[0];
    let best = Infinity;
    for (const b of keep) {
      const d = Math.hypot(b.x - snoop.x, b.y - snoop.y);
      if (d < best) {
        best = d;
        target = b;
      }
    }
    if (target) {
      const dx = target.x - snoop.x;
      const dy = target.y - snoop.y;
      const len = Math.max(0.001, Math.hypot(dx, dy));
      setSnoop({ x: snoop.x + (dx / len) * reach, y: snoop.y + (dy / len) * reach });
      if (best <= GRAB_DIST) {
        resolved.current += 1;
        setGrabbed((n) => n + 1);
        api.call(false, target.d.tell);
        const stolenId = target.id;
        setBubbles(keep.filter((b) => b.id !== stolenId));
        setPops((cur) => cur.map((p) => ({ ...p, f: p.f + 1 })).filter((p) => p.f < 4));
        return;
      }
    }

    // hand out details on a steady beat, a few more on screen as it goes
    const cap = 2 + Math.min(2, Math.floor(resolved.current / 3));
    if (wait.current <= 0 && next.current < PERSONAL.length && keep.length < cap) {
      const d = PERSONAL[next.current++];
      keep.push({
        id: d.id,
        x: 12 + Math.random() * 60,
        y: 14 + Math.random() * 56,
        vx: Math.random() < 0.5 ? -0.9 : 0.9,
        vy: Math.random() < 0.5 ? -0.7 : 0.7,
        d,
      });
      wait.current = 14;
    } else {
      wait.current -= 1;
    }

    setBubbles(keep);
    setPops((cur) => cur.map((p) => ({ ...p, f: p.f + 1 })).filter((p) => p.f < 4));
    if (next.current >= PERSONAL.length && !keep.length) api.finish();
  }, api.running ? 90 : null);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* the vault tally, in the same slab treatment as the belt end markers */}
      <div
        style={{
          position: "absolute",
          left: 8,
          bottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          ...speckle(C.ink, C.ink2, 4),
          boxShadow: `0 0 0 2px ${C.brassDark}`,
          zIndex: 3,
        }}
      >
        <PixelSprite name="vault" scale={1.4} title="Vault" />
        <Display size={8} color={C.brassLight}>
          VAULT {locked.length}/{PERSONAL.length}
        </Display>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 300 }}>
          {locked.slice(-4).map((l, i) => (
            <span
              key={`${l}-${i}`}
              className="bth-stamp"
              style={{ padding: "1px 4px", backgroundColor: C.paper2, boxShadow: `0 0 0 2px ${C.ink}` }}
            >
              <Mono size={12} color={C.ink}>
                {l}
              </Mono>
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 8,
          bottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 8px",
          backgroundColor: C.ink2,
          boxShadow: `0 0 0 2px ${grabbed ? C.red : C.ink3}`,
          zIndex: 3,
        }}
      >
        <PixelSprite name="snoop" scale={1.2} />
        <Mono size={13} color={grabbed ? C.red : C.paper4}>
          TAKEN {grabbed}
        </Mono>
      </div>

      {/* the lock landing on a rescued detail */}
      {pops.map((p) => (
        <div
          key={p.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(-50%, -50%) scale(${1 + p.f * 0.35})`,
            opacity: p.f >= 3 ? 0.3 : 1,
            zIndex: 2,
          }}
        >
          <div style={{ backgroundColor: C.ink, boxShadow: `0 0 0 2px ${C.green}` }}>
            <PixelSprite name="padlockShut" scale={1.4} />
          </div>
        </div>
      ))}

      {/* the stranger */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${snoop.x}%`,
          top: `${snoop.y}%`,
          transform: "translate(-50%, -50%)",
          zIndex: 2,
        }}
      >
        <div style={{ boxShadow: `0 0 0 2px ${C.red}`, backgroundColor: C.ink }}>
          <PixelSprite name="snoop" scale={2} />
        </div>
      </div>

      {bubbles.map((b) => (
        <button
          key={b.id}
          type="button"
          data-interactive="data-bubble"
          aria-label={`Button — Lock ${b.d.label} in the vault`}
          onClick={() => lock(b.id)}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 7px",
            cursor: "pointer",
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <PixelSprite name="padlockShut" scale={1} />
          <Mono size={14} color={C.ink}>
            {b.d.label}
          </Mono>
        </button>
      ))}

      {started === 0 ? (
        <div style={{ position: "absolute", left: "50%", top: 30, transform: "translateX(-50%)" }}>
          <Body size={13} color={C.paper4}>
            Tap a detail to lock it. He is walking at the nearest one.
          </Body>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- cyber shield */

type MsgKind = "toxic" | "neutral" | "positive" | "bait";

type Msg = { id: string; text: string; kind: MsgKind; from: string; tell: string };

/* Bait reads like praise and ends in a hook — the trick element. It is blocked
   like anything else harmful, which is the whole point of the round. */
const STREAM: Msg[] = [
  { id: "m1", text: "You're terrible.", kind: "toxic", from: "@anon_4471", tell: "Straight abuse. Block it, don't argue with it." },
  { id: "m2", text: "Seen your post.", kind: "neutral", from: "@dara_k", tell: "Neutral. Nothing to block, nothing to boost — let it through." },
  { id: "m3", text: "Great job!", kind: "positive", from: "@nuala.b", tell: "Genuine praise from someone you know. Hold the shield on it." },
  { id: "m4", text: "Nobody likes you.", kind: "toxic", from: "@anon_9920", tell: "Designed to land, not to start a conversation. Block." },
  { id: "m5", text: "Great job! Claim your creator bonus here ⇢", kind: "bait", from: "@creator-rewards.live", tell: "Praise with a link on the end is bait wearing a compliment." },
  { id: "m6", text: "Check this out.", kind: "neutral", from: "@t.okafor", tell: "Neutral and from the desk. Approve it and move on." },
  { id: "m7", text: "You can do it!", kind: "positive", from: "@ade.bello", tell: "Worth amplifying. Protecting good messages is half of a safe feed." },
  { id: "m8", text: "Give up.", kind: "toxic", from: "@anon_1183", tell: "Two words, one target. Block." },
  { id: "m9", text: "Are you there?", kind: "neutral", from: "@rosewood_now", tell: "Nosy, not harmful. Approve." },
  { id: "m10", text: "Nice work! Verify your account to keep the badge ⇢", kind: "bait", from: "@support-verify.co", tell: "No platform asks you to verify through a compliment." },
  { id: "m11", text: "Delete your account.", kind: "toxic", from: "@anon_2210", tell: "Block, report, and keep the screenshot. Never the reply." },
  { id: "m12", text: "Nice work!", kind: "positive", from: "@m.odell", tell: "The Editor, being briefly nice. Boost it while it lasts." },
];

type Flying = { id: string; x: number; row: number; msg: Msg };
type Fx = { id: number; kind: "block" | "approve" | "protect"; x: number; row: number; f: number };

const ROWS = [10, 78, 146];
const SHIELD_X = 104;
const HOLD_MS = 340;

function CyberShield({ api }: { api: DrillApi }) {
  const lane = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<Flying[]>([]);
  const [fx, setFx] = useState<Fx[]>([]);
  const [meter, setMeter] = useState(0.5);
  const [weak, setWeak] = useState(false);
  const [holding, setHolding] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; from: number; dx: number } | null>(null);
  const grip = useRef<{ id: string; from: number; dx: number } | null>(null);
  const next = useRef(0);
  const wait = useRef(0);
  const resolved = useRef(0);
  const fxSeq = useRef(0);

  const laneW = () => lane.current?.clientWidth ?? 640;

  const burst = useCallback((kind: Fx["kind"], x: number, row: number) => {
    setFx((cur) => [...cur, { id: fxSeq.current++, kind, x, row, f: 0 }]);
  }, []);

  const judge = useCallback(
    (m: Msg, action: "block" | "approve" | "protect") => {
      const want: Record<MsgKind, "block" | "approve" | "protect"> = {
        toxic: "block",
        bait: "block",
        neutral: "approve",
        positive: "protect",
      };
      const right = want[m.kind] === action;
      resolved.current += 1;
      setMeter((v) => Math.max(0, Math.min(1, v + (right ? 0.12 : -0.16))));
      if (!right) {
        // the shield takes a beat to come back up, and less of one later on
        setWeak(true);
        window.setTimeout(() => setWeak(false), resolved.current > 6 ? 700 : 900);
      }
      api.call(right, m.tell);
    },
    [api],
  );

  const act = useCallback(
    (id: string, action: "block" | "approve" | "protect") => {
      if (!api.running) return;
      const it = items.find((x) => x.id === id);
      if (!it) return;
      setItems((cur) => cur.filter((x) => x.id !== id));
      burst(action, it.x, it.row);
      judge(it.msg, action);
    },
    [items, api.running, burst, judge],
  );

  /* --------------------------------------------------------------- pacing */
  useInterval(() => {
    // the stream tightens up as the round goes on
    const speed = 3 + Math.min(3, Math.floor(resolved.current / 3));

    const keep: Flying[] = [];
    for (const it of items) {
      if (drag?.id === it.id) {
        keep.push(it);
        continue;
      }
      const x = it.x - speed;
      // anything that reaches the shield unhandled is a call you didn't make
      if (x <= SHIELD_X) judge(it.msg, it.msg.kind === "neutral" ? "block" : "approve");
      else keep.push({ ...it, x });
    }

    // clusters start appearing once the player has the rhythm
    const cap = resolved.current >= 4 ? 3 : 2;
    if (wait.current <= 0 && next.current < STREAM.length && keep.length < cap) {
      const msg = STREAM[next.current++];
      const taken = keep.map((k) => k.row);
      const row = ROWS.findIndex((_, i) => !taken.includes(i));
      keep.push({ id: msg.id, x: laneW(), row: row < 0 ? next.current % ROWS.length : row, msg });
      wait.current = resolved.current >= 4 ? 12 : 18;
    } else {
      wait.current -= 1;
    }

    setItems(keep);
    setFx((cur) => cur.map((f) => ({ ...f, f: f.f + 1 })).filter((f) => f.f < 4));
    if (next.current >= STREAM.length && !keep.length) api.finish();
  }, api.running ? 90 : null);

  /* One grip, three readings: a shove left blocks, a steady hold protects, and
     a quick tap approves — the same drag/tap vocabulary as the earlier stages. */
  const release = useCallback(() => {
    const g = grip.current;
    grip.current = null;
    setDrag(null);
    setHolding(null);
    if (!g) return;
    if (g.dx <= -90) act(g.id, "block");
    else if (Math.abs(g.dx) < 20) act(g.id, "approve");
  }, [act]);

  const takeGrip = useCallback((id: string, from: number) => {
    grip.current = { id, from, dx: 0 };
    setDrag({ id, from, dx: 0 });
    setHolding(null);
  }, []);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const g = grip.current;
      if (!g) return;
      g.dx = e.clientX - g.from;
      setDrag({ id: g.id, from: g.from, dx: g.dx });
      if (g.dx <= -90) {
        const id = g.id;
        grip.current = null;
        setDrag(null);
        setHolding(null);
        act(id, "block");
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [drag, act, release]);

  // holding still over a message is how you protect it
  const gripId = drag?.id ?? null;
  useEffect(() => {
    if (!gripId) return;
    const t = window.setTimeout(() => {
      const g = grip.current;
      if (!g || g.id !== gripId || Math.abs(g.dx) >= 20) return;
      grip.current = null;
      setDrag(null);
      setHolding(null);
      act(gripId, "protect");
    }, HOLD_MS);
    const lit = window.setTimeout(() => setHolding(gripId), 140);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(lit);
    };
  }, [gripId, act]);

  return (
    <div ref={lane} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* the avatar and the shield the stream is heading for */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: SHIELD_X,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          ...speckle(C.ink2, C.ink3, 4),
          boxShadow: `inset -3px 0 0 0 ${weak ? C.red : C.green}`,
        }}
      >
        <PixelSprite name="kid" scale={2} />
        <div className={weak ? undefined : "bth-pulse"} style={{ backgroundColor: C.ink }}>
          <PixelSprite name={weak ? "shieldDown" : "shield"} scale={2} />
        </div>
        <Display size={7} color={weak ? C.red : C.greenLight}>
          {weak ? "RECHARGING" : "SHIELD UP"}
        </Display>
      </div>

      {/* digital safety meter — the same meter the shop and tracker use */}
      <div
        style={{
          position: "absolute",
          right: 8,
          bottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          backgroundColor: C.ink2,
          boxShadow: `0 0 0 2px ${C.ink3}`,
          zIndex: 3,
        }}
      >
        <Mono size={13} color={C.brass}>
          DIGITAL SAFETY
        </Mono>
        <PixelMeter value={meter} width={140} height={12} cells={14} fill={meter < 0.35 ? C.red : C.green} />
      </div>

      {fx.map((f) => (
        <FxMark key={f.id} fx={f} />
      ))}

      {items.map((it) => {
        const dx = drag?.id === it.id ? drag.dx : 0;
        const held = holding === it.id;
        return (
          <div
            key={it.id}
            data-interactive="stream-message"
            onPointerDown={(e) => {
              if (!api.running) return;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              takeGrip(it.id, e.clientX);
            }}
            style={{
              position: "absolute",
              left: it.x + dx,
              top: ROWS[it.row],
              width: 288,
              padding: 5,
              cursor: "grab",
              touchAction: "none",
              transform: held ? "scale(1.04)" : undefined,
              ...speckle(C.paper, C.paper2, 4),
              boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${
                held ? C.green : C.ink
              }`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <PixelSprite name="speech" scale={0.9} />
              <Mono size={12} color={C.paper4} style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                {it.msg.from}
              </Mono>
            </div>
            <div style={{ marginTop: 2 }}>
              <Body size={13} color={C.ink}>
                {it.msg.text}
              </Body>
            </div>
            <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
              <StreamAction label="◂ BLOCK" tone={C.red} onClick={() => act(it.id, "block")} />
              <StreamAction label="APPROVE" tone={C.brassDark} onClick={() => act(it.id, "approve")} />
              <StreamAction label="PROTECT" tone={C.greenDark} onClick={() => act(it.id, "protect")} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Chunky in-card action, same treatment as the SHRED chip on stage one. */
function StreamAction({ label, tone, onClick }: { label: string; tone: string; onClick: () => void }) {
  return (
    <button
      type="button"
      data-interactive="chip"
      aria-label={`Button — ${label.replace("◂ ", "")} this message`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      style={{
        fontFamily: "inherit",
        padding: "1px 5px",
        cursor: "pointer",
        backgroundColor: tone,
        boxShadow: `inset 2px 2px 0 0 ${C.paper4}, inset -2px -2px 0 0 ${C.ink}, 0 0 0 2px ${C.ink}`,
      }}
    >
      <Mono size={12} color={C.white}>
        {label}
      </Mono>
    </button>
  );
}

/** Four hard frames: glitch out, float up, or glow wider. No easing anywhere. */
function FxMark({ fx }: { fx: Fx }) {
  const tone = fx.kind === "block" ? C.red : fx.kind === "protect" ? C.green : C.brass;
  const size = fx.kind === "protect" ? 10 + fx.f * 6 : 8;
  const lift = fx.kind === "approve" ? -fx.f * 7 : 0;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: fx.x + 120,
        top: ROWS[fx.row] + 20 + lift,
        display: "flex",
        gap: 3,
        opacity: fx.f >= 3 ? 0.35 : 1,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            backgroundColor: tone,
            transform: fx.kind === "block" ? `translate(${(i - 1) * (fx.f * 5)}px, ${fx.f * 3}px)` : undefined,
            boxShadow: `0 0 0 2px ${C.ink}`,
          }}
        />
      ))}
    </div>
  );
}

export const CITYHALL_DRILLS: Drill[] = [
  {
    id: "privacy",
    name: "PRIVACY RESCUE",
    objective: "Lock every personal detail in the vault before the stranger reaches it.",
    how: [
      "Tap a floating detail to lock it away.",
      "The stranger always walks at the nearest one. Clear that one first.",
      "Anything he reaches costs a life — and he gets quicker as you go.",
    ],
    sprite: "vault",
    seconds: 60,
    Component: PrivacyRescue,
  },
  {
    id: "shield",
    name: "CYBER SHIELD",
    objective: "Block the harmful, approve the neutral, hold the shield on the good.",
    how: [
      "Drag a message left — or press BLOCK — to stop anything harmful.",
      "Press APPROVE for ordinary messages. Hold a message, or press PROTECT, to boost a kind one.",
      "Praise with a link on the end is bait. Block it like the rest.",
    ],
    sprite: "shield",
    seconds: 75,
    Component: CyberShield,
  },
];

export function CityHallStage({
  cs,
  tips,
  rank,
  index,
  clockFrame,
  onComplete,
  onExit,
}: {
  cs: CaseDef;
  tips: number;
  rank: string;
  index: number;
  clockFrame: number;
  onComplete: (r: StageResult) => void;
  onExit: () => void;
}) {
  const drills = useMemo(() => CITYHALL_DRILLS, []);
  return (
    <StageShell
      cs={cs}
      tips={tips}
      rank={rank}
      index={index}
      drills={drills}
      clockFrame={clockFrame}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
}
