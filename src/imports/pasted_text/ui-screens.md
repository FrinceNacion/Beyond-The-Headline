Design UI screens for "Beyond the Headline" — a web-based, landscape mobile pixel-art 
game teaching media and information literacy. Built to win a UNESCO Hackathon for MIL, 
this product teaches the UNESCO Media and Information Literacy (MIL) Competency Framework 
and is designed for global classroom adoption, accessibility, and impact measurement.

HACKATHON CONTEXT
- Target: UNESCO Global MIL Hackathon (Media and Information Literacy)
- Educational Framework: UNESCO MIL Competencies (2011 updated 2022) — specifically 
  competencies around source evaluation, critical thinking, and bias recognition
- Deployment: Free, open-source, playable in any browser on any device (no app store 
  gatekeeping), designed for use in classrooms, libraries, and informal learning spaces 
  in low-bandwidth regions
- Impact Metric: Measurable pre/post literacy gains, teacher dashboard for tracking 
  classroom cohorts, multilingual-ready architecture
- Judge Criteria: pedagogical rigor, cultural adaptability, scalability, accessibility, 
  open-source ethos

STYLE RULES (maintain existing system)
- Pixel art only: hard edges, dithered shading (3-4 tone ramps), no emoji, no flat 
  icon packs. Every visual is custom-drawn to this game's world.
- Palette: ink navy #14181C, #1D2328 (backgrounds), manila/paper #EDE3CF, #DFD2B4, 
  #C9BA96 (documents, cards), muted red #B7291E (flags, warnings), brass #B08D57 
  (progress, Tips), dull green #2F6F4E (verified).
- Type: bold irregular pixel display font (titles), clean small pixel font (body), 
  pixel monospace (HUD/labels).
- All screens landscape: 844x390 mobile, 1440x810 desktop. Responsive down to 320px 
  width (for low-end devices). Touch targets minimum 44x44px. Keyboard navigation 
  fully supported. Color-blind safe (no red-green reliance for core gameplay).

---
CORE MECHANIC — SIFT LOOP (tied to UNESCO MIL Competencies)

Each investigation case follows the four SIFT steps as distinct player actions. These 
map directly to UNESCO MIL Competencies:

STOP (Competency: Critical Evaluation)
→ Forced pause, teaches "don't react to headlines"
INVESTIGATE THE SOURCE (Competency: Source Credibility Assessment)
→ Check outlet/author history, funding, track record
FIND BETTER COVERAGE (Competency: Comparative Analysis, Cross-Source Verification)
→ Lateral-reading across multiple outlets
TRACE THE CLAIM (Competency: Evidence Chain Evaluation)
→ Follow facts upstream to origin

Only after completing all four steps can the player mark a claim with reasoned evidence.

---
SCREEN 5a — Investigation Scene, STOP Phase

Landscape split: left-docked folder tabs (Article, Social Post, Official Quote, Chart/
Statistic). Right side shows selected source. On case entry, a pixel overlay with a 
2-second pause message from The Editor (UNESCO framing): "Critical thinking starts with 
stepping back. Read everything before you decide."

Below: four pixel action buttons (Stop → Investigate → Find Better → Trace), progressing 
left-to-right. Only "Continue Reading" is clickable first. This beat installs the pause-
before-judgment habit, core to all media literacy education.

Top-right corner: a small pixel icon showing which UNESCO Competency is being taught 
this round (e.g. 🔍 Critical Evaluation), with a tooltip.

---
SCREEN 5b — Investigation Scene, INVESTIGATE THE SOURCE Phase

Source credibility panel slides in from right:
- Outlet logo, name, founding year, country of origin
- Editorial stance: neutral/center-left/right/sensationalist (UNESCO emphasizes 
  recognizing perspective bias, not assuming "neutral" exists)
- Corrections Track: "2 corrections in past 6 months" (teaches accountability and 
  institutional transparency)
- Author byline (if applicable): past stories, known affiliations, expertise areas
- Funding disclosure (if public): "Ad-supported," "Nonprofit," "Government-backed," 
  "Independent"
- One small pixel flag if the outlet has been flagged by fact-checkers (Snopes, PolitiFact, 
  etc.)

This teaches source credibility as a multidimensional skill, not a binary trust/distrust 
call — UNESCO MIL emphasizes nuanced evaluation over paranoia.

---
SCREEN 5c — Investigation Scene, FIND BETTER COVERAGE Phase

Lateral-reading panel: 3-4 snippet cards showing the same claim reported by different 
outlets:
- Outlet A: corroborates, adds detail
- Outlet B: contradicts, different emphasis
- Outlet C: same as A but from known-biased source (teaches recognizing echo chambers)
- Outlet D (optional): clearly satirical (teaches genre literacy)

Each snippet shows: outlet logo, bias indicator (Center/Left/Right/Sensational), and 
key-fact differences highlighted. This teaches the core reflex: "don't believe one source, 
look across outlets" — which is the single most effective inoculation against misinformation 
in research.

---
SCREEN 5d — Investigation Scene, TRACE THE CLAIM Phase

Claim-origin flow diagram (pixel-drawn arrows showing the chain):
- If statistic: original peer-reviewed study or report, publication date, methodology note
- If quote: original context (full quote, date, publication), showing if it's been cut 
  or misattributed
- If image: reverse-image-search mockup, original date, original caption vs. current caption

Player taps each link to expand. This teaches "follow the money" and "trace the source" — 
core investigative habits. UNESCO MIL emphasizes evidence chains; this visualizes it.

---
SCREEN 6 — Claim Marking Modal (with Reasoning Requirement)

After SIFT steps, player taps hotspot. Modal appears with five options (not binary):

[ Checks Out ] — Accurate as stated and in context
[ True But Biased ] — Accurate, but from interested source or with agenda
[ True But Out of Context ] — Accurate, missing crucial surrounding facts
[ Misleading ] — Technically true wording, creates false overall impression
[ False ] — Factually incorrect / fabricated / unsupported

Below: two mandatory reason chips. Player must select both a marking AND evidence before 
confirming. Options change per claim (e.g., "No original source," "Out-of-date statistic," 
"Exaggerated language," "Cherry-picked data," "Conflict of interest," "Missing attribution").

This forces metacognition — the player articulates why before confirming, which is key 
to retention and transfer. UNESCO research emphasizes reasoning-aloud as a literacy 
practice.

---
SCREEN 7 — Case File / Verdict (Redesigned for Calibration & Pedagogical Feedback)

Left: all marked claims. Right: three feedback sections:

*Accuracy Score*: % correct (standard metric for teachers)

*Calibration Meter*: A pixel gauge showing the player's bias toward paranoia ←→ 
credulity, with center zone "balanced" highlighted. UNESCO research shows over-suspicion 
is also a failure mode — this metric prevents that overcorrection.

*Literacy Move (Transferable Habit)*: One specific real-world action tied to this 
case's pattern:
- "Next time: click an author's byline to check their past coverage"
- "Next time: reverse-image-search before trusting a photo"
- "Next time: find the original source, not a quote about it"

These habits map to UNESCO competencies and are meant to transfer outside the game.

*UNESCO Competency Earned*: Small pixel badge showing which competency was reinforced 
(e.g., "Source Credibility Assessment," "Bias Recognition," "Evidence Evaluation").

On submit: large pixel stamp (green "CASE SOLVED" or red "CASE REOPENED"), plus The 
Editor's note explaining the key learning in one sentence.

Tips are earned only for correct reasoning (marking + chip), not just correct answers — 
this rewards deliberation over guessing.

---
SCREEN 8 — About / Educational Framework (UNESCO-Aligned, for Teachers & Judges)

A pixel "Fact-Checker's Handbook" styled as a pinned document. Contains:

*The SIFT Framework*: Four paragraphs (Stop / Investigate / Find Better / Trace) with 
pixel illustrations, sourced to Mike Caulfield's research.

*UNESCO MIL Alignment*: Explicit mapping showing which game screens teach which UNESCO 
competencies (Source Evaluation, Bias Recognition, Evidence Chain, Comparative Analysis).

*Pedagogy*: One paragraph on why five-state marking (not binary) matters, why 
calibration tracking matters, why reasoning-before-reveal matters.

*Open Pedagogy*: Statement: "This game is free and open-source. It's designed for use 
in classrooms, libraries, and community spaces globally. Teachers can export class 
scores and track student progress."

*Credits*: "Built on the SIFT method (Mike Caulfield), UNESCO Media and Information 
Literacy Competency Framework (2022), News Literacy Project, IFLA Misinformation 
Checklist, and research from Stanford's History Lab and MIT Media Lab."

This signals to hackathon judges that the game is built on recognized frameworks, not 
invented pedagogy.

---
SCREEN 9 — Calibration & Competency Tracker (Personal & Classroom)

Accessible from HUD. Shows:

*Personal Stats*:
- Overall Accuracy % (cases solved correctly)
- Calibration Meter (paranoid ←→ credulous, goal is center)
- Competency Badges Earned (pixel badge grid): "Source Credibility," "Bias Recognition," 
  "Evidence Chain," "Cross-Source Verification," etc.
- Habit Tracker: checkmarks for real-world practices learned (reverse-image-search, 
  checking bylines, finding originals, etc.)

*Classroom Mode* (if accessed by teacher):
- Class cohort stats: average accuracy, calibration spread, which competencies the class 
  is strongest/weakest at
- Individual student cards (anonymized if desired): their score, calibration, badges, 
  habits learned
- Export button: CSV of class data for integration with school learning management systems
- Teacher notes: space to add context (e.g., "Taught SIFT in class before playing") for 
  research purposes

This makes media literacy a measurable, trackable skill — critical for hackathon judges 
assessing "impact potential" and "teachability."

---
SCREEN 10 — Settings / Accessibility & Localization (Hackathon Judge Signal)

Accessible from main menu. Shows:

*Accessibility*:
- Text size: three pixel-font size options
- Color blind mode: swap red/green for red/blue or colorblind-safe palette
- Keyboard-only mode: confirm all navigation works without touch
- Screen reader support: tested with NVDA/JAWS (note in UI)

*Localization*:
- Language selector: English, Spanish, French, Simplified Chinese, Arabic (show flags, 
  not emoji)
- Note: "This game was built for global classrooms. Help translate it to your language: 
  [link to crowdsourcing platform]"
- RTL support (for Arabic, Hebrew) built in

*Data & Privacy*:
- Statement: "No student data is collected without explicit classroom teacher consent."
- Export/delete option: "Download all your data as a .json file or delete your account."
- Open data research: "Opt in to anonymized, aggregated gameplay data to help improve 
  media literacy research globally."

This signals to judges that the game is designed for real-world deployment in classrooms, 
with privacy-first and accessibility-first thinking — key UNESCO values.

---
SCREEN 11 — Teacher Dashboard (optional, for full-suite submission)

If submitting as a complete educational product (not just the game), include a 
teacher-facing screen showing:
- Class roster + individual student accuracy/calibration/badges
- Pre/post literacy assessment integration (link to external MIL assessment tool, 
  import scores)
- Lesson plan template: "How to use this game in your classroom" (5-day unit plan 
  provided)
- Research collaboration: "Share anonymized class data with media literacy researchers" 
  toggle

This turns a game into a full educational platform, which judges value highly.

---
HACKATHON-SPECIFIC DESIGN NOTES (for handoff)

*Open Source Readiness*:
- All assets (pixel art, fonts, code) are licensed CC-BY-SA or MIT
- GitHub repo structure is clear for community contributions
- Contribution guide for translators, educators, designers

*Measurable Impact*:
- Pre/post literacy gain tracking (import/export compatible with Qualtrics, SurveyMonkey)
- Gamification is evidence-based (badges for real competencies, not vanity rewards)
- Case design uses real misinformation examples (with permission from fact-checkers)

*Global Accessibility*:
- Designed for 3G connectivity and low-end devices (minimal asset sizes, no required 
  plugins)
- Language/cultural adaptability documented (cases can be re-themed for local contexts)
- Tested on Android budget phones and older browsers

*UNESCO Alignment*:
- Every screen reference to which UNESCO MIL Competency it teaches
- Educational outcomes are measurable (not fuzzy)
- Teacher/librarian adoption pathway is documented

---
DELIVERABLE

Provide all 11 screens above at both 844x390 mobile landscape and 1440x810 desktop 
landscape:

1. Screen 5a — STOP phase with UNESCO competency icon
2. Screen 5b — INVESTIGATE THE SOURCE panel with credibility indicators
3. Screen 5c — FIND BETTER COVERAGE with lateral-reading snippets
4. Screen 5d — TRACE THE CLAIM with origin-chain flow diagram
5. Screen 6 — Claim marking modal (five options + reason chips)
6. Screen 7 — Verdict with Accuracy / Calibration / Literacy Move / UNESCO Badge
7. Screen 8 — About / Educational Framework (UNESCO-aligned)
8. Screen 9 — Personal & Classroom Competency Tracker
9. Screen 10 — Settings / Accessibility & Localization
10. Screen 11 — Teacher Dashboard (if included)
11. One states legend showing pixel button states

Include a one-page "UNESCO MIL Alignment Summary" as a text overlay, mapping each screen 
to specific UNESCO competencies and expected learning outcomes.
