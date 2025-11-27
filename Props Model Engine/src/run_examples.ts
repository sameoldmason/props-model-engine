// src/run_examples.ts

import {
  GeneratePlaysRequest,
  GeneratePlaysResponse,
  Play
} from "./types";

// Fake input to simulate /generate-plays
const exampleRequest: GeneratePlaysRequest = {
  slate_date: "2025-11-26",
  matchups: [
    {
      home_team: "Pistons",
      away_team: "Celtics",
      starters: {
        Celtics: [
          { player: "Jayson Tatum", minutes_proj: 37 },
          { player: "Jaylen Brown", minutes_proj: 35 }
        ],
        Pistons: [
          { player: "Cade Cunningham", minutes_proj: 36 },
          { player: "Jalen Duren", minutes_proj: 30 }
        ]
      },
      pace: {
        team_pace_1: 99.0,
        team_pace_2: 100.5,
        projected_pace: 100.0
      },
      props: [
        {
          player: "Jayson Tatum",
          team: "Celtics",
          market: "Points",
          line: 28.5,
          book: "ExampleBook",
          odds: -115
        },
        {
          player: "Jalen Duren",
          team: "Pistons",
          market: "Rebounds",
          line: 10.5,
          book: "ExampleBook",
          odds: -115
        }
      ]
    }
  ]
};

// ----------------------------
// Fake model logic (placeholder)
// ----------------------------

function generateDummyPlays(req: GeneratePlaysRequest): GeneratePlaysResponse {
  const plays: Play[] = [
    {
      player: "Jayson Tatum",
      team: "Celtics",
      market: "Points",
      line: 28.5,
      side: "Over",
      confidence: "HIGH",
      projection: {
        low: 27.0,
        mid: 30.2,
        high: 33.1
      },
      hit_prob: 0.61,
      module_notes: {
        P0: "30.2 pts on 20-22 FGA",
        Volume: "StrongVolume",
        Matchup: "Advantage",
        Regression: "No red flags",
        Role: "Stable star usage",
        Blowout: "Medium risk"
      }
    },
    {
      player: "Jalen Duren",
      team: "Pistons",
      market: "Rebounds",
      line: 10.5,
      side: "Over",
      confidence: "LOCK",
      projection: {
        low: 10.1,
        mid: 12.4,
        high: 14.0
      },
      hit_prob: 0.68,
      module_notes: {
        P0: "12.4 rebounds projected",
        Volume: "StrongVolume",
        Matchup: "Glass advantage",
        Regression: "No red flags",
        Role: "Stable center minutes",
        Blowout: "Medium"
      }
    }
  ];

  return {
    plays,
    notes: "Dummy example output for testing schema."
  };
}

// actually run it and print to console
const result = generateDummyPlays(exampleRequest);
console.log(JSON.stringify(result, null, 2));
