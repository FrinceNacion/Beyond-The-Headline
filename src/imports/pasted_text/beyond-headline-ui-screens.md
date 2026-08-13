Design UI screens for "Beyond the Headline" — a web-based, landscape mobile pixel-art 
game teaching media and information literacy using the SIFT framework (Stop / Investigate 
the Source / Find Better Coverage / Trace the Claim). This is a real educational product, 
not trivia entertainment.

STYLE RULES (maintain existing system)
- Pixel art only: hard edges, dithered shading (3-4 tone ramps), no emoji, no flat 
  icon packs. Every visual is custom-drawn to this game's world.
- Palette: ink navy #14181C, #1D2328 (backgrounds), manila/paper #EDE3CF, #DFD2B4, 
  #C9BA96 (documents, cards), muted red #B7291E (flags, warnings), brass #B08D57 
  (progress, Tips), dull green #2F6F4E (verified).
- Type: bold irregular pixel display font (titles), clean small pixel font (body), 
  pixel monospace (HUD/labels).
- All screens landscape: 844x390 mobile, 1440x810 desktop.

---
CORE MECHANIC REDESIGN — THE SIFT LOOP

Each investigation case now follows the four SIFT steps as distinct player actions, not 
hidden backend logic. The player must complete these steps in order before marking a claim:

STOP — A forced pause beat on case entry (Screen 5a, below)
INVESTIGATE THE SOURCE — Check outlet/author credibility (new mini-panel, Screen 5b)
FIND BETTER COVERAGE — Cross-reference against other outlets (new lateral-read panel, 
Screen 5c)
TRACE THE CLAIM — Follow a stat or quote back to origin (tappable hotspot detail, 
Screen 5d)

Only after these four steps can the player mark the claim with a reasoning chip.

---
SCREEN 5a — Investigation Scene, STOP Phase (first screen on case entry)

Landscape split: left-docked folder tabs as before (Article, Social Post, Official 
Quote, NEW: Chart/Statistic). Right side shows the selected source full-bleed. At 
entry, a pixel overlay fills the screen with a 2-second mandatory pause message in The 
Editor's handwriting: "Don't react yet. Read everything. Then check the source."

Below the message, four pixel action buttons appear, one for each SIFT step, in order 
(Stop → Investigate → Find Better → Trace). Only the first "Continue Reading" button 
is clickable; clicking it dismisses the overlay and begins the source-review phase.

This beat installs the habit before any analysis starts.

---
SCREEN 5b — Investigation Scene, INVESTIGATE THE SOURCE Phase

Same source display, but a new panel slides in from the right edge (or appears below on 
mobile): "Who Said This?" showing:
- Outlet logo (pixel-illustrated), name, and founding year
- One-line editorial stance (neutral/center-left/right/sensationalist) in the pixel font
- A small "Corrections Track" counter (e.g. "3 major corrections in past year")
- Author byline (if article-sourced) with a tap to see their past stories and any 
  conflicts of interest
- One pixel button: "Back to Reading" to close this panel and continue

Player can tap between sources (Article/Social/Quote tabs) and each has its own credibility 
panel. This teaches "check the source before trusting the claim" as a separate, mandatory step.

---
SCREEN 5c — Investigation Scene, FIND BETTER COVERAGE Phase

Third panel: "What Else Says?" — a simulated lateral-reading search showing 3-4 pixel 
"snippet cards" of the same claim as reported by different fictional outlets:
- Outlet A: corroborates, adds more detail
- Outlet B: contradicts, cites different numbers
- Outlet C: same as Outlet A but from a known-biased source
- Outlet D (optional): satirical version that's obviously parody

Each snippet shows outlet logo, headline snippet, and a one-line bias indicator. Player 
taps each to see the full snippet. This teaches the reflex of "open a new tab and see 
who else is saying this" without leaving the game.

---
SCREEN 5d — Investigation Scene, TRACE THE CLAIM Phase

Fourth panel: "Where'd It Come From?" — a flow diagram (pixel-drawn arrows) showing the 
claim's origin:
- If the claim cites a statistic, shows the original study/report it references
- If it's a quote, shows the original context (full quote, not cherry-picked)
- If it's an image, shows metadata or reverse-image-search result (pixel mockup)

Player can tap each step to see the original source and spot where the chain breaks or 
gets twisted. This teaches "follow the claim upstream" as a concrete action.

---
SCREEN 6 — Claim Marking Panel (replaces simple "Misleading/Checks Out" popup)

After all four SIFT steps, player taps the original hotspot phrase again. A pixel modal 
appears with five marking options (not binary):

[ Checks Out ] — Accurate as stated
[ True But Biased ] — Factually accurate, but from a source with clear interest
[ True But Out of Context ] — Accurate, but missing important surrounding facts
[ Misleading ] — Technically true wording, but creates false impression
[ False ] — Factually incorrect / fabricated

Below the options: two pixel chips for reasoning (e.g. "No evidence," "Cherry-picked 
data," "Known conflict of interest," "Exaggerated language," "Missing context").

Player selects both a marking AND a reason chip before confirming. This forces articulation, 
not just button-clicking.

---
SCREEN 7 — Case File / Verdict (redesigned for calibration)

Left side: all marked claims shown as before. Right side: instead of simple "correct/
incorrect" tally, show three metrics:

*Accuracy*: % of claims marked correctly (standard score)
*Calibration*: Did you over-flag true things? Under-flag false things? A small pixel 
meter showing bias toward "paranoid" or "credulous" — with the goal being centered, not 
perfect (reflects real literacy research)
*Literacy Move*: One specific, transferable habit based on this case's misleading patterns:
  - If you missed a biased-source flag: "Next time: check the byline's past stories"
  - If you flagged true-but-misleading: "Next time: reverse-image-search, don't assume"
  - If you missed context: "Next time: click through links in the article"

On submit: large pixel stamp (green "CASE SOLVED" or red "CASE REOPENED"), plus The 
Editor's handwritten note explaining the case's central lesson in one sentence.

No Tips awarded for correct answers alone — Tips only awarded for correct reasoning. 
Player must match the claim-marking to the right reason chip to earn full credit.

---
SCREEN 8 — About / How This Works (new, mandatory)

Accessible from main menu. A pixel "Fact-Checker's Handbook" styled as a pinned document. 
Shows:
- The SIFT framework explained in 4 short paragraphs (one per step) with pixel 
  illustrations
- Credit line: "Built on the SIFT method (Mike Caulfield), IFLA Misinformation Checklist, 
  and News Literacy Project frameworks"
- One paragraph on what "calibration" means (why over-suspicion is also a failure mode)
- Links or a note: "Use this with a teacher or librarian for best results"

This legitimizes the game as an educational tool for schools/libraries and makes the 
pedagogy transparent.

---
SCREEN 9 — Calibration Profile (new persistent screen)

Accessible from the HUD or from a "My Stats" menu. Shows:
- Overall Accuracy % (cases solved correctly)
- Calibration Meter: a horizontal pixel gauge showing the player's bias toward 
  paranoia ←→ credulity, with the center "balanced" zone highlighted
- Literacy Habit Tracker: a pixel checklist of the transferable habits they've learned 
  across all solved cases (e.g. "✓ Checked source history," "✓ Cross-referenced claims," 
  "✓ Traced a quote to origin")
- Best Calibration Case: highlights a single case where their marking distribution was 
  most balanced

This makes media literacy a visible stat, not just a hidden score.

---
INVESTIGATION SCENE LAYOUT UPDATE (full Screen 5 flow)

The left-docked folder tabs remain. The right side now cycles through the four SIFT 
phases as the player progresses:
- Phase 1 (STOP): overlay message + continue button
- Phase 2 (INVESTIGATE): source credibility panel visible alongside article
- Phase 3 (FIND BETTER): lateral-reading snippet cards panel
- Phase 4 (TRACE): claim-origin flow diagram panel
- Final: hotspot is tappable, opens the five-option claim-marking modal

Each phase has a small pixel progress indicator (1/4, 2/4, 3/4, ready to mark) so the 
player knows where they are in the SIFT loop.

---
DELIVERABLE

Provide the following screens at both 844x390 mobile landscape and 1440x810 desktop 
landscape:

1. Screen 5a — Investigation with STOP overlay and SIFT step buttons
2. Screen 5b — Investigate the Source panel (show source credibility details)
3. Screen 5c — Find Better Coverage panel (show 3-4 lateral-reading snippet cards)
4. Screen 5d — Trace the Claim panel (show origin flow diagram)
5. Screen 6 — Claim marking modal (five options + reason chips)
6. Screen 7 — Case File / Verdict with Accuracy / Calibration / Literacy Habit feedback
7. Screen 8 — About / How This Works (SIFT explained)
8. Screen 9 — Calibration Profile / Habit Tracker
9. One small states legend showing default/pressed/disabled pixel button states

Also include a one-paragraph note explaining how each screen teaches a real media 
literacy skill (for handoff to the development team).