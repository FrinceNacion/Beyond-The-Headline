/* Case types and utilities for Beyond the Headline.
   Case data now lives in src/app/cases/{id}/data.ts — one folder per case.
   Article bodies use a tiny markup: ~id{claim text} marks a tappable hotspot. */

import { truthFromReason, type Verdict } from "./mil";

export type ReasonId =
  | "nosource"
  | "exaggerate"
  | "context"
  | "fabricated"
  | "cherry"
  | "onrecord"
  | "records"
  | "confirmed"
  | "outdated"
  | "conflict"
  | "attribution"
  | "unverified";

export const REASONS: Record<ReasonId, string> = {
  nosource: "No source given",
  exaggerate: "Exaggerates the facts",
  context: "Missing context",
  fabricated: "Fabricated detail",
  cherry: "Cherry-picked number",
  onrecord: "Named, on-record source",
  records: "Matches public records",
  confirmed: "Independently confirmed",
  outdated: "Out-of-date statistic",
  conflict: "Conflict of interest",
  attribution: "Missing attribution",
  unverified: "Unverified by any second source",
};

export const MISLEADING_REASONS: ReasonId[] = [
  "nosource",
  "exaggerate",
  "context",
  "fabricated",
  "cherry",
  "outdated",
  "conflict",
  "attribution",
  "unverified",
];
export const CHECKS_OUT_REASONS: ReasonId[] = ["onrecord", "records", "confirmed"];

export type SourceKind = "article" | "social" | "quote" | "chart";

export type Hotspot = {
  id: string;
  /** the exact phrase the player is judging */
  text: string;
  source: SourceKind;
  misleading: boolean;
  /** the reason chip that is actually right */
  correctReason: ReasonId;
  /** 3 offered chips (includes correctReason) */
  chips: ReasonId[];
  /** other reasons that also hold for this claim — marking requires two */
  altReasons?: ReasonId[];
  /** The Editor's debrief line */
  note: string;
  /** Five-state truth. Derived from `correctReason` when a case doesn't state one. */
  truth?: Verdict;
};

export type CaseDef = {
  id: string;
  building: string;
  sprite: string;
  title: string;
  tag: string;
  brief: string;
  article: {
    outlet: string;
    headline: string;
    byline: string;
    dateline: string;
    body: string[];
  };
  social: {
    app: string;
    handle: string;
    display: string;
    avatar: string;
    time: string;
    body: string;
    likes: string;
    reposts: string;
    replies: string;
  };
  quote: {
    speaker: string;
    role: string;
    avatar: string;
    outletNote: string;
    body: string;
  };
  hotspots: Hotspot[];
};

/** Five-state truth for a claim: authored if stated, otherwise derived. */
export function truthOf(h: Hotspot): Verdict {
  return h.truth ?? truthFromReason(h.misleading, h.correctReason);
}

/* CASES array assembled in src/app/cases/index.ts (new case order, one folder per case).
   Re-exported here so all existing importers continue to work unchanged. */
export { CASES } from "../cases/index";

/** Parse ~id{text} markup into renderable segments. */
export type Seg = { text: string; hs?: string };
export function parseSegments(src: string): Seg[] {
  const out: Seg[] = [];
  const re = /~([a-z0-9]+)\{([^}]*)\}/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index) });
    out.push({ text: m[2], hs: m[1] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  return out;
}

export const RANKS = [
  "Stringer",
  "Cub Reporter",
  "Staff Writer",
  "Desk Reporter",
  "Senior Correspondent",
  "Chief Fact-Checker",
  "Editor-at-Large",
];
