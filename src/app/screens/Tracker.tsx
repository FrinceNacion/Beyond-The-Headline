import React from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { TopHud } from "../components/Hud";
import { CalibrationMeter } from "../components/CalibrationMeter";
import { COMPETENCY } from "../game/mil";
import { CASES } from "../game/cases";
import {
  competencyProgress,
  habitProgress,
  lifetimeAccuracy,
  lifetimeCalibration,
  bestCalibrationCase,
  drillStats,
  personalCsv,
  downloadCsv,
  type Lifetime,
} from "../game/progress";
import { progressMetaFor } from "../game/sift";
import { medalTierForStars } from "../game/scoring";

/* Screen 9 — CALIBRATION & COMPETENCY TRACKER.

   The player's own record, in the language of the framework rather than the
   language of points. Badges are earned by solving the cases that drill a
   competency; the habit tracker is the list of things you are supposed to be
   doing outside the game. */

function Stat({ label, value, tone = C.paper }: { label: string; value: string; tone?: string }) {
  return (
    <div style={{ flex: "1 1 26%", minWidth: 92 }}>
      <Mono size={12} color={C.brass}>
        {label}
      </Mono>
      <br />
      <Mono size={24} color={tone}>
        {value}
      </Mono>
    </div>
  );
}

export function Tracker({
  tips,
  rank,
  lifetime,
  medals = {},
  stars = {},
  onBack,
  onTeacher,
}: {
  tips: number;
  rank: string;
  lifetime: Lifetime;
  medals?: Record<string, string>;
  stars?: Record<string, number>;
  onBack: () => void;
  onTeacher: () => void;
}) {
  const acc = lifetimeAccuracy(lifetime);
  const cal = lifetimeCalibration(lifetime);
  const drills = drillStats(lifetime);
  const comps = competencyProgress(lifetime);
  const habits = habitProgress(lifetime);
  const best = bestCalibrationCase(lifetime);
  const bestCase = best ? CASES.find((c) => c.id === best.caseId) : undefined;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopHud
        tips={tips}
        rank={rank}
        accent={C.brassDark}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name="gauge" scale={1} />
            <Display size={8} color={C.brassLight}>
              YOUR RECORD
            </Display>
          </div>
        }
        right={
          <>
            <PixelButton
              variant="paper"
              size={8}
              icon="export"
              iconScale={1}
              onClick={() => downloadCsv("beyond-the-headline-progress.csv", personalCsv(lifetime))}
              label="Button — Export your data"
            >
              EXPORT CSV
            </PixelButton>
            <PixelButton variant="ink" size={8} icon="people" iconScale={1} onClick={onTeacher} label="Button — Classroom view">
              CLASSROOM
            </PixelButton>
            <PixelButton variant="ink" size={8} onClick={onBack} label="Button — Back">
              ◂ BACK
            </PixelButton>
          </>
        }
      />

      <div className="bth-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        {/* headline numbers */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: 8,
            backgroundColor: C.ink2,
            boxShadow: `0 0 0 2px ${C.ink}`,
          }}
        >
          <Stat label="CASES FILED" value={String(lifetime.casesFiled)} tone={C.brassLight} />
          <Stat label="CLAIMS JUDGED" value={String(lifetime.calls)} />
          <Stat label="ACCURACY" value={`${Math.round(acc * 100)}%`} tone={C.green} />
          <Stat label="FALSE ALARMS" value={String(lifetime.falseAlarms)} tone={C.red} />
          <Stat label="MISSED" value={String(lifetime.missed)} tone={C.red} />
          <Stat
            label="REASONING"
            value={lifetime.reasonsPossible ? `${lifetime.reasonsRight}/${lifetime.reasonsPossible}` : "—"}
            tone={C.brassLight}
          />
        </div>

        {/* calibration, given room — only Investigation-type cases have a
            five-state verdict to be over- or under-calibrated on */}
        <div style={{ padding: 8, backgroundColor: C.ink, boxShadow: `0 0 0 2px ${C.ink3}` }}>
          <Mono size={12} color={C.brass}>
            INVESTIGATION CALIBRATION
          </Mono>
          <div style={{ marginTop: 4 }}>
            <CalibrationMeter cal={cal} width={420} />
          </div>
        </div>

        {/* drill stages have no five-state verdict — right/wrong calls only —
            so they get their own stat block instead of feeding the meter above */}
        {drills.total > 0 ? (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              padding: 8,
              backgroundColor: C.ink2,
              boxShadow: `0 0 0 2px ${C.ink}`,
            }}
          >
            <Stat label="DIGITAL SAFETY DRILLS CLEARED" value={`${drills.cleared}/${drills.total}`} tone={C.brassLight} />
            <Stat label="AVG. DRILL ACCURACY" value={`${Math.round(drills.avgAccuracy * 100)}%`} tone={C.green} />
          </div>
        ) : null}

        {/* the case they judged most evenly — not their highest score */}
        {best ? (
          <div
            style={{
              padding: 8,
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              ...speckle(C.paper, C.paper2, 4),
              boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
            }}
          >
            <div style={{ flex: "0 0 auto", boxShadow: `0 0 0 2px ${C.ink}` }}>
              <PixelSprite name="gauge" scale={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Display size={8} color={C.red}>
                BEST CALIBRATION CASE
              </Display>
              <br />
              <Mono size={14} color={C.ink}>
                {bestCase
                  ? `FILE 0${CASES.indexOf(bestCase) + 1} — ${bestCase.title.toUpperCase()}`
                  : best.caseId.toUpperCase()}
              </Mono>
              <br />
              <Mono size={13} color={C.ink3}>
                {Math.round(best.accuracy * 100)}% ACCURATE · {best.falseAlarms} FALSE ALARM
                {best.falseAlarms === 1 ? "" : "S"} · {best.missed} MISSED · {best.cal.label.toUpperCase()}
              </Mono>
              <br />
              <Body size={13} color={C.ink}>
                Your flags and your passes were closest to even here. That balance — not suspicion, not trust — is
                the thing worth repeating.
              </Body>
            </div>
          </div>
        ) : null}

        {/* competency badges */}
        <div
          style={{
            padding: 8,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <Display size={8} color={C.red}>
            UNESCO MIL COMPETENCIES
          </Display>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
            {comps.map((c) => {
              const meta = COMPETENCY[c.id];
              const full = c.total > 0 && c.earned >= c.total;
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    gap: 6,
                    padding: 6,
                    backgroundColor: full ? C.paper2 : C.paper3,
                    boxShadow: `inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${full ? C.green : C.paper4}`,
                    opacity: c.earned ? 1 : 0.75,
                  }}
                >
                  <PixelSprite name={meta.sprite} scale={1.7} desaturate={!c.earned} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Mono size={13} color={C.ink}>
                      {meta.short}
                    </Mono>
                    <br />
                    <Mono size={12} color={full ? C.green : C.ink3}>
                      {c.earned}/{c.total} CASES
                    </Mono>
                    {/* stepped progress, no bar animation */}
                    <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                      {Array.from({ length: Math.max(1, c.total) }, (_, i) => (
                        <div
                          key={i}
                          style={{
                            width: 12,
                            height: 6,
                            backgroundColor: i < c.earned ? C.green : C.paper4,
                            boxShadow: `0 0 0 1px ${C.ink}`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collected Medals gallery */}
        <div
          style={{
            padding: 8,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <Display size={8} color={C.red}>
              COLLECTED CASE MEDALS & MIL SKILLS
            </Display>
            <Mono size={12} color={C.brassDark}>
              {Object.keys(medals).length}/{CASES.length} MEDALS COLLECTED
            </Mono>
          </div>
          <Body size={13} color={C.ink3} style={{ marginTop: 2 }}>
            Complete cases to earn Bronze (1 star), Silver (2 stars), or Gold (3 stars) badges in key Media & Information Literacy skills.
          </Body>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
            {CASES.map((cs) => {
              const starCount = stars[cs.id] ?? 0;
              const medalKey = medals[cs.id] ?? medalTierForStars(starCount);
              const isGold = medalKey === "gold";
              const isSilver = medalKey === "silver";
              const isBronze = medalKey === "bronze";
              const medalSprite = isGold ? "gold" : isSilver ? "silver" : isBronze ? "bronze" : "medal";
              const meta = progressMetaFor(cs.id);
              const comp = COMPETENCY[meta.competency];
              const isEarned = Boolean(medalKey);

              return (
                <div
                  key={cs.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: 6,
                    backgroundColor: isEarned ? C.paper2 : C.paper3,
                    boxShadow: `inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${isEarned ? C.brassDark : C.paper4}`,
                    opacity: isEarned ? 1 : 0.65,
                  }}
                >
                  <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", width: 28 }}>
                    <PixelSprite name={medalSprite} scale={2} desaturate={!isEarned} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Mono size={13} color={C.ink}>
                      {cs.tag} · {cs.building.toUpperCase()}
                    </Mono>
                    <br />
                    <Mono size={12} color={isEarned ? C.brassDark : C.ink3}>
                      {isGold
                        ? "GOLD MEDAL (3/3 STARS)"
                        : isSilver
                        ? "SILVER MEDAL (2/3 STARS)"
                        : isBronze
                        ? "BRONZE MEDAL (1/3 STARS)"
                        : "UNEARNED"}
                    </Mono>
                    <br />
                    <Body size={12} color={C.ink3}>
                      SKILL: {comp ? comp.name : meta.competency.toUpperCase()}
                    </Body>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* habit tracker */}
        <div
          style={{
            padding: 8,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <Display size={8} color={C.red}>
              HABIT TRACKER
            </Display>
            <Mono size={13} color={C.ink3}>
              {habits.filter((h) => h.learned).length}/{habits.length} PRACTISED
            </Mono>
          </div>
          <Body size={13} color={C.ink3}>
            These are the moves the game is actually trying to leave you with. Tick them off outside it.
          </Body>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 6 }}>
            {habits.map(({ habit, learned }) => (
              <div
                key={habit.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 6px",
                  backgroundColor: learned ? C.paper2 : C.paper3,
                  boxShadow: `0 0 0 2px ${learned ? C.green : C.paper4}`,
                }}
              >
                <PixelSprite name={learned ? "check" : habit.sprite} scale={1} desaturate={!learned} />
                <Body size={13} color={learned ? C.ink : C.ink3}>
                  {habit.move}
                </Body>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 2px 4px" }}>
          <PixelSprite name="shield" scale={1} />
          <Mono size={12} color={C.paper4}>
            THIS RECORD LIVES IN YOUR BROWSER SESSION ONLY. THE EXPORT IS A LOCAL FILE.
          </Mono>
        </div>
      </div>
    </div>
  );
}