// src/run_examples.ts

import { buildGeneratePlaysRequestFromBundle, loadBallDontLieFixture } from "./data/ballDontLie";
import { generatePlays } from "./engine";

// Fixture-driven example to mimic BALLDONTLIE ingestion
const bundle = loadBallDontLieFixture();
const exampleRequest = buildGeneratePlaysRequestFromBundle(bundle);

const result = generatePlays(exampleRequest);
console.log(JSON.stringify(result, null, 2));
