import React, { useMemo, useState } from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { TopHud } from "../components/Hud";
import { COMPETENCY, calibrationOf } from "../game/mil";
import { CASES } from "../game/cases";
import { siftFor } from "../game/sift";
import { SAMPLE_COHORT, cohortCsv, cohortStats, downloadCsv, type Student } from "../game/progress";
import { usePrefs } from "../prefs";

/* Screen 11 — TEACHER DASHBOARD.

   Written for someone with 25 students, one period, and no time to learn a
   new tool. Everything on screen is either a number they can act on or a plan
   they can run tomorrow. The sample data is labelled as sample data. */

const LESSON: { day: string; title: string; body: string; homework: string }[] = [
  {
    day: "DAY 1",
    title: "The feeling before the fact",
    body:
      "Pre-assessment (15 min), then students play the Bakery case together on a projector while you narrate the STOP move. Discuss: what did the headline make you feel before you knew anything?",
    homework: "Bring in one headline that made you react this week.",
  },
  {
    day: "DAY 2",
    title: "Who is telling you this",
    body:
      "Students play City Hall solo. Focus on the INVESTIGATE panel: founding date, funding, corrections record, author history. Pair-share: find the corrections page of a real outlet you use.",
    homework: "Screenshot a real outlet's corrections policy — or its absence.",
  },
  {
    day: "DAY 3",
    title: "Leaving the page",
    body:
      "Market case. Teach lateral reading explicitly: open other outlets before judging. Run the echo-chamber discussion — four sources repeating each other is still one source.",
    homework: "Take one claim, find three outlets, note what differs.",
  },
  {
    day: "DAY 4",
    title: "Following it upstream",
    body:
      "Police Blotter case, which turns on a methodology footnote. Students trace the chain and identify the exact link where the claim changed. Introduce reverse image search with the Market photo.",
    homework: "Trace one viral image back to its earliest posting.",
  },
  {
    day: "DAY 5",
    title: "Calibration, not cynicism",
    body:
      "Newsroom case — the paper investigating itself. Compare class calibration scores. Discuss over-suspicion as a failure mode. Post-assessment (15 min) and export the class CSV.",
    homework: "Write the one habit you will actually keep.",
  },
];

function Bar({ value, tone }: { value: number; tone: string }) {
  const cells = 10;
  const on = Math.round(value * cells);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} style={{ width: 7, height: 9, backgroundColor: i < on ? tone : C.paper4, boxShadow: `0 0 0 1px ${C.ink}` }} />
      ))}
    </span>
  );
}

function StudentCard({ s, onNote }: { s: Student; onNote: (id: string) => void }) {
  const cal = calibrationOf(Math.max(0, s.calibration) * 10, Math.max(0, -s.calibration) * 10, 10);
  const gain = s.pre !== undefined && s.post !== undefined ? s.post - s.pre : null;
  return (
    <div
      style={{
        padding: 6,
        backgroundColor: C.paper2,
        boxShadow: `inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PixelSprite name="bust1" scale={1.1} />
        <Mono size={14} color={C.ink}>
          {s.name}
        </Mono>
        <span style={{ marginLeft: "auto" }}>
          <Mono size={12} color={C.ink3}>
            {s.cases}/{CASES.length} CASES
          </Mono>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <Mono size={12} color={C.ink3}>
          ACC
        </Mono>
        <Bar value={s.accuracy} tone={C.green} />
        <Mono size={13} color={C.ink}>
          {Math.round(s.accuracy * 100)}%
        </Mono>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
        <Mono size={12} color={C.ink3}>
          CAL
        </Mono>
        <Mono size={13} color={cal.zone === "balanced" ? C.green : C.red}>
          {cal.label}
        </Mono>
        {gain !== null ? (
          <span style={{ marginLeft: "auto" }}>
            <Mono size={13} color={gain > 0 ? C.green : C.red}>
              {gain > 0 ? "+" : ""}
              {gain} PRE→POST
            </Mono>
          </span>
        ) : null}
      </div>

      <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
        <span style={{ padding: "0 4px", backgroundColor: C.paper3 }}>
          <Mono size={11} color={C.green}>
            STRONG · {COMPETENCY[s.strongest].short}
          </Mono>
        </span>
        <span style={{ padding: "0 4px", backgroundColor: C.paper3 }}>
          <Mono size={11} color={C.red}>
            NEEDS WORK · {COMPETENCY[s.weakest].short}
          </Mono>
        </span>
      </div>

      <div style={{ marginTop: 5 }}>
        <PixelButton variant="paper" size={7} icon="notebook" iconScale={0.9} onClick={() => onNote(s.id)} label={`Button — Note on ${s.name}`}>
          ADD NOTE
        </PixelButton>
      </div>
    </div>
  );
}

export function TeacherDashboard({ tips, rank, onBack }: { tips: number; rank: string; onBack: () => void }) {
  const { prefs, set } = usePrefs();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const stats = useMemo(() => cohortStats(SAMPLE_COHORT), []);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopHud
        tips={tips}
        rank={rank}
        accent={C.brassDark}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name="people" scale={1} />
            <Display size={8} color={C.brassLight}>
              TEACHER DASHBOARD
            </Display>
            <span style={{ padding: "0 4px", backgroundColor: C.red }}>
              <Mono size={12} color={C.white}>
                SAMPLE CLASS DATA
              </Mono>
            </span>
          </div>
        }
        right={
          <>
            <PixelButton
              variant="paper"
              size={8}
              icon="export"
              iconScale={1}
              onClick={() => downloadCsv("rosewood-class-results.csv", cohortCsv(SAMPLE_COHORT))}
              label="Button — Export class CSV"
            >
              EXPORT CSV
            </PixelButton>
            <PixelButton variant="ink" size={8} onClick={onBack} label="Button — Back">
              ◂ BACK
            </PixelButton>
          </>
        }
      />

      <div className="bth-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        {/* cohort summary */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 8, backgroundColor: C.ink2, boxShadow: `0 0 0 2px ${C.ink}` }}>
          {[
            { l: "STUDENTS", v: String(stats.students), c: C.paper },
            { l: "MEAN ACCURACY", v: `${Math.round(stats.meanAccuracy * 100)}%`, c: C.green },
            { l: "MEAN PRE→POST GAIN", v: `+${stats.meanGain.toFixed(1)}`, c: C.brassLight },
            { l: "WELL CALIBRATED", v: `${Math.round(stats.balancedShare * 100)}%`, c: C.green },
            { l: "HARDEST COMPETENCY", v: COMPETENCY[stats.hardest].short, c: C.red },
          ].map((s) => (
            <div key={s.l} style={{ flex: "1 1 20%", minWidth: 110 }}>
              <Mono size={12} color={C.brass}>
                {s.l}
              </Mono>
              <br />
              <Mono size={s.v.length > 8 ? 15 : 24} color={s.c}>
                {s.v}
              </Mono>
            </div>
          ))}
        </div>

        {/* roster */}
        <div
          style={{
            padding: 8,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <Display size={8} color={C.red}>
              CLASS ROSTER
            </Display>
            <Mono size={12} color={C.ink3}>
              ILLUSTRATIVE DATA — CONNECT A CLASSROOM SESSION FOR REAL RESULTS
            </Mono>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
            {SAMPLE_COHORT.map((s) => (
              <StudentCard key={s.id} s={s} onNote={setEditing} />
            ))}
          </div>
        </div>

        {/* teacher notes */}
        {editing ? (
          <div style={{ padding: 8, backgroundColor: C.ink2, boxShadow: `0 0 0 2px ${C.brassDark}` }}>
            <Mono size={13} color={C.brassLight}>
              NOTE ON {SAMPLE_COHORT.find((s) => s.id === editing)?.name}
            </Mono>
            <textarea
              value={notes[editing] ?? ""}
              onChange={(e) => setNotes((n) => ({ ...n, [editing]: e.target.value }))}
              rows={3}
              aria-label="Teacher note"
              style={{
                width: "100%",
                marginTop: 4,
                padding: 6,
                resize: "none",
                border: "none",
                outline: "none",
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: 14,
                color: C.ink,
                backgroundColor: C.paper,
                boxShadow: `inset 2px 2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 5 }}>
              <PixelButton variant="ink" size={8} onClick={() => setEditing(null)} label="Button — Close note">
                DONE
              </PixelButton>
            </div>
            <Mono size={11} color={C.paper4}>
              NOTES STAY ON THIS DEVICE. THEY ARE NOT SENT ANYWHERE AND ARE NOT IN THE CSV.
            </Mono>
          </div>
        ) : null}

        {/* assessment */}
        <div
          style={{
            padding: 8,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <Display size={8} color={C.red}>
            PRE / POST ASSESSMENT
          </Display>
          <Body size={13} color={C.ink}>
            The built-in assessment is twelve real-world claims marked with the same five states, no SIFT panels
            and no hints — so the post-test measures whether the moves transferred, not whether the game was
            memorised. Run it on Day 1 and Day 5. Scores appear against each student above and in the CSV.
          </Body>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <PixelButton variant="paper" size={8} icon="doc" iconScale={1} onClick={() => undefined} label="Button — Pre-assessment">
              PRE-ASSESSMENT (12 ITEMS)
            </PixelButton>
            <PixelButton variant="paper" size={8} icon="stamp" iconScale={1} onClick={() => undefined} label="Button — Post-assessment">
              POST-ASSESSMENT (12 ITEMS)
            </PixelButton>
          </div>
        </div>

        {/* lesson plan */}
        <div
          style={{
            padding: 8,
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <Display size={8} color={C.red}>
              FIVE-DAY LESSON PLAN
            </Display>
            <Mono size={12} color={C.ink3}>
              ONE CASE PER DAY · 40 MINUTES
            </Mono>
          </div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 5 }}>
            {LESSON.map((d, i) => {
              const cs = CASES[i];
              const comp = cs ? COMPETENCY[siftFor(cs.id).competency] : null;
              return (
                <div
                  key={d.day}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 7,
                    backgroundColor: C.paper2,
                    boxShadow: `inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}, inset 6px 0 0 0 ${C.brass}`,
                  }}
                >
                  <div style={{ flex: "0 0 62px" }}>
                    <Mono size={14} color={C.red}>
                      {d.day}
                    </Mono>
                    {comp ? (
                      <>
                        <br />
                        <PixelSprite name={comp.sprite} scale={1.2} />
                      </>
                    ) : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Mono size={14} color={C.ink}>
                      {d.title}
                    </Mono>
                    <div style={{ marginTop: 2 }}>
                      <Body size={13} color={C.ink3}>
                        {d.body}
                      </Body>
                    </div>
                    <div style={{ marginTop: 3 }}>
                      <Mono size={12} color={C.paper4}>
                        HOMEWORK · {d.homework.toUpperCase()}
                      </Mono>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* research */}
        <div style={{ padding: 8, backgroundColor: C.ink2, boxShadow: `0 0 0 2px ${C.ink}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <PixelSprite name="shield" scale={1.3} />
            <Display size={8} color={C.brassLight}>
              RESEARCH PARTICIPATION
            </Display>
          </div>
          <div style={{ marginTop: 4 }}>
            <Body size={13} color={C.paper3}>
              Anonymised, aggregate class results can be contributed to open media-literacy research. No names, no
              free text, no device identifiers, and nothing leaves the device until you switch this on. Students
              must also opt in individually in their own settings — your switch alone is not consent.
            </Body>
          </div>
          <div style={{ marginTop: 6 }}>
            <PixelButton
              variant={prefs.researchOptIn ? "green" : "ink"}
              size={8}
              icon="globe"
              iconScale={1}
              onClick={() => set("researchOptIn", !prefs.researchOptIn)}
              label="Button — Toggle research participation"
            >
              RESEARCH CONTRIBUTION: {prefs.researchOptIn ? "ON" : "OFF"}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
