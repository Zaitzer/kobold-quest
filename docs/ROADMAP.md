# Kobold Quest: from prototype to proper game

We have a **prototype**: the systems work (map, battles, story, multiplayer, server), but the content and the polish
are placeholders. A studio would now go through these phases in order, and each phase has its roles in order. A phase
ends at its **gate**: Joakim (creative director / producer) says it's good enough to move on.

## Phase 1: Pre-production (decide before building)

| # | role | deliverable | status |
|---|---|---|---|
| 1.1 | Creative director + game designer | **Vision**: what the game is, who it's for, its pillars, what it is *not* (`docs/vision.md`) | done |
| 1.2 | Game designer | **Design document**: core loop, session length, progression, battles, party, economy, multiplayer's role (`docs/design.md`) | done |
| 1.3 | Narrative writer | **Story bible**: the Hatching, characters, tone rules (`docs/story-bible.md`, plot in `docs/story-hatching.md`) | done |
| 1.4 | Level designer | **World plan**: what each town and route is for, level ranges, where the key items go (`docs/world-plan.md`) | draft |
| 1.5 | Art director (Joakim draws) | **Style guide**: palette, shapes, outline, how kobolds/monsters/tiles look, sizes to draw at | |
| 1.6 | Sound designer | **Audio plan**: music per area, sound list | |
| 1.7 | Technical lead | **Tech plan**: what the code must handle (save format, performance on phones, content pipeline, **art pipeline for Joakim's drawings**) | |
| 1.8 | Producer | **Scope and milestones**: what's in v1.0, what waits | |

**Gate 1:** the vision and the design document are agreed.

## Phase 2: Vertical slice (one piece, finished properly)

Burrowhome → Route 1 → Pebblebrook → Route 3 → Copperhollow, built to final quality: systems, levels, writing, art,
sound, balance. It proves the whole pipeline and sets the bar for everything else.

| # | role | work |
|---|---|---|
| 2.1 | Systems designer + gameplay programmer | encounter zones per route, materials, rewards, fast travel, rival system |
| 2.2 | Level designer | hand-polish the slice's routes and towns |
| 2.3 | Narrative writer | final dialogue for the slice |
| 2.4 | Artist | art pass on the slice's tiles, characters, monsters |
| 2.5 | Sound designer | music and sounds for the slice |
| 2.6 | Balance analyst | levels, fights and rewards tuned with the simulators |
| 2.7 | QA | tests for everything in the slice |

**Gate 2:** Joakim and friends play the slice and say it's fun.

## Phase 3: Production (the rest of the game, at slice quality)

Story parts 2–5 town by town, each going through the same roles as the slice.

## Phase 4: Alpha → Beta

| # | role | work |
|---|---|---|
| 4.1 | QA + balance | the whole game played through, bugs and difficulty fixed |
| 4.2 | UX designer | first-time player flow, menus, tutorial |
| 4.3 | Playtesters (friends) | feedback through Quill's letters |
| 4.4 | Everyone | polish |

**Gate 4:** nothing left that a friend would stumble on.

## Phase 5: Release and live

Launch to more players, then updates: community (letters), events, new content.
