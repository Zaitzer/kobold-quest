# Kobaldia: tech plan (draft, maintained 22 Oct 2026)

*Step 1.7 of the roadmap. What the code must handle to carry the design, and what has to change before we build it.*

## Targets and budgets

| what | budget |
|---|---|
| Devices | phones held sideways (Chrome, Safari), desktop browsers |
| Frame rate | 60 fps on a mid-range phone; never below 30 |
| Download | the page under 3 MB with all drawings; the website loads drawings separately, so first load stays small |
| Start | playable within 3 seconds on a phone |
| Saves | under 64 KB per player |
| Players online together | 50 for the friends version, a few hundred later |

## What stays as it is

- **One output:** the website with its game server (the Claude page was dropped, 23 Oct). Room topic `kq` and the db paths stay.
- **Modules and the feature registry** (`ARCHITECTURE.md`), **quest rules as data**, **the world as a plan** (`REGION`).
- **Deploys:** push to `main`, the server pulls within 2 minutes; pages on an older build reload themselves.
- **Tests:** logic tests in Node, browser tests on phone sizes, battle simulators. Every new system gets tests.

## Pipelines

| content | where it lives | how it gets in |
|---|---|---|
| Drawings | `art/sprites/*.png` | Joakim saves from Paint.NET and pushes; live in ~2 minutes (built) |
| Music and sounds | `src/engine/music.js`, `src/engine/audio.js` | made in code (decided: no recordings) |
| Dialogue and quests | `src/data/dialogue.js` (rules) | written by me; checked by the story test |
| World | `REGION` in `src/data/overworld.js`, towns by theme, rooms in `places.js` | edited as data; overworld test checks every route, door and sign |
| Monsters, items, balance | `src/data/*.js` | data tables; simulators check balance |

## New systems the design needs

| system | notes | save change |
|---|---|---|
| Encounter tables per route | each route kind gets its own monsters and material; levels by distance | no |
| Respawn at fountains | losing a fight: back to the last fountain drunk from, half gold | yes (last fountain) |
| Fast travel | warp between fountains you've drunk from, after the second Smiler piece | yes (fountains visited) |
| Roster | Pip and the seven companions; those not in the pack wait at inns; catch-up levels | yes (roster) → save version 3 with a migration |
| Level sync in co-op | helpers' packs computed at the host's level for the fight | no |
| Shared boss credit + helper reward | boss counts for every player in the fight who is at that step; helpers get a cosmetic reward (bun crumbs) | yes (crumbs) |
| Async notes and gifts | notes on signs, gifts at fountains, stored on the server | server only |
| New areas | Hearthspire and the castle; one area per town (the mine, the honey cellars, the crater, the ice cellars, the shipwreck and the island cave); the flour tunnel (`world-plan.md`) | no |
| Bigger rooms and dungeons | the town areas and the castle need multi-room places | no |
| Music layers and a fixed tune | a town's drums switch on with a flag (`audio-plan.md` rule 5); a track may carry a `tune` (fixed scale degrees) instead of a seeded lead, for Mallow's rhyme; Hearthspire's four versions share one seed | no |
| Slice maps and script as data | the maps, rooms, people, chests and scenes in `world/` (the map editor); the script's flags (`slice-dialogue.md` §7) | at the progress reset |
| Characters (MMO-style) | six slots per account at `data/users/<id>/chars/<slot>` plus `account`; the select screen; a per-character lock renewed every 30 s; the `{hero}` name in dialogue; guests on the device; the old save moved to `legacy`; admin restore within 7 days (`systems.md` §16) | yes: new paths, at the progress reset |
| Admin tools | the Admin screen's seven tabs; roles (owner from `config.json`, moderators in the server's data); every tool a server-side admin op that writes the admin log; report button, chat log kept 24 h, error reports (`systems.md` §17) | server only |

## Engine work the 21–22 Oct rules need (`balance.md`, `design.md` §3 and §8)

| system | what it needs | save change |
|---|---|---|
| The character sheet | the six ability scores, special attack and defence, initiative, threat, armour piercing, morale, luck, fame, corruption; Pip's leader stats; the monk's Balance | yes (scores, morale, corruption, fame) |
| One hit formula | accuracy, dodge, cover, distance with weapon steadiness, line of sight; no maximum range; 0–100% | no |
| Visibility | who can see whom (tall grass, darkness, fog, sight range), for the unseen rule | no |
| Resisted spells | spells roll against resistance (half damage on a resist), distance raises it | no |
| Tile-targeting and big foes | target a tile (trap, cover, mark); an area attack hits a 2 × 2 foe once per overlapped tile | no |
| Statuses and terrain | fall (prone), slow, root, weaken, hex, stun, confuse; ice and mud tiles that apply them on entry | no |
| Crits | no cap on crit damage; items that trade normal damage for crit damage | no |
| Bosses | four attacks a round (one per kobold), a telegraphed area every third round, phase lines (proposed), softening after each defeat | yes (defeats per boss) |
| Damage | HoMM3's attack-versus-defence factor; Pathfinder's multiple-attack penalty; burn and poison (damage over time) | no |
| Monk | Balance, ki, any weapon, element choice, Adapt (swap a skill mid-fight), buildable cover | no |
| Packs and co-op | a pack of four; at most four kobolds and four players in a fight, sharing the places; all players act in one phase with a short timer; revive by another player; personal loot | yes (pack of four) |

## Pixel art at twice Ruby's resolution (decided 22 Oct, for the slice)

| change | where |
|---|---|
| new templates: `tile-32`, `character-32x64` (feet on row 60), `boss-64x96`, `house-128x96`, `portrait-64` | `art/templates`, `tools/artlist.js` |
| draw sprites with `imageSmoothingEnabled = false` and scale by whole numbers where the layout allows | `src/engine/sprites.js`, the map and battle renderers |
| the feet line and the sprite unit read from the template size instead of 112/128 and 76/128 | `src/engine/sprites.js` (`feetOf`, `SPRITE_UNIT`) |
| Pip's existing 128 × 128 drawing is retired at the merge (redrawn at 32 × 64) | `art/sprites/pip.png` |
| the loader reads **sprite sheets from `art/`** (sheet types and frame sizes in `art/ASSETS.md`, written by `tools/assets.js`); the stand-ins show until drawn over; walk cycles (3 frames, 3 directions), battle idle, attack, cast, hurt, down and cheer | `src/engine/sprites.js`, `server/art.js`, `tools/build.js` |

## The rename list (story v6, for the progress reset)

*Found by searching `src/` and `server/` on 22 Oct. Display names change; **save keys stay** where a save holds them, so old
saves still load (the class ids `warrior` and `mage` are kept inside, shown as fighter and wizard). Everything else is renamed
or removed in one pass, at the progress reset, then `node tools/imports.js` and the story test.*

| old | new | kind | files |
|---|---|---|---|
| warrior | **fighter** (shown) | class; save key kept | `data/classes.js`, `game/stats.js`, `core/state.js`, `net/lobby.js`, `data/dialogue.js` |
| mage | **wizard** (shown) | class; save key kept | `data/classes.js`, `game/stats.js`, `data/items.js`, `data/dialogue.js` |
| level-8 promotions | **subclasses** | class rule | `data/classes.js` |
| sparks | **Smiler pieces** (shown); the save flag `seals` is kept (`design.md` §7) | quest item | `data/dialogue.js`, `data/quests.js`, `game/npcs.js`, `game/jingles.js`, `battle/flow.js`, `engine/audio.js`, `core/state.js` |
| bandits | **the guards** (Snatchclaw's) | foes and lines | `data/monsters.js`, `data/quests.js`, `data/dialogue.js` |
| Mossback (monsters) | **Nettlenose** scouts | foes and gear names | `data/monsters.js`, `data/gear.js` (Mossback stays as the farmers' name) |
| Burrowhome | **Hearthspire** | the start town | `data/overworld.js`, `data/dialogue.js`, `game/world.js`, `game/play.js`, `game/npcs.js`, `ui/worldmap.js`, `engine/music.js`, `battle/flow.js` |
| Copperhollow | folded into **Pebblebrook** (the mine) | town | `data/overworld.js`, `data/quests.js`, `data/dialogue.js`, `game/world.js` |
| Thistledown, Mossmere, Glimmerfen, Brindlecove | route stops or post-game | towns | `data/overworld.js` (and Thistledown in `quests.js`, `dialogue.js`) |
| Elder Mumble | removed (Mallow hands out the embers) | person | `data/dialogue.js`, `data/quests.js`, `data/places.js`, `game/play.js` |
| Witch Yarrow | removed (Mallow is the mentor) | person | `data/dialogue.js`, `data/quests.js`, `data/places.js`, `data/world.js` |
| Tikka, Fennel | removed (the roster is Pip and the seven) | people | `data/dialogue.js`, `data/quests.js`, `data/banter.js` |
| `moot`, `vote`, `pb`, `ch` | **`act`, `pb`, `grubb`, `miner_*`** | story flags | as `docs/slice-dialogue.md` §7; `core/state.js`, `data/world.js`, `render/map.js`, `game/npcs.js` |
| Gorb, Vexx, the hoard guards | Grubb, Snipe, the bestiary's bosses | old bosses | `data/monsters.js`, `data/items.js`, `game/gear.js`, `battle/rules.js`, `battle/flow.js`, `battle/ai.js`, `core/state.js` |
| the banter (5 old chats) | the companions' chats | campfire chats | `data/banter.js` (`companions.md`) |

## Before going public (not needed for friends)

- **Server storage:** the world is one JSON file in memory; fine for friends. For hundreds of players, move to SQLite.
- **Moderation:** a word filter on chat and names, a report button, and an admin ban.
- **Off-site backups:** daily copies already exist on the server; add a copy somewhere else (Hetzner's backup option,
  about €1 a month).
- **Error reports:** pages send errors to the server so problems show up without anyone writing a letter.

## Known technical debt

1. The story's flags still use first-draft names (`moot`, `vote`, `seals`); harmless, documented in `dialogue.js`. They go in the rename pass above.
2. Old monsters (Gorb, Vexx, the hoard guards) are still in the tables and the battle tests; tidy up when the new
   monsters arrive.
3. Tests run when I run them; there is no automatic check on GitHub. Fine for now; worth adding when more people push.
4. The GitHub token is only needed for letters now; the drawing pipeline needs none (it uses Git).
