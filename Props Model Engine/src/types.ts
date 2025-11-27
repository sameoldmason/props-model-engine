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

export interface PlayerUsageProfile {
  player: string;
  team: string;
  /** Season-long or blended minutes expectation */
  minutes_avg: number;
  /** Estimated usage rate (0-1). */
  usage_rate: number;
  /** Average field-goal attempts per game. */
  fga: number;
  /** Average free-throw attempts per game. */
  fta: number;
  /** Season points per game. */
  points_avg: number;
  /** Recent form: minutes over the last five games. */
  recent_minutes_avg?: number;
  /** Recent form: usage rate over the last five games. */
  recent_usage_rate?: number;
  /** Recent form: points over the last five games. */
  recent_points_avg?: number;
}

export interface OpponentEfficiency {
  team: string;
  /** Lower is better defense; roughly aligned to Defensive Rating. */
  defensive_rating: number;
  /** Per-possession scoring allowed. */
  opponent_points_per_possession: number;
  /** Simple efficiency suppression factor (1.0 = neutral). */
  efficiency_penalty?: number;
}

export interface ScheduleSpot {
  back_to_back: boolean;
  games_in_four: number;
  rest_days: number;
}

export interface VegasInfo {
  spread: number;
  total?: number;
}

export interface Matchup {
  home_team: string;
  away_team: string;
  starters: Record<string, StarterProjection[]>;
  pace: {
    team_pace_1: number;
    team_pace_2: number;
    projected_pace: number;
    projected_possessions: number;
  };
  /** Player-level advanced stats derived from ingestion. */
  player_stats: Record<string, PlayerUsageProfile>;
  /** Opponent-level defensive efficiency used by P0 + matchup modules. */
  opponent_efficiency: Record<string, OpponentEfficiency>;
  /** Simple Vegas context for blowout checks. */
  vegas?: VegasInfo;
  /** Rest and fatigue context keyed by team name. */
  schedule?: Record<string, ScheduleSpot>;
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
