ADDENDUM PROMPT — "Beyond the Headline" (adds to existing style system)

Keep all previously established STYLE RULES, palette, typography, and pixel-art 
constraints (no emoji, no flat icons, dithered shading, hard pixel edges, chunky 
2-4 frame animation). This prompt adds: a story prologue, per-level story briefings 
with star ratings and missions, and a side-character commentary system.

---
1. STORY PROLOGUE (before first play)

A short text-based story sequence shown once, before the player ever reaches the 
Community Map, establishing why they're investigating this town.
- Format: a sequence of 4-6 full-screen pixel "story panels," each pairing a small 
  static pixel illustration (top half) with a block of narrative text (bottom half) 
  in the pixel body font, styled like pages from a case dossier being read aloud
- Each panel advances with a tap/click and a pixel "▶" indicator, same tap-to-continue 
  language as the tutorial dialogue
- Suggested beat structure: (1) establishing shot of the town at dusk, text sets the 
  scene, (2) a torn newspaper clipping pixel graphic, text explains a wave of 
  misleading stories has been spreading, (3) introduce The Editor pixel portrait, 
  text is their voice recruiting the player, (4) introduce the player's own pixel 
  detective sprite/badge being issued, (5) final panel transitions into the Community 
  Map with a "Begin Investigation" pixel button
- Visual treatment should feel like flipping through a case file, not a cutscene — 
  a subtle pixel page-turn transition (2-3 frames) between panels
- Include a "Skip Story" text button, top-right, consistent with tutorial skip

---
2. PER-LEVEL STORY BRIEFING (before each case)

A short briefing screen shown before entering the Investigation Scene for a new 
building/case on the Community Map, replacing a hard jump-cut into gameplay.
- Layout: a pixel case-folder opening animation (2-3 frames) revealing a briefing 
  card — case number, case title, a 2-4 sentence text-based setup written in The 
  Editor's voice (e.g. "Word's going around that the bakery fire was worse than it 
  looked. Get in there and find out what's true.")
- Below the briefing text, a MISSION panel listing 2-3 concrete objectives for this 
  case as a pixel checklist, e.g.:
  - "Flag every misleading claim in the Article"
  - "Cross-check the Social Post against the Official Quote"
  - "Finish with zero false flags"
- A STAR RATING preview: three pixel star-slot icons (unfilled outlines pre-case), 
  with a small caption explaining how stars are earned, e.g. "★ Find all misleading 
  claims  ★ No false flags  ★ Finish without a hint"
- A full-width "Start Investigation" pixel button at the bottom
- On the Case File/Verdict screen (previously Screen 6), add the star-rating payoff: 
  1-3 pixel stars fill in with a chunky pop animation based on how many mission 
  conditions were met, matching the promise made on the briefing screen
- On the Community Map, completed level nodes now show their earned star count 
  (1-3 small pixel stars) beneath the "SOLVED" stamp, so players can see at a glance 
  which cases they could replay for a better rating

---
3. SIDE CHARACTER — TENSION/HEARSAY COMMENTARY

Introduce a second recurring character distinct from The Editor: a gossipy, unreliable 
townsperson who pops in during Investigation Scenes with color commentary — deliberately 
NOT trustworthy, reinforcing the game's theme that hearsay isn't evidence.
- Character concept: a small pixel portrait bust (hand-shaded, distinct silhouette from 
  The Editor — e.g. younger, restless posture, always mid-gesture) named something like 
  "Rumor" or "The Regular" — a townsperson who's always got a theory
- Appears in a small corner dialogue bubble (not the full bottom-third tutorial box) 
  during Investigation Scenes — a compact pixel speech-bubble anchored near their 
  portrait icon, bottom-left corner, so it doesn't block the evidence tabs or tray
- Triggers at set moments: when a hotspot is first revealed, when the player flags 
  something, or on a timer during idle moments — always optional flavor, never blocking 
  input
- Dialogue is written as unverified, tense, or leading commentary the player should be 
  skeptical of, e.g. "I heard the owner's been dodging inspectors for months..." or 
  "My cousin says it's way worse than they're letting on." — lines that mirror the 
  misleading-claim patterns the player is learning to spot, so the character becomes a 
  living example of the game's theme
- Include a small dismiss control (tap the bubble or a pixel "x") so players can clear 
  it without it blocking the scene
- On the Case File/Verdict screen, consider one closing note where The Editor explicitly 
  contrasts a Rumor comment against the evidence, e.g. "Rumor said dodging inspectors. 
  The record says one routine violation, fixed in 48 hours. That's the difference 
  between gossip and reporting." — ties the character directly back to the mission

---
ADDITIONAL SUGGESTIONS TO CONSIDER (not required, worth discussing)

- Story continuity thread: let the prologue's mystery (why misleading stories are 
  spreading through this specific town) pay off as a light overarching plot — maybe 
  Rumor turns out to be an unwitting source of the spread, revealed in a late-game 
  briefing, giving the star/mission structure a narrative payoff beyond scoring
- Branching Editor reactions: vary The Editor's verdict-screen commentary based on star 
  count (terse and disappointed at 1 star, warm and approving at 3), so the same 
  character arcs across the whole playthrough rather than repeating one line
- Mission variety per case: rotate which of the three star conditions apply per case 
  (some cases reward speed, some reward zero false flags, some reward finding every 
  claim without hints) so missions don't feel like the same checklist repeated 8-10 
  times
- Rumor as a soft difficulty signal: on harder cases, give Rumor more lines and more 
  convincing-sounding (but still wrong) theories, so late-game cases train sharper 
  skepticism than early ones
- A small "Sources vs. Rumors" journal/codex, unlocked after a few cases, where players 
  can revisit past Rumor lines next to the real verdicts — turns the mechanic into a 
  standalone teaching artifact, reinforcing media literacy beyond the moment-to-moment 
  gameplay