// src/modules/regression.ts

export interface RegressionSignal {
  flagged: boolean;
  direction: "Positive" | "Negative" | "Neutral";
  delta: number | null;
  notes: string;
}

export function detectRegression(params: {
  recentAverage: number | undefined;
  seasonAverage: number | undefined;
}): RegressionSignal {
  const { recentAverage, seasonAverage } = params;

  if (recentAverage === undefined || seasonAverage === undefined) {
    return {
      flagged: false,
      direction: "Neutral",
      delta: null,
      notes: "Regression check: missing data → neutral."
    };
  }

  const delta = recentAverage - seasonAverage;

  if (Math.abs(delta) < 1.5) {
    return {
      flagged: false,
      direction: "Neutral",
      delta,
      notes: `Regression check: stable (Δ=${delta.toFixed(1)})`
    };
  }

  const direction: RegressionSignal["direction"] = delta > 0 ? "Positive" : "Negative";
  const flagged = Math.abs(delta) >= 3;
  const qualifier = flagged ? "flagged" : "soft";

  return {
    flagged,
    direction,
    delta,
    notes: `Regression ${qualifier}: recent ${recentAverage.toFixed(
      1
    )} vs season ${seasonAverage.toFixed(1)} (Δ=${delta.toFixed(1)})`
  };
}
