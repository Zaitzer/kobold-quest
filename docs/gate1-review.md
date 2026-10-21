# Gate 1 review: what to check before we write code (20 Oct 2026)

*A game designer's pass over the story (v6), the world plan (v2) and the design document (v2), checked against the repo.
Each finding has a fix. **Fixed** means it is already in the docs; **Decide** needs Joakim at Gate 1.*

## A. Fix before the slice starts

| # | finding | why it matters | fix | status |
|---|---|---|---|---|
| A1 | **Building the new world on `main` can break the live game.** The website pulls `main` every 2 minutes and Joakim's drawings also land on `main`. | friends are playing the old story right now; a half-built Hearthspire must not reach them | build the rebuild on a branch (`v6`); `main` stays the live old game and keeps receiving drawings; merge `main` into `v6` often; `package.js` and `release/` only change at the merge | **Fixed** (process); Joakim to confirm |
| A2 | **Progress reset.** `SAVE_EPOCH` is 1 and old saves point at Burrowhome, sparks and a map that no longer exists. | an old save loaded into the new world is garbage | bump `SAVE_EPOCH` and `epoch` in `server/config.json` to 2 at the merge; tell friends a day ahead; the market and cloud saves clear with it | **Fixed** (process) |
| A3 | **The shared world breaks the story's empty square.** Beat 7 needs "nobody comes", but real players will be standing in Hearthspire. | the most important beat of the game would be contradicted by a friend walking past | **phasing**: while a player is in the story scenes of Hearthspire (the empty square, the Ordeal), other players are hidden from them; in the finale the opposite: online players are shown in the crowd as extra kobolds. Cheap: a render filter on a story flag | **Fixed** (design §10) |
| A4 | **The word "party" has two meanings.** The tone rule bans "party" (it reads as politics), but the game calls the group of heroes the party (158 hits in `src`, most internal). | a political word in every battle menu | player-facing word becomes **pack** (kobolds, a pack); `party` stays as the internal and save key. One text sweep before the slice | **Fixed** (design §5); sweep still to do |
| A5 | **Cinder's and the oven's timeline contradict each other.** Cinder is thrown out at the Ordeal and must "fix Mallow's oven slowly", but the oven can only be finished with Nugget's nugget, which is in Glitterbeak's hoard (the finale). | two arcs fight over one oven, and Cinder has no scene in act 3 | Cinder returns through the **flour tunnel** in act 3 and rebuilds the oven's frame bit by bit (visits to the bakery cellar between towns); Nugget's copper is the last piece, put in after the finale. He holds the Smiler at the castle because that is the patience he practised | **Fixed** (below, "Who is where"); story file to be updated by Joakim's word |
| A6 | **What does the player do in beats 7–9 and the march?** The story has no player choices, so the Ordeal is a loss the player can't refuse. | a forced loss with no play is a cutscene wall; a "refuse" button breaks the story | see "Beats as play" below. No refuse button: the player does the work (knocks on every door), it fails, the deal is a fixed scene, a short idle stretch on the bench, then the oven breaks | **Fixed** (below) |
| A7 | **Tile-targeted skills don't exist.** Every skill today targets a foe, all foes, an ally, allies or a fallen friend (`classes.js`). Rogue (trap), druid (plant cover) and ranger (mark) need a new targeting mode, plus phone touch UI for it. | the rogue is in wave 1 and is Nugget's class | build **one tile-targeting mode** first, as a spike, before the new classes; reuse it for trap, cover and mark | **Decide** (order of work) |
| A8 | **The simulators only know four classes.** `test/sim/slice.js` hard-codes the weapon ladder per class and a `'warrior'` check. | 12 classes with no balance tool means guesses | generalise the sim to read classes from data before wave 1 | open |

## B. Fix before phase 3 (the rest of the game)

| # | finding | fix |
|---|---|---|
| B1 | **Art is the real bottleneck.** 72 drawings are wanted for the *old* cast and 2 are done. The new cast (seven companions, Mallow, Bib, Snatchclaw, Smudge, guards, Nettlenose, five keepers, five or six bosses, new foes, a marble city and four new biomes) is the same order of size, roughly 80 to 110 (my estimate). Code-drawn fallbacks keep the game playable, but the vision says the look comes from his drawings. | an **art priority list** for the slice only (ten or so: Mallow, Bib, Bork, Wizzle, Glint, a guard, a Nettlenose, Glitterbeak, marble tiles); everything else stays code-drawn until phase 3. Regenerate `art/WANTED.md` for the new cast when the slice starts |
| B2 | **A town has to fill two to three hours.** Five towns and a challenge each is far less than the old ten. Without a plan, "depth not padding" turns into either padding or a thin game. | write a **town kit** (a checklist every town must fill: challenge, twist, boss, companion beat, three side quests, two chests, a landmark, a joke, a campfire chat, a shop update). Pebblebrook in the slice is the template |
| B3 | **The march home is the emotional peak and has no gameplay.** | make it a walk: a **line of followers** (each town's kobolds join the trail behind Pip like a Pokémon follower chain) along R6 into Hearthspire, with the road guards stepping aside and Glitterbeak wheeling overhead. Almost free: sprites following in a line |
| B4 | **The message may miss the colleague.** The story answers "why bother?" (indifference) well. His colleague's reason is different: "the parties are trash". The nest scene shows three fine eggs, so "all the options are bad" isn't answered. | make the eggs visibly imperfect: the sprouty egg is pushy ("work never hurt a kobold"), the sleepy one is stuck, the shiny one is a ribbon. At the end Pip **warms the sprouty egg anyway**, and Mallow's line: "No egg is perfect, dear. You warm the one you can live with, and it grows into what you give it." This is the story's own rule (temperament sets the kind, warmth sets the heart), just said out loud once |
| B5 | **Dialogue volume.** Fifteen hours of lines for a cast of about 40, plus campfire chats, banter and letters. | set a **line budget** per town (e.g. 150 to 250 lines) and write with the four review questions, short lines, jokes everywhere |
| B6 | **XP pacing** from level 1 to 30 over five towns and seven routes, with subclass at 8 (the code already uses 8). | extend the slice simulator to the whole path as each part lands, and put a target level at each story beat in the world plan (already roughly there) |
| B7 | **Public release risks (not for friends).** The finale calls the Smiler an RPG-7, a real weapon; the docs call the classes "D&D". | for friends, keep the joke. Before going public: never say "D&D" in any player-facing text or page; decide whether the Smiler is drawn as a recognisable RPG-7 or a generic shoulder tube |

## C. Small contradictions and clarifications (all fixed in the docs)

- **The bun at the gate** ("the guards take a bun from everyone going out") is flavour only: the gate costs nothing.
  There are three ember-buns in the whole game.
- **Why the toll on R4** matters: you can walk R4 from Hearthspire to Emberreach and skip the loop, so the toll (until
  three pieces) holds the loop in order. It is not a barrier on the way back.
- **Pip's class is picked at the start** from the eight wave-1 cards; the other companions' classes are fixed.
- **Subclass level is 8**, the same as the code (the old design doc said 10).
- **Scope** (`scope.md`) was still the old ten-town plan; rewritten.

## Who is where (the roster over the story)

| story point | in the pack's reach | note |
|---|---|---|
| Act 1, Hearthspire | Pip, Wizzle, Glint, Bork (at the gate) | Pip plus two |
| Pebblebrook | + Nugget | |
| Sunhaven | + Saffi | |
| Emberreach | + Cinder | Cinder is the fifth companion; Wizzle, Glint, Bork, Nugget, Saffi are already there |
| Ordeal (Hearthspire) | Wizzle goes alone and is caught; Cinder is thrown out; Pip is alone with Bib | the pack is empty on purpose |
| Reward | Pip goes after Wizzle; Glint, Bork, Nugget, Saffi are still around | |
| Frostwick | Wizzle rescued; Bork's quest | |
| Between towns, act 3 | Cinder is found in the bakery cellar rebuilding the oven frame | the flour tunnel is the way in and out |
| Saltspray | + Crumb | |
| The march and the castle | everyone, in the line | the player picks three for the fight; Cinder holds the Smiler |
| After the finale | Nugget's copper nugget completes the oven | the feast |

## Beats as play (no story choices, but there is always something to do)

- **Beat 7, the empty square.** Pip rings the bell, then the player walks the capital knocking on doors. Each door has
  a reason ("later", "buns are fine", "busy"). It cannot be won. The square stays empty.
- **Beat 8, the Ordeal.** The deal is a fixed scene with no refuse button. After it comes a **short idle stretch**
  (about two minutes at most): the bench with Bib, free buns, a calm town, an empty quest log. Then the oven breaks
  and the pack's absence is felt.
- **Beat 9, the Reward.** A quiet walk: Pip gives the buns to Mallow, gets her last two, and the ember glows.
- **Beat 10, the march.** The follower line (B3).
- **Beat 11, the Smiler.** The finale loading is a shared moment: every online player in the room can load an ember,
  and the fight counts for everyone ready (the existing shared-boss rule).

## Numbers to confirm (added when `balance.md`, `items.md` and `ui-design.md` were written)

These are choices in the numbers that change how the game feels. I made them; Joakim can overrule any of them.

| choice | what I set | the alternative |
|---|---|---|
| fights | about 142 normal fights and 11 bosses in the story, one normal fight every 6.5 minutes | fewer, longer fights; or more, shorter |
| level pace | a level every 10 to 40 minutes, slower late | faster late levels (fewer fights per level) |
| encounter rate | 3.0–3.5% a step on routes, 6% in dungeons, safe first and last 10 steps | rarer, with visible foes only |
| town areas | one small dungeon per town (new) | no dungeons, more patrols |
| potions | heal a percentage of max HP; about a quarter of income | fixed amounts |
| gold | shops cover 70–85% of the next tier; half is lost on a defeat | richer or poorer |
| mana | casters about six casts a fight; mana restored 10% per win | free mana between fights |
| classes | the power-budget split per class (`balance.md` §3) | other splits |
| hit chances | one formula (100% + accuracy − dodge − cover − distance, 0–100%, no maximum range, only line of sight; melee averages 90, ranged 66), spells never miss but 10% are resisted for half damage, no accuracy by level, a mercy bonus after two misses, bosses' big attacks do not roll (`balance.md` §4a) | spells that can miss; level-based accuracy; no mercy rule |
| UI | three taps for anything frequent; a quick-skill button | a bigger menu |

## What is still not decided (Joakim at Gate 1)

1. **A1:** build on a `v6` branch while `main` stays the old live game. (Recommended.)
2. **A7:** build tile-targeting first, as a spike, before the new classes.
3. **A5:** Cinder rebuilds the oven in act 3 (a visit to the bakery cellar between towns), Nugget's copper finishes it.
4. **B4:** the sprouty egg is imperfect and Pip warms it anyway. (Touches the story file.)
