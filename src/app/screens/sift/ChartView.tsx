import React from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelSprite } from "../../components/Pixel";
import type { ChartExhibit } from "../../game/sift";

/* The fourth folder tab: CHART / STATISTIC.

   A reference exhibit rather than a set of hotspots — the numbers the story is
   built on, drawn honestly, so the player can see for themselves what the
   headline did to them. Bars are stepped in 4px blocks; nothing is smooth. */

export function ChartView({ chart }: { chart: ChartExhibit }) {
  const values = chart.bars.map((b) => b.value);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const span = Math.max(1e-6, max - min);
  const H = 128;
  const zeroY = (max / span) * H;

  return (
    <div
      className="bth-scroll"
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "8px 12px 12px",
        ...speckle(C.paper, C.paper2, 4),
        boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <PixelSprite name="chart" scale={1.4} />
        <Display size={9} color={C.ink}>
          {chart.title}
        </Display>
      </div>
      <div style={{ borderTop: `2px solid ${C.ink}`, margin: "5px 0 8px" }} />

      {/* plot */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          height: H + 26,
          padding: "0 6px",
          position: "relative",
          backgroundColor: C.white,
          boxShadow: `0 0 0 2px ${C.ink}`,
        }}
      >
        {/* zero line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 26 + (min < 0 ? (-min / span) * H : 0),
            height: 2,
            backgroundColor: C.ink3,
          }}
        />
        {chart.bars.map((b) => {
          const h = Math.max(3, (Math.abs(b.value) / span) * H);
          const neg = b.value < 0;
          return (
            <div
              key={b.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
                paddingBottom: 4,
              }}
            >
              <Mono size={13} color={b.highlight ? C.red : C.ink3}>
                {b.value}
              </Mono>
              <div
                style={{
                  width: "100%",
                  height: h,
                  marginTop: 2,
                  marginBottom: neg ? 0 : 0,
                  backgroundColor: b.highlight ? C.red : C.slate,
                  boxShadow: `inset 2px 2px 0 0 ${b.highlight ? "#D6483C" : "#6B7A85"}, inset -2px -2px 0 0 ${C.ink}, 0 0 0 2px ${C.ink}`,
                }}
              />
              <Mono size={11} color={C.ink3} >
                {b.label}
              </Mono>
            </div>
          );
        })}
        <span style={{ position: "absolute", top: 3, right: 6 }}>
          <Mono size={11} color={C.paper4}>
            {chart.unit.toUpperCase()}
          </Mono>
        </span>
        <span style={{ position: "absolute", top: 3, left: 6, opacity: 0 }} aria-hidden>
          {Math.round(zeroY)}
        </span>
      </div>

      <div style={{ marginTop: 7, display: "flex", gap: 6, alignItems: "flex-start" }}>
        <PixelSprite name="stamp" scale={1} />
        <div>
          <Mono size={12} color={C.paper4}>
            SOURCE
          </Mono>
          <br />
          <Body size={13} color={C.ink}>
            {chart.source}
          </Body>
        </div>
      </div>

      <div
        style={{
          marginTop: 7,
          padding: 6,
          backgroundColor: C.paper3,
          boxShadow: `inset 2px 2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
        }}
      >
        <Body size={13} color={C.ink}>
          {chart.note}
        </Body>
      </div>

      <div
        style={{
          marginTop: 7,
          padding: 6,
          display: "flex",
          gap: 7,
          alignItems: "flex-start",
          backgroundColor: C.ink,
        }}
      >
        <PixelSprite name="editor" scale={1.3} title="The Editor" />
        <div>
          <Mono size={12} color={C.brassLight}>
            READ IT STRAIGHT
          </Mono>
          <br />
          <Body size={13} color={C.paper}>
            {chart.reading}
          </Body>
        </div>
      </div>
    </div>
  );
}
