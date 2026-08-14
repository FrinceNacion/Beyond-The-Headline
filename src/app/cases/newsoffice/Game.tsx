import React, { useCallback, useMemo, useRef, useState } from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono } from "../../components/Pixel";
import { StageShell, useInterval } from "../arcade/StageShell";
import ledgerbg from "../../../assets/backgrounds/ledger.png";
import type { Drill, DrillApi, StageResult } from "../arcade/stage";
import { VERDICTS, type Verdict } from "../../game/mil";
import type { CaseDef } from "../../game/cases";

/* Stage 5 — The Ledger Office. Two drills, neither borrowed from the other
   four stages' belt/swipe/drag toolkit:

   1. TRACE THE CHAIN — a claim's paper trail laid out as a three-node
      board (record → newsroom → published). Tap the node where accuracy
      broke, not just whether the end result is wrong. Sometimes that node
      is the Ledger's own desk — the case's whole point.

   2. SET THE DIAL — a needle sweeps a five-state verdict gauge (the same
      CHECKS OUT / BIASED / CONTEXT / MISLEADING / FALSE scale the rest of
      the game is built on). Lock it in when it's over the right zone.
      Nothing else in the arcade uses more than two states — this is where
      the nuance the game keeps talking about actually gets tested. */

/* ------------------------------------------------------------ trace the chain */

type ChainNode = { label: string; text: string };
type Chain = {
  id: string;
  headline: string;
  nodes: [ChainNode, ChainNode, ChainNode];
  /** index of the node AFTER which the claim stopped being accurate */
  breakIndex: 0 | 1 | 2;
  tell: string;
};

const CHAINS: Chain[] = [
  {
    id: "c1",
    headline:
      "\u201cBridge shut for three months \u2014 county finally admits it\u201d",
    nodes: [
      {
        label: "COUNTY RECORD",
        text: "Engineer's memo: schedule revised from eight to twelve weeks, dated Mar 20.",
      },
      {
        label: "THE LEDGER",
        text: "Confirms the revised twelve-week schedule in writing, same week.",
      },
      {
        label: "INK SPILL POST",
        text: "\u201cCounty finally admits bridge shut three months \u2014 they were hiding it.\u201d",
      },
    ],
    breakIndex: 2,
    tell: "Twelve weeks is roughly three months \u2014 the number holds up. \u2018Finally admits\u2019 and \u2018hiding it\u2019 is the part nobody's record supports.",
  },
  {
    id: "c2",
    headline: "\u201cBakery ordered closed after health violations\u201d",
    nodes: [
      {
        label: "HEALTH DEPT.",
        text: "Three minor violations logged Mar 12, corrected before follow-up. No closure order.",
      },
      {
        label: "THE LEDGER",
        text: "Rushed afternoon edition: \u201cBakery ordered closed after health violations.\u201d",
      },
      {
        label: "REPOSTED",
        text: "Shared thousands of times under the Ledger's own headline, unchanged.",
      },
    ],
    breakIndex: 1,
    tell: "The repost just carried the Ledger's own headline along. The error started at the desk \u2014 nobody downstream invented it.",
  },
  {
    id: "c3",
    headline:
      "\u201cScam calls have doubled in Rosewood this year, watchdog confirms\u201d",
    nodes: [
      {
        label: "WATCHDOG REPORT",
        text: "Impersonation-scam calls up 40% this quarter versus last quarter.",
      },
      {
        label: "THE LEDGER",
        text: "\u201cScam calls have doubled in Rosewood this year, watchdog confirms.\u201d",
      },
      {
        label: "SOCIAL SHARE",
        text: "Passed along with the Ledger's own line, word for word.",
      },
    ],
    breakIndex: 1,
    tell: "A 40% quarterly rise became \u2018doubled this year\u2019 on the way through the newsroom. The report never said that \u2014 the paper did.",
  },
  {
    id: "c4",
    headline:
      "\u201cSchool forcing kids into mandatory internet class, no parental say\u201d",
    nodes: [
      {
        label: "BOARD MINUTES",
        text: "New digital-literacy elective approved, opt-in, public meeting Mar 4.",
      },
      {
        label: "THE LEDGER",
        text: "\u201cRosewood High adds optional digital-literacy elective next term.\u201d",
      },
      {
        label: "PARENT GROUP POST",
        text: "\u201cSchool forcing kids into mandatory internet class \u2014 no parental say.\u201d",
      },
    ],
    breakIndex: 2,
    tell: "\u2018Optional\u2019 became \u2018mandatory,\u2019 and a public board vote became \u2018no parental say.\u2019 The paper had it right; the post flipped it.",
  },
  {
    id: "c5",
    headline:
      "\u201cCouncil spying on residents 24/7, keeping footage forever\u201d",
    nodes: [
      {
        label: "COUNCIL RELEASE",
        text: "Traffic cameras at three junctions, monitoring only, 30-day retention.",
      },
      {
        label: "THE LEDGER",
        text: "\u201cCouncil installs traffic cameras at three junctions, 30-day retention.\u201d",
      },
      {
        label: "CHATTR POST",
        text: "\u201cCouncil spying on residents 24/7, keeping footage forever.\u201d",
      },
    ],
    breakIndex: 2,
    tell: "Traffic monitoring with a 30-day limit became permanent surveillance somewhere between the post office and the timeline.",
  },
  {
    id: "c6",
    headline: "\u201cPost office closing Rosewood branch for good\u201d",
    nodes: [
      {
        label: "ROYAL MAIL NOTICE",
        text: "Temporary route changes for two weeks \u2014 staff training, not closure.",
      },
      {
        label: "THE LEDGER",
        text: "\u201cPost office warns of temporary delivery changes this fortnight.\u201d",
      },
      {
        label: "CHATTR POST",
        text: "\u201cPost office closing Rosewood branch for good.\u201d",
      },
    ],
    breakIndex: 2,
    tell: "Two weeks of training became \u2018for good\u2019 on the timeline. The paper's own wording never said closed, let alone forever.",
  },
];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function TraceTheChain({ api }: { api: DrillApi }) {
  const order = useMemo(() => shuffled(CHAINS), []);
  const [idx, setIdx] = useState(0);
  const answered = useRef(false);

  const chain = order[idx];

  const advance = useCallback(() => {
    answered.current = false;
    if (idx + 1 >= order.length) api.finish();
    else setIdx((n) => n + 1);
  }, [idx, order.length, api]);

  const pick = useCallback(
    (i: 0 | 1 | 2) => {
      if (!chain || answered.current || !api.running) return;
      answered.current = true;
      api.call(i === chain.breakIndex, chain.tell);
      window.setTimeout(advance, 650);
    },
    [chain, api, advance],
  );

  if (!chain) return null;
  const nodes = chain.nodes.slice(0, 3) as ChainNode[];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        ...LEDGER_BACKGROUND,
      }}
    >
      <div style={{ padding: "8px 12px", textAlign: "center" }}>
        <Mono size={12} color={C.paper4}>
          CLAIM {idx + 1}/{order.length} {"\u00b7"} WHERE DID IT BREAK?
        </Mono>
        <div style={{ marginTop: 4 }}>
          <Body size={15} color={C.paper}>
            {chain.headline}
          </Body>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 10px 14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: 720,
          }}
        >
          {nodes.map((n, i) => (
            <React.Fragment key={n.label}>
              <button
                type="button"
                data-interactive="chain-node"
                aria-label={`Button — This is where it broke: ${n.label}`}
                onClick={() => pick(i as 0 | 1 | 2)}
                style={{
                  fontFamily: "inherit",
                  flex: 1,
                  minWidth: 0,
                  textAlign: "left",
                  padding: "10px 10px",
                  cursor: "pointer",
                  ...speckle(C.paper, C.paper2, 4),
                  boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
                }}
              >
                <Display size={7} color={C.red}>
                  {n.label}
                </Display>
                <div style={{ marginTop: 4 }}>
                  <Body size={13} color={C.ink}>
                    {n.text}
                  </Body>
                </div>
              </button>
              {i < 2 ? (
                <div
                  style={{ flex: "0 0 auto", padding: "0 6px" }}
                  aria-hidden="true"
                >
                  <Mono size={16} color={C.brass}>
                    {"\u2192"}
                  </Mono>
                </div>
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- set the dial */

type DialClaim = { id: string; text: string; verdict: Verdict; tell: string };

const DIAL_CLAIMS: DialClaim[] = [
  {
    id: "d1",
    text: "\u201cThe council's traffic-camera notice states footage is kept for 30 days.\u201d",
    verdict: "checks_out",
    tell: "Straight from the council's own release. Nothing to adjust for.",
  },
  {
    id: "d2",
    text: "\u201cThe bakery passed its follow-up inspection on March 19,\u201d per the health department.",
    verdict: "checks_out",
    tell: "Dated, on the record, from the department itself.",
  },
  {
    id: "d3",
    text: "The landlord association calls the new rent cap \u201cthe end of the rental market as we know it.\u201d",
    verdict: "biased",
    tell: "An accurately quoted opinion \u2014 from the side with the most to lose. True that they said it, not neutral.",
  },
  {
    id: "d4",
    text: "A press release from the camera manufacturer says its system \u201csets the gold standard for public safety.\u201d",
    verdict: "biased",
    tell: "The company selling the cameras, praising the cameras. Accurate quote, obvious interest.",
  },
  {
    id: "d5",
    text: "\u201cScam calls are up 40% this quarter\u201d \u2014 without mentioning last quarter was unusually quiet.",
    verdict: "context",
    tell: "The number's real. What it's being compared against is doing the misleading part.",
  },
  {
    id: "d6",
    text: "\u201cRosewood High's pass rate rose five points this year\u201d \u2014 the exam board redesigned the test in January.",
    verdict: "context",
    tell: "True rise, unmentioned reason. Context changes what the number means.",
  },
  {
    id: "d7",
    text: "\u201cBridge closed for repairs nearly a season\u201d \u2014 accurate wording, timed to make a twelve-week job sound indefinite.",
    verdict: "misleading",
    tell: "Every word checks out. The impression it leaves doesn't.",
  },
  {
    id: "d8",
    text: "\u201cOne in three residents feels unsafe downtown\u201d \u2014 drawn from twelve people surveyed outside the police station.",
    verdict: "misleading",
    tell: "Real survey, real number, picked from a sample built to produce it.",
  },
  {
    id: "d9",
    text: "\u201cEditors knew the bridge number was wrong before publishing.\u201d",
    verdict: "false",
    tell: "No memo, email, or witness exists. A claim about intent with nothing behind it.",
  },
  {
    id: "d10",
    text: "\u201cPost office closing Rosewood branch for good.\u201d",
    verdict: "false",
    tell: "No closure order exists anywhere. The actual change was a two-week rota adjustment.",
  },
];

const DIAL_ORDER: Verdict[] = [
  "checks_out",
  "biased",
  "context",
  "misleading",
  "false",
];

const LEDGER_BACKGROUND = {
  backgroundImage: `url(${ledgerbg})`,
  backgroundSize: "contain",
  backgroundPosition: "center",
  imageRendering: "pixelated" as const,
};

function SetTheDial({ api }: { api: DrillApi }) {
  const order = useMemo(() => shuffled(DIAL_CLAIMS), []);
  const [idx, setIdx] = useState(0);
  const [zone, setZone] = useState(0);
  const dir = useRef<1 | -1>(1);
  const answered = useRef(false);

  const claim = order[idx];

  const advance = useCallback(() => {
    answered.current = false;
    if (idx + 1 >= order.length) api.finish();
    else setIdx((n) => n + 1);
  }, [idx, order.length, api]);

  // needle sweeps end to end, a little faster with every claim cleared
  const speed = Math.max(110, 230 - idx * 12);
  useInterval(
    () => {
      if (answered.current) return;
      setZone((z) => {
        let n = z + dir.current;
        if (n >= DIAL_ORDER.length) {
          n = DIAL_ORDER.length - 2;
          dir.current = -1;
        } else if (n < 0) {
          n = 1;
          dir.current = 1;
        }
        return n;
      });
    },
    api.running ? speed : null,
  );

  const lockIn = useCallback(() => {
    if (!claim || answered.current || !api.running) return;
    answered.current = true;
    const picked = DIAL_ORDER[zone];
    api.call(picked === claim.verdict, claim.tell);
    window.setTimeout(advance, 650);
  }, [claim, zone, api, advance]);

  if (!claim) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        ...LEDGER_BACKGROUND,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 14,
        }}
      >
        <div
          style={{
            width: 480,
            maxWidth: "100%",
            padding: 14,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
          }}
        >
          <Mono size={12} color={C.paper4}>
            CLAIM {idx + 1}/{order.length}
          </Mono>
          <div style={{ marginTop: 4, marginBottom: 14 }}>
            <Body size={16} color={C.ink}>
              {claim.text}
            </Body>
          </div>

          {/* the gauge — five hard zones, needle on top */}
          <div style={{ position: "relative", paddingTop: 20 }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: `calc(${(zone + 0.5) * (100 / DIAL_ORDER.length)}% - 8px)`,
                transition: "left 90ms linear",
              }}
            >
              <Mono size={18} color={C.red}>
                {"\u25bc"}
              </Mono>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {VERDICTS.map((v) => (
                <div
                  key={v.id}
                  style={{
                    flex: 1,
                    padding: "6px 2px",
                    textAlign: "center",
                    backgroundColor:
                      v.id === DIAL_ORDER[zone] ? v.color : C.paper3,
                    boxShadow: `0 0 0 2px ${C.ink}`,
                  }}
                >
                  <Mono
                    size={12}
                    color={v.id === DIAL_ORDER[zone] ? C.white : C.paper4}
                  >
                    {v.code}
                  </Mono>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
              {VERDICTS.map((v) => (
                <div key={v.id} style={{ flex: 1, textAlign: "center" }}>
                  <Mono size={10} color={C.paper4}>
                    {v.label}
                  </Mono>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{ marginTop: 14, display: "flex", justifyContent: "center" }}
          >
            <button
              type="button"
              data-interactive="chip"
              aria-label="Button — Lock in current zone"
              onClick={lockIn}
              style={{
                fontFamily: "inherit",
                padding: "8px 20px",
                cursor: "pointer",
                backgroundColor: C.red,
                boxShadow: `inset 2px 2px 0 0 #D6483C, inset -2px -2px 0 0 ${C.redDark}, 0 0 0 2px ${C.ink}`,
              }}
            >
              <Mono size={15} color={C.white}>
                LOCK IN
              </Mono>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- drills */

export const NEWSOFFICE_DRILLS: Drill[] = [
  {
    id: "chain",
    name: "TRACE THE CHAIN",
    objective: "Find the exact stop where a claim's accuracy broke.",
    how: [
      "Each claim shows its paper trail: the record, the Ledger's own report, and where it ended up.",
      "Tap the node where the claim first stopped matching the one before it.",
      "It isn't always the last stop \u2014 sometimes the error starts at the desk.",
    ],
    sprite: "magnifier",
    seconds: 55,
    Component: TraceTheChain,
  },
  {
    id: "dial",
    name: "SET THE DIAL",
    objective:
      "Lock the gauge on the true state of each claim as the needle sweeps past it.",
    how: [
      "The needle sweeps the five-state gauge on its own \u2014 CHECKS OUT to FALSE.",
      "Press LOCK IN the moment it sits over the right zone for the claim on screen.",
      "True but one-sided is BIASED. True but incomplete is CONTEXT. Sounds true, isn't, is FALSE.",
    ],
    sprite: "gauge",
    seconds: 60,
    Component: SetTheDial,
  },
];

export function NewsofficeStage({
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
  const drills = useMemo(() => NEWSOFFICE_DRILLS, []);
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
