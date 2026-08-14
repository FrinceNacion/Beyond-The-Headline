import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DeviceFrame, type Device } from "./components/DeviceFrame";
import { LoadingScreen } from "./screens/LoadingScreen";
import { TitleScreen } from "./screens/TitleScreen";
import { TutorialOverlay } from "./screens/TutorialOverlay";
import { CommunityMap } from "./screens/CommunityMap";
import { Investigation, type Marks, type Mark } from "./screens/Investigation";
import { CaseFile } from "./screens/CaseFile";
import { Shop, type ShopItem } from "./screens/Shop";
import { StatesLegend } from "./screens/StatesLegend";
import { MilAlignment } from "./screens/MilAlignment";
import { ModeSelect } from "./screens/ModeSelect";
import { Prologue } from "./screens/Prologue";
import { Briefing } from "./screens/Briefing";
import { About } from "./screens/About";
import { Tracker } from "./screens/Tracker";
import { Settings } from "./screens/Settings";
import { TeacherDashboard } from "./screens/TeacherDashboard";
import { CASES, RANKS, type CaseDef } from "./game/cases";
import { CASE_GAMES } from "./cases/index";
import { UnderDevGame } from "./cases/UnderDevGame";
import { STAGE_GAMES } from "./cases/arcade/registry";
import type { StageResult } from "./cases/arcade/stage";
import { medalFor, medalTierForStars, MEDAL_RANK, type MedalType, type CaseResult } from "./game/scoring";
import { buildRun, timeAttackBonus, type Tier } from "./game/timeattack";
import { EMPTY_LIFETIME, lifetimeAccuracy } from "./game/progress";
import { progressMetaFor } from "./game/sift";
import { PrefsProvider } from "./prefs";
import { useFrame } from "./components/useFrame";
import { loadSave, saveGame, clearSave, type SaveData } from "./game/persistence";

type Screen =
  | "loading"
  | "title"
  | "prologue"
  | "map"
  | "briefing"
  | "investigation"
  | "casefile"
  | "shop"
  | "modeselect"
  | "about"
  | "tracker"
  | "settings"
  | "teacher";

type Run = {
  tier: Tier;
  cases: CaseDef[];
  index: number;
  /** tips banked from earlier source sets in this run */
  banked: number;
};

const HINT_COST = 25;
const CASE_SECONDS = 300;

/** Screens you visit and come back from, rather than progress through. */
const ASIDE: Screen[] = ["shop", "settings", "about", "tracker", "teacher"];

export default function App() {
  return (
    <PrefsProvider>
      <Game />
    </PrefsProvider>
  );
}

function Game() {
  // read once — same value for every state initializer below, so a refresh
  // rehydrates everything from a single consistent snapshot
  const [initialSave] = useState<SaveData | null>(() => loadSave());

  const [device, setDevice] = useState<Device>("mobile");
  const [screen, setScreen] = useState<Screen>("loading");
  const [prevScreen, setPrevScreen] = useState<Screen>("map");

  const [tips, setTips] = useState(initialSave?.tips ?? 60);
  const [solved, setSolved] = useState<string[]>(initialSave?.solved ?? []);
  const [activeIndex, setActiveIndex] = useState(initialSave?.activeIndex ?? CASES.length - 1);
  const [caseIndex, setCaseIndex] = useState(0);
  const [marks, setMarks] = useState<Marks>({});
  const [timeLeft, setTimeLeft] = useState(CASE_SECONDS);
  const [timerOn, setTimerOn] = useState(true);

  const [inventory, setInventory] = useState<Record<string, number>>(
    initialSave?.inventory ?? {
      magnifier: 1,
      secondsource: 0,
      coffee: 0,
      redpen: 0,
    },
  );
  const [owned, setOwned] = useState<string[]>(initialSave?.owned ?? []);

  const [mode, setMode] = useState<"story" | "clock">("story");
  const [run, setRun] = useState<Run | null>(null);
  const [bestTimes, setBestTimes] = useState<Record<string, number>>(initialSave?.bestTimes ?? {});
  const [medals, setMedals] = useState<Record<string, string>>(initialSave?.medals ?? {});
  const [lifetime, setLifetime] = useState(initialSave?.lifetime ?? EMPTY_LIFETIME);
  const [panned, setPanned] = useState(false);
  const [stars, setStars] = useState<Record<string, number>>(initialSave?.stars ?? {});
  const [prologueSeen, setPrologueSeen] = useState(initialSave?.prologueSeen ?? false);
  const [briefIndex, setBriefIndex] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const clockFrame = useFrame(2);

  const [tutorial, setTutorial] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(initialSave?.tutorialDone ?? false);
  const [legend, setLegend] = useState(false);
  const [alignment, setAlignment] = useState(false);
  const [hasSave, setHasSave] = useState(Boolean(initialSave));
  const [legendIntroSeen, setLegendIntroSeen] = useState(initialSave?.legendIntroSeen ?? false);
  // clock the dummy leaderboard accounts drift from — set once, then persisted,
  // so returning players see believable movement instead of a reset board
  const [leaderboardSeedTs, setLeaderboardSeedTs] = useState<number>(
    initialSave?.leaderboardSeedTs ?? Date.now(),
  );

  const cs = mode === "clock" && run ? run.cases[run.index] : CASES[caseIndex];
  const rank = RANKS[Math.min(solved.length, RANKS.length - 1)];
  const accuracy = lifetimeAccuracy(lifetime);
  const elapsed = run ? Math.max(0, run.tier.limit - timeLeft) : 0;

  /* ---------------------------------------------------------------- timer */
  useEffect(() => {
    // the Beat the Clock countdown always runs; the story timer is optional
    if (screen !== "investigation" || (!timerOn && mode === "story")) return;
    const t = window.setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [screen, timerOn, mode]);

  // time attack: the clock hitting zero files the set for you, ready or not
  useEffect(() => {
    if (mode === "clock" && screen === "investigation" && timeLeft <= 0) setScreen("casefile");
  }, [mode, screen, timeLeft]);

  /* Autosave. Deliberately excludes anything mid-round (marks, timeLeft, an
     in-progress Beat the Clock run, current screen) — a refresh returns the
     player to the map with everything else intact, rather than trying to
     resume mid-case. */
  useEffect(() => {
    saveGame({
      version: 1,
      tips,
      solved,
      activeIndex,
      inventory,
      owned,
      stars,
      medals,
      bestTimes,
      lifetime,
      prologueSeen,
      tutorialDone,
      legendIntroSeen,
      leaderboardSeedTs,
    });
  }, [
    tips,
    solved,
    activeIndex,
    inventory,
    owned,
    stars,
    medals,
    bestTimes,
    lifetime,
    prologueSeen,
    tutorialDone,
    legendIntroSeen,
    leaderboardSeedTs,
  ]);

  /* --------------------------------------------------------------- actions */
  const startCase = useCallback(
    (index: number) => {
      setMode("story");
      setRun(null);
      setCaseIndex(index);
      setMarks({});
      setHintsUsed(0);
      setTimeLeft(CASE_SECONDS + (inventory.coffee > 0 ? 90 : 0));
      if (inventory.coffee > 0) setInventory((inv) => ({ ...inv, coffee: inv.coffee - 1 }));
      setScreen("investigation");
      setHasSave(true);
      // the SIFT walkthrough belongs to the marking screen, not the drill stages
      if (!tutorialDone && CASE_GAMES[CASES[index].id] === "investigation") setTutorial(true);
    },
    [inventory.coffee, tutorialDone],
  );

  /** Story cases route through The Editor's briefing card first. */
  const openBriefing = useCallback((index: number) => {
    setBriefIndex(index);
    setScreen("briefing");
  }, []);

  const startRun = useCallback((tier: Tier) => {
    setMode("clock");
    setHintsUsed(0);
    setRun({ tier, cases: buildRun(tier), index: 0, banked: 0 });
    setMarks({});
    setTimeLeft(tier.limit);
    setScreen("investigation");
  }, []);

  const mark = useCallback((id: string, m: Mark) => {
    setMarks((prev) => {
      // changing a call you already made burns a Second Source charge
      if (prev[id]) setInventory((inv) => ({ ...inv, secondsource: Math.max(0, inv.secondsource - 1) }));
      return { ...prev, [id]: m };
    });
  }, []);

  const useHint = useCallback(
    (unmarked: string[]): string | null => {
      if (!unmarked.length) return null;
      if (inventory.magnifier > 0) {
        setInventory((inv) => ({ ...inv, magnifier: inv.magnifier - 1 }));
      } else if (tips >= HINT_COST) {
        setTips((t) => t - HINT_COST);
      } else {
        return null;
      }
      setHintsUsed((n) => n + 1);
      return unmarked[Math.floor(Math.random() * unmarked.length)];
    },
    [inventory.magnifier, tips],
  );

  const useRedPen = useCallback(
    (ids: string[]): string[] | null => {
      if (!inventory.redpen || !ids.length) return null;
      setInventory((inv) => ({ ...inv, redpen: inv.redpen - 1 }));
      setHintsUsed((n) => n + 1); // the red pen counts against the no-hint star too
      return ids;
    },
    [inventory.redpen],
  );

  const isLastSet = Boolean(run && run.index === run.cases.length - 1);
  const runBonus = run && isLastSet ? timeAttackBonus(run.tier, elapsed) : 0;

  const onSubmitted = useCallback(
    (r: CaseResult, starsEarned: number) => {
      const badge = owned.includes("badge") ? Math.round(r.tips * 0.1) : 0;
      setTips((t) => t + r.tips + badge + runBonus);
      // the lifetime record is kept in MIL terms: not just how many you got, but
      // how you got them wrong, which is what the calibration meter reads from
      setLifetime((l) => ({
        ...l,
        correct: l.correct + r.correct,
        calls: l.calls + r.total,
        falseAlarms: l.falseAlarms + r.falseAlarms.length,
        missed: l.missed + r.missed.length,
        reasonsRight: l.reasonsRight + r.reasonsRight,
        reasonsPossible: l.reasonsPossible + r.reasonsPossible,
        casesFiled: l.casesFiled + 1,
        solved: r.solved && !l.solved.includes(cs.id) ? [...l.solved, cs.id] : l.solved,
        habits:
          r.solved && !l.habits.includes(progressMetaFor(cs.id).habit)
            ? [...l.habits, progressMetaFor(cs.id).habit]
            : l.habits,
        records: [
          ...(l.records ?? []).filter((rec) => rec.caseId !== cs.id),
          {
            caseId: cs.id,
            accuracy: r.accuracy,
            falseAlarms: r.falseAlarms.length,
            missed: r.missed.length,
            calls: r.total,
            kind: "investigation",
          },
        ],
      }));

      if (mode === "clock" && run) {
        setRun((cur) => (cur ? { ...cur, banked: cur.banked + r.tips + badge } : cur));
        if (isLastSet) {
          const id = run.tier.id;
          setBestTimes((b) => (b[id] === undefined || elapsed < b[id] ? { ...b, [id]: elapsed } : b));
        }
        return;
      }

      const m = medalFor(r);
      const medalKey = medalTierForStars(starsEarned);
      if (medalKey) {
        setMedals((prev) => {
          const existing = prev[cs.id] as MedalType | undefined;
          if (!existing || (MEDAL_RANK[medalKey] ?? 0) > (MEDAL_RANK[existing] ?? 0)) {
            return { ...prev, [cs.id]: medalKey };
          }
          return prev;
        });
      } else if (m && !medals[cs.id]) {
        setMedals((prev) => ({ ...prev, [cs.id]: m }));
      }
      // keep the best rating across replays
      setStars((prev) => ({ ...prev, [cs.id]: Math.max(prev[cs.id] ?? 0, starsEarned) }));
      if (r.solved) {
        setSolved((s) => (s.includes(cs.id) ? s : [...s, cs.id]));
        setActiveIndex((i) => Math.min(Math.max(i, caseIndex + 1), CASES.length - 1));
      }
    },
    [cs.id, caseIndex, owned, mode, run, isLastSet, elapsed, runBonus, medals],
  );

  /** A drill stage reports the same things a filed case does: what it paid, how
      many calls held up, and whether the file closed. */
  const onStageComplete = useCallback(
    (r: StageResult) => {
      setTips((t) => t + r.tips);
      setLifetime((l) => ({
        ...l,
        correct: l.correct + r.correct,
        calls: l.calls + r.calls,
        casesFiled: l.casesFiled + 1,
        solved: r.cleared && !l.solved.includes(cs.id) ? [...l.solved, cs.id] : l.solved,
        // drill stages never updated the habit tracker before — a cleared
        // drill now teaches its habit exactly like a filed investigation does
        habits:
          r.cleared && !l.habits.includes(progressMetaFor(cs.id).habit)
            ? [...l.habits, progressMetaFor(cs.id).habit]
            : l.habits,
        records: [
          ...(l.records ?? []).filter((rec) => rec.caseId !== cs.id),
          {
            caseId: cs.id,
            accuracy: r.calls ? r.correct / r.calls : 0,
            // a drill has no five-state verdict, so it can't over- or under-call
            falseAlarms: 0,
            missed: 0,
            calls: r.calls,
            kind: "drill",
          },
        ],
      }));
      if (!r.cleared) return;
      setStars((prev) => ({ ...prev, [cs.id]: Math.max(prev[cs.id] ?? 0, r.stars) }));
      const medalKey = medalTierForStars(r.stars);
      if (medalKey) {
        setMedals((prev) => {
          const existing = prev[cs.id] as MedalType | undefined;
          if (!existing || (MEDAL_RANK[medalKey] ?? 0) > (MEDAL_RANK[existing] ?? 0)) {
            return { ...prev, [cs.id]: medalKey };
          }
          return prev;
        });
      } else {
        setMedals((prev) => ({ ...prev, [cs.id]: r.stars === 3 ? "CLEAN RUN" : "DRILL PASSED" }));
      }
      setSolved((s) => (s.includes(cs.id) ? s : [...s, cs.id]));
      setActiveIndex((i) => Math.min(Math.max(i, caseIndex + 1), CASES.length - 1));
    },
    [cs.id, caseIndex],
  );

  /** Advance to the next source set, or wrap the run up and head back to the board. */
  const advanceRun = useCallback(() => {
    if (!run) return;
    if (run.index >= run.cases.length - 1) {
      setRun(null);
      setMode("story");
      setScreen("modeselect");
      return;
    }
    setRun({ ...run, index: run.index + 1 });
    setMarks({});
    setScreen("investigation");
  }, [run]);

  const buy = useCallback(
    (item: ShopItem) => {
      if (tips < item.price) return;
      setTips((t) => t - item.price);
      if (item.consumable) {
        const charges = item.id === "magnifier" ? 3 : item.id === "coffee" ? 2 : 1;
        setInventory((inv) => ({ ...inv, [item.id]: (inv[item.id] ?? 0) + charges }));
      } else {
        setOwned((o) => (o.includes(item.id) ? o : [...o, item.id]));
      }
    },
    [tips],
  );

  const reset = () => {
    clearSave();
    setTips(60);
    setSolved([]);
    setActiveIndex(0);
    setMarks({});
    setInventory({ magnifier: 1, secondsource: 0, coffee: 0, redpen: 0 });
    setOwned([]);
    setStars({});
    setMedals({});
    setPrologueSeen(false);
    setHintsUsed(0);
    setHasSave(false);
    setTutorialDone(false);
    setLifetime(EMPTY_LIFETIME);
    setLeaderboardSeedTs(Date.now());
    setScreen("title");
  };

  /** Open a side screen, remembering where to come back to. */
  const goAside = useCallback(
    (s: Screen) => {
      setPrevScreen((p) => (ASIDE.includes(screen) ? p : screen));
      setScreen(s);
    },
    [screen],
  );
  const goShop = useCallback(() => goAside("shop"), [goAside]);
  const backFromAside = useCallback(
    () => setScreen(ASIDE.includes(prevScreen) ? "map" : prevScreen),
    [prevScreen],
  );

  /* ---------------------------------------------------------------- render */
  const body = useMemo(() => {
    switch (screen) {
      case "loading":
        return <LoadingScreen onDone={() => setScreen("title")} />;
      case "title":
        return (
          <TitleScreen
            tips={tips}
            hasSave={hasSave}
            pan={!panned}
            onPanDone={() => setPanned(true)}
            onTimeAttack={() => setScreen("modeselect")}
            onContinue={() => setScreen("map")}
            onNew={() => {
              setSolved([]);
              setActiveIndex(0);
              setStars({});
              setMedals({});
              setTutorialDone(false);
              setHasSave(true);
              // the dossier prologue runs once, before the board
              if (prologueSeen) {
                setScreen("map");
                setTutorial(true);
              } else {
                setScreen("prologue");
              }
            }}
            onSettings={() => goAside("settings")}
            onShop={goShop}
          />
        );
      case "prologue":
        return (
          <Prologue
            onDone={() => {
              setPrologueSeen(true);
              setScreen("map");
              if (!tutorialDone) setTutorial(true);
            }}
          />
        );
      case "briefing":
        return (
          <Briefing
            cs={CASES[briefIndex]}
            index={briefIndex}
            tips={tips}
            rank={rank}
            bestStars={stars[CASES[briefIndex].id]}
            onStart={() => startCase(briefIndex)}
            onBack={() => setScreen("map")}
          />
        );
      case "map":
        return (
          <CommunityMap
            tips={tips}
            rank={rank}
            progress={solved}
            medals={medals}
            stars={stars}
            accuracy={accuracy}
            activeIndex={activeIndex}
            leaderboardSeedTs={leaderboardSeedTs}
            onOpenCase={openBriefing}
            onTracker={() => goAside("tracker")}
            onShop={goShop}
            onSettings={() => goAside("settings")}
          />
        );
      case "investigation": {
        // Drill stages run their own two mini-games inside the shared stage shell.
        const StageGame = CASE_GAMES[cs.id] === "stage" ? STAGE_GAMES[cs.id] : undefined;
        if (StageGame) {
          return (
            <StageGame
              cs={cs}
              tips={tips}
              rank={rank}
              index={caseIndex}
              clockFrame={clockFrame}
              onComplete={onStageComplete}
              onExit={() => setScreen("map")}
            />
          );
        }
        // Cases without a game type yet show a stub.
        if (CASE_GAMES[cs.id] !== "investigation") {
          return (
            <UnderDevGame
              cs={cs}
              tips={tips}
              rank={rank}
              onBack={() => setScreen("map")}
            />
          );
        }
        return (
          <Investigation
            cs={cs}
            tips={tips}
            rank={rank}
            marks={marks}
            inventory={inventory}
            mode={mode}
            clockFrame={clockFrame}
            runLabel={run ? `${run.tier.name} — SET ${run.index + 1}/${run.cases.length}` : undefined}
            timeLeft={mode === "clock" || timerOn ? timeLeft : CASE_SECONDS}
            onMark={(id, m) => {
              if (!legendIntroSeen) {
                setLegendIntroSeen(true);
                setLegend(true);
              }
              mark(id, m);
            }}
            onHint={useHint}
            onUseRedPen={useRedPen}
            onSubmit={() => setScreen("casefile")}
            onMap={() => setScreen("map")}
            onShop={goShop}
          />
        );
      }
      case "casefile":
        return (
          <CaseFile
            cs={cs}
            marks={marks}
            tips={tips}
            rank={rank}
            timeLeft={mode === "clock" || timerOn ? timeLeft : 0}
            mode={mode}
            hintsUsed={hintsUsed}
            starTimeLeft={timeLeft}
            run={
              run
                ? {
                    tierName: run.tier.name,
                    index: run.index,
                    total: run.cases.length,
                    elapsed,
                    target: run.tier.target,
                    bonus: runBonus,
                    best: bestTimes[run.tier.id],
                    isLast: isLastSet,
                  }
                : undefined
            }
            onSubmitted={onSubmitted}
            onBack={() => setScreen("investigation")}
            onClose={() => (mode === "clock" ? advanceRun() : setScreen("map"))}
          />
        );
      case "modeselect":
        return (
          <ModeSelect
            tips={tips}
            rank={rank}
            bestTimes={bestTimes}
            onStart={startRun}
            onBack={() => setScreen("title")}
          />
        );
      case "shop":
        return (
          <Shop
            tips={tips}
            rank={rank}
            inventory={inventory}
            owned={owned}
            onBuy={buy}
            onBack={backFromAside}
          />
        );
      case "about":
        return <About tips={tips} rank={rank} onBack={backFromAside} />;
      case "tracker":
        return (
          <Tracker
            tips={tips}
            rank={rank}
            lifetime={lifetime}
            medals={medals}
            stars={stars}
            onTeacher={() => setScreen("teacher")}
            onBack={backFromAside}
          />
        );
      case "teacher":
        return <TeacherDashboard tips={tips} rank={rank} onBack={() => setScreen("tracker")} />;
      case "settings":
        return (
          <Settings
            tips={tips}
            rank={rank}
            lifetime={lifetime}
            timerOn={timerOn}
            onToggleTimer={() => setTimerOn((v) => !v)}
            onLegend={() => setLegend(true)}
            onAlignment={() => setAlignment(true)}
            onAbout={() => setScreen("about")}
            onReset={reset}
            onBack={backFromAside}
          />
        );
    }
  }, [
    screen,
    tips,
    hasSave,
    rank,
    solved,
    activeIndex,
    cs,
    marks,
    inventory,
    timeLeft,
    timerOn,
    owned,
    prevScreen,
    mode,
    run,
    runBonus,
    isLastSet,
    elapsed,
    bestTimes,
    medals,
    accuracy,
    panned,
    clockFrame,
    stars,
    prologueSeen,
    briefIndex,
    hintsUsed,
    tutorialDone,
    lifetime,
    leaderboardSeedTs,
    goAside,
    backFromAside,
    startCase,
    openBriefing,
    startRun,
    advanceRun,
    mark,
    useHint,
    useRedPen,
    onSubmitted,
    onStageComplete,
    caseIndex,
    buy,
    goShop,
  ]);

  return (
    <DeviceFrame device={device} onToggle={setDevice} onLegend={() => setLegend(true)}>
      {body}

      {tutorial ? (
        <TutorialOverlay
          onDone={() => {
            setTutorial(false);
            setTutorialDone(true);
          }}
          onSkip={() => {
            setTutorial(false);
            setTutorialDone(true);
          }}
        />
      ) : null}

      {legend ? <StatesLegend onClose={() => setLegend(false)} /> : null}
      {alignment ? <MilAlignment onClose={() => setAlignment(false)} /> : null}
    </DeviceFrame>
  );
}