import React, { useEffect, useState } from "react";
import { C, dither, speckle, FONT } from "../game/palette";
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

type BtnKey = "continue" | "new" | "timeattack" | "settings" | null;

export function TitleScreen({
  tips,
  hasSave,
  pan = false,
  onPanDone,
  onContinue,
  onNew,
  onSettings,
  onShop,
  onTimeAttack,
}: {
  tips: number;
  hasSave: boolean;
  /** run the one-time establishing pan */
  pan?: boolean;
  onPanDone?: () => void;
  onContinue: () => void;
  onNew: () => void;
  onSettings: () => void;
  onShop: () => void;
  onTimeAttack: () => void;
}) {
  const [panStep, setPanStep] = useState(pan ? 0 : PAN_FRAMES.length - 1);
  const [settled, setSettled] = useState(!pan);
  const [hoveredBtn, setHoveredBtn] = useState<BtnKey>(null);

  const onPanDoneRef = React.useRef(onPanDone);
  useEffect(() => {
    onPanDoneRef.current = onPanDone;
  }, [onPanDone]);

  useEffect(() => {
    if (!pan) {
      setSettled(true);
      setPanStep(PAN_FRAMES.length - 1);
      return;
    }
    setSettled(false);
    setPanStep(0);
    const interval = setInterval(() => {
      setPanStep((prev) => {
        if (prev >= PAN_FRAMES.length - 1) {
          clearInterval(interval);
          setSettled(true);
          onPanDoneRef.current?.();
          return PAN_FRAMES.length - 1;
        }
        return prev + 1;
      });
    }, 220);

    return () => clearInterval(interval);
  }, [pan]);

  const cameraFrame = PAN_FRAMES[panStep] ?? PAN_FRAMES[PAN_FRAMES.length - 1];

  const getBlurbText = () => {
    switch (hoveredBtn) {
      case "continue":
        return "Resume your active investigation dossier from where you left off.";
      case "new":
        return "Start a fresh story investigation from Stop 1 (Rosewood Ledger).";
      case "timeattack":
        return "Race against the countdown clock to verify source claims under pressure!";
      case "settings":
        return "Adjust text scaling, audio preferences, and interface controls.";
      default:
        return "Eight stops. Four drill rounds, four files. Find what's already wrong.";
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: C.ink }}>
      {/* 1. Looping MP4 background with animated camera pan scale/translate */}
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
          transform: `scale(${cameraFrame.scale}) translate(${cameraFrame.x}px, ${cameraFrame.y}px)`,
          transition: pan && !settled ? "transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
        }}
      />

      {/* 2. CRT Scanline Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0px, rgba(0, 0, 0, 0.14) 1px, transparent 1px, transparent 2px)",
          opacity: 0.7,
        }}
      />

      {/* 3. Radial Vignette for atmosphere & legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: "radial-gradient(circle at 35% 45%, rgba(14, 17, 20, 0.15) 0%, rgba(14, 17, 20, 0.65) 75%, rgba(10, 12, 14, 0.88) 100%)",
        }}
      />

      {/* Top Corner HUD */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
          zIndex: 4,
          opacity: settled ? 1 : 0,
          transform: settled ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 8px",
            ...dither("rgba(20,24,28,0.92)", "rgba(29,35,40,0.92)", 2),
            boxShadow: `0 0 0 2px ${C.ink}, inset 2px 2px 0 0 ${C.brassLight}`,
          }}
        >
          <TipsCounter tips={tips} scale={1.5} />
          <HudButton icon="briefcase" label="Shop" onClick={onShop} />
        </div>
      </div>

      {/* Main Menu Dossier Panel */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 20,
          width: 326,
          padding: "10px 12px",
          zIndex: 3,
          opacity: settled ? 1 : 0,
          transform: settled ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          ...dither("rgba(16,20,24,0.94)", "rgba(25,31,37,0.94)", 2),
          boxShadow: `0 0 0 3px ${C.ink}, 0 12px 28px rgba(0,0,0,0.65), inset 2px 2px 0 0 ${C.brassLight}, inset -2px -2px 0 0 ${C.brassDark}`,
        }}
      >
        {/* Masthead Header */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <Mono size={11} color={C.brassLight}>
              ROSEWOOD CHRONICLE
            </Mono>
            <Mono size={11} color={C.paper4}>
              EDITION #84
            </Mono>
          </div>

          <div
            style={{
              position: "relative",
              ...speckle(C.paper, C.paper2, 4),
              padding: "5px 10px 6px",
              boxShadow: `0 0 0 3px ${C.ink}, inset 2px 2px 0 0 ${C.white}`,
            }}
          >
            <div style={{ position: "absolute", right: -6, top: -8 }}>
              <PixelSprite name="pin" scale={1.2} />
            </div>
            <Display size={11} color={C.ink}>
              BEYOND THE
            </Display>
            <br />
            <Display
              size={18}
              color={C.red}
              style={{ textShadow: "2px 2px 0px #14181C, -1px -1px 0px #7E1B14" }}
            >
              HEADLINE
            </Display>

            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, pt: 1, borderTop: `1px dashed ${C.paper4}` }}>
              <PixelSprite name="badge" scale={1} />
              <Mono size={11} color={C.brassDark}>
                SPECIAL INVESTIGATION DOSSIER
              </Mono>
            </div>
          </div>
        </div>

        {/* Menu Buttons List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            onMouseEnter={() => setHoveredBtn("continue")}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ position: "relative" }}
          >
            <PixelButton
              full
              variant="brass"
              height={38}
              icon="doc"
              iconScale={1.5}
              onClick={onContinue}
              disabled={!hasSave}
              label="Button — Continue Case"
            >
              CONTINUE CASE
            </PixelButton>
          </div>

          <div
            onMouseEnter={() => setHoveredBtn("new")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <PixelButton
              full
              variant="paper"
              height={32}
              icon="magnifier"
              iconScale={1.4}
              onClick={onNew}
              label="Button — New Investigation"
            >
              NEW INVESTIGATION
            </PixelButton>
          </div>

          <div
            onMouseEnter={() => setHoveredBtn("timeattack")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <PixelButton
              full
              variant="red"
              height={28}
              icon="stopwatch"
              iconScale={1.4}
              onClick={onTimeAttack}
              label="Button — Beat the Clock"
            >
              BEAT THE CLOCK
            </PixelButton>
          </div>

          <div
            onMouseEnter={() => setHoveredBtn("settings")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <PixelButton
              full
              variant="ink"
              height={28}
              icon="gear"
              iconScale={1.4}
              onClick={onSettings}
              label="Button — Settings"
            >
              SETTINGS
            </PixelButton>
          </div>
        </div>

        {/* Dynamic Lore & Hover Blurb Box */}
        <div
          style={{
            marginTop: 8,
            padding: "8px 10px",
            ...speckle("rgba(20,24,28,0.9)", "rgba(29,35,40,0.9)", 4),
            boxShadow: `inset 2px 2px 0 0 ${C.ink}, 0 0 0 2px ${C.ink3}`,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <PixelSprite name="typewriter" scale={1} />
          <Body size={12} color={hoveredBtn ? C.paper : C.paper4} style={{ transition: "color 0.2s" }}>
            {getBlurbText()}
          </Body>
        </div>
      </div>

      {/* Footer Ticker — Bottom Left */}
      <div
        style={{
          position: "absolute",
          left: 20,
          bottom: 8,
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: "rgba(16,20,24,0.85)",
          boxShadow: `0 0 0 2px ${C.ink}`,
          padding: "2px 8px",
          opacity: settled ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.2s",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: C.green,
            display: "inline-block",
            boxShadow: `0 0 6px ${C.greenLight}`,
          }}
        />
        <Mono size={12} color={C.brassLight}>
          ROSEWOOD PRESS WIRE · v1.1
        </Mono>
      </div>

      {/* Footer Ticker — Bottom Right */}
      <div
        style={{
          position: "absolute",
          right: 16,
          bottom: 8,
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: "rgba(16,20,24,0.85)",
          boxShadow: `0 0 0 2px ${C.ink}`,
          padding: "2px 8px",
          opacity: settled ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.2s",
        }}
      >
        <PixelSprite name="news1" scale={1} />
        <Mono size={12} color={C.paper4}>
          6FPS STEP CLOCK · AMBIENT LOOP
        </Mono>
      </div>
    </div>
  );
}

