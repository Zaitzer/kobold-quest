# Kobold Quest: the build plan for the vertical slice (22 Oct 2026)

*Roadmap phase 2. How the design (`design.md`, `systems.md` and the documents they point to) becomes the slice: Hearthspire's act 1,
the capital gate, R1, Pebblebrook and its mine. Starts when Joakim says go at Gate 1; ends at Gate 2 (Joakim and friends play the slice
and say it is fun).*

## 0. How we build

- **On `main`.** There are no active players (Joakim, 22 Oct), so the live server and the Claude page may be updated whenever a
  checkpoint is worth showing; until then `release/` stays on the old game, simply because it is the last thing that works.
- **The design leads.** When the build shows the design is wrong or silent, the fix goes into the design document first, in writing,
  then into the code. Nothing is decided only in code.
- **Content is generated, not typed twice.** The tools that print the design's tables (`skills-table.js`, `content-tables.js`,
  `corruption-table.js`, `slicemaps.js`, `balance-model.js`) also write the game's data files, so the documents and the game cannot drift.
- **Every step ends green:** `node test/run.js` passes (quick for logic-only steps), `node tools/imports.js` after moving code, then a
  commit and a push (`git pull --rebase` first). The old game's tests are replaced step by step by v6 tests, never just deleted.
- **Checks are counts.** Each step has a *done when* that a test can check: the rules check equals the model, a generated board meets
  its goals, every map mark is reachable, a scripted playthrough reaches the end.
- **Playable checkpoints.** Joakim can try the work at four points (§2), on a test build, before Gate 2.

## 1. The steps, in order

Each step lists what it builds, where, the design it follows, and when it is done.

### Foundations

| # | step | builds | follows | done when |
|---|---|---|---|---|
| 1 ✅ | **Data pipeline** (done 22 Oct: `tools/gen-data.js`, `src/data/v6/`, `test/logic/v6data.test.js`) | the tools write `src/data/v6/*.js`: classes and kits (12 classes, wave 1 playable), dark versions, items (families, slots, variants, affixes, sets, uniques, consumables, recipes), the bestiary (roles × levels × g(L)), encounter mixes, the slice's maps and rooms, the script's dialogue rules | the tools above | the generated files load; a test compares a sample of each against the document's table |
| 2 | **The rename pass** | warrior → fighter, mage → wizard (save keys kept), sparks → Smiler pieces (`seals` kept), bandits → guards, Mossback foes → Nettlenose, the old cast and towns removed; the old story's tests replaced by stubs | `tech-plan.md`, the rename list | no old names in player-facing text (a test greps); the game boots |
| 3 | **The save, v6** | the v6 save's fields, `SAVE_EPOCH` bumped, the migration's legacy copy | `systems.md` §11, §16 | a new game saves and loads every field; an old save becomes a legacy hero |

### The fight (the core, built and tested before any map)

| # | step | builds | follows | done when |
|---|---|---|---|---|
| 4 | **Tile-targeting spike** | targeting a tile (traps, cover, mark), legal-tile glow, two-tap pattern; area attacks counting a 2 × 2 foe's overlapped tiles | Gate 1 A7, `balance.md` §4 | the ranger's snare, the monk's Raise cover and the wizard's Fireball on a boss work in a test fight |
| 5 | **The rules** | the HoMM3 damage factor, the one hit formula (accuracy, dodge, cover, distance by steadiness, line of sight, unseen, unaware), the multiple-attack penalty, resisted spells, crits with builds and positional bonuses by value, luck, the status ladder with fall, burn and poison, difficult water | `balance.md` §3, §4a | a rules test reproduces every line of `node tools/balance-model.js rules` from the engine's own functions |
| 6 | **The timeline and AP** | charge-time turn order (rate 90 + initiative, act at 100, keep the remainder), the eight-turn bar, AP (moves, attacks ending turns, quick ×0.635, heavy 2), morale's AP, stun as CT − 100, Together | `systems.md` §1, `balance.md` §3 | a scripted fight's turn order matches the model's; the bar never lies (it predicts the next eight turns exactly) |
| 7 | **The character sheet** | six scores and the score-to-stat mapping, special attack and defence, threat, armour piercing, morale (bond, streak capped +3), luck, fame, corruption, Pip's leader points, the monk's Balance; the class table with the re-solved attack; four equipped skills with dark twins; talents (three cards), subclass at 8 | `balance.md` §3, `skills.md`, `corruption.md` | each class at level 1, 10 and 30 matches the model's numbers; the sheet shows every stat |
| 8 | **Foes and bosses** | bestiary stats only (runtime scaling removed), mixes by weight, the one AI rule with role habits and fleeing, bosses by the two rules (four attacks, telegraph every third turn, softening), Grubb's swing, Snipe's cart, Old Shellback's curl | `bestiary.md`, `systems.md` §3 | a foe's stats equal the bestiary's; Grubb and Snipe can be won and lost in a test fight |
| 9 | **Boards** | the generator with its themes (meadow, cave, town, dark, flooded), placement, pods, fog and sight, exits; the board goals | `systems.md` §2 | a test generates 500 boards per theme and counts: foe cover about 30%, start distance 4–5 tiles |
| 10 | **Down, losing, fleeing, recovery** | down and revive, half gold and back to the fountain, boss softening, leaving the field, 10% mana per win, campfires | `systems.md` §4, §5 | each case has a test |

**Checkpoint A, "the fight lab":** a test hero can pick any class and level and fight any slice foe or boss on any board theme.

### The world and the story

| # | step | builds | follows | done when |
|---|---|---|---|---|
| 11 | **The slice's world** | Hearthspire, R1, Pebblebrook and the mine from `slice.json`; rooms; tall-grass encounters; patrols and bounties; fountains, respawn and fast travel; stables and raptors; the flooded south road; dark tiles and light; the rail puzzle; flavour weather | `docs/maps/`, `systems.md` §6, §9 | the map checks pass in the engine (every mark reachable, R1 120 steps, 40% grass on the road) |
| 12 | **The story** | the script as dialogue rules with `{hero}`; the flags; scenes and tints; the five set-piece fights; the goal bar, hints and map pins; companions joining (level and gear rule) and the bench's floor; the five campfire chats; side quests; the corruption deeds and kind deeds; the Book | `slice-dialogue.md`, `companions.md`, `systems.md` §7, §10, §15 | a scripted playthrough from a new hero to the tube passes, on every one of the eight classes |
| 13 | **Items, shops, crafting** | chests and their contents, the two shops, the smiths, drops, cooking, buyback, town thanks, selling | `items.md`, `systems.md` §8, §15 | every chest, shop row and recipe in the documents exists in the game (a test reads both) |

**Checkpoint B, "act 1":** Hearthspire from waking up to leaving by the gate, with Wizzle, Glint and Bork.
**Checkpoint C, "Pebblebrook":** R1, the town, the mine, Grubb and Snipe, the circle and the tube.

### Players, screens, sound, art

| # | step | builds | follows | done when |
|---|---|---|---|---|
| 14 | **Accounts and characters** | six slots, the select and creation screens (name, colour), one device per hero, guests, the legacy hero, the account's shared parts | `systems.md` §16 | two devices and two heroes behave as written, in the browser tests |
| 15 | **Co-op** | the timeline with owners and the 20-second timer, revive, no scaling, phasing in the story scenes, shared boss credit | `systems.md` §12, `design.md` §10 | a two-player boss fight (the existing net mock) runs to the end |
| 16 | **Admin tools** | the eight tabs, roles, the admin log, reports, the chat log's 24 hours | `systems.md` §17 | each tool has a server test; no tool reveals a password or a private message |
| 17 | **Screens** | everything in `ui-design.md` §6–8 not already built: the timeline bar, Together, dark cards, corruption row, the Book, settings, the class pick, the challenge screen | `ui-design.md` | the tap table's counts hold in the browser tests (each row of §3 counted) |
| 18 | **Music and sound** | Hearthspire's four versions, the castle, Glitterbeak, Mallow's rhyme as a fixed tune, the layer rule, the new sounds | `audio-plan.md` | each track plays where the plan says; the drums return when the wheel turns |
| 19 | **Art** | the v6 sprite-sheet loader (32 × 64 characters, nearest-neighbour), palette swaps for the hero's colour, Joakim's drawings wherever they exist (code-drawn otherwise) | `style-guide.md`, `art/v6/ASSETS.md` | a drawn sheet shows in the game; an empty one falls back |

**Checkpoint D, "the whole slice":** everything above, played by Joakim on a test build.

### Finish

| # | step | builds | follows | done when |
|---|---|---|---|---|
| 20 | **Balance and the count** | the slice simulator for twelve classes (Gate 1 A8); the timecount check against the build's real unit times; the fight-budget check (planned ÷ needed 1.05–1.20) | `balance.md`, `tools/timecount.js` | the sim's results sit inside the documents' goals, or the design is changed in writing first |
| 21 | **QA** | a test for every system in `systems.md` §0; the browser scenarios rewritten for v6 | roadmap 2.7 | `node test/run.js` covers each row of the checklist |
| 22 | **Release to friends** | `node tools/package.js`, `release/` committed (the live server picks it up), the Claude page rebuilt and republished, `/status` checked | `CLAUDE.md` | the live build matches `release/server/BUILD`; old saves show as legacy heroes |

**Gate 2:** Joakim and friends play the slice and say it is fun.

## 2. Why this order

- **The fight first** (steps 4–10): it is the game's centre (over half the counted time), the most rule-dense part, and the easiest to
  test without maps. Every later step stands on it.
- **Data before rules** (steps 1–3): the rules are checked against generated data, so both exist before either is trusted.
- **The world before the story** (11 before 12): the script's scenes need places to stand in.
- **Accounts, co-op and admin after the single-player slice** (14–16): they wrap a game that already works; building them first would
  mean testing them against nothing.
- **Art and music late** (18–19): they never block, because code-drawn art and generated music stand in until they arrive; Joakim's
  drawings land whenever he pushes them.

## 3. Risks, and what we do about them

| risk | what we do |
|---|---|
| The engine's battle code was written for the old rules and resists the new ones | step 4 is a spike: if tile-targeting or the timeline does not fit `battle/`, we rewrite the module once, early, rather than patch it |
| The rules and the model drift apart | step 5's test runs the model's rules check against the engine on every test run |
| A step reveals a design hole | the hole is written into the design first (`systems.md` or the right document), then built; the step's *done when* is updated |
| The slice is bigger than it looks | the checkpoints are where to cut: anything not needed for a checkpoint waits for the next |
| The live game breaks | it cannot: `release/` is not rebuilt until step 22 |
