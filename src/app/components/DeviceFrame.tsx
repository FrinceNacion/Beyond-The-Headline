import React, { useEffect, useState } from "react";
import { C, dither } from "../game/palette";
import { Mono, PixelSprite } from "./Pixel";
import { prefsClass, usePrefs } from "../prefs";

export const CANVAS_W = 844;
export const CANVAS_H = 390;
export const DESKTOP_W = 1440;
export const DESKTOP_H = 810;

export type Device = "mobile" | "desktop";

function useViewport() {
  const [vp, setVp] = useState({ w: 1200, h: 700 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

/** Renders the 844x390 game canvas inside either a mobile frame or a 1440x810 desktop
 *  frame (same canvas, centered on a dithered letterbox), scaled to fit the viewport. */
export function DeviceFrame({
  device,
  onToggle,
  onLegend,
  children,
}: {
  device: Device;
  onToggle: (d: Device) => void;
  onLegend: () => void;
  children: React.ReactNode;
}) {
  const vp = useViewport();
  const { prefs, rtl } = usePrefs();
  const frameW = device === "mobile" ? CANVAS_W : DESKTOP_W;
  const frameH = device === "mobile" ? CANVAS_H : DESKTOP_H;
  const chrome = 78; // room for the frame label + device switch
  const fit = Math.min((vp.w - 32) / frameW, (vp.h - chrome) / frameH);
  const scale = Math.max(0.2, Math.min(fit, 1.6));
  const inner = device === "mobile" ? 1 : Math.min(DESKTOP_W / CANVAS_W, DESKTOP_H / CANVAS_H);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        ...dither("#0B0E11", "#12171B", 2),
        overflow: "hidden",
      }}
    >
      {/* frame chrome / handoff label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <PixelSprite name="stamp" scale={1.2} />
        <Mono size={16} color={C.brass}>
          BEYOND THE HEADLINE — {device === "mobile" ? "MOBILE 844×390" : "DESKTOP 1440×810"}
        </Mono>
        <div style={{ display: "flex", gap: 4 }}>
          {(["mobile", "desktop"] as Device[]).map((d) => (
            <button
              key={d}
              type="button"
              data-interactive="frame-switch"
              aria-label={`Button — Show ${d} frame`}
              onClick={() => onToggle(d)}
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: 15,
                padding: "1px 7px",
                cursor: "pointer",
                border: "none",
                color: device === d ? C.ink : C.paper3,
                backgroundColor: device === d ? C.brass : C.ink3,
                boxShadow: `0 0 0 2px ${C.ink}`,
              }}
            >
              {d.toUpperCase()}
            </button>
          ))}
          <button
            type="button"
            data-interactive="frame-switch"
            aria-label="Button — Open states legend"
            onClick={onLegend}
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: 15,
              padding: "1px 7px",
              cursor: "pointer",
              border: "none",
              color: C.ink,
              backgroundColor: C.paper3,
              boxShadow: `0 0 0 2px ${C.ink}`,
            }}
          >
            STATES
          </button>
        </div>
      </div>

      <div
        style={{
          width: frameW * scale,
          height: frameH * scale,
          position: "relative",
          boxShadow: `0 0 0 3px ${C.brassDark}`,
        }}
      >
        <div
          style={{
            width: frameW,
            height: frameH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
            ...dither(C.ink, "#10151A", 2),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            className={prefsClass(prefs)}
            dir={rtl ? "rtl" : "ltr"}
            lang={prefs.lang}
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              transform: `scale(${inner})`,
              transformOrigin: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: device === "desktop" ? `0 0 0 2px ${C.brassDark}` : undefined,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
