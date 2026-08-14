import React, { useState } from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { TopHud } from "../components/Hud";
import { REASONS, truthOf, type CaseDef } from "../game/cases";
import type { Marks } from "../game/marks";
import { scoreCase, type CaseResult } from "../game/scoring";
import { COMPETENCY, HABIT, VERDICT } from "../game/mil";
import { siftFor } from "../game/sift";
import { CalibrationMeter } from "../components/CalibrationMeter";
import { formatTime } from "../game/timeattack";
import { StarRow } from "../components/Stars";
import { briefingFor, earnedStars, rumorHeadline, starConds, RUMOR_NAME } from "../game/story";
import { MedalPopup } from "../components/MedalPopup";

/** Personal-best leaderboard card, shown at the end of a Beat the Clock run. */
function BestTimeCard({
  run,
}: {
  run: {
    tierName: string;
    elapsed: number;
    target: number;
    bonus: number;
    best?: number;
  };
}) {
  const beatBest = run.best === undefined || run.elapsed < run.best;
  const beatTarget = run.elapsed <= run.target;
  const rows = [
    { l: "THIS RUN", v: formatTime(run.elapsed), c: C.white, hi: true },
    { l: "PERSONAL BEST", v: run.best !== undefined ? formatTime(run.best) : "--:--", c: C.brassLight, hi: false },
    { l: "TIER TARGET", v: formatTime(run.target), c: C.paper3, hi: false },
  ];
  return (
    <div
      style={{
        marginTop: 8,
        padding: 6,
        backgroundColor: C.ink2,
        boxShadow: `0 0 0 2px ${C.redDark}, inset 2px 2px 0 0 ${C.ink3}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <PixelSprite name="stopwatch" scale={1.2} />
        <Display size={8} color={C.red}>
          BEST TIME — {run.tierName}
        </Display>
        {beatBest ? (
          <span className="bth-blink" style={{ backgroundColor: C.red, padding: "0 3px", boxShadow: `0 0 0 2px ${C.ink}` }}>
            <Mono size={13} color={C.white}>
              NEW RECORD
            </Mono>
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        {rows.map((r) => (
          <div key={r.l} style={{ display: "flex", flexDirection: "column" }}>
            <Mono size={12} color={C.brass}>
              {r.l}
            </Mono>
            <Mono size={r.hi ? 24 : 18} color={r.c}>
              {r.v}
            </Mono>
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Mono size={12} color={C.brass}>
            TIME BONUS
          </Mono>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <PixelSprite name="coin" scale={1} />
            <Mono size={20} color={beatTarget ? C.green : C.red}>
              +{run.bonus}
            </Mono>
          </div>
        </div>
      </div>
      <Mono size={13} color={C.paper4}>
        {beatTarget ? "UNDER TARGET — FULL BONUS PAID." : "OVER TARGET — PARTIAL BONUS."}
      </Mono>
    </div>
  );
}

const SRC_ICON: Record<string, string> = {
  article: "doc",
  social: "phone",
  quote: "quotecard",
  chart: "chart",
};

const GRADE_TONE: Record<string, string> = {
  exact: C.green,
  near: "#C8A32E",
  wrong: C.red,
  skipped: C.paper4,
};

const GRADE_WORD: Record<string, string> = {
  exact: "RIGHT CALL",
  near: "CLOSE — RIGHT INSTINCT",
  wrong: "WRONG CALL",
  skipped: "NEVER MARKED",
};

export function CaseFile({
  cs,
  marks,
  tips,
  rank,
  timeLeft,
  mode = "story",
  run,
  hintsUsed = 0,
  starTimeLeft,
  onSubmitted,
  onClose,
  onBack,
}: {
  cs: CaseDef;
  marks: Marks;
  tips: number;
  rank: string;
  timeLeft: number;
  mode?: "story" | "clock";
  /** Beat the Clock run context */
  run?: {
    tierName: string;
    index: number;
    total: number;
    elapsed: number;
    target: number;
    bonus: number;
    best?: number;
    isLast: boolean;
  };
  /** hints spent on this case — one of the star conditions rides on it */
  hintsUsed?: number;
  /** real clock reading for the speed star — stays live even when the
      scoring timer is switched off in Settings */
  starTimeLeft?: number;
  /** called once when the case is submitted, with the result and stars earned */
  onSubmitted: (r: CaseResult, stars: number) => void;
  onClose: () => void;
  onBack: () => void;
}) {
  const [result, setResult] = useState<CaseResult | null>(null);
  const [stars, setStars] = useState<boolean[]>([]);
  const [showMedalPopup, setShowMedalPopup] = useState(false);
  const submitted = result !== null;
  const clock = mode === "clock" && Boolean(run);
  const conds = starConds(cs.id);
  const brief = briefingFor(cs.id);
  const sift = siftFor(cs.id);
  const comp = COMPETENCY[sift.competency];
  const habit = HABIT[sift.habit];

  // Delay before showing medal popup (ms) so the star row animation finishes first
  const MEDAL_POPUP_DELAY_MS = 2000;

  const submit = () => {
    const r = scoreCase(cs, marks, timeLeft);
    const s = earnedStars({ cs, result: r, hintsUsed, timeLeft: starTimeLeft ?? timeLeft });
    setResult(r);
    setStars(s);
    const starCount = s.filter(Boolean).length;
    onSubmitted(r, starCount);
    if (starCount > 0 && !clock) {
      setTimeout(() => {
        setShowMedalPopup(true);
      }, MEDAL_POPUP_DELAY_MS);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <TopHud
        tips={tips}
        rank={rank}
        accent={clock ? C.redDark : C.brassDark}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name={clock ? "stopwatch" : "stamp"} scale={1} />
            <Display size={8} color={clock ? C.red : C.brassLight}>
              {clock ? `${run!.tierName} — SET ${run!.index + 1}/${run!.total}` : `CASE FILE — ${cs.tag}`}
            </Display>
          </div>
        }
      />

      {/* manila folder */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          margin: 6,
          display: "flex",
          gap: 6,
          padding: 6,
          ...speckle(C.paper3, C.paper4, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.paper2}, inset -3px -3px 0 0 #8f8467, 0 0 0 3px ${C.ink}`,
        }}
      >
        {/* LEFT — flagged claims */}
        <div style={{ flex: "0 0 48%", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Display size={8} color={C.ink}>
              YOUR CALLS
            </Display>
            <Mono size={14} color={C.ink3}>
              {Object.keys(marks).length} OF {cs.hotspots.length} CLAIMS MARKED
            </Mono>
          </div>
          <div
            className="bth-scroll"
            style={{ flex: 1, overflowY: "auto", marginTop: 5, display: "flex", flexDirection: "column", gap: 4 }}
          >
            {cs.hotspots.map((h) => {
              const m = marks[h.id];
              const truth = truthOf(h);
              const outcome = result?.outcomes.find((o) => o.id === h.id);
              const tone = outcome ? GRADE_TONE[outcome.grade] : C.ink;
              return (
                <div
                  key={h.id}
                  style={{
                    display: "flex",
                    gap: 6,
                    padding: 5,
                    backgroundColor: m ? C.paper : C.paper2,
                    boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${
                      submitted ? tone : C.ink
                    }`,
                    opacity: m ? 1 : 0.72,
                  }}
                >
                  <div style={{ flex: "0 0 auto", paddingTop: 1 }}>
                    <PixelSprite name={SRC_ICON[h.source]} scale={1.2} desaturate={!m} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Body size={13} color={C.ink}>
                      “{h.text}”
                    </Body>
                    <div style={{ marginTop: 2, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {m ? (
                        m.reasons.map((r) => (
                          <span key={r} style={{ padding: "0 3px", backgroundColor: C.paper3 }}>
                            <Mono size={12} color={C.ink3}>
                              {REASONS[r].toUpperCase()}
                            </Mono>
                          </span>
                        ))
                      ) : (
                        <Mono size={13} color={C.paper4}>NOT MARKED</Mono>
                      )}
                    </div>
                    {submitted ? (
                      <div style={{ marginTop: 3 }}>
                        <Mono size={12} color={tone}>
                          {outcome ? GRADE_WORD[outcome.grade] : ""} · RECORD SAYS {VERDICT[truth].label}
                        </Mono>
                      </div>
                    ) : null}
                  </div>
                  <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    {m ? (
                      <>
                        <div
                          style={{
                            padding: "1px 4px",
                            transform: "rotate(-6deg)",
                            backgroundColor: VERDICT[m.verdict].color,
                            boxShadow: `0 0 0 2px ${C.ink}`,
                          }}
                        >
                          <Display size={6} color={C.white}>
                            {VERDICT[m.verdict].code}
                          </Display>
                        </div>
                        {submitted && outcome ? (
                          <PixelSprite name={outcome.grade === "exact" ? "check" : outcome.grade === "near" ? "flag" : "cross"} scale={1} />
                        ) : null}
                      </>
                    ) : (
                      <PixelSprite name="lock" scale={1} desaturate />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — summary / verdict */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, gap: 5 }}>
          <div
            style={{
              padding: 6,
              backgroundColor: C.ink2,
              boxShadow: `0 0 0 2px ${C.ink}`,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                l: "ACCURACY SCORE",
                v: submitted ? `${Math.round(result!.accuracy * 100)}%` : "—",
                c: C.green,
              },
              {
                l: "REASONS RIGHT",
                v: submitted ? `${result!.reasonsRight}/${result!.reasonsPossible}` : "—",
                c: C.brassLight,
              },
              {
                l: "MISSED",
                v: submitted ? String(result!.missed.length) : "—",
                c: C.red,
              },
              {
                l: "FALSE ALARMS",
                v: submitted ? String(result!.falseAlarms.length) : "—",
                c: C.red,
              },
            ].map((s) => (
              <div key={s.l} style={{ flex: "1 1 40%", display: "flex", flexDirection: "column" }}>
                <Mono size={13} color={C.brass}>
                  {s.l}
                </Mono>
                <Mono size={22} color={s.c}>
                  {s.v}
                </Mono>
              </div>
            ))}
          </div>

          {!submitted ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                padding: 8,
                ...speckle(C.paper, C.paper2, 4),
                boxShadow: `0 0 0 2px ${C.ink}`,
              }}
            >
              <PixelSprite name="stamp" scale={3} />
              <Body size={14} color={C.ink} style={{ textAlign: "center", maxWidth: 300 }}>
                Once you file, the desk sees everything — including what you walked past.
              </Body>
              <div style={{ display: "flex", gap: 8 }}>
                <PixelButton variant="ink" size={9} onClick={onBack} label="Button — Back to sources">
                  ◂ BACK TO SOURCES
                </PixelButton>
                <PixelButton variant="red" size={9} icon="stamp" iconScale={1} onClick={submit} label="Button — Submit verdict">
                  SUBMIT VERDICT
                </PixelButton>
              </div>
            </div>
          ) : (
            <div
              className="bth-scroll"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: 8,
                position: "relative",
                ...speckle(C.paper, C.paper2, 4),
                boxShadow: `0 0 0 2px ${C.ink}`,
              }}
            >
              {/* stamp impact */}
              <div
                className="bth-stamp"
                style={{
                  position: "absolute",
                  right: 8,
                  top: 4,
                  padding: "4px 8px",
                  backgroundColor: result!.solved ? C.green : C.red,
                  boxShadow: `0 0 0 3px ${C.ink}, inset 2px 2px 0 0 rgba(246,240,226,0.35)`,
                }}
              >
                <Display size={11} color={C.white}>
                  {result!.solved ? "CASE SOLVED" : "CASE REOPENED"}
                </Display>
              </div>

              {/* star payoff — the promise the briefing card made */}
              {!clock ? (
                <div
                  style={{
                    marginTop: 34,
                    padding: 6,
                    backgroundColor: C.ink,
                    boxShadow: `0 0 0 2px ${C.brassDark}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <StarRow earned={stars} scale={2.4} animate />
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {conds.map((c, i) => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <PixelSprite name={stars[i] ? "check" : "cross"} scale={0.9} />
                        <Mono size={13} color={stars[i] ? C.green : C.paper4}>
                          {c.label.toUpperCase()}
                        </Mono>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <Mono size={12} color={C.brass}>
                      RATING
                    </Mono>
                    <Mono size={24} color={C.brassLight}>
                      {stars.filter(Boolean).length}/3
                    </Mono>
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: clock ? 34 : 8 }}>
                <Display size={8} color={C.red}>
                  NOTE FROM THE EDITOR
                </Display>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <div style={{ flex: "0 0 auto", boxShadow: `0 0 0 2px ${C.ink}`, alignSelf: "flex-start" }}>
                  <PixelSprite name="editor" scale={2} />
                </div>
                <div style={{ flex: 1 }}>
                  {cs.hotspots
                    .filter(
                      (h) =>
                        result!.missed.includes(h.id) ||
                        result!.falseAlarms.includes(h.id) ||
                        h.misleading,
                    )
                    .map((h) => (
                      <div key={h.id} style={{ marginBottom: 5 }}>
                        <Body size={13} color={C.ink}>
                          <span style={{ color: C.red }}>▸ </span>
                          {h.note}
                        </Body>
                      </div>
                    ))}
                  {result!.missed.length ? (
                    <div style={{ marginTop: 4 }}>
                      <Mono size={14} color={C.red}>
                        MISSED: {result!.missed.length} MISLEADING CLAIM
                        {result!.missed.length === 1 ? "" : "S"} SLIPPED THROUGH
                      </Mono>
                    </div>
                  ) : (
                    <Mono size={14} color={C.green}>
                      NOTHING SLIPPED THROUGH. GOOD DESK WORK.
                    </Mono>
                  )}

                  {/* one sentence, and it is about the method, not the score */}
                  <div
                    style={{
                      marginTop: 6,
                      padding: "4px 6px",
                      backgroundColor: C.paper3,
                      boxShadow: `inset 3px 0 0 0 ${C.red}`,
                    }}
                  >
                    <Body size={14} color={C.ink}>
                      {result!.falseAlarms.length > result!.missed.length
                        ? "You are flagging honest reporting — suspicion without checking is just a different way of being wrong."
                        : result!.missed.length
                          ? "The claims you cleared were the ones that needed the second source, not the loud ones."
                          : result!.reasonsRight >= result!.reasonsPossible
                            ? "You named why, not just what. That is the part that transfers to everything else you read."
                            : "Right calls, thin reasoning — next time make yourself say the second reason out loud."}
                    </Body>
                  </div>
                </div>
              </div>

              <div
                className="bth-rise"
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 6px",
                  backgroundColor: C.ink2,
                  boxShadow: `0 0 0 2px ${C.brassDark}`,
                  width: "fit-content",
                }}
              >
                <PixelSprite name="coin" scale={1.6} />
                <Mono size={22} color={C.brassLight}>
                  +{result!.tips} TIPS
                </Mono>
                <Mono size={13} color={C.brass}>
                  (PAID ONLY WHERE THE REASONING HELD UP · +{result!.timeBonus} TIME)
                </Mono>
              </div>

              {/* calibration — the second axis, and the one people forget */}
              <div
                style={{
                  marginTop: 8,
                  padding: 6,
                  backgroundColor: C.ink,
                  boxShadow: `0 0 0 2px ${C.ink3}`,
                }}
              >
                <CalibrationMeter cal={result!.calibration} width={300} />
              </div>

              {/* the transferable habit — the whole point of the exercise */}
              <div
                style={{
                  marginTop: 8,
                  padding: 6,
                  display: "flex",
                  gap: 7,
                  alignItems: "flex-start",
                  backgroundColor: C.paper2,
                  boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}, inset 6px 0 0 0 ${C.green}`,
                }}
              >
                <PixelSprite name={habit ? habit.sprite : "eye"} scale={1.6} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Mono size={12} color={C.green}>
                    LITERACY MOVE — TAKE THIS OUT OF THE GAME
                  </Mono>
                  <br />
                  <Body size={14} color={C.ink}>
                    {sift.literacyMove}
                  </Body>
                  {habit ? (
                    <div style={{ marginTop: 2 }}>
                      <Mono size={12} color={C.ink3}>
                        HABIT UNLOCKED · {habit.move.toUpperCase()}
                      </Mono>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* UNESCO competency earned on this case */}
              <div
                style={{
                  marginTop: 8,
                  padding: 6,
                  display: "flex",
                  gap: 7,
                  alignItems: "center",
                  backgroundColor: C.ink2,
                  boxShadow: `0 0 0 2px ${C.brassDark}`,
                }}
              >
                <div style={{ boxShadow: `0 0 0 2px ${C.ink}` }}>
                  <PixelSprite name={comp.sprite} scale={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Mono size={12} color={C.brass}>
                    UNESCO MIL COMPETENCY {result!.solved ? "EARNED" : "PRACTISED"}
                  </Mono>
                  <br />
                  <Body size={14} color={C.paper} style={{ fontWeight: 700 }}>
                    {comp.name}
                  </Body>
                  <div style={{ marginTop: 1 }}>
                    <Mono size={12} color={C.paper4}>
                      {comp.outcome}
                    </Mono>
                  </div>
                </div>
                <PixelSprite name={result!.solved ? "badge" : "shield"} scale={1.6} desaturate={!result!.solved} />
              </div>

              {/* gossip vs. record — Rumor's line put next to the paperwork */}
              {!clock ? (
                <div
                  style={{
                    marginTop: 8,
                    padding: 6,
                    backgroundColor: C.paper2,
                    boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
                  }}
                >
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ flex: "0 0 auto", boxShadow: `0 0 0 2px ${C.ink}`, alignSelf: "flex-start" }}>
                      <PixelSprite name="rumorIcon" scale={1.5} title={RUMOR_NAME} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Mono size={12} color={C.red}>
                        {RUMOR_NAME} SAID — UNVERIFIED
                      </Mono>
                      <Body size={13} color={C.ink3}>
                        “{rumorHeadline(cs.id)}”
                      </Body>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                    <div style={{ flex: "0 0 auto", boxShadow: `0 0 0 2px ${C.ink}`, alignSelf: "flex-start" }}>
                      <PixelSprite name="editor" scale={1.4} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Mono size={12} color={C.green}>
                        THE RECORD SAYS
                      </Mono>
                      <Body size={13} color={C.ink}>
                        {brief.rumorContrast}
                      </Body>
                    </div>
                  </div>
                </div>
              ) : null}

              {clock && run!.isLast ? <BestTimeCard run={run!} /> : null}
              {clock && !run!.isLast ? (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <PixelSprite name="stopwatch" scale={1.2} />
                  <Mono size={16} color={C.red}>
                    CLOCK STILL RUNNING — {run!.total - run!.index - 1} SOURCE SET
                    {run!.total - run!.index - 1 === 1 ? "" : "S"} LEFT
                  </Mono>
                </div>
              ) : null}
            </div>
          )}

          {submitted ? (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <PixelButton
                variant={clock ? "red" : "brass"}
                size={9}
                icon={clock ? "stopwatch" : "pin"}
                iconScale={1}
                onClick={onClose}
                label={`Button — ${clock && !run!.isLast ? "Next source set" : "Case Closed"}`}
              >
                {clock ? (run!.isLast ? "END RUN ▸" : "NEXT SOURCE SET ▸") : "CASE CLOSED ▸"}
              </PixelButton>
            </div>
          ) : null}
        </div>
      </div>

      {showMedalPopup && (
        <MedalPopup
          caseId={cs.id}
          caseTitle={cs.title}
          starsCount={stars.filter(Boolean).length}
          onClose={() => setShowMedalPopup(false)}
        />
      )}
    </div>
  );
}
