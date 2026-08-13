import type React from "react";
import { PostOfficeStage } from "../postoffice/Game";
import { LibraryStage } from "../library/Game";
import { CityHallStage } from "../cityhall/Game";
import { MarketStage } from "../market/Game";
import { PoliceStage } from "../police/Game";
import { NewsofficeStage } from "../newsoffice/Game"
import { SchoolStage } from "../school/Game";
import type { StageProps } from "./stage";

/** Which stage component runs for each case marked "stage" in CASE_GAMES. */
export const STAGE_GAMES: Record<string, React.ComponentType<StageProps>> = {
  postoffice: PostOfficeStage,
  library: LibraryStage,
  cityhall: CityHallStage,
  market: MarketStage,
  newsoffice: NewsofficeStage,
  police: PoliceStage,
  school: SchoolStage,
};