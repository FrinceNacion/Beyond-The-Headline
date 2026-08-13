import { CHECKS_OUT_REASONS, MISLEADING_REASONS, truthOf, type CaseDef, type ReasonId } from "./cases";
import type { Marks } from "./marks";
import { VERDICT, VERDICT_SEVERITY, calibrationOf, type Calibration, type Verdict } from "./mil";

/* Scoring rewards *reasoning*, not guessing.

   - An exact verdict match is full credit.
   - A near miss inside the "problem" family is partial credit: a player who
     called a misleading claim "out of context" has read it far better than one
     who cleared it.
   - Tips are only paid where at least one named reason was correct. Money for a
     lucky click teaches the lucky click. */

export type ClaimOutcome = {
  id: string;
  truth: Verdict;
  said: Verdict | null;
  /** "exact" | "near" (right family, wrong state) | "wrong" | "skipped" */
  grade: "exact" | "near" | "wrong" | "skipped";
  reasonsRight: number;
  /** flagged a sound claim as a problem */
  falseAlarm: boolean;
  /** cleared a claim that had a problem */
  missed: boolean;
};

export type CaseResult = {
  outcomes: ClaimOutcome[];
  correct: number;
  near: number;
  wrong: number;
  missed: string[];
  falseAlarms: string[];
  reasonsRight: number;
  reasonsPossible: number;
  total: number;
  tips: number;
  timeBonus: number;
  solved: boolean;
  /** weighted 0..1 — near misses count half */
  accuracy: number;
  calibration: Calibration;
};

export const VERDICT_TIPS = 12;
export const NEAR_TIPS = 5;
export const REASON_TIPS = 6;

function gradeOf(truth: Verdict, said: Verdict): ClaimOutcome["grade"] {
  if (truth === said) return "exact";
  const sameFamily = VERDICT[truth].family === VERDICT[said].family;
  if (!sameFamily) return "wrong";
  const gap = Math.abs(VERDICT_SEVERITY[truth] - VERDICT_SEVERITY[said]);
  return gap <= 2 ? "near" : "wrong";
}

/* Reason credit is deliberately lenient on the second chip. One point for
   naming the reason the case turns on; one more for a second chip that at
   least belongs to the right family. Two exact-match chips would mean
   authoring a second "true" answer for every claim, and in real checking
   there usually isn't one. */
function countReasons(said: ReasonId[], h: { correctReason: ReasonId; altReasons?: ReasonId[]; misleading: boolean }): number {
  const exact = new Set<ReasonId>([h.correctReason, ...(h.altReasons ?? [])]);
  const family = h.misleading ? MISLEADING_REASONS : CHECKS_OUT_REASONS;
  let n = 0;
  if (said.some((r) => exact.has(r))) n++;
  if (said.filter((r) => !exact.has(r)).some((r) => family.includes(r))) n++;
  return n;
}

export function scoreCase(cs: CaseDef, marks: Marks, timeLeft: number): CaseResult {
  const outcomes: ClaimOutcome[] = [];
  let correct = 0;
  let near = 0;
  let wrong = 0;
  let reasonsRight = 0;
  const missed: string[] = [];
  const falseAlarms: string[] = [];

  for (const h of cs.hotspots) {
    const truth = truthOf(h);
    const m = marks[h.id];

    if (!m) {
      if (h.misleading) missed.push(h.id);
      outcomes.push({
        id: h.id,
        truth,
        said: null,
        grade: "skipped",
        reasonsRight: 0,
        falseAlarm: false,
        missed: h.misleading,
      });
      continue;
    }

    const grade = gradeOf(truth, m.verdict);
    const rr = countReasons(m.reasons, h);
    const saidProblem = VERDICT[m.verdict].family === "problem";
    const falseAlarm = saidProblem && !h.misleading;
    const wasMissed = !saidProblem && h.misleading;

    if (grade === "exact") correct++;
    else if (grade === "near") near++;
    else wrong++;
    reasonsRight += rr;
    if (falseAlarm) falseAlarms.push(h.id);
    if (wasMissed) missed.push(h.id);

    outcomes.push({ id: h.id, truth, said: m.verdict, grade, reasonsRight: rr, falseAlarm, missed: wasMissed });
  }

  const total = cs.hotspots.length;
  const reasonsPossible = cs.hotspots.filter((h) => h.misleading).length * 2;
  const timeBonus = Math.floor(Math.max(0, timeLeft) / 15);

  /* Tips: paid per claim, and only where the reasoning held up. */
  let tips = timeBonus;
  for (const o of outcomes) {
    const earnedByReason = o.truth === "checks_out" ? o.grade === "exact" : o.reasonsRight > 0;
    if (!earnedByReason) continue;
    if (o.grade === "exact") tips += VERDICT_TIPS;
    else if (o.grade === "near") tips += NEAR_TIPS;
    tips += o.reasonsRight * REASON_TIPS;
  }

  const accuracy = total ? (correct + near * 0.5) / total : 0;
  const solved = accuracy >= 0.6 && falseAlarms.length <= 1;

  return {
    outcomes,
    correct,
    near,
    wrong,
    missed,
    falseAlarms,
    reasonsRight,
    reasonsPossible,
    total,
    tips,
    timeBonus,
    solved,
    accuracy,
    calibration: calibrationOf(falseAlarms.length, missed.length, total),
  };
}

/** Per-case medal, shown on the Community Map node once solved. */
export function medalFor(r: CaseResult): string | null {
  if (!r.solved) return null;
  if (!r.falseAlarms.length && !r.missed.length && r.correct === r.total && r.reasonsRight === r.reasonsPossible)
    return "PERFECT READ";
  if (!r.falseAlarms.length && !r.missed.length) return "CLEAN READ";
  if (r.accuracy >= 0.8) return "SHARP EYE";
  return "FILED";
}

export function missedMisleadingCount(cs: CaseDef, marks: Marks): number {
  return cs.hotspots.filter((h) => {
    const m = marks[h.id];
    return h.misleading && (!m || VERDICT[m.verdict].family === "clean");
  }).length;
}
