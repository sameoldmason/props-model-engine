// src/model/p0.ts

import { OpponentEfficiency, Projection } from "../types";

export interface P0PointsInputs {
  line: number;
  minutes: number | null;
  usageRate: number | null;
  projectedPace: number;
  projectedPossessions: number | null;
  opponent: OpponentEfficiency | null;
  recentPointsPerPoss?: number | null;
}

export interface P0PointsResult {
  projection: Projection;
  edge: number;
  notes: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deriveEfficiencyMultiplier(opponent: OpponentEfficiency | null): number {
  if (!opponent) return 1.0;

  const defenseAdjust = 110 / opponent.defensive_rating;
  const penalty = opponent.efficiency_penalty ?? 0;

  return clamp(defenseAdjust - penalty, 0.85, 1.15);
}

export function projectPointsP0(inputs: P0PointsInputs): P0PointsResult {
  const minutes = inputs.minutes ?? 30;
  const usageRate = inputs.usageRate ?? 0.23;
  const possessions = inputs.projectedPossessions ?? inputs.projectedPace;

  const onCourtPossessions = possessions * (minutes / 48);
  const scoringOps = onCourtPossessions * usageRate;

  const baselineEfficiency = inputs.recentPointsPerPoss ?? 1.05;
  const opponentAdjustment = deriveEfficiencyMultiplier(inputs.opponent);

  const projectedPointsMid = scoringOps * baselineEfficiency * opponentAdjustment;

  const band = Math.max(1.5, projectedPointsMid * 0.08);
  const projection: Projection = {
    low: projectedPointsMid - band,
    mid: projectedPointsMid,
    high: projectedPointsMid + band
  };

  const edge = projection.mid - inputs.line;
  const notes = `P0(points): pace=${inputs.projectedPace.toFixed(1)}, possessions=${possessions.toFixed(
    1
  )}, usage=${(usageRate * 100).toFixed(1)}%, oppAdj=${opponentAdjustment.toFixed(
    2
  )}, mid=${projection.mid.toFixed(1)} (edge=${edge.toFixed(1)})`;

  return {
    projection,
    edge,
    notes
  };
}
