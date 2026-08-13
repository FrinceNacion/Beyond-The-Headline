import React from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { TopHud } from "../components/Hud";
import type { CaseDef } from "../game/cases";

/* Placeholder screen for cases that are not yet implemented.
   Shown whenever CASE_GAMES[cs.id] === "underdev". The case assets
   (article, social, quote, hotspots) are preserved in data.ts for
   when the bespoke game type is built. */

export function UnderDevGame({
  cs,
  tips,
  rank,
  onBack,
}: {
  cs: CaseDef;
  tips: number;
  rank: string;
  onBack: () => void;
}) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopHud
        tips={tips}
        rank={rank}
        accent={C.ink2}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name={cs.sprite} scale={1} />
            <Display size={8} color={C.paper}>
              {cs.tag}
            </Display>
          </div>
        }
        right={
          <PixelButton variant="ink" size={8} onClick={onBack} label="Button — Back to map">
            ◂ BACK
          </PixelButton>
        }
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: 420,
            maxWidth: "100%",
            padding: 20,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <PixelSprite name={cs.sprite} scale={2.4} title={cs.building} />
          </div>

          <Display size={10} color={C.ink}>
            {cs.title.toUpperCase()}
          </Display>
          <br />
          <Mono size={12} color={C.paper4} style={{ display: "block", marginBottom: 14 }}>
            {cs.tag} · {cs.building.toUpperCase()}
          </Mono>

          <div
            style={{
              padding: "10px 14px",
              backgroundColor: C.paper3,
              boxShadow: `inset 2px 2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
              marginBottom: 16,
            }}
          >
            <Body size={15} color={C.ink}>
              This case is under development.
            </Body>
          </div>

          <PixelButton variant="ink" size={9} onClick={onBack} label="Button — Back to map">
            ◂ BACK TO MAP
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
