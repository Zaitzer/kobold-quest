# Kobold Quest: from prototype to proper game

We have a **prototype**: the systems work (map, battles, story, multiplayer, server), but the content and the polish
are placeholders. A studio would now go through these phases in order, and each phase has its roles in order. A phase
ends at its **gate**: Joakim (creative director / producer) says it's good enough to move on.

## Where we are (20 Oct 2026)

The story was rebuilt from the ground up (v6, `docs/story-hatching.md`, also as the doc "Kobold Quest: The Hatching"):
Hearthspire in the middle of the map, buns, Bib, Snatchclaw's guards, the Dragon Smiler, seven companions (one per
deadly sin), the twelve D&D classes, five towns. So **we're back in pre-production for the story and the world**;
the engine and the slice's systems carry over unchanged.

**Carries over:** the engine (battles, map, rooms, saves, multiplayer, server), the slice's systems (route encounters,
fountains and respawn, fast travel, roster, level sync, music and sounds, campfire chats, ember-buns, the art pipeline,
the desktop layout), the simulators and tests, and Joakim's drawings (Pip, grass).

**Out of date:** the slice's content (Burrowhome, the valley, sparks, bandits, Copperhollow), the world plan, the
design document, and parts of the story bible.

## Phase 1: Pre-production (decide before building), second pass

| # | role | deliverable | status |
|---|---|---|---|
| 1.1 | Creative director + game designer | **Vision** (`docs/vision.md`) | done; check against the new story |
| 1.2 | Game designer | **Design document** (`docs/design.md`): the twelve classes (two waves), seven companions, keeper challenges, field moves (raptors, boats), Smiler pieces instead of sparks | **to update** (step 2) |
| 1.3 | Narrative writer | **Story** (`docs/story-hatching.md`, v6) and story bible | story done; bible to tidy |
| 1.4 | Level designer | **World plan** (`docs/world-plan.md`): Hearthspire in the middle, five towns, the routes between them, where raptors and boats open the map, level ranges | **v2 drafted 20 Oct**, waiting for Joakim's answers (3 questions at the end) |
| 1.5 | Art director (Joakim draws) | **Style guide** and templates | done; drawing under way (Pip, grass) |
| 1.6 | Sound designer | **Audio plan** | done; add tracks for Hearthspire and the castle |
| 1.7 | Technical lead | **Tech plan** | done; add the rename list (warrior to fighter, sparks to pieces, bandits to guards, Mossbacks to Nettlenose) |
| 1.8 | Producer | **Scope** (`docs/scope.md`) | to update with five towns, seven companions, two class waves |

**Next, in order:**
1. **World plan:** the new map. *(v2 drafted; confirm the three open questions.)*
2. **Design document:** classes (wave 1 first), companions, keeper challenges, field moves.
3. **Gate 1 again:** Joakim reads both and says go.
4. **The new vertical slice** (phase 2 below).

**Gate 1:** passed 17 Oct 2026 for the first story; **to pass again** with story v6.

## Phase 2: Vertical slice (one piece, finished properly), second pass

**Hearthspire (act 1) → the capital gate → route → Pebblebrook (with the mine)**, built to final quality. It covers
the opening of the real story: the hatching, Bib, Mallow, Glitterbeak, Bork at the gate, the first keeper challenge,
Grubb and Snipe, Nugget, the first Smiler piece and the raptors.

| # | role | work |
|---|---|---|
| 2.1 | Systems designer + gameplay programmer | Hearthspire on the map; Smiler pieces; keeper challenges; class wave 1; companion arcs and quests; raptor travel |
| 2.2 | Level designer | Hearthspire (marble streets, castle, nest, tower), the capital gate, the route, Pebblebrook with the mine |
| 2.3 | Narrative writer | the slice's dialogue, from story v6 |
| 2.4 | Artist | Joakim's drawings for the slice's cast and tiles |
| 2.5 | Sound designer | Hearthspire and castle tracks |
| 2.6 | Balance analyst | the slice simulator rerun on the new path and classes |
| 2.7 | QA | tests for everything in the slice |

**Already built in the first pass and kept:** route encounters and materials, fountains and respawn, fast travel,
roster and inns, level sync and shared boss credit, music and sounds, campfire chats, ember-buns, balance tools,
the art pipeline, the desktop layout.

**Gate 2:** Joakim and friends play the new slice and say it's fun.

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
