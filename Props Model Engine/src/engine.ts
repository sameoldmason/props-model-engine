// src/engine.ts

import {
  GeneratePlaysRequest,
  GeneratePlaysResponse,
  Matchup,
  Play,
  PlayerUsageProfile,
  OpponentEfficiency
} from "./types";
import { runPreFilters } from "./modules/preFilters";
import { runVolumeChain } from "./modules/volumeChain";
import { assessBlowoutRisk } from "./modules/blowout";
import { detectRegression } from "./modules/regression";
import { projectPointsP0 } from "./model/p0";

// ---- Lookup Helpers ---- //

function findPlayerStats(matchup: Matchup, player: string): PlayerUsageProfile | null {
  const stats = matchup.player_stats[player];
  return stats ?? null;
}

function findProjectedMinutes(
  matchup: Matchup,
  player: string,
  team: string
): number | null {
  const playerStats = findPlayerStats(matchup, player);
  if (playerStats?.recent_minutes_avg) {
    return playerStats.recent_minutes_avg;
  }
  if (playerStats?.minutes_avg) {
    return playerStats.minutes_avg;
  }

  const teamStarters = matchup.starters[team];
  if (!teamStarters) return null;

  const found = teamStarters.find((s) => s.player === player);
  return found ? found.minutes_proj : null;
}

function findUsageRate(matchup: Matchup, player: string): number | null {
  const stats = findPlayerStats(matchup, player);
  if (!stats) return null;
  return stats.recent_usage_rate ?? stats.usage_rate ?? null;
}

function findShotVolume(matchup: Matchup, player: string): number | null {
  const stats = findPlayerStats(matchup, player);
  return stats?.fga ?? null;
}

function findOpponentEfficiency(matchup: Matchup, team: string): OpponentEfficiency | null {
  const opponentTeam = team === matchup.home_team ? matchup.away_team : matchup.home_team;
  return matchup.opponent_efficiency[opponentTeam] ?? null;
}

function estimateRecentPointsPerPoss(
  stats: PlayerUsageProfile | null,
  pace: number
): number | null {
  if (!stats?.recent_points_avg || !stats.minutes_avg) return null;
  const usage = stats.recent_usage_rate ?? stats.usage_rate;
  if (!usage) return null;

  const possessions = pace * (stats.minutes_avg / 48) * usage;
  if (possessions <= 0) return null;
  return stats.recent_points_avg / possessions;
}

// ---- Main Engine ---- //

export function generatePlays(req: GeneratePlaysRequest): GeneratePlaysResponse {
  const plays: Play[] = [];

  for (const matchup of req.matchups) {
    const projectedPace = matchup.pace.projected_pace;
    const projectedPossessions = matchup.pace.projected_possessions;

    for (const prop of matchup.props) {
      const minutes = findProjectedMinutes(matchup, prop.player, prop.team);
      const usageRate = findUsageRate(matchup, prop.player);
      const shotVolume = findShotVolume(matchup, prop.player);
      const playerStats = findPlayerStats(matchup, prop.player);
      const opponent = findOpponentEfficiency(matchup, prop.team);

      // ---- Module 1: Pre-Filters ---- //
      const preFilterResult = runPreFilters({
        market: prop.market,
        line: prop.line,
        minutes,
        projectedPace,
        usageRate
      });

      if (!preFilterResult.pass) {
        continue;
      }

      // ---- Module 2: Volume Chain ---- //
      const volumeResult = runVolumeChain({
        minutes,
        market: prop.market,
        line: prop.line,
        usageRate,
        shotVolume,
        recentMinutes: playerStats?.recent_minutes_avg ?? null,
        emphasize: true
      });

      // ---- P0 Projection ---- //
      let projectionMid = prop.line;
      let projectionLow = prop.line;
      let projectionHigh = prop.line;
      let edge = 0;
      let p0Note = "P0 fallback";

      if (prop.market === "Points") {
        const p0Result = projectPointsP0({
          line: prop.line,
          minutes,
          usageRate,
          projectedPace,
          projectedPossessions,
          opponent,
          recentPointsPerPoss: estimateRecentPointsPerPoss(playerStats, projectedPace)
        });
        projectionMid = p0Result.projection.mid;
        projectionLow = p0Result.projection.low;
        projectionHigh = p0Result.projection.high;
        edge = p0Result.edge;
        p0Note = p0Result.notes;
      } else {
        const band = Math.max(1, (minutes ?? 28) / 12);
        projectionMid = prop.line + band;
        projectionLow = prop.line - band / 2;
        projectionHigh = prop.line + band * 1.5;
        edge = projectionMid - prop.line;
        p0Note = `Heuristic projection (${prop.market}) mid=${projectionMid.toFixed(
          1
        )}, minutes input=${minutes ?? "n/a"}`;
      }

      if (edge < 1) continue;

      const confidence: Play["confidence"] = edge >= 4 ? "LOCK" : "HIGH";

      const blowout = assessBlowoutRisk({
        vegas: matchup.vegas,
        schedule: matchup.schedule?.[prop.team]
      });
      const regression = detectRegression({
        recentAverage: playerStats?.recent_points_avg,
        seasonAverage: playerStats?.points_avg
      });

      const hitProbBase = confidence === "LOCK" ? 0.64 : 0.58;
      const hit_prob = Math.max(
        0.5,
        Math.min(
          0.72,
          hitProbBase - (blowout.flagged ? 0.03 : 0) - (regression.flagged ? 0.02 : 0)
        )
      );

      const roleNote = `Role: minutes=${minutes ?? "n/a"}, usage=${
        usageRate ?? "n/a"
      }, recentMinutes=${playerStats?.recent_minutes_avg ?? "n/a"}, shots=${shotVolume ?? "n/a"}`;

      const matchupNote = `Pace=${projectedPace.toFixed(1)}, possessions=${projectedPossessions.toFixed(
        1
      )}, opponentDef=${opponent?.defensive_rating ?? "n/a"}`;

      const preFilterNote =
        preFilterResult.reasons.length > 0
          ? preFilterResult.reasons.join(", ")
          : "Passed all pre-filters.";

      const play: Play = {
        player: prop.player,
        team: prop.team,
        market: prop.market,
        line: prop.line,
        side: "Over",
        confidence,
        projection: {
          low: projectionLow,
          mid: projectionMid,
          high: projectionHigh
        },
        hit_prob,
        module_notes: {
          PreFilters: preFilterNote,
          P0: p0Note,
          Volume: volumeResult.notes,
          Matchup: matchupNote,
          Regression: regression.notes,
          Role: roleNote,
          Blowout: blowout.notes
        }
      };

      plays.push(play);
    }
  }

  return {
    plays,
    notes:
      "Output generated by upgraded P0 projections, enriched volume/role tags, and new blowout/regression checks."
  };
}
