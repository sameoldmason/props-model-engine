# Props Model Engine

This repository contains a lightweight prototype of the props model engine using BALLDONTLIE-style data. The current iteration focuses on ingesting pace/usage/efficiency inputs, projecting points with a P0 module, and wiring matchup modules such as volume, blowout, and regression stubs.

## Data requirements

The engine expects each `Matchup` to include:

- `pace.projected_pace` and `pace.projected_possessions` for pace/possessions context.
- `player_stats` entries with minutes, usage, FGA, FTA, season points, and recent form (minutes/usage/points).
- `opponent_efficiency` keyed by opponent team, carrying defensive rating and opponent points-per-possession.
- Optional `vegas` (spread/total) and `schedule` (back-to-back, games in four, rest days) for blowout risk checks.

The new `src/data/ballDontLie.ts` module includes a thin client plus a fixture bundle to satisfy these fields for offline runs.

## Running the example

1. Ensure dependencies are installed (TypeScript + ts-node):
   ```bash
   npm install
   ```
2. Execute the fixture-driven example:
   ```bash
   npx ts-node src/run_examples.ts
   ```
   This loads the BALLDONTLIE fixture, maps it into `GeneratePlaysRequest`, and prints the upgraded `generatePlays` output with P0 projections, volume notes, blowout, and regression annotations.

## Next steps

- Replace the thin BALLDONTLIE client with live HTTP calls.
- Extend P0 logic for non-points markets and add richer regression signals.
- Add more fixtures (different spreads, missing data) to harden module coverage.
