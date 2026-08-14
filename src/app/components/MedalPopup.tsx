import React from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "./Pixel";
import { COMPETENCY, type CompetencyId } from "../game/mil";
import { medalTierForStars, type MedalType } from "../game/scoring";
import { progressMetaFor } from "../game/sift";

export function MedalPopup({
  caseId,
  caseTitle,
  starsCount,
  onClose,
}: {
  caseId: string;
  caseTitle: string;
  starsCount: number;
  onClose: () => void;
}) {
  const medal = medalTierForStars(starsCount);
  if (!medal) return null;

  const meta = progressMetaFor(caseId);
  const comp = COMPETENCY[meta.competency as CompetencyId];

  const medalTitles: Record<MedalType, string> = {
    gold: "GOLD MEDAL EARNED!",
    silver: "SILVER MEDAL EARNED!",
    bronze: "BRONZE MEDAL EARNED!",
  };

  const medalColors: Record<MedalType, string> = {
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Medal Earned"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        backgroundColor: "rgba(12, 16, 20, 0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        className="bth-rise"
        style={{
          width: 440,
          maxWidth: "100%",
          padding: 16,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 4px ${C.ink}`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PixelSprite name="starOn" scale={1.5} />
          <Mono size={13} color={C.brass}>
            {starsCount} {starsCount === 1 ? "STAR" : "STARS"} RATING
          </Mono>
          <PixelSprite name="starOn" scale={1.5} />
        </div>

        {/* Medal Badge Display */}
        <div
          className="bth-stamp"
          style={{
            margin: "4px 0",
            padding: 12,
            backgroundColor: C.ink2,
            boxShadow: `0 0 0 3px ${C.ink}, inset 2px 2px 0 0 ${C.ink3}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            width: "85%",
          }}
        >
          <PixelSprite name={medal} scale={3.5} />
          <Display size={11} color={medalColors[medal]}>
            {medalTitles[medal]}
          </Display>
        </div>

        {/* Case & Skill attribution */}
        <div
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: C.paper3,
            boxShadow: `inset 2px 2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
            textAlign: "left",
          }}
        >
          <Mono size={12} color={C.ink3}>
            CASE: {caseTitle.toUpperCase()}
          </Mono>
          <div style={{ marginTop: 4 }}>
            <Body size={14} color={C.ink}>
              You earned a badge in{" "}
              <strong style={{ color: C.redDark }}>
                {comp ? comp.name : "Media & Information Literacy"}
              </strong>
              !
            </Body>
          </div>
          {comp ? (
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <PixelSprite name={comp.sprite} scale={1.4} />
              <Mono size={12} color={C.brassDark}>
                SKILL: {comp.short}
              </Mono>
            </div>
          ) : null}
        </div>

        <Mono size={12} color={C.paper4}>
          MEDAL SAVED TO YOUR RECORD TAB IN COMMUNITY MAP
        </Mono>

        <PixelButton
          variant="brass"
          size={10}
          icon="badge"
          iconScale={1.2}
          onClick={onClose}
          label="Button — Collect Medal"
        >
          COLLECT MEDAL ▸
        </PixelButton>
      </div>
    </div>
  );
}
