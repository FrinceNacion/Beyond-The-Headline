/* Per-case material for the SIFT phases.

   INVESTIGATE  -> outlet + author profile (credibility as a multidimensional
                   read, never a trust/distrust switch)
   FIND BETTER  -> lateral-reading snippets from other outlets, including one
                   echo-chamber repost and, where it fits, one satirical page
   TRACE        -> the evidence chain back to the original document
   CHART        -> the underlying statistic as an exhibit, with provenance */

import type { CompetencyId } from "./mil";

export type Stance = "Center" | "Left" | "Right" | "Sensational" | "Satire" | "Official";

export type OutletProfile = {
  name: string;
  founded: string;
  country: string;
  stance: Stance;
  stanceNote: string;
  corrections: string;
  funding: string;
  /** pixel mark for this outlet — print masthead, platform block or official seal */
  logo?: string;
  /** flagged by an external fact-checking body */
  flagged?: string;
  author: {
    name: string;
    beat: string;
    history: string;
    affiliation: string;
    /** past bylines, revealed by tapping the byline row */
    stories?: string[];
    /** the conflict a reader would want declared, in plain words */
    conflict?: string;
  };
};

export type Snippet = {
  outlet: string;
  bias: Stance;
  relation: "corroborates" | "contradicts" | "echo" | "satire";
  headline: string;
  body: string;
  /** the fact that differs from the case's article — the whole point of the panel */
  keyFact: string;
};

export type TraceStep = {
  label: string;
  detail: string;
  date: string;
  /** what changed between this link and the next one downstream */
  drift?: string;
};

export type Trace = {
  kind: "statistic" | "quote" | "image";
  claim: string;
  steps: TraceStep[];
  verdictNote: string;
};

export type ChartExhibit = {
  title: string;
  source: string;
  note: string;
  unit: string;
  bars: { label: string; value: number; highlight?: boolean }[];
  /** the honest reading of the same numbers */
  reading: string;
};

export type SiftData = {
  outlet: OutletProfile;
  coverage: Snippet[];
  trace: Trace;
  chart: ChartExhibit;
  competency: CompetencyId;
  /** the transferable habit this case drills */
  habit: string;
  /** "Next time:" line shown on the verdict screen */
  literacyMove: string;
};

export const SIFT: Record<string, SiftData> = {
  /* ------------------------------------------------------------ bakery */
  bakery: {
    outlet: {
      name: "THE ROSEWOOD LEDGER",
      founded: "founded 1931",
      country: "Rosewood, local",
      stance: "Center",
      stanceNote: "Local paper of record. Reports council and courts; little national coverage.",
      corrections: "2 corrections in the past 6 months, both printed on page 2",
      funding: "Ad-supported, reader subscriptions",
      author: {
        name: "M. Alvarez",
        beat: "City desk — health, licensing, small business",
        history: "141 bylines; covered the 2023 water-main story that won a state award",
        affiliation: "No disclosed affiliations",
        stories: [
          "“Water Main Repairs Ran 400% Over Budget” — Aug 2023",
          "“Two Fourth St. Premises Cited, Both Reopened” — Nov 2024",
          "“Health Dept. Publishes Inspection Scores Online” — Jan 2025",
        ],
        conflict: "None declared. Has previously reported critically on the same health department, which cuts against a cosy-relationship reading.",
      },
    },
    coverage: [
      {
        outlet: "ROSEWOOD LEDGER",
        bias: "Center",
        relation: "corroborates",
        headline: "Beloved Bakery Under Fire After Inspection",
        body: "Three violations recorded, all classified minor. Follow-up inspection passed on March 19.",
        keyFact: "Names the inspection date and the follow-up result.",
      },
      {
        outlet: "COUNTY HEALTH BULLETIN",
        bias: "Official",
        relation: "contradicts",
        headline: "March Inspection Round: 14 Premises, 2 Closures",
        body: "Rosewood Bakery is not among the premises subject to closure or restriction this cycle.",
        keyFact: "The bakery never appears on the closure list at all.",
      },
      {
        outlet: "ROSEWOOD WATCH (blog)",
        bias: "Sensational",
        relation: "echo",
        headline: "THEY SHUT IT DOWN AND NOBODY TOLD YOU",
        body: "Reposts the viral thread word for word, adds a stock photo of a different bakery.",
        keyFact: "No new reporting — it is the same claim, repeated louder.",
      },
      {
        outlet: "THE FOURTH STREET ONION",
        bias: "Satire",
        relation: "satire",
        headline: "Rat Named Employee of the Month, Says Nobody",
        body: "Clearly labelled satire in the site footer. Shared 900 times without the label.",
        keyFact: "Genre check: this is a joke page, not a source.",
      },
    ],
    trace: {
      kind: "statistic",
      claim: "“Failed its city health inspection last month”",
      steps: [
        {
          label: "ORIGINAL DOCUMENT",
          detail: "Rosewood Health Dept. inspection report #4471 — 3 violations, all graded MINOR/CORRECTABLE",
          date: "12 MAR",
        },
        {
          label: "FOLLOW-UP RECORD",
          detail: "Re-inspection #4506 — all items cleared, premises PASS, no restrictions",
          date: "19 MAR",
          drift: "The follow-up exists but is missing from every version of the story downstream.",
        },
        {
          label: "LEDGER ARTICLE",
          detail: "Reports the failure and the follow-up, but leads with the failure",
          date: "26 MAR",
          drift: "Accurate; the emphasis does the damage.",
        },
        {
          label: "VIRAL POST",
          detail: "“Shut down by the health department” + “rat infestation in the flour store”",
          date: "28 MAR",
          drift: "Neither claim appears in any document. This is where the story stops being true.",
        },
      ],
      verdictNote: "Two links back, the record is dull and specific. Four links downstream, it is a rat.",
    },
    chart: {
      title: "ROSEWOOD BAKERY — INSPECTION VIOLATIONS BY GRADE",
      source: "Rosewood Health Dept. open data portal, FY2024",
      note: "Minor violations are the most common outcome across every premises in the county.",
      unit: "violations",
      bars: [
        { label: "MINOR", value: 3, highlight: true },
        { label: "MAJOR", value: 0 },
        { label: "CRITICAL", value: 0 },
        { label: "CLOSURE", value: 0 },
      ],
      reading: "Three minor, zero critical, zero closures — the same numbers the post called an infestation.",
    },
    competency: "source",
    habit: "original",
    literacyMove: "Next time: find the original inspection record, not the post about it.",
  },

  /* ---------------------------------------------------------- cityhall */
  cityhall: {
    outlet: {
      name: "ROSEWOOD LEDGER — CIVIC DESK",
      founded: "founded 1931",
      country: "Rosewood, local",
      stance: "Center",
      stanceNote: "Endorses no candidates. Council coverage is dense and lightly read.",
      corrections: "1 correction in the past 6 months (a misspelled ward name)",
      funding: "Ad-supported, reader subscriptions",
      author: {
        name: "T. Boone",
        beat: "Local government, budgets, procurement",
        history: "Nine years on the council beat; publishes the raw minutes alongside stories",
        affiliation: "Spouse works for the county library service — disclosed in the byline note",
        stories: [
          "“Council Minutes, Annotated: The Procurement Vote” — Feb 2025",
          "“What the Parks Line Actually Pays For” — Sep 2024",
          "“Three Departments, One Budget Code” — May 2024",
        ],
        conflict: "Household income from a county service that appears in the same budget document. Disclosed, and the library line is not in this story.",
      },
    },
    coverage: [
      {
        outlet: "ROSEWOOD LEDGER",
        bias: "Center",
        relation: "corroborates",
        headline: "Council Approves Merged Services Budget",
        body: "The line rose from $1.1m to $2.2m after two departments were folded into one budget line.",
        keyFact: "Explains why the number doubled: two lines became one.",
      },
      {
        outlet: "STATE TRIBUNE",
        bias: "Right",
        relation: "contradicts",
        headline: "Small Town Doubles Spending As Residents Struggle",
        body: "Cites the same $2.2m figure with no mention of the merger of the two departments.",
        keyFact: "Same number, merger omitted. The omission is the story.",
      },
      {
        outlet: "@ROSEWOODTRUTH",
        bias: "Sensational",
        relation: "echo",
        headline: "THEY VOTED THEMSELVES A RAISE AT 11PM",
        body: "Screenshot of the Tribune headline with red arrows drawn on.",
        keyFact: "No new sourcing; the arrows are the only addition.",
      },
    ],
    trace: {
      kind: "statistic",
      claim: "“The budget line doubled”",
      steps: [
        {
          label: "ORIGINAL DOCUMENT",
          detail: "Appropriation Ordinance 24-118, Schedule B — Parks and Facilities merged into one line",
          date: "04 FEB",
        },
        {
          label: "PUBLIC MINUTES",
          detail: "Recorded vote 6-1 in open session, 7:05pm, minutes posted next morning",
          date: "04 FEB",
          drift: "The “11pm vote” has no basis in the minutes.",
        },
        {
          label: "LEDGER ARTICLE",
          detail: "Reports the doubling and the merger together",
          date: "06 FEB",
        },
        {
          label: "STATE TRIBUNE",
          detail: "Reports the doubling only",
          date: "09 FEB",
          drift: "One clause removed converts an accounting change into a scandal.",
        },
      ],
      verdictNote: "Nothing was fabricated here. A true number was separated from the sentence that explained it.",
    },
    chart: {
      title: "PARKS + FACILITIES BUDGET LINES",
      source: "Rosewood appropriation ordinances 23-090 and 24-118",
      note: "Read the two prior-year lines together before comparing to this year.",
      unit: "$ thousands",
      bars: [
        { label: "FY23 PARKS", value: 640 },
        { label: "FY23 FACILITIES", value: 505 },
        { label: "FY24 MERGED", value: 1180, highlight: true },
      ],
      reading: "640 + 505 = 1,145 last year against 1,180 this year — a 3% rise, not a doubling.",
    },
    competency: "chain",
    habit: "denominator",
    literacyMove: "Next time: ask what a number is being compared against before you call it a jump.",
  },

  /* ------------------------------------------------------------ market */
  market: {
    outlet: {
      name: "FOURTH ST. DAILY",
      founded: "founded 2019",
      country: "Rosewood, hyperlocal",
      stance: "Sensational",
      stanceNote: "Traffic-funded neighbourhood site. Headlines run hotter than the copy underneath.",
      corrections: "0 corrections published; no corrections policy on the site",
      funding: "Ad-supported, programmatic; sponsored posts unlabelled",
      flagged: "Flagged twice by regional fact-checkers for uncaptioned stock imagery",
      author: {
        name: "unsigned",
        beat: "—",
        history: "No byline. Site publishes 20+ posts a day with no named staff",
        affiliation: "Ownership not disclosed on the site",
        stories: [
          "No byline to follow — the archive lists no authors at all",
          "Same-day posts on the market, a bus route and a celebrity divorce",
          "Contact page is a web form; no editor, no phone, no address",
        ],
        conflict: "Unknowable, which is itself the finding. You cannot check the interests of a writer who has no name.",
      },
    },
    coverage: [
      {
        outlet: "FOURTH ST. DAILY",
        bias: "Sensational",
        relation: "corroborates",
        headline: "Six Dollar Tomatoes At The Market",
        body: "Photograph of a single heirloom crate priced per item, cropped tight.",
        keyFact: "The crate beside it, at $2/lb, is outside the crop.",
      },
      {
        outlet: "COUNTY AGRICULTURE INDEX",
        bias: "Official",
        relation: "contradicts",
        headline: "Weekly Produce Price Index — Week 14",
        body: "Median tomato price at Fourth St. Market: $2.10/lb, unchanged in real terms since 2023.",
        keyFact: "The median is a tenth of the headline price.",
      },
      {
        outlet: "ROSEWOOD LEDGER",
        bias: "Center",
        relation: "corroborates",
        headline: "Specialty Produce Prices Rise As Stalls Diversify",
        body: "Notes heirloom varieties priced per item while staples stay flat.",
        keyFact: "Distinguishes specialty pricing from staple pricing.",
      },
      {
        outlet: "@BARGAINWATCH",
        bias: "Sensational",
        relation: "echo",
        headline: "PENSIONERS PRICED OUT OF THEIR OWN MARKET",
        body: "Same photograph, new caption, no visit to the market.",
        keyFact: "One photo is now carrying three separate claims.",
      },
    ],
    trace: {
      kind: "image",
      claim: "The photograph of the $6 tomatoes",
      steps: [
        {
          label: "REVERSE IMAGE SEARCH",
          detail: "Earliest instance: stall's own social account, captioned “heirloom crate, $6 each, limited”",
          date: "11 APR",
        },
        {
          label: "ORIGINAL CAPTION",
          detail: "“Heirloom crate, $6 each” — a per-item price for a specialty variety",
          date: "11 APR",
          drift: "The word “heirloom” is cropped out of every later version.",
        },
        {
          label: "FOURTH ST. DAILY",
          detail: "Re-published cropped, captioned “tomatoes at the market”",
          date: "13 APR",
          drift: "Crop plus caption change turns one crate into the whole market.",
        },
      ],
      verdictNote: "The photograph never lied. The caption did.",
    },
    chart: {
      title: "TOMATO PRICES AT FOURTH ST. MARKET",
      source: "County Agriculture Index, week 14",
      note: "Specialty items are priced per unit; staples are priced per pound.",
      unit: "$ per lb equivalent",
      bars: [
        { label: "STAPLE", value: 2.1 },
        { label: "ORGANIC", value: 3.4 },
        { label: "HEIRLOOM", value: 6.0, highlight: true },
        { label: "COUNTY MEDIAN", value: 2.3 },
      ],
      reading: "One bar out of four is the headline. The other three are what people actually buy.",
    },
    competency: "compare",
    habit: "reverse",
    literacyMove: "Next time: reverse-image-search a photo and read its original caption.",
  },

  /* -------------------------------------------------------- newsoffice */
  newsoffice: {
    outlet: {
      name: "THE ROSEWOOD LEDGER",
      founded: "founded 1931",
      country: "Rosewood, local",
      stance: "Center",
      stanceNote: "The paper investigating itself. Read this one with the same suspicion you'd give anyone else.",
      corrections: "2 corrections in the past 6 months; corrections policy published since 1998",
      funding: "Ad-supported, reader subscriptions, one local trust grant (disclosed)",
      author: {
        name: "M. Odell",
        beat: "Editor — writing on her own newsroom",
        history: "22 years in the chair; wrote the paper's corrections policy",
        affiliation: "Direct conflict of interest: she runs the desk under scrutiny. Disclosed in paragraph one.",
        stories: [
          "“Our Corrections Policy, And Why It Changed” — Mar 2021",
          "“The Ledger's Owners, Listed In Full” — Jan 2024",
          "“We Got The Ferry Closure Wrong” — Jun 2024",
        ],
        conflict: "She is investigating her own newsroom. Disclosure does not remove the conflict — it just means you can see it and weigh the story accordingly.",
      },
    },
    coverage: [
      {
        outlet: "ROSEWOOD LEDGER",
        bias: "Center",
        relation: "corroborates",
        headline: "Correction Ran Late, Says Editor",
        body: "Confirms the correction was published six days after the error, on page nine.",
        keyFact: "Admits the delay and the placement.",
      },
      {
        outlet: "PRESS COUNCIL BULLETIN",
        bias: "Official",
        relation: "contradicts",
        headline: "Complaint Resolved — Rosewood Ledger",
        body: "Records the correction as published and the complaint as resolved without sanction.",
        keyFact: "A correction that runs late is still a correction that ran.",
      },
      {
        outlet: "MEDIAWATCH ROSEWOOD",
        bias: "Left",
        relation: "echo",
        headline: "LOCAL PAPER BURIES ITS OWN MISTAKE",
        body: "Accurate on the placement, silent on the fact that it exists at all.",
        keyFact: "True detail, false impression — the exact pattern this case teaches.",
      },
    ],
    trace: {
      kind: "quote",
      claim: "“Nobody ran the correction”",
      steps: [
        {
          label: "ORIGINAL ERROR",
          detail: "Print edition misstated a council vote tally, 4-3 printed as 5-2",
          date: "02 MAY",
        },
        {
          label: "CORRECTION",
          detail: "Four lines, page nine, print and web — “the vote was 4-3”",
          date: "08 MAY",
          drift: "Six days late and buried, but published and still online.",
        },
        {
          label: "CRITIC'S POST",
          detail: "“Nobody ran the correction”",
          date: "10 MAY",
          drift: "Buried is not the same word as absent. One of them is checkable.",
        },
      ],
      verdictNote: "Accountability journalism includes the part where you check the accusation against your own paper.",
    },
    chart: {
      title: "LEDGER CORRECTIONS — PLACEMENT BY PAGE",
      source: "Ledger corrections log, 12 months",
      note: "Placement matters, existence matters more. Both can be criticised.",
      unit: "corrections",
      bars: [
        { label: "PAGE 2", value: 5 },
        { label: "PAGE 9+", value: 3, highlight: true },
        { label: "WEB ONLY", value: 4 },
        { label: "NEVER RUN", value: 0 },
      ],
      reading: "Twelve corrections published, none suppressed — and three of them buried where nobody looks.",
    },
    competency: "bias",
    habit: "corrections",
    literacyMove: "Next time: look for the outlet's corrections page before you decide it hides its mistakes.",
  },

  /* ------------------------------------------------------------ police */
  police: {
    outlet: {
      name: "METRO WIRE",
      founded: "founded 2016",
      country: "Regional, syndicated",
      stance: "Right",
      stanceNote: "Crime-forward regional wire. Accurate numbers, consistently alarming framing.",
      corrections: "6 corrections in the past 6 months, appended quietly to web copy",
      funding: "Ad-supported; owned by a national syndication group",
      author: {
        name: "R. Vance",
        beat: "Crime and courts across four counties",
        history: "High output, low document sourcing; most stories cite one police release",
        affiliation: "Member of a law-enforcement press association — not disclosed in the article",
        stories: [
          "“Precinct Warns Of Summer Spike” — Jun 2025, sourced to one release",
          "“Chief Defends Response Times” — Apr 2025, sourced to one release",
          "“Four Counties, One Crime Map” — Feb 2025, no documents cited",
        ],
        conflict: "Belongs to an association funded in part by police departments, and files stories sourced almost entirely to police releases. Not declared anywhere in the piece.",
      },
    },
    coverage: [
      {
        outlet: "METRO WIRE",
        bias: "Right",
        relation: "corroborates",
        headline: "Crime Up Sharply In Rosewood, Figures Show",
        body: "Quarterly totals up 40% in one reporting category.",
        keyFact: "The category itself changed definition this quarter.",
      },
      {
        outlet: "5TH PRECINCT RELEASE",
        bias: "Official",
        relation: "contradicts",
        headline: "Q1 Statistics And Reporting Changes",
        body: "One category was split into two; overall incidents up 4% year on year.",
        keyFact: "4% total, not 40% — the split created the spike.",
      },
      {
        outlet: "ROSEWOOD LEDGER",
        bias: "Center",
        relation: "corroborates",
        headline: "How A Counting Change Made Crime Look Worse",
        body: "Walks through the category split with the precinct's own table.",
        keyFact: "Shows the same underlying incidents both ways.",
      },
      {
        outlet: "@SAFESTREETSNOW",
        bias: "Sensational",
        relation: "echo",
        headline: "NOWHERE IS SAFE ANYMORE",
        body: "Quotes the 40% figure, adds three unrelated CCTV stills.",
        keyFact: "Recycled imagery from two other towns.",
      },
    ],
    trace: {
      kind: "statistic",
      claim: "“Crime up 40 percent”",
      steps: [
        {
          label: "ORIGINAL TABLE",
          detail: "Precinct Q1 return — “theft” split into “theft from person” and “theft from vehicle”",
          date: "07 APR",
        },
        {
          label: "METHODOLOGY NOTE",
          detail: "Footnote 3: “category change; year-on-year comparison not advised”",
          date: "07 APR",
          drift: "The footnote is the whole story and it is never quoted.",
        },
        {
          label: "WIRE STORY",
          detail: "Compares the new sub-category against the old combined one",
          date: "08 APR",
          drift: "A comparison the source document explicitly warns against.",
        },
      ],
      verdictNote: "Every number in the story is real. The comparison between them is not.",
    },
    chart: {
      title: "ROSEWOOD INCIDENTS — Q1 YEAR ON YEAR",
      source: "5th Precinct quarterly return, footnote 3",
      note: "The 2024 bars are the 2023 bar, split in two.",
      unit: "incidents",
      bars: [
        { label: "2023 THEFT", value: 210 },
        { label: "2024 PERSON", value: 118, highlight: true },
        { label: "2024 VEHICLE", value: 100 },
        { label: "ALL OTHER", value: 96 },
      ],
      reading: "118 + 100 = 218 against 210 last year. Four percent, printed as forty.",
    },
    competency: "chain",
    habit: "denominator",
    literacyMove: "Next time: read the methodology footnote before you repeat the percentage.",
  },

  /* ------------------------------------------------------------ school */
  school: {
    outlet: {
      name: "ROSEWOOD PARENTS' VOICE",
      founded: "founded 2021",
      country: "Rosewood, community",
      stance: "Left",
      stanceNote: "Volunteer parent newsletter. Sincere, under-resourced, rarely calls the school for comment.",
      corrections: "1 correction in the past 6 months, issued in a follow-up newsletter",
      funding: "Nonprofit, donation-funded, no advertising",
      author: {
        name: "K. Idowu",
        beat: "Education — volunteer contributor",
        history: "Twelve pieces, all on school funding; no training in statistics",
        affiliation: "Parent of two pupils at the school — disclosed",
        stories: [
          "“Where Did The Music Budget Go?” — Oct 2024",
          "“Class Sizes Are Up. Here's The Register.” — Feb 2025",
          "“Why I Keep Writing About This School” — Apr 2025",
        ],
        conflict: "A parent writing about their own children's school. Disclosed, and it is also why they had the register data first. A conflict is not automatically a disqualification.",
      },
    },
    coverage: [
      {
        outlet: "PARENTS' VOICE",
        bias: "Left",
        relation: "corroborates",
        headline: "Reading Scores Fall At Rosewood High",
        body: "Cites the school-wide average dropping four points.",
        keyFact: "School-wide average, no cohort breakdown.",
      },
      {
        outlet: "STATE EDUCATION DEPT.",
        bias: "Official",
        relation: "contradicts",
        headline: "District Assessment Results 2024",
        body: "Grade 9 down 7 points, Grade 11 up 3, intake up 60 pupils on last year.",
        keyFact: "The average moved partly because the cohort changed size.",
      },
      {
        outlet: "STATE TRIBUNE",
        bias: "Right",
        relation: "echo",
        headline: "Another Failing School, Another Excuse",
        body: "Quotes the four-point drop, drops the cohort figures entirely.",
        keyFact: "The inconvenient half of the dataset does not appear.",
      },
      {
        outlet: "THE FOURTH STREET ONION",
        bias: "Satire",
        relation: "satire",
        headline: "School Announces Plan To Simply Print Bigger Numbers",
        body: "Labelled satire; shared into three parent groups without the label.",
        keyFact: "Genre check before outrage.",
      },
    ],
    trace: {
      kind: "statistic",
      claim: "“Reading scores fell four points”",
      steps: [
        {
          label: "ORIGINAL DATASET",
          detail: "State assessment file, per-grade tables with cohort sizes attached",
          date: "20 JUN",
        },
        {
          label: "SCHOOL SUMMARY",
          detail: "One-page summary reports the school-wide mean only",
          date: "24 JUN",
          drift: "Averaging two cohorts of different sizes hides the split.",
        },
        {
          label: "NEWSLETTER",
          detail: "Repeats the summary figure in good faith",
          date: "28 JUN",
          drift: "No error introduced — but no cohort data either.",
        },
      ],
      verdictNote: "An honest source can still hand you a misleading average. Ask for the breakdown.",
    },
    chart: {
      title: "READING ASSESSMENT — BY GRADE BAND",
      source: "State Education Dept. assessment file 2024",
      note: "The school-wide average combines both bands and the changed intake.",
      unit: "scaled score change",
      bars: [
        { label: "GRADE 9", value: -7, highlight: true },
        { label: "GRADE 10", value: -1 },
        { label: "GRADE 11", value: 3 },
        { label: "SCHOOL AVG", value: -4 },
      ],
      reading: "One band fell hard, one rose. The average is the least informative number on this chart.",
    },
    competency: "compare",
    habit: "lateral",
    literacyMove: "Next time: ask for the breakdown behind an average before you draw a conclusion.",
  },
};

const FALLBACK: SiftData = SIFT.bakery;

export function siftFor(caseId: string): SiftData {
  return SIFT[caseId] ?? FALLBACK;
}

/* ------------------------------------------------- drill competency map

   postoffice and library are arcade drill stages, not SIFT investigations —
   they have no outlet/coverage/trace/chart content, so siftFor() silently
   falls back to SIFT.bakery for them, which wrongly credits "SOURCE
   CREDIBILITY" for every drill cleared. This table gives those stages (and
   any future ones without SIFT content) their own real competency instead
   of borrowing bakery's. Stages that already carry a genuine SIFT entry
   (cityhall, market, newsoffice, police, school) aren't listed here and
   keep using siftFor() as before. */

const STAGE_COMPETENCY: Record<string, { competency: CompetencyId; habit: string }> = {
  postoffice: { competency: "source", habit: "domain" }, // spotting a spoofed sender/domain
  library: { competency: "genre", habit: "headline" }, // telling real reporting from fake-news bait
  // school's SIFT entry below still describes the original averages/cohort
  // content — the stage now runs distinguishing AI-made from genuine content,
  // so it needs its own competency instead of the stale "compare" mapping.
  school: { competency: "genre", habit: "aitell" },
};

/** The competency + habit a case actually teaches, for progress tracking.
    Prefers an explicit drill-stage mapping over the SIFT fallback. */
export function progressMetaFor(caseId: string): { competency: CompetencyId; habit: string } {
  if (STAGE_COMPETENCY[caseId]) return STAGE_COMPETENCY[caseId];
  const s = siftFor(caseId);
  return { competency: s.competency, habit: s.habit };
}

/* ------------------------------------------------------ per-source intel

   Screen 5b is not "check the article" — it is "check whatever you are looking
   at". A viral account and a named official are sources too, with their own
   footprint, funding and reasons to talk, so each folder tab carries its own
   credibility panel. The chart tab inherits the official record's provenance,
   because that is where the numbers came from. */

type SourceIntel = { social: OutletProfile; quote: OutletProfile };

const SOURCE_INTEL: Record<string, SourceIntel> = {
  bakery: {
    social: {
      name: "@ROSEWOOD_WATCH",
      founded: "account created 2024",
      country: "Location not set",
      stance: "Sensational",
      stanceNote: "Anonymous local account. Posts outrage-shaped summaries of council and business news.",
      corrections: "No corrections posted. Two earlier claims deleted without note.",
      funding: "Unfunded, but links a tip jar on every viral post",
      flagged: "Platform label: 'This post is missing context' (added 6 hours after posting)",
      author: {
        name: "Anonymous operator",
        beat: "Whatever is trending in Rosewood that day",
        history: "4.1K likes on this post; 900 followers before it, 6K after",
        affiliation: "Undisclosed. No named person stands behind the claim.",
        stories: [
          "“COUNCIL SNEAKS THROUGH PARKING FEE” — later corrected by the Ledger",
          "“SCHOOL BUS ROUTE CANCELLED” — route was never cancelled",
          "“THEY SHUT IT DOWN AND NOBODY TOLD YOU” — this post",
        ],
        conflict: "Cannot be assessed. An anonymous account earns from attention and pays nothing when it is wrong.",
      },
    },
    quote: {
      name: "ROSEWOOD HEALTH DEPARTMENT",
      founded: "public body, records since 1968",
      country: "Rosewood, municipal",
      stance: "Official",
      stanceNote: "Statutory inspector. Speaks to a published standard and can be held to it in writing.",
      corrections: "Inspection results are amendable on appeal; two amended in the past year, both logged",
      funding: "Municipal budget line 4.2",
      author: {
        name: "Insp. Ruth Camden",
        beat: "Food premises inspection, Rosewood district",
        history: "On the record, by phone, Tuesday 4:10pm — willing to be named and quoted",
        affiliation: "Employed by the body that issued the violations",
        stories: [
          "Signed the March 12 inspection report on this premises",
          "Signed the March 19 follow-up clearing it",
          "Quoted in the county bulletin's closure round-up",
        ],
        conflict: "An official defending their own department's paperwork. The paperwork is public, so you can check her against it.",
      },
    },
  },

  cityhall: {
    social: {
      name: "@WELLER4ROSEWOOD",
      founded: "campaign account, created 2025",
      country: "Rosewood, campaign",
      stance: "Right",
      stanceNote: "Declared candidate for council. Every post is campaign material and is labelled as such by the platform.",
      corrections: "None issued. Two posts quietly edited after publication.",
      funding: "Registered campaign committee; donor list filed with the clerk",
      author: {
        name: "D. Weller (candidate)",
        beat: "Running against the incumbent who signed the budget",
        history: "Posts the same budget figure daily without the appropriation note",
        affiliation: "Direct electoral interest in the budget being read as waste",
        stories: [
          "“THEY DOUBLED IT OVERNIGHT” — pinned post",
          "“Nobody Will Give You A Straight Answer” — same figure, no source",
          "Campaign launch video, filmed outside City Hall",
        ],
        conflict: "Stands to gain office if voters believe the claim. That does not make it false — it means you check it before you repeat it.",
      },
    },
    quote: {
      name: "OFFICE OF THE CITY FINANCE OFFICER",
      founded: "public body, records since 1954",
      country: "Rosewood, municipal",
      stance: "Official",
      stanceNote: "Custodian of the appropriation record. Answers in writing and publishes the underlying line items.",
      corrections: "Publishes an errata sheet with each quarterly statement; one issued this year",
      funding: "Municipal budget line 1.1",
      author: {
        name: "Priya Nandakumar",
        beat: "City finance — appropriations, audit, reporting",
        history: "Provided the merged line item's full history on request, unprompted",
        affiliation: "Reports to the council whose budget is in dispute",
        stories: [
          "Published the departmental merge memo, Nov 2024",
          "Testified at the public budget hearing, Jan 2025",
          "Quoted in the Ledger's civic desk story on the same vote",
        ],
        conflict: "Works for the body being accused. Everything she says here is checkable against the posted minutes, which is the point.",
      },
    },
  },

  market: {
    social: {
      name: "@ROSEWOOD_WATCH",
      founded: "account created 2024",
      country: "Location not set",
      stance: "Sensational",
      stanceNote: "The same anonymous outrage account from the bakery case, now on prices.",
      corrections: "No corrections posted, ever",
      funding: "Tip jar linked on viral posts",
      flagged: "Photograph is cropped; the wider shot appears in the market's own listing",
      author: {
        name: "Anonymous operator",
        beat: "Local grievances, photographed selectively",
        history: "Posts one price tag at a time, never the shelf it sits on",
        affiliation: "Undisclosed",
        stories: [
          "“SIX DOLLARS. SIX.” — this post",
          "“THEY SHUT IT DOWN AND NOBODY TOLD YOU” — bakery case",
          "“Why Is Nobody Talking About This?” — no claim, 2K shares",
        ],
        conflict: "Cannot be assessed, and the account's whole product is the crop you cannot see around.",
      },
    },
    quote: {
      name: "FOURTH ST. MARKET — MANAGEMENT",
      founded: "trading since 1949",
      country: "Rosewood, local business",
      stance: "Official",
      stanceNote: "An interested party speaking for their own business — but the only holder of the actual price list.",
      corrections: "Publishes a weekly price board; archived boards available on request",
      funding: "Stallholder fees",
      author: {
        name: "Ines Toya",
        beat: "Market manager, 11 years",
        history: "Supplied the full price board, including the lines that make the market look worse",
        affiliation: "Paid by the business under criticism",
        stories: [
          "Weekly price board, published every Monday",
          "Quoted defending stallholders in the 2024 rent dispute",
          "Named in the county produce survey as a data contributor",
        ],
        conflict: "Obvious and declared: it is her market. She also handed over the primary document, which a spin operation would not do.",
      },
    },
  },

  newsoffice: {
    social: {
      name: "@INKSPILL_RW",
      founded: "media-criticism account, created 2023",
      country: "Rosewood, unaffiliated",
      stance: "Left",
      stanceNote: "Watchdog account with a standing view that the local paper protects the council. Sometimes right.",
      corrections: "Issues corrections in replies, not in the original post",
      funding: "Reader donations, total not published",
      author: {
        name: "Unnamed collective ('we')",
        beat: "Local press accountability",
        history: "Broke two genuine stories about the paper's ownership; also ran three claims that did not stand up",
        affiliation: "One contributor was refused a job at the Ledger in 2023 — not disclosed",
        stories: [
          "“The Ledger's Owners, Unlisted” — later confirmed accurate",
          "“They Killed The Correction” — this post",
          "“Deleted At 2AM” — timestamp evidence never produced",
        ],
        conflict: "An undeclared grudge alongside a real track record. Both things are true and you have to hold them at once.",
      },
    },
    quote: {
      name: "COUNTY ENGINEER'S OFFICE",
      founded: "public body, records since 1971",
      country: "Rosewood County",
      stance: "Official",
      stanceNote: "Technical authority on the underlying report. No editorial stake in how the paper covered it.",
      corrections: "Reports are versioned; revisions published with change logs",
      funding: "County budget",
      author: {
        name: "H. Barrow",
        beat: "County engineering — structures and inspections",
        history: "Provided the original report and the date it was sent to the newsroom",
        affiliation: "No relationship with the newspaper beyond supplying the report",
        stories: [
          "Original structural report, filed six days before the story ran",
          "Revision log showing no changes after filing",
          "Quoted in three prior Ledger stories without complaint",
        ],
        conflict: "None apparent — which is exactly why this is the source that settles the timeline.",
      },
    },
  },

  police: {
    social: {
      name: "@ROSEWOOD_WATCH",
      founded: "account created 2024",
      country: "Location not set",
      stance: "Sensational",
      stanceNote: "Crime-fear content performs best for this account, and it posts accordingly.",
      corrections: "None. Reposts its own deleted claims months later.",
      funding: "Tip jar; ran one sponsored post for a home-security firm",
      flagged: "Undeclared commercial interest in fear of crime",
      author: {
        name: "Anonymous operator",
        beat: "Whatever is frightening this week",
        history: "Posted the 40% figure before the quarterly release was public",
        affiliation: "Took payment from a security company in the same month",
        stories: [
          "“NOBODY IS SAFE WALKING HOME” — this post",
          "“Sponsored: Protect Your Family” — undeclared as advertising",
          "“Three Break-Ins On My Street” — one break-in, two neighbouring streets",
        ],
        conflict: "Sells fear to an audience and takes money from a company that sells the cure for it.",
      },
    },
    quote: {
      name: "5TH PRECINCT — PUBLIC INFORMATION",
      founded: "precinct established 1962",
      country: "Rosewood, municipal",
      stance: "Official",
      stanceNote: "Police speaking about police numbers. Authoritative on the counting method, interested in the interpretation.",
      corrections: "Quarterly tables reissued twice after category changes, both noted in footnotes",
      funding: "Municipal policing budget",
      author: {
        name: "Capt. Del Moreno",
        beat: "Precinct commander, public information",
        history: "Confirmed on the record that one category was split into two this quarter",
        affiliation: "Career interest in the precinct's performance being read favourably",
        stories: [
          "Quarterly crime table, Q2 — with the footnote nobody quoted",
          "Category change memo, issued to all four precincts",
          "Interviewed on response times, Apr 2025",
        ],
        conflict: "Has reason to prefer the reassuring reading. The footnote he points to is published, so check it rather than trusting the tone.",
      },
    },
  },

  school: {
    social: {
      name: "@PARENTS_RW",
      founded: "parents' group account, created 2022",
      country: "Rosewood, community",
      stance: "Left",
      stanceNote: "Community group with a genuine stake and no statistical training. Sincere, not neutral.",
      corrections: "Posts corrections when members catch errors — three this year",
      funding: "Unfunded; volunteer-run",
      author: {
        name: "Group admins (rotating)",
        beat: "School funding, class sizes, assessment",
        history: "Shares district documents in full, then interprets them loosely in the caption",
        affiliation: "Members are parents of pupils at the school",
        stories: [
          "“Scores Are In The Floor” — this post",
          "“The Register, Page By Page” — primary document, no spin",
          "“Correction: The Music Budget Was Reallocated, Not Cut” — self-issued",
        ],
        conflict: "Personally invested and openly so. They also correct themselves in public, which most of the accounts in this game do not.",
      },
    },
    quote: {
      name: "DISTRICT ASSESSMENT OFFICE",
      founded: "public body, records since 1988",
      country: "Rosewood district",
      stance: "Official",
      stanceNote: "Owns the assessment data and the methodology note that explains the cohort change.",
      corrections: "Publishes a methodology appendix each cycle; one restatement in five years",
      funding: "District education budget",
      author: {
        name: "Dr. Amina Roche",
        beat: "District assessment lead",
        history: "Released the band-level breakdown that the average conceals",
        affiliation: "Employed by the district whose results are in question",
        stories: [
          "Band-level results table, published in full",
          "Methodology appendix on the sixty-pupil intake change",
          "Quoted in the district's own newsletter on the same figures",
        ],
        conflict: "Works for the district, and released the breakdown that makes the district look worse in one band. Weigh the documents, not the employer.",
      },
    },
  },
};

const DEFAULT_LOGO: Record<string, string> = {
  article: "logoLedger",
  social: "logoSocial",
  quote: "logoSeal",
  chart: "logoSeal",
};

/** The credibility profile behind whichever folder tab is open. */
export function profileFor(caseId: string, kind: string): OutletProfile {
  const intel = SOURCE_INTEL[caseId];
  const base =
    kind === "social" && intel
      ? intel.social
      : (kind === "quote" || kind === "chart") && intel
        ? intel.quote
        : siftFor(caseId).outlet;
  return { ...base, logo: base.logo ?? DEFAULT_LOGO[kind] ?? "logoLedger" };
}