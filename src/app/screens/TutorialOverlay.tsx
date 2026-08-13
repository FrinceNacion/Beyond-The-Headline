import React, { useState } from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelSprite } from "../components/Pixel";

export const TUTORIAL_LINES = [
  "Every story's got holes. Your job's to find 'em before they find your readers. Don't invent a headline — find what's already wrong.",
  "Three sources per case: the article, whatever's going around online, and whoever'll go on record. Tab through 'em on the left.",
  "Before you can mark anything, you run four checks — STOP, INVESTIGATE, FIND BETTER COVERAGE, TRACE. That bar at the top walks you through each one in order. Don't skip steps.",
  "Five verdicts, not two: Checks Out, True But Biased, True But Out of Context, Misleading, or False. Pick one, then pick two reasons. One reason is a hunch. Two is an argument.",
  "Correct calls pay Tips. Spend 'em on the shelf in the supply cabinet when a case gets thick. Now go on — the desk's waiting.",
];

export function TutorialOverlay({
  lines = TUTORIAL_LINES,
  onDone,
  onSkip,
}: {
  lines?: string[];
  onDone: () => void;
  onSkip: () => void;
}) {
  const [i, setI] = useState(0);
  const last = i >= lines.length - 1;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        backgroundColor: "rgba(20,24,28,0.55)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
      onClick={() => (last ? onDone() : setI(i + 1))}
    >
      {/* skip */}
      <button
        type="button"
        data-interactive="text-button"
        aria-label="Text button — Skip Tutorial"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 8,
          color: C.brassLight,
          textDecoration: "underline",
          padding: 4,
        }}
      >
        SKIP TUTORIAL
      </button>

      <div
        style={{
          margin: "0 10px 10px",
          height: 118,
          display: "flex",
          gap: 10,
          padding: 8,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        {/* portrait bust */}
        <div
          style={{
            flex: "0 0 auto",
            padding: 4,
            backgroundColor: C.ink2,
            boxShadow: `0 0 0 2px ${C.ink}`,
            alignSelf: "flex-start",
          }}
        >
          <PixelSprite name="editor" scale={4} title="The Editor" />
          <div style={{ textAlign: "center", marginTop: 3 }}>
            <Mono size={13} color={C.brass}>
              THE EDITOR
            </Mono>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Display size={9} color={C.red}>
            THE EDITOR
          </Display>
          <div style={{ flex: 1, marginTop: 8 }}>
            <Body size={13} color={C.ink}>
              {lines[i]}
            </Body>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Mono size={14} color={C.paper4}>
              {i + 1} / {lines.length}
            </Mono>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Mono size={15} color={C.ink3}>
                {last ? "tap to begin" : "tap to continue"}
              </Mono>
              <span className="bth-blink">
                <Display size={10} color={C.red}>
                  ▼
                </Display>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
