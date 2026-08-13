import React, { useState } from "react";
import { C, speckle } from "../game/palette";
import { Body, Mono, PixelSprite } from "./Pixel";
import { COMPETENCY, type CompetencyId } from "../game/mil";

/* The competency marker that sits in the top-right of every investigation.
   Tap or focus it and it names the UNESCO MIL competency the current case is
   drilling — the framing that turns a puzzle into a curriculum. */

export function CompetencyBadge({ id, align = "right" }: { id: CompetencyId; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const c = COMPETENCY[id];

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        data-interactive="competency"
        aria-label={`UNESCO MIL competency — ${c.name}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 5px",
          border: "none",
          cursor: "help",
          backgroundColor: C.ink2,
          boxShadow: `0 0 0 2px ${C.brassDark}`,
        }}
      >
        <PixelSprite name={c.sprite} scale={1.1} />
        <Mono size={12} color={C.brassLight}>
          {c.short}
        </Mono>
      </button>

      {open ? (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "100%",
            [align]: 0,
            marginTop: 4,
            width: 258,
            zIndex: 50,
            padding: 7,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <Mono size={11} color={C.paper4}>
            UNESCO MIL COMPETENCY FRAMEWORK
          </Mono>
          <br />
          <Body size={13} color={C.ink} style={{ fontWeight: 700 }}>
            {c.name}
          </Body>
          <div style={{ marginTop: 3 }}>
            <Body size={12} color={C.ink3}>
              {c.outcome}
            </Body>
          </div>
        </div>
      ) : null}
    </div>
  );
}
