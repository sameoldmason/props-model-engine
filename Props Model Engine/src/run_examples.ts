// src/run_examples.ts

import { GeneratePlaysRequest } from "./types";
import { generatePlays } from "./engine";

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

const result = generatePlays(exampleRequest);
console.log(JSON.stringify(result, null, 2));
