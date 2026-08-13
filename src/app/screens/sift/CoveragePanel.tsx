import React from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../../components/Pixel";
import type { Snippet } from "../../game/sift";

/* Screen 5c — FIND BETTER COVERAGE.

   Lateral reading: leave the page, look at how everyone else told it. Each
   card is tagged with what it does to the claim, not with a verdict. The
   echo-chamber card and the satire card are the two the player must learn to
   discount without discounting everything. */

const RELATION: Record<Snippet["relation"], { label: string; color: string; sprite: string; note: string }> = {
  corroborates: { label: "CORROBORATES", color: C.green, sprite: "check", note: "Independent reporting that agrees" },
  contradicts: { label: "CONTRADICTS", color: C.red, sprite: "cross", note: "The record says something else" },
  echo: { label: "ECHO", color: "#C8A32E", sprite: "compCompare", note: "Repeats the claim, adds no reporting" },
  satire: { label: "SATIRE", color: "#8C4A3A", sprite: "compGenre", note: "A joke page — not evidence either way" },
};

const BIAS_TONE: Record<string, string> = {
  Center: C.slate,
  Left: "#3F6FA8",
  Right: "#8C4A3A",
  Sensational: "#C8A32E",
  Satire: "#6B7A85",
  Official: "#2F6F4E",
};

export function CoveragePanel({ snippets, onDone, readOnly }: { snippets: Snippet[]; onDone: () => void; readOnly?: boolean }) {
  return (
    <div
      className="bth-scroll"
      role="region"
      aria-label="Coverage from other outlets"
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "8px 10px 10px",
        ...speckle(C.ink2, C.ink3, 4),
        boxShadow: `0 0 0 2px ${C.ink}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <PixelSprite name="siftCoverage" scale={1.4} />
        <Display size={9} color={C.brassLight}>
          THE SAME CLAIM, ELSEWHERE
        </Display>
        <Mono size={12} color={C.paper4}>
          {snippets.length} OUTLETS
        </Mono>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {snippets.map((s) => {
          const rel = RELATION[s.relation];
          return (
            <div
              key={s.outlet}
              style={{
                padding: 7,
                ...speckle(C.paper, C.paper2, 4),
                boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}, inset 0 4px 0 0 ${rel.color}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <PixelSprite name={rel.sprite} scale={1} />
                <Mono size={12} color={rel.color}>
                  {rel.label}
                </Mono>
                <span
                  style={{
                    marginLeft: "auto",
                    padding: "0 4px",
                    backgroundColor: BIAS_TONE[s.bias] ?? C.slate,
                  }}
                >
                  <Mono size={11} color={C.white}>
                    {s.bias.toUpperCase()}
                  </Mono>
                </span>
              </div>

              <div style={{ marginTop: 4 }}>
                <Mono size={13} color={C.ink3}>
                  {s.outlet}
                </Mono>
                <br />
                <Body size={13} color={C.ink} style={{ fontWeight: 700 }}>
                  {s.headline}
                </Body>
              </div>

              <div style={{ marginTop: 3 }}>
                <Body size={12} color={C.ink3}>
                  {s.body}
                </Body>
              </div>

              <div
                style={{
                  marginTop: 5,
                  padding: "3px 5px",
                  backgroundColor: C.paper3,
                  boxShadow: `inset 2px 0 0 0 ${C.red}`,
                }}
              >
                <Mono size={11} color={C.paper4}>
                  KEY DIFFERENCE
                </Mono>
                <br />
                <Body size={12} color={C.ink}>
                  {s.keyFact}
                </Body>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 8 }}>
        {readOnly ? (
          <PixelButton variant="ink" size={9} icon="doc" iconScale={1.1} onClick={onDone} label="Button — Close reference">
            ◂ BACK TO MARKING
          </PixelButton>
        ) : (
          <PixelButton variant="brass" size={9} icon="siftTrace" iconScale={1.2} onClick={onDone} label="Button — Next SIFT step">
            NEXT: TRACE THE CLAIM
          </PixelButton>
        )}
        <Mono size={12} color={C.paper4}>
          FOUR SOURCES REPEATING EACH OTHER IS STILL ONE SOURCE.
        </Mono>
      </div>
    </div>
  );
}
