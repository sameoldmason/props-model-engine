// src/modules/volumeChain.ts

import { Market } from "../types";

export type VolumeTag =
  | "StrongVolume"
  | "MediumVolume"
  | "WeakVolume"
  | "UnknownVolume";

export interface VolumeResult {
  tag: VolumeTag;
  notes: string;
}

/**
 * Simple Volume Chain placeholder.
 * Right now it uses minutes + market + line to guess volume strength.
 */
export function runVolumeChain(params: {
  minutes: number | null;
  market: Market;
  line: number;
  usageRate?: number | null;
  shotVolume?: number | null;
  recentMinutes?: number | null;
  emphasize?: boolean;
}): VolumeResult {
  const { minutes, market, line, usageRate, shotVolume, recentMinutes, emphasize } = params;

  const stableMinutes = recentMinutes ?? minutes;

  // Unknown minutes → we can't be sure.
  if (stableMinutes === null) {
    return {
      tag: "UnknownVolume",
      notes: "Volume unknown → minutes missing."
    };
  }

  let tag: VolumeTag = "WeakVolume";
  const usage = usageRate ?? 0;
  const shots = shotVolume ?? 0;

  if (stableMinutes >= 35 && (usage >= 0.27 || shots >= 19)) {
    tag = "StrongVolume";
  } else if (stableMinutes >= 31 && (usage >= 0.24 || shots >= 15)) {
    tag = "MediumVolume";
  } else if (stableMinutes >= 28) {
    tag = "WeakVolume";
  }

  const emphasis = emphasize ? "LOCK/HIGH emphasis" : "baseline";
  const notes = `VolumeTag=${tag} (${emphasis}) → minutes=${stableMinutes}, usage=${usageRate?.toFixed(
    2
  ) ?? "n/a"}, shots=${shotVolume ?? "n/a"}, market=${market}, line=${line}.`;

  return {
    tag,
    notes
  };
}
