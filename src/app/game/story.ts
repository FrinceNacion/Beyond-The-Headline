/* Narrative layer: the prologue dossier, per-case briefings with missions and
   star conditions, and Rumor's unreliable commentary.

   Star conditions rotate per case on purpose — some cases reward a clean sweep,
   some reward restraint, some reward working without the magnifier — so the
   three-star checklist doesn't read the same way eight cases in a row. */

import type { CaseDef } from "./cases";
import type { CaseResult } from "./scoring";

/* ------------------------------------------------------------- PROLOGUE */

export type PanelArt =
  | "town"
  | "clipping"
  | "editor"
  | "badge"
  | "map";

export type StoryPanel = {
  id: string;
  art: PanelArt;
  /** small caps kicker over the prose */
  kicker: string;
  lines: string[];
  /** the last panel drops the player onto the map */
  cta?: string;
};

export const PROLOGUE: StoryPanel[] = [
  {
    id: "p1",
    art: "town",
    kicker: "ROSEWOOD — EIGHT MINUTES PAST SUNSET",
    lines: [
      "Rosewood is a town of nine thousand people, four traffic lights and one newspaper.",
      "It is the kind of place where everybody knows everybody, which people here say like it is a good thing, and mostly it is.",
      "It also means a story only has to be told once before it belongs to everyone.",
    ],
  },
  {
    id: "p2",
    art: "clipping",
    kicker: "THE LAST SIX WEEKS",
    lines: [
      "It started with the bakery. Then the school scores, then the budget, then the crime numbers.",
      "None of it was invented outright. That is the part that made it work — every story had a true fact in it somewhere, sanded down and pointed the wrong direction.",
      "By the time the Ledger caught up, the correction had a readership of forty and the rumour had four thousand.",
    ],
  },
  {
    id: "p3",
    art: "editor",
    kicker: "MARGARET ODELL — EDITOR, THE ROSEWOOD LEDGER",
    lines: [
      "“I have run this desk for twenty-two years and I have never seen a town lose the thread this fast.",
      "I do not need a hero. I need somebody who will read the whole thing, ring the second number, and write down what is actually on the record.",
      "That is the job. It is duller than people think and it matters more than they admit.”",
    ],
  },
  {
    id: "p4",
    art: "badge",
    kicker: "PRESS CREDENTIAL — ISSUED TODAY",
    lines: [
      "So the card is yours. It buys you nothing except the right to ask a second time.",
      "Every case comes to you as three sources: what the paper printed, what the town posted, and what somebody said on the record.",
      "Your job is not to decide who you like. It is to mark which claims hold up — and to be able to say why.",
    ],
  },
  {
    id: "p5",
    art: "map",
    kicker: "THE ASSIGNMENT BOARD",
    lines: [
      "Eight stops. Four rounds of drills — the mail, the passwords, your own details, the phone — then four stories the town has already made up its mind about.",
      "Take them in any order you can get into. Odell reads every file you send up, and she reads the ones you left blank too.",
      "Start at the post office. Nobody touches a story here until they can read an address.",
    ],
    cta: "BEGIN INVESTIGATION",
  },
];

/* ------------------------------------------------------ STAR CONDITIONS */

export type StarId = "allflags" | "nofalse" | "nohint" | "allreasons" | "fast" | "complete";

export type StarCond = {
  id: StarId;
  /** the promise made on the briefing card */
  label: string;
  test: (ctx: StarContext) => boolean;
};

export type StarContext = {
  cs: CaseDef;
  result: CaseResult;
  hintsUsed: number;
  timeLeft: number;
};

const CONDS: Record<StarId, StarCond> = {
  allflags: {
    id: "allflags",
    label: "Find every misleading claim",
    test: ({ result }) => result.missed.length === 0,
  },
  nofalse: {
    id: "nofalse",
    label: "Finish with zero false flags",
    test: ({ result }) => result.falseAlarms.length === 0,
  },
  nohint: {
    id: "nohint",
    label: "Work it without a hint",
    test: ({ hintsUsed }) => hintsUsed === 0,
  },
  allreasons: {
    id: "allreasons",
    label: "Give the right reason every time",
    test: ({ result }) => result.reasonsRight === result.total,
  },
  fast: {
    id: "fast",
    label: "File with 2:00 still on the clock",
    test: ({ timeLeft }) => timeLeft >= 120,
  },
  complete: {
    id: "complete",
    label: "Mark every claim — no blanks",
    test: ({ cs, result }) => result.correct + result.wrong === cs.hotspots.length,
  },
};

/* ------------------------------------------------------------ BRIEFINGS */

export type Briefing = {
  /** The Editor's setup, 2-4 sentences, in her voice */
  setup: string;
  /** concrete objectives shown as a pixel checklist */
  missions: string[];
  stars: [StarId, StarId, StarId];
  /** The Editor's closing contrast of Rumor's talk against the record */
  rumorContrast: string;
};

export const BRIEFINGS: Record<string, Briefing> = {
  postoffice: {
    setup:
      "Before I put you near a story, you're doing the drills every new hire does. Eleven people down Post Office Road paid a stranger for a parcel that never existed, and not one of them read the address they were typing into. Two rounds at the counter: the mail, then the links.",
    missions: [
      "Shred the phishing mail before the tray opens it",
      "Block the fraudulent addresses, let the real ones load",
      "Keep two of your three lives",
    ],
    stars: ["allflags", "nofalse", "complete"],
    rumorContrast:
      "Rumor said the post office got hacked. The record says somebody bought a lookalike domain for nine pounds. Reading the address bar would have settled it in a second.",
  },
  library: {
    setup:
      "Second round of drills, and a harder one. The library had one password for six terminals, and by lunchtime the town had a data breach that never happened. Build something a machine can't guess, then tell me which of these headlines you'd actually print.",
    missions: [
      "Assemble a password that satisfies all four rules",
      "Leave the cracking-list fragments where they fall",
      "Call every headline — fake left, real right",
    ],
    stars: ["allflags", "nofalse", "complete"],
    rumorContrast:
      "Rumor said the reader database was dumped online. The record says the screenshot is the public catalogue, linked from the library's own front page.",
  },
  bakery: {
    setup:
      "Word's going around that the bakery fire — sorry, the bakery inspection — was worse than anybody's letting on. Okonjo's had that shop nineteen years and she's not answering her phone, which people are reading as guilt. Get in there and find out what's actually on the health department's paper.",
    missions: [
      "Flag every misleading claim in the Article",
      "Cross-check the Social Post against the Official Quote",
      "Finish with zero false flags",
    ],
    stars: ["allflags", "nofalse", "nohint"],
    rumorContrast:
      "Rumor said rats in the flour. The record says three minor violations, all corrected, follow-up passed in a week. That's the difference between gossip and reporting.",
  },
  cityhall: {
    setup:
      "Third round of drills, and this one's about you. Half the details a stranger needs to be you are already on your own timeline, and the other half you'd hand over if somebody was rude enough for long enough. Lock the first lot away. Then let's see how you handle a feed.",
    missions: [
      "Lock every personal detail before the stranger reaches it",
      "Block the harmful, approve the neutral, protect the kind",
      "Keep two of your three lives",
    ],
    stars: ["allflags", "allreasons", "complete"],
    rumorContrast:
      "Rumor tells anyone who asks where he was born, which street he grew up on and what his first dog was called. Those are three security questions and a free lunch for whoever is listening.",
  },
  market: {
    setup:
      "Last of the drills. Three stallholders on Fourth Street lost a morning's takings to a man on the phone who was very calm and very sorry to bother them. Learn to put the phone down. Then learn that the six digits on your screen are yours and nobody else's.",
    missions: [
      "Flick the scam calls away before they connect",
      "Leave the genuine calls alone",
      "Keep every hand off your one-time code",
    ],
    stars: ["allflags", "nofalse", "fast"],
    rumorContrast:
      "Rumor read his code out to a very polite man from the bank. The bank never rang him. The polite man is now four hundred pounds better off and Rumor still says he was unlucky.",
  },
  newsoffice: {
    setup:
      "This one's ours, so read it twice as hard. We're accused of burying a correction, and Rumor's already decided we did. Trace where a claim actually broke first, then lock the truth-gauge before the needle sweeps past it.",
    missions: [
      "Tap the exact link in the chain where a claim broke",
      "Lock the gauge the instant it lands on the right state",
      "Keep two of your three lives",
    ],
    stars: ["allflags", "allreasons", "nofalse"],
    rumorContrast:
      "Rumor said we killed the correction. The record says it ran — page nine, four lines, six days late. Not a cover-up. Still not good enough. Both of those can be true.",
  },
  police: {
    setup:
      "The precinct's quarterly numbers came out and three different people have already told me what they mean. Smash the misinformation flooding the inbound feed before it lands, then hold the network tower against whatever gets through.",
    missions: [
      "Smash the misleading posts — leave the true reports alone",
      "Keep the Panic Meter down; bad smashes and misses both raise it",
      "Hold the tower through the second stage",
    ],
    stars: ["allflags", "nohint", "nofalse"],
    rumorContrast:
      "Rumor said nobody's safe walking home. The record says one reporting category was split in two, and the total moved four percent. A wave, apparently, is four percent and a headline.",
  },
  school: {
    setup:
      "The group chat's full of something new this week — half of it isn't written by anybody at all. Read what's real, then learn to say exactly what gave the fake stuff away.",
    missions: [
      "Call each claim real or AI-made",
      "Name the actual giveaway, not just a guess",
      "Keep two of your three lives",
    ],
    stars: ["allflags", "allreasons", "nohint"],
    rumorContrast:
      "Rumor said the group chat's nothing but fakes now. The record says most of it's ordinary and human — the real fakes just needed a specific tell, not a vibe.",
  },
};

const DEFAULT_BRIEFING: Briefing = {
  setup:
    "Three sources, one story, and a town that's already decided. Read all of it before you mark anything.",
  missions: [
    "Flag every misleading claim across all three sources",
    "Cross-check the Social Post against the Official Quote",
    "Finish with zero false flags",
  ],
  stars: ["allflags", "nofalse", "complete"],
  rumorContrast:
    "Rumor had a theory. The record had a document. Only one of those goes in the paper.",
};

export function briefingFor(id: string): Briefing {
  return BRIEFINGS[id] ?? DEFAULT_BRIEFING;
}

export function starConds(id: string): StarCond[] {
  return briefingFor(id).stars.map((s) => CONDS[s]);
}

/** Which of the three promised stars the player actually earned. */
export function earnedStars(ctx: StarContext): boolean[] {
  return starConds(ctx.cs.id).map((c) => c.test(ctx));
}

/* ------------------------------------------------------------- RUMOR */

export type RumorTrigger = "open" | "reveal" | "flag" | "idle";

export type RumorLine = { trigger: RumorTrigger; text: string };

/* Deliberately unreliable. Every line here mirrors a pattern the player is
   being trained to catch: no source, exaggeration, missing context, a number
   with no denominator. Rumor is the game's thesis with a face on it. */
const RUMOR: Record<string, RumorLine[]> = {
  postoffice: [
    { trigger: "open", text: "The post office got hacked. My nephew's mate does computers, he'd know." },
    { trigger: "reveal", text: "They're sending those texts from inside the building, that's what I heard." },
    { trigger: "flag", text: "Ha! Knew it was dodgy the second it came through." },
    { trigger: "idle", text: "I never click them. Well — I clicked one. But I didn't put my card in. Mostly." },
    { trigger: "idle", text: "If it's got the right logo on it, how are you meant to tell?" },
  ],
  library: [
    { trigger: "open", text: "Whole borrower list is on the internet. Names, addresses, the lot." },
    { trigger: "reveal", text: "Somebody screenshotted it. I've seen the screenshot. That's proof, isn't it?" },
    { trigger: "flag", text: "There we are. Six terminals, one password. Shambles." },
    { trigger: "idle", text: "I use the same password for everything and I've never had a problem." },
    { trigger: "idle", text: "If it were nothing, why did they reset all the cards? Answer me that." },
  ],
  bakery: [
    { trigger: "open", text: "Oh, that place? I heard the owner's been dodging inspectors for months." },
    { trigger: "reveal", text: "My cousin's girlfriend works two doors down. She says it's way worse than they're letting on." },
    { trigger: "flag", text: "See, I KNEW it. I've been saying this since March." },
    { trigger: "idle", text: "Nineteen years and never one problem? Come on. Somebody was looking the other way." },
    { trigger: "idle", text: "Everybody's talking about it, so there's got to be something in it, right?" },
  ],
  cityhall: [
    { trigger: "open", text: "Doubled. DOUBLED. You don't double a budget unless somebody's getting paid." },
    { trigger: "reveal", text: "A guy at the hardware store told me the vote happened at eleven at night on purpose." },
    { trigger: "flag", text: "Told you. They never wanted that one read out loud." },
    { trigger: "idle", text: "I'm not saying it's corruption. I'm just saying nobody's said it isn't." },
    { trigger: "idle", text: "Follow the money, that's all I ever say. Follow the money." },
  ],
  market: [
    { trigger: "open", text: "Six dollars for a tomato. In this town. My mother would have walked out." },
    { trigger: "reveal", text: "They've been creeping the prices all year, everyone's noticed, nobody writes it down." },
    { trigger: "flag", text: "Gouging. Plain gouging. Put that in the paper." },
    { trigger: "idle", text: "Look, I don't have the receipt, but I know what I saw." },
    { trigger: "idle", text: "Half the stalls are in on it, is what I heard. Maybe more than half." },
  ],
  newsoffice: [
    { trigger: "open", text: "Your own paper, eh? Bet you a coffee this one gets very quiet very fast." },
    { trigger: "reveal", text: "Somebody told me they pulled the correction off the website at two in the morning." },
    { trigger: "flag", text: "Ha! Cover-up. I want it on the front page, mind." },
    { trigger: "idle", text: "They all protect each other. That's not a theory, that's just how it works." },
    { trigger: "idle", text: "If there was nothing to it, why's nobody talking?" },
  ],
  police: [
    { trigger: "open", text: "Crime's up forty percent. Forty! My sister won't walk to the shop anymore." },
    { trigger: "reveal", text: "A fella I know off the force says the real numbers never get released." },
    { trigger: "flag", text: "There it is. They've been sitting on this for a year." },
    { trigger: "idle", text: "Three break-ins on my street alone. Well — one on my street. Two nearby. Roughly." },
    { trigger: "idle", text: "You can feel it, though, can't you? You don't need a statistic for that." },
  ],
  school: [
    { trigger: "open", text: "Scores are in the floor. My neighbour's lad can't read a bus timetable." },
    { trigger: "reveal", text: "I heard three teachers walked out in one week. Or two. Definitely more than one." },
    { trigger: "flag", text: "Failing. The whole school. I've said it for years and now it's in print." },
    { trigger: "idle", text: "They changed the test to make themselves look good, that's what people are saying." },
    { trigger: "idle", text: "Not blaming the kids. I'm just asking questions." },
  ],
};

const RUMOR_GENERIC: RumorLine[] = [
  { trigger: "open", text: "Ah, this one. I've heard three versions and all of them were worse than the last." },
  { trigger: "reveal", text: "Somebody told me — can't say who — that there's a lot more to it." },
  { trigger: "flag", text: "Knew it. You can always tell." },
  { trigger: "idle", text: "I'm only repeating what's going round. Doesn't mean it's wrong." },
];

export function rumorLines(caseId: string, trigger: RumorTrigger): string[] {
  const set = RUMOR[caseId] ?? RUMOR_GENERIC;
  const hits = set.filter((l) => l.trigger === trigger).map((l) => l.text);
  return hits.length ? hits : RUMOR_GENERIC.filter((l) => l.trigger === trigger).map((l) => l.text);
}

/** One Rumor line to quote back on the verdict screen. */
export function rumorHeadline(caseId: string): string {
  const set = RUMOR[caseId] ?? RUMOR_GENERIC;
  return set[0].text;
}

export const RUMOR_NAME = "THE REGULAR";
export const RUMOR_SUB = "known locally as Rumor";