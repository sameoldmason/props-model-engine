export type Market =
  | "Points"
  | "Rebounds"
  | "Assists"
  | "PRA"
  | "PR"
  | "PA"
  | "AR";

export interface PropLine {
  player: string;
  team: string;
  market: Market;
  line: number;
  book: string;
  odds: number;
}

export interface StarterProjection {
  player: string;
  minutes_proj: number;
}

export interface Matchup {
  home_team: string;
  away_team: string;
  starters: Record<string, StarterProjection[]>;
  pace: {
    team_pace_1: number;
    team_pace_2: number;
    projected_pace: number;
  };
  props: PropLine[];
}

export interface GeneratePlaysRequest {
  slate_date: string;
  matchups: Matchup[];
}

export interface Projection {
  low: number;
  mid: number;
  high: number;
}

export interface ModuleNotes {
  PreFilters: string;
  P0: string;
  Volume: string;
  Matchup: string;
  Regression: string;
  Role: string;
  Blowout: string;
}

export interface Play {
  player: string;
  team: string;
  market: Market;
  line: number;
  side: "Over" | "Under";
  confidence: "LOCK" | "HIGH";
  projection: Projection;
  hit_prob: number;
  module_notes: ModuleNotes;
}

export interface GeneratePlaysResponse {
  plays: Play[];
  notes: string;
}
