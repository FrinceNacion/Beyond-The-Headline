import React from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { COMPETENCY, PHASES, VERDICTS } from "../game/mil";
import { CASES } from "../game/cases";
import { siftFor } from "../game/sift";

/* The one-page UNESCO MIL alignment summary.

   Exists so a curriculum lead can answer "what does this actually teach?" in
   under a minute, without playing it. One page, one table, no marketing. */

export function MilAlignment({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="UNESCO MIL alignment summary"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 46,
        backgroundColor: "rgba(20,24,28,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bth-scroll"
        style={{
          width: 700,
          maxWidth: "100%",
          maxHeight: "100%",
          overflowY: "auto",
          padding: 10,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <PixelSprite name="globe" scale={1.8} />
          <div style={{ flex: 1 }}>
            <Display size={10} color={C.ink}>
              UNESCO MIL ALIGNMENT
            </Display>
            <br />
            <Mono size={13} color={C.paper4}>
              BEYOND THE HEADLINE · ONE-PAGE SUMMARY FOR EDUCATORS
            </Mono>
          </div>
          <PixelButton variant="ink" size={8} onClick={onClose} label="Button — Close">
            CLOSE
          </PixelButton>
        </div>

        <div style={{ borderTop: `2px solid ${C.ink}`, margin: "7px 0" }} />

        <Body size={13} color={C.ink}>
          The game teaches four checking moves (SIFT, Caulfield 2017) and grades five judgement states plus
          calibration. Each case is mapped to one competency from the UNESCO Media and Information Literacy
          Curriculum for Educators and Learners (2011, rev. 2021). Playtime is roughly 55 minutes for eight stages.
        </Body>

        {/* SIFT -> competency */}
        <div style={{ marginTop: 8 }}>
          <Display size={8} color={C.red}>
            METHOD → COMPETENCY
          </Display>
          <div style={{ marginTop: 4 }}>
            {PHASES.filter((p) => p.id !== "mark").map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  gap: 7,
                  alignItems: "center",
                  padding: "4px 6px",
                  marginBottom: 3,
                  backgroundColor: C.paper2,
                  boxShadow: `0 0 0 2px ${C.paper4}`,
                }}
              >
                <PixelSprite name={p.sprite} scale={1.2} />
                <div style={{ flex: "0 0 128px" }}>
                  <Mono size={13} color={C.ink}>
                    {p.label}
                  </Mono>
                </div>
                <PixelSprite name={COMPETENCY[p.competency].sprite} scale={1.1} />
                <Body size={13} color={C.ink3}>
                  {COMPETENCY[p.competency].name}
                </Body>
              </div>
            ))}
          </div>
        </div>

        {/* case -> competency -> habit */}
        <div style={{ marginTop: 8 }}>
          <Display size={8} color={C.red}>
            CASE → COMPETENCY → TRANSFERABLE HABIT
          </Display>
          <div style={{ marginTop: 4 }}>
            {/* header row */}
            <div style={{ display: "flex", gap: 6, padding: "2px 6px" }}>
              <div style={{ flex: "0 0 150px" }}>
                <Mono size={12} color={C.paper4}>
                  CASE
                </Mono>
              </div>
              <div style={{ flex: "0 0 160px" }}>
                <Mono size={12} color={C.paper4}>
                  COMPETENCY
                </Mono>
              </div>
              <div style={{ flex: 1 }}>
                <Mono size={12} color={C.paper4}>
                  WHAT THE PLAYER LEAVES WITH
                </Mono>
              </div>
            </div>
            {CASES.map((cs, i) => {
              const s = siftFor(cs.id);
              return (
                <div
                  key={cs.id}
                  style={{
                    display: "flex",
                    gap: 6,
                    padding: "4px 6px",
                    backgroundColor: i % 2 ? C.paper2 : C.paper,
                    boxShadow: `0 0 0 1px ${C.paper4}`,
                  }}
                >
                  <div style={{ flex: "0 0 150px", minWidth: 0 }}>
                    <Mono size={13} color={C.ink}>
                      {cs.tag}
                    </Mono>
                    <br />
                    <Mono size={11} color={C.ink3}>
                      {cs.building.toUpperCase()}
                    </Mono>
                  </div>
                  <div style={{ flex: "0 0 160px", display: "flex", alignItems: "center", gap: 5 }}>
                    <PixelSprite name={COMPETENCY[s.competency].sprite} scale={1} />
                    <Mono size={12} color={C.ink}>
                      {COMPETENCY[s.competency].short}
                    </Mono>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Body size={12} color={C.ink3}>
                      {s.literacyMove.replace(/^Next time: /, "")}
                    </Body>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* assessment claims */}
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          <div
            style={{
              flex: 1,
              padding: 6,
              backgroundColor: C.paper2,
              boxShadow: `0 0 0 2px ${C.paper4}, inset 5px 0 0 0 ${C.green}`,
            }}
          >
            <Mono size={12} color={C.ink3}>
              WHAT IS ASSESSED
            </Mono>
            <br />
            <Body size={12} color={C.ink}>
              Verdict accuracy across five states, quality of stated reasoning (two reasons per claim), and
              calibration — over-flagging is scored as error, not caution.
            </Body>
          </div>
          <div
            style={{
              flex: 1,
              padding: 6,
              backgroundColor: C.paper2,
              boxShadow: `0 0 0 2px ${C.paper4}, inset 5px 0 0 0 ${C.red}`,
            }}
          >
            <Mono size={12} color={C.ink3}>
              WHAT IS NOT CLAIMED
            </Mono>
            <br />
            <Body size={12} color={C.ink}>
              Cases are fictional and each isolates one pattern. The game builds the moves; it does not certify
              anyone, and it is not endorsed by UNESCO.
            </Body>
          </div>
        </div>

        {/* the five states, for reference */}
        <div style={{ marginTop: 8 }}>
          <Display size={8} color={C.red}>
            JUDGEMENT STATES
          </Display>
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {VERDICTS.map((v) => (
              <span key={v.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 5px", backgroundColor: C.paper2, boxShadow: `0 0 0 2px ${v.color}` }}>
                <span style={{ padding: "0 3px", backgroundColor: v.color }}>
                  <Mono size={11} color={C.white}>
                    {v.code}
                  </Mono>
                </span>
                <Mono size={12} color={C.ink}>
                  {v.label}
                </Mono>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
