// src/modules/preFilters.ts

import { Market } from "../types";

export interface PreFilterResult {
  pass: boolean;
  reasons: string[];
}

/**
 * Very simple pre-filter logic.
 * Later you can expand this to match your full Module 1 rules.
 */
export function runPreFilters(params: {
  market: Market;
  line: number;
  minutes: number | null;
  projectedPace: number;
}): PreFilterResult {
  const { market, line, minutes, projectedPace } = params;

  const reasons: string[] = [];
  let pass = true;

  // Example rule: minutes too low → auto-fail
  if (minutes !== null && minutes < 24) {
    pass = false;
    reasons.push("MinutesProjTooLow");
  }

  // Example soft tag: very high points line
  if (market === "Points" && line >= 28.5) {
    reasons.push("HighPointsLine");
  }

  // Example soft tag: super slow game
  if (projectedPace <= 96) {
    reasons.push("SlowPaceEnvironment");
  }

  return {
    pass,
    reasons
  };
}
