import React, { useEffect, useState } from "react";
import { C } from "../game/palette";
import { Body, Display, DitherBG, Masthead, Mono, PixelButton, PixelMeter, PixelSprite } from "../components/Pixel";

const FLAVOR = [
  "Cross-checking sources...",
  "Sharpening red pens...",
  "Warming the darkroom...",
  "Filing public records requests...",
  "Reading the correction column...",
  "Waking The Editor...",
];

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0); // 0..20, stepped not eased
  const [flavor, setFlavor] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => (s >= 20 ? 20 : s + 1)), 110);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setFlavor((f) => (f + 1) % FLAVOR.length), 700);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (step >= 20) {
      const t = window.setTimeout(onDone, 500);
      return () => window.clearTimeout(t);
    }
  }, [step, onDone]);

  return (
    <DitherBG
      a={C.ink}
      b={C.ink2}
      px={2}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        position: "relative",
      }}
    >
      <Masthead scale={0.85} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <PixelSprite name="stamp" scale={2} title="Ink stamp" />
        <PixelMeter value={step / 20} width={300} height={16} cells={20} />
        <Mono size={18} color={C.brassLight}>
          {String(Math.round((step / 20) * 100)).padStart(3, "0")}%
        </Mono>
      </div>

      <Body size={14} color={C.paper3}>
        {step >= 20 ? "Press to open the file." : FLAVOR[flavor]}
      </Body>

      <div style={{ position: "absolute", right: 10, bottom: 8 }}>
        <PixelButton
          variant="ink"
          size={8}
          onClick={onDone}
          label="Button — Skip loading"
        >
          SKIP ▸
        </PixelButton>
      </div>

      <div style={{ position: "absolute", left: 10, bottom: 8 }}>
        <Display size={7} color={C.ink4}>
          A HIDDEN-CLAIM INVESTIGATION
        </Display>
      </div>
    </DitherBG>
  );
}
