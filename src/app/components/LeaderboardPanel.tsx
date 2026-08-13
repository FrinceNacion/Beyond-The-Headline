import React, { useMemo } from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "./Pixel";
import { buildLeaderboard, playerRankLabel } from "../game/leaderboard";

/* Community leaderboard — a section the player opens from the map's HUD.

   The dummy rows drift slowly (see game/leaderboard.ts); the player's row is
   always the live `tips` total, so it moves the instant a case is filed. */

export function LeaderboardPanel({
  tips,
  leaderboardSeedTs,
  onClose,
}: {
  tips: number;
  leaderboardSeedTs: number;
  onClose: () => void;
}) {
  const entries = useMemo(
    () => buildLeaderboard(tips, leaderboardSeedTs),
    [tips, leaderboardSeedTs],
  );
  const rankLabel = playerRankLabel(entries);

  return (
    <div
      role="dialog"
      aria-label="Community leaderboard"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(20,24,28,0.72)",
        padding: 12,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: 8,
            backgroundColor: C.ink,
            boxShadow: `inset 0 -2px 0 0 ${C.brassDark}`,
          }}
        >
          <PixelSprite name="badge" scale={1.3} />
          <Display size={8} color={C.brassLight}>
            COMMUNITY LEADERBOARD
          </Display>
          <div style={{ flex: 1 }} />
          <Mono size={12} color={C.brass}>
            {rankLabel}
          </Mono>
        </div>

        <div className="bth-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 8 }}>
          <Mono size={12} color={C.ink3}>
            TIPS EARNED, TOWN-WIDE
          </Mono>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
            {entries.map((e, i) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 7px",
                  backgroundColor: e.isPlayer ? C.paper : C.paper3,
                  boxShadow: e.isPlayer
                    ? `inset -2px -2px 0 0 ${C.brassDark}, 0 0 0 2px ${C.brass}`
                    : `inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
                }}
              >
                <Mono size={15} color={i < 3 ? C.red : C.ink3} style={{ width: 28, flexShrink: 0 }}>
                  #{i + 1}
                </Mono>
                <Mono size={14} color={C.ink} style={{ flex: 1, minWidth: 0 }}>
                  {e.name}
                </Mono>
                {e.isPlayer ? (
                  <span style={{ padding: "0 4px", backgroundColor: C.brass, boxShadow: `0 0 0 1px ${C.ink}` }}>
                    <Mono size={11} color={C.ink}>
                      YOU
                    </Mono>
                  </span>
                ) : null}
                <PixelSprite name="coin" scale={1.1} />
                <Mono size={15} color={C.brassDark}>
                  {e.tips}
                </Mono>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 8, padding: 6, backgroundColor: C.paper3, boxShadow: `inset 3px 0 0 0 ${C.slate}` }}>
            <Body size={12} color={C.ink}>
              Other rows are illustrative town accounts, not real players — your row is the only one that moves
              because of anything you actually do.
            </Body>
          </div>
        </div>

        <div style={{ padding: 8, display: "flex", justifyContent: "flex-end" }}>
          <PixelButton variant="ink" size={8} onClick={onClose} label="Button — Close leaderboard">
            ◂ BACK
          </PixelButton>
        </div>
      </div>
    </div>
  );
}