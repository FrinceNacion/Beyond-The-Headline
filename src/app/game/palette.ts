import type React from "react";

// Beyond the Headline — fixed pixel palette. No gradients, no soft tones.
export const C = {
  ink: "#14181C",
  ink2: "#1D2328",
  ink3: "#2A3138",
  ink4: "#39434B",
  paper: "#EDE3CF",
  paper2: "#DFD2B4",
  paper3: "#C9BA96",
  paper4: "#A99C7C",
  red: "#B7291E",
  redDark: "#7E1B14",
  brass: "#B08D57",
  brassDark: "#7A5F36",
  brassLight: "#D9B57E",
  // "verified" green is a CSS variable so colour-blind mode can swap the whole
  // red/green axis for red/blue without touching a single component.
  green: "var(--bth-green, #2F6F4E)",
  greenDark: "var(--bth-green-dark, #1E4A34)",
  greenLight: "var(--bth-green-light, #48916A)",
  skin: "#C99B72",
  skinDark: "#96694A",
  white: "#F6F0E2",
  slate: "#4A5C6A",
} as const;

/** Hard-edged 2px checkerboard dither between two tones. */
export function dither(a: string, b: string, px = 2): React.CSSProperties {
  return {
    backgroundColor: a,
    backgroundImage: `conic-gradient(${b} 0 25%, ${a} 0 50%, ${b} 0 75%, ${a} 0)`,
    backgroundSize: `${px * 2}px ${px * 2}px`,
  };
}

/** Sparse dither — one dot per 4x4 cell, for subtle paper/ink texture. */
export function speckle(a: string, b: string, px = 4): React.CSSProperties {
  return {
    backgroundColor: a,
    backgroundImage: `conic-gradient(${b} 0 25%, ${a} 0)`,
    backgroundSize: `${px}px ${px}px`,
  };
}

/** Chunky pixel border: hard 2px outline plus inset highlight/shadow ramp. */
export function bevel(
  base: string,
  light: string,
  dark: string,
  outline: string = C.ink,
): React.CSSProperties {
  return {
    backgroundColor: base,
    boxShadow: [
      `inset 2px 2px 0 0 ${light}`,
      `inset -2px -2px 0 0 ${dark}`,
      `0 0 0 2px ${outline}`,
    ].join(", "),
  };
}

export const FONT = {
  display: '"Press Start 2P", monospace',
  body: '"Pixelify Sans", monospace',
  mono: '"VT323", monospace',
};
