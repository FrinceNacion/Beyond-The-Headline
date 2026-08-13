# Plan: Per-Case Folders + Case Reordering + Under-Dev Stubs

## Context

The game currently stores all six case definitions in a single flat `cases.ts` file and renders every case through the same `Investigation.tsx` screen. The user wants:

1. **Reorder cases** so `bakery` (currently first) moves to last — new order: cityhall → market → newsoffice → police → school → bakery.
2. **Per-case folders** so each case owns its data and its game component independently.
3. **All cases technically playable** but cases 1–5 (cityhall through school) show a stub "under development" modal.
4. **Better architecture** — adding a new fully-implemented case only requires creating a new folder with `data.ts` + `Game.tsx` and registering it in `cases/index.ts`.

---

## New File Architecture

```
src/app/cases/
  index.ts              ← CASES array (new order) + CASE_GAMES map
  UnderDevGame.tsx      ← shared stub modal: "This case is under development."
  bakery/
    data.ts             ← bakery CaseDef (moved from cases.ts, tag updated to CASE 06)
    Game.tsx            ← re-exports Investigation (the full SIFT flow)
  cityhall/
    data.ts             ← cityhall CaseDef (tag → CASE 01)
    Game.tsx            ← re-exports UnderDevGame
  market/
    data.ts             ← tag → CASE 02
    Game.tsx            ← re-exports UnderDevGame
  newsoffice/
    data.ts             ← tag → CASE 03
    Game.tsx            ← re-exports UnderDevGame
  police/
    data.ts             ← tag → CASE 04
    Game.tsx            ← re-exports UnderDevGame
  school/
    data.ts             ← tag → CASE 05
    Game.tsx            ← re-exports UnderDevGame
```

---

## Implementation Steps

### 1. Split `cases.ts` into per-case `data.ts` files

Move each `CaseDef` object literal out of `src/app/game/cases.ts` into its case folder:

- `src/app/cases/bakery/data.ts` — exports `const bakeryCase: CaseDef = { ... }`
- Same pattern for cityhall, market, newsoffice, police, school.

Update the `tag` field in each file to reflect the new position (cityhall → `"CASE 01"`, … bakery → `"CASE 06"`).

The shared types (`CaseDef`, `Hotspot`, `SourceKind`, `ReasonId`, `Verdict`) stay in `src/app/game/cases.ts`, which becomes a thin type + re-export file:

```ts
// src/app/game/cases.ts  (after refactor)
export type { CaseDef, Hotspot, SourceKind, ReasonId, Verdict };
export { CASES } from "../cases/index";
```

All existing importers of `CASES` and types from `../game/cases` continue to work unchanged.

### 2. Create `src/app/cases/UnderDevGame.tsx`

A simple component matching the game screen interface (same props as Investigation: `cs`, `tips`, `rank`, `onSubmitted`, `onBack`):

```tsx
export function UnderDevGame({ cs, onBack }: GameProps) {
  return (
    <div role="dialog" /* centered overlay */>
      <Display>CASE UNDER DEVELOPMENT</Display>
      <Body>This case is under development.</Body>
      <PixelButton onClick={onBack}>◂ BACK</PixelButton>
    </div>
  );
}
```

Uses existing `Display`, `Body`, `PixelButton`, `C`, `speckle` from the component library. Styled consistently with the paper/ink palette.

### 3. Create per-case `Game.tsx` files

**Case 6 only** (bakery) — the sole Investigation game:
```tsx
// src/app/cases/bakery/Game.tsx
export { Investigation as default } from "../../screens/Investigation";
```

**Cases 1–5** (cityhall, market, newsoffice, police, school) — no Investigation gameplay at all:
```tsx
// src/app/cases/cityhall/Game.tsx
export { UnderDevGame as default } from "../UnderDevGame";
```

Same pattern for market, newsoffice, police, school. These `Game.tsx` files are intentionally minimal stubs — each case folder retains its `data.ts` (article, social, quote, hotspot assets) for future use when a different game type is built for that case. The data is never rendered through Investigation.

### 4. Create `src/app/cases/index.ts`

```ts
import { bakeryCase } from "./bakery/data";
import { cityhallCase } from "./cityhall/data";
// ... etc
import type { ComponentType } from "react";
import type { GameProps } from "./types";

// New order: bakery is last (case 6)
export const CASES: CaseDef[] = [
  cityhallCase, marketCase, newsofficeCase, policeCase, schoolCase, bakeryCase,
];

// Map from case id → the game component to render
export const CASE_GAMES: Record<string, ComponentType<GameProps>> = {
  cityhall: lazy(() => import("./cityhall/Game")),
  market:   lazy(() => import("./market/Game")),
  newsoffice: lazy(() => import("./newsoffice/Game")),
  police:   lazy(() => import("./police/Game")),
  school:   lazy(() => import("./school/Game")),
  bakery:   lazy(() => import("./bakery/Game")),
};
```

(Use `React.lazy` + `<Suspense>` in App.tsx, or simply static imports since the bundle is small enough.)

### 5. Define `GameProps` interface

Create `src/app/cases/types.ts`:

```ts
import type { CaseDef } from "../game/cases";
import type { Lifetime } from "../game/progress";

export interface GameProps {
  cs: CaseDef;
  tips: number;
  rank: string;
  lifetime: Lifetime;
  onSubmitted: (result: SubmitResult) => void;
  onBack: () => void;
}
```

`SubmitResult` is whatever `Investigation.tsx` currently passes to `onSubmitted` — check the existing `App.tsx` handler to confirm the shape.

**Important architectural rule:** `Investigation.tsx` and all files under `src/app/screens/sift/` are exclusively used by `bakery/Game.tsx`. Cases 1–5 must never import or render Investigation or any sift panel. Each case folder's `data.ts` keeps the scene assets (article body, social post, quote, hotspots) so they're available when a bespoke game type is built for that case later — but they are not rendered through any shared gameplay screen.

### 6. Update `App.tsx`

- Import `CASE_GAMES` from `../cases/index`.
- In the `"play"` screen branch, look up `const GameScreen = CASE_GAMES[cs.id]` and render `<GameScreen cs={cs} ... />` instead of always rendering `<Investigation .../>`.
- No other changes to App.tsx needed.

### 7. Update `src/app/game/cases.ts`

Replace the monolithic file with just type exports + a re-export of `CASES`:

```ts
// types stay here (CaseDef, Hotspot, etc.)
export { CASES } from "../cases/index";
```

This keeps all downstream imports working.

---

## Critical Files

| File | Action |
|------|--------|
| `src/app/game/cases.ts` | Gutted to types + re-export |
| `src/app/cases/index.ts` | New — CASES array + CASE_GAMES map |
| `src/app/cases/types.ts` | New — shared GameProps interface |
| `src/app/cases/UnderDevGame.tsx` | New — stub screen |
| `src/app/cases/bakery/data.ts` | Moved from cases.ts, tag → CASE 06 |
| `src/app/cases/{other 5}/data.ts` | Moved, tags → CASE 01–05 |
| `src/app/cases/bakery/Game.tsx` | New — re-exports Investigation |
| `src/app/cases/{other 5}/Game.tsx` | New — re-exports UnderDevGame |
| `src/app/App.tsx` | Use CASE_GAMES[cs.id] instead of hardcoded Investigation |
| `src/app/screens/Investigation.tsx` | No structural change; props interface aligned to GameProps |

---

## Existing Utilities to Reuse

- `C`, `speckle` from `src/app/game/palette.ts` — for UnderDevGame styling
- `Display`, `Body`, `Mono`, `PixelButton`, `PixelSprite` from `src/app/components/Pixel.tsx`
- `TopHud` from `src/app/components/Hud.tsx` — optionally for UnderDevGame header
- All sift/* panels stay untouched; bakery/Game.tsx simply delegates to Investigation

---

## Map Node Positions

`CommunityMap.tsx` uses array-index-based `NODES` positions (index 0 = leftmost building). With the reorder, cityhall (new index 0) appears at the leftmost position and bakery (new index 5) at the rightmost. The NODES array in CommunityMap does NOT need to change — the visual snake pattern still works.

---

## Verification

1. `esbuild` parse check: run the existing check script after all files are created.
2. Confirm `CASES[0].id === "cityhall"` and `CASES[5].id === "bakery"` in the index.
3. Clicking cases 1–5 on the map shows the "under development" modal; clicking case 6 (bakery) opens the full Investigation.
4. All tags: cityhall → CASE 01, bakery → CASE 06.
5. `CASE_GAMES` covers all 6 case IDs — no missing key.
