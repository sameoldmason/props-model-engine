// src/data/nbaApiRealAdapter.ts

import { RealApiGamePayload } from "./nbaApiRealTypes";

// TEMP: Pretend this is a response from a real API endpoint
const mockRealApiResponse: Record<string, RealApiGamePayload> = {
  "Pistons-Celtics": {
    date: "2025-11-26",
    home_team: "Pistons",
    away_team: "Celtics",

    projected_pace: 100.5,

    projected_minutes: [
      { player_name: "Jayson Tatum", team: "Celtics", projected_minutes: 37 },
      { player_name: "Jaylen Brown", team: "Celtics", projected_minutes: 35 },
      { player_name: "Cade Cunningham", team: "Pistons", projected_minutes: 36 },
      { player_name: "Jalen Duren", team: "Pistons", projected_minutes: 30 }
    ],

    props: [
      {
        player_name: "Jayson Tatum",
        team: "Celtics",
        market: "Points",
        line: 28.5,
        odds: -115,
        book: "DraftKings"
      },
      {
        player_name: "Jalen Duren",
        team: "Pistons",
        market: "Rebounds",
        line: 10.5,
        odds: -115,
        book: "DraftKings"
      }
    ],

    boxscore_players: [
      {
        player_id: 1,
        player_name: "Jayson Tatum",
        team: "Celtics",
        minutes: 37,
        points: 29,
        rebounds: 8,
        assists: 5
      }
    ],

    team_stats: [
      {
        team: "Celtics",
        pace: 100.5,
        offensive_rating: 113,
        defensive_rating: 107
      },
      {
        team: "Pistons",
        pace: 99.8,
        offensive_rating: 109,
        defensive_rating: 112
      }
    ]
  }
};

// Instead of calling an actual API, return mock data.
export async function fetchRealApiGamePayload(
  home: string,
  away: string,
  date: string
): Promise<RealApiGamePayload | null> {
  const key = `${home}-${away}`;
  return mockRealApiResponse[key] || null;
}
