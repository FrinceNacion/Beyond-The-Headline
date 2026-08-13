import React, { useState } from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../components/Pixel";
import { TopHud } from "../components/Hud";
import { COMPETENCIES, HABITS, PHASES } from "../game/mil";

/* Screen 8 — ABOUT / THE FACT-CHECKER'S HANDBOOK.

   The screen that makes the game defensible as an educational artifact rather
   than a quiz with pixel art: named method, named framework, stated pedagogy,
   open licence, credited sources. */

type TabId = "sift" | "unesco" | "why" | "open";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "sift", label: "THE SIFT METHOD", icon: "handbook" },
  { id: "unesco", label: "UNESCO MIL", icon: "globe" },
  { id: "why", label: "WHY A GAME", icon: "compGenre" },
  { id: "open", label: "OPEN + CREDITS", icon: "export" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <Display size={8} color={C.red}>
        {title}
      </Display>
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
}

export function About({ tips, rank, onBack }: { tips: number; rank: string; onBack: () => void }) {
  const [tab, setTab] = useState<TabId>("sift");

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopHud
        tips={tips}
        rank={rank}
        accent={C.brassDark}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name="handbook" scale={1} />
            <Display size={8} color={C.brassLight}>
              THE FACT-CHECKER’S HANDBOOK
            </Display>
          </div>
        }
        right={
          <PixelButton variant="ink" size={8} onClick={onBack} label="Button — Back">
            ◂ BACK
          </PixelButton>
        }
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0, padding: 6, gap: 6 }}>
        {/* tabs */}
        <div style={{ flex: "0 0 138px", display: "flex", flexDirection: "column", gap: 4 }}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                data-interactive="tab"
                aria-label={`Tab — ${t.label}`}
                aria-pressed={on}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  minHeight: 34,
                  padding: "5px 6px",
                  textAlign: "left",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: on ? C.paper : C.paper3,
                  boxShadow: on
                    ? `inset 3px 0 0 0 ${C.red}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`
                    : `inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
                }}
              >
                <PixelSprite name={t.icon} scale={1.1} />
                <Display size={7} color={C.ink}>
                  {t.label}
                </Display>
              </button>
            );
          })}
        </div>

        {/* body */}
        <div
          className="bth-scroll"
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: "auto",
            padding: "8px 12px 12px",
            ...speckle(C.paper, C.paper2, 4),
            boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
          }}
        >
          {tab === "sift" ? (
            <>
              <Section title="SIFT — FOUR MOVES">
                <Body size={14} color={C.ink}>
                  Every case in this game runs on SIFT, a checking method developed by{" "}
                  <strong>Mike Caulfield</strong> (Washington State University Vancouver, later the University of
                  Washington Center for an Informed Public) and published in the open textbook{" "}
                  <em>Web Literacy for Student Fact-Checkers</em> (2017). It is used because it is short enough
                  to actually do: four moves, thirty seconds, before you share anything.
                </Body>
              </Section>

              {PHASES.filter((p) => p.id !== "mark").map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 7,
                    marginBottom: 5,
                    backgroundColor: C.paper2,
                    boxShadow: `inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}, inset 6px 0 0 0 ${C.brass}`,
                  }}
                >
                  <PixelSprite name={p.sprite} scale={1.8} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Mono size={14} color={C.ink}>
                      {i + 1}. {p.label} — {p.verb}
                    </Mono>
                    <br />
                    <Body size={13} color={C.ink3}>
                      {p.teaches}
                    </Body>
                  </div>
                </div>
              ))}

              <Section title="WHY THE GAME LOCKS THE MARKING">
                <Body size={14} color={C.ink}>
                  You cannot mark a claim until all four moves are done. Skipping straight to a verdict is the
                  exact behaviour the method exists to interrupt, so the interface refuses to let you.
                </Body>
              </Section>
            </>
          ) : tab === "unesco" ? (
            <>
              <Section title="UNESCO MIL COMPETENCY FRAMEWORK">
                <Body size={14} color={C.ink}>
                  Each case is mapped to a competency from UNESCO’s Media and Information Literacy Curriculum
                  for Educators and Learners (2011; revised edition 2021). The framework treats media literacy
                  as a civic capability, not a technical skill — which is why the game grades your reasoning
                  and your calibration rather than your click accuracy.
                </Body>
              </Section>

              {COMPETENCIES.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 7,
                    marginBottom: 5,
                    backgroundColor: C.paper2,
                    boxShadow: `inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
                  }}
                >
                  <PixelSprite name={c.sprite} scale={1.8} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Mono size={14} color={C.ink}>
                      {c.name}
                    </Mono>
                    <br />
                    <Body size={13} color={C.ink3}>
                      {c.outcome}
                    </Body>
                  </div>
                </div>
              ))}

              <Section title="TRANSFERABLE HABITS">
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {HABITS.map((h) => (
                    <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <PixelSprite name={h.sprite} scale={1} />
                      <Body size={13} color={C.ink}>
                        {h.move}
                      </Body>
                    </div>
                  ))}
                </div>
              </Section>
            </>
          ) : tab === "why" ? (
            <>
              <Section title="WHY A GAME AND NOT A LESSON">
                <Body size={14} color={C.ink}>
                  Media literacy fails in the gap between knowing and doing. Most people can define
                  misinformation; far fewer will open a second tab before resharing. The gap is behavioural, so
                  the intervention has to be behavioural: repeated, low-stakes practice of the same four moves
                  until they run without deliberation. A game can demand that repetition where a lecture cannot,
                  and it can make being wrong survivable — you file a bad verdict, the Editor tells you why, you
                  keep your job.
                </Body>
              </Section>
              <Section title="WHY FIVE STATES, NOT TRUE / FALSE">
                <Body size={14} color={C.ink}>
                  Binary marking teaches a false model of the problem. Very little of what spreads is
                  fabricated; most of it is accurate material stripped of context, cherry-picked, or reported by
                  someone with an interest. The five states — checks out, true but biased, true but out of
                  context, misleading, false — force the distinction that actually matters in practice.
                </Body>
              </Section>
              <Section title="WHY CALIBRATION IS SCORED">
                <Body size={14} color={C.ink}>
                  A player who flags everything scores well on “misinformation caught” and has learned nothing
                  except distrust. Blanket cynicism is its own information disorder. The calibration meter makes
                  over-suspicion visible and costly, so the target is accuracy in both directions.
                </Body>
              </Section>
              <Section title="LIMITS WE WILL STATE PLAINLY">
                <Body size={14} color={C.ink}>
                  The cases are fictional, set in an invented town, and written to isolate one pattern each.
                  That makes them teachable and also cleaner than reality. Real claims arrive tangled, partisan,
                  and without a tidy original document at the end of the chain. This game builds the moves; it
                  does not certify anyone as a fact-checker.
                </Body>
              </Section>
            </>
          ) : (
            <>
              <Section title="OPEN PEDAGOGY">
                <Body size={14} color={C.ink}>
                  Every case, reason chip, competency mapping and Editor note in this game is authored content
                  that teachers should be able to change. The case format is plain data: a headline, three
                  sources, a set of claims with a reason and a note. Fork it, localise it, write cases about
                  your own town’s newspaper. Nothing here should be a black box to the person teaching with it.
                </Body>
              </Section>
              <Section title="LICENCE">
                <Body size={14} color={C.ink}>
                  Game code and case content are intended for release under CC BY-SA 4.0 — use it, adapt it,
                  teach with it, share the adaptations back under the same terms.
                </Body>
              </Section>
              <Section title="CREDITS AND SOURCES">
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    ["SIFT method", "Mike Caulfield, Web Literacy for Student Fact-Checkers (2017), CC BY"],
                    ["Competency framework", "UNESCO Media and Information Literacy Curriculum (2011, rev. 2021)"],
                    ["Lateral reading research", "Wineburg & McGrew, Stanford History Education Group (2017)"],
                    ["Calibration framing", "Signal detection: false alarms weighted alongside misses"],
                    ["Art, writing, code", "Original pixel work for this project — no asset packs, no stock art"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 6 }}>
                      <div style={{ flex: "0 0 140px" }}>
                        <Mono size={13} color={C.ink3}>
                          {k.toUpperCase()}
                        </Mono>
                      </div>
                      <Body size={13} color={C.ink}>
                        {v}
                      </Body>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="A NOTE ON THE FICTION">
                <Body size={14} color={C.ink}>
                  Rosewood, its bakery, its council and its newspapers do not exist. No real outlet, journalist
                  or official is depicted, and no real organisation endorses this game.
                </Body>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
