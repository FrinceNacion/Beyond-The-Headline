import { COMPETENCIES, HABITS, calibrationOf, type CompetencyId } from "./mil";
import { CASES } from "./cases";
import { progressMetaFor } from "./sift";

/* Player progress in MIL terms rather than game terms.

   Everything here is derived from what the player actually did, and everything
   here is exportable — a teacher should be able to see the same numbers the
   game sees, and take them away as a file. */

export type Lifetime = {
  correct: number;
  calls: number;
  falseAlarms: number;
  missed: number;
  reasonsRight: number;
  reasonsPossible: number;
  casesFiled: number;
  /** case ids the player has solved */
  solved: string[];
  /** habit ids the player has been taught by finishing the case that drills them */
  habits: string[];
  /** one row per filed case, newest last — the calibration profile reads from these */
  records: CaseRecord[];
};

/** What a single filed case looked like, kept so we can find the best-judged one. */
export type CaseRecord = {
  caseId: string;
  accuracy: number;
  falseAlarms: number;
  missed: number;
  calls: number;
  /** "investigation" = full SIFT case (five-state verdicts, can be miscalibrated).
      "drill" = arcade stage (right/wrong calls only — there's no over/under-call
      to be calibrated on, so these never contribute to the calibration meter). */
  kind: "investigation" | "drill";
};

export const EMPTY_LIFETIME: Lifetime = {
  correct: 0,
  calls: 0,
  falseAlarms: 0,
  missed: 0,
  reasonsRight: 0,
  reasonsPossible: 0,
  casesFiled: 0,
  solved: [],
  habits: [],
  records: [],
};

/* The case a player judged most evenly: nearest the balanced band first, then
   most accurate. Deliberately not "highest score" — the point of the screen is
   that being right and being calibrated are different achievements. */
export function bestCalibrationCase(lt: Lifetime): (CaseRecord & { cal: ReturnType<typeof calibrationOf> }) | null {
  const scored = (lt.records ?? [])
    // drills have no over/under-call to be calibrated on — every drill record
    // is a trivial "perfectly balanced" 0, which would win this unfairly
    .filter((r) => r.calls > 0 && r.kind === "investigation")
    .map((r) => ({ ...r, cal: calibrationOf(r.falseAlarms, r.missed, r.calls) }));
  if (!scored.length) return null;
  return scored.sort(
    (a, b) => Math.abs(a.cal.index) - Math.abs(b.cal.index) || b.accuracy - a.accuracy,
  )[0];
}

export type CompetencyProgress = {
  id: CompetencyId;
  /** cases in the game that drill this competency */
  total: number;
  /** of those, how many the player has solved */
  earned: number;
};

export function competencyProgress(lt: Lifetime): CompetencyProgress[] {
  return COMPETENCIES.map((c) => {
    const cases = CASES.filter((cs) => progressMetaFor(cs.id).competency === c.id);
    return {
      id: c.id,
      total: cases.length,
      earned: cases.filter((cs) => lt.solved.includes(cs.id)).length,
    };
  });
}

export function habitProgress(lt: Lifetime) {
  return HABITS.map((h) => ({ habit: h, learned: lt.habits.includes(h.id) }));
}

export function lifetimeAccuracy(lt: Lifetime): number {
  return lt.calls ? lt.correct / lt.calls : 0;
}

/* Calibration only means something for Investigation cases — an arcade drill
   has right/wrong calls but no five-state verdict, so there's no over- or
   under-calling to measure. lt.falseAlarms/lt.missed are only ever
   incremented from Investigation results already; the fix here is the
   denominator, which used to be lt.calls (drills included) and diluted the
   score every time a drill was cleared. This sums calls from Investigation
   records only, so the meter reflects Investigation judgement specifically. */
export function lifetimeCalibration(lt: Lifetime) {
  const investigationCalls = (lt.records ?? [])
    .filter((r) => r.kind === "investigation")
    .reduce((sum, r) => sum + r.calls, 0);
  return calibrationOf(lt.falseAlarms, lt.missed, Math.max(1, investigationCalls || lt.calls));
}

export type DrillStats = {
  cleared: number;
  total: number;
  avgAccuracy: number;
};

/** Separate summary for arcade drill stages — cleared count + average
    accuracy, since "calibration" doesn't apply to them. */
export function drillStats(lt: Lifetime): DrillStats {
  const records = (lt.records ?? []).filter((r) => r.kind === "drill");
  const cleared = records.filter((r) => lt.solved.includes(r.caseId)).length;
  const avgAccuracy = records.length
    ? records.reduce((sum, r) => sum + r.accuracy, 0) / records.length
    : 0;
  return { cleared, total: records.length, avgAccuracy };
}

/* ------------------------------------------------------------- classroom
   Sample cohort data. Clearly labelled as sample everywhere it is shown — a
   dashboard that invents plausible student numbers without saying so would be
   its own small piece of misinformation. */

export type Student = {
  id: string;
  name: string;
  cases: number;
  accuracy: number;
  /** +paranoid .. -credulous */
  calibration: number;
  pre?: number;
  post?: number;
  strongest: CompetencyId;
  weakest: CompetencyId;
};

export const SAMPLE_COHORT: Student[] = [
  { id: "s1", name: "A. NKEMELU", cases: 6, accuracy: 0.91, calibration: 0.04, pre: 42, post: 78, strongest: "chain", weakest: "genre" },
  { id: "s2", name: "B. FONTAINE", cases: 6, accuracy: 0.78, calibration: 0.38, pre: 51, post: 69, strongest: "source", weakest: "bias" },
  { id: "s3", name: "C. OYELARAN", cases: 5, accuracy: 0.83, calibration: -0.22, pre: 38, post: 71, strongest: "compare", weakest: "chain" },
  { id: "s4", name: "D. MARTELL", cases: 6, accuracy: 0.64, calibration: -0.41, pre: 45, post: 58, strongest: "genre", weakest: "chain" },
  { id: "s5", name: "E. HALVORSEN", cases: 4, accuracy: 0.72, calibration: 0.19, pre: 49, post: 66, strongest: "bias", weakest: "compare" },
  { id: "s6", name: "F. QUIROGA", cases: 6, accuracy: 0.88, calibration: -0.06, pre: 55, post: 84, strongest: "source", weakest: "genre" },
];

export type CohortStats = {
  students: number;
  meanAccuracy: number;
  meanGain: number;
  /** share of the class sitting in the balanced band */
  balancedShare: number;
  hardest: CompetencyId;
};

export function cohortStats(students: Student[]): CohortStats {
  const n = Math.max(1, students.length);
  const meanAccuracy = students.reduce((a, s) => a + s.accuracy, 0) / n;
  const withBoth = students.filter((s) => s.pre !== undefined && s.post !== undefined);
  const meanGain = withBoth.length
    ? withBoth.reduce((a, s) => a + (s.post! - s.pre!), 0) / withBoth.length
    : 0;
  const balancedShare = students.filter((s) => Math.abs(s.calibration) <= 0.12).length / n;

  const tally = new Map<CompetencyId, number>();
  for (const s of students) tally.set(s.weakest, (tally.get(s.weakest) ?? 0) + 1);
  let hardest: CompetencyId = "chain";
  let best = -1;
  for (const [k, v] of tally) if (v > best) ((best = v), (hardest = k));

  return { students: students.length, meanAccuracy, meanGain, balancedShare, hardest };
}

/* ------------------------------------------------------------------- CSV */

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function cohortCsv(students: Student[]): string {
  const head = [
    "student",
    "cases_completed",
    "accuracy_pct",
    "calibration_index",
    "calibration_zone",
    "pre_assessment",
    "post_assessment",
    "gain",
    "strongest_competency",
    "weakest_competency",
  ];
  const rows = students.map((s) => [
    s.name,
    s.cases,
    Math.round(s.accuracy * 100),
    s.calibration.toFixed(2),
    calibrationOf(Math.max(0, s.calibration) * 10, Math.max(0, -s.calibration) * 10, 10).label,
    s.pre ?? "",
    s.post ?? "",
    s.pre !== undefined && s.post !== undefined ? s.post - s.pre : "",
    s.strongest,
    s.weakest,
  ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}

export function personalCsv(lt: Lifetime): string {
  const cal = lifetimeCalibration(lt);
  const rows: [string, string | number][] = [
    ["cases_filed", lt.casesFiled],
    ["claims_judged", lt.calls],
    ["correct_calls", lt.correct],
    ["accuracy_pct", Math.round(lifetimeAccuracy(lt) * 100)],
    ["false_alarms", lt.falseAlarms],
    ["missed_claims", lt.missed],
    ["reasons_right", lt.reasonsRight],
    ["reasons_possible", lt.reasonsPossible],
    ["calibration_index", cal.index.toFixed(2)],
    ["calibration_zone", cal.label],
    ["habits_learned", lt.habits.length],
    ...competencyProgress(lt).map(
      (c) => [`competency_${c.id}`, `${c.earned}/${c.total}`] as [string, string],
    ),
  ];
  return ["metric,value", ...rows.map(([k, v]) => `${csvCell(k)},${csvCell(v)}`)].join("\n");
}

/** Hand a CSV to the browser as a download. No server, no upload, no telemetry. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}