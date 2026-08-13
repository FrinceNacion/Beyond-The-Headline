/* UNESCO MIL layer.

   Everything the game teaches is pinned to a named competency from the UNESCO
   Media and Information Literacy Competency Framework (2011, updated 2022) and
   to the SIFT method (Mike Caulfield). Nothing here is invented pedagogy — the
   game's job is to drill four moves until they're reflexes. */

import type { ReasonId } from "./cases";

/* ------------------------------------------------------------- verdicts
   Five states, not two. Binary true/false marking teaches the wrong lesson:
   most misinformation is technically accurate and structurally dishonest. */

export type Verdict = "checks_out" | "biased" | "context" | "misleading" | "false";

export type VerdictDef = {
  id: Verdict;
  label: string;
  blurb: string;
  /** colour-blind safety: every state also carries a glyph and a two-letter code */
  code: string;
  sprite: string;
  color: string;
  /** "clean" states vs "problem" states, used for near-miss partial credit */
  family: "clean" | "problem";
};

export const VERDICTS: VerdictDef[] = [
  {
    id: "checks_out",
    label: "CHECKS OUT",
    blurb: "Accurate as stated and in context.",
    code: "CO",
    sprite: "check",
    color: "var(--bth-green, #2F6F4E)",
    family: "clean",
  },
  {
    id: "biased",
    label: "TRUE BUT BIASED",
    blurb: "Accurate, but from an interested source or with an agenda.",
    code: "TB",
    sprite: "compBias",
    color: "#B08D57",
    family: "problem",
  },
  {
    id: "context",
    label: "TRUE BUT OUT OF CONTEXT",
    blurb: "Accurate, missing crucial surrounding facts.",
    code: "OC",
    sprite: "compChain",
    color: "#C8A32E",
    family: "problem",
  },
  {
    id: "misleading",
    label: "MISLEADING",
    blurb: "Technically true wording, creates a false overall impression.",
    code: "ML",
    sprite: "flag",
    color: "#B7291E",
    family: "problem",
  },
  {
    id: "false",
    label: "FALSE",
    blurb: "Factually incorrect, fabricated, or unsupported.",
    code: "FA",
    sprite: "cross",
    color: "#7E1B14",
    family: "problem",
  },
];

export const VERDICT: Record<Verdict, VerdictDef> = Object.fromEntries(
  VERDICTS.map((v) => [v.id, v]),
) as Record<Verdict, VerdictDef>;

/** Order on the paranoia←→credulity axis, used by the calibration meter. */
export const VERDICT_SEVERITY: Record<Verdict, number> = {
  checks_out: 0,
  biased: 1,
  context: 2,
  misleading: 3,
  false: 4,
};

/** The 5-state truth for a hotspot, derived from its authored reason when the
    case doesn't state one outright. */
export function truthFromReason(misleading: boolean, reason: ReasonId): Verdict {
  if (!misleading) return "checks_out";
  switch (reason) {
    case "fabricated":
      return "false";
    case "nosource":
    case "unverified":
      return "false";
    case "context":
    case "outdated":
    case "attribution":
      return "context";
    case "conflict":
      return "biased";
    case "cherry":
    case "exaggerate":
    default:
      return "misleading";
  }
}

/* --------------------------------------------------------- competencies */

export type CompetencyId =
  | "source"
  | "bias"
  | "chain"
  | "compare"
  | "genre";

export type Competency = {
  id: CompetencyId;
  /** UNESCO framework wording */
  name: string;
  short: string;
  sprite: string;
  /** what the player is actually doing when this is being taught */
  outcome: string;
};

export const COMPETENCIES: Competency[] = [
  {
    id: "source",
    name: "Source Credibility Assessment",
    short: "SOURCE CREDIBILITY",
    sprite: "compSource",
    outcome: "Evaluates who published a claim, their track record, funding and corrections history.",
  },
  {
    id: "bias",
    name: "Bias Recognition",
    short: "BIAS RECOGNITION",
    sprite: "compBias",
    outcome: "Identifies perspective and interest in a source without collapsing into blanket distrust.",
  },
  {
    id: "chain",
    name: "Evidence Chain Evaluation",
    short: "EVIDENCE CHAIN",
    sprite: "compChain",
    outcome: "Traces a claim upstream to its original study, quote or image and checks what changed.",
  },
  {
    id: "compare",
    name: "Comparative Analysis / Cross-Source Verification",
    short: "CROSS-SOURCE CHECK",
    sprite: "compCompare",
    outcome: "Reads laterally across outlets instead of judging a claim from a single report.",
  },
  {
    id: "genre",
    name: "Genre and Format Literacy",
    short: "GENRE LITERACY",
    sprite: "compGenre",
    outcome: "Distinguishes reporting from opinion, satire, advertising and user-generated content.",
  },
];

export const COMPETENCY: Record<CompetencyId, Competency> = Object.fromEntries(
  COMPETENCIES.map((c) => [c.id, c]),
) as Record<CompetencyId, Competency>;

/* ------------------------------------------------------------ SIFT loop */

export type PhaseId = "stop" | "source" | "coverage" | "trace" | "mark";

export type Phase = {
  id: PhaseId;
  label: string;
  verb: string;
  sprite: string;
  competency: CompetencyId;
  /** the one-line teaching point shown under the phase bar */
  teaches: string;
};

export const PHASES: Phase[] = [
  {
    id: "stop",
    label: "STOP",
    verb: "CONTINUE READING",
    sprite: "siftStop",
    competency: "genre",
    teaches: "Pause before reacting. Read the whole thing before you decide anything.",
  },
  {
    id: "source",
    label: "INVESTIGATE",
    verb: "CHECK THE SOURCE",
    sprite: "siftSource",
    competency: "source",
    teaches: "Who published this, who pays for it, and what is their correction record?",
  },
  {
    id: "coverage",
    label: "FIND BETTER",
    verb: "READ LATERALLY",
    sprite: "siftCoverage",
    competency: "compare",
    teaches: "Leave the page. See how other outlets report the same claim.",
  },
  {
    id: "trace",
    label: "TRACE",
    verb: "FOLLOW UPSTREAM",
    sprite: "siftTrace",
    competency: "chain",
    teaches: "Follow the claim back to the original study, quote or photograph.",
  },
  {
    id: "mark",
    label: "MARK",
    verb: "MARK THE CLAIMS",
    sprite: "redpen",
    competency: "bias",
    teaches: "Now judge each claim — and say why before you confirm.",
  },
];

export const PHASE: Record<PhaseId, Phase> = Object.fromEntries(
  PHASES.map((p) => [p.id, p]),
) as Record<PhaseId, Phase>;

export function nextPhase(p: PhaseId): PhaseId {
  const i = PHASES.findIndex((x) => x.id === p);
  return PHASES[Math.min(i + 1, PHASES.length - 1)].id;
}

/* --------------------------------------------------- transferable habits */

export type Habit = {
  id: string;
  /** written as the player's next real-world action, not as a game instruction */
  move: string;
  sprite: string;
  competency: CompetencyId;
};

export const HABITS: Habit[] = [
  { id: "byline", move: "Click an author's byline to check their past coverage", sprite: "compSource", competency: "source" },
  { id: "lateral", move: "Open two other outlets before you share anything", sprite: "compCompare", competency: "compare" },
  { id: "original", move: "Find the original source, not a story about it", sprite: "compChain", competency: "chain" },
  { id: "reverse", move: "Reverse-image-search a photo before you trust it", sprite: "eye", competency: "chain" },
  { id: "funding", move: "Check who funds an outlet before quoting it", sprite: "compSource", competency: "source" },
  { id: "denominator", move: "Ask what a percentage is a percentage of", sprite: "chart", competency: "bias" },
  { id: "satire", move: "Check whether the page is satire before reacting", sprite: "compGenre", competency: "genre" },
  { id: "corrections", move: "Look for the corrections page — good outlets have one", sprite: "handbook", competency: "source" },
  { id: "domain", move: "Check the sender's actual domain before you click a link", sprite: "compSource", competency: "source" },
  { id: "headline", move: "Read past the headline before deciding a story is true", sprite: "compGenre", competency: "genre" },
  { id: "aitell", move: "Ask what specifically proves something is AI-made before you repeat it", sprite: "compGenre", competency: "genre" },
];

export const HABIT: Record<string, Habit> = Object.fromEntries(HABITS.map((h) => [h.id, h]));

/* ------------------------------------------------------------ calibration
   Over-suspicion is a failure mode too: a reader who flags everything has not
   learned to read, they have learned to distrust. The meter reports both. */

export type Calibration = {
  /** -1 fully credulous ... 0 balanced ... +1 fully paranoid */
  index: number;
  zone: "credulous" | "leaning-credulous" | "balanced" | "leaning-paranoid" | "paranoid";
  label: string;
  note: string;
};

export function calibrationOf(falseAlarms: number, missed: number, total: number): Calibration {
  const denom = Math.max(1, total);
  const index = Math.max(-1, Math.min(1, (falseAlarms - missed) / denom));
  const a = Math.abs(index);
  let zone: Calibration["zone"] = "balanced";
  if (index > 0) zone = a > 0.34 ? "paranoid" : a > 0.12 ? "leaning-paranoid" : "balanced";
  else if (index < 0) zone = a > 0.34 ? "credulous" : a > 0.12 ? "leaning-credulous" : "balanced";

  const notes: Record<Calibration["zone"], [string, string]> = {
    paranoid: ["OVER-SUSPICIOUS", "You flagged sound reporting. Distrusting everything is not fact-checking."],
    "leaning-paranoid": ["LEANING SUSPICIOUS", "Slightly quick to flag. Check the record before you mark it."],
    balanced: ["BALANCED", "You separated the weak claims from the sound ones. That is the goal."],
    "leaning-credulous": ["LEANING TRUSTING", "A little quick to clear. Read the sourcing line twice."],
    credulous: ["OVER-TRUSTING", "Misleading claims got through. Slow down at the unsourced ones."],
  };
  return { index, zone, label: notes[zone][0], note: notes[zone][1] };
}