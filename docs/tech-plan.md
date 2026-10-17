# Kobaldia: tech plan (draft)

*Step 1.7 of the roadmap. What the code must handle to carry the design, and what has to change before we build it.*

## Targets and budgets

| what | budget |
|---|---|
| Devices | phones held sideways (Chrome, Safari), desktop browsers; the Claude page |
| Frame rate | 60 fps on a mid-range phone; never below 30 |
| Download | the page under 3 MB with all drawings; the website loads drawings separately, so first load stays small |
| Start | playable within 3 seconds on a phone |
| Saves | under 64 KB per player |
| Players online together | 50 for the friends version, a few hundred later |

## What stays as it is

- **One codebase, two outputs:** the website (with the game server) and the Claude page. Room topic `kq`, save format and
  db paths stay compatible.
- **Modules and the feature registry** (`ARCHITECTURE.md`), **quest rules as data**, **the world as a plan** (`REGION`).
- **Deploys:** push to `main`, the server pulls within 2 minutes; pages on an older build reload themselves.
- **Tests:** logic tests in Node, browser tests on phone sizes, battle simulators. Every new system gets tests.

## Pipelines

| content | where it lives | how it gets in |
|---|---|---|
| Drawings | `art/sprites/*.png` | Joakim saves from Paint.NET and pushes; live in ~2 minutes (built) |
| Sounds (optional) | `art/sounds/*.ogg` | same as drawings (to build when needed) |
| Dialogue and quests | `src/data/dialogue.js` (rules) | written by me; checked by the story test |
| World | `REGION` in `src/data/overworld.js`, towns by theme, rooms in `places.js` | edited as data; overworld test checks every route, door and sign |
| Monsters, items, balance | `src/data/*.js` | data tables; simulators check balance |

## New systems the design needs

| system | notes | save change |
|---|---|---|
| Encounter tables per route | each route kind gets its own monsters and material; levels by distance | no |
| Respawn at fountains | losing a fight: back to the last fountain drunk from, half gold | yes (last fountain) |
| Fast travel | warp between fountains you've drunk from, after spark 2 | yes (fountains visited) |
| Roster and recruits | more than 3 kobolds; the rest wait at inns; catch-up levels | yes (roster) → save version 3 with a migration |
| Level sync in co-op | helpers' parties computed at the host's level for the fight | no |
| Shared boss credit + helper reward | boss counts for every player in the fight who is at that step; helpers get spark dust | yes (spark dust) |
| Async notes and gifts | notes on signs, gifts at fountains, stored on the server | server only |
| New areas | Frostpeak, Thistledown sewers, the crater, the hideout | no |
| Bigger rooms and dungeons | the hideout and sewers need multi-room places | no |

## Before going public (not needed for friends)

- **Server storage:** the world is one JSON file in memory; fine for friends. For hundreds of players, move to SQLite.
- **Moderation:** a word filter on chat and names, a report button, and an admin ban.
- **Off-site backups:** daily copies already exist on the server; add a copy somewhere else (Hetzner's backup option,
  about €1 a month).
- **Error reports:** pages send errors to the server so problems show up without anyone writing a letter.

## Known technical debt

1. The story's flags still use first-draft names (`moot`, `vote`, `seals`); harmless, documented in `dialogue.js`.
2. Old monsters (Gorb, Vexx, the hoard guards) are still in the tables and the battle tests; tidy up when the new
   monsters arrive.
3. Tests run when I run them; there is no automatic check on GitHub. Fine for now; worth adding when more people push.
4. The GitHub token is only needed for letters now; the drawing pipeline needs none (it uses Git).
