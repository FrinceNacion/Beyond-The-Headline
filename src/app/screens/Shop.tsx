import React from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite, TipsCounter } from "../components/Pixel";
import { TopHud } from "../components/Hud";

export type ShopItem = {
  id: string;
  name: string;
  icon: string;
  price: number;
  effect: string;
  /** one-off purchase vs. restockable charges */
  consumable: boolean;
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "magnifier",
    name: "MAGNIFYING GLASS",
    icon: "magnifier",
    price: 40,
    effect: "Reveals the location of one unflagged hotspot. 3 charges.",
    consumable: true,
  },
  {
    id: "secondsource",
    name: "SECOND SOURCE",
    icon: "secondsource",
    price: 60,
    effect: "Re-check one claim's verdict before final submit. 1 charge.",
    consumable: true,
  },
  {
    id: "coffee",
    name: "FRESH COFFEE",
    icon: "coffee",
    price: 30,
    effect: "Adds 90 seconds to the clock on timed cases. 2 charges.",
    consumable: true,
  },
  {
    id: "redpen",
    name: "RED PEN",
    icon: "redpen",
    price: 55,
    effect: "Briefly highlights all remaining hotspots on the current source.",
    consumable: true,
  },
  {
    id: "notebook",
    name: "REPORTER'S NOTEBOOK",
    icon: "notebook",
    price: 120,
    effect: "Permanent: shows the reason chip you picked in the evidence tray.",
    consumable: false,
  },
  {
    id: "badge",
    name: "PRESS CREDENTIAL",
    icon: "badge",
    price: 200,
    effect: "Permanent: +10% Tips on every case you close.",
    consumable: false,
  },
];

export function Shop({
  tips,
  rank,
  inventory,
  owned,
  onBuy,
  onBack,
}: {
  tips: number;
  rank: string;
  inventory: Record<string, number>;
  owned: string[];
  onBuy: (item: ShopItem) => void;
  onBack: () => void;
}) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopHud
        tips={tips}
        rank={rank}
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
            <PixelSprite name="briefcase" scale={1} />
            <Display size={8} color={C.brassLight}>
              SUPPLY CABINET
            </Display>
          </div>
        }
        right={
          <>
            <TipsCounter tips={tips} scale={1.2} />
            <PixelButton variant="ink" size={8} onClick={onBack} label="Button — Back">
            ◂ BACK
            </PixelButton>
          </>
        }
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          ...speckle("#3A2E22", "#2A2119", 4),
          padding: "8px 10px",
          overflow: "hidden",
        }}
      >
        {/* pixel shelving behind the goods */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[92, 208].map((y) => (
            <div key={y} style={{ position: "absolute", left: 0, right: 0, top: y }}>
              <div style={{ height: 6, backgroundColor: "#5A4830", boxShadow: `0 2px 0 0 ${C.ink}` }} />
            </div>
          ))}
        </div>

        <div
          className="bth-scroll"
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            height: "100%",
            overflowY: "auto",
          }}
        >
          {SHOP_ITEMS.map((it) => {
            const isOwned = !it.consumable && owned.includes(it.id);
            const charges = inventory[it.id] ?? 0;
            const affordable = tips >= it.price;
            return (
              <div
                key={it.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: 7,
                  ...speckle(C.paper, C.paper2, 4),
                  boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ padding: 3, backgroundColor: C.ink2, boxShadow: `0 0 0 2px ${C.ink}` }}>
                    <PixelSprite name={it.icon} scale={2} title={it.name} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Display size={7} color={C.ink}>
                      {it.name}
                    </Display>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3 }}>
                      <PixelSprite name="coin" scale={1} />
                      <Mono size={17} color={C.ink3}>
                        {it.price}
                      </Mono>
                      {charges > 0 ? (
                        <Mono size={13} color={C.green}>
                          · HELD x{charges}
                        </Mono>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <Body size={12} color={C.ink}>
                    {it.effect}
                  </Body>
                </div>
                <PixelButton
                  full
                  size={8}
                  variant={isOwned ? "ink" : "brass"}
                  disabled={isOwned || !affordable}
                  onClick={() => onBuy(it)}
                  label={`Button — ${isOwned ? "Owned" : "Buy"} ${it.name}`}
                >
                  {isOwned ? "OWNED" : affordable ? "BUY" : "NEED TIPS"}
                </PixelButton>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
