import React, { useState } from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../../components/Pixel";
import type { Trace } from "../../game/sift";

/* Screen 5d — TRACE THE CLAIM TO ITS ORIGIN.

   A flow diagram, drawn with hard pixel arrows, running from the original
   document downstream to the version that reached the player. Tap a link to
   expand it. The "drift" note on each arrow is where the claim changed —
   which is almost always more interesting than whether it's "true". */

const KIND_LABEL: Record<Trace["kind"], string> = {
  statistic: "STATISTIC",
  quote: "QUOTE",
  image: "IMAGE",
};

function Arrow({ drift }: { drift?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0 3px 18px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 4, height: 8, backgroundColor: C.brass }} />
        <div style={{ width: 12, height: 4, backgroundColor: C.brass }} />
        <div style={{ width: 4, height: 4, backgroundColor: C.brass, marginTop: 0 }} />
      </div>
      {drift ? (
        <div
          style={{
            flex: 1,
            padding: "4px 7px",
            backgroundColor: "rgba(183,41,30,0.18)",
            boxShadow: `0 0 0 2px ${C.red}, inset 3px 0 0 0 ${C.red}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <div style={{ padding: "0 4px", backgroundColor: C.red }}>
              <Mono size={11} color={C.white}>
                DRIFT DETECTED
              </Mono>
            </div>
          </div>
          <Body size={12} color={C.ink}>
            {drift}
          </Body>
        </div>
      ) : (
        <Mono size={12} color={C.paper4}>
          UNCHANGED
        </Mono>
      )}
    </div>
  );
}

export function TracePanel({ trace, onDone, readOnly }: { trace: Trace; onDone: () => void; readOnly?: boolean }) {
  const [open, setOpen] = useState<number>(0);

  return (
    <div
      className="bth-scroll"
      role="region"
      aria-label="Claim origin chain"
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "8px 10px 10px",
        ...speckle(C.paper, C.paper2, 4),
        boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <PixelSprite name="siftTrace" scale={1.4} />
        <Display size={9} color={C.ink}>
          WHERE THIS CAME FROM
        </Display>
        <span style={{ marginLeft: "auto", padding: "1px 5px", backgroundColor: C.ink }}>
          <Mono size={12} color={C.brassLight}>
            {KIND_LABEL[trace.kind]}
          </Mono>
        </span>
      </div>

      <div
        style={{
          margin: "6px 0 8px",
          padding: 6,
          backgroundColor: C.paper3,
          boxShadow: `inset 2px 2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
        }}
      >
        <Mono size={12} color={C.ink3}>
          THE CLAIM AS IT REACHED YOU
        </Mono>
        <br />
        <Body size={14} color={C.ink}>
          {trace.claim}
        </Body>
      </div>

      {trace.steps.map((s, i) => {
        const expanded = open === i;
        const first = i === 0;
        return (
          <React.Fragment key={s.label}>
            {i ? <Arrow drift={trace.steps[i - 1].drift} /> : null}
            <button
              type="button"
              data-interactive="trace-step"
              aria-expanded={expanded}
              aria-label={`Chain step — ${s.label}`}
              onClick={() => setOpen(expanded ? -1 : i)}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                padding: 6,
                backgroundColor: expanded ? C.white : C.paper2,
                boxShadow: `inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}, inset 5px 0 0 0 ${first ? C.green : C.brass}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <PixelSprite name={first ? "stamp" : "doc"} scale={1} />
                <Mono size={13} color={first ? C.green : C.ink3}>
                  {s.label}
                </Mono>
                <span style={{ marginLeft: "auto" }}>
                  <Mono size={12} color={C.paper4}>
                    {s.date}
                  </Mono>
                </span>
              </div>
              {expanded ? (
                <div style={{ marginTop: 4 }}>
                  <Body size={13} color={C.ink}>
                    {s.detail}
                  </Body>
                </div>
              ) : null}
            </button>
          </React.Fragment>
        );
      })}

      <div
        style={{
          marginTop: 9,
          padding: 6,
          display: "flex",
          gap: 7,
          alignItems: "flex-start",
          backgroundColor: C.ink,
        }}
      >
        <PixelSprite name="editor" scale={1.3} title="The Editor" />
        <Body size={13} color={C.paper}>
          {trace.verdictNote}
        </Body>
      </div>

      <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 8 }}>
        {readOnly ? (
          <PixelButton variant="ink" size={9} icon="doc" iconScale={1.1} onClick={onDone} label="Button — Close reference">
            ◂ BACK TO MARKING
          </PixelButton>
        ) : (
          <PixelButton variant="red" size={9} icon="redpen" iconScale={1.2} onClick={onDone} label="Button — Start marking">
            NOW MARK THE CLAIMS
          </PixelButton>
        )}
        <Mono size={12} color={C.paper4}>
          {readOnly ? "REFERENCE ONLY — YOUR MARKS ARE SAVED." : "ALL FOUR MOVES DONE. MARKING UNLOCKED."}
        </Mono>
      </div>
    </div>
  );
}
