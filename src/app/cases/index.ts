import { postofficeCase } from "./postoffice/data";
import { libraryCase } from "./library/data";
import { cityhallCase } from "./cityhall/data";
import { marketCase } from "./market/data";
import { newsofficeCase } from "./newsoffice/data";
import { policeCase } from "./police/data";
import { schoolCase } from "./school/data";
import { bakeryCase } from "./bakery/data";
import type { CaseDef } from "../game/cases";

/* Cases in play order. Stages 1–4 are the digital-literacy drill stages, then
   the four remaining original files. Bakery is last — it is the only fully-implemented
   Investigation game; the middle four are assets-ready stubs awaiting their own
   game types. Add a new case: create cases/{id}/data.ts + Game.tsx, push the
   CaseDef here, and add the id to CASE_GAMES below. */
export const CASES: CaseDef[] = [
  postofficeCase,
  libraryCase,
  cityhallCase,
  marketCase,
  newsofficeCase,
  policeCase,
  schoolCase,
  bakeryCase,
];

/* The game type each case runs. "investigation" = full SIFT flow (bakery only).
   "stage" = a two-drill arcade stage. "underdev" = stub modal. Extend this
   union as new game types are built. */
export type CaseGameType = "investigation" | "stage" | "underdev";

export const CASE_GAMES: Record<string, CaseGameType> = {
  postoffice: "stage",
  library: "stage",
  cityhall: "stage",
  market: "stage",
  newsoffice: "stage",
  police: "stage",
  school: "stage",
  bakery: "investigation",
};