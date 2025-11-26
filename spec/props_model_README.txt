# props-model README

## 1. What This Is

This repo holds the spec for my NBA player prop model.

It is **not** the codebase yet.  
It is the **blueprint** that future-me (or any dev) can turn into a real app or service.

Core idea:
- Use a clear, rules-based model spec.
- Feed it with clean, timestamped NBA data.
- Get back structured picks (LOCK/HIGH) and diagnostic info.

---

## 2. Files and Structure

Suggested structure:

/spec  
- model_core_spec_v5.4.txt  
- runtime_modes_v6.7.txt  
- diagnostics_spec_film_room_v1.0.txt  
- risk_and_limits_v1.0.txt  

/examples  
- matchup_example_01.md  
- film_room_example_01.md  

You can adjust extensions (.txt/.md) as you prefer, but **content** is what matters.

### 2.1 model_core_spec_v5.4

Defines the **engine**:

- modules P0–12  
- how to project minutes, volume, efficiency, and points  
- how to apply matchup, archetype, regression, role compression, blowout, home/road  
- how to assign confidence levels (LOCK/HIGH)  
- required inputs and suggested output format

This is the main “brain” of the model.

### 2.2 runtime_modes_v6.7

Defines the **runtime behavior**:

- how a matchup is accepted  
- how data is pulled (only timestamped, same-day)  
- how and when to run the modules  
- which prop categories are allowed  
- what the final API response should look like  
- what behavior is forbidden (no fluff, no invented stats, no extra chatter)

This is the “how to run the brain” spec.

### 2.3 diagnostics_spec_film_room_v1.0

Defines **Film Room mode**:

- only for completed bets and games  
- classifies each prop as:
  - Good Read – Unlucky
  - Bad Read – Model Error
  - Mixed Case  
- attributes issues to specific modules  
- suggests **no change**, **soft candidate**, or **strong candidate** model tweaks  
- provides a JSON shape for diagnostic output

This is the “debug and coaching” spec.

### 2.4 risk_and_limits_v1.0

Defines **risk and discipline**:

- unit size logic  
- maximum number of straight bets per night  
- parlay structure (realistic + lotto)  
- weekly cost cap  
- emotional and schedule gates (tilt, stress, fatigue)  
- logging rules  
- end-of-week summary

This is the “don’t let this become a problem” spec.

---

## 3. How Everything Fits Together

High-level flow for a future app:

1. **User chooses matchup(s).**  
2. **Backend pulls same-day NBA data** (stats, rotations, injuries, lines, etc.).  
3. **Backend runs the model** using:
   - model_core_spec_v5.4 (engine rules)
   - runtime_modes_v6.7 (how to orchestrate the run)
4. **Backend applies risk_and_limits_v1.0** to:
   - limit number of bets
   - respect unit and budget constraints
   - block bets on tilt/overload
5. **App displays picks**:
   - LOCK/HIGH plays
   - short explanations
6. **After games are over**, the user can:
   - send completed bets through diagnostics_spec_film_room_v1.0  
   - log module issues
   - upgrade rules slowly and carefully

---

## 4. Future Dev Notes

### 4.1 Backend TODO

When turning this into a real service, backend will need to:

- integrate with NBA stats APIs (for box scores, advanced stats, pace, etc.)  
- integrate with sportsbook APIs (for lines and odds)  
- implement a **projection pipeline** that follows model_core_spec_v5.4  
- expose endpoints like:
  - `POST /generate-plays` (matchup + slate info in, plays out)
  - `POST /diagnostics` (past bets in, Film Room diagnostics out)
  - `GET /weekly-summary` (risk and logging overview)

### 4.2 Frontend TODO

Frontend should eventually:

- let user:
  - pick games and markets
  - review model-generated plays
  - confirm which bets they actually placed  
- show:
  - current slate picks
  - unit usage and weekly budget progress
  - simple visualizations (hit rate, units, module issues)
- provide Film Room UI:
  - user selects a past bet
  - gets a clean diagnostic result

---

## 5. Versioning

Version tags to track:

- Model engine: `v5.4`  
- Runtime modes: `v6.7`  
- Film Room diagnostics: `v1.0`  
- Risk & limits: `v1.0`

Whenever you:

- change module logic → bump model version  
- change runtime behavior → bump runtime version  
- change diagnostic criteria → bump Film Room version  
- change risk rules → bump risk version  

Record changes in a simple `CHANGELOG.md`:

Example:

- 2025-11-26 — model_core_spec_v5.4
  - Added strict declining-minutes rule.
  - Tightened high-line filter for 28.5+.
- 2025-11-26 — runtime_modes_v6.7
  - Enforced single matchup-ask rule.
  - Required timestamps for all data.

---

## 6. How to Use This Repo

Right now, this is a **spec repo**, not a production app.

Use it to:

- keep all brain and behavior rules in one place  
- share with future chats or devs without needing full transcripts  
- avoid “vague memory” changes and stick to explicit, documented rules  

When you’re ready to code:

1. Clone this repo to your dev machine.
2. Build the backend around these specs.
3. Keep updating the specs and CHANGELOG when the model evolves.

This README is the map.  
The `/spec` files are the instructions.  
The code will come later.

