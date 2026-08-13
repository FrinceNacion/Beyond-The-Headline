# UX Audit & Improvement Roadmap: Beyond the Headline

## Context

The game is functionally complete (11 screens, SIFT loop, 6 cases, persistence) but has never been visually verified. A spec file at `src/imports/pasted_text/story-mode-select.md` describes a much richer game — narrative acts, NPCs, and per-SIFT-phase mini-games — that isn't implemented. The user wants to know every red flag and improvement before adding mini-games, with special focus on making the game accessible to first-time players.

---

## RED FLAGS (Blockers / Structural Problems)

### 🔴 RF-1 — Tutorial never mentions SIFT gating
**File:** `src/app/screens/TutorialOverlay.tsx`

The 4-card tutorial tells players to "tab through sources" and "tap a claim to mark it," but never mentions the four required SIFT steps. The very first thing players see after dismissing the tutorial is the STOP overlay — a new, unexplained concept. If they try to tap a claim before finishing TRACE, they get: `"FINISH ALL FOUR CHECKS FIRST. THAT IS THE JOB."` This all-caps toast dismisses in 2.6 seconds and tells them they're wrong without telling them what to do next. **For beginners, this is a guaranteed hard wall.**

Fix: Add a 5th tutorial card that shows the PhaseBar and explains the four steps must be done before marking. Alternatively, show a short animated arrow pointing to the PhaseBar when the toast fires.

---

### 🔴 RF-2 — No way to re-view SIFT research panels while marking
**Files:** `src/app/screens/Investigation.tsx`, `src/app/screens/sift/CoveragePanel.tsx`, `src/app/screens/sift/TracePanel.tsx`

After completing TRACE, the Coverage and Trace panels are gone. Players cannot re-reference the coverage snippets or trace chain while deciding how to mark claims. The only visible information is the article/social/quote text itself. This forces players to either remember everything or guess — exactly the opposite of the game's educational intent.

Fix: Convert completed SIFT phases into a collapsible reference sidebar (or a bottom drawer) so players can re-open a coverage card or trace step during marking. Completed phases should stay readable, not disappear.

---

### 🔴 RF-3 — FILE CASE enables after just one mark, no pre-file warning
**File:** `src/app/screens/Investigation.tsx` (`Object.keys(marks).length > 0`)

A player can mark one claim and immediately file, leaving 6 claims as "NOT MARKED." The atmospheric copy ("Once you file, the desk sees everything — including what you walked past") does not function as a warning. Beginners will file early and be confused by their results.

Fix: Show a pre-file confirmation modal that lists how many claims are unmarked. If fewer than half are marked, show a hard warning ("You've only marked X of 7 claims — are you sure?"). Better: show a mini evidence tray that counts marked vs unmarked claims visually.

---

### 🔴 RF-4 — Second Source item consumed silently on re-mark
**Files:** `src/app/App.tsx` (`mark()` function), `src/app/screens/MarkModal.tsx`

When a player re-marks a claim and has a Second Source in inventory, the item is consumed without any warning. The RE-CHECK button fires and the item disappears. For a beginner who doesn't know what Second Source does, this is invisible resource drain.

Fix: Add a confirmation step inside the MarkModal: "This will use your Second Source item. Proceed?" before the re-mark is committed.

---

### 🔴 RF-5 — `story-mode-select.md` design is entirely unimplemented
**File:** `src/imports/pasted_text/story-mode-select.md`

The spec describes three narrative acts with NPCs (Maya, David, Dr. Chen), per-SIFT-phase mini-games (drag-and-drop at INVESTIGATE, Venn diagram at FIND BETTER, chain puzzle at TRACE), character dialogue post-case, an Act Finale newspaper screen, and a Campaign Overview. None of this exists. The current game has zero narrative continuity between cases, no NPCs, and no mini-games. Adding mini-games without reading this spec first means building the wrong thing.

**Action required: Read `story-mode-select.md` in full before designing any mini-game feature.**

---

## ISSUES (Significant UX friction)

### 🟠 I-1 — Gate warning toast is hostile, not helpful
**File:** `src/app/screens/Investigation.tsx` (gateWarn toast)

`"FINISH ALL FOUR CHECKS FIRST. THAT IS THE JOB."` is all-caps, imperative, and auto-dismisses in 2.6 seconds. It tells a confused beginner they're wrong without any visual cue about *where* to go next. No arrow, no highlight, no pointer to the PhaseBar.

Fix: Change tone to instructive ("Complete the SIFT steps first — check the bar above"). Pulse-highlight the PhaseBar or the next incomplete step button when the toast fires.

---

### 🟠 I-2 — Source Panel is per-tab but players don't know to check all tabs
**File:** `src/app/screens/sift/SourcePanel.tsx`

Each source tab (ARTICLE, SOCIAL POST, OFFICIAL QUOTE) has its own outlet credibility profile in the INVESTIGATE phase. Nothing explicitly tells players they need to check all three. A player who reviews only the article's profile and advances may be missing critical credibility signals for the other sources.

Fix: Add a tab-completion indicator on each source tab (a small checkmark when that tab's profile has been viewed). Show a note: "Check all three sources before advancing."

---

### 🟠 I-3 — PhaseHint strip is too small and visually low-priority
**File:** `src/app/screens/sift/PhaseBar.tsx`

The 13px monospace PhaseHint line under the PhaseBar contains the clearest explanations of each SIFT step, but is the smallest text on screen. Beginners ignore it and look at the large content area instead.

Fix: Give PhaseHint more visual weight — larger font, a border, or a colored background. Consider showing the hint as a modal or toast when a phase first activates, not just as a persistent small strip.

---

### 🟠 I-4 — Beat the Clock removes navigation with no explanation
**File:** `src/app/screens/Investigation.tsx` (TopHud with undefined onMap/onShop)

In clock mode, the map and shop buttons silently disappear. Players who entered clock mode may be confused about how to exit or whether they can access the shop.

Fix: Keep the buttons visible but show them as locked with a tooltip: "Navigation locked during timed run." Or add a "QUIT RUN" button that confirms exit.

---

### 🟠 I-5 — No explanation for CHART tab having zero markable claims
**File:** `src/app/screens/Investigation.tsx` (ChartView tab)

The CHART tab is always present but shows "REFERENCE (0 slots)." Players expecting claims to mark here will be confused. No tooltip or label explains that it's reference-only.

Fix: Label it more explicitly: "CHART — reference only, no claims to mark" or add a first-visit tooltip.

---

### 🟠 I-6 — Briefing star conditions show labels but not thresholds
**File:** `src/app/screens/Briefing.tsx` (`starConds()`)

Players see "up to 3 stars" on the briefing but don't see what accuracy or calibration threshold earns each star until the Case File results screen. Beginners can't set goals.

Fix: Show the actual thresholds on the Briefing screen (e.g., "★★★ = 80%+ accuracy + under 5 min").

---

### 🟠 I-7 — Editor feedback is capped at 4 notes, extras silently dropped
**File:** `src/app/screens/CaseFile.tsx` (`.slice(0, 4)`)

If a player gets 5+ wrong marks, some editor feedback notes are silently cut. Players who made many mistakes get incomplete feedback.

Fix: Remove the slice cap and paginate the notes, or scroll the note list.

---

### 🟠 I-8 — Five verdict states are learned only mid-game during marking
**File:** `src/app/screens/MarkModal.tsx`

The tutorial mentions only "Misleading or Checks Out" (two states) but the game has five: CHECKS OUT, TRUE BUT BIASED, TRUE BUT OUT OF CONTEXT, MISLEADING, FALSE. Beginners will be surprised mid-mark by three states they weren't told about.

Fix: Introduce all five states in the tutorial or in a Briefing-screen tooltip. The StatesLegend overlay exists but is buried in Settings — surface it as a one-time reveal during first marking.

---

## IMPROVEMENTS (Polish / Accessibility / Engagement)

### 🟡 P-1 — Add a "Quick Start" mode for first-timers
Rather than jumping straight into case 1 with only a 4-card tutorial, offer a guided "Practice Claim" before the first real case — a pre-authored, single-claim mini-lesson that walks through one full SIFT cycle with hand-holding arrows and no scoring pressure.

---

### 🟡 P-2 — Visual progress indicator inside Investigation
Beginners need to see "7 claims, 3 marked" at a glance. Add a small pill counter (e.g., `3/7 MARKED`) near the evidence tray, and show each hotspot underline change color after marking (green = Checks Out, red = Misleading family, grey = unmarked).

---

### 🟡 P-3 — Animate SIFT phase transitions
The phase bar currently advances without animation. A brief "unlock" animation (e.g., the next phase button slides in or pulses) would give players satisfying feedback and signal what to do next. This is especially important for the Trace → Mark unlock moment — currently the only signal is a toast and the hotspots becoming tappable.

---

### 🟡 P-4 — Reduce wall-of-text in source panels
The SourcePanel shows 6 rows of profile data all at once (editorial stance, corrections record, funding, author, affiliations, flags). For beginners this is overwhelming. Consider:
- Progressive disclosure: show 3 key rows by default, "See full profile" expands the rest.
- Use icon+label instead of full text rows (e.g., a green checkmark for "clean corrections record").

---

### 🟡 P-5 — Add per-case onboarding moments (not just first case)
The tutorial only fires on the first case. Cases 2–6 introduce new wrinkles (e.g., case 5 is "two true numbers arranged to tell a lie") but offer no case-specific guidance. Add a short Editor line at the start of each case briefing that hints at the new challenge.

---

### 🟡 P-6 — Coverage Panel "echo chamber" teaching moment
The footer "FOUR SOURCES REPEATING EACH OTHER IS STILL ONE SOURCE" is an important media literacy lesson, but it's buried. Make it interactive: when all four coverage cards are tagged CORROBORATES/ECHO, trigger a callout: "All roads lead back to the same origin — that's an echo, not confirmation."

---

### 🟡 P-7 — Trace Panel drift notes need stronger visual treatment
Red drift notes in the Trace chain are the highest-value teaching moments (where a claim changed as it traveled). But they're inline text. Make drift notes stand out: a red-bordered callout box, or a "DRIFT DETECTED" badge that draws the eye.

---

### 🟡 P-8 — Add a "What does this mean?" tooltip on every verdict state
Inside MarkModal, each verdict button shows a 2-line blurb. Add a `?` button that opens an expanded explanation with a real example. Beginners confuse "TRUE BUT BIASED" and "MISLEADING" constantly — an example sentence ("e.g., a tobacco company funding a study showing their product is harmless") would help enormously.

---

### 🟡 P-9 — Reason chip explanations
The reason chips (e.g., "SELECTIVELY QUOTED") have no tooltip or explanation. For beginners, the chip labels are jargon. Add a brief explanation on long-press or hover.

---

### 🟡 P-10 — Community Map needs state feedback
Case nodes on the map only show locked/unlocked/active states. Add:
- A star rating on completed nodes (1–3 stars from last run).
- A "BEST SCORE" tooltip on hover/long-press.
- A visual indicator when a case is available to replay for a better score.

---

## MINI-GAME INTEGRATION PLAN (Aligned with story-mode-select.md spec)

**Read `src/imports/pasted_text/story-mode-select.md` fully before implementing.** Based on what's described, the mini-games map directly onto SIFT phases:

| SIFT Phase | Mini-game Type | Teaching Goal |
|---|---|---|
| INVESTIGATE | Drag-and-drop source credibility sort | Recognise credibility signals |
| FIND BETTER | Venn diagram — overlap/contradict | Understand corroboration vs echo |
| TRACE | Chain puzzle — reorder origin steps | Follow a claim to its source |

**Integration approach:**
1. Mini-games should be optional at first (a "LEARN BY DOING" button alongside the standard panel) so experienced players aren't slowed down.
2. Completing a mini-game could award a bonus Tip or a UNESCO badge.
3. Mini-games unlock after completing case 1 in "training" mode, then are available on replay.
4. Each mini-game needs its own pixel-art component (pure SVG rectangles, five-color palette, pixel typefaces — no anti-aliasing, consistent with existing aesthetic).
5. NPC characters (Maya, David, Dr. Chen) can be introduced as briefing-card dialogue busts before their respective cases, building to the Act Finale newspaper.

**Implementation order (recommended):**
1. Read the full spec → confirm NPC assignments and act structure.
2. Add narrative Act structure to `cases.ts` (group cases into Acts 1/2/3).
3. Add Campaign Overview screen (described in spec).
4. Implement one mini-game (INVESTIGATE drag-sort) as a proof of concept.
5. Add NPC dialogue to Briefing screen.
6. Act Finale newspaper screen after each act's last case.
7. Implement remaining two mini-games.

---

## Critical Files to Modify

| File | Change |
|---|---|
| `src/app/screens/TutorialOverlay.tsx` | Add SIFT-gating card (RF-1) |
| `src/app/screens/Investigation.tsx` | Re-viewable panels (RF-2), pre-file warning (RF-3), gate toast (I-1), progress counter (P-2) |
| `src/app/App.tsx` | Second Source confirmation (RF-4) |
| `src/app/screens/sift/SourcePanel.tsx` | Tab-completion indicators (I-2) |
| `src/app/screens/sift/PhaseBar.tsx` | PhaseHint visual weight (I-3) |
| `src/app/screens/Briefing.tsx` | Star thresholds (I-6) |
| `src/app/screens/CaseFile.tsx` | Remove slice cap (I-7) |
| `src/app/screens/MarkModal.tsx` | Five-state intro (I-8), verdict tooltips (P-8), chip tooltips (P-9) |
| `src/app/screens/sift/TracePanel.tsx` | Drift note visual treatment (P-7) |
| `src/app/screens/sift/CoveragePanel.tsx` | Echo callout (P-6) |
| `src/app/screens/CommunityMap.tsx` | Star ratings on nodes (P-10) |
| `src/data/cases.ts` | Act groupings for mini-game integration |

## Verification

Since the dev server isn't reachable from the sandbox, each change should be verified by:
1. Running `tsc --noEmit` to confirm zero type errors.
2. Checking that all screen references still resolve.
3. Visual verification must be done in a real browser session (currently blocked).
