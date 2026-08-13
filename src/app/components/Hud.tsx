import React from "react";
import { C } from "../game/palette";
import { Display, Mono, PixelSprite, TipsCounter } from "./Pixel";

export function HudButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const [down, setDown] = React.useState(false);
  return (
    <button
      type="button"
      data-interactive="hud-button"
      aria-label={`Button — ${label}`}
      disabled={disabled}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: down ? "4px 6px 2px" : "3px 6px",
        backgroundColor: disabled ? C.ink3 : down ? C.brassDark : C.brass,
        boxShadow: down
          ? `inset -2px -2px 0 0 ${C.brassLight}, inset 2px 2px 0 0 ${C.brassDark}, 0 0 0 2px ${C.ink}`
          : `inset 2px 2px 0 0 ${C.brassLight}, inset -2px -2px 0 0 ${C.brassDark}, 0 0 0 2px ${C.ink}`,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: down ? "translate(1px,1px)" : undefined,
      }}
    >
      <PixelSprite name={icon} scale={1} desaturate={disabled} />
      <Mono size={14} color={disabled ? C.ink4 : C.ink}>
        {label.toUpperCase()}
      </Mono>
    </button>
  );
}

export function TopHud({
  tips,
  rank,
  left,
  onShop,
  onSettings,
  onMap,
  right,
  accent = C.brassDark,
}: {
  tips: number;
  rank?: string;
  left?: React.ReactNode;
  onShop?: () => void;
  onSettings?: () => void;
  onMap?: () => void;
  right?: React.ReactNode;
  /** brass in story mode, muted red in Beat the Clock */
  accent?: string;
}) {
  return (
    <div
      style={{
        height: 34,
        flex: "0 0 34px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 8px",
        backgroundColor: C.ink,
        boxShadow: `inset 0 -2px 0 0 ${accent}`,
      }}
    >
      {rank !== undefined ? (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <PixelSprite name="badge" scale={1.4} title="Detective badge" />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <Mono size={12} color={C.brass}>
              RANK
            </Mono>
            <Display size={7} color={C.paper}>
              {rank}
            </Display>
          </div>
        </div>
      ) : null}
      {left}
      <div style={{ flex: 1 }} />
      {right}
      {onMap ? <HudButton icon="pin" label="Map" onClick={onMap} /> : null}
      {onShop ? <HudButton icon="briefcase" label="Shop" onClick={onShop} /> : null}
      {onSettings ? <HudButton icon="gear" label="Set" onClick={onSettings} /> : null}
    </div>
  );
}
