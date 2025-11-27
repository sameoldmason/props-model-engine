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
}): VolumeResult {
  const { minutes, market, line } = params;

  // Unknown minutes → we can't be sure.
  if (minutes === null) {
    return {
      tag: "UnknownVolume",
      notes: "Minutes unknown → tagging volume as UnknownVolume."
    };
  }

  let tag: VolumeTag;

  if (minutes >= 36) tag = "StrongVolume";
  else if (minutes >= 30) tag = "MediumVolume";
  else tag = "WeakVolume";

  // You can later condition this by market/role/usage/etc.
  const notes = `VolumeTag=${tag} based on minutes=${minutes} and market=${market}, line=${line}.`;

  return {
    tag,
    notes
  };
}
