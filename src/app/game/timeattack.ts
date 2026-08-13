import { CASES, type CaseDef, type Hotspot } from "./cases";

export type TierId = "cub" | "staff" | "senior";

export type Tier = {
  id: TierId;
  name: string;
  cases: number;
  claimsPerCase: number;
  /** hard countdown for the whole run, seconds */
  limit: number;
  /** medal time to beat, seconds */
  target: number;
  blurb: string;
};

export const TIERS: Tier[] = [
  {
    id: "cub",
    name: "CUB REPORTER",
    cases: 1,
    claimsPerCase: 5,
    limit: 150,
    target: 90,
    blurb: "One source set, five claims. Room to read twice.",
  },
  {
    id: "staff",
    name: "STAFF WRITER",
    cases: 2,
    claimsPerCase: 6,
    limit: 240,
    target: 165,
    blurb: "Two source sets, six claims each. No time to dawdle.",
  },
  {
    id: "senior",
    name: "SENIOR EDITOR",
    cases: 3,
    claimsPerCase: 7,
    limit: 330,
    target: 240,
    blurb: "Three source sets, every claim live. Read fast, call clean.",
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Drop the hotspot markup for claims that aren't live this run — the phrase stays,
 *  it just isn't underlined, so a shuffled pool reads as normal prose. */
function stripInactive(text: string, keep: Set<string>): string {
  return text.replace(/~([a-z0-9]+)\{([^}]*)\}/gi, (_m, id: string, body: string) =>
    keep.has(id) ? `~${id}{${body}}` : body,
  );
}

/** Build a fresh time-attack run: shuffled cases, shuffled live-claim pool per case. */
export function buildRun(tier: Tier): CaseDef[] {
  const picked = shuffle(CASES).slice(0, tier.cases);

  return picked.map((cs) => {
    // always keep at least two misleading claims live so a run can't be all-clear
    const misleading = shuffle(cs.hotspots.filter((h) => h.misleading));
    const clean = shuffle(cs.hotspots.filter((h) => !h.misleading));
    const want = Math.min(tier.claimsPerCase, cs.hotspots.length);
    const chosen: Hotspot[] = [];
    chosen.push(...misleading.slice(0, Math.max(2, Math.ceil(want / 2))));
    for (const h of clean) {
      if (chosen.length >= want) break;
      chosen.push(h);
    }
    for (const h of misleading) {
      if (chosen.length >= want) break;
      if (!chosen.includes(h)) chosen.push(h);
    }

    const keep = new Set(chosen.map((h) => h.id));
    // keep source order stable within a case, but shuffle which claims are live
    const hotspots = cs.hotspots.filter((h) => keep.has(h.id));

    return {
      ...cs,
      hotspots,
      article: { ...cs.article, body: cs.article.body.map((p) => stripInactive(p, keep)) },
      social: { ...cs.social, body: stripInactive(cs.social.body, keep) },
      quote: { ...cs.quote, body: stripInactive(cs.quote.body, keep) },
    };
  });
}

export function formatTime(s: number): string {
  const m = Math.floor(Math.max(0, s) / 60);
  return `${m}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
}

/** Time bonus for a finished run: faster than target pays, slower still pays a little. */
export function timeAttackBonus(tier: Tier, elapsed: number): number {
  const margin = tier.target - elapsed;
  return margin >= 0 ? 40 + margin * 2 : Math.max(0, 40 + margin);
}
