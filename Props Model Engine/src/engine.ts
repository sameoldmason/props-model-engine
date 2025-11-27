// src/engine.ts

import {
  GeneratePlaysRequest,
  GeneratePlaysResponse,
  Matchup,
  Play,
  Market
} from "./types";
import { runPreFilters } from "./modules/preFilters";
import { runVolumeChain } from "./modules/volumeChain";

// ---- P0-Lite Helpers (Structured but Simple) ---- //

function minutesFactor(minutes: number | null): number {
  if (minutes === null) return 0.5;

  if (minutes >= 36) return 2.0;
  if (minutes >= 32) return 1.5;
  if (minutes >= 28) return 1.0;
  if (minutes >= 24) return 0.7;
  return 0.4;
}

function paceFactor(projectedPace: number): number {
  if (projectedPace >= 102) return 0.8;
  if (projectedPace >= 100) return 0.5;
  if (projectedPace <= 96) return -0.5;
  if (projectedPace <= 98) return -0.2;
  return 0.0;
}

function roleFactor(minutes: number | null): number {
  if (minutes === null) return 0.0;
  if (minutes >= 34) return 0.8;
  if (minutes >= 30) return 0.5;
  return 0.2;
}

function regressionFactor(): number {
  return 0.0; // placeholder
}

// ---- Market-specific mid projections ---- //

function projectPointsMid(
  line: number,
  minutes: number | null,
  projectedPace: number
): number {
  const mFactor = minutesFactor(minutes); // high impact
  const pFactor = paceFactor(projectedPace); // medium impact
  const rlFactor = roleFactor(minutes);
  const rFactor = regressionFactor();
  const marketBias = 0.4; // small global bias for points edges

  const totalBump = mFactor + pFactor + rlFactor + rFactor + marketBias;
  return line + totalBump;
}

function projectReboundsMid(
  line: number,
  minutes: number | null,
  projectedPace: number
): number {
  const mFactor = minutesFactor(minutes); // big for rebounding
  const rlFactor = roleFactor(minutes);
  const rFactor = regressionFactor();

  // pace matters, but a bit less than for points
  const pFactor = paceFactor(projectedPace) * 0.5;
  const marketBias = 0.2;

  const totalBump = mFactor + rlFactor + rFactor + pFactor + marketBias;
  return line + totalBump;
}

function projectAssistsMid(
  line: number,
  minutes: number | null,
  projectedPace: number
): number {
  const mFactor = minutesFactor(minutes);
  const pFactor = paceFactor(projectedPace); // good for assist opps
  const rlFactor = roleFactor(minutes);
  const rFactor = regressionFactor();
  const marketBias = 0.3;

  const totalBump = mFactor + pFactor + rlFactor + rFactor + marketBias;
  return line + totalBump;
}

function projectGenericMid(
  line: number,
  minutes: number | null,
  projectedPace: number
): number {
  const mFactor = minutesFactor(minutes);
  const pFactor = paceFactor(projectedPace) * 0.5;
  const rlFactor = roleFactor(minutes);
  const rFactor = regressionFactor();
  const marketBias = 0.1;

  const totalBump = mFactor + pFactor + rlFactor + rFactor + marketBias;
  return line + totalBump;
}

// router: decide which market projection to use
function projectMidpointByMarket(
  market: Market,
  line: number,
  minutes: number | null,
  projectedPace: number
): number {
  switch (market) {
    case "Points":
      return projectPointsMid(line, minutes, projectedPace);
    case "Rebounds":
      return projectReboundsMid(line, minutes, projectedPace);
    case "Assists":
      return projectAssistsMid(line, minutes, projectedPace);
    // PRA / PR / PA / AR can later be their own logic
    default:
      return projectGenericMid(line, minutes, projectedPace);
  }
}

// ---- Lookup Helpers ---- //

function findProjectedMinutes(
  matchup: Matchup,
  player: string,
  team: string
): number | null {
  const teamStarters = matchup.starters[team];
  if (!teamStarters) return null;

  const found = teamStarters.find((s) => s.player === player);
  return found ? found.minutes_proj : null;
}

// ---- Main Engine ---- //

export function generatePlays(req: GeneratePlaysRequest): GeneratePlaysResponse {
  const plays: Play[] = [];

  for (const matchup of req.matchups) {
    const projectedPace = matchup.pace.projected_pace;

    for (const prop of matchup.props) {
      const minutes = findProjectedMinutes(matchup, prop.player, prop.team);

      // ---- Module 1: Pre-Filters ---- //
      const preFilterResult = runPreFilters({
        market: prop.market,
        line: prop.line,
        minutes,
        projectedPace
      });

      if (!preFilterResult.pass) {
        continue;
      }

      // ---- Module 2: Volume Chain ---- //
      const volumeResult = runVolumeChain({
        minutes,
        market: prop.market,
        line: prop.line
      });

      // ---- P0-lite, Market-aware Projection ---- //
      const mid = projectMidpointByMarket(
        prop.market,
        prop.line,
        minutes,
        projectedPace
      );
      const edge = mid - prop.line;

      // simple edge filter
      if (edge < 1) continue;

      const confidence: Play["confidence"] = edge >= 3 ? "LOCK" : "HIGH";

      const play: Play = {
        player: prop.player,
        team: prop.team,
        market: prop.market,
        line: prop.line,
        side: "Over",
        confidence,
        projection: {
          low: mid - 2,
          mid,
          high: mid + 2
        },
        hit_prob: confidence === "LOCK" ? 0.65 : 0.58,
        module_notes: {
          PreFilters:
            preFilterResult.reasons.length > 0
              ? preFilterResult.reasons.join(", ")
              : "Passed all pre-filters.",
          P0: `P0-lite(${prop.market}): mid=${mid.toFixed(
            1
          )} vs line=${prop.line} (edge=${edge.toFixed(1)})`,
          Volume: volumeResult.notes,
          Matchup: `Pace=${projectedPace} → paceFactor=${paceFactor(
            projectedPace
          ).toFixed(1)}`,
          Regression:
            "Regression not wired yet (neutral factor = 0.0 for now).",
          Role: `RoleFactor=${roleFactor(minutes).toFixed(
            1
          )} (starter/stable placeholder).`,
          Blowout: "Blowout logic not implemented yet (placeholder)."
        }
      };

      plays.push(play);
    }
  }

  return {
    plays,
    notes:
      "Output generated by P0-lite engine with basic Pre-Filters, Volume Chain, and market-specific projection."
  };
}
