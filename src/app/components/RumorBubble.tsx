import React from "react";
import { C } from "../game/palette";
import { Body, Mono, PixelSprite } from "./Pixel";
import { useFrame } from "./useFrame";
import { RUMOR_NAME, RUMOR_SUB } from "../game/story";

/** Rumor's corner bubble. Flavour only — never blocks input, always dismissable. */
export function RumorBubble({ text, onDismiss }: { text: string; onDismiss: () => void }) {
  const gest = useFrame(2);

  return (
    <div
      data-interactive="rumor-bubble"
      style={{
        position: "absolute",
        left: 6,
        bottom: 62,
        maxWidth: 322,
        display: "flex",
        alignItems: "flex-end",
        gap: 4,
        zIndex: 6,
      }}
    >
      {/* portrait — restless, always mid-gesture */}
      <div style={{ flex: "0 0 auto", boxShadow: `0 0 0 2px ${C.ink}`, backgroundColor: C.ink2 }}>
        <PixelSprite name={gest % 2 ? "rumor2" : "rumor1"} scale={1.6} title={`${RUMOR_NAME} — ${RUMOR_SUB}`} />
      </div>

      <div style={{ position: "relative", minWidth: 0 }}>
        <div
          style={{
            padding: "4px 6px 5px",
            backgroundColor: C.paper2,
            boxShadow: `inset 2px 2px 0 0 ${C.paper}, inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Mono size={12} color={C.red}>
              {RUMOR_NAME}
            </Mono>
            <Mono size={11} color={C.paper4}>
              UNVERIFIED
            </Mono>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              data-interactive="dismiss"
              aria-label="Button — Dismiss Rumor"
              onClick={onDismiss}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 0 }}
            >
              <PixelSprite name="cross" scale={0.9} />
            </button>
          </div>
          <button
            type="button"
            aria-label="Dismiss Rumor comment"
            onClick={onDismiss}
            style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
          >
            <Body size={13} color={C.ink}>
              “{text}”
            </Body>
          </button>
        </div>
        {/* hard pixel tail, no curves */}
        <div style={{ position: "absolute", left: -6, bottom: 6, width: 6, height: 4, backgroundColor: C.paper2, boxShadow: `0 2px 0 0 ${C.ink}, 0 -2px 0 0 ${C.ink}` }} />
      </div>
    </div>
  );
}
