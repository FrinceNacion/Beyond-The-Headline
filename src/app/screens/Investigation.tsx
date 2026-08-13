import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelChip, PixelSprite } from "../components/Pixel";
import { TopHud } from "../components/Hud";
import { parseSegments, type CaseDef, type Hotspot, type SourceKind } from "../game/cases";
import { rumorLines, type RumorTrigger } from "../game/story";
import { RumorBubble } from "../components/RumorBubble";
import { VERDICT, nextPhase, type PhaseId } from "../game/mil";
import { profileFor, siftFor } from "../game/sift";
import type { Mark, Marks } from "../game/marks";
import { MarkModal } from "./MarkModal";
import { PhaseBar, PhaseHint } from "./sift/PhaseBar";
import { StopOverlay } from "./sift/StopOverlay";
import { SourcePanel } from "./sift/SourcePanel";
import { CoveragePanel } from "./sift/CoveragePanel";
import { TracePanel } from "./sift/TracePanel";
import { ChartView } from "./sift/ChartView";
import { CompetencyBadge } from "../components/CompetencyBadge";

export type { Mark, Marks } from "../game/marks";

const TABS: { kind: SourceKind; label: string; icon: string }[] = [
  { kind: "article", label: "ARTICLE", icon: "doc" },
  { kind: "social", label: "SOCIAL POST", icon: "phone" },
  { kind: "quote", label: "OFFICIAL QUOTE", icon: "quotecard" },
  { kind: "chart", label: "CHART / STAT", icon: "chart" },
];

/** A claim underlined in red pencil. */
function HotspotSpan({
  hs,
  mark,
  revealed,
  locked,
  onOpen,
}: {
  hs: Hotspot;
  mark?: Mark;
  revealed?: boolean;
  /** true until all four SIFT moves are done */
  locked?: boolean;
  onOpen: () => void;
}) {
  const v = mark ? VERDICT[mark.verdict] : null;
  return (
    <span
      role="button"
      tabIndex={0}
      data-interactive="hotspot"
      aria-label={`Claim — ${hs.text}${v ? `, marked ${v.label}` : locked ? ", locked until you finish checking" : ""}`}
      aria-disabled={locked || undefined}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={revealed && !v ? "bth-nudge" : undefined}
      style={{
        display: "inline",
        cursor: locked ? "not-allowed" : "pointer",
        color: C.ink,
        backgroundColor: v
          ? v.family === "clean"
            ? "rgba(47,111,78,0.22)"
            : "rgba(183,41,30,0.18)"
          : revealed
            ? "rgba(217,181,126,0.5)"
            : "transparent",
        boxShadow: v ? `inset 0 -3px 0 0 ${v.color}` : `inset 0 -2px 0 0 ${locked ? C.paper4 : C.red}`,
        padding: "0 1px",
      }}
    >
      {hs.text}
      {v ? (
        <span style={{ display: "inline-block", verticalAlign: "-2px", marginLeft: 3 }}>
          {/* code + glyph, so the state survives any colour vision */}
          <span style={{ padding: "0 2px", backgroundColor: v.color }}>
            <Mono size={11} color={C.white}>
              {v.code}
            </Mono>
          </span>
        </span>
      ) : null}
    </span>
  );
}

function renderBody(
  text: string,
  hotspots: Hotspot[],
  marks: Marks,
  revealed: string[],
  open: (id: string) => void,
  size = 14,
  locked = false,
) {
  return parseSegments(text).map((seg, i) => {
    if (!seg.hs) return <Body key={i} size={size} color={C.ink}>{seg.text}</Body>;
    const hs = hotspots.find((h) => h.id === seg.hs);
    if (!hs) return <Body key={i} size={size} color={C.ink}>{seg.text}</Body>;
    return (
      <Body key={i} size={size} color={C.ink}>
        <HotspotSpan
          hs={hs}
          mark={marks[hs.id]}
          revealed={revealed.includes(hs.id)}
          locked={locked}
          onOpen={() => open(hs.id)}
        />
      </Body>
    );
  });
}

/* --------------------------------------------------------------- source views */

function ArticleView(p: {
  cs: CaseDef;
  marks: Marks;
  revealed: string[];
  locked?: boolean;
  open: (id: string) => void;
}) {
  const hs = p.cs.hotspots.filter((h) => h.source === "article");
  return (
    <div
      className="bth-scroll"
      style={{
        height: "100%",
        overflowY: "auto",
        ...speckle(C.paper, C.paper2, 4),
        boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
        padding: "8px 12px 12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Mono size={14} color={C.ink3}>
          {p.cs.article.outlet}
        </Mono>
        <Mono size={13} color={C.paper4}>
          {p.cs.article.dateline}
        </Mono>
      </div>
      <div style={{ borderTop: `2px solid ${C.ink}`, margin: "4px 0 6px" }} />
      <Display size={12} color={C.ink} style={{ lineHeight: 1.5 }}>
        {p.cs.article.headline}
      </Display>
      <div style={{ margin: "6px 0 8px" }}>
        <Mono size={14} color={C.paper4}>
          {p.cs.article.byline}
        </Mono>
      </div>
      <div style={{ columnCount: 2, columnGap: 14 }}>
        {p.cs.article.body.map((para, i) => (
          <p key={i} style={{ margin: "0 0 8px", breakInside: "avoid" }}>
            {renderBody(para, hs, p.marks, p.revealed, p.open, 14, p.locked)}
          </p>
        ))}
      </div>
    </div>
  );
}

function SocialView(p: {
  cs: CaseDef;
  marks: Marks;
  revealed: string[];
  locked?: boolean;
  open: (id: string) => void;
}) {
  const hs = p.cs.hotspots.filter((h) => h.source === "social");
  const s = p.cs.social;
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...speckle(C.ink2, C.ink3, 4),
        boxShadow: `0 0 0 2px ${C.ink}`,
      }}
    >
      <div style={{ width: 430, backgroundColor: C.ink, boxShadow: `0 0 0 2px ${C.brassDark}` }}>
        {/* app chrome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "3px 6px",
            backgroundColor: C.ink3,
          }}
        >
          <Mono size={14} color={C.brassLight}>
            {s.app}
          </Mono>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 6, height: 6, backgroundColor: C.paper4 }} />
            ))}
          </div>
        </div>

        <div style={{ padding: 8, display: "flex", gap: 8, backgroundColor: C.paper }}>
          <div style={{ flex: "0 0 auto", boxShadow: `0 0 0 2px ${C.ink}`, alignSelf: "flex-start"  }}>
            <PixelSprite name={s.avatar} scale={2.6} title={s.display} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <Body size={14} color={C.ink} style={{ fontWeight: 700 }}>
                {s.display}
              </Body>
              <Mono size={13} color={C.paper4}>
                {s.handle} · {s.time}
              </Mono>
            </div>
            <p style={{ margin: "5px 0 0" }}>{renderBody(s.body, hs, p.marks, p.revealed, p.open, 15, p.locked)}</p>
          </div>
        </div>

        {/* blocky engagement numbers */}
        <div style={{ display: "flex", gap: 0, backgroundColor: C.paper2, borderTop: `2px solid ${C.ink}` }}>
          {[
            { l: "LIKES", v: s.likes },
            { l: "REPOSTS", v: s.reposts },
            { l: "REPLIES", v: s.replies },
          ].map((m) => (
            <div
              key={m.l}
              style={{
                flex: 1,
                padding: "3px 6px",
                borderRight: `2px solid ${C.ink}`,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div style={{ width: 6, height: 6, backgroundColor: C.red }} />
              <Mono size={16} color={C.ink}>
                {m.v}
              </Mono>
              <Mono size={12} color={C.paper4}>
                {m.l}
              </Mono>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuoteView(p: {
  cs: CaseDef;
  marks: Marks;
  revealed: string[];
  locked?: boolean;
  open: (id: string) => void;
}) {
  const hs = p.cs.hotspots.filter((h) => h.source === "quote");
  const q = p.cs.quote;
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...speckle(C.ink2, C.ink3, 4),
        boxShadow: `0 0 0 2px ${C.ink}`,
      }}
    >
      <div
        style={{
          width: 460,
          padding: 10,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        {/* index card ruling */}
        <div style={{ height: 2, backgroundColor: C.red, marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: "0 0 auto", boxShadow: `0 0 0 2px ${C.ink}`, alignSelf: "flex-start" }}>
            <PixelSprite name={q.avatar} scale={2.4} title={q.speaker} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0 }}>{renderBody(q.body, hs, p.marks, p.revealed, p.open, 16, p.locked)}</p>
            <div style={{ marginTop: 8, borderTop: `2px dotted ${C.paper4}`, paddingTop: 5 }}>
              <Body size={13} color={C.ink} style={{ fontWeight: 700 }}>
                {q.speaker}
              </Body>
              <br />
              <Mono size={14} color={C.paper4}>
                {q.role} · {q.outletNote}
              </Mono>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- main screen */

export function Investigation({
  cs,
  tips,
  rank,
  marks,
  inventory,
  timeLeft,
  mode = "story",
  runLabel,
  clockFrame = 0,
  onMark,
  onHint,
  onUseRedPen,
  onSubmit,
  onMap,
  onShop,
}: {
  cs: CaseDef;
  tips: number;
  rank: string;
  marks: Marks;
  inventory: Record<string, number>;
  timeLeft: number;
  /** story play, or a Beat the Clock run (red accents + ticking clock) */
  mode?: "story" | "clock";
  runLabel?: string;
  /** 2-frame tick supplied by the app clock */
  clockFrame?: number;
  onMark: (id: string, m: Mark) => void;
  /** returns the revealed hotspot id, or null if unaffordable */
  onHint: (unmarked: string[]) => string | null;
  onUseRedPen: (ids: string[]) => string[] | null;
  onSubmit: () => void;
  onMap: () => void;
  onShop: () => void;
}) {
  const [tab, setTab] = useState<SourceKind>("article");
  const [reading, setReading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [viewedTabs, setViewedTabs] = useState<Set<SourceKind>>(new Set(["article"]));
  const [showRefPanel, setShowRefPanel] = useState<"coverage" | "trace" | null>(null);
  const [fileConfirm, setFileConfirm] = useState(false);
  const sift = useMemo(() => siftFor(cs.id), [cs.id]);

  /* SIFT gating. The player walks Stop -> Investigate -> Find Better -> Trace
     before a single claim can be marked. Skipping is the habit the game is
     trying to break, so there is no skip. */
  const [phase, setPhase] = useState<PhaseId>("stop");
  const [done, setDone] = useState<Record<PhaseId, boolean>>({
    stop: false,
    source: false,
    coverage: false,
    trace: false,
    mark: false,
  });
  const [stopShown, setStopShown] = useState(false);
  const canMark = done.trace;

  useEffect(() => {
    setPhase("stop");
    setDone({ stop: false, source: false, coverage: false, trace: false, mark: false });
    setStopShown(false);
    setTab("article");
    setRevealed([]);
    setViewedTabs(new Set(["article"]));
    setShowRefPanel(null);
    setFileConfirm(false);
  }, [cs.id]);

  const completePhase = useCallback((p: PhaseId) => {
    setDone((d) => ({ ...d, [p]: true }));
    setPhase(nextPhase(p));
  }, []);

  /** shown when a claim is tapped before the four moves are done */
  const [gateWarn, setGateWarn] = useState(false);
  const openClaim = useCallback(
    (id: string) => {
      if (!done.trace) {
        setGateWarn(true);
        window.setTimeout(() => setGateWarn(false), 3200);
        return;
      }
      setOpenId(id);
    },
    [done.trace],
  );

  /* Rumor — the town's least reliable narrator. Fires on entry, on the first
     reveal, on each flag, and on idle. Always optional, never blocking. */
  const [rumor, setRumor] = useState<string | null>(null);
  const rumorSeen = useRef(0);
  const markCount = Object.keys(marks).length;

  const sayRumor = useCallback(
    (trigger: RumorTrigger) => {
      if (mode === "clock") return; // the clock run has no room for hearsay
      const lines = rumorLines(cs.id, trigger);
      if (!lines.length) return;
      setRumor(lines[rumorSeen.current++ % lines.length]);
    },
    [cs.id, mode],
  );

  // opening line, once per case
  useEffect(() => {
    rumorSeen.current = 0;
    setRumor(null);
    const t = window.setTimeout(() => sayRumor("open"), 1200);
    return () => window.clearTimeout(t);
  }, [cs.id, sayRumor]);

  // he pipes up when you commit to a call
  useEffect(() => {
    if (markCount > 0) sayRumor("flag");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markCount]);

  // and again if you go quiet
  useEffect(() => {
    const t = window.setInterval(() => sayRumor("idle"), 26000);
    return () => window.clearInterval(t);
  }, [sayRumor]);

  const unmarked = useMemo(
    () => cs.hotspots.filter((h) => !marks[h.id]).map((h) => h.id),
    [cs, marks],
  );
  const openHs = openId ? cs.hotspots.find((h) => h.id === openId) : undefined;
  const mins = Math.floor(Math.max(0, timeLeft) / 60);
  const secs = Math.max(0, timeLeft) % 60;
  const clock = mode === "clock";
  const accent = clock ? C.red : C.brass;
  const accentDark = clock ? C.redDark : C.brassDark;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <TopHud
        tips={tips}
        rank={rank}
        accent={accentDark}
        onMap={clock ? undefined : onMap}
        onShop={clock ? undefined : onShop}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            {clock ? <PixelSprite name="stopwatch" scale={1} /> : null}
            <Display size={8} color={clock ? C.red : C.brassLight}>
              {clock ? runLabel ?? "BEAT THE CLOCK" : cs.tag}
            </Display>
            <Body size={13} color={C.paper3}>
              {cs.title}
            </Body>
          </div>
        }
        right={
          <>
            {/* which UNESCO competency this case is drilling */}
            <CompetencyBadge id={sift.competency} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 6px",
                backgroundColor: C.ink2,
                boxShadow: `0 0 0 2px ${timeLeft <= 30 ? C.red : clock ? C.redDark : C.ink3}`,
              }}
            >
              {/* ticking pixel clock in time attack, desk hourglass in story play */}
              <PixelSprite name={clock ? (clockFrame % 2 ? "clock2" : "clock1") : "hourglass"} scale={clock ? 1.4 : 1} />
              <Mono size={clock ? 20 : 16} color={timeLeft <= 30 ? C.red : clock ? C.paper : C.paper2}>
                {mins}:{String(secs).padStart(2, "0")}
              </Mono>
            </div>
            <button
              type="button"
              data-interactive="powerup"
              aria-label="Button — Hint power-up"
              onClick={() => {
                const id = onHint(unmarked);
                if (id) {
                  setRevealed((r) => [...r, id]);
                  const hs = cs.hotspots.find((h) => h.id === id);
                  if (hs) setTab(hs.source);
                  sayRumor("reveal");
                }
              }}
              disabled={!unmarked.length}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px",
                cursor: unmarked.length ? "pointer" : "not-allowed",
                backgroundColor: unmarked.length ? accent : C.ink3,
                boxShadow: `inset 2px 2px 0 0 ${unmarked.length ? (clock ? "#D6483C" : C.brassLight) : C.ink4}, inset -2px -2px 0 0 ${accentDark}, 0 0 0 2px ${C.ink}`,
              }}
            >
              <PixelSprite name="magnifier" scale={1.2} desaturate={!unmarked.length} />
              <Mono size={14} color={clock ? C.white : C.ink}>
                HINT
              </Mono>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  backgroundColor: C.ink,
                  padding: "0 3px",
                }}
              >
                <PixelSprite name="coin" scale={0.9} />
                <Mono size={13} color={C.brassLight}>
                  {inventory.magnifier > 0 ? `FREE x${inventory.magnifier}` : "25"}
                </Mono>
              </span>
            </button>
          </>
        }
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* left-docked folder tabs */}
        <div
          style={{
            flex: "0 0 116px",
            ...speckle(C.ink2, C.ink3, 4),
            paddingTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.kind;
            const slots = cs.hotspots.filter((h) => h.source === t.kind);
            const tabDone = slots.length > 0 && slots.every((h) => marks[h.id]);
            const sourceTabViewed = viewedTabs.has(t.kind);
            // tabs that have no claims (e.g. chart) are always "viewed"
            const needsView = slots.length > 0 && !sourceTabViewed && phase === "source" && !done.source;
            return (
              <button
                key={t.kind}
                type="button"
                data-interactive="tab"
                aria-label={`Tab — ${t.label}`}
                onClick={() => { setTab(t.kind); setViewedTabs((v) => { const n = new Set(v); n.add(t.kind); return n; }); }}
                style={{
                  marginLeft: active ? -4 : 6,
                  marginRight: active ? 0 : 4,
                  padding: "6px 4px 6px 6px",
                  textAlign: "left",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: active ? C.paper : C.paper3,
                  boxShadow: active
                    ? `inset 3px 0 0 0 ${C.red}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`
                    : `inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <PixelSprite name={t.icon} scale={1.3} />
                  <Display size={7} color={C.ink}>
                    {t.label}
                  </Display>
                </div>
                <Mono size={12} color={tabDone ? C.green : C.ink3}>
                  {slots.length
                    ? `${slots.filter((h) => marks[h.id]).length}/${slots.length} MARKED`
                    : "REFERENCE"}
                </Mono>
                {needsView && (
                  <div style={{ position: "absolute", left: 2, bottom: 2, width: 6, height: 6, backgroundColor: C.red }} />
                )}
                <div style={{ position: "absolute", right: 2, top: -6 }}>
                  <PixelSprite name="pin" scale={0.8} />
                </div>
              </button>
            );
          })}

          <div style={{ marginTop: "auto", padding: 6 }}>
            <PixelButton
              full
              variant="paper"
              size={7}
              icon="redpen"
              iconScale={1}
              disabled={!inventory.redpen}
              onClick={() => {
                const ids = onUseRedPen(cs.hotspots.filter((h) => h.source === tab && !marks[h.id]).map((h) => h.id));
                if (ids) setRevealed((r) => [...r, ...ids]);
              }}
              label="Button — Red Pen power-up"
            >
              RED PEN {inventory.redpen ? `x${inventory.redpen}` : ""}
            </PixelButton>
          </div>
        </div>

        {/* content + tray */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, padding: 6, gap: 6 }}>
          <PhaseBar phase={phase} done={done} onGo={(p) => { setReading(false); setShowRefPanel(null); setPhase(p); }} />
          <PhaseHint phase={phase} done={done} canMark={canMark} onOpenRef={setShowRefPanel} />

          {/* reading with the source panel parked — one tap brings it back,
              and each folder tab carries its own credibility record */}
          {phase === "source" && reading ? (
            <PixelButton
              variant="brass"
              size={8}
              icon="siftSource"
              iconScale={1}
              onClick={() => setReading(false)}
              label="Button — reopen source credibility"
            >
              REOPEN: WHO SAID THIS? — {TABS.find((t) => t.kind === tab)?.label}
            </PixelButton>
          ) : null}

          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            {phase === "source" && !reading ? (
              <SourcePanel
                outlet={profileFor(cs.id, tab)}
                sourceLabel={TABS.find((t) => t.kind === tab)?.label}
                onDone={() => completePhase("source")}
                onBack={() => setReading(true)}
              />
            ) : phase === "coverage" ? (
              <CoveragePanel snippets={sift.coverage} onDone={() => completePhase("coverage")} />
            ) : phase === "trace" ? (
              <TracePanel trace={sift.trace} onDone={() => completePhase("trace")} />
            ) : tab === "article" ? (
              <ArticleView cs={cs} marks={marks} revealed={revealed} locked={!canMark} open={openClaim} />
            ) : tab === "social" ? (
              <SocialView cs={cs} marks={marks} revealed={revealed} locked={!canMark} open={openClaim} />
            ) : tab === "chart" ? (
              <ChartView chart={sift.chart} />
            ) : (
              <QuoteView cs={cs} marks={marks} revealed={revealed} locked={!canMark} open={openClaim} />
            )}

            {/* Research reference overlay — slides in when player taps COVERAGE or TRACE buttons */}
            {showRefPanel && canMark ? (
              <div
                className="bth-slide-r"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  {showRefPanel === "coverage" ? (
                    <CoveragePanel snippets={sift.coverage} readOnly onDone={() => setShowRefPanel(null)} />
                  ) : (
                    <TracePanel trace={sift.trace} readOnly onDone={() => setShowRefPanel(null)} />
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* evidence tray */}
          <div
            style={{
              flex: "0 0 54px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 6px",
              backgroundColor: C.ink,
              boxShadow: `inset 0 2px 0 0 ${accentDark}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <Display size={7} color={clock ? C.red : C.brassLight}>
                EVIDENCE
              </Display>
              <Mono size={13} color={accent}>
                TRAY {Object.keys(marks).length}/{cs.hotspots.length}
              </Mono>
            </div>
            <div style={{ flex: 1, display: "flex", gap: 4 }}>
              {cs.hotspots.map((h) => {
                const m = marks[h.id];
                return (
                  <button
                    key={h.id}
                    type="button"
                    data-interactive="evidence-slot"
                    aria-label={`Evidence slot — ${m ? h.text : "empty"}`}
                    onClick={() => {
                      setPhase("mark");
                      setTab(h.source);
                      if (m) openClaim(h.id);
                    }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: 42,
                      textAlign: "left",
                      padding: "3px 4px",
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: m ? C.paper2 : C.ink2,
                      boxShadow: m
                        ? `inset 2px 2px 0 0 ${C.paper}, inset -2px -2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`
                        : `inset 2px 2px 0 0 ${C.ink3}, 0 0 0 2px ${C.ink3}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      {m ? (
                        <span style={{ padding: "0 2px", backgroundColor: VERDICT[m.verdict].color }}>
                          <Mono size={11} color={C.white}>
                            {VERDICT[m.verdict].code}
                          </Mono>
                        </span>
                      ) : (
                        <PixelSprite name="doc" scale={0.9} desaturate />
                      )}
                      <Mono size={12} color={m ? C.ink3 : C.ink4}>
                        {m ? VERDICT[m.verdict].label : "EMPTY"}
                      </Mono>
                    </div>
                    <span
                      style={{
                        fontFamily: '"Pixelify Sans", monospace',
                        fontSize: 11,
                        lineHeight: 1.05,
                        color: m ? C.ink : C.ink4,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {m ? h.text : "unmarked claim"}
                    </span>
                  </button>
                );
              })}
            </div>
            <PixelButton
              variant={Object.keys(marks).length ? "red" : "ink"}
              size={9}
              icon="stamp"
              iconScale={1}
              disabled={!Object.keys(marks).length}
              onClick={() => {
                const markedCount = Object.keys(marks).length;
                const total = cs.hotspots.length;
                // warn if fewer than half are marked
                if (markedCount < total) {
                  setFileConfirm(true);
                } else {
                  onSubmit();
                }
              }}
              label="Button — File the case"
            >
              FILE CASE
            </PixelButton>
          </div>
        </div>
      </div>

      {/* marking is locked until the four moves are done — guide them, don't just refuse */}
      {gateWarn ? (
        <div
          role="status"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 70,
            transform: "translateX(-50%)",
            zIndex: 35,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            backgroundColor: C.ink,
            boxShadow: `0 0 0 2px ${C.brass}, inset 2px 2px 0 0 ${C.ink3}`,
          }}
        >
          <PixelSprite name="lock" scale={1.1} />
          <div>
            <Mono size={14} color={C.brassLight}>
              COMPLETE THE SIFT STEPS FIRST
            </Mono>
            <br />
            <Mono size={12} color={C.paper4}>
              Check the bar above — tap the next highlighted step.
            </Mono>
          </div>
        </div>
      ) : null}

      {/* pre-file confirm when not all claims are marked */}
      {fileConfirm ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm filing case"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 35,
            backgroundColor: "rgba(20,24,28,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setFileConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 380,
              padding: 12,
              backgroundColor: C.paper,
              boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <PixelSprite name="flag" scale={1.3} />
              <Display size={9} color={C.red}>
                NOT ALL CLAIMS MARKED
              </Display>
            </div>
            <Body size={14} color={C.ink}>
              You've marked{" "}
              <strong>{Object.keys(marks).length}</strong> of{" "}
              <strong>{cs.hotspots.length}</strong> claims.{" "}
              The unmarked ones will show as skipped — and skipping misleading claims is a miss.
            </Body>
            <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
              <PixelButton variant="ink" size={9} onClick={() => setFileConfirm(false)} label="Button — Keep marking">
                ◂ KEEP MARKING
              </PixelButton>
              <PixelButton variant="red" size={9} icon="stamp" iconScale={1} onClick={() => { setFileConfirm(false); onSubmit(); }} label="Button — File anyway">
                FILE ANYWAY
              </PixelButton>
            </div>
          </div>
        </div>
      ) : null}

      {rumor && !openHs ? <RumorBubble text={rumor} onDismiss={() => setRumor(null)} /> : null}

      {/* Screen 5a — the two-second pause, once per case */}
      {!stopShown ? (
        <StopOverlay
          headline={cs.article.headline}
          onContinue={() => {
            setStopShown(true);
            completePhase("stop");
          }}
        />
      ) : null}

      {openHs ? (
        <MarkModal
          hs={openHs}
          existing={marks[openHs.id]}
          canRecheck={inventory.secondsource > 0}
          onCancel={() => setOpenId(null)}
          onConfirm={(m) => {
            onMark(openHs.id, m);
            setOpenId(null);
          }}
        />
      ) : null}
    </div>
  );
}
