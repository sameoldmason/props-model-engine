// src/data/ballDontLie.ts

import {
  GeneratePlaysRequest,
  Matchup,
  OpponentEfficiency,
  PlayerUsageProfile,
  ScheduleSpot,
  VegasInfo
} from "../types";

interface BallDontLiePlayerBoxScore {
  id: number;
  full_name: string;
  team: string;
  minutes: number;
  points: number;
  fga: number;
  fta: number;
  usage: number;
  recent_minutes?: number;
  recent_usage?: number;
  recent_points?: number;
}

interface BallDontLieTeamPace {
  team: string;
  pace: number;
  possessions: number;
}

interface BallDontLieOpponentStats {
  team: string;
  defensive_rating: number;
  opponent_points_per_possession: number;
  efficiency_penalty?: number;
}

interface BallDontLieProp {
  player: string;
  team: string;
  market: "Points";
  line: number;
  book: string;
  odds: number;
}

interface BallDontLieGameBundle {
  date: string;
  home: string;
  away: string;
  players: BallDontLiePlayerBoxScore[];
  team_pace: BallDontLieTeamPace[];
  opponent_defense: BallDontLieOpponentStats[];
  props: BallDontLieProp[];
  vegas: VegasInfo;
  schedule: Record<string, ScheduleSpot>;
}

const fixtureGames: BallDontLieGameBundle[] = [
  {
    date: "2025-11-26",
    home: "Pistons",
    away: "Celtics",
    players: [
      {
        id: 1,
        full_name: "Jayson Tatum",
        team: "Celtics",
        minutes: 37,
        points: 29,
        fga: 21,
        fta: 8,
        usage: 0.30,
        recent_minutes: 36.5,
        recent_usage: 0.31,
        recent_points: 30.1
      },
      {
        id: 2,
        full_name: "Jaylen Brown",
        team: "Celtics",
        minutes: 35,
        points: 24,
        fga: 18,
        fta: 6,
        usage: 0.27,
        recent_minutes: 34,
        recent_usage: 0.26,
        recent_points: 23
      },
      {
        id: 3,
        full_name: "Cade Cunningham",
        team: "Pistons",
        minutes: 36,
        points: 25,
        fga: 20,
        fta: 7,
        usage: 0.29,
        recent_minutes: 35,
        recent_usage: 0.30,
        recent_points: 26
      },
      {
        id: 4,
        full_name: "Jalen Duren",
        team: "Pistons",
        minutes: 30,
        points: 12,
        fga: 9,
        fta: 4,
        usage: 0.18,
        recent_minutes: 28,
        recent_usage: 0.17,
        recent_points: 11
      }
    ],
    team_pace: [
      { team: "Celtics", pace: 100.5, possessions: 102 },
      { team: "Pistons", pace: 99.3, possessions: 99 }
    ],
    opponent_defense: [
      {
        team: "Pistons",
        defensive_rating: 113,
        opponent_points_per_possession: 1.14,
        efficiency_penalty: 0.02
      },
      {
        team: "Celtics",
        defensive_rating: 109,
        opponent_points_per_possession: 1.09,
        efficiency_penalty: -0.03
      }
    ],
    props: [
      {
        player: "Jayson Tatum",
        team: "Celtics",
        market: "Points",
        line: 23.5,
        book: "FixtureBook",
        odds: -115
      },
      {
        player: "Cade Cunningham",
        team: "Pistons",
        market: "Points",
        line: 22.0,
        book: "FixtureBook",
        odds: -110
      }
    ],
    vegas: {
      spread: -9.5,
      total: 228.5
    },
    schedule: {
      Celtics: { back_to_back: false, games_in_four: 2, rest_days: 2 },
      Pistons: { back_to_back: true, games_in_four: 3, rest_days: 0 }
    }
  }
];

export class BallDontLieClient {
  constructor(private readonly useFixtures = true) {}

  async fetchGameBundle(
    date: string,
    home: string,
    away: string
  ): Promise<BallDontLieGameBundle | null> {
    if (this.useFixtures) {
      return (
        fixtureGames.find(
          (g) => g.date === date && g.home === home && g.away === away
        ) || null
      );
    }

    // Thin client placeholder: wire up real HTTP calls later
    return null;
  }
}

function mapPlayers(players: BallDontLiePlayerBoxScore[]): Record<string, PlayerUsageProfile> {
  return players.reduce<Record<string, PlayerUsageProfile>>((acc, player) => {
    acc[player.full_name] = {
      player: player.full_name,
      team: player.team,
      minutes_avg: player.minutes,
      usage_rate: player.usage,
      fga: player.fga,
      fta: player.fta,
      points_avg: player.points,
      recent_minutes_avg: player.recent_minutes,
      recent_usage_rate: player.recent_usage,
      recent_points_avg: player.recent_points
    };
    return acc;
  }, {});
}

function mapOpponentEfficiency(
  stats: BallDontLieOpponentStats[]
): Record<string, OpponentEfficiency> {
  return stats.reduce<Record<string, OpponentEfficiency>>((acc, teamStats) => {
    acc[teamStats.team] = {
      team: teamStats.team,
      defensive_rating: teamStats.defensive_rating,
      opponent_points_per_possession: teamStats.opponent_points_per_possession,
      efficiency_penalty: teamStats.efficiency_penalty
    };
    return acc;
  }, {});
}

function buildStarters(players: BallDontLiePlayerBoxScore[]): Record<string, { player: string; minutes_proj: number }[]> {
  const teams = Array.from(new Set(players.map((p) => p.team)));
  const starters: Record<string, { player: string; minutes_proj: number }[]> = {};

  for (const team of teams) {
    const startersForTeam = players
      .filter((p) => p.team === team)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5)
      .map((p) => ({ player: p.full_name, minutes_proj: p.minutes }));

    starters[team] = startersForTeam;
  }

  return starters;
}

export function mapBallDontLieBundleToMatchup(bundle: BallDontLieGameBundle): Matchup {
  const projectedPace =
    bundle.team_pace.reduce((sum, t) => sum + t.pace, 0) / bundle.team_pace.length;
  const projectedPossessions =
    bundle.team_pace.reduce((sum, t) => sum + t.possessions, 0) / bundle.team_pace.length;

  return {
    home_team: bundle.home,
    away_team: bundle.away,
    starters: buildStarters(bundle.players),
    pace: {
      team_pace_1: bundle.team_pace[0]?.pace ?? projectedPace,
      team_pace_2: bundle.team_pace[1]?.pace ?? projectedPace,
      projected_pace: projectedPace,
      projected_possessions: projectedPossessions
    },
    player_stats: mapPlayers(bundle.players),
    opponent_efficiency: mapOpponentEfficiency(bundle.opponent_defense),
    vegas: bundle.vegas,
    schedule: bundle.schedule,
    props: bundle.props
  };
}

export function buildGeneratePlaysRequestFromBundle(
  bundle: BallDontLieGameBundle
): GeneratePlaysRequest {
  return {
    slate_date: bundle.date,
    matchups: [mapBallDontLieBundleToMatchup(bundle)]
  };
}

export function loadBallDontLieFixture(): BallDontLieGameBundle {
  return fixtureGames[0];
}
