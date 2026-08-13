import React, { useMemo, useState } from "react";
import { C, FONT, dither, speckle } from "../game/palette";
import { SPRITE_ASSETS } from "../../assets/registry";
import { usePrefs, useTextScale } from "../prefs";

/* ------------------------------------------------------------------ sprite */

type SpriteProps = {
  name: string;
  scale?: number;
  /**
   * Swap specific palette keys for other colours. Only pre-baked variants are
   * supported (see scripts/gen-sprites.mjs); an unknown combo falls back to the
   * base image. In practice this is used for the dark-window unlit houses.
   */
  recolor?: Record<string, string>;
  /** paint every opaque pixel one flat colour — used for hard cast shadows */
  silhouette?: string;
  desaturate?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
};

/** Signature for a recolor map — must match the generator's naming. */
function recolorSig(map: Record<string, string>) {
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(",");
}

/** Renders a pixel-art PNG asset, scaled with crisp nearest-neighbour edges. */
export function PixelSprite({
  name,
  scale = 2,
  recolor,
  silhouette,
  desaturate,
  className,
  style,
  title,
}: SpriteProps) {
  const asset = SPRITE_ASSETS[name];

  const resolved = useMemo(() => {
    if (!asset) return null;
    let src = asset.src;
    if (recolor && asset.variants) {
      src = asset.variants[recolorSig(recolor)] ?? asset.src;
    }
    return { src, w: asset.w * scale, h: asset.h * scale };
  }, [asset, recolor, scale]);

  if (!resolved) return null;

  const filter = desaturate ? "grayscale(1) brightness(0.7)" : undefined;

  // Cast shadows: recolour the whole silhouette by masking a flat fill.
  if (silhouette) {
    return (
      <div
        className={className}
        role="img"
        aria-label={title ?? String(name)}
        style={{
          display: "block",
          width: resolved.w,
          height: resolved.h,
          backgroundColor: silhouette,
          WebkitMaskImage: `url(${resolved.src})`,
          maskImage: `url(${resolved.src})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          filter,
          ...style,
        }}
      />
    );
  }

  return (
    <img
      className={className}
      src={resolved.src}
      width={resolved.w}
      height={resolved.h}
      alt={title ?? String(name)}
      draggable={false}
      style={{
        display: "block",
        imageRendering: "pixelated",
        filter,
        ...style,
      }}
    />
  );
}

/* ------------------------------------------------------------------- text */

export function Display({
  children,
  size = 12,
  color = C.paper,
  style,
  className,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ts = useTextScale();
  return (
    <span
      className={className}
      style={{
        fontFamily: FONT.display,
        fontSize: size * ts,
        lineHeight: 1.5,
        color,
        letterSpacing: "0.04em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Body({
  children,
  size = 14,
  color = C.paper,
  style,
  className,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ts = useTextScale();
  return (
    <span
      className={className}
      style={{ fontFamily: FONT.body, fontSize: size * ts, lineHeight: 1.35, color, ...style }}
    >
      {children}
    </span>
  );
}

export function Mono({
  children,
  size = 16,
  color = C.brassLight,
  style,
  className,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ts = useTextScale();
  return (
    <span
      className={className}
      style={{
        fontFamily: FONT.mono,
        fontSize: size * ts,
        lineHeight: 1,
        color,
        letterSpacing: "0.06em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- surface */

export function Panel({
  children,
  tone = "paper",
  className,
  style,
  onClick,
}: {
  children?: React.ReactNode;
  tone?: "paper" | "ink" | "card" | "brass";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const tones: Record<string, React.CSSProperties> = {
    paper: {
      ...speckle(C.paper, C.paper2, 4),
      boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
    },
    card: {
      ...speckle(C.paper2, C.paper3, 4),
      boxShadow: `inset 2px 2px 0 0 ${C.paper}, inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
    },
    ink: {
      ...speckle(C.ink2, C.ink3, 4),
      boxShadow: `inset 2px 2px 0 0 ${C.ink4}, inset -2px -2px 0 0 ${C.ink}, 0 0 0 2px ${C.ink}`,
    },
    brass: {
      backgroundColor: C.brass,
      boxShadow: `inset 2px 2px 0 0 ${C.brassLight}, inset -2px -2px 0 0 ${C.brassDark}, 0 0 0 2px ${C.ink}`,
    },
  };
  return (
    <div className={className} onClick={onClick} style={{ ...tones[tone], ...style }}>
      {children}
    </div>
  );
}

/** Full-bleed dithered background. */
export function DitherBG({
  a = C.ink,
  b = C.ink2,
  px = 2,
  className,
  style,
  children,
}: {
  a?: string;
  b?: string;
  px?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div className={className} style={{ ...dither(a, b, px), ...style }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ button */

export type BtnVariant = "brass" | "paper" | "red" | "green" | "ink";
export type BtnForcedState = "default" | "pressed" | "disabled";

const VARIANTS: Record<BtnVariant, { base: string; light: string; dark: string; text: string }> = {
  brass: { base: C.brass, light: C.brassLight, dark: C.brassDark, text: C.ink },
  paper: { base: C.paper2, light: C.paper, dark: C.paper4, text: C.ink },
  red: { base: C.red, light: "#D6483C", dark: C.redDark, text: C.white },
  green: { base: C.green, light: "#48916A", dark: C.greenDark, text: C.white },
  ink: { base: C.ink3, light: C.ink4, dark: C.ink, text: C.paper2 },
};

export function PixelButton({
  children,
  onClick,
  variant = "brass",
  disabled,
  forceState,
  icon,
  iconScale = 2,
  size = 10,
  height = 22,
  full,
  style,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  forceState?: BtnForcedState;
  icon?: string;
  iconScale?: number;
  size?: number;
  height?: number;
  full?: boolean;
  style?: React.CSSProperties;
  /** accessible / handoff label, e.g. "BUTTON — Continue Case" */
  label?: string;
}) {
  const [down, setDown] = useState(false);
  const { scale: ts, tap } = usePrefs();
  const state: BtnForcedState = forceState ?? (disabled ? "disabled" : down ? "pressed" : "default");
  const v = VARIANTS[variant];
  const isDisabled = state === "disabled";
  const isPressed = state === "pressed";

  return (
    <button
      type="button"
      data-interactive="button"
      aria-label={label}
      disabled={disabled && !forceState}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onTouchStart={() => setDown(true)}
      onTouchEnd={() => setDown(false)}
      onClick={() => {
        if (!isDisabled) onClick?.();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        width: full ? "100%" : undefined,
        padding: isPressed ? "7px 10px 5px" : "6px 10px",
        height: height,
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontFamily: FONT.display,
        fontSize: size * ts,
        letterSpacing: "0.04em",
        color: isDisabled ? C.ink4 : v.text,
        backgroundColor: isDisabled ? C.ink3 : isPressed ? v.dark : v.base,
        boxShadow: isDisabled
          ? `inset 2px 2px 0 0 ${C.ink4}, inset -2px -2px 0 0 ${C.ink}, 0 0 0 2px ${C.ink}`
          : isPressed
            ? `inset -2px -2px 0 0 ${v.light}, inset 2px 2px 0 0 ${v.dark}, 0 0 0 2px ${C.ink}`
            : `inset 2px 2px 0 0 ${v.light}, inset -2px -2px 0 0 ${v.dark}, 0 0 0 2px ${C.ink}`,
        transform: isPressed ? "translate(1px,1px)" : undefined,
        transition: "none",
        opacity: isDisabled ? 0.9 : 1,
        ...style,
      }}
    >
      {icon ? <PixelSprite name={icon} scale={iconScale} desaturate={isDisabled} /> : null}
      <span style={{ paddingTop: 2 }}>{children}</span>
    </button>
  );
}

/** Small selectable chip (reason options, filters). */
export function PixelChip({
  children,
  active,
  onClick,
  disabled,
  tone = C.paper,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  tone?: string;
}) {
  const { scale: ts, tap } = usePrefs();
  return (
    <button
      type="button"
      data-interactive="chip"
      disabled={disabled}
      onClick={onClick}
      style={{
        fontFamily: FONT.body,
        fontSize: 12 * ts,
        padding: "3px 7px",
        minHeight: Math.max(24, tap - 10),
        color: active ? C.white : C.ink,
        backgroundColor: active ? C.ink3 : tone,
        boxShadow: active
          ? `inset 2px 2px 0 0 ${C.ink4}, inset -2px -2px 0 0 ${C.ink}, 0 0 0 2px ${C.ink}`
          : `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "none",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

/** Stepped progress meter drawn as discrete pixel notches (ink-stamp meter). */
export function PixelMeter({
  value,
  width = 220,
  height = 14,
  cells = 20,
  fill = C.brass,
}: {
  value: number;
  width?: number;
  height?: number;
  cells?: number;
  fill?: string;
}) {
  const filled = Math.round((Math.max(0, Math.min(1, value)) * cells));
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        gap: 2,
        padding: 3,
        backgroundColor: C.ink2,
        boxShadow: `inset 2px 2px 0 0 ${C.ink}, 0 0 0 2px ${C.brassDark}`,
      }}
    >
      {Array.from({ length: cells }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            backgroundColor: i < filled ? fill : C.ink3,
            boxShadow: i < filled ? `inset 0 2px 0 0 ${C.brassLight}` : undefined,
          }}
        />
      ))}
    </div>
  );
}

/** Torn-edge newspaper masthead lockup. */
export function Masthead({ scale = 1 }: { scale?: number }) {
  const teeth = 26;
  return (
    <div style={{ display: "inline-block", transform: `scale(${scale})`, transformOrigin: "center" }}>
      <div
        style={{
          ...speckle(C.paper, C.paper2, 4),
          padding: "8px 18px 10px",
          boxShadow: `0 0 0 3px ${C.ink}`,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <Mono size={12} color={C.ink3}>
            VOL. IV
          </Mono>
          <Mono size={12} color={C.ink3}>
            NO. 27
          </Mono>
        </div>
        <div style={{ borderTop: `2px solid ${C.ink}`, borderBottom: `2px solid ${C.ink}`, padding: "6px 0" }}>
          <Display size={20} color={C.ink} style={{ display: "block" }}>
            BEYOND THE
          </Display>
          <Display size={28} color={C.red} style={{ display: "block", marginTop: 6 }}>
            HEADLINE
          </Display>
        </div>
        <Mono size={13} color={C.ink3} style={{ display: "block", marginTop: 4 }}>
          CHECK THE STORY BEFORE IT CHECKS YOU
        </Mono>
      </div>
      {/* torn bottom edge */}
      {/* Inalis ko muna para malinis tignan -F
      <div style={{ display: "flex" }}>
        {Array.from({ length: teeth }, (_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: i % 3 === 0 ? 8 : i % 2 === 0 ? 4 : 6,
              backgroundColor: C.paper2,
              boxShadow: `0 0 0 2px ${C.ink}`,
            }}
          />
        ))}
      </div>
      */}
    </div>
  );
}

/** Currency readout used across the HUD. */
export function TipsCounter({ tips, scale = 2 }: { tips: number; scale?: number }) {
  return (
    <div
      data-interactive="hud"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        height: "20px",
        padding: "3px 8px",
        backgroundColor: C.ink2,
        boxShadow: `inset 2px 2px 0 0 ${C.ink3}, 0 0 0 2px ${C.brassDark}`,
      }}
    >
      <PixelSprite name="coin" scale={scale} title="Tips" />
      <Mono size={18} color={C.brassLight}>
        {tips}
      </Mono>
      <Mono size={12} color={C.brass}>
        TIPS
      </Mono>
    </div>
  );
}

/** Handoff annotation tag rendered on interactive elements. */
export function HandoffTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: FONT.mono,
        fontSize: 11,
        color: C.ink,
        backgroundColor: C.brassLight,
        padding: "0 3px",
        boxShadow: `0 0 0 1px ${C.ink}`,
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
