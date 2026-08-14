import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelSprite } from "../../components/Pixel";
import librarybg from "../../../assets/backgrounds/library.png";
import { StageShell, useInterval } from "../arcade/StageShell";
import type { Drill, DrillApi, StageResult } from "../arcade/stage";
import type { CaseDef } from "../../game/cases";

/* Stage 2 — Password & Fake News. One notch harder than the post office:
   the first drill asks the player to hold four requirements in their head at
   once, the second removes the belt and puts the whole judgement on one card. */

/* ------------------------------------------------------------ password panic */

type Kind = "upper" | "lower" | "digit" | "symbol" | "trap";

const RULES: { id: Exclude<Kind, "trap">; label: string }[] = [
  { id: "upper", label: "UPPERCASE" },
  { id: "lower", label: "lowercase" },
  { id: "digit", label: "NUMBER" },
  { id: "symbol", label: "SYMBOL" },
];

const TARGET_LEN = 10;

const POOL: { ch: string; kind: Kind }[] = [
  ...["Q", "R", "T", "K", "M", "B", "W"].map((ch) => ({
    ch,
    kind: "upper" as Kind,
  })),
  ...["a", "e", "n", "s", "v", "h", "z"].map((ch) => ({
    ch,
    kind: "lower" as Kind,
  })),
  ...["3", "7", "9", "4", "2", "6"].map((ch) => ({
    ch,
    kind: "digit" as Kind,
  })),
  ...["#", "!", "£", "%", "*", "?"].map((ch) => ({
    ch,
    kind: "symbol" as Kind,
  })),
  ...["1234", "qwerty", "letmein", "0000", "abc", "password"].map((ch) => ({
    ch,
    kind: "trap" as Kind,
  })),
];

const TRAP_TELL: Record<string, string> = {
  "1234": "A run of digits is the first thing a cracking list tries.",
  qwerty: "Keyboard runs are in every dictionary attack ever written.",
  letmein: "It has been on the top-ten worst list since before you were born.",
  "0000": "Four zeroes is not a number, it is a placeholder.",
  abc: "Three letters in order. The library's old card did better than this.",
  password:
    "The word itself. Somehow still the most common one in the country.",
};

const COLS = 7;

function PasswordPanic({ api }: { api: DrillApi }) {
  const [drops, setDrops] = useState<
    { id: number; col: number; y: number; ch: string; kind: Kind }[]
  >([]);
  const [pw, setPw] = useState<{ ch: string; kind: Kind }[]>([]);
  const seq = useRef(0);
  const wait = useRef(0);
  const done = useRef(false);

  const met = useMemo(
    () => RULES.map((r) => pw.some((p) => p.kind === r.id)),
    [pw],
  );
  const length = pw.reduce((n, p) => n + p.ch.length, 0);
  const complete = met.every(Boolean) && length >= TARGET_LEN;

  // the round ends the moment the password is strong enough — no filler
  useEffect(() => {
    if (!complete || done.current) return;
    done.current = true;
    const t = window.setTimeout(() => api.finish(), 700);
    return () => window.clearTimeout(t);
  }, [complete, api]);

  useInterval(
    () => {
      const keep: typeof drops = [];
      for (const d of drops) {
        const y = d.y + 7;
        if (y < 210) keep.push({ ...d, y });
      }

      // one character at a time, with a trap roughly every fourth drop
      if (wait.current <= 0 && keep.length < 5) {
        const wantTrap = seq.current % 4 === 3;
        const bag = POOL.filter((p) =>
          wantTrap ? p.kind === "trap" : p.kind !== "trap",
        );
        const pick = bag[Math.floor(Math.random() * bag.length)];
        keep.push({
          id: seq.current++,
          col: Math.floor(Math.random() * COLS),
          y: -18,
          ...pick,
        });
        wait.current = 4;
      } else {
        wait.current -= 1;
      }

      setDrops(keep);
    },
    api.running && !complete ? 90 : null,
  );

  const grab = useCallback(
    (id: number) => {
      const d = drops.find((x) => x.id === id);
      if (!d) return;
      setDrops((cur) => cur.filter((x) => x.id !== id));
      if (d.kind === "trap") {
        api.call(
          false,
          TRAP_TELL[d.ch] ??
            "That fragment is on every cracking list there is.",
        );
        return;
      }
      setPw((cur) => [...cur, { ch: d.ch, kind: d.kind }]);
      api.call(true);
    },
    [drops, api],
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundImage: `url(${librarybg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        imageRendering: "pixelated",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 8px",
          backgroundColor: C.ink2,
          boxShadow: `inset 0 -2px 0 0 ${C.ink3}`,
          zIndex: 3,
        }}
      >
        {RULES.map((r, i) => (
          <div
            key={r.id}
            style={{ display: "flex", alignItems: "center", gap: 3 }}
          >
            <PixelSprite name={met[i] ? "check" : "starOff"} scale={1} />
            <Mono size={13} color={met[i] ? C.greenLight : C.paper4}>
              {r.label}
            </Mono>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <Mono size={13} color={length >= TARGET_LEN ? C.greenLight : C.paper4}>
          LENGTH {length}/{TARGET_LEN}
        </Mono>
      </div>

      {drops.map((d) => (
        <button
          key={d.id}
          type="button"
          data-interactive="char-drop"
          aria-label={`Button — Collect ${d.ch}`}
          onClick={() => api.running && grab(d.id)}
          style={{
            position: "absolute",
            left: `calc(${(d.col + 0.5) * (100 / COLS)}% - 22px)`,
            top: 26 + d.y,
            minWidth: 44,
            padding: "4px 6px",
            cursor: "pointer",
            backgroundColor: d.kind === "trap" ? C.paper3 : C.paper,
            boxShadow:
              d.kind === "trap"
                ? `inset 2px 2px 0 0 ${C.paper2}, inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`
                : `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <Display size={d.ch.length > 3 ? 8 : 12} color={C.ink}>
            {d.ch}
          </Display>
        </button>
      ))}

      {/* the password so far, stamped out one keycap at a time */}
      <div
        style={{
          position: "absolute",
          left: 8,
          right: 8,
          bottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 8px",
          ...speckle(C.ink, C.ink2, 4),
          boxShadow: `0 0 0 2px ${complete ? C.green : C.brassDark}`,
        }}
      >
        <PixelSprite name={complete ? "padlockOpen" : "keycap"} scale={1.4} />
        <Display size={8} color={complete ? C.greenLight : C.brassLight}>
          {complete ? "STRONG ENOUGH" : "BUILDING"}
        </Display>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {pw.map((p, i) => (
            <span
              key={`${p.ch}-${i}`}
              className="bth-stamp"
              style={{
                padding: "1px 4px",
                backgroundColor: C.paper2,
                boxShadow: `0 0 0 2px ${C.ink}`,
              }}
            >
              <Mono size={15} color={C.ink}>
                {p.ch}
              </Mono>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- truth swipe */

type Headline = {
  id: string;
  outlet: string;
  text: string;
  fake: boolean;
  tell: string;
};

const HEADLINES: Headline[] = [
  {
    id: "n1",
    outlet: "THE ROSEWOOD LEDGER · byline, dateline",
    text: "Library resets reader logins after shared staff password found",
    fake: false,
    tell: "Named outlet, named reporter, and a claim the library has already confirmed.",
  },
  {
    id: "n2",
    outlet: "ROSEWOOD TRUTH DAILY · no byline",
    text: "LEAKED: council to microchip every library card by Christmas",
    fake: true,
    tell: "No byline, no document, and a deadline chosen to stop you checking.",
  },
  {
    id: "n3",
    outlet: "CHATTR POST · 41K reposts",
    text: "BREAKING: reading scores 'collapse' — teachers walk out, sources say",
    fake: true,
    tell: "'Sources say' with no source, and scare quotes doing the arguing.",
  },
  {
    id: "n4",
    outlet: "THE ROSEWOOD LEDGER · corrections page",
    text: "Correction: Tuesday's market report overstated one stall's prices",
    fake: false,
    tell: "A paper that prints its own corrections is showing you its working.",
  },
  {
    id: "n5",
    outlet: "HEALTH-ALERTS-UK.LIVE · sponsored",
    text: "Doctors 'stunned' by fruit that ends flu in one day",
    fake: true,
    tell: "Sponsored, anonymous doctors, and a cure with no trial behind it.",
  },
  {
    id: "n6",
    outlet: "ROSEWOOD COUNCIL · published minutes",
    text: "Minutes: library IT budget raised by £4,200 for the coming year",
    fake: false,
    tell: "A primary document with a number you can look up yourself.",
  },
];

function TruthSwipe({ api }: { api: DrillApi }) {
  const [i, setI] = useState(0);
  const [dx, setDxState] = useState(0);
  const dxRef = useRef(0);
  const drag = useRef<number | null>(null);
  const [verdict, setVerdict] = useState<"fake" | "real" | null>(null);

  const card = HEADLINES[i];

  const setDx = useCallback((v: number) => {
    dxRef.current = v;
    setDxState(v);
  }, []);

  const answer = useCallback(
    (saidFake: boolean) => {
      if (!card || verdict) return;
      setVerdict(saidFake ? "fake" : "real");
      api.call(saidFake === card.fake, card.tell);
      window.setTimeout(() => {
        setVerdict(null);
        setDx(0);
        if (i >= HEADLINES.length - 1) api.finish();
        else setI(i + 1);
      }, 620);
    },
    [card, verdict, api, i, setDx],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (drag.current === null) return;
      setDx(e.clientX - drag.current);
    };
    const up = () => {
      if (drag.current === null) return;
      drag.current = null;
      const d = dxRef.current;
      // a decisive shove is a call; anything short of it springs back
      if (Math.abs(d) > 90) answer(d < 0);
      else setDx(0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [answer, setDx]);

  if (!card) return null;

  const lean = Math.max(-1, Math.min(1, dx / 110));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 10,
        backgroundImage: `url(${librarybg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    >
      <SwipeSide
        dir="left"
        label="FAKE"
        tone={C.red}
        sprite="swipeLeft"
        lit={lean < -0.4 || verdict === "fake"}
        onPick={() => answer(true)}
      />

      <div
        data-interactive="news-card"
        onPointerDown={(e) => {
          if (!api.running || verdict) return;
          drag.current = e.clientX;
        }}
        style={{
          width: 330,
          maxWidth: "50%",
          padding: 10,
          cursor: "grab",
          touchAction: "none",
          transform: `translateX(${dx}px) rotate(${(lean * 4).toFixed(0)}deg)`,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${
            verdict ? (verdict === "fake" ? C.red : C.green) : C.ink
          }`,
        }}
      >
        <Mono size={13} color={C.paper4}>
          {card.outlet}
        </Mono>
        <div
          style={{
            marginTop: 6,
            borderTop: `2px solid ${C.ink}`,
            paddingTop: 6,
          }}
        >
          <Display size={11} color={C.ink}>
            {card.text}
          </Display>
        </div>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <PixelSprite name="doc" scale={1} />
          <Mono size={12} color={C.paper4}>
            CARD {i + 1} OF {HEADLINES.length} · SWIPE OR PICK A SIDE
          </Mono>
        </div>
      </div>

      <SwipeSide
        dir="right"
        label="REAL"
        tone={C.green}
        sprite="swipeRight"
        lit={lean > 0.4 || verdict === "real"}
        onPick={() => answer(false)}
      />
    </div>
  );
}

function SwipeSide({
  dir,
  label,
  tone,
  sprite,
  lit,
  onPick,
}: {
  dir: "left" | "right";
  label: string;
  tone: string;
  sprite: string;
  lit: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      data-interactive="verdict"
      aria-label={`Button — Mark this headline ${label}`}
      onClick={onPick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "12px 10px",
        cursor: "pointer",
        backgroundColor: lit ? tone : C.ink2,
        boxShadow: `inset 2px 2px 0 0 ${lit ? C.paper4 : C.ink3}, inset -2px -2px 0 0 ${C.ink}, 0 0 0 2px ${tone}`,
      }}
    >
      <PixelSprite name={sprite} scale={2} />
      <Display
        size={9}
        color={lit ? C.white : tone === C.red ? C.red : C.greenLight}
      >
        {dir === "left" ? `◂ ${label}` : `${label} ▸`}
      </Display>
      <Body size={12} color={C.paper3}>
        {dir === "left" ? "swipe left" : "swipe right"}
      </Body>
    </button>
  );
}

export const LIBRARY_DRILLS: Drill[] = [
  {
    id: "password",
    name: "PASSWORD PANIC",
    objective:
      "Assemble a password that meets all four rules and runs ten characters.",
    how: [
      "Tap falling characters to add them to the password.",
      "You need an uppercase, a lowercase, a number and a symbol.",
      "Leave the fragments — 1234, qwerty, password. Grabbing one costs a life.",
    ],
    sprite: "keycap",
    seconds: 60,
    Component: PasswordPanic,
  },
  {
    id: "truth",
    name: "TRUTH SWIPE",
    objective: "Call each headline: swipe left for FAKE, right for REAL.",
    how: [
      "Drag the card, or press the panel on either side.",
      "Read the outlet line first. A byline and a document beat a big number.",
      "You get the verdict straight away, then the next card comes up.",
    ],
    sprite: "news1",
    seconds: 75,
    Component: TruthSwipe,
  },
];

export function LibraryStage({
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
  const drills = useMemo(() => LIBRARY_DRILLS, []);
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
