import React, { useState } from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelSprite, TipsCounter } from "../components/Pixel";
import { TopHud, HudButton } from "../components/Hud";
import { CASES } from "../game/cases";
import { useFrame } from "../components/useFrame";
import { CastShadow, LAYER_META, LayerLegend, Prop, type Layer } from "../components/TownProps";
import { StarCount } from "../components/Stars";
import { LeaderboardPanel } from "../components/LeaderboardPanel";

const MAP_W = 844;
const MAP_H = 356;

/* Level nodes — foreground layer, larger and more saturated than the houses.
   Eight stops now: the two drill stages open the route, the six original
   files finish it. Same zig-zag, tighter pitch. */
const NODES = [
  { x: 14, y: 172 },
  { x: 118, y: 44 },
  { x: 222, y: 178 },
  { x: 326, y: 38 },
  { x: 430, y: 176 },
  { x: 534, y: 36 },
  { x: 638, y: 174 },
  { x: 742, y: 34 },
];
const NODE_SCALE = 2;

/* Background dwellings — atmosphere only, never clickable. Lit windows vary. */
const HOUSES: { s: string; x: number; y: number; lit: boolean }[] = [
  { s: "house1", x: 118, y: 250, lit: true },
  { s: "house2", x: 236, y: 258, lit: false },
  { s: "house3", x: 372, y: 262, lit: true },
  { s: "house1", x: 494, y: 256, lit: false },
  { s: "house2", x: 640, y: 258, lit: true },
  { s: "house3", x: 762, y: 250, lit: true },
  { s: "house2", x: 60, y: 96, lit: false },
  { s: "house3", x: 268, y: 150, lit: true },
  { s: "house1", x: 392, y: 62, lit: false },
  { s: "house2", x: 556, y: 60, lit: true },
  { s: "house3", x: 686, y: 148, lit: false },
];

const TREES: { s: string; x: number; y: number; k: number }[] = [
  { s: "tree1", x: 12, y: 244, k: 2.2 },
  { s: "tree2", x: 96, y: 196, k: 2 },
  { s: "tree3", x: 168, y: 236, k: 2 },
  { s: "tree1", x: 214, y: 96, k: 1.8 },
  { s: "tree2", x: 300, y: 96, k: 2 },
  { s: "tree3", x: 350, y: 208, k: 2.2 },
  { s: "tree1", x: 424, y: 190, k: 2 },
  { s: "tree2", x: 520, y: 176, k: 2.2 },
  { s: "tree3", x: 578, y: 100, k: 2 },
  { s: "tree1", x: 660, y: 196, k: 2.2 },
  { s: "tree2", x: 726, y: 168, k: 1.8 },
  { s: "tree3", x: 806, y: 214, k: 2 },
  { s: "tree3", x: 128, y: 74, k: 1.6 },
  { s: "tree1", x: 486, y: 250, k: 1.6 },
];

const LAMPS = [
  { x: 108, y: 208 },
  { x: 262, y: 96 },
  { x: 404, y: 210 },
  { x: 548, y: 92 },
  { x: 690, y: 206 },
];

export function CommunityMap({
  tips,
  rank,
  progress,
  medals,
  stars,
  accuracy,
  activeIndex,
  leaderboardSeedTs,
  onOpenCase,
  onShop,
  onSettings,
  onTracker,
}: {
  tips: number;
  rank: string;
  progress: string[];
  /** case id -> medal label earned */
  medals: Record<string, string>;
  /** case id -> best star count (0-3) */
  stars: Record<string, number>;
  accuracy: number;
  activeIndex: number;
  /** seed clock the dummy leaderboard accounts drift from, persisted in App */
  leaderboardSeedTs: number;
  onOpenCase: (index: number) => void;
  onShop: () => void;
  onSettings: () => void;
  onTracker: () => void;
}) {
  const [showLayers, setShowLayers] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [par, setPar] = useState({ x: 0, y: 0 });
  const flicker = useFrame(3, 8); // 2-frame lamp flicker, occasional dropout
  const birdTick = useFrame(2, 2);

  const centers = NODES.map((n) => ({ x: n.x + 28, y: n.y + 58 }));
  const road = centers.map((c) => `${c.x},${c.y}`).join(" ");
  const square = { x: 398, y: 108 };

  const layerStyle = (l: Layer): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    transform: `translate(${par.x * LAYER_META[l].parallax}px, ${par.y * LAYER_META[l].parallax}px)`,
  });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
      <TopHud
        tips={tips}
        rank={rank}
        onShop={onShop}
        onSettings={onSettings}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name="badge" scale={1} />
            <Mono size={14} color={C.brass}>
              CREDENTIAL {Math.round(accuracy * 100)}%
            </Mono>
          </div>
        }
        right={
          <>
            <HudButton icon="badge" label="Leaderboard" onClick={() => setShowLeaderboard(true)} />
            <HudButton icon="gauge" label="Your record" onClick={onTracker} />
            <TipsCounter tips={tips} scale={1.2} />
            {/* layer button ito guys */}
            {/*<HudButton icon="doc" label="Layers" onClick={() => setShowLayers((v) => !v)} /> */}
          </>
        }
      />

      <div
        onMouseMove={(e) => {
          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          setPar({
            x: -((e.clientX - r.left) / r.width - 0.5) * 14,
            y: -((e.clientY - r.top) / r.height - 0.5) * 8,
          });
        }}
        onMouseLeave={() => setPar({ x: 0, y: 0 })}
        style={{ position: "relative", flex: 1, overflow: "hidden", backgroundColor: "#1B242C" }}
      >
        {/* ------------------------------------------------ BACKGROUND LAYER */}
        <div data-layer="bg" style={layerStyle("bg")}>
          {/* banded dusk sky — flat bands, no gradient */}
          {[
            { c: "#3A4A5E", h: 26 },
            { c: "#4A4E5C", h: 20 },
            { c: "#5A4E52", h: 16 },
          ].map((b, i, arr) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: -20,
                right: -20,
                top: arr.slice(0, i).reduce((s, x) => s + x.h, 0) - 8,
                height: b.h,
                ...speckle(b.c, "#2E3A48", 4),
              }}
            />
          ))}
          {/* low evening sun — hard-edged block, no glow */}
          <div
            style={{
              position: "absolute",
              left: 88,
              top: 8,
              width: 22,
              height: 22,
              backgroundColor: "#C97A4A",
              boxShadow: `0 0 0 3px #8C4A3A`,
            }}
          />
          {/* hills */}
          <svg width={MAP_W + 40} height={110} shapeRendering="crispEdges" style={{ position: "absolute", left: -20, top: 12 }}>
            <polygon points="0,110 0,72 70,40 150,66 240,32 330,70 430,38 520,68 620,36 720,66 810,44 884,74 884,110" fill="#2B3F4A" />
            <polygon points="0,110 0,88 90,62 190,88 300,60 400,90 500,64 610,90 720,62 820,88 884,70 884,110" fill="#243541" />
          </svg>
          {/* distant tree line */}
          {Array.from({ length: 22 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: i * 40 + (i % 2 ? 12 : 0),
                top: 74 + (i % 3) * 3,
                width: 14,
                height: 18 + (i % 3) * 4,
                backgroundColor: "#1F3A2E",
                boxShadow: `inset 2px 0 0 0 #26473A`,
              }}
            />
          ))}
          {/* ground plane */}
          <div
            style={{
              position: "absolute",
              left: -20,
              right: -20,
              top: 96,
              bottom: -20,
              ...speckle("#2B3A34", "#243029", 4),
            }}
          />
        </div>

        {/* ------------------------------------------------- MIDGROUND LAYER */}
        <div data-layer="mid" style={layerStyle("mid")}>
          {/* cobblestone road network */}
          <svg width={MAP_W} height={MAP_H} shapeRendering="crispEdges" style={{ position: "absolute", inset: 0 }}>
            {/* road bed */}
            <polyline points={road} fill="none" stroke="#4A4438" strokeWidth={16} />
            <polyline points={`${centers[1].x},${centers[1].y} ${square.x + 24},${square.y + 40}`} stroke="#4A4438" strokeWidth={12} fill="none" />
            <polyline points={`${centers[3].x},${centers[3].y} ${square.x + 24},${square.y + 40}`} stroke="#4A4438" strokeWidth={12} fill="none" />
            <polyline points={`${centers[2].x},${centers[2].y} ${square.x + 24},${square.y + 46}`} stroke="#4A4438" strokeWidth={12} fill="none" />
            <polyline points="0,300 844,286" stroke="#4A4438" strokeWidth={14} fill="none" />
            {/* cobble courses */}
            <polyline points={road} fill="none" stroke="#5A5344" strokeWidth={14} strokeDasharray="3 4" />
            <polyline points="0,300 844,286" stroke="#5A5344" strokeWidth={12} fill="none" strokeDasharray="3 4" />
            {/* worn tire tracks on the well-travelled route */}
            <polyline points={road} fill="none" stroke="#6A6150" strokeWidth={2} strokeDasharray="6 5" transform="translate(0,-4)" />
            <polyline points={road} fill="none" stroke="#6A6150" strokeWidth={2} strokeDasharray="6 5" transform="translate(0,4)" />
            {/* kerb shadow, cast down-right like everything else */}
            <polyline points={road} fill="none" stroke="rgba(12,16,20,0.35)" strokeWidth={3} transform="translate(2,9)" />
          </svg>

          {/* town square + fountain landmark */}
          <div
            data-layer="mid"
            style={{
              position: "absolute",
              left: square.x - 26,
              top: square.y - 12,
              width: 106,
              height: 84,
              ...speckle("#5A5344", "#4A4438", 4),
              boxShadow: `0 0 0 2px #3E3A30`,
              outline: showLayers ? `1px solid ${LAYER_META.mid.color}` : undefined,
            }}
          />
          <Prop sprite="fountain" x={square.x} y={square.y} scale={2.4} showLayers={showLayers} title="Town fountain" />
          <Prop sprite="bench" x={square.x - 22} y={square.y + 58} scale={1.6} showLayers={showLayers} />
          <Prop sprite="bench" x={square.x + 66} y={square.y + 58} scale={1.6} showLayers={showLayers} />

          {/*HOUSES.map((h, i) => (
            <Prop
              key={i}
              sprite={h.s}
              x={h.x}
              y={h.y}
              scale={2}
              showLayers={showLayers}
              // dark windows in the unlit houses; town reads as inhabited, not staged
              recolor={h.lit ? undefined : { w: "#2A3138" }}
            />
          ))*/}

          {TREES.map((t, i) => (
            <Prop key={i} sprite={t.s} x={t.x} y={t.y} scale={t.k} showLayers={showLayers} />
          ))}

          <Prop sprite="hedge" x={196} y={288} scale={2} showLayers={showLayers} />
          <Prop sprite="hedge" x={560} y={292} scale={2} showLayers={showLayers} />
          <Prop sprite="hedge" x={708} y={300} scale={1.8} showLayers={showLayers} />

          {LAMPS.map((l, i) => (
            <Prop
              key={i}
              // 2-frame flicker: one lamp drops out per tick, never all at once
              sprite={flicker % 8 === i ? "lamppostOff" : "lamppostOn"}
              x={l.x}
              y={l.y}
              scale={2}
              showLayers={showLayers}
            />
          ))}

          <Prop sprite="bicycle" x={116} y={214} scale={1.8} showLayers={showLayers} />
          <Prop sprite="mailbox" x={796} y={140} scale={1.8} showLayers={showLayers} />
          <Prop sprite="busstop" x={648} y={226} scale={1.8} showLayers={showLayers} />
          <Prop sprite="noticeboard" x={520} y={130} scale={1.8} showLayers={showLayers} />
          {/* birds on a wire — 2-frame idle, purely texture */}
          <div
            data-layer="mid"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 232,
              top: 30 + (birdTick ? 0 : 1),
              outline: showLayers ? `1px solid ${LAYER_META.mid.color}` : undefined,
            }}
          >
            <PixelSprite name="birdwire" scale={2} />
          </div>
        </div>

        {/* ------------------------------------------------ FOREGROUND LAYER */}
        <div data-layer="fg" style={layerStyle("fg")}>
          {CASES.map((cs, i) => {
            const solved = progress.includes(cs.id);
            const locked = i > 0 && !progress.includes(CASES[i - 1].id);
            const active = i === activeIndex;
            const n = NODES[i];
            return (
              <button
                key={cs.id}
                type="button"
                data-interactive="level-node"
                data-layer="fg"
                aria-label={`Button — ${locked ? "Locked" : "Open"} case: ${cs.building}`}
                disabled={locked}
                onClick={() => !locked && onOpenCase(i)}
                style={{
                  position: "absolute",
                  left: n.x,
                  top: n.y,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: locked ? "not-allowed" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  outline: showLayers ? `1px solid ${LAYER_META.fg.color}` : undefined,
                }}
              >
                <div style={{ position: "relative", marginBottom: 2 }}>
                  <div
                    style={{
                      backgroundColor: locked ? C.ink3 : solved ? C.green : C.paper2,
                      boxShadow: `0 0 0 2px ${C.ink}`,
                      padding: "2px 5px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Mono size={12} color={locked ? C.ink4 : solved ? C.white : C.ink}>
                      {cs.tag}
                    </Mono>
                    {solved ? <PixelSprite name="check" scale={0.9} /> : null}
                    {locked ? <PixelSprite name="lock" scale={0.9} title="Locked" /> : null}
                  </div>
                  <div style={{ position: "absolute", left: "50%", top: -7, marginLeft: -6 }}>
                    <PixelSprite name="pin" scale={1} />
                  </div>
                </div>

                <div className={active ? "bth-pulse" : undefined} style={{ position: "relative", padding: 1 }}>
                  <CastShadow name={cs.sprite} scale={cs.spriteScale ?? NODE_SCALE} />
                  <PixelSprite name={cs.sprite} scale={cs.spriteScale ?? NODE_SCALE} desaturate={locked} title={cs.building} />
                  {solved ? (
                    <div style={{ position: "absolute", left: -4, top: -12 }}>
                      <div
                        style={{
                          backgroundColor: C.green,
                          boxShadow: `0 0 0 2px ${C.ink}`,
                          padding: "1px 3px",
                          transform: "rotate(-8deg)",
                        }}
                      >
                        <Display size={7} color={C.white}>
                          SOLVED
                        </Display>
                      </div>
                    </div>
                  ) : null}
                  {medals[cs.id] ? (
                    <div style={{ position: "absolute", right: -10, bottom: -6, display: "flex", alignItems: "center" }}>
                      <PixelSprite name="medal" scale={1.4} title={medals[cs.id]} />
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    marginTop: 2,
                    maxWidth: 96,
                    textAlign: "center",
                    backgroundColor: "rgba(20,24,28,0.7)",
                    padding: "0 3px",
                  }}
                >
                  <Body size={12} color={locked ? C.ink4 : C.paper2}>
                    {cs.building}
                  </Body>
                  {medals[cs.id] ? (
                    <>
                      <br />
                      <Mono size={11} color={C.brassLight}>
                        {medals[cs.id]}
                      </Mono>
                    </>
                  ) : null}
                  {/* earned stars, so replay targets read at a glance */}
                  {solved ? (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 1 }}>
                      <StarCount count={stars[cs.id] ?? 0} />
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {showLayers ? <LayerLegend /> : null}

        {/* brief strip for the active case */}
        <div
          style={{
            position: "absolute",
            left: 8,
            bottom: 6,
            right: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 8px",
            backgroundColor: C.ink,
            boxShadow: `0 0 0 2px ${C.brassDark}`,
            zIndex: 5,
          }}
        >
          <PixelSprite name="doc" scale={1.4} />
          <Display size={8} color={C.brassLight}>
            {CASES[Math.min(activeIndex, CASES.length - 1)].tag}
          </Display>
          <Body size={13} color={C.paper3}>
            {CASES[Math.min(activeIndex, CASES.length - 1)].brief}
          </Body>
          <div style={{ flex: 1 }} />
          <Mono size={14} color={C.brass}>
            {progress.length}/{CASES.length} CASES CLOSED
          </Mono>
        </div>
      </div>

      {showLeaderboard ? (
        <LeaderboardPanel tips={tips} leaderboardSeedTs={leaderboardSeedTs} onClose={() => setShowLeaderboard(false)} />
      ) : null}
    </div>
  );
}