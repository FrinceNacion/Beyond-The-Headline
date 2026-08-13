Design UI screens for "Beyond the Headline" — a web-based, landscape mobile pixel-art 
game teaching media literacy via the SIFT framework. NOW WITH: integrated mini-games 
during investigation (no passive reading), story-driven campaigns with different narrative 
contexts, and character-driven progression instead of abstract "cases."

HACKATHON CONTEXT
- UNESCO Global MIL Hackathon
- Educational Framework: UNESCO MIL Competencies + pedagogically sound mini-games
- Target: Low-bandwidth, device-agnostic, fully playable in browser

STYLE RULES (existing system maintained)
- Pixel art only: hard edges, dithered shading, no emoji. Every visual custom to this 
  world.
- Palette: ink navy #14181C, #1D2328, manila/paper #EDE3CF, #DFD2B4, #C9BA96, muted 
  red #B7291E, brass #B08D57, dull green #2F6F4E.
- Type: bold irregular pixel display font (titles), clean small pixel font (body), 
  pixel monospace (HUD).
- All screens landscape: 844x390 mobile, 1440x810 desktop. Fully accessible, keyboard-
  navigable.

---
NEW SCREEN: Story Mode Selection (replaces simple "New Investigation" button)

After the landing screen, player chooses a story campaign. A pixel map of "The Fairview 
Valley" (a small town) shows three story acts as locked/unlocked regions:

ACT 1: "The Social Media Spiral" (5 cases)
- Focus: Social media echo chambers, bot networks, out-of-context screenshots
- NPC: Maya, a high school student investigating viral rumors about her school
- Visual theme: smartphone screens, screenshots, engagement metrics
- UNESCO focus: Source credibility, platform literacy, comparative analysis

ACT 2: "Election Season" (5 cases)
- Focus: Election disinformation, political deepfakes, targeted manipulation
- NPC: David, a local journalist covering city elections for the first time
- Visual theme: campaign posters, political ads, polling data, charts
- UNESCO focus: Propaganda recognition, bias evaluation, evidence chains

ACT 3: "The Health Crisis" (5 cases)
- Focus: Medical misinformation, conspiracy theories, false remedies
- NPC: Dr. Chen, a public health official responding to a health scare
- Visual theme: medical reports, social posts, "alternative health" claims, statistics
- UNESCO focus: Expert credibility, statistical literacy, fact-checking claims

Each story act is a pixel-illustrated region on the town map (e.g. "Social Media Spiral" 
is the high school district, "Election Season" is city hall, "Health Crisis" is the 
clinic). Tapping a region shows its act title, NPC portrait (small pixel bust), a one-
line story hook, and a "Start Act" button. Completed acts show a green "SOLVED" stamp.

This turns the game from "solve random cases" into "follow three interconnected 
investigations with recurring characters and narrative stakes."

---
REVISED SCREEN 5 — Investigation Scene with Mini-Games (four active phases, not passive)

The SIFT loop now includes a mini-game at each phase, breaking up reading:

---
PHASE 1: STOP — "Pause & Predict" Mini-Game

Same overlay as before (pause message), but now a small pixel quiz appears:
"Before reading further, guess: Is this claim likely true or misleading?" 
Two buttons: "Seems Real" / "Seems Fishy"

Player makes a snap judgment, commits it, then the game shows their snap-judgment 
accuracy at the end (teaches metacognition: "Was your gut right? Or did bias get you?"). 
This is gamified and quick (2-3 seconds), not text-heavy.

The guess doesn't affect scoring, but it's logged. High calibration comes from players 
whose snap judgments improve over time.

---
PHASE 2: INVESTIGATE THE SOURCE — "Build the Source Profile" Mini-Game

Instead of reading a static credibility panel, player plays a small pixel card-matching 
or drag-and-drop game:

Shown on left: four random attributes (outlet logo, founding year, bias indicator, 
funding source, past corrections, country).
Shown on right: four blank slots labeled "Who am I?"

Player drags/taps each attribute into the correct slot. For example:
- Logo: BBC
- Founded: 1922
- Bias: Center-left
- Funding: License fee (government-backed but independent editorial)

If they get it wrong, the game gives them a hint (e.g., "This outlet is British, not 
American"). Correct matching unlocks the source credibility readout.

This teaches: source research is active investigation, not passive reading. UNESCO 
competency: Source Credibility Assessment (made interactive).

---
PHASE 3: FIND BETTER COVERAGE — "Compare the Coverage" Mini-Game

Instead of static snippet cards, a small pixel Venn diagram or comparison grid appears:

Shown: four outlet coverage snippets. Player must identify which facts overlap, which 
contradict, and which are unique to one outlet.

For example:
- Outlet A says: "Tax increase approved 5-2"
- Outlet B says: "Tax increase approved, with community opposition"
- Outlet C says: "Council votes on controversial tax increase"
- Outlet D (satire): "Council approves MASSIVE tax grab to fund UFO research"

Player taps outlets to group them (A & B agree on core fact, C is vague, D is parody). 
Correct grouping reveals a pixel progress meter and unlocks the lateral-reading insights.

This teaches: comparison is how you spot bias and misinformation, not just reading one 
source. UNESCO competency: Cross-Source Verification (gamified).

---
PHASE 4: TRACE THE CLAIM — "Follow the Chain" Mini-Game

A pixel flow diagram appears with a visual puzzle:

The claim (e.g., "Study shows 87% of teens are addicted to social media") sits at the 
top. Below are 3-4 cards showing potential sources:
- Card A: Original study abstract (correct)
- Card B: Misquoted version on a news site
- Card C: Sensationalized headline
- Card D: False attribution ("Dr. Smith said..." but Dr. Smith never said this)

Player taps the correct origin card. If wrong, the game shows them why (e.g., "This site 
doesn't cite the study, just makes up a number"). Correct answer reveals the original 
source details and methodology.

This teaches: tracing claims upstream is how you catch fabrication. UNESCO competency: 
Evidence Chain Evaluation (made interactive).

---
SCREEN 6 — Claim Marking (unchanged from previous prompt, but now feels like the finale)

After all four mini-games, player marks the claim with five options + reasoning chips. 
This screen feels like the payoff, not busy-work, because they've actively 
investigated it already.

A small pixel animation plays on correct marking: a red pen circles the phrase and a 
"CHECK" stamp appears.

---
NEW SCREEN: Story Progression & Character Reactions

After each case (Screen 7 verdict), instead of just returning to map, show a brief 
character dialogue scene:

NPC (Maya, David, or Dr. Chen) reacts to the player's investigation:
- If high accuracy: "Great work. I checked your notes and you caught what I missed."
- If lower accuracy: "Hmm, I'm not sure about that one. Let me look again..."
- Character reveals how this case connects to the larger story: "This rumor is spreading 
  across three social media platforms now. We need to understand the network."

This is a short 1-2 frame pixel conversation (text + character portrait), 10 seconds 
max, then auto-closes or taps to continue. It makes the game feel narrative-driven, 
not mechanical.

Each act's three NPCs have distinct voices (Maya is direct and frustrated with her peers, 
David is methodical, Dr. Chen is urgent and worried), teaching that different roles 
approach fact-checking differently.

---
NEW SCREEN: Act Finale — "Break the Story" (end-of-story-arc screen)

After all 5 cases in an act are solved, a finale screen appears:

Pixel newspaper front-page mockup shows the main headline: "Social Media Network 
Spreading Misinformation Across Schools" (or equivalent for each act). 

The page shows:
- Byline: The NPC (Maya, David, or Dr. Chen)
- The story they broke, built from the player's investigation
- Small pixel portraits of the player's character and the NPC together on the byline 
  (acknowledging collaboration)
- A summary: "Key findings: [3-4 bullet points from the cases solved]"

This is the narrative payoff — the player helped publish a real investigation. They get 
a pixel badge ("Investigative Journalist" medal) and Tips bonus (larger than normal 
case reward).

This makes story progression visible and emotionally resonant.

---
NEW SCREEN: Campaign Overview

Accessible from main menu. Shows three story acts in a pixel timeline (horizontal 
track):

*ACT 1* [Completed ✓] → 5/5 cases solved, Maya's story published
*ACT 2* [In Progress] → 2/5 cases solved, David's investigation ongoing
*ACT 3* [Locked] → Unlocks after Act 2 complete

Each act shows:
- Progress bar (cases solved / total)
- Main NPC portrait and name
- One-line story hook
- Key UNESCO competencies taught in that act
- Estimated playtime (e.g., "40 minutes")
- Number of Tips available if completed

This gives players a sense of narrative progression, not just grinding random cases.

---
MINI-GAME INTERACTION DETAILS (pixel-art specific)

All mini-games use chunky 2-4 frame animations:
- Drag-and-drop source matching: cards slide into place with a satisfying "click" pixel 
  sound (visual only, no audio required)
- Venn diagram grouping: outlets glow with brass outlines when selected, overlap zones 
  light up when correct groupings made
- Claim-tracing: correct chain link highlights in green, wrong link briefly flashes red 
  before bouncing back
- All mini-games have a "Try Again" state (not a fail — players replay until they get 
  it, then move on) because this is learning, not scoring

Mini-games are timed gently (60-90 seconds per game, no hard fail) so they feel active, 
not rushed. A pixel hourglass or progress arc in corner shows time remaining.

---
NEW SCREEN: Mini-Game Difficulty Scaling (per story act)

Act 1 mini-games: simplified (source profile has obvious answers, comparison has clear 
contradictions)
Act 2 mini-games: intermediate (some sources are subtly similar, one outlet is deliberately 
misleading but sounds credible)
Act 3 mini-games: complex (multiple outlets make overlapping claims, statistics are 
cherry-picked in non-obvious ways)

This creates natural difficulty progression without changing the core mechanic.

---
UPDATED SCREEN 9 — Tracker now shows Story Progression

Personal stats now include:
- Acts completed: 1/3 (with NPC portraits and act titles)
- Mini-game performance: "Source Research" accuracy %, "Coverage Comparison" accuracy %, 
  "Claim Tracing" accuracy % (so players see which literacy skill they're strong/weak at)
- Story achievement: "Helped Maya break the social media rumor network" (pixel achievement 
  badge with NPC portrait)

Classroom mode (for teachers) now shows:
- Which story act the class is in
- Per-student mini-game accuracy (not just overall case accuracy)
- Class strength areas (e.g., "Great at source research, struggling with claim tracing")

---
STORY ACT EXAMPLES

*ACT 1: "The Social Media Spiral"* — NPC: Maya (high school student)
Case 1: Screenshot of a false college-rejection rumor on social media
Case 2: Bot network amplifying a fake safety alert
Case 3: Out-of-context image being shared as current event
Case 4: Echo chamber amplifying one outlet's biased framing
Case 5: Viral challenge with false health claim

*ACT 2: "Election Season"* — NPC: David (local journalist)
Case 1: Deepfake video of a city council candidate
Case 2: Selective polling data showing misleading lead
Case 3: Attack ad misquoting an opponent's statement
Case 4: Disproven rumor resurfacing during campaign
Case 5: Election-day misinformation about voting procedures

*ACT 3: "The Health Crisis"* — NPC: Dr. Chen (public health official)
Case 1: Alternative remedy claiming to prevent disease
Case 2: Misinterpreted medical study going viral
Case 3: Celebrity health advice contradicting public health guidance
Case 4: Conspiracy theory about vaccine ingredients
Case 5: Outdated medical information being circulated as current

Each story act has a different visual tone (social media reds/blues for Act 1, political 
reds/blues for Act 2, medical greens/yellows for Act 3), making it feel like three 
different games, not one repeated loop.

---
DELIVERABLE

Provide all screens at 844x390 mobile landscape and 1440x810 desktop landscape:

1. Story Mode Selection screen (three acts, NPC portraits, story hooks)
2. PHASE 1 mini-game: "Pause & Predict" snap-judgment quiz
3. PHASE 2 mini-game: "Build the Source Profile" card-matching/drag-drop
4. PHASE 3 mini-game: "Compare the Coverage" Venn diagram/grouping
5. PHASE 4 mini-game: "Follow the Chain" flow diagram puzzle
6. Claim Marking screen (aftermath of mini-games)
7. Character Reaction dialogue (post-case, NPC responds to player's investigation)
8. Act Finale screen (newspaper front-page with player's investigation published)
9. Campaign Overview (timeline showing all three acts, progress bars, story hooks)
10. Updated Tracker screen (story progression + mini-game accuracy breakdown)
11. One states legend showing mini-game interaction states (default, correct, incorrect, 
    in-progress)

Include visual notes explaining:
- How each mini-game maps to a UNESCO competency
- Why that mini-game format teaches better than reading (e.g., "drag-and-drop teaches 
  active source research, not passive credibility assessment")
- Difficulty scaling from Act 1 to Act 3
- How character dialogue creates narrative continuity
