import type React from "react";

/* Shared plumbing for the two opening drill stages.

   A drill is a self-contained mini-game that reports every judgement the
   player makes back through the same api the SIFT cases use conceptually:
   a call is either right or wrong, and a wrong call costs a life. The shell
   owns lives, score, the clock, and every screen around the gameplay, so the
   two stages pace identically and the HUD never moves. */

export type DrillApi = {
  /** Report one judgement. A wrong call costs a life and flashes the frame. */
  call: (right: boolean, note?: string) => void;
  /** The drill has run out of material — hand control back to the shell. */
  finish: () => void;
  lives: number;
  /** false while an overlay is up, so drills freeze instead of running blind */
  running: boolean;
};

export type Drill = {
  id: string;
  name: string;
  /** one-line objective, shown on the drill card and in the HUD */
  objective: string;
  /** two or three concrete instructions on the drill card */
  how: string[];
  /** icon sprite for the drill card */
  sprite: string;
  /** hard countdown for this drill, seconds */
  seconds: number;
  Component: React.ComponentType<{ api: DrillApi }>;
};

export type StageResult = {
  cleared: boolean;
  stars: number;
  tips: number;
  /** right calls / total calls — folded into the lifetime credential */
  correct: number;
  calls: number;
};

/** Props every drill stage takes, so the app can route to them by case id. */
export type StageProps = {
  cs: import("../../game/cases").CaseDef;
  tips: number;
  rank: string;
  index: number;
  clockFrame: number;
  onComplete: (r: StageResult) => void;
  onExit: () => void;
};

export const STAGE_LIVES = 3;
export const POINTS_PER_CALL = 10;

/** The three promises made on the briefing card, in shell order. */
export const STAGE_STARS = [
  "Clear both drills",
  "Finish with two lives or more",
  "Make no wrong calls at all",
];
