import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelSprite } from "../../components/Pixel";
import postofficeBg from "../../../assets/backgrounds/postoffice.png";
import { StageShell, useInterval } from "../arcade/StageShell";
import type { Drill, DrillApi, StageResult } from "../arcade/stage";
import type { CaseDef } from "../../game/cases";

/* Stage 1 — Email & URL Safety.
   Two drills at onboarding difficulty: one drag, one tap. Both are judged the
   same way the rest of the game judges a claim — you are not reacting fast,
   you are reading the address before you act on the message. */

/* ------------------------------------------------------------ inbox escape */

type Email = {
  id: string;
  from: string;
  subject: string;
  phish: boolean;
  /** the debrief line, whichever way the call goes */
  tell: string;
};

const INBOX: Email[] = [
  {
    id: "e1",
    from: "no-reply@rosewood-post.delivery-verify.co",
    subject: "PARCEL HELD — pay £1.45 within 24h",
    phish: true,
    tell: "The domain is delivery-verify.co, not the post office. The urgency is the bait.",
  },
  {
    id: "e2",
    from: "library@rosewood.gov.uk",
    subject: "Your reservation is ready to collect",
    phish: false,
    tell: "Real council domain, no link, nothing asked of you.",
  },
  {
    id: "e3",
    from: "security@rosew00d-bank.com",
    subject: "Unusual login. Confirm your card number now.",
    phish: true,
    tell: "Two zeroes for two Os, and no bank asks for a card number by mail.",
  },
  {
    id: "e4",
    from: "m.odell@rosewoodledger.co.uk",
    subject: "Copy for Thursday — read the second source",
    phish: false,
    tell: "The Editor, from the desk domain you already write to.",
  },
  {
    id: "e5",
    from: "hr-payroll@rosewoodledger-hr.net",
    subject: "Payslip attached. Enable content to view.",
    phish: true,
    tell: "A lookalike of your own paper's domain, plus an attachment that wants permission.",
  },
  {
    id: "e6",
    from: "bookings@rosewoodhigh.sch.uk",
    subject: "Parents' evening — Thursday 6pm",
    phish: false,
    tell: "Ordinary school notice. Nothing to shred.",
  },
  {
    id: "e7",
    from: "prize.claims@win-rosewood.top",
    subject: "You have been selected. Claim before midnight.",
    phish: true,
    tell: "A prize you never entered, a deadline, and a domain nobody has heard of.",
  },
];

const CARD_W = 226;
const SHRED_X = 96;
const LANE_TOP = [8, 74, 140];

function InboxEscape({ api }: { api: DrillApi }) {
  const lane = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<
    { id: string; x: number; row: number; email: Email }[]
  >([]);
  const [drag, setDrag] = useState<{
    id: string;
    pointerX: number;
    originX: number;
  } | null>(null);
  const next = useRef(0);
  const wait = useRef(0);
  const rows = useRef(0);

  const laneW = () => lane.current?.clientWidth ?? 640;

  const resolve = useCallback(
    (email: Email, shredded: boolean) => {
      const right = shredded === email.phish;
      api.call(right, email.tell);
    },
    [api],
  );

  useInterval(
    () => {
      const openX = laneW() - 110;

      // step the belt: anything that reaches the tray is judged as "opened"
      const keep: typeof items = [];
      for (const it of items) {
        if (drag?.id === it.id) {
          keep.push(it);
          continue;
        }
        const x = it.x + 3;
        if (x >= openX) resolve(it.email, false);
        else keep.push({ ...it, x });
      }

      // hand out the next envelope on a steady beat, never more than three at once
      if (wait.current <= 0 && next.current < INBOX.length && keep.length < 3) {
        const email = INBOX[next.current++];
        keep.push({
          id: email.id,
          x: SHRED_X + 24,
          row: rows.current++ % LANE_TOP.length,
          email,
        });
        wait.current = 22;
      } else {
        wait.current -= 1;
      }

      setItems(keep);
      if (next.current >= INBOX.length && !keep.length) api.finish();
    },
    api.running ? 90 : null,
  );

  /* ------------------------------------------------------------- dragging */
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setItems((cur) =>
        cur.map((it) =>
          it.id === drag.id
            ? {
                ...it,
                x: Math.max(
                  0,
                  Math.min(
                    laneW() - CARD_W,
                    drag.originX + (e.clientX - drag.pointerX),
                  ),
                ),
              }
            : it,
        ),
      );
    };
    const up = () => {
      const it = items.find((i) => i.id === drag.id);
      setDrag(null);
      if (!it) return;
      if (it.x <= SHRED_X) {
        setItems((cur) => cur.filter((c) => c.id !== it.id));
        resolve(it.email, true);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, items, resolve]);

  const shred = useCallback(
    (id: string) => {
      const it = items.find((i) => i.id === id);
      if (!it || !api.running) return;
      setItems((cur) => cur.filter((c) => c.id !== id));
      resolve(it.email, true);
    },
    [items, resolve, api.running],
  );

  return (
    <div
      ref={lane}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundImage: `url(${postofficeBg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        imageRendering: "pixelated",
      }}
    >
      {/* shredder on the left, OPEN slot on the right — the two ends of the belt */}
      <Zone
        side="left"
        width={SHRED_X}
        sprite="shredder"
        label="SHRED"
        tone={C.red}
      />
      <Zone
        side="right"
        width={110}
        sprite="inbox"
        label="OPENED"
        tone={C.green}
      />

      {items.map((it) => (
        <div
          key={it.id}
          data-interactive="email-card"
          onPointerDown={(e) => {
            if (!api.running) return;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            setDrag({ id: it.id, pointerX: e.clientX, originX: it.x });
          }}
          style={{
            position: "absolute",
            left: it.x,
            top: LANE_TOP[it.row],
            width: CARD_W,
            padding: 5,
            cursor: "grab",
            touchAction: "none",
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <PixelSprite name="envelopeFlag" scale={1} />
            <Mono
              size={12}
              color={C.paper4}
              style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {it.email.from}
            </Mono>
          </div>
          <div style={{ marginTop: 2 }}>
            <Body size={13} color={C.ink}>
              {it.email.subject}
            </Body>
          </div>
          <div
            style={{
              marginTop: 3,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <button
              type="button"
              data-interactive="chip"
              aria-label={`Button — Shred email from ${it.email.from}`}
              onClick={() => shred(it.id)}
              style={{
                fontFamily: "inherit",
                padding: "1px 5px",
                cursor: "pointer",
                backgroundColor: C.red,
                boxShadow: `inset 2px 2px 0 0 #D6483C, inset -2px -2px 0 0 ${C.redDark}, 0 0 0 2px ${C.ink}`,
              }}
            >
              <Mono size={12} color={C.white}>
                ◂ SHRED
              </Mono>
            </button>
            <Mono size={11} color={C.paper4}>
              DRAG LEFT
            </Mono>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- url sprint */

type Url = { id: string; url: string; fake: boolean; tell: string };

const URLS: Url[] = [
  {
    id: "u1",
    url: "https://rosewood.gov.uk/council/minutes",
    fake: false,
    tell: "Council domain, ordinary path. Let it through.",
  },
  {
    id: "u2",
    url: "http://rosewood-post.delivery-verify.co/pay",
    fake: true,
    tell: "The real name sits in front of a domain that isn't theirs.",
  },
  {
    id: "u3",
    url: "https://rosewoodledger.co.uk/corrections",
    fake: false,
    tell: "Your own paper. The corrections page, no less.",
  },
  {
    id: "u4",
    url: "https://secure-rosewoodbank.account-check.ru",
    fake: true,
    tell: "Whatever comes before the last two labels is decoration.",
  },
  {
    id: "u5",
    url: "https://rosewoodhigh.sch.uk/term-dates",
    fake: false,
    tell: "School domain, boring content. That is the point.",
  },
  {
    id: "u6",
    url: "https://rosew00dbank.co.uk/login",
    fake: true,
    tell: "Two zeroes doing the work of two Os.",
  },
  {
    id: "u7",
    url: "https://nhs.uk/find-a-pharmacy",
    fake: false,
    tell: "Short, official, nothing bolted on the front.",
  },
  {
    id: "u8",
    url: "https://rosewood.gov.uk.grants-portal.link",
    fake: true,
    tell: "gov.uk is a subdomain here. The real host is grants-portal.link.",
  },
];

function UrlSprint({ api }: { api: DrillApi }) {
  const lane = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<
    { id: string; x: number; row: number; url: Url }[]
  >([]);
  const next = useRef(0);
  const wait = useRef(0);
  const resolved = useRef(0);
  const rows = useRef(0);

  const laneW = () => lane.current?.clientWidth ?? 640;

  const resolve = useCallback(
    (u: Url, blocked: boolean) => {
      resolved.current += 1;
      api.call(blocked === u.fake, u.tell);
    },
    [api],
  );

  useInterval(
    () => {
      // the belt speeds up as the round goes on, but only a little — this is stage one
      const speed = 3 + Math.min(3, Math.floor(resolved.current / 3));

      const keep: typeof items = [];
      for (const it of items) {
        const x = it.x - speed;
        if (x <= -CARD_W - 40) resolve(it.url, false);
        else keep.push({ ...it, x });
      }

      if (wait.current <= 0 && next.current < URLS.length && keep.length < 3) {
        const url = URLS[next.current++];
        keep.push({
          id: url.id,
          x: laneW(),
          row: rows.current++ % LANE_TOP.length,
          url,
        });
        wait.current = 18;
      } else {
        wait.current -= 1;
      }

      setItems(keep);
      if (next.current >= URLS.length && !keep.length) api.finish();
    },
    api.running ? 90 : null,
  );

  const block = useCallback(
    (id: string) => {
      const it = items.find((i) => i.id === id);
      if (!it) return;
      setItems((cur) => cur.filter((c) => c.id !== id));
      resolve(it.url, true);
    },
    [items, resolve],
  );

  return (
    <div
      ref={lane}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundImage: `url(${postofficeBg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        imageRendering: "pixelated",
      }}
    >
      <Zone
        side="left"
        width={92}
        sprite="globe"
        label="LOADS"
        tone={C.green}
      />

      {items.map((it) => (
        <div
          key={it.id}
          style={{
            position: "absolute",
            left: it.x,
            top: LANE_TOP[it.row],
            width: 300,
            padding: 5,
            ...speckle(C.paper2, C.paper3, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.paper}, inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
          }}
        >
          {/* a browser chrome strip — the address bar is the whole evidence */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 4px",
              backgroundColor: C.ink2,
            }}
          >
            <PixelSprite name="globe" scale={0.9} />
            <Mono
              size={13}
              color={C.paper}
              style={{ overflow: "hidden", whiteSpace: "nowrap" }}
            >
              {it.url.url}
            </Mono>
          </div>
          <div
            style={{
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <button
              type="button"
              data-interactive="chip"
              aria-label={`Button — Block ${it.url.url}`}
              onClick={() => api.running && block(it.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "1px 6px",
                cursor: "pointer",
                backgroundColor: C.red,
                boxShadow: `inset 2px 2px 0 0 #D6483C, inset -2px -2px 0 0 ${C.redDark}, 0 0 0 2px ${C.ink}`,
              }}
            >
              <PixelSprite name="blocksign" scale={0.9} />
              <Mono size={13} color={C.white}>
                BLOCK
              </Mono>
            </button>
            <Mono size={11} color={C.paper4}>
              OR LET IT SCROLL PAST
            </Mono>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- shared bits */

/** End-of-belt marker. Same slab treatment as the tab rail on the case screen. */
function Zone({
  side,
  width,
  sprite,
  label,
  tone,
}: {
  side: "left" | "right";
  width: number;
  sprite: string;
  label: string;
  tone: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 0,
        width,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...speckle(C.ink2, C.ink3, 4),
        boxShadow: `inset ${side === "left" ? "-" : ""}3px 0 0 0 ${tone}`,
      }}
    >
      <PixelSprite name={sprite} scale={2} />
      <Display size={7} color={tone === C.red ? C.red : C.greenLight}>
        {label}
      </Display>
    </div>
  );
}

export const POSTOFFICE_DRILLS: Drill[] = [
  {
    id: "inbox",
    name: "INBOX ESCAPE",
    objective: "Shred the phishing mail before it reaches the OPENED tray.",
    how: [
      "Drag a suspicious email left into the shredder — or press SHRED on the card.",
      "Let genuine mail run on into the tray. Shredding a real letter costs a life.",
      "Read the sender's domain, not the subject line. The subject is the bait.",
    ],
    sprite: "envelopeFlag",
    seconds: 60,
    Component: InboxEscape,
  },
  {
    id: "urls",
    name: "URL SPRINT",
    objective: "Block the fraudulent addresses. Let the real ones load.",
    how: [
      "Press BLOCK on an address that isn't what it claims to be.",
      "Anything you leave alone scrolls past and loads.",
      "Read the last two labels before the first slash — that is the real host.",
    ],
    sprite: "blocksign",
    seconds: 60,
    Component: UrlSprint,
  },
];

export function PostOfficeStage({
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
  const drills = useMemo(() => POSTOFFICE_DRILLS, []);
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
