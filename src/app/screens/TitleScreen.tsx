import React, { useEffect, useState } from "react";
import { C, dither, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite, TipsCounter } from "../components/Pixel";
import { HudButton } from "../components/Hud";
const customBgGif = new URL("../../assets/backgrounds/start.mp4", import.meta.url).href;

/** 4-step camera pan from a wide town shot into the menu view. First load only. */
const PAN_FRAMES = [
  { scale: 1.34, x: -60, y: -26 },
  { scale: 1.22, x: -38, y: -16 },
  { scale: 1.1, x: -18, y: -7 },
  { scale: 1, x: 0, y: 0 },
];

export function TitleScreen({
  tips,
  hasSave,
  onContinue,
  onNew,
  onSettings,
  onShop,
  onTimeAttack,
}: {
  tips: number;
  hasSave: boolean;
  /** run the one-time establishing pan */
  onContinue: () => void;
  onNew: () => void;
  onSettings: () => void;
  onShop: () => void;
  onTimeAttack: () => void;
}) {

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      {/* looping ambient scene, stepped camera on first load */}
      {/* 1. Looping MP4 background replacing <StreetScene /> */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={customBgGif}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
          imageRendering: "pixelated",
        }}
      />

      {/* 2. Optional subtle overlay if you want to make text pop more */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* top corner HUD */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          gap: 6,
          alignItems: "center",
          zIndex: 3,
          opacity: 1,// settled ? 1 : 0
        }}
      >
        <TipsCounter tips={tips} scale={1.6} />
        <HudButton icon="briefcase" label="Shop" onClick={onShop} />
      </div>

      {/* menu on a semi-opaque dithered panel so it stays legible over the moving scene */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 26,
          width: 316,
          padding: 10,
          zIndex: 2,
          opacity: 1, //  settled ? 1 : 0
          ...dither("rgba(20,24,28,0.88)", "rgba(29,35,40,0.88)", 2),
          boxShadow: `0 0 0 3px ${C.ink}, inset 2px 2px 0 0 rgba(176,141,87,0.5)`,
        }}
      >
        <div
          style={{
            ...speckle(C.paper, C.paper2, 4),
            padding: "5px 12px 7px",
            boxShadow: `0 0 0 3px ${C.ink}`,
            marginBottom: 10,
          }}
        >
          <Display size={11} color={C.ink}>
            BEYOND THE
          </Display>
          <br />
          <Display size={17} color={C.red}>
            HEADLINE
          </Display>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PixelButton full variant="brass" height={45} icon="doc" iconScale={1.6} onClick={onContinue} disabled={!hasSave} label="Button — Continue Case">
            CONTINUE CASE
          </PixelButton>
          <PixelButton full variant="paper" height={30} icon="magnifier" iconScale={1.6} onClick={onNew} label="Button — New Investigation">
            NEW INVESTIGATION
          </PixelButton>
          {/* second mode — stopwatch icon and red accent set it apart from story play */}
          <PixelButton full variant="red" height={25} icon="stopwatch" iconScale={1.6} onClick={onTimeAttack} label="Button — Beat the Clock">
            BEAT THE CLOCK
          </PixelButton>
          <PixelButton full variant="ink" height={25} icon="gear" iconScale={1.6} onClick={onSettings} label="Button — Settings">
            SETTINGS
          </PixelButton>
        </div>

        <div style={{ marginTop: 8 }}>
          <Body size={12} color={C.paper4}>
            Eight stops. Four drill rounds, four files. Find what's already wrong.
          </Body>
        </div>
      </div>

      <div style={{ position: "absolute", left: 18, bottom: 6, zIndex: 2, backgroundColor: "rgba(20,24,28,0.7)", padding: "0 4px" }}>
        <Mono size={13} color={C.brass}>
          ROSEWOOD LEDGER · BUGS PH · v1.1
        </Mono>
      </div>

      <div style={{ position: "absolute", right: 10, bottom: 6, zIndex: 2, display: "flex", alignItems: "center", gap: 5, backgroundColor: "rgba(20,24,28,0.7)", padding: "1px 4px" }}>
        <PixelSprite name="news1" scale={1} />
        <Mono size={13} color={C.paper4}>
          AMBIENT LOOP — 6FPS STEP CLOCK
        </Mono>
      </div>
    </div>
  );
}
