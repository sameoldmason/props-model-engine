// src/modules/blowout.ts

import { ScheduleSpot, VegasInfo } from "../types";

export interface BlowoutResult {
  flagged: boolean;
  risk: "Low" | "Medium" | "High";
  notes: string;
}

export function assessBlowoutRisk(params: {
  vegas: VegasInfo | undefined;
  schedule: ScheduleSpot | undefined;
}): BlowoutResult {
  const spread = params.vegas?.spread ?? 0;
  const restDays = params.schedule?.rest_days ?? 2;
  const backToBack = params.schedule?.back_to_back ?? false;
  const gamesInFour = params.schedule?.games_in_four ?? 0;

  let risk: BlowoutResult["risk"] = "Low";
  const reasons: string[] = [];

  if (Math.abs(spread) >= 12) {
    risk = "High";
    reasons.push(`Spread=${spread}`);
  } else if (Math.abs(spread) >= 9) {
    risk = "Medium";
    reasons.push(`Spread=${spread}`);
  }

  if (backToBack && spread <= -8) {
    risk = "High";
    reasons.push("Road B2B vs heavy favorite");
  } else if (backToBack) {
    risk = risk === "Low" ? "Medium" : risk;
    reasons.push("Back-to-back fatigue");
  }

  if (gamesInFour >= 3 && restDays === 0) {
    risk = "High";
    reasons.push("Compressed schedule (3-in-4, no rest)");
  }

  const flagged = risk !== "Low";
  const notes =
    reasons.length > 0
      ? `Blowout risk ${risk}: ${reasons.join("; ")}`
      : "Blowout risk Low: neutral spread/schedule.";

  return { flagged, risk, notes };
}
