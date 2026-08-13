import React, { createContext, useContext, useMemo, useState } from "react";

/* Accessibility + localisation preferences.
   Every one of these is a deployment requirement, not a nicety: the game is
   meant to run in classrooms and libraries on budget Android phones. */

export type LangId = "en" | "es" | "fr" | "zh" | "ar";

export type Lang = {
  id: LangId;
  label: string;
  native: string;
  flag: string; // pixel flag sprite name — never an emoji
  rtl?: boolean;
  /** UI strings are shipped for English; the rest are community-translated */
  coverage: number;
};

export const LANGS: Lang[] = [
  { id: "en", label: "ENGLISH", native: "English", flag: "flagEN", coverage: 100 },
  { id: "es", label: "SPANISH", native: "Español", flag: "flagES", coverage: 82 },
  { id: "fr", label: "FRENCH", native: "Français", flag: "flagFR", coverage: 74 },
  { id: "zh", label: "CHINESE (SIMPLIFIED)", native: "简体中文", flag: "flagZH", coverage: 61 },
  { id: "ar", label: "ARABIC", native: "العربية", flag: "flagAR", rtl: true, coverage: 55 },
];

export type TextScaleId = "small" | "normal" | "large";
export const TEXT_SCALES: Record<TextScaleId, number> = { small: 0.88, normal: 1, large: 1.22 };

export type Prefs = {
  textScale: TextScaleId;
  colorBlind: boolean;
  bigTargets: boolean;
  keyboardMode: boolean;
  reduceMotion: boolean;
  lang: LangId;
  /** anonymised, aggregated gameplay data for MIL research — opt in, off by default */
  researchOptIn: boolean;
  /** classroom telemetry requires a teacher to switch it on */
  classroomConsent: boolean;
};

export const DEFAULT_PREFS: Prefs = {
  textScale: "normal",
  colorBlind: false,
  bigTargets: false,
  keyboardMode: false,
  reduceMotion: false,
  lang: "en",
  researchOptIn: false,
  classroomConsent: false,
};

type Ctx = {
  prefs: Prefs;
  set: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void;
  /** multiply any authored px size by this */
  scale: number;
  rtl: boolean;
  /** minimum touch target in canvas px */
  tap: number;
};

const PrefsCtx = createContext<Ctx>({
  prefs: DEFAULT_PREFS,
  set: () => {},
  scale: 1,
  rtl: false,
  tap: 20,
});

export function usePrefs() {
  return useContext(PrefsCtx);
}

/** Authored px -> displayed px, honouring the text-size setting. */
export function useTextScale() {
  return useContext(PrefsCtx).scale;
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  const value = useMemo<Ctx>(() => {
    const lang = LANGS.find((l) => l.id === prefs.lang)!;
    return {
      prefs,
      set: (k, v) => setPrefs((p) => ({ ...p, [k]: v })),
      scale: TEXT_SCALES[prefs.textScale],
      rtl: Boolean(lang.rtl),
      tap: prefs.bigTargets ? 44 : 32,
    };
  }, [prefs]);

  return <PrefsCtx.Provider value={value}>{children}</PrefsCtx.Provider>;
}

/** Class list for the canvas root, driving the CSS-variable swaps. */
export function prefsClass(p: Prefs): string {
  return [p.colorBlind ? "bth-cb" : "", p.keyboardMode ? "bth-kbd" : "", p.reduceMotion ? "bth-still" : ""]
    .filter(Boolean)
    .join(" ");
}
