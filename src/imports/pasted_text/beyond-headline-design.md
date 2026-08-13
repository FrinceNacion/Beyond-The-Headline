Design a complete, web-based, landscape mobile game application: "Beyond the Headline." 
The player is a journalist fact-checker who investigates news stories by digging through 
real source material — articles, social posts, official quotes — and must correctly 
identify which specific claims or details are misleading. This is a hidden-object 
investigation game (like Criminal Case) rendered in the mood and craft of indie pixel 
games like Papers Please, Return of the Obra Dinn, and Night in the Woods.

STYLE RULES (apply to every screen)
- Pixel art only: hard pixel edges, dithered shading (3-4 tone ramps), no gradients, 
  no drop shadows, no anti-aliasing, no soft glows.
- No emoji, no flat icon-pack graphics. Every icon (lock, pin, stamp, badge, coin, 
  avatar) is a small custom hand-drawn pixel illustration with its own shading, unique 
  to this game's world.
- Animations, where shown, are chunky 2-4 frame sequences, never smooth or eased.
- Palette: ink navy/charcoal #14181C and #1D2328 (backgrounds), manila/paper #EDE3CF, 
  #DFD2B4, #C9BA96 (documents, cards), muted red #B7291E (string, flags, warnings), 
  worn brass #B08D57 (progress, currency, highlights), dull green #2F6F4E (confirmed 
  states).
- Type: bold, slightly irregular pixel display font for titles; clean small pixel font 
  for body text; pixel monospace for HUD numbers/labels.

FORMAT
Real, fully working game app, landscape orientation throughout — build every screen at 
a 844x390 mobile landscape frame first, then a 1440x810 desktop frame with the same 
canvas centered on a dithered letterbox background. Every button, tab, and icon must be 
clearly labeled as an interactive element (for prototyping/handoff), with default, 
pressed, and disabled pixel states shown at least once in a states legend.

CURRENCY
In-game currency is called "Tips" — pixel coin/stamp-token icon in brass. Tips are 
earned by correctly flagging misleading claims and spent in the Shop. Persistent Tips 
counter with coin icon lives in the top HUD on every screen after the tutorial.

---
SCREEN 1 — Loading Screen
Full-bleed dithered ink-navy background. Center: custom pixel game logo lockup for 
"BEYOND THE HEADLINE" (torn newspaper masthead style). Below it, a pixel loading bar 
styled as a filling ink-stamp meter, with a rotating line of flavor text underneath 
(e.g. "Cross-checking sources...", "Sharpening red pens...") in the small pixel font.

SCREEN 2 — Landing / Title Screen
Same masthead logo, smaller, top of frame. Below: a pixel-illustrated scene of a dim 
desk with a typewriter, coffee, and a corkboard glimpsed in the background. Three 
full-width pixel buttons stacked: "Continue Case," "New Investigation," "Settings." 
Small pixel Tips counter and a "Shop" button (pixel shopping-bag/briefcase icon) in 
the top corner.

SCREEN 3 — Tutorial Dialogue Overlay
Overlay usable on any screen. Bottom-third dialogue box in manila-paper pixel style, 
left side shows a small pixel portrait bust of a mentor character ("The Editor" — an 
older, tired-looking pixel-art senior journalist, hand-shaded, not a generic avatar). 
Right side of box: dialogue text in the pixel body font, a blinking pixel "▼ tap to 
continue" indicator, and a "Skip Tutorial" text button top-right of the overlay. Show 
one example line, e.g. "Every story's got holes. Your job's to find 'em before they 
find your readers. Don't invent a headline — find what's already wrong."

SCREEN 4 — Community Map (home/level-select screen)
A small pixel-illustrated town map, viewed from a light isometric or top-down angle — a 
community the player investigates over time: a bakery, city hall, a market, a newspaper 
office, a police station, a school. Each building is a hand-drawn pixel structure acting 
as a level node, with a small case tag and pin above it. Locked buildings: desaturated 
+ custom padlock sprite. Completed buildings: pixel "SOLVED" stamp flag on the roof. 
Current active building: 2-frame brass glow outline. A faint pixel path (dirt road or 
red string) connects the buildings in the order they unlock. Top HUD: pixel detective 
badge + rank, Tips counter, Shop button, Settings button — all reachable one-handed in 
landscape.

SCREEN 5 — Investigation Scene (landscape, left-docked evidence folders)
Landscape split layout: a vertical stack of folder tabs docked to the LEFT edge of the 
screen, styled as physical pinned folder tabs sticking out — "Article," "Social Post," 
"Official Quote" — each with a small pixel icon (paper, phone, quote-card) and label, 
selected tab highlighted and pushed slightly left/forward. The main content area fills 
the right ~75% of the screen, showing the selected source in full:
- Article view: paper texture, body text, several tappable hotspot phrases underlined 
  in hand-drawn red pencil — some are misleading claims, some are red herrings that turn 
  out accurate on inspection.
- Social Post view: custom pixel mockup of a fictional app post — hand-drawn avatar 
  portrait, pixel UI chrome, blocky engagement numbers, one or two tappable hotspots.
- Official Quote view: pixel index card, attributed quote, small source portrait, one 
  tappable hotspot.
Tapping a hotspot doesn't just "collect" it — it opens a small pixel popup where the 
player marks that specific claim as "Misleading" or "Checks Out," with a brief 
one-line reason picked from 2-3 pixel-styled option chips (e.g. "No source given," 
"Exaggerates the facts," "Missing context"). Bottom-anchored Evidence Tray spans under 
the content area: a fixed row of pixel tag slots showing each marked claim with a small 
red flag or green check icon. Top-right corner: Tips counter and a "Hint" power-up 
button (magnifying glass icon, shows its Tips cost).

SCREEN 6 — Case File / Verdict
Custom pixel manila folder filling the landscape frame. Left half: every claim the 
player flagged across all three sources, listed as small pixel evidence cards, each 
showing the claim's source icon, a snippet of the actual text, and the player's 
"Misleading" or "Checks Out" call as a small stamped icon next to it. Right half: a 
summary readout — how many calls were correct, which misleading claims were missed 
(shown only after submitting), and which flags were false alarms. On submit: a large 
angled pixel rubber-stamp sprite mid-impact — "CASE SOLVED" (green) or "CASE REOPENED" 
(red, if too many misses) — plus a handwritten-style pixel note from The Editor 
explaining what gave the misleading claims away (e.g. unverified sourcing, exaggerated 
language, missing context, fabricated detail), and a small "+Tips earned" pixel counter 
animation scaled to accuracy. Bottom-right "Case Closed" button returns to the 
Community Map.

SCREEN 7 — Shop (power-ups)
Styled as a detective's supply cabinet / evidence locker, pixel-illustrated shelving 
background. Grid of 4-6 purchasable power-up cards, each a pixel item icon + name + 
Tips price + short effect line, e.g.:
- "Magnifying Glass" — reveals the location of one unflagged hotspot
- "Second Source" — lets you re-check one claim's verdict before final submit
- "Fresh Coffee" — adds extra time on timed cases
- "Red Pen" — briefly highlights all remaining hotspots on the current source
Each card has a pixel "Buy" button that shows a disabled/"Owned" state once purchased. 
Top HUD keeps the Tips counter visible and updating.

---
DELIVERABLE
All seven screens above, each shown at 844x390 landscape mobile and 1440x810 landscape 
desktop, plus one small states legend showing default/pressed/disabled pixel button 
states used throughout.