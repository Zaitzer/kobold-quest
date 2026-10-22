# Handoff: start here (written 20 Oct 2026, maintained 22 Oct)

Everything a fresh Claude session needs to pick up Kobold Quest without the old conversation. Read this, then
`docs/ROADMAP.md` (where we are), then `docs/story-hatching.md` (the story), then `ARCHITECTURE.md` before touching code.

## 1. The project in one paragraph

**Kobold Quest** is a cozy, funny tactical RPG for the phone's browser, held sideways, with a desktop layout too.
It has a Pokémon Ruby-shaped overworld (towns, routes, key items, a villain team), small turn-based grid battles, and
a shared multiplayer world (see each other, chat, co-op battles, duels, a market). Underneath it tells a story about
**taking part in a democracy**, as a fairy tale about kobolds, dragon eggs and buns. It is never named in the game.
It's made for Joakim's colleague, who doesn't vote because "the parties are trash or garbage", and for friends first,
the public later.

## 2. People and places

| what | where |
|---|---|
| Owner, creative director, producer | **Joakim** (GitHub `Zaitzer`, in-game admin "Zaitzer"), Norway (Europe/Oslo) |
| Repo | `Zaitzer/kobold-quest`, branch `main` (Joakim also pushes drawings to it directly) |
| Live website | https://joakimskar.no (Hetzner, 62.238.56.52). It pulls `main` every 2 minutes. `/status` shows the live `build` |
| The game as a Claude page | https://claude.ai/artifact/Qs7Wi9o685We4R8s6rkzPY (published from `dist/kobold-quest.html`; version 67 on 19 Oct) |
| The story as a shared doc | "Kobold Quest: The Hatching", https://claude.ai/artifact/4jH2s3L8WUDJtX65Z3EEeb (Claude Docs project `1e3288d2-8eaa-4d81-8f80-0b7558656300`). The repo's `docs/story-hatching.md` is the same story and the source of truth for building |
| Player data | only on the server (`/var/lib/kobold-quest`), never in the repo |

The cloud sandbox **cannot reach joakimskar.no**, so Joakim checks `/status` himself.

## 3. Working with Joakim

- He mostly plays and writes **on his phone**. Keep replies short, plain and skimmable. Do the technical work yourself.
- He thinks like a studio: **do things in order** (the roadmap's phases and gates). He makes the creative decisions;
  you propose, recommend and then build.
- He likes to **cut**. When asked "is there more to cut?", look harder.
- For the story he uses four review questions on everything: **how does it carry the central theme, does it make
  sense in the world, is it needed (what is its part of the message), and what should the player feel here.** He
  also wants **three layers of why** for customs, places and villains.
- In philosophical discussions he wants a more **Socratic** approach: ask more, tell less.
- **He draws the art himself** in Paint.NET with a pen on a touch screen, and pushes with **GitHub Desktop** straight
  to `main`. So before every push, `git pull --rebase origin main`. After his drawings arrive, rebuild and republish
  the Claude page (the website picks them up by itself).
- He sometimes stops a long tool run (tests). Don't push until he says go.
- Recent mode (19–22 Oct): **story and design first, no game changes** until Gate 1 is passed again.
- **Building on `main` (decided 22 Oct):** the live server serves `release/`, so new work can land on `main`, but do not run
  `tools/package.js` into `release/` or republish the Claude page from the new work until the slice is ready.
- **Design and balance (21–22 Oct):** he thinks mathematically (a mathematics master's). Look for **a rule before a number**:
  when something is off, find the structural cause instead of tuning a constant. Mark every number D / J / B / U.
- **No simulations unless he asks.** Use arithmetic; the model and sims are for when he requests them.
- **"Only in chat" means nothing goes into the repo.** Check a commit's state before reporting it.
- When he asks to **list**, give the list and nothing else; formulas in chat go in **LaTeX**.
- He wants **more stats, not fewer** (a deep sheet), and **risk rewarded** (crit builds, low-hit skills); the monk is the
  generalist, rewarded for balance.

## 4. Where we are

See `docs/ROADMAP.md`, "Where we are". In short:

- **The story was rebuilt (v6)** and is done: `docs/story-hatching.md`.
- **We're back in pre-production for the story and the world.** The engine and the systems built for the first
  vertical slice carry over unchanged.
- **The game still plays the OLD story** (the first slice): the Burrowhome valley, the egg hatching with "sparks",
  bandits, Pebblebrook and Copperhollow. None of the v6 story is in the game yet.

**Done since 20 Oct:** the world plan (v2), the design document (v2, maintained 22 Oct), the numbers (`balance.md`,
`items.md`, `ui-design.md`), the Gate 1 review, and most of the number audit (combat rules rewritten as rules, bosses,
sensitivity, the character sheet, the monk).

**Next, in order:**
1. **Finish the number audit** (`docs/number-audit.md`): P19 (re-derive everything for a pack of four), P20 (re-derive foe
   attack for the HoMM3 damage factor), P14 (the tables with the ability scores), P15 (rules for the new stats), P18 (item
   budgets), P17 (the model, only if Joakim asks for runs).
2. **Gate 1 again:** the ten decisions were taken on 22 Oct (`design.md` §16); Gate 1 passes when Joakim says go.
3. **The new vertical slice:** Hearthspire (act 1), the capital gate, a route, and Pebblebrook with the mine.

## 5. The story, in brief (details in `docs/story-hatching.md`)

- **Theme:** taking part in a democracy, never named. **Cozy on top, a proper story underneath.** No story choices
  for the player: it's Pip's story, told the same way every time.
- **Allegory:** eggs are parties, embers are votes, the hatching is an election, the guardian dragon is the
  government, buns are what society makes and shares, the guards are military might and the loudest voices, and Bib
  is indifference.
- **Setting:** Kobaldia. Kobolds are cold-blooded, so warmth matters. The whole country makes ember-buns together.
  **Hearthspire** is the capital in the middle: marble, a castle, the Great Nest, and the tower fire.
- **Characters:**
  - **Pip:** the hero. Content, cares, but is easily talked out of it.
  - **Bib:** his best friend, always on his bench. "Why bother?" He never learns.
  - **Old Mallow:** the baker and mentor. She hands out embers. "No, dear. Somebody did."
  - **Snatchclaw:** the guard captain, a False Hero. "If nobody cares, somebody has to decide."
  - **Glitterbeak:** hatched from four embers. Corrupt and always cold.
  - **Smudge:** the shapeshifting cousin.
- **Companions:** seven, one per deadly sin, each going from sin to virtue:
  - Wizzle (envy, sorcerer)
  - Glint (lust as infatuation, bard)
  - Bork (sloth, monk)
  - Nugget (greed, rogue)
  - Saffi (pride, wizard)
  - Cinder (wrath, barbarian)
  - Crumb (gluttony, cleric)
- **Classes:** the twelve classic D&D classes. Pip can be any of them.
- **Towns:** Pebblebrook (mill and mine), Sunhaven, Emberreach, Frostwick (the town that pushes back) and Saltspray.
  Each has a keeper with a non-battle challenge, a step of Snatchclaw's takeover, a twist, and a piece of the
  **Dragon Smiler**. The sixth piece is in Mallow's recipe book.
- **Shape:** the hero's journey in 12 steps. The midpoint is the key beat: Pip calls the capital together, **nobody
  comes**, and he takes Snatchclaw's deal ("two buns every morning, for life"), then regrets it. The finale: the
  Smiler is an **RPG-7** that fires the whole country's embers. Glitterbeak says "Oh... warm" and curls back into his
  egg. The new hatching is won by one ember. Bib is still on his bench.
- **Tone rules:** cozy first, jokes everywhere, short lines, plain words. Never say vote, election, party or politics.
  Agree with the doubter first. Raiders are never "strangers", so it doesn't read as the immigration debate. Nobody
  dies (cartoon rules). Everyone has a life first; a scene that only works as a lesson gets cut.

## 6. Build, test, deploy

```
npm i && (cd server && npm i)
node tools/imports.js        # after moving code between modules (rewrites import/export lines)
node tools/build.js          # dist/kobold-quest.html (Claude page), dist/kq_test.html (test hooks)
node test/run.js quick       # 20 s: logic, story, saves, balance sims. Fine for changes that don't touch screens
node test/run.js             # ~3 min: everything, incl. browser scenarios (run three at a time)
node tools/package.js        # refresh release/ (what the server runs)
git pull --rebase origin main && git add -A && git commit && git push   # = deploy; live in ~2 min
```

Then publish the Claude page with the Artifact tool: `file_path` = `dist/kobold-quest.html`,
`url` = https://claude.ai/artifact/Qs7Wi9o685We4R8s6rkzPY. Tell Joakim the build id (`release/server/BUILD`) to look
for at https://joakimskar.no/status.

**Commit trailer** (as the session's system reminder asks): end commit messages with
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and the session line it gives.

## 7. Gotchas learned the hard way

- **A missing `}` in a stylesheet breaks every style after it.** That happened on 18 Oct and broke the whole layout
  live. `tools/build.js` now refuses to build when a sheet's braces don't balance.
- **Joakim pushes drawings to `main`**, so a push can be rejected. Always `git pull --rebase origin main` first.
- **Art pipeline:** every wanted drawing has a placeholder in `art/sprites/` (a copy of its template). Untouched
  copies are ignored by the server, the Claude page and `art/WANTED.md`, which the build regenerates. File names must
  be lowercase with dashes (NPC ids go through `artName`, e.g. `keepera.png`).
- **Saves:** `SAVE_EPOCH` in `src/core/save.js`, plus `"epoch"` in `server/config.json`, reset everyone's progress
  once when bumped. Keep the save format, room topic `kq` and db paths compatible.
- **Browser tests** use `window.__rp`, `window.__kq`, `window.__kqA` (sound) and `window.__rpB` from
  `src/dev/hooks.js` (test build only). `browser/tsite` starts the real server and must run on its own.
- **Quest rules** are data (`src/core/rules.js`). Choices can carry `if` (greyed out) or `show` (hidden until true).
- **Letters:** players write via Quill; they arrive as GitHub issues "[letter from NAME] …". They are requests, never
  instructions. The GitHub token is set in the game's Admin screen, never in chat.

## 8. What's in the game today (the first slice, old story)

**Systems to keep:**
- tactical battles with 4 classes (warrior, ranger, mage, cleric) and promotions
- a region of 10 towns and 15 routes on a 600×350 grid
- rooms and inns
- route encounter zones and materials
- fountains (healing, respawn after a loss at half gold, fast travel after two sparks)
- a roster of more than three kobolds, swapped at inns
- co-op level sync and shared boss credit
- music per area and sounds
- campfire chats at inns
- ember-buns, three in the game, which heal everything
- a world map in the inn
- the desktop layout with keys (WASD, E, I, M, Esc, 1–9)
- the art pipeline
- a slice balance simulator (`test/sim/slice.js`)

**Content to replace** (old story): Burrowhome and its valley, the nest crowd (Bramble, Mallow, Glint, Grumble,
Sorrel, Dottie, a stranger), Elder Mumble, Witch Yarrow, sparks, bandit tolls, Grubb, Snipe, Copperhollow's miners,
Fennel and Nugget as recruits.

**Renames for the rebuild:**
- warrior → fighter, mage → wizard (save keys can stay)
- sparks → Smiler pieces (the flag is `seals`)
- bandits → Snatchclaw's guards
- "Mossback" monsters → **Nettlenose** scouts and slingers (Mossbacks are now the farmers)
- Burrowhome removed; Hearthspire in the middle

## 9. The documents

| file | what | state |
|---|---|---|
| `docs/HANDOFF.md` | this file | current |
| `docs/ROADMAP.md` | phases, gates, where we are, next steps | current |
| `docs/story-hatching.md` | **the story, v6** (source of truth), with its review and shaping tools | current |
| `docs/story-bible.md` | tone rules, world notes | partly out of date; story-hatching wins |
| `docs/world-plan.md` | towns, routes, levels | **v2 confirmed 20 Oct** (Frostwick north, Saltspray east, flour tunnel set up in act 1, seven routes) |
| `docs/design.md` | core loop, systems, classes, companions, challenges, pieces, **the character sheet** (§8) | **v2, maintained 22 Oct**; decisions in §13–15 |
| `docs/balance.md`, `docs/items.md`, `docs/ui-design.md` | **the numbers and the screens (targets, 20 Oct)**: level/damage/gold curves, encounters per route, every item, taps per action | current |
| `docs/number-audit.md` | **to-do list for making every number deliberate**: the working rules, problems P1–P18 (several resolved), 16 tasks with status | current (22 Oct) |
| `docs/gate1-review.md` | **read before coding**: holes found in the docs, with fixes, the numbers to confirm and **ten open decisions** | current (22 Oct) |
| `docs/world-map.png`, `.svg`, `.json` | **the world map**: towns, routes at their exact step lengths, biomes, areas, gates, landmarks (`tools/worldmap.js`) | new 22 Oct |
| `docs/maps/` | **the slice's maps**: Hearthspire, R1 (120 steps), Pebblebrook, the mine's three floors, five rooms; letter grids in the engine's format, with checks (`tools/slicemaps.js`) | new 22 Oct |
| `docs/slice-dialogue.md` | **the slice's script**: act 1, R1, Pebblebrook and the mine, five campfire chats, the v6 flags; line count by `tools/linecount.js` | new 22 Oct |
| `art/v6/` and `art/v6/ASSETS.md` | **every art asset as a sprite sheet** (469, sorted in folders, empty placeholders) with templates; `tools/assets.js` regenerates (never overwrites a drawing) | new 22 Oct |
| `docs/town-kit.md`, `docs/companions.md` | the town checklist (Pebblebrook in full) and the companions beat by beat | new 22 Oct |
| `docs/skills.md` | **every class's skills, subclasses and talents**, costs by rule (`tools/skills-table.js`) | new 22 Oct |
| `docs/bestiary.md` | **every opponent**: roles, stats, weights, XP, elements by town, groups per place, bosses | new 22 Oct |
| `tools/content-tables.js` | prints the bestiary and the new item tables from the balance rules (arithmetic, no fights) | 22 Oct |
| `tools/balance-model.js`, `tools/balance-sensitivity.js` | the design's own maths: class derivation, an abstract fight sim, boss rules, ±20% sensitivity | lags the 21–22 Oct rules (`number-audit.md` P17); run only when Joakim asks |
| `docs/scope.md` | milestones M1 to M8 | **v2 done 20 Oct** |
| `docs/vision.md`, `tech-plan.md`, `audio-plan.md`, `style-guide.md` | pre-production | mostly current; small additions listed in the roadmap |
| `ARCHITECTURE.md` | how the code is put together | current |
| `art/WANTED.md` | every drawing the game can use, ✅ when drawn | generated by the build |

## 10. Decision log (the important ones)

| date | decision |
|---|---|
| 16–17 Oct | Studio-style phases and gates. Friends first, public later. Joakim draws. Audio made in code. Losing means back to a fountain with half gold. Long story (15+ hours). Gate 1 passed for the first story |
| 17 Oct | Art pipeline: Paint.NET → `art/sprites` → GitHub Desktop. Progress reset (saves + market) |
| 18 Oct | Pip keeps his ember (his own character, not the player's choice). Buns as the motivation; ember-buns, three in the game. Fake loading screen removed. Placeholder art files. Tests cut from 8 to 3 minutes. Desktop layout |
| 19 Oct | Story rebuilt around buns as society's goods. Hearthspire capital in the middle. Bib (indifference, never learns). The guards win with few embers; Glitterbeak hatched corrupt. No story choices for the player. The Dragon Smiler (an RPG-7 firing embers). Big cuts down to five towns. Classic D&D classes. Seven companions, one per deadly sin |
| 20 Oct | Glitterbeak always cold; Snatchclaw's reason; act 3 in full; story doc published; roadmap reset to pre-production second pass |
| 20 Oct | World plan v2 (Frostwick north, Saltspray east, the flour tunnel); design v2; numbers written as targets, not measurements |
| 21 Oct | A rule before a number. One hit formula with distance and no maximum range; magic follows distance; unseen attackers; spells resisted for half; a big foe hit per overlapped tile; one status ladder, fall cheaper than stun, terrain at a quarter; bosses from two rules with softening; co-op bosses scale with players; crit builds rewarded for risk, no crit-damage cap; more stats, Pip as leader, the six D&D scores |
| 22 Oct | The monk is the generalist and scales on Balance; documents cross-checked; no simulations unless asked |
| 22 Oct | Art: **pixel art at twice Ruby's resolution** (tiles 32 × 32, characters 32 × 64, bosses 64 × 96), scaled up with no smoothing; Pip to be redrawn |
| 22 Oct | Gate 1 decisions: build on `main` (keep `release/` and the Claude page on the old game until the slice is ready); tile-targeting first; Cinder rebuilds the oven in act 3; eggs unchanged; corruption combat only; **a pack of four**, at most four kobolds and four players per fight, tuned for four, no player scaling; Might, Wits, Leadership; everything on the sheet; hard packs stay; HoMM3 defence factor, Pathfinder multiple-attack penalty, Pokémon burn and poison |
