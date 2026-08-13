import type { Lifetime } from "./progress";

/* Save/load for the whole game state, so a refresh doesn't lose progress.

   Deliberately excludes anything mid-round (marks, timeLeft, an in-progress
   Beat the Clock run, current screen) — resuming mid-case is out of scope for
   now. Refreshing mid-round returns the player to the map with everything
   else intact, which matches how "reset" already treats a fresh start.

   Fails soft everywhere: a missing key, corrupted JSON, or unavailable
   localStorage (private browsing, quota) all just fall back to no save,
   rather than throwing. Nothing here is sent anywhere — matches the existing
   "this game collects nothing by default" language already in Settings. */

export type SaveData = {
  version: 1;
  tips: number;
  solved: string[];
  activeIndex: number;
  inventory: Record<string, number>;
  owned: string[];
  stars: Record<string, number>;
  medals: Record<string, string>;
  bestTimes: Record<string, number>;
  lifetime: Lifetime;
  prologueSeen: boolean;
  tutorialDone: boolean;
  legendIntroSeen: boolean;
  /** clock the dummy leaderboard accounts drift from — persisted so drift is
      stable across sessions instead of restarting every refresh */
  leaderboardSeedTs: number;
};

const KEY = "bth:save:v1";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Minimal shape check so a corrupted or foreign value can't crash the app —
    if anything looks wrong we just say "no save" and let normal defaults run. */
function looksLikeSaveData(v: unknown): v is SaveData {
  if (!isRecord(v)) return false;
  return (
    v.version === 1 &&
    typeof v.tips === "number" &&
    Array.isArray(v.solved) &&
    typeof v.activeIndex === "number" &&
    isRecord(v.inventory) &&
    Array.isArray(v.owned) &&
    isRecord(v.stars) &&
    isRecord(v.medals) &&
    isRecord(v.bestTimes) &&
    isRecord(v.lifetime) &&
    typeof v.prologueSeen === "boolean" &&
    typeof v.tutorialDone === "boolean" &&
    typeof v.legendIntroSeen === "boolean" &&
    typeof v.leaderboardSeedTs === "number"
  );
}

export function loadSave(): SaveData | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return looksLikeSaveData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveGame(data: SaveData): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // quota exceeded / private browsing / storage disabled — silently skip,
    // the game still works, it just won't remember this session
  }
}

export function clearSave(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nothing to do if storage isn't available
  }
}