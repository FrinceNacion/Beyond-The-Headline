import React from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, HandoffTag, Mono, PixelButton, PixelChip, PixelSprite } from "../components/Pixel";
import { PHASES, VERDICTS } from "../game/mil";

const COLUMNS: { state: "default" | "pressed" | "disabled"; note: string }[] = [
  { state: "default", note: "Idle. Light bevel top-left." },
  { state: "pressed", note: "Bevel inverts, offsets 1px." },
  { state: "disabled", note: "Charcoal fill, greyed sprite." },
];

export function StatesLegend({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        backgroundColor: "rgba(20,24,28,0.75)",
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
          width: "100%",
          maxHeight: "100%",
          overflowY: "auto",
          padding: 10,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `0 0 0 3px ${C.ink}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Display size={10} color={C.ink}>
            STATES LEGEND
          </Display>
          <PixelButton variant="ink" size={8} onClick={onClose} label="Button — Close legend">
            CLOSE ✕
          </PixelButton>
        </div>
        <div style={{ margin: "4px 0 8px" }}>
          <Body size={13} color={C.ink3}>
            Every interactive element in the build uses these three pixel states. Tagged for handoff.
          </Body>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "92px repeat(3, 1fr)", gap: 8, alignItems: "center" }}>
          <div />
          {COLUMNS.map((c) => (
            <div key={c.state} style={{ textAlign: "center" }}>
              <HandoffTag>{c.state.toUpperCase()}</HandoffTag>
            </div>
          ))}

          {/* primary */}
          <Mono size={14} color={C.ink3}>
            PRIMARY
          </Mono>
          {COLUMNS.map((c) => (
            <div key={c.state} style={{ display: "flex", justifyContent: "center" }}>
              <PixelButton variant="brass" size={8} icon="coin" iconScale={1.2} forceState={c.state}>
                CONTINUE
              </PixelButton>
            </div>
          ))}

          {/* secondary */}
          <Mono size={14} color={C.ink3}>
            SECONDARY
          </Mono>
          {COLUMNS.map((c) => (
            <div key={c.state} style={{ display: "flex", justifyContent: "center" }}>
              <PixelButton variant="paper" size={8} icon="doc" iconScale={1.2} forceState={c.state}>
                SOURCES
              </PixelButton>
            </div>
          ))}

          {/* destructive */}
          <Mono size={14} color={C.ink3}>
            FLAG
          </Mono>
          {COLUMNS.map((c) => (
            <div key={c.state} style={{ display: "flex", justifyContent: "center" }}>
              <PixelButton variant="red" size={8} icon="flag" iconScale={1.2} forceState={c.state}>
                MISLEADING
              </PixelButton>
            </div>
          ))}

          {/* confirm */}
          <Mono size={14} color={C.ink3}>
            CONFIRM
          </Mono>
          {COLUMNS.map((c) => (
            <div key={c.state} style={{ display: "flex", justifyContent: "center" }}>
              <PixelButton variant="green" size={8} icon="check" iconScale={1.2} forceState={c.state}>
                CHECKS OUT
              </PixelButton>
            </div>
          ))}

          {/* chips */}
          <Mono size={14} color={C.ink3}>
            REASON CHIP
          </Mono>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PixelChip>No source given</PixelChip>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PixelChip active>No source given</PixelChip>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PixelChip disabled>No source given</PixelChip>
          </div>

          {/* SIFT phase steps */}
          <Mono size={14} color={C.ink3}>
            SIFT STEP
          </Mono>
          {[
            { bg: C.ink2, ring: C.ink3, fg: C.paper3, label: "LOCKED", spr: "lock" },
            { bg: C.brass, ring: C.brassDark, fg: C.ink, label: "ACTIVE", spr: "siftSource" },
            { bg: C.ink3, ring: C.green, fg: C.greenLight, label: "DONE", spr: "check" },
          ].map((st) => (
            <div key={st.label} style={{ display: "flex", justifyContent: "center" }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 7px",
                  backgroundColor: st.bg,
                  boxShadow: `inset -2px -2px 0 0 ${C.ink}, 0 0 0 2px ${st.ring}`,
                }}
              >
                <PixelSprite name={st.spr} scale={1.1} desaturate={st.label === "LOCKED"} />
                <Mono size={13} color={st.fg}>
                  {st.label}
                </Mono>
              </span>
            </div>
          ))}

          {/* hotspot */}
          <Mono size={14} color={C.ink3}>
            HOTSPOT
          </Mono>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span style={{ boxShadow: `inset 0 -2px 0 0 ${C.red}`, padding: "0 2px" }}>
              <Body size={13} color={C.ink}>
                unchecked claim
              </Body>
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span
              style={{
                boxShadow: `inset 0 -3px 0 0 ${C.red}`,
                backgroundColor: "rgba(183,41,30,0.18)",
                padding: "0 2px",
              }}
            >
              <Body size={13} color={C.ink}>
                marked
              </Body>
              <span style={{ padding: "0 2px", marginLeft: 3, backgroundColor: C.red }}>
                <Mono size={11} color={C.white}>
                  ML
                </Mono>
              </span>
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span style={{ boxShadow: `inset 0 -2px 0 0 ${C.paper4}`, padding: "0 2px" }}>
              <Body size={13} color={C.ink3}>
                locked until SIFT done
              </Body>
            </span>
          </div>
        </div>

        {/* five judgement states — the colour-blind contract lives here */}
        <div style={{ marginTop: 12 }}>
          <Display size={8} color={C.red}>
            JUDGEMENT STATES
          </Display>
          <div style={{ marginTop: 2 }}>
            <Body size={13} color={C.ink3}>
              Colour is never the only signal: each state also carries a two-letter code and a distinct glyph, and
              colour-blind mode replaces the green axis with blue.
            </Body>
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
            {VERDICTS.map((v) => (
              <div
                key={v.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 6px",
                  backgroundColor: C.paper2,
                  boxShadow: `0 0 0 2px ${v.color}, inset -2px -2px 0 0 ${C.paper3}`,
                }}
              >
                <span style={{ padding: "0 3px", backgroundColor: v.color }}>
                  <Mono size={12} color={C.white}>
                    {v.code}
                  </Mono>
                </span>
                <PixelSprite name={v.sprite} scale={1} />
                <span>
                  <Mono size={13} color={C.ink}>
                    {v.label}
                  </Mono>
                  <br />
                  <Mono size={11} color={C.ink3}>
                    {v.blurb}
                  </Mono>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* the four moves, as icons */}
        <div style={{ marginTop: 12 }}>
          <Display size={8} color={C.red}>
            SIFT MOVES
          </Display>
          <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
            {PHASES.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ padding: 3, backgroundColor: C.ink2, boxShadow: `0 0 0 2px ${C.ink}` }}>
                  <PixelSprite name={p.sprite} scale={1.4} />
                </div>
                <Mono size={13} color={C.ink3}>
                  {p.label}
                </Mono>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["coin", "lock", "pin", "stamp", "badge", "magnifier", "briefcase", "gear", "doc", "phone", "quotecard", "flag", "check", "coffee", "redpen", "hourglass", "notebook", "secondsource", "chart", "gauge", "globe", "people", "handbook", "shield", "export", "keyboard", "eye"].map(
            (n) => (
              <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ padding: 3, backgroundColor: C.ink2, boxShadow: `0 0 0 2px ${C.ink}` }}>
                  <PixelSprite name={n} scale={1.6} />
                </div>
                <Mono size={12} color={C.ink3}>
                  {n.toUpperCase()}
                </Mono>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
