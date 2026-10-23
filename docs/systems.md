# Kobold Quest: every system, specified (22 Oct 2026)

*Part of the design document (`design.md`). Written before Gate 1 so the build never has to guess: every system the slice touches is
here, either as a rule with its numbers or as a pointer to the document that holds them. Where the engine already does something
we keep, it is written down too, so it is a decision and not an accident. **Measure this** marks the few numbers that are goals to be
checked in play; everything else is designed. Numbers come from `balance.md`, `items.md`, `bestiary.md`, `skills.md` and
`corruption.md`; where this file and those disagree, those win for numbers, this file for how the systems work.*

## 0. The checklist

| # | system | where it is specified | status |
|---|---|---|---|
| 1 | turn order: the timeline | §1 | new 22 Oct (replaces I + d6 and the co-op phase) |
| 2 | the battle board: size, terrain, cover, starts, fog, sight | §2 | written down (engine) + goals |
| 3 | foes: stats, groups, AI, no runtime scaling | §3, `bestiary.md` | written down + changes |
| 4 | hit, damage, crits, statuses, terrain | `balance.md` §3, §4a | designed |
| 5 | AP economy, skills, quick weapons | `balance.md` §3, `skills.md`, `items.md` §2 | designed |
| 6 | down, losing, fleeing, retries | §4 | written down (engine) + rules |
| 7 | recovery between fights | §5 | designed |
| 8 | overworld: encounters, patrols, bounties, barriers, time of day | §6 | designed |
| 9 | travel: fountains, fast travel, raptors | §6 | designed |
| 10 | the pack: joining, bench XP, talents, subclass, leader points, morale | §7 | designed |
| 11 | corruption | `corruption.md` | designed |
| 12 | items: chests, shops, crafting, drops, bag, selling | §8, `items.md` | designed (slice contents here) |
| 13 | rooms and interiors | §9, `world/` | designed |
| 14 | the slice's special tiles: the dark floor, the flooded gallery, the rail puzzle | §9 | designed |
| 15 | the goal bar and hints | §10 | designed (slice lines here) |
| 16 | saving and the save format | §11 | designed |
| 17 | co-op | §12, `design.md` §10 | designed |
| 18 | settings, difficulty, accessibility | §13, `ui-design.md` §10 | designed |
| 19 | screens and taps | `ui-design.md` | designed |
| 20 | story, script, chats | `story-hatching.md`, `slice-dialogue.md`, `companions.md` | designed (slice) |
| 21 | maps | `world/` (the map editor), `world-map.json` | designed (slice) |
| 22 | music and sound | `audio-plan.md` | designed |
| 23 | art | `style-guide.md`, `art/ASSETS.md` | designed |
| 24 | time and taps | `balance.md` §2, `ui-design.md` §4, `tools/timecount.js` | counted |
| 25 | what is measured on purpose | §14 | listed |
| 27 | accounts and characters: six slots, the select screen, one device at a time, what is shared, guests, the move to v6 | §16 | designed 22 Oct |
| 28 | admin tools: roles, server, players, characters, moderation, market, events, letters, tests, the log | §17 | designed 22 Oct |
| 26 | the small things every RPG has: team attacks, the Book (bestiary, codex, stamps), map pins, looks, weather, a pet, cooking, buyback, town thanks, post-game, new game plus | §15 | minimal versions, 22 Oct |

## 1. Turn order: the timeline (charge time; Joakim, 22 Oct)

Modular arithmetic instead of dice (the charge-time system of *Final Fantasy Tactics*):

- Every unit has a **rate** `r = 90 + initiative` (initiative as in `balance.md` §3: kobolds `10 + DEX modifier + class bonus + gear`,
  foes 10, quick foes 12, brutes 8; so a plain foe has rate 100 and a ranger with DEX 15 has 104).
- Every unit has a **charge** `CT`, starting at 0. The clock ticks; each tick every living unit gains its rate. **Every unit with
  `CT ≥ 100` acts, highest CT first, and then `CT ← CT − 100`** (it keeps the remainder: that is the modular part). A unit whose CT is
  still 100 or more after acting acts again in the same tick, after the others.
- **Ties:** the pack before foes, then the order the units joined the fight (the pack's slots, then the foes as placed). Not the
  position on the board: a tie that turned on who stands further left would change the bar every time someone moved (found while
  building the bar, 22 Oct). So the order is fully decided and
  **shown**: the turn-order bar shows the next eight turns exactly, and it never changes unless something changes a rate or a CT.
- **What it means:** with rates near 100 every unit acts about once a tick, faster units first; the remainder adds up, so a rate of
  104 gains an extra turn every 25. **+1 initiative is +1% of turns, about 1 power point** (the same price as before).
- **Statuses:** *stun* is `CT − 100` (the unit loses one turn); *slow* keeps its meaning (movement); a future *haste* is `CT + 50`.
- **A "round"** (for buff lengths, the boss's telegraph, morale's AP roll) is the unit's own turn: "for 3 turns" means three of the
  affected unit's turns; the boss telegraphs on every third boss turn.
- **Luck** no longer touches turn order (there is no die); its other effects stay.
- **Co-op:** there are no phases. Whoever owns the kobold whose turn it is acts; the others watch. **A turn has a 20-second timer**
  (the goal for a turn is 4.5 s), after which the kobold guards. Foes act on their own turns as always.

## 2. The battle board

The engine's generator (`battle/grid.js`, `tcGen`) is kept, with these rules written down and given goals:

- **Size:** normal fights 9 × 12 (one or two foes), 10 × 13 (three), 11 × 14 (four or more); bosses 12 × 14. The 2 × 2 boss has room
  cleared around its start, and **every floor tile a kobold can stand on is reachable by the 2 × 2 boss** (no one-tile gaps between
  rocks walling it in: the build's lab found a boss boxed in by rocks, which stalls the fight). Board goal, counted in step 9.
- **Theme** from where the fight starts: *meadow* (grass routes, the farms), *woods*, *cave* (the mine, cellars), *town* (set pieces:
  the bakery cellar uses *cave*, the castle yard *town*), *dark* (unlit tiles, new: *cave* with sight 3), *flooded* (new: *cave* with
  difficult water tiles).
- **Terrain by theme** (the generator's densities): meadow: paths, bushes 5% (half cover, hide), rocks 3.5% (full cover), trees 2.5%;
  woods: trees 13%, bushes 4%; cave: water pools, rocks 11%, mushrooms 6% (half cover). The kobolds' three starting rows are kept open.
  Every open tile is reachable.
- **Goals the generator is checked against** (counted over 500 generated boards per theme by a test, build step 9): every open tile
  reachable from the pack's start; on boss boards every open tile within a step of where the 2 × 2 boss can stand; the starting rows
  free of full cover and water; foes start in the far 42%; dark boards give sight 3; flooded boards are about a quarter difficult water.
  **The shot goals** (the model's average shot of 4–5 tiles, the target in cover 30% of the time) are about fights, not boards: they are
  counted by the slice simulator in step 20 (`number-audit.md` P28 has the lab's first count). If they miss, the densities and the foes'
  cover habits change, not the hit formula.
- **Starts:** the pack places its kobolds in the bottom three rows (the placement phase). Foes stand in one or two hidden groups
  (pods) in the far 42% of the board, and **start unaware** unless it is a boss or a patrol that saw the pack first (§6): an unaware
  foe has no dodge and is crit at +10 until its pod is alerted.
- **Fog and sight:** a unit sees 7 tiles (5 in a cave, 3 in the dark), plus its sight bonus; tall grass and bushes hide a unit beyond
  3 tiles (2 with stealth). If nobody has seen anybody for three turns, both sides hear each other ("something to the north").
- **Exits:** in a normal fight the pack's own edge (the bottom row) is an exit: a kobold on it may leave for 1 AP (§4).

## 3. Foes

- **Stats come only from the bestiary** (`bestiary.md`: role × the level foe, with the bond factor g(L)). **The engine's runtime
  scaling is removed**: no `1 + 0.08 × (level − 3)` on foes, no scaling of bosses by the number of kobolds (nothing scales, Gate 1).
- **Groups:** a random fight draws a mix from the place's table whose weights add up to the fight's target weight (`bestiary.md` §4),
  not "pack size + 1".
- **AI, one rule for every foe:** on its turn a foe picks, among the actions it can pay for, the one with the highest expected damage
  to the pack (or healing to its side, for healers), with **the target drawn by threat** (`balance.md` §3: probability ∝ threat among
  the kobolds it can reach this turn). Its role adds one habit (the bestiary's "how it fights"): brutes charge the nearest, ranged foes
  keep 3+ tiles and seek cover, casters stay behind a friend, quick foes flank, elites call their pod.
  A foe's own line in the bestiary refines its pick ("the most hurt kobold", "the lowest defence", "the healer"). **A foe's status**
  (the bestiary's "uses", e.g. the grub's sticky spit) rides on each of its hits and lands by the status rule (`balance.md` §4a), as a
  kobold's skill does; statuses that come from tiles or shouts are separate actions. **Fleeing:** a normal foe
  under 25% HP whose pod has lost half its members turns to run for its edge (a fleeing foe is deed 2 in `corruption.md`).
- **Bosses** follow the two boss rules and their own trick (`bestiary.md` §5); four attacks a turn, the telegraph every third boss
  turn, at least seven turns, 10% softer after each defeat.

## 4. Down, losing, fleeing, retries

- **Down:** a kobold at 0 HP is down. It can be raised by a Phoenix feather (50%), a Golden feather (100%), Revive, or (co-op) another
  player's kobold standing beside it for 1 AP (raised at 25%). A down kobold still earns XP and stands up with 1 HP when the fight is won.
  Each fall is −1 to its streak (morale).
- **Losing** (everyone down): back to the last fountain you drank from, everyone healed, **half your gold** kept. Nothing else is
  lost. A boss you lost to is **10% softer** next time (each defeat, never below 70%).
- **Fleeing** (normal fights only): a kobold on the exit edge leaves for 1 AP; if every standing kobold leaves, the fight ends with no
  XP and no gold, and the foes stay where they were. Leaving a downed friend behind is deed 5 in `corruption.md` (the downed kobold is
  carried out, cartoon rules).
- **Retries:** a boss can be retried at once; the potions used are the only cost. Set pieces can be retried the same way.
- **How strong a set piece is (a rule, 23 Oct):** the script says *how many* foes a set piece has; the rule says *how strong*. A set
  piece's foes add up to at most a normal fight's weight for the pack that fights it, **0.75 × the kobolds in it** (`balance.md` §4: a
  normal fight is three foes of weight 1 for a pack of four). If the script's foes weigh more, each one's HP, attack and XP are scaled by
  `0.75 × kobolds ÷ their total weight` (the drill's recruits are training, the boss rat is a big rat, not an elite). Bosses are not
  set pieces: they follow the boss rules. *Found when the first playthrough lost the cellar to a five-times-HP "boss rat".*

## 5. Recovery between fights

- **After a win:** 10% of max mana back to every kobold; no HP.
- **Fountains:** full HP and mana, free, any number of times. **Inns:** full HP and mana and a save, for the bed's price (0.5F, never
  under 10 gold); the roster and the campfire chats. **Campfires** (one per town area, half-way): one free full heal per visit to the
  area (a visit ends when you leave it).
- **Potions and ethers** (`items.md` §7); **ember-buns**: full HP and mana for the whole pack, usable in a fight or outside, three in
  the whole game.
- **HP regen** (sets, gear) works per turn in a fight only.

## 6. The overworld

- **Encounters:** only tall grass rolls (`balance.md` §5); every route's road crosses grass for 40% of its middle; dungeon floors roll
  on every step; never in towns; the first and last 10 steps of a route are safe; at least 12 steps between fights.
- **Patrols** (visible groups, `balance.md` §5): they stand on a route facing a direction, shown with a strength word. Walking into
  their sight (3 tiles in front of them) starts the fight with them **aware**; reaching one from behind or from tall grass starts it with
  them **unaware** (the ambush). A beaten patrol is gone **until the next inn rest** (then it is back, for players who want the XP).
  Slice: R1 has two (stretch 2's "+2 patrols"), the mill road one. **As built (22–23 Oct):** a patrol's sight is the 3 × 3 tiles in
  front of it (3 deep, one either side); a pack standing in tall grass is not seen. Its group is a **leader** (the elite version of the
  place's first foe, by the role ratios) plus the place's mix at one weight less, at the place's level + 1, and it pays 1.5× XP. Its
  strength word compares its level with the pack's: 3 or more under *Few*, 1–2 under *Several*, equal *Pack*, 1–2 over *Lots*, 3 or more
  over *Overwhelming*.
- **Bounties:** reading a bounty on a board places its named foe as a patrol (with its escort) at the spot the bounty names; beating it
  pays the bounty at the board. One fight, 1.5× XP.
- **Barriers** are story, explained before you hit them (`design.md` §2). The slice's: the capital gate opens when Bork joins; **the
  road south from Pebblebrook (to R2) is flooded** while the dam is shut, because the diverted brook runs over it; it is dry when the
  wheel turns (the tube). The map shows the dry road; the flood is a layer drawn while `pb < 6`.
- **Time of day:** there is none. A scene may tint the screen (the circle "at dusk", the night at the nest), and the tint ends with the
  scene.
- **NPCs** stand at their places; scenes move them; they never wander.
- **Signs and boards** are one box each (the welcome sign, the jokes).

**Travel**

- **Fountains:** drinking sets the respawn point and, from the second Smiler piece, unlocks fast travel to every fountain drunk from
  (3 taps).
- **Raptors** (from the first piece): ride between **stables** you have visited (3 taps). Every town has one on its first route, and
  Hearthspire has one by the capital gate; the slice has two (Hearthspire's and the mill road's). Raptors are travel only.

## 7. The pack and progression

- **Joining:** a companion joins at the **pack's mean level, rounded down** (never above Pip), with its class's starting skill, the
  talents a kobold of that level would have picked (the first card of each offer), and **the current tier's shop weapon and armour** for
  its class. It brings no other gear.
- **The bench:** companions not in the pack wait at the inn. They get **half the XP** the pack earns, **but never fall more than two
  levels below Pip**: a benched companion that would, gets full XP until it is two levels below again (a floor, not a catch-up jump).
- **Talents:** one pick a level from level 2, three cards (`skills.md` §2); the subclass at level 8; Pip's leader point every second
  level (`balance.md` §3). Picks can wait (a "!" badge); the moon shrine resets talents for 4F.
- **Morale:** each kobold keeps its bond (chats, quest) and its streak (clean wins, at most +3, falls −1, back to 0 at an inn); pack
  morale is the formula in `balance.md` §3 (with corruption's mean). The sheet shows it; the AP it adds is shown as a "+1 AP" spark.
- **Corruption:** `corruption.md`.

## 8. Items in the slice

**Rules** are in `items.md` (budgets, tiers, prices, drops, crafting). **The bag has no limit** (it is a cozy game; the sheet sorts by
slot and tier). **Selling** gives 35% of the shop price; uniques and set pieces ask "are you sure?". **Drops**: 40% of fights a
material from the zone, 8% a gear piece at the stretch's tier (15% of those one tier up), 6% a consumable; bosses their unique.

**The slice's chests** (by the rule: about 3 gear, 2 gold or consumables a stretch; the town's hidden one; the Mossback set started):

The chests themselves (where each stands and what is in it) are placed in the map editor and live in `world/` (`world/README.md`);
the slice has eight: behind the pond and on the lookout (R1), by the dam (Pebblebrook), one on each mine floor, Mallow's old box (the cellar,
after the rats) and the loft (opened by its scene).

**The slice's shops:**

| shop | sells |
|---|---|
| Hearthspire | every T1 piece for the eight wave-1 families and every slot, with the robe and scout variants; Potion, Ether |
| Pebblebrook | T1 until Pip is level 5, then T2 (every slot and family, robe and scout); Potion, Ether, **Phoenix feather** (the town's consumable) |
| Pebblebrook smith | the T2 recipes (`items.md` §8) and **miller's boots** (5 gold scrap: the Millers' set's crafted piece) |
| Hearthspire smith | T1–T3 recipes as they are found; reforging is Emberreach's |

## 9. Rooms and the slice's special tiles

- **Rooms:** hand-made rooms are in `world/rooms/` (made in the map editor) (the bakery, the cellar, the castle hall, the Hearthspire inn, the mill loft, and
  added 22 Oct: the mill, the tower top, the Pebblebrook inn). Every other door (houses, shops, the smithy, the shrine, the barracks)
  opens a room made by the engine's house generator, furnished by its kind (a shop has a counter, a house a bed and a table).
- **The dark floor** (mine floor 2, tiles `d`): sight is 3 on and into dark tiles, on the map and in fights (the *dark* theme). **Glow
  grubs light the 2 tiles around them**, and so do lanterns (Nugget's is the pack's: the pack sees 4 while he is in it), and the
  campfire lights 4 tiles. A dark fight's unseen rule matters: hiding is easy, and that is the point of the floor.
- **The flooded gallery** (mine floor 3, tiles `w`): water is **difficult** (entering costs two moves) for kobolds and land foes;
  Old Shellback swims (no cost). Fire skills are ×0.5 on a foe standing in water; storm skills are ×1.25 (the town's foes resist storm,
  but water carries it): a reason to bring the right caster to the hidden trial.
- **The rail puzzle** (mine floor 1, Ore's cart): the rails run from the stairs to a full cart at the far end, with **a broken rail**
  half-way and **three switches**: one into a loop that goes round the broken rail, one out of it, and one into a dead-end siding. Tap a
  switch to flip it, tap the cart to push it. One setting of the eight brings the cart home; a wrong one sends it into the siding or to
  the gap, where it stops with a clank and a joke, and the player can push it back. Hint (one tap): "Rails don't like gaps. Go round."
  The map (`world/maps/mine1.json`) has the loop, the siding and the switches.

## 10. The goal bar and hints (the slice)

The goal bar shows one line from the flags (`slice-dialogue.md` §7); tapping it opens the quest log, which lists the open steps with
a hint each (one tap).

| flags | goal bar | hint (one tap) |
|---|---|---|
| act 1 | Chase the rats out of Mallow's cellar | The hatch is by the bakery's back wall. |
| act 2 | Light Mallow's lamp at the tower fire | The tower is in the castle yard. Mind the drill. |
| act 3 | Take your ember to the Great Nest | The Nest is in the castle yard. |
| act 4 | Warm an egg | Any of them. Or... |
| act 5 | Talk to Mallow | The bakery has a notice on it now. |
| act 6 | Leave by the capital gate | West, along the marble street. |
| act 7, pb 0 | Walk to Pebblebrook | R1, 120 steps. Beetles. |
| pb 1 | Find out why the mill has stopped | The mill is by the brook, west of the square. |
| pb 2 | Get the shift to the circle: {miners} of 5 | Ore (the mine), Tansy (the pond on R1), Flint and Grit (the square), Old Marl (the north houses). |
| pb 2, grubb 0 | ... and clear the mill road | Grubb is on the mill road, east. |
| pb 3 | Deal with Snipe at the bottom of the mine | Three floors down. The campfire is on floor 2. |
| pb 4 | Bring Grubb to the circle | The toll box, on the mill road. Take Nugget and Old Marl. |
| pb 5 | The circle meets | The circle stones. |
| pb 6 | Take the tube home (or ride: the stable is open) | The raptor stable is on the mill road. |

Per miner (the quest log's five lines): Ore "His cart is stuck on floor 1." · Tansy "Lost her lunch by the pond." · Flint and Grit "Each
blames the other for the stone. Where is the bag?" · Old Marl "She wants to be heard. Ask Ruddle." · Grubb "After Snipe."

## 11. Saving

- **Autosave** at every flag change, every fight's end, every door, every inn rest and every fountain drink. No save menu; one save
  per player, in the browser and in the cloud (the newest wins, as now).
- **The v6 save** (`SAVE_EPOCH` bumped at the progress reset, `gate1-review.md` A2) holds: the flags (`act`, `pb`, `grubb`, `miner_*`,
  the side quests, the bounties; the save keys kept from the old game: `seals` for the pieces, `party` for the pack); Pip's class; for
  each kobold its level, XP, scores, talents, skills (equipped, dark or plain), gear, HP, mana, bond, streak and corruption; the roster
  and who is in the pack; gold, the bag, the ember-buns left; Pip's leader points; fountains drunk from, stables visited, the respawn
  fountain; each boss's defeats (for softening); chests opened; patrols beaten since the last rest; fame.

## 12. Co-op

`design.md` §10 holds the model (a shared world, personal stories, level sync, shared boss credit, phasing). In a fight: at most four
kobolds and four players sharing the places; **the timeline** (§1) decides whose turn it is; a 20-second turn timer; revive by standing
beside a downed friend's kobold (1 AP, 25%); buffs from two players do not stack; XP and loot are personal; a player who leaves mid-fight
leaves their kobolds guarding until the fight ends.

As built (build step 15):
- **Who meets whom.** A road fight, a patrol or a story boss opens the lobby when another player is on the map in the same place;
  other story fights stay personal. Phasing: while your story is still in Hearthspire's morning (act 1, up to the gate) you are in
  your own copy of the place: you don't see others and they don't see you, so "nobody comes" is true.
- **Places.** Four kobolds in all; each player brings at least one. Nothing scales with the number of players: the fight is the
  one the host met, tuned for four kobolds.
- **Level sync.** A friend's kobolds above the host hero's level fight at it (scores, skills and gear stay; HP and mana keep their
  share). XP stays suited to the real level: a synced kobold gets the same share of its own level as the fight gave at the synced
  one (XP × need(real level) ÷ need(fight level)).
- **Boss credit.** A shared boss counts for the friend if their own story has reached that scene (it is due and not yet played):
  when they play it, the talking plays and the fight is skipped. Anyone else gets a **helper's mark** (counted; cosmetics later).
- **Turns.** The timer warns at 15 seconds; at 20 the kobold guards and the turn passes. Buffs: one player's add up, and for two
  players the strongest player's total counts. Revive is for another player's kobold only. A shared fight can't be retried at once.

## 13. Settings, difficulty, accessibility

- **One difficulty.** The curve is tuned for a pack of four; the player's levers are the pack, the gear, leaving fights, the bond and
  levelling (the bounty board). One curve keeps co-op and level sync simple, and the game says when a boss is two levels too high.
- **Settings:** sound and music volume, mute; text speed (the 3-second box is the default; "fast" and "tap only"); reduced motion
  (animations under 200 ms or off); screen shake off; colour-blind palette (shapes as well as colours); left-handed layout (swaps the
  thumb zones). Accessibility rules are `ui-design.md` §10.

## 14. Measured on purpose (goals checked in play, not open design)

These are designed numbers whose *feel* only play can confirm. Each has a goal; play checks the build against it, and if one misses,
the rule is revisited in writing first:

1. The unit times of play (3 s a box, 4.5 s a kobold turn, 1.2 s a foe turn): the length follows from them (`balance.md` §2).
2. Boss fairness at the low side (two levels under an early boss) and whether the third boss feels fair or cheap.
3. Whether misses feel like bad luck (the 84% average hit).
4. The risk premium's 0.25 (are risky skills picked?), the crit-build λ, the 0.6 share of second quick attacks.
5. The monk's Balance shape (0.5 + Balance) and the 70% and 90% thresholds.
6. Corruption's trade (a dark pack against its bond) and the deeds' values.
7. The bond factor g(L) (does a pack that skips the chats feel the difference?).

## 15. The small things every RPG has (minimal versions, 22 Oct)

Each is the smallest version that fills the gap; none changes the balance curve unless it says so.

1. **Together** (a team attack). When two kobolds stand next to the same foe, the active one may use *Together* (1 AP, once a fight per
   pair): both attack it now, and the friend's charge drops by 100 (it spends its next turn now, `systems.md` §1). The foe counts as
   flanked for both attacks (cover ignored, crit +15 paid by value). It moves a turn earlier and adds a flank: about +2% a fight, inside
   the curve. Each pair's first Together plays a two-kobold animation. The finale's Smiler is the same verb for the whole country.
2. **The Book** (Mallow's recipe book, which Pip carries from act 1): one screen with four tabs. *Foes:* every foe met, with its picture
   and level range; weaknesses and resistances appear after three wins against it (or at once with INT 14+, or a monk at Balance 70%).
   *Lore:* the rhyme, the mural, the signs, the notice, each kept once read. *Places:* each area's chests found out of its total.
   *Stamps:* 20 milestones (first fight, each piece, each companion's quest, every chest in a town, every foe in the Book, a clean boss
   fight, a dark version cast, a corruption cleansed...), cosmetic only (a stamp on the page). The Smiler's instructions are its last page.
3. **Map pins.** The goal bar's target is a pin on the world map and an arrow at the screen's edge when it is off screen; a setting turns
   the arrow off.
4. **Looks.** At the start the player picks the hero's scale colour from six palettes (a palette swap on the same sprite sheet) and
   **names the hero** (default "Pip", §16); hats come from gear.
5. **Weather**, flavour only: falling snow in Frostwick and on R5, heat shimmer in Sunhaven and on R2–R3, sea spray at Saltspray,
   drifting flour dust in Pebblebrook once the mill turns. Drawn over the map, never in fights, no rules.
6. **A pet.** After *The ghost of the mill*, Ghost the raptor chick follows Pip on the map (a follower sprite) and yips when he yips. No
   combat, no stats.
7. **Cooking.** At an inn, *Cook*: 2 materials of any kind become a **snack** that heals 35% (a potion that cannot be bought). A use for
   spare materials; a pack never carries more than 5 snacks. Crumb's line when she joins: "Who taught you to cook? Nobody? It shows."
8. **Buyback.** A shop remembers the last 5 things you sold it and sells them back at the price you got, until you leave the town.
9. **Town thanks.** Finishing a town's keeper's challenge makes its shop 5% cheaper for you (stacking with fame's steps). Fame stays the
   one reputation number; the guards have none.
10. **Post-game.** *The islands' trials:* three elite fights at level 30, one on each island and one in the island cave, each dropping a
    level-30 unique. *Glitterbeak's hoard:* a vault room in the castle with five chests (gold, the T6 crafted recipes, a stamp). About
    15 minutes by count; it opens after the new hatching.
11. **New game plus.** After the credits, *Hatch again* starts the story over with the Book (foes, lore, stamps) and Pip's colour kept;
    levels, gear and gold start fresh. Nothing else changes.

## 16. Accounts and characters (MMO-style, decided 22 Oct)

**An account holds up to six characters** (Joakim). A character is one hero with its own class, colour, name, story progress, pack,
gear and gold: one save (§11). The account holds what belongs to the player rather than the hero.

- **The account** is the website login (name and password, the token kept on the device). Nothing else identifies a player.
- **Naming the hero (Joakim):** the player names the hero when creating the character, **default "Pip"**. Every line in the story that
  says Pip uses the hero's name (`{hero}` in the data; the script writes "Pip" and means the hero); other players see that name above the
  kobold. Rules: 2 to 12 letters, a word filter, unique per account, not across the server (two players may both be Pip). One rename per
  character, at the moon shrine.
- **The character select screen** (after login, and from ☰ → *Characters*): six slots, each showing the hero's portrait and colour, name,
  class, level, where they are (the last fountain), the Smiler pieces, the time played and when last played. Tap a slot to play; an empty
  slot says *New hero*. **Creating:** name, scale colour, then the story begins (the class is picked at the yard drill, as in the
  script). **Deleting:** hold the slot, then type the hero's name to confirm; a deleted hero is kept for **7 days** and can be restored
  from the same screen, then it is gone.
- **One device at a time.** A character can be played on one device at once: opening it takes a lock that the game renews every 30 s.
  Opening it elsewhere asks *"{hero} is being played on another device. Play here instead?"*; yes moves the lock, and the other device saves
  and returns to the select screen. Two *different* characters of one account can be online at the same time (two devices, two heroes,
  even in one co-op fight).
- **What the account shares** across its characters: **the Book's stamps and its Foes and Lore tabs** (what you have learned stays
  learned), cosmetics (palettes unlocked, bun crumbs), friends, letters to Quill, settings that are not per device. **Not shared:** gold,
  items, levels, story progress, corruption. There is no shared stash; a player can still *gift* between their own characters through
  the normal gift (one item a day, `design.md` §10), so nothing is lost but nothing is farmed either.
- **Where it lives:** on the server under `data/users/<account>/char<slot>` (one document per character, the v6 save; *as built, 23 Oct:
  the database's documents have an even number of path parts, so `chars/<slot>` became `char<slot>`*), `data/users/<account>/lock<slot>`
  (the one-device lock) and `data/users/<account>/account` (the shared part and the slot list). The browser keeps a cache of each slot; per slot the newest copy wins,
  as today.
- **Guests:** someone without an account can play one character, saved on the device only. Logging in later offers to *Keep this hero*:
  it moves into a free slot.
- **The move to v6** (the progress reset, `gate1-review.md` A2): the old single save at `data/users/<id>/save` is not deleted. It is moved
  to `data/users/<id>/legacy` (read-only), shown on the select screen as *"Your hero from the first story"* with a stamp in the Book for
  having played it, and every account starts v6 with six empty slots.
- **Admin:** the Admin screen lists an account's characters (name, level, last played) and can restore a deleted one inside its 7 days.
  Player data stays on the server only (`/var/lib/kobold-quest`), never in the repository.
- **Before going public** (`tech-plan.md`): the server checks saves for impossible values (levels, gold, items) before storing them; for
  friends the client's save is trusted, as now.

## 17. Admin tools (designed 22 Oct)

The Admin screen in ☰ grows from today's two things (the GitHub token, the messenger list) into the tools a small server needs.
**Every admin action is checked on the server, written to the admin log, and never shows a password or sends player data off the
server** (`CLAUDE.md`). Phone-first: one tab per job, two to three taps per action.

**Roles.** The **owner** is named in `server/config.json` (`admins`, today Zaitzer) and can do everything, including granting roles.
A **moderator** (granted in the game by the owner, stored in the server's data) can do the *Players* and *Moderation* jobs marked (m).
Everyone else sees no Admin button.

| tab | tool | what it does | who |
|---|---|---|---|
| **Server** | status | the build (and whether it matches `release/server/BUILD`), uptime, players online, accounts, last backup, the data file's size | owner, (m) |
| | message of the day | a line shown once to everyone at login | owner |
| | announce | a toast to everyone online now | owner, (m) |
| | maintenance | blocks new logins except admins, warns everyone online, saves and signs them out after 2 minutes; off again with one tap | owner |
| **Players** | find | search accounts by name; each shows created, last seen, online, its heroes, warnings and bans | owner, (m) |
| | a hero | read-only: the sheet, where it stands, its flags, its bag and gold, its last 20 saves' times | owner, (m) |
| | unstuck | moves a hero to its last fountain (for a hero stuck in a wall or a broken scene) | owner, (m) |
| | release the lock | frees a hero's "one device" lock (§16) when a device vanished | owner, (m) |
| | set a story flag | moves a hero one step on in a broken quest (only to a value the quest can reach) | owner |
| | rename | renames an account or a hero with a bad name (the player is told why) | owner, (m) |
| | password reset | gives a one-time code the player uses to set a new password; the admin never sees the password | owner |
| | restore | brings back a deleted hero within 7 days, or one hero from a daily backup (pick the date; the current save is kept as a copy first) | owner |
| | compensate | gives gold, an item, or a level's XP to a hero after a bug, with a reason the player sees in a letter | owner |
| | delete an account | at the player's request, after typing the name; kept 7 days like a hero | owner |
| **Moderation** | reports | the queue from the report button (`tech-plan.md`): who, about whom, the chat lines around it; close with *no action*, *warn*, *mute* or *ban* | owner, (m) |
| | warn, mute, ban | a warning (shown at next login), a chat mute (1 hour, 1 day, 1 week), a ban (1 day, 1 week, for good) with a reason; undo any of them | owner, (m) |
| | word filter | add or remove words from the name and chat filter | owner, (m) |
| | chat log | the last 24 hours of world chat (kept 24 hours, then gone); private messages are never shown | owner, (m) |
| **Market** | listings | every market listing; remove one (the item goes back to its seller) | owner, (m) |
| | gifts | the last 100 gifts (who to whom, what), for spotting a stuck or abused gift | owner |
| **Events** | festival | a cosmetic event with an end date: a banner, bunting in the towns, a stamp for logging in during it. **No XP or gold multipliers**: the curve is counted, and level sync would carry the bonus into everyone's fights | owner |
| **Letters** | the messenger | the GitHub token (checked against GitHub) and the messenger list (as today); the count of letters sent this week | owner |
| **Tests** | test hero | an admin may mark one of their own heroes *test*: it can jump to any story flag, pick any level, spawn any fight or boss, and is hidden from the market, gifts and co-op credit | owner |
| | preview | see a scene as a player would (phasing on, others hidden) without changing the hero | owner |
| **Log** | admin log | every admin action: who, when, which tool, on whom, the reason; it cannot be edited or deleted; kept a year | owner, (m) sees their own |
| | errors | the error reports pages send (`tech-plan.md`, "Before going public"), grouped by message and build | owner |

**As built (23 Oct).** The fixes (unstuck, a flag, compensation, a hero's new name) are notes the server leaves in the hero's save;
the game applies them when the hero is played, at once if it is being played, and a letter says what happened. *Restore from a backup*
replaces the save as it is on the server, so use it while the player is offline. World chat is kept in the server's memory only, so it
never reaches the data file or the backups; a restart empties it. A ban "for good" is a date far in the future.

**What admins cannot do:** read passwords or private messages; edit a save by hand (only the named tools above, each logged); give a
multiplier to the curve; copy player data out of the server.
