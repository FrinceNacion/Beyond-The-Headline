import type { ReasonId } from "./cases";
import type { Verdict } from "./mil";

/** A player's judgement on one claim: a five-state verdict plus the two
    reasons they had to name before confirming it. */
export type Mark = { verdict: Verdict; reasons: ReasonId[] };
export type Marks = Record<string, Mark>;

/** Reasons required before the confirm button unlocks. */
export const REQUIRED_REASONS = 2;
