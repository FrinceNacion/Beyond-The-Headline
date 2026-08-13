import React, { useCallback, useMemo, useRef, useState } from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelMeter, PixelSprite } from "../../components/Pixel";
import { StageShell, useInterval } from "../arcade/StageShell";
import type { Drill, DrillApi, StageResult } from "../arcade/stage";
import type { CaseDef } from "../../game/cases";

/* Stage 4 — Scam Calls & OTP Security. Same pacing as stage three: one drill
   that judges a card before a clock runs out, one that is pure hands. */

/* ------------------------------------------------------------------ call drop */

type Call = { id: string; who: string; number: string; line: string; scam: boolean; tell: string };

/* Ordered so the tells get quieter: the first scams announce themselves, the
   last one is a single wrong digit on a number you already know. */
const CALLS: Call[] = [
  {
    id: "c1",
    who: "UNKNOWN",
    number: "+44 7700 900118",
    line: "\"This is your bank's fraud team. Read me the code we just sent.\"",
    scam: true,
    tell: "No fraud team ever asks for the code. The code is the thing they are after.",
  },
  {
    id: "c2",
    who: "ROSEWOOD LEDGER — DESK",
    number: "01632 960 411",
    line: "\"Copy's late. Where is it?\"",
    scam: false,
    tell: "Your own newsroom, from the number in your contacts. Let it connect.",
  },
  {
    id: "c3",
    who: "UNKNOWN",
    number: "+1 202 555 0143",
    line: "\"Your national insurance number has been suspended.\"",
    scam: true,
    tell: "Numbers do not get suspended. Threat plus urgency plus a foreign line — drop it.",
  },
  {
    id: "c4",
    who: "LENDING LIBRARY",
    number: "01632 960 227",
    line: "\"Your reservation is in until Friday.\"",
    scam: false,
    tell: "Ordinary, specific, asks nothing of you. Perfectly real.",
  },
  {
    id: "c5",
    who: "ROSEWOOD POST — DELIVERY",
    number: "+44 7700 900902",
    line: "\"Small redelivery fee. I can take the card now.\"",
    scam: true,
    tell: "You met this one at the post office. Nobody takes a card fee over the phone.",
  },
  {
    id: "c6",
    who: "A. BELLO",
    number: "01632 960 188",
    line: "\"Counter's quiet, come down if you still want that quote.\"",
    scam: false,
    tell: "A named contact returning your call. Nothing asked, nothing offered.",
  },
  {
    id: "c7",
    who: "MICROSOFT SUPPORT",
    number: "WITHHELD",
    line: "\"We have detected a virus. Install our remote tool.\"",
    scam: true,
    tell: "Withheld number, a company that never rings first, and remote access at the end.",
  },
  {
    id: "c8",
    who: "ROSEWOOD COUNCIL",
    number: "01632 960 700",
    line: "\"Minutes for Thursday are up on the site.\"",
    scam: false,
    tell: "Council switchboard, public information. Let it through.",
  },
  {
    id: "c9",
    who: "ROSEWOOD LEDGER — DESK",
    number: "01632 960 412",
    line: "\"It's the desk. New number. Send the OTP over to this one, quickly.\"",
    scam: true,
    tell: "One digit off your own newsroom, and a rush at the end. That digit is the whole tell.",
  },
];

const RING_TICKS = 34; // 90ms ticks before a call connects on its own

function CallDrop({ api }: { api: DrillApi }) {
  const [i, setI] = useState(0);
  const [ring, setRing] = useState(0);
  const [dy, setDyState] = useState(0);
  const [gone, setGone] = useState<"dropped" | "connected" | null>(null);
  const dyRef = useRef(0);
  const grip = useRef<number | null>(null);
  const busy = useRef(false);

  const call = CALLS[i];

  const setDy = useCallback((v: number) => {
    dyRef.current = v;
    setDyState(v);
  }, []);

  const resolve = useCallback(
    (dropped: boolean) => {
      if (busy.current || !call) return;
      busy.current = true;
      setGone(dropped ? "dropped" : "connected");
      api.call(dropped === call.scam, call.tell);
      window.setTimeout(() => {
        busy.current = false;
        setGone(null);
        setRing(0);
        setDy(0);
        if (i >= CALLS.length - 1) api.finish();
        else setI(i + 1);
      }, 620);
    },
    [call, api, i, setDy],
  );

  // the ring-out clock: a call you leave alone eventually connects
  useInterval(() => {
    if (busy.current) return;
    const ticks = Math.max(20, RING_TICKS - i * 2);
    if (ring + 1 >= ticks) resolve(false);
    else setRing(ring + 1);
  }, api.running ? 90 : null);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (grip.current === null) return;
      setDy(Math.min(0, e.clientY - grip.current));
    },
    [setDy],
  );

  const onUp = useCallback(() => {
    if (grip.current === null) return;
    grip.current = null;
    // a flick upward drops the call; anything short of it springs back
    if (dyRef.current < -70) resolve(true);
    else setDy(0);
  }, [resolve, setDy]);

  if (!call) return null;

  const ticks = Math.max(20, RING_TICKS - i * 2);

  return (
    <div
      style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      {/* the flick target, drawn like the belt end markers on the earlier stages */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          ...speckle(C.ink2, C.ink3, 4),
          boxShadow: `inset 0 -3px 0 0 ${C.red}`,
        }}
      >
        <PixelSprite name="phoneUp" scale={1.2} />
        <Display size={7} color={C.red}>
          FLICK UP TO DROP
        </Display>
      </div>

      <div
        data-interactive="call-card"
        onPointerDown={(e) => {
          if (!api.running || busy.current) return;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          grip.current = e.clientY;
        }}
        style={{
          width: 360,
          maxWidth: "72%",
          padding: 10,
          cursor: "grab",
          touchAction: "none",
          transform: `translateY(${gone === "dropped" ? -160 : dy}px)`,
          opacity: gone === "dropped" ? 0.35 : 1,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${
            gone ? (gone === "dropped" ? C.red : C.green) : C.ink
          }`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="bth-pulse" style={{ backgroundColor: C.ink }}>
            <PixelSprite name="phone" scale={1.6} />
          </div>
          <div>
            <Mono size={13} color={C.paper4}>
              INCOMING CALL {i + 1}/{CALLS.length}
            </Mono>
            <br />
            <Display size={10} color={C.ink}>
              {call.who}
            </Display>
          </div>
        </div>

        <div style={{ marginTop: 6, borderTop: `2px solid ${C.ink}`, paddingTop: 6 }}>
          <Mono size={15} color={C.ink}>
            {call.number}
          </Mono>
          <div style={{ marginTop: 3 }}>
            <Body size={13} color={C.ink}>
              {call.line}
            </Body>
          </div>
        </div>

        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <Mono size={12} color={C.paper4}>
            CONNECTING
          </Mono>
          <PixelMeter value={ring / ticks} width={130} height={10} cells={13} fill={C.red} />
          <div style={{ flex: 1 }} />
          <button
            type="button"
            data-interactive="chip"
            aria-label="Button — Drop this call"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => api.running && resolve(true)}
            style={{
              fontFamily: "inherit",
              padding: "1px 6px",
              cursor: "pointer",
              backgroundColor: C.red,
              boxShadow: `inset 2px 2px 0 0 #D6483C, inset -2px -2px 0 0 ${C.redDark}, 0 0 0 2px ${C.ink}`,
            }}
          >
            <Mono size={12} color={C.white}>
              ▴ DROP
            </Mono>
          </button>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)" }}>
        <Mono size={12} color={C.paper4}>
          LEAVE A REAL CALL ALONE — IT CONNECTS BY ITSELF
        </Mono>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ hands off */

type Reach = {
  id: number;
  kind: "hand" | "popup";
  /** worked in percent of the play area, like the privacy drill */
  x: number;
  y: number;
  tx: number;
  ty: number;
  slapped: boolean;
  label: string;
};

const OTP_TELL = "Nobody legitimate ever needs your one-time code. Not the bank, not support, not the desk.";
const POPUP_TELL = "That pop-up is there to move your eyes off the code. Leave it alone and watch the hands.";
const POPUPS = ["YOU WON!", "FREE SPINS", "TAP TO CLAIM", "1 NEW MATCH"];
const TOTAL_REACHES = 12;

function HandsOff({ api }: { api: DrillApi }) {
  const [code] = useState(() => String(Math.floor(100000 + Math.random() * 899999)));
  const [reaches, setReaches] = useState<Reach[]>([]);
  const [slaps, setSlaps] = useState(0);
  const [steals, setSteals] = useState(0);
  const seq = useRef(0);
  const wait = useRef(6);
  const spawned = useRef(0);

  const swat = useCallback(
    (id: number) => {
      if (!api.running) return;
      const r = reaches.find((x) => x.id === id);
      if (!r || r.slapped) return;
      setReaches((cur) => cur.map((x) => (x.id === id ? { ...x, slapped: true } : x)));
      window.setTimeout(() => setReaches((cur) => cur.filter((x) => x.id !== id)), 180);
      if (r.kind === "popup") {
        api.call(false, POPUP_TELL);
        return;
      }
      setSlaps((n) => n + 1);
      api.call(true, "Hand away, code still yours.");
    },
    [reaches, api],
  );

  useInterval(() => {
    // hands come faster, and later on they come in pairs
    const speed = 1 + Math.min(.5, spawned.current * 0.14);

    const keep: Reach[] = [];
    for (const r of reaches) {
      if (r.slapped) {
        keep.push(r);
        continue;
      }
      const dx = r.tx - r.x;
      const dy = r.ty - r.y;
      const len = Math.hypot(dx, dy);
      if (len <= 4) {
        if (r.kind === "hand") {
          setSteals((n) => n + 1);
          api.call(false, OTP_TELL);
        }
        continue; // a pop-up that reaches the middle just fizzles out
      }
      keep.push({ ...r, x: r.x + (dx / len) * speed, y: r.y + (dy / len) * speed });
    }

    if (wait.current <= 0 && spawned.current < TOTAL_REACHES) {
      const pair = spawned.current > 6 && Math.random() < 0.35 ? 2 : 1;
      for (let k = 0; k < pair && spawned.current < TOTAL_REACHES; k++) {
        const decoy = spawned.current > 2 && Math.random() < 0.28;
        const side = Math.floor(Math.random() * 4);
        const from =
          side === 0
            ? { x: 4, y: 12 + Math.random() * 66 }
            : side === 1
              ? { x: 94, y: 12 + Math.random() * 66 }
              : side === 2
                ? { x: 12 + Math.random() * 72, y: 6 }
                : { x: 12 + Math.random() * 72, y: 86 };
        keep.push({
          id: seq.current++,
          kind: decoy ? "popup" : "hand",
          x: from.x,
          y: from.y,
          tx: decoy ? 50 + (Math.random() * 20 - 10) : 50,
          ty: decoy ? 50 + (Math.random() * 20 - 10) : 48,
          slapped: false,
          label: decoy ? POPUPS[spawned.current % POPUPS.length] : "",
        });
        spawned.current += 1;
      }
      wait.current = spawned.current > 6 ? 7 : 11;
    } else {
      wait.current -= 1;
    }

    setReaches(keep);
    if (spawned.current >= TOTAL_REACHES && !keep.length) api.finish();
  }, api.running ? 90 : null);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* the code, dead centre, where every hand is headed */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${
            steals ? C.red : C.ink
          }`,
        }}
      >
        <PixelSprite name="otp" scale={1.6} />
        <div>
          <Mono size={12} color={C.paper4}>
            ONE-TIME CODE — NEVER SHARE
          </Mono>
          <br />
          <Display size={16} color={C.ink}>
            {code}
          </Display>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 8,
          bottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          backgroundColor: C.ink2,
          boxShadow: `0 0 0 2px ${steals ? C.red : C.ink3}`,
          zIndex: 3,
        }}
      >
        <PixelSprite name="handSlap" scale={1.2} />
        <Mono size={13} color={C.greenLight}>
          SLAPPED {slaps}
        </Mono>
        <Mono size={13} color={steals ? C.red : C.paper4}>
          · TAKEN {steals}
        </Mono>
      </div>

      {reaches.map((r) => (
        <button
          key={r.id}
          type="button"
          data-interactive={r.kind === "popup" ? "popup" : "grab-hand"}
          aria-label={r.kind === "popup" ? `Button — Pop-up: ${r.label}` : "Button — Slap the hand away"}
          onClick={() => swat(r.id)}
          style={{
            position: "absolute",
            left: `${r.x}%`,
            top: `${r.y}%`,
            transform: `translate(-50%, -50%)${r.slapped ? " scale(1.3)" : ""}`,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: r.kind === "popup" ? "3px 6px" : 2,
            cursor: "pointer",
            border: "none",
            backgroundColor: r.kind === "popup" ? C.redDark : "transparent",
            boxShadow: r.kind === "popup" ? `0 0 0 2px ${C.ink}` : undefined,
            zIndex: 2,
          }}
        >
          <PixelSprite name={r.kind === "popup" ? "popup" : r.slapped ? "handSlap" : "hand"} scale={2} />
          {r.kind === "popup" ? (
            <Mono size={12} color={C.white}>
              {r.label}
            </Mono>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export const MARKET_DRILLS: Drill[] = [
  {
    id: "calldrop",
    name: "CALL DROP",
    objective: "Flick the scam calls away before they connect. Leave the real ones.",
    how: [
      "Drag a call upward — or press DROP — to cut it off.",
      "A genuine call connects on its own if you leave it alone.",
      "Withheld numbers, urgency, and anyone asking for a code are the tells.",
    ],
    sprite: "phoneUp",
    seconds: 60,
    Component: CallDrop,
  },
  {
    id: "handsoff",
    name: "HANDS OFF!",
    objective: "Keep every hand off your one-time code.",
    how: [
      "Tap a hand to slap it away before it reaches the code.",
      "Pop-ups are there to pull your eyes off the middle. Tapping one costs a life.",
      "Later they come in pairs, and quicker.",
    ],
    sprite: "hand",
    seconds: 60,
    Component: HandsOff,
  },
];

export function MarketStage({
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
  const drills = useMemo(() => MARKET_DRILLS, []);
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
