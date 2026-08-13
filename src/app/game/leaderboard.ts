/* Leaderboard.

   The real player's row is always live — driven by `tips`, the same currency
   the HUD already shows. The dummy rows are deterministic functions of time,
   not a setInterval: each has a base score and a slow drift-per-hour, so the
   board keeps moving between visits without any background timer running,
   and without the numbers jumping around on every re-render.

   The clock the drift is measured from (`leaderboardSeedTs`) is generated
   once on first launch and persisted, so a returning player sees a board
   that has believably moved on since they last looked — not one that reset
   to the same starting numbers every refresh. */

export type LeaderboardEntry = {
  id: string;
  name: string;
  isPlayer: boolean;
  tips: number;
};

export type DummyAccount = {
  id: string;
  name: string;
  baseTips: number;
  /** average tips gained per real hour since the leaderboard seed time */
  driftPerHour: number;
};

/* Eight named accounts, spread across a believable range so the player has
   people just above and just below them at any given tip count, matching
   the newsroom/detective flavour of the rest of the game. Base scores are
   deliberately uneven, not evenly spaced — a real leaderboard never is. */
export const DUMMY_ACCOUNTS: DummyAccount[] = [
  { id: "d1", name: "R. OKONKWO", baseTips: 420, driftPerHour: 14 },
  { id: "d2", name: "M. VASQUEZ", baseTips: 310, driftPerHour: 9 },
  { id: "d3", name: "T. LINDQVIST", baseTips: 265, driftPerHour: 6 },
  { id: "d4", name: "S. DUBOIS", baseTips: 190, driftPerHour: 11 },
  { id: "d5", name: "A. FERREIRA", baseTips: 150, driftPerHour: 5 },
  { id: "d6", name: "K. NAKAMURA", baseTips: 95, driftPerHour: 8 },
  { id: "d7", name: "J. WHITFIELD", baseTips: 60, driftPerHour: 4 },
  { id: "d8", name: "P. ADEYEMI", baseTips: 25, driftPerHour: 7 },
];

/** Deterministic "current" score for a dummy account: base + drift since seed. */
export function dummyTipsNow(account: DummyAccount, seedTs: number, now: number = Date.now()): number {
  const hoursSinceSeed = Math.max(0, (now - seedTs) / (1000 * 60 * 60));
  return Math.round(account.baseTips + account.driftPerHour * hoursSinceSeed);
}

/** Full board: dummy accounts computed live, plus the real player, sorted by tips. */
export function buildLeaderboard(
  playerTips: number,
  seedTs: number,
  now: number = Date.now(),
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = DUMMY_ACCOUNTS.map((a) => ({
    id: a.id,
    name: a.name,
    isPlayer: false,
    tips: dummyTipsNow(a, seedTs, now),
  }));
  entries.push({ id: "player", name: "YOU", isPlayer: true, tips: playerTips });
  return entries.sort((a, b) => b.tips - a.tips);
}

/** "#3 of 9" style label for the player's current position. */
export function playerRankLabel(entries: LeaderboardEntry[]): string {
  const i = entries.findIndex((e) => e.isPlayer);
  if (i < 0) return "";
  return `#${i + 1} OF ${entries.length}`;
}