import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelButton, PixelMeter, PixelSprite } from "../../components/Pixel";
import { TopHud } from "../../components/Hud";
import { StarRow } from "../../components/Stars";
import { Overlay, useInterval } from "../arcade/StageShell";
import type { StageProps, StageResult } from "../arcade/stage";

/* CASE 06 — "Crime Wave, Allegedly". Not a drill stage: a two-stage arcade
   run built around the same story beat (two true numbers, arranged to lie).

   Stage 1 "THE INBOUND FEED"  — a whack-style fact-check. Smash the
   misinformation before it lands, leave the true reports alone. Every
   smash mints Data Coins; every miss or bad smash raises the Panic Meter.

   SHOP — spend what you earned on the defense loadout.

   Stage 2 "THE LOCAL DEFENSE" — the misinformation you missed mutates into
   clickbait invaders descending on the precinct's network tower. Drag the
   firewall ship, autofire keeps the sky clear. The Panic Meter you left
   Stage 1 with sets how much tower shield you start Stage 2 with. */

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ------------------------------------------------------------- feed data */

type FeedKind = "news" | "social" | "ad";
type FeedFact = { id: string; kind: FeedKind; text: string; misinfo: boolean; tell: string };

/* Kept deliberately basic and patterned: true items read calm and plain,
   with a number or a name attached. Fake items shout, use no source, and
   push you to act fast. The shape of the sentence is the tell, not just
   the words in it — so the difference stays easy to spot at speed. */
const FEED_FACTS: FeedFact[] = [
  { id: "f1", kind: "news", text: "Thefts went up 22% this quarter.", misinfo: false, tell: "TRUE. This number is from the real police report." },
  { id: "f2", kind: "social", text: "NO ONE IS SAFE HERE!!", misinfo: true, tell: "FAKE. Violent crime actually went down, not up." },
  { id: "f3", kind: "news", text: "A new report website opened in January.", misinfo: false, tell: "TRUE. This is why more reports came in." },
  { id: "f4", kind: "social", text: "THIS IS THE #1 MOST DANGEROUS CITY!!", misinfo: true, tell: "FAKE. The state ranks it 44th out of 61, not #1." },
  { id: "f5", kind: "news", text: "Violent crime went down 6% this quarter.", misinfo: false, tell: "TRUE. The police captain said this out loud." },
  { id: "f6", kind: "ad", text: "DOWNLOAD THIS APP TO SEE DANGER NEAR YOU!!", misinfo: true, tell: "FAKE. This is an ad, not a real news source." },
  { id: "f7", kind: "social", text: "Police say it's too soon to know why reports went up.", misinfo: false, tell: "TRUE. An officer said this on the record." },
  { id: "f8", kind: "news", text: "POLICE ARE HIDING THE TRUTH!!", misinfo: true, tell: "FAKE. No proof is given, just a scary claim." },
  { id: "f9", kind: "social", text: "The report website opened in January.", misinfo: false, tell: "TRUE. Same fact, said a second way." },
  { id: "f10", kind: "ad", text: "SHARE NOW! A CRIME WAVE IS COMING!!", misinfo: true, tell: "FAKE. It just wants you to share it fast." },
  { id: "f11", kind: "news", text: "The city shared its crime numbers today.", misinfo: false, tell: "TRUE. Just a normal report, nothing to smash." },
  { id: "f12", kind: "social", text: "POLICE ARE LYING! SHARE THIS!!", misinfo: true, tell: "FAKE. No proof, just anger." },
  { id: "f13", kind: "ad", text: "SEE EVERY CRIME ON YOUR STREET! CLICK NOW!!", misinfo: true, tell: "FAKE. It just wants clicks, not to inform you." },
  { id: "f14", kind: "news", text: "The state ranks this city 44th out of 61 for crime.", misinfo: false, tell: "TRUE. This is the number the loud posts leave out." },
];

const FEED_TONE: Record<FeedKind, { bg: string; border: string; text: string; label: string; labelColor: string }> = {
  news: { bg: C.paper2, border: C.ink, text: C.ink, label: "NEWS", labelColor: C.red },
  social: { bg: C.ink2, border: C.ink4, text: C.paper2, label: "SOCIAL", labelColor: C.brassLight },
  ad: { bg: C.brass, border: C.brassDark, text: C.ink, label: "SPONSORED", labelColor: C.redDark },
};

const MISSILE_LINES = [
  "DANGER!!", "SHARE NOW!!", "CLICK HERE!!", "NOT SAFE!!",
  "DOWNLOAD NOW!!", "SO SCARY!!", "FAKE NEWS!!", "WARNING!!",
];

/* -------------------------------------------------------------- balance */

const FEED_SECONDS = 40;
const FEED_ITEM_TTL_TICKS = 18; // * 250ms = 3.25s on screen
const FEED_TICK_MS = 250;
const FEED_MAX_ONSCREEN = 4;
const PANIC_MAX = 100;
const PANIC_WRONG = 18;
const PANIC_MISS = 9;
const COINS_PER_SMASH = 12;

const DESTROY_TARGET = 22;
const DEFENSE_TICK_MS = 70;
const TOWER_DAMAGE = 16;
const FIRE_COOLDOWN_TICKS = 7;
const COINS_PER_KILL = 6;

type Phase = "brief1" | "feed" | "shop" | "defense" | "outcome";

type Spawn = FeedFact & { uid: number; x: number; y: number; ttl: number };
type Bullet = { id: number; x: number; y: number };
type Missile = { id: number; x: number; y: number; speed: number; label: string };
type ShopState = { double: boolean; shield: boolean; speed: boolean };

const SHOP_ITEMS: { key: keyof ShopState; name: string; cost: number; icon: string; desc: string }[] = [
  { key: "double", name: "DOUBLE SHOT", cost: 45, icon: "keycap", desc: "Firewall ship fires two bolts at once." },
  { key: "shield", name: "LARGER SHIELD", cost: 30, icon: "shield", desc: "+25 tower shield, right now." },
  { key: "speed", name: "SPEED BOOST", cost: 25, icon: "stopwatch", desc: "Ship tracks your drag much faster." },
];

export function PoliceStage({ cs, tips, rank, clockFrame, onComplete, onExit }: StageProps) {
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>("brief1");

  /* -------------------------------------------------------------- shared */
  const [coins, setCoins] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const reported = useRef(false);

  const flashCall = useCallback((good: boolean, why?: string) => {
    setFlash(good ? "good" : "bad");
    window.setTimeout(() => setFlash((f) => (f === (good ? "good" : "bad") ? null : f)), 220);
    if (why) {
      setNote(why);
      window.setTimeout(() => setNote((n) => (n === why ? null : n)), 1900);
    }
  }, []);

  /* --------------------------------------------------------------- feed */
  const [panic, setPanic] = useState(0);
  const [feedTimeLeft, setFeedTimeLeft] = useState(FEED_SECONDS);
  const [feedItems, setFeedItems] = useState<Spawn[]>([]);
  const [feedCorrect, setFeedCorrect] = useState(0);
  const [feedWrong, setFeedWrong] = useState(0);
  const spawnUid = useRef(0);
  const spawnTick = useRef(0);
  const lastFactId = useRef<string | null>(null);

  const spawnOne = useCallback(() => {
    let f = FEED_FACTS[Math.floor(Math.random() * FEED_FACTS.length)];
    if (f.id === lastFactId.current) f = FEED_FACTS[Math.floor(Math.random() * FEED_FACTS.length)];
    lastFactId.current = f.id;
    const s: Spawn = {
      ...f,
      uid: spawnUid.current++,
      x: 8 + Math.random() * 76,
      y: 14 + Math.random() * 66,
      ttl: FEED_ITEM_TTL_TICKS,
    };
    setFeedItems((cur) => [...cur, s]);
  }, []);

  useInterval(
    () => {
      let panicAdd = 0;
      const kept: Spawn[] = [];
      for (const it of feedItems) {
        const ttl = it.ttl - 1;
        if (ttl <= 0) {
          if (it.misinfo) panicAdd += PANIC_MISS;
          continue;
        }
        kept.push({ ...it, ttl });
      }
      if (panicAdd) setPanic((p) => Math.min(PANIC_MAX, p + panicAdd));
      setFeedItems(kept);

      spawnTick.current += 1;
      if (spawnTick.current >= 8 && kept.length < FEED_MAX_ONSCREEN) {
        spawnTick.current = 0;
        spawnOne();
      }
    },
    phase === "feed" ? FEED_TICK_MS : null,
  );

  useInterval(
    () => setFeedTimeLeft((t) => (t > 0 ? t - 1 : 0)),
    phase === "feed" ? 1000 : null,
  );

  useEffect(() => {
    if (phase === "feed" && feedTimeLeft <= 0) setPhase("shop");
  }, [phase, feedTimeLeft]);

  useEffect(() => {
    if (phase === "feed" && panic >= PANIC_MAX) setPhase("outcome");
  }, [phase, panic]);

  const smash = useCallback(
    (uid: number) => {
      const it = feedItems.find((x) => x.uid === uid);
      if (!it) return;
      setFeedItems((cur) => cur.filter((x) => x.uid !== uid));
      if (it.misinfo) {
        setFeedCorrect((n) => n + 1);
        setCoins((c) => c + COINS_PER_SMASH);
        flashCall(true, it.tell);
      } else {
        setFeedWrong((n) => n + 1);
        setPanic((p) => Math.min(PANIC_MAX, p + PANIC_WRONG));
        flashCall(false, it.tell);
      }
    },
    [feedItems, flashCall],
  );

  /* --------------------------------------------------------------- shop */
  const [shop, setShop] = useState<ShopState>({ double: false, shield: false, speed: false });
  const [startShield, setStartShield] = useState(100);
  const shieldMax = 100 + (shop.shield ? 25 : 0);

  useEffect(() => {
    if (phase !== "shop") return;
    // panic contained in the feed sets how much tower shield you deploy with
    setStartShield(clamp(100 - Math.round(panic * 0.7), 30, 100));
  }, [phase, panic]);

  const buy = useCallback(
    (key: keyof ShopState) => {
      const item = SHOP_ITEMS.find((s) => s.key === key)!;
      if (shop[key] || coins < item.cost) return;
      setCoins((c) => c - item.cost);
      setShop((s) => ({ ...s, [key]: true }));
    },
    [shop, coins],
  );

 /* ------------------------------------------------------------ defense */
 /* ------------------------------------------------------------ defense */
  const [shield, setShield] = useState(100);
  const [shipX, setShipX] = useState(50);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [missiles, setMissiles] = useState<Missile[]>([]);
  const [destroyed, setDestroyed] = useState(0);
  const shipTarget = useRef(50);
  const bulletUid = useRef(0);
  const missileUid = useRef(0);
  const fireCd = useRef(FIRE_COOLDOWN_TICKS);
  const spawnCd = useRef(14);

  // New states for Target Prioritization & Unique Enemy Behaviors[cite: 1]
  const [targetMode, setTargetMode] = useState<"infected" | "safe">("infected");
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [warningBanner, setWarningBanner] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "defense") return;
    setShield(shop.shield ? Math.min(shieldMax, startShield + 25) : startShield);
    setShipX(50);
    shipTarget.current = 50;
    setBullets([]);
    setMissiles([]);
    setDestroyed(0);
    fireCd.current = FIRE_COOLDOWN_TICKS;
    spawnCd.current = 14;
    setTargetMode("infected");
    setScoreMultiplier(1);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle Target Priority Mode (e.g. via keyboard press 'T' or a UI button)[cite: 1]
  const toggleTargetMode = useCallback(() => {
    setTargetMode((prev) => {
      const next = prev === "infected" ? "safe" : "infected";
      setWarningBanner(next === "safe" ? "PRIORITY: SAFE DATA (CAUTION!)" : "PRIORITY: INFECTED THREATS");
      window.setTimeout(() => setWarningBanner(null), 1500);
      return next;
    });
  }, []);

  useInterval(
    () => {
      // ship eases toward the drag target — speed boost closes the gap faster
      const step = shop.speed ? 22 : 12;
      setShipX((x) => {
        const diff = shipTarget.current - x;
        if (Math.abs(diff) <= step) return shipTarget.current;
        return x + Math.sign(diff) * step;
      });

      fireCd.current -= 1;
      let liveBullets = bullets;
      if (fireCd.current <= 0) {
        fireCd.current = FIRE_COOLDOWN_TICKS;
        const offsets = shop.double ? [-5, 5] : [0];
        // Start bullets right above the ship container (y: 84) so they enter smoothly on screen
        liveBullets = [
          ...liveBullets,
          ...offsets.map((o) => ({ id: bulletUid.current++, x: clamp(shipX + o, 3, 97), y: 84 })),
        ];
      }
      // Keep bullets moving upward, filtering out anything that goes off-screen at the top (y <= 0)
      liveBullets = liveBullets.map((b) => ({ ...b, y: b.y - 7 })).filter((b) => b.y > 0);

      spawnCd.current -= 1;
      let liveMissiles = missiles;
      if (spawnCd.current <= 0) {
        spawnCd.current = Math.max(8, 15 - Math.floor(destroyed / 3));
        
        // Define unique enemy types with distinct behaviors[cite: 1]
        const enemyTypes: ("swarm" | "tank" | "stealth" | "safe_data")[] = ["swarm", "tank", "stealth", "safe_data"];
        const chosenType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        let labelText = MISSILE_LINES[Math.floor(Math.random() * MISSILE_LINES.length)];
        let customSpeed = 1.1 + Math.random() * 0.6 + destroyed * 0.025;
        let isSafe = false;

        if (chosenType === "swarm") {
          labelText = "FAST SWARM";
          customSpeed *= 1.4;
        } else if (chosenType === "tank") {
          labelText = "HEAVY TANK";
          customSpeed *= 0.6;
        } else if (chosenType === "stealth") {
          labelText = "GLITCH NODE";
          customSpeed *= 1.1;
        } else if (chosenType === "safe_data") {
          labelText = "VERIFIED REPORT";
          isSafe = true;
          customSpeed *= 0.9;
        }

        liveMissiles = [
          ...liveMissiles,
          {
            id: missileUid.current++,
            x: 8 + Math.random() * 84,
            y: -6,
            speed: customSpeed,
            label: labelText,
            // @ts-ignore extending missile type inline for unique behaviors
            enemyType: chosenType,
            isSafeData: isSafe,
          },
        ];
      }

      // Unique behaviors update loop (e.g., zig-zag movement for stealth/glitch nodes)[cite: 1]
      liveMissiles = liveMissiles.map((m: any) => {
        let newX = m.x;
        if (m.enemyType === "stealth") {
          newX = clamp(m.x + Math.sin(m.y * 0.1) * 1.5, 4, 96);
        }
        return { ...m, x: newX, y: m.y + m.speed };
      });

      const survivedBullets = [...liveBullets];
      const survivedMissiles: Missile[] = [];
      let gainedCoins = 0;
      let killedNow = 0;
      let towerDamage = 0;
      let penaltyTriggered = false;

      for (const m of liveMissiles) {
        const hitIdx = survivedBullets.findIndex((b) => Math.abs(b.x - m.x) < 7 && Math.abs(b.y - m.y) < 8);
        if (hitIdx >= 0) {
          survivedBullets.splice(hitIdx, 1);
          
          // @ts-ignore checking custom property
          if (m.isSafeData) {
            // Penalty for destroying safe/true data instead of infected targets[cite: 1]
            penaltyTriggered = true;
            towerDamage += TOWER_DAMAGE;
            flashCall(false, "PENALTY: Destroyed a verified safe data packet!");
          } else {
            gainedCoins += COINS_PER_KILL * (targetMode === "safe" ? 2 : 1);
            killedNow += 1;
          }
          continue;
        }
        if (m.y >= 90) {
          // @ts-ignore checking custom property
          if (!m.isSafeData) {
            towerDamage += TOWER_DAMAGE;
          } else {
            // Safely delivered true data gives minor shield bonus or score[cite: 1]
            gainedCoins += 2;
          }
          continue;
        }
        survivedMissiles.push(m);
      }

      setBullets(survivedBullets);
      setMissiles(survivedMissiles);
      if (gainedCoins) setCoins((c) => c + gainedCoins);
      if (killedNow) setDestroyed((d) => d + killedNow);
      if (towerDamage) {
        if (!penaltyTriggered) flashCall(false);
        setShield((s) => Math.max(0, s - towerDamage));
      }
    },
    phase === "defense" ? DEFENSE_TICK_MS : null,
  );

  useEffect(() => {
    if (phase === "defense" && shield <= 0) setPhase("outcome");
  }, [phase, shield]);
  useEffect(() => {
    if (phase === "defense" && destroyed >= DESTROY_TARGET) setPhase("outcome");
  }, [phase, destroyed]);

  const dragShip = useCallback((e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const pct = ((e.clientX - r.left) / r.width) * 100;
    shipTarget.current = clamp(pct, 4, 96);
  }, []);
  /* ------------------------------------------------------------- outcome */
  const cleared = phase === "outcome" && shield > 0 && destroyed >= DESTROY_TARGET;
  const failedInFeed = phase === "outcome" && panic >= PANIC_MAX && feedTimeLeft > 0 && destroyed < DESTROY_TARGET && shield > 0 && !cleared;

  const stars = useMemo(
    () => [cleared, cleared && shield >= shieldMax * 0.5, cleared && feedWrong === 0],
    [cleared, shield, shieldMax, feedWrong],
  );
  const clearBonus = cleared ? 40 + destroyed : 0;
  const payout = cleared ? coins + clearBonus : Math.floor(coins / 2);

  const report = useCallback(
    (didClear: boolean) => {
      if (reported.current) return;
      reported.current = true;
      const result: StageResult = {
        cleared: didClear,
        stars: didClear ? stars.filter(Boolean).length : 0,
        tips: didClear ? payout : Math.floor(coins / 2),
        correct: feedCorrect,
        calls: feedCorrect + feedWrong,
      };
      onComplete(result);
    },
    [stars, payout, coins, feedCorrect, feedWrong, onComplete],
  );

  const retryAll = useCallback(() => {
    report(phase === "outcome" && cleared);
    reported.current = false;
    setAttempt((a) => a + 1);
    setPhase("brief1");
    setCoins(0);
    setPanic(0);
    setFeedTimeLeft(FEED_SECONDS);
    setFeedItems([]);
    setFeedCorrect(0);
    setFeedWrong(0);
    setShop({ double: false, shield: false, speed: false });
    setShield(100);
    setDestroyed(0);
    setBullets([]);
    setMissiles([]);
  }, [report, phase, cleared]);

  const leave = useCallback(
    (didClear: boolean) => {
      report(didClear);
      onExit();
    },
    [report, onExit],
  );

  /* ------------------------------------------------------------------ ui */
  const towerPct = shield / shieldMax;
  const panicPct = panic / PANIC_MAX;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }} key={attempt}>
      <TopHud
        tips={tips}
        rank={rank}
        onMap={() => leave(false)}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name={cs.sprite} scale={0.9} />
            <Display size={8} color={C.brassLight}>
              {cs.tag}
            </Display>
            <Body size={13} color={C.paper3}>
              {phase === "feed" || phase === "brief1"
                ? "THE INBOUND FEED"
                : phase === "shop"
                  ? "SIGNAL SHOP"
                  : "THE LOCAL DEFENSE"}
            </Body>
          </div>
        }
        right={
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 6px",
                backgroundColor: C.ink2,
                boxShadow: `0 0 0 2px ${C.ink3}`,
              }}
            >
              <PixelSprite name="coin" scale={1.2} />
              <Mono size={16} color={C.brassLight}>
                {coins}
              </Mono>
            </div>
            {phase === "feed" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 6px",
                  backgroundColor: C.ink2,
                  boxShadow: `0 0 0 2px ${panic >= 70 ? C.red : C.ink3}`,
                }}
              >
                <Mono size={12} color={C.red}>
                  PANIC
                </Mono>
                <PixelMeter value={panicPct} width={90} height={10} cells={12} fill={C.red} />
              </div>
            ) : null}
            {phase === "defense" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 6px",
                  backgroundColor: C.ink2,
                  boxShadow: `0 0 0 2px ${towerPct <= 0.3 ? C.red : C.ink3}`,
                }}
              >
                <Mono size={12} color={C.greenLight}>
                  TOWER
                </Mono>
                <PixelMeter value={towerPct} width={90} height={10} cells={12} fill={C.green} />
              </div>
            ) : null}
            {phase === "feed" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 6px",
                  backgroundColor: C.ink2,
                  boxShadow: `0 0 0 2px ${feedTimeLeft <= 8 ? C.red : C.ink3}`,
                }}
              >
                <PixelSprite name={clockFrame % 2 ? "clock2" : "clock1"} scale={1.2} />
                <Mono size={16} color={feedTimeLeft <= 8 ? C.red : C.paper2}>
                  0:{String(feedTimeLeft).padStart(2, "0")}
                </Mono>
              </div>
            ) : null}
            {phase === "defense" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 6px",
                  backgroundColor: C.ink2,
                  boxShadow: `0 0 0 2px ${C.ink3}`,
                }}
              >
                <Mono size={13} color={C.paper2}>
                  {destroyed}/{DESTROY_TARGET}
                </Mono>
              </div>
            ) : null}
          </>
        }
      />

      <div style={{ flex: 1, position: "relative", overflow: "hidden", backgroundColor: C.ink }}>
        {/* screen flash + toast, shared by both stages */}
        {flash ? (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: flash === "good" ? C.green : C.red,
              opacity: 0.22,
              zIndex: 15,
              pointerEvents: "none",
            }}
          />
        ) : null}
        {note ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 10,
              transform: "translateX(-50%)",
              maxWidth: "88%",
              padding: "5px 9px",
              backgroundColor: C.ink,
              boxShadow: `0 0 0 2px ${C.brassDark}`,
              zIndex: 16,
              textAlign: "center",
            }}
          >
            <Body size={13} color={C.paper}>
              {note}
            </Body>
          </div>
        ) : null}

        {phase === "brief1" ? (
          <Brief1Card onStart={() => setPhase("feed")} />
        ) : null}

        {phase === "feed" ? (
          <div aria-hidden={false} style={{ position: "absolute", inset: 0, ...speckle(C.ink, C.ink2, 4) }}>
            {feedItems.map((it) => {
              const tone = FEED_TONE[it.kind];
              const life = it.ttl / FEED_ITEM_TTL_TICKS;
              return (
                <button
                  key={it.uid}
                  type="button"
                  data-interactive="feed-item"
                  aria-label={`Button — ${it.misinfo ? "Smash" : "Leave"}: ${it.text}`}
                  onClick={() => smash(it.uid)}
                  style={{
                    position: "absolute",
                    left: `${it.x}%`,
                    top: `${it.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: 148,
                    maxWidth: "58vw",
                    padding: "5px 7px",
                    textAlign: "left",
                    cursor: "pointer",
                    backgroundColor: tone.bg,
                    boxShadow: `inset 2px 2px 0 0 rgba(255,255,255,0.25), inset -2px -2px 0 0 rgba(0,0,0,0.25), 0 0 0 2px ${tone.border}`,
                    zIndex: 2,
                  }}
                >
                  <Mono size={10} color={tone.labelColor}>
                    {tone.label}
                  </Mono>
                  <div style={{ marginTop: 2 }}>
                    <Body size={12} color={tone.text}>
                      {it.text}
                    </Body>
                  </div>
                  <div style={{ marginTop: 4, height: 4, backgroundColor: "rgba(0,0,0,0.25)" }}>
                    <div style={{ width: `${life * 100}%`, height: "100%", backgroundColor: tone.labelColor }} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {phase === "shop" ? (
          <ShopCard
            coins={coins}
            shop={shop}
            onBuy={buy}
            startShield={shop.shield ? Math.min(shieldMax, startShield + 25) : startShield}
            shieldMax={shieldMax}
            onDeploy={() => setPhase("defense")}
          />
        ) : null}

        {phase === "defense" ? (
          <div
            onPointerMove={dragShip}
            onPointerDown={dragShip}
            style={{ position: "absolute", inset: 0, ...speckle(C.ink, C.ink2, 4), touchAction: "none" }}
          >
            {/* tower row */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 6,
                backgroundColor: towerPct <= 0.3 ? C.red : C.brassDark,
              }}
            />
            {missiles.map((m) => (
              <div
                key={m.id}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "2px 5px",
                  backgroundColor: C.redDark,
                  boxShadow: `0 0 0 2px ${C.ink}`,
                  zIndex: 2,
                }}
              >
                <PixelSprite name="popup" scale={1} />
                <Mono size={10} color={C.white}>
                  {m.label}
                </Mono>
              </div>
            ))}
            {bullets.map((b) => (
              <div
                key={b.id}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: 4,
                  height: 12,
                  backgroundColor: C.greenLight,
                  boxShadow: `0 0 0 1px ${C.ink}`,
                  zIndex: 2,
                }}
              />
            ))}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: `${shipX}%`,
                top: "88%",
                transform: "translate(-50%, -50%)",
                zIndex: 3,
              }}
            >
              <PixelSprite name="shield" scale={2.2} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 8,
                top: 6,
                padding: "3px 6px",
                backgroundColor: C.ink2,
                boxShadow: `0 0 0 2px ${C.ink3}`,
              }}
            >
              <Mono size={12} color={C.paper3}>
                DRAG TO STEER — AUTOFIRE IS ON
              </Mono>
            </div>
          </div>
        ) : null}

        {phase === "outcome" ? (
          <PoliceOutcome
            cs={cs}
            cleared={cleared}
            stars={stars}
            coins={coins}
            bonus={clearBonus}
            payout={payout}
            destroyed={destroyed}
            feedWrong={feedWrong}
            onRetry={retryAll}
            onLeave={() => leave(cleared)}
          />
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- briefing */

function Brief1Card({ onStart }: { onStart: () => void }) {
  return (
    <Overlay>
      <div
        style={{
          width: 440,
          maxWidth: "94%",
          padding: 14,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ boxShadow: `0 0 0 2px ${C.ink}` }}>
            <PixelSprite name="popup" scale={2} />
          </div>
          <div>
            <Mono size={13} color={C.paper4}>
              STAGE 1 OF 2
            </Mono>
            <br />
            <Display size={11} color={C.ink}>
              THE INBOUND FEED
            </Display>
          </div>
        </div>

        <div style={{ marginTop: 8, padding: "6px 8px", backgroundColor: C.paper3, boxShadow: `0 0 0 2px ${C.ink}` }}>
          <Display size={7} color={C.red}>
            OBJECTIVE
          </Display>
          <div style={{ marginTop: 3 }}>
            <Body size={14} color={C.ink}>
              Smash the misinformation before it lands. Leave the true reports alone.
            </Body>
          </div>
        </div>

        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            "Tap a card the moment you're sure it's a false or misleading claim.",
            "A true report costs you nothing — leave it, it fades on its own.",
            "Tapping a true report, or letting misinformation expire, raises the Panic Meter.",
            "How calm you keep the feed decides how much shield your tower starts with.",
          ].map((h) => (
            <div key={h} style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
              <div
                style={{
                  flex: "0 0 auto",
                  width: 10,
                  height: 10,
                  marginTop: 3,
                  backgroundColor: C.ink,
                  boxShadow: `inset 2px 2px 0 0 ${C.paper4}`,
                }}
              />
              <Body size={13} color={C.ink}>
                {h}
              </Body>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <Mono size={13} color={C.paper4}>
            {FEED_SECONDS}s ON THE CLOCK
          </Mono>
          <div style={{ flex: 1 }} />
          <PixelButton variant="red" size={10} icon="magnifier" iconScale={1.1} onClick={onStart} label="Button — Open the feed">
            OPEN THE FEED
          </PixelButton>
        </div>
      </div>
    </Overlay>
  );
}

/* -------------------------------------------------------------------shop */

function ShopCard({
  coins,
  shop,
  onBuy,
  startShield,
  shieldMax,
  onDeploy,
}: {
  coins: number;
  shop: ShopState;
  onBuy: (key: keyof ShopState) => void;
  startShield: number;
  shieldMax: number;
  onDeploy: () => void;
}) {
  return (
    <Overlay>
      <div
        style={{
          width: 480,
          maxWidth: "96%",
          padding: 8,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ boxShadow: `0 0 0 2px ${C.ink}` }}>
            <PixelSprite name="briefcase" scale={1.5} />
          </div>
          <div>
            <Mono size={11} color={C.paper4}>
              FEED CONTAINED
            </Mono>
            <br />
            <Display size={9} color={C.ink}>
              SIGNAL SHOP
            </Display>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <PixelSprite name="coin" scale={1.2} />
            <Display size={10} color={C.ink}>
              {coins}
            </Display>
          </div>
        </div>

        <div style={{ marginTop: 4, padding: "4px 6px", backgroundColor: C.paper3, boxShadow: `0 0 0 2px ${C.ink}` }}>
          <Body size={11} color={C.ink}>
            Deploying with <b>{startShield}/{shieldMax}</b> tower shield — spend Data Coins here, or save them for the payout.
          </Body>
        </div>

        <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          {SHOP_ITEMS.map((it) => {
            const owned = shop[it.key];
            const afford = coins >= it.cost;
            return (
              <div
                key={it.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 6px",
                  backgroundColor: owned ? C.paper : C.paper2,
                  boxShadow: `0 0 0 2px ${C.ink}`,
                }}
              >
                <PixelSprite name={it.icon} scale={1.2} />
                <div style={{ flex: 1 }}>
                  <Display size={7} color={C.ink}>
                    {it.name}
                  </Display>
                  <div>
                    <Body size={10} color={C.ink}>
                      {it.desc}
                    </Body>
                  </div>
                </div>
                <PixelButton
                  variant={owned ? "ink" : "green"}
                  size={7}
                  disabled={owned || !afford}
                  onClick={() => onBuy(it.key)}
                  label={`Button — Buy ${it.name}`}
                >
                  {owned ? "OWNED" : `${it.cost} ◎`}
                </PixelButton>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 4, padding: "5px 7px", backgroundColor: C.ink2, boxShadow: `0 0 0 2px ${C.ink3}`, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Display size={6} color={C.brassLight}>
              STAGE 2 — THE LOCAL DEFENSE
            </Display>
            <PixelButton 
              variant="green" 
              size={8} 
              icon="shield" 
              iconScale={0.9} 
              onClick={onDeploy} 
              label="Button — Deploy to Tower"
            >
              DEPLOY
            </PixelButton>
          </div>
          <div>
            <Body size={10} color={C.paper2}>
              Drag anywhere to steer the firewall ship — it autofires. Shoot clickbait invaders before they reach the tower.
            </Body>
          </div>
        </div>

      </div>
    </Overlay>
  );
}

/* ------------------------------------------------------------ outcome */

const POLICE_STARS = [
  "Destroy the required invaders",
  "Finish with at least half tower shield",
  "Make no wrong calls in the feed",
];

function PoliceOutcome({
  cs,
  cleared,
  stars,
  coins,
  bonus,
  payout,
  destroyed,
  feedWrong,
  onRetry,
  onLeave,
}: {
  cs: CaseDef;
  cleared: boolean;
  stars: boolean[];
  coins: number;
  bonus: number;
  payout: number;
  destroyed: number;
  feedWrong: number;
  onRetry: () => void;
  onLeave: () => void;
}) {
  return (
    <Overlay>
      <div
        style={{
          width: 460,
          maxWidth: "94%",
          padding: 14,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 3px 3px 0 0 ${C.white}, inset -3px -3px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <PixelSprite name={cleared ? "check" : "cross"} scale={2} />
          <Display size={14} color={cleared ? C.green : C.red}>
            {cleared ? "STAGE CLEAR" : "STAGE FAILED"}
          </Display>
        </div>
        <br />
        <Mono size={14} color={C.paper4}>
          {cs.tag} · {cs.building.toUpperCase()}
        </Mono>

        <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
          <StarRow earned={stars} scale={2.4} animate={cleared} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
          {POLICE_STARS.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <PixelSprite name={stars[i] ? "starOn" : "starOff"} scale={1} />
              <Mono size={13} color={stars[i] ? C.ink : C.paper4}>
                {label.toUpperCase()}
              </Mono>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            padding: "6px 8px",
            backgroundColor: C.ink,
            boxShadow: `0 0 0 2px ${C.brassDark}`,
            flexWrap: "wrap",
          }}
        >
          <Mono size={14} color={C.paper3}>
            DESTROYED {destroyed}/{DESTROY_TARGET}
          </Mono>
          {cleared ? (
            <Mono size={14} color={C.paper3}>
              · CLEAR BONUS {bonus}
            </Mono>
          ) : null}
          <Mono size={14} color={C.paper3}>
            · WRONG CALLS {feedWrong}
          </Mono>
        </div>

        <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <PixelSprite name="coin" scale={1.4} />
          <Display size={11} color={C.ink}>
            {payout} TIPS EARNED
          </Display>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
          <PixelButton variant="paper" size={9} onClick={onRetry} label="Button — Run the stage again">
            RUN IT AGAIN
          </PixelButton>
          <PixelButton variant="red" size={9} icon="pin" iconScale={1.1} onClick={onLeave} label="Button — Back to the map">
            {cleared ? "NEXT STAGE ▸" : "BACK TO MAP"}
          </PixelButton>
        </div>
      </div>
    </Overlay>
  );
}