import React from "react";
import { C } from "../game/palette";
import { Mono, PixelSprite } from "./Pixel";

/** Parallax layer a piece of scenery belongs to. */
export type Layer = "bg" | "mid" | "fg";

export const LAYER_META: Record<Layer, { label: string; color: string; parallax: number }> = {
  bg: { label: "BACKGROUND — sky, hills, tree line", color: "#4A7FA8", parallax: 0.25 },
  mid: { label: "MIDGROUND — roads, houses, props", color: "#B08D57", parallax: 0.6 },
  fg: { label: "FOREGROUND — level nodes", color: "#B7291E", parallax: 1 },
};

/** Single evening light source, upper-left: every shadow in town falls down-right. */
export const SHADOW = "rgba(12,16,20,0.45)";

export function CastShadow({
  name,
  scale,
  frame,
}: {
  name: string;
  scale: number;
  frame?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        transformOrigin: "bottom left",
        transform: "translate(4px, 2px) skewX(-38deg) scaleY(0.34)",
        pointerEvents: "none",
      }}
    >
      <PixelSprite name={frame ?? name} scale={scale} silhouette={SHADOW} />
    </div>
  );
}

/** A non-interactive piece of town scenery, tagged with its parallax layer. */
export function Prop({
  sprite,
  x,
  y,
  scale = 2,
  layer = "mid",
  shadow = true,
  showLayers,
  recolor,
  title,
}: {
  sprite: string;
  x: number;
  y: number;
  scale?: number;
  layer?: Layer;
  shadow?: boolean;
  showLayers?: boolean;
  recolor?: Record<string, string>;
  title?: string;
}) {
  return (
    <div
      data-layer={layer}
      aria-hidden="true"
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        outline: showLayers ? `1px solid ${LAYER_META[layer].color}` : undefined,
      }}
    >
      {shadow ? <CastShadow name={sprite} scale={scale} /> : null}
      <PixelSprite name={sprite} scale={scale} recolor={recolor} title={title} />
    </div>
  );
}

export function LayerLegend() {
  return (
    <div
      style={{
        position: "absolute",
        right: 8,
        top: 8,
        padding: "4px 6px",
        backgroundColor: C.ink,
        boxShadow: `0 0 0 2px ${C.brassDark}`,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        zIndex: 6,
      }}
    >
      <Mono size={13} color={C.brassLight}>
        PARALLAX LAYERS
      </Mono>
      {(["bg", "mid", "fg"] as Layer[]).map((l) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, backgroundColor: LAYER_META[l].color, boxShadow: `0 0 0 1px ${C.ink2}` }} />
          <Mono size={12} color={C.paper3}>
            {l.toUpperCase()} ×{LAYER_META[l].parallax} — {LAYER_META[l].label.split("—")[1].trim()}
          </Mono>
        </div>
      ))}
    </div>
  );
}
