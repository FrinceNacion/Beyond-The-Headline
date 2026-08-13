import React from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { TopHud } from "../components/Hud";
import { LANGS, TEXT_SCALES, usePrefs, type TextScaleId } from "../prefs";
import { downloadCsv, personalCsv, type Lifetime } from "../game/progress";

/* Screen 10 — SETTINGS.

   Accessibility, language and data, in that order, because that is the order
   in which they stop someone using the game at all. */

function Group({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 8,
        ...speckle(C.paper, C.paper2, 4),
        boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PixelSprite name={icon} scale={1.3} />
        <Display size={8} color={C.red}>
          {title}
        </Display>
      </div>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function Toggle({
  on,
  label,
  note,
  onClick,
}: {
  on: boolean;
  label: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${label} — ${on ? "on" : "off"}`}
      data-interactive="toggle"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        minHeight: 38,
        padding: "5px 6px",
        marginBottom: 4,
        backgroundColor: on ? C.paper2 : C.paper3,
        boxShadow: `inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${on ? C.green : C.ink}`,
      }}
    >
      {/* hard-stepped switch, two positions, no slide */}
      <span style={{ display: "flex", width: 34, height: 16, backgroundColor: C.ink, boxShadow: `0 0 0 2px ${C.ink}` }}>
        <span style={{ width: 17, height: 16, backgroundColor: on ? "transparent" : C.paper4 }} />
        <span style={{ width: 17, height: 16, backgroundColor: on ? C.green : "transparent" }} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <Mono size={14} color={C.ink}>
          {label}
        </Mono>
        <br />
        <Body size={12} color={C.ink3}>
          {note}
        </Body>
      </span>
      <Mono size={13} color={on ? C.green : C.paper4}>
        {on ? "ON" : "OFF"}
      </Mono>
    </button>
  );
}

const SCALE_LABEL: Record<TextScaleId, string> = { small: "SMALL", normal: "NORMAL", large: "LARGE" };

export function Settings({
  tips,
  rank,
  lifetime,
  timerOn,
  onToggleTimer,
  onLegend,
  onAlignment,
  onAbout,
  onReset,
  onBack,
}: {
  tips: number;
  rank: string;
  lifetime: Lifetime;
  timerOn: boolean;
  onToggleTimer: () => void;
  onLegend: () => void;
  onAlignment: () => void;
  onAbout: () => void;
  onReset: () => void;
  onBack: () => void;
}) {
  const { prefs, set } = usePrefs();
  const lang = LANGS.find((l) => l.id === prefs.lang)!;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopHud
        tips={tips}
        rank={rank}
        accent={C.brassDark}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name="gear" scale={1} />
            <Display size={8} color={C.brassLight}>
              SETTINGS
            </Display>
          </div>
        }
        right={
          <PixelButton variant="ink" size={8} onClick={onBack} label="Button — Back">
            ◂ BACK
          </PixelButton>
        }
      />

      <div
        className="bth-scroll"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, alignContent: "start" }}
      >
        {/* ---------------------------------------------- accessibility */}
        <Group icon="eye" title="ACCESSIBILITY">
          <Mono size={13} color={C.ink3}>
            TEXT SIZE
          </Mono>
          <div style={{ display: "flex", gap: 5, margin: "4px 0 8px" }}>
            {(Object.keys(TEXT_SCALES) as TextScaleId[]).map((k) => {
              const on = prefs.textScale === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  aria-label={`Text size — ${SCALE_LABEL[k]}`}
                  data-interactive="textsize"
                  onClick={() => set("textScale", k)}
                  style={{
                    flex: 1,
                    minHeight: 34,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: on ? C.brass : C.paper3,
                    boxShadow: `inset -2px -2px 0 0 ${on ? C.brassDark : C.paper4}, 0 0 0 2px ${C.ink}`,
                  }}
                >
                  {/* the sample renders at its own size, so the choice is legible */}
                  <span style={{ fontFamily: '"Pixelify Sans", monospace', fontSize: 12 * TEXT_SCALES[k], color: C.ink }}>
                    Aa {SCALE_LABEL[k]}
                  </span>
                </button>
              );
            })}
          </div>

          <Toggle
            on={prefs.colorBlind}
            label="COLOUR-BLIND MODE"
            note="Swaps the verified-green axis for blue. Every state also carries a two-letter code and a glyph, always."
            onClick={() => set("colorBlind", !prefs.colorBlind)}
          />
          <Toggle
            on={prefs.bigTargets}
            label="LARGE TOUCH TARGETS"
            note="Raises every button and chip to a 44×44px minimum."
            onClick={() => set("bigTargets", !prefs.bigTargets)}
          />
          <Toggle
            on={prefs.keyboardMode}
            label="KEYBOARD-ONLY MODE"
            note="Thick high-contrast focus rings. Tab moves through claims in reading order; Enter opens the marking card; Esc closes it."
            onClick={() => set("keyboardMode", !prefs.keyboardMode)}
          />
          <Toggle
            on={prefs.reduceMotion}
            label="REDUCE MOTION"
            note="Stops the page-turns, stamp impacts and idle animation loops."
            onClick={() => set("reduceMotion", !prefs.reduceMotion)}
          />

          <div
            style={{
              marginTop: 6,
              padding: 6,
              display: "flex",
              gap: 6,
              backgroundColor: C.paper3,
              boxShadow: `inset 3px 0 0 0 ${C.slate}`,
            }}
          >
            <PixelSprite name="keyboard" scale={1.2} />
            <Body size={12} color={C.ink}>
              <strong>Screen readers:</strong> every claim is a labelled button announcing its text and its current
              verdict; the SIFT rail is a labelled step group; panels are landmarks. Pixel art is decorative and
              hidden from the reading order — nothing in this game is conveyed by an image alone.
            </Body>
          </div>
        </Group>

        {/* ---------------------------------------------- language */}
        <Group icon="globe" title="LANGUAGE">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {LANGS.map((l) => {
              const on = prefs.lang === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={`Language — ${l.label}`}
                  data-interactive="lang"
                  onClick={() => set("lang", l.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    minHeight: 34,
                    padding: "4px 6px",
                    textAlign: "left",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: on ? C.paper2 : C.paper3,
                    boxShadow: `inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${on ? C.brass : C.ink}`,
                  }}
                >
                  {/* hand-drawn pixel flags — never emoji, they render differently everywhere */}
                  <span style={{ boxShadow: `0 0 0 1px ${C.ink}` }}>
                    <PixelSprite name={l.flag} scale={1.4} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <Mono size={14} color={C.ink}>
                      {l.native}
                    </Mono>
                    <br />
                    <Mono size={12} color={C.ink3}>
                      {l.label}
                      {l.rtl ? " · RIGHT-TO-LEFT" : ""}
                    </Mono>
                  </span>
                  <span style={{ textAlign: "right" }}>
                    <Mono size={12} color={l.coverage === 100 ? C.green : C.brass}>
                      {l.coverage}%
                    </Mono>
                    <br />
                    <Mono size={11} color={C.paper4}>
                      TRANSLATED
                    </Mono>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 7,
              padding: 6,
              backgroundColor: C.paper3,
              boxShadow: `inset 3px 0 0 0 ${C.red}`,
            }}
          >
            <Body size={12} color={C.ink}>
              <strong>Translation status:</strong> interface strings are shipped in English and community-translated
              elsewhere — untranslated strings fall back to English rather than to machine output, so you always
              know what you are reading. Case content is deliberately localised, not translated: a case about a
              local newspaper only teaches if the newspaper feels local.
              {lang.rtl
                ? " Arabic runs the whole interface right-to-left, including the SIFT rail and the folder tabs."
                : ""}
            </Body>
          </div>
        </Group>

        {/* ---------------------------------------------- data */}
        <Group icon="shield" title="DATA & PRIVACY">
          <Body size={13} color={C.ink}>
            This game collects nothing by default. Your progress lives in this browser session and disappears when
            you close it. There are no accounts, no third-party analytics, no advertising identifiers, and nothing
            is sent anywhere unless you switch on one of the options below.
          </Body>
          <div style={{ marginTop: 6 }}>
            <Toggle
              on={prefs.researchOptIn}
              label="CONTRIBUTE ANONYMISED RESEARCH DATA"
              note="Aggregate accuracy and calibration only. No names, no free text, no device identifiers. Off by default."
              onClick={() => set("researchOptIn", !prefs.researchOptIn)}
            />
            <Toggle
              on={prefs.classroomConsent}
              label="ALLOW CLASSROOM REPORTING"
              note="Lets a teacher-run session see your case results. Requires a teacher to enable it on their side too."
              onClick={() => set("classroomConsent", !prefs.classroomConsent)}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <PixelButton
              variant="paper"
              size={8}
              icon="export"
              iconScale={1}
              onClick={() => downloadCsv("beyond-the-headline-my-data.csv", personalCsv(lifetime))}
              label="Button — Export my data"
            >
              EXPORT MY DATA
            </PixelButton>
            <PixelButton variant="red" size={8} icon="cross" iconScale={1} onClick={onReset} label="Button — Delete my data">
              DELETE MY DATA
            </PixelButton>
          </div>
        </Group>

        {/* ---------------------------------------------- game + reference */}
        <Group icon="handbook" title="GAME & REFERENCE">
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <PixelButton
              full
              variant={timerOn ? "green" : "ink"}
              size={8}
              icon="hourglass"
              iconScale={1.2}
              onClick={onToggleTimer}
              label="Button — Toggle case timer"
            >
              CASE TIMER: {timerOn ? "ON" : "OFF"}
            </PixelButton>
            <PixelButton full variant="paper" size={8} icon="stamp" iconScale={1} onClick={onLegend} label="Button — States legend">
              STATES LEGEND
            </PixelButton>
            <PixelButton full variant="paper" size={8} icon="globe" iconScale={1} onClick={onAlignment} label="Button — UNESCO alignment">
              UNESCO MIL ALIGNMENT
            </PixelButton>
            <PixelButton full variant="paper" size={8} icon="handbook" iconScale={1} onClick={onAbout} label="Button — About">
              ABOUT / HANDBOOK
            </PixelButton>
          </div>
          <div style={{ marginTop: 7 }}>
            <Mono size={12} color={C.paper4}>
              BUILD 2.0 · ROSEWOOD LEDGER NIGHT DESK · CC BY-SA 4.0
            </Mono>
          </div>
        </Group>
      </div>
    </div>
  );
}
