import React, { useCallback, useMemo, useState } from "react";
import { C, speckle } from "../../game/palette";
import { Body, Mono, PixelButton, PixelSprite } from "../../components/Pixel";
import { StageShell } from "../arcade/StageShell";
import type { Drill, DrillApi, StageResult } from "../arcade/stage";
import type { CaseDef } from "../../game/cases";

/* Stage 7 — AI-Generated Content. Two drills, both a single mechanic: read
   one card, tap one button, see why you were right or wrong, next card. No
   dragging, no belt, no two things happening at once — the "reading between
   the scores" data authored for this case asked players to weigh cohort
   sizes against averages, which tested well as a concept but badly as a
   thirty-second drill. This replaces it with something a player can read
   once and act on immediately: is this thing real, or AI-made — and if it's
   AI-made, what's the actual tell. */

/* ------------------------------------------------------------- drill 1: REAL OR AI? */

type Round2 = { id: string; claim: string; real: boolean; tell: string };

const REAL_OR_AI: Round2[] = [
  {
    id: "r1",
    claim: "Photo caption: three students holding a banner — one hand has six fingers.",
    real: false,
    tell: "AI image tools still get hands wrong more than anything else.",
  },
  {
    id: "r2",
    claim: "Quote from the principal: \"We are committed to fostering excellence.\"",
    real: true,
    tell: "Bland, but that's just how principals actually talk.",
  },
  {
    id: "r3",
    claim: "Chatbot answer: \"The French Revolution began in 1812.\"",
    real: false,
    tell: "Confident and wrong — that's a hallucinated date, not a typo.",
  },
  {
    id: "r4",
    claim: "A blurry phone photo of the cafeteria menu board, badly lit.",
    real: true,
    tell: "Ordinary bad photography isn't a tell by itself.",
  },
  {
    id: "r5",
    claim: "Sports recap article: the exact same sentence structure repeats four paragraphs in a row.",
    real: false,
    tell: "Real writers vary their rhythm without noticing — AI text often doesn't.",
  },
  {
    id: "r6",
    claim: "A handwritten note pinned to the noticeboard, slightly crooked in the scan.",
    real: true,
    tell: "Messy and human. Nothing here reads machine-made.",
  },
];

/* ------------------------------------------------------- drill 2: WHAT'S THE GIVEAWAY? */

type Round3 = { id: string; claim: string; options: [string, string, string]; correct: 0 | 1 | 2; tell: string };

const GIVEAWAY: Round3[] = [
  {
    id: "g1",
    claim: "Chatbot says: \"Studies show 94% of teachers agree.\"",
    options: ["No study is named or linked", "It's too short", "It uses a percentage"],
    correct: 0,
    tell: "A specific-sounding number with nothing behind it is a classic AI tell — a real claim points somewhere.",
  },
  {
    id: "g2",
    claim: "An article about the school play, but every paragraph is exactly the same length.",
    options: ["The paragraphs are suspiciously even", "It mentions the school by name", "It has a headline"],
    correct: 0,
    tell: "Real writing has rhythm — AI text often falls into a too-tidy, uniform shape.",
  },
  {
    id: "g3",
    claim: "A photo of the trophy case — the engraving on one trophy is garbled, not real words.",
    options: ["The photo is in colour", "The engraved text is garbled nonsense", "The case is glass"],
    correct: 1,
    tell: "AI image generators still struggle to render real, readable text.",
  },
  {
    id: "g4",
    claim: "An email \"from the school\" signed only \"The Administration,\" no name attached.",
    options: ["It uses formal language", "It was sent in the morning", "No specific person is named or reachable"],
    correct: 2,
    tell: "A real notice usually has someone accountable attached to it, not just a title.",
  },
  {
    id: "g5",
    claim: "A chatbot's summary of a book describes a chapter that doesn't exist in the book.",
    options: ["The summary is long", "It uses big words", "It invents details that aren't in the source"],
    correct: 2,
    tell: "Making up a plausible-sounding chapter is a classic hallucination, not an error of tone.",
  },
];

/* ----------------------------------------------------------------- shared card */

/** One claim, N buttons, tap one, see the flash + note StageShell already
    renders, then the next card slides in. Every drill in this stage is this
    same shape — the only thing that changes is the question being asked. */
function TapCard({
  n,
  total,
  eyebrow,
  claim,
  options,
  onPick,
}: {
  n: number;
  total: number;
  eyebrow: string;
  claim: string;
  options: { label: string; onClick: () => void }[];
  onPick: boolean; // true while a pick is being resolved — buttons disabled
}) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <div
        style={{
          width: 440,
          maxWidth: "94%",
          padding: 14,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PixelSprite name="doc" scale={1.1} />
          <Mono size={12} color={C.paper4}>
            {n}/{total} · {eyebrow}
          </Mono>
        </div>
        <div style={{ marginTop: 8, padding: "8px 9px", backgroundColor: C.paper3, boxShadow: `0 0 0 2px ${C.ink}` }}>
          <Body size={15} color={C.ink}>
            {claim}
          </Body>
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {options.map((o, i) => (
            <PixelButton key={i} full variant="paper" size={9} disabled={onPick} onClick={o.onClick} label={`Button — ${o.label}`}>
              {o.label.toUpperCase()}
            </PixelButton>
          ))}
        </div>
      </div>
    </div>
  );
}

function RealOrAi({ api }: { api: DrillApi }) {
  const [idx, setIdx] = useState(0);
  const [resolving, setResolving] = useState(false);
  const round = REAL_OR_AI[idx];

  const pick = useCallback(
    (said: boolean) => {
      if (resolving || !round) return;
      setResolving(true);
      api.call(said === round.real, round.tell);
      window.setTimeout(() => {
        if (idx + 1 >= REAL_OR_AI.length) {
          api.finish();
        } else {
          setIdx((i) => i + 1);
          setResolving(false);
        }
      }, 900);
    },
    [api, idx, resolving, round],
  );

  if (!round) return null;
  return (
    <TapCard
      n={idx + 1}
      total={REAL_OR_AI.length}
      eyebrow="REAL OR AI-MADE?"
      claim={round.claim}
      onPick={resolving}
      options={[
        { label: "Real", onClick: () => pick(true) },
        { label: "AI-Made", onClick: () => pick(false) },
      ]}
    />
  );
}

function WhatsTheGiveaway({ api }: { api: DrillApi }) {
  const [idx, setIdx] = useState(0);
  const [resolving, setResolving] = useState(false);
  const round = GIVEAWAY[idx];

  const pick = useCallback(
    (said: 0 | 1 | 2) => {
      if (resolving || !round) return;
      setResolving(true);
      api.call(said === round.correct, round.tell);
      window.setTimeout(() => {
        if (idx + 1 >= GIVEAWAY.length) {
          api.finish();
        } else {
          setIdx((i) => i + 1);
          setResolving(false);
        }
      }, 900);
    },
    [api, idx, resolving, round],
  );

  if (!round) return null;
  return (
    <TapCard
      n={idx + 1}
      total={GIVEAWAY.length}
      eyebrow="THIS IS AI-MADE. WHAT'S THE GIVEAWAY?"
      claim={round.claim}
      onPick={resolving}
      options={round.options.map((label, i) => ({ label, onClick: () => pick(i as 0 | 1 | 2) }))}
    />
  );
}

/* -------------------------------------------------------------------- stage */

export const SCHOOL_DRILLS: Drill[] = [
  {
    id: "realorai",
    name: "REAL OR AI?",
    objective: "Read each claim and tap whether it's genuine or AI-made.",
    how: [
      "One card at a time — no clock pressure beyond the stage timer.",
      "Look for the small, specific tells: garbled details, hollow confidence, too-even rhythm.",
      "Ordinary human sloppiness (bad lighting, plain language) isn't a tell by itself.",
    ],
    sprite: "doc",
    seconds: 60,
    Component: RealOrAi,
  },
  {
    id: "giveaway",
    name: "WHAT'S THE GIVEAWAY?",
    objective: "You're told it's AI-made. Tap the real reason why.",
    how: [
      "Every card here really is AI-made — the question is what actually proves it.",
      "One answer names a concrete, checkable tell. The other two are just vibes.",
      "This is the deeper skill: not just spotting it, but being able to say why.",
    ],
    sprite: "magnifier",
    seconds: 60,
    Component: WhatsTheGiveaway,
  },
];

export function SchoolStage({
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
  const drills = useMemo(() => SCHOOL_DRILLS, []);
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