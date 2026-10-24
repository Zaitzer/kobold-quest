# Kobold Quest: balance and pacing (targets, v1, 20 Oct 2026)

*Part of the design document (`design.md`). **These are the numbers the game should have, not the numbers it has
today.** The engine's current values are a starting point only; where the two differ, this file wins and the
simulators (`test/sim`) are rewritten to hit these targets. Items are in `items.md`, screens and taps in `ui-design.md`.*

**How to use this file.** Every number is a *target* with a reason. The sim must reproduce each curve within ±15%; if it
can't, we change the content, not the target, unless the target itself turns out to feel wrong in play (then we change it
here first, in writing). The tables were computed together (one model, one script), so they agree with each other.

**The numbers I am least sure of** (full table in section 11; these get the first playtest questions):

1. **The boss budget and boss HP** (`T = 5.73 + 0.053 × level`, `k = R × (4.67 + 0.04 × level)`, a pack of four): ±20% moves a boss from 75% to 45% (or 93%) first-try. Softening on defeat is the safety net. *Question: does the third boss feel fair or cheap?*
2. **Hit chances** (pack hits and foes' hits): −20% on the pack's hit chance drops bosses to 41%. *Question: do misses feel like bad luck or like the game cheating?*
3. **The unit goals of play** (3 s a box, 4.5 s a kobold turn): they set the length; the build must meet them (`tools/timecount.js`).
4. **The encounter rate** decides whether the player is ahead of or behind the bosses by about a level, and a level is worth about 20 points of win rate.
5. **Mana pools** (±20% moves bosses 62–81%).
6. **The low side of the boss curve** (two levels under an early boss is nearly a sure loss) and the **14-pack caster and support corner** (8 packs under 30%).

## 1. The feelings we want

Every number below exists to produce one of these. If a number makes the anti-feeling, the number is wrong.

| moment | the feeling | what makes it | the anti-feeling |
|---|---|---|---|
| **First fight** (minute 6–8) | "I can do this" | foes die in 2 rounds; a foe hit takes 16% of Pip's HP; nobody can die | confusion, a wall of rules |
| **A normal fight** | a small puzzle solved in about a minute | 3–4 rounds; the pack loses about 25% of its HP; position matters more than numbers | a chore, a damage race |
| **A boss** | an event | 8–12 rounds; the pack loses 40–55% of its HP; one telegraphed danger turn; 70% to win first try at the right level | an HP sponge; a coin flip |
| **A level-up** | a small present | a level about every 13–19 minutes after act 1 (by count, section 9); always a pick to make | a number going up with nothing to do |
| **A gear tier arrives** | "I look different, I hit harder" | +20–25% power in one step; the hat changes | gear as a spreadsheet |
| **Gold** | "almost enough" | shops cover 70–85% of the next tier; drops and crafting fill the rest | broke on potions, or rich with nothing to buy |
| **Potions** | a safety net | about a quarter of income; 1 to 2 used per 3 fights | a tax that stops you fighting |
| **Walking a route** | a stroll with interruptions | a fight about every 30 steps, never two in a row; something off the path | an endless corridor of fights |
| **Arriving in a town** | relief, then curiosity | no fights in town; a fountain; the trouble visible in 30 seconds | another menu |
| **The fountain** | "ahh" | heals everyone, free, every town | a toll |
| **A miss** | "bad luck", never "unfair" | an average hit rate of 80–85%; the odds always on screen; a mercy bonus after two misses; big boss attacks do not roll | a 95% miss with no explanation |
| **Losing** | "oops" | back to a fountain, half your gold, no lost items | punishment, lost progress |
| **A keeper challenge** | clever, not hard | no fail state; a hint is always one tap away | a puzzle you can fail and redo for 10 minutes |
| **A Smiler piece** | ceremony | a big sound, the diagram fills, the town cheers | a quest item in a bag |
| **The Ordeal** | uncomfortable and sad | under 6 minutes; a fixed scene; a quiet idle stretch | a long grind of despair |
| **The march** | goosebumps | a growing line of kobolds behind you; almost no fights | a fetch quest |
| **The finale** | laughter, then triumph | the RPG-7 reveal; everyone loads their ember | a bigger HP bar |
| **Helping a friend** | "it's good to be needed" | scaled-down fight, a helper's reward | a favour |
| **Playing alone** | complete | nothing requires another player | missing out |

**Rule of novelty:** something new must reach the player at least every 10 minutes (a level, a pick, a gear piece, a new
foe, a story beat, a new place). Section 9 lists the cadence.

## 2. Time

**The length is what the content gives (Joakim, 22 Oct).** Design sets goals and counts; it does not measure, and it does not pad. So
time is not a target here: it is **counted** from the script, the maps and the fight budget, with one goal per unit of play (a box
of dialogue 3 s, a kobold's turn 4.5 s, a foe's 1.2 s, a step 0.30 s, a shop visit 60 s, ...), and the length is the sum.
`node tools/timecount.js` does the count; a playtest checks the build against the unit goals, not the other way round.

**The main story is about 7.5 hours** (stretches 1 and 2 counted, the rest projected from their fight budget and the town kit until
their scripts are written); **a level comes about every 16 minutes**:

| stretch | levels | minutes | minutes a level | cumulative (h) | how |
|---|---|---|---|---|---|
| 1 Hearthspire, act 1 | 1→3 | 17 | 8 | 0.3 | counted (script, maps) |
| 2 R1 and Pebblebrook | 3→8 | 63 | 13 | 1.3 | counted (script, maps) |
| 3 R2 and Sunhaven | 8→13 | 72 | 14 | 2.5 | projected (fight budget + the kit) |
| 4 R3 and Emberreach | 13→18 | 79 | 16 | 3.8 | projected (fight budget + the kit) |
| 5 R4, home, the Ordeal | 18→19 | 26 | 26 | 4.3 | projected (fight budget + half the kit) |
| 6 R5 and Frostwick | 19→23 | 69 | 17 | 5.4 | projected (fight budget + the kit) |
| 7 R6, R7 and Saltspray | 23→27 | 75 | 19 | 6.7 | projected (fight budget + the kit) |
| 8 The march and the finale | 27→30 | 51 | 17 | 7.5 | projected (fight budget + half the kit) |
| **main story** | 1→30 | **452** | **16** | **7.5** | |

**Act 1, by count:**

| what | count | seconds each (goal) | minutes |
|---|---|---|---|
| dialogue boxes | 122 | 3.0 | 6.1 |
| story beats | 32 | 2.0 | 1.1 |
| set-piece fights: cellar ×2 and the drill ×2 (Pip alone, 3 and 2 foes) | 4 | 36.3 | 2.4 |
| set-piece fight: outside the gate (four kobolds, 3 scouts) | 1 | 85.6 | 1.4 |
| the class pick | 1 | 60.0 | 1.0 |
| talent picks | 2 | 20.0 | 0.7 |
| equipping (the first chest, the starter kit) | 3 | 30.0 | 1.5 |
| the first shop visit | 1 | 60.0 | 1.0 |
| the first inn stop | 1 | 30.0 | 0.5 |
| walking | 229 | 0.3 | 1.2 |
| **act 1, by count** | | | **17** |

**Pebblebrook's stretch, by count** (the template every town follows):

| what | count | seconds each (goal) | minutes |
|---|---|---|---|
| dialogue boxes (the script, main path) | 147 | 3.0 | 7.3 |
| story beats played as animation | 32 | 2.0 | 1.1 |
| normal fights | 19.3 | 87.0 | 28.0 |
| boss fights (Grubb R 7, Snipe R 7) | 2 | 189.6 | 6.3 |
| walking (steps, by the maps) | 1117 | 0.3 | 5.7 |
| the rail puzzle | 1 | 90.0 | 1.5 |
| talent picks | 5 | 20.0 | 1.7 |
| equipping found or bought pieces | 10 | 30.0 | 5.0 |
| shop visits | 4 | 60.0 | 4.0 |
| inn stops (rest, roster, chats start) | 4 | 30.0 | 2.0 |
| chests on the main path | 3 | 4.0 | 0.2 |
| **counted main path** | | | **63** |

So in Pebblebrook's hour: fights 45%, bosses 10%, menus (shop, equip, talents, inn) 23%, talk 13%, walking 9%. **Battle is
over half of the designed time.** That is what the content gives; the vision's four pillars are kept by *kind* (every town touches at
least three), not by minutes. The unit goals: a normal fight **87 s** (3.5 rounds, four kobold turns of 4.5 s and 3.3–4.3 foe turns of
1.2 s, 10 s in and out), a boss **190 s** at R 7 and **304 s** at R 12.

## 3. Player power: the model

A single yardstick, the **reference fighter**, with the other classes scaled from it. Everything else (foes, bosses,
items, gold) is defined *relative* to it, so changing one number moves the rest in step.

- **Base stats (before gear and talents):** attack 5 + 2.2 per level, defence 3 + 1.8 per level, HP 44 + 11 per level.
- **Gear** supplies about +80% of base attack (weapon 60%, the rest 20%), about +68% of base defence and +22% of base HP,
  at the level its tier arrives (see `items.md`; the level table below uses 70% and 25%, close enough to leave as is). Gear tiers arrive at levels **1, 5, 10, 16, 22, 28**.
- **Talents** (one pick a level from level 2, `skills.md` §2): about 9 score cards, 4 talent skills and 16 passives by level 30. **The level
  table counts all of them** (P27, 22 Oct): the old "+0.45 attack, +0.375 defence, +2.1 HP a level" line counted only the score cards, and
  the 16 passives (3 pp each) were power the foes never expected.
- **Damage:** a hit does `0.39 × attack × skill multiplier × F`, ±15%, where F is HoMM3's attack-versus-defence factor (§4a,
  "Damage"; decided 22 Oct). It replaces `attack × multiplier − defence × 0.5`, which the level table was built on; the 0.39 keeps
  the table's basic hit within 1% at levels 1, 10 and 30, and the foe attack column must be re-derived (`number-audit.md` P20).
  A hit lands with `100% + accuracy − the target's dodge − cover − distance − the multiple-attack penalty`: melee averages 90% (the average foe's dodge is 10%), ranged about 66%;
  spells never miss but can be **resisted** (half damage, about 10% of the time). Crit chance 8%, crit damage ×1.5.

### The level table (the reference fighter with its expected picks, on-level standard foes; a pack of four, re-derived 22 Oct)

*Printed by `node tools/balance-model.js levels`. The reference fighter makes its picks like a player (P27, 22 Oct): about 9 score
cards (STR and CON in turn), its talent skills at 2, 5, 11 and 14, and a passive with every other pick (Tough, Weapon focus, Iron skin in
turn). Foe HP includes the bond factor g(L) and the leader factor (P29).*

| L | gear tier | XP to next | total XP | HP | attack | defence | basic hit | foe HP | foe attack | foe defence | XP per foe | gold per foe | gold per fight | fights to next level |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | T1 | 12 | 12 | 54 | 9 | 5.0 | 9 | 37 | 12 | 1 | 2.3 | 3 | 11 | 2 |
| 2 | T1 | 36 | 48 | 65 | 11 | 6.8 | 11 | 43 | 15 | 2 | 4.8 | 4 | 15 | 3 |
| 3 | T1 | 70 | 118 | 78 | 13 | 8.6 | 12 | 49 | 19 | 3 | 5.5 | 5 | 18 | 5 |
| 5 | T2 | 158 | 386 | 111 | 26 | 17.1 | 24 | 102 | 31 | 5 | 13 | 7 | 25 | 5 |
| 8 | T2 | 334 | 1,201 | 145 | 34 | 24.2 | 30 | 132 | 39 | 8 | 18 | 11 | 42 | 6 |
| 10 | T3 | 478 | 2,083 | 185 | 49 | 34.7 | 45 | 205 | 53 | 10 | 27 | 13 | 51 | 6 |
| 13 | T3 | 727 | 4,006 | 220 | 57 | 43.3 | 51 | 235 | 65 | 12 | 33 | 16 | 67 | 7 |
| 15 | T4 | 914 | 5,738 | 270 | 73 | 58.4 | 67 | 318 | 84 | 14 | 41 | 18 | 76 | 7 |
| 18 | T4 | 1,224 | 9,092 | 316 | 87 | 64.9 | 79 | 383 | 98 | 17 | 54 | 21 | 89 | 7 |
| 20 | T4 | 1,448 | 11,874 | 350 | 92 | 73.8 | 83 | 408 | 111 | 19 | 65 | 23 | 98 | 7 |
| 23 | T5 | 1,811 | 16,938 | 406 | 115 | 95.6 | 106 | 535 | 125 | 22 | 70 | 26 | 111 | 8 |
| 25 | T5 | 2,070 | 20,947 | 443 | 121 | 100.5 | 110 | 562 | 135 | 24 | 81 | 28 | 120 | 8 |
| 27 | T6 | 2,341 | 25,492 | 508 | 143 | 120.4 | 133 | 687 | 159 | 26 | 92 | 30 | 129 | 8 |
| 30 | T6 | 2,771 | 30,597 | 564 | 157 | 135.4 | 146 | 770 | 179 | 29 | , | 33 | 142 | , |

**The XP formula** is `12 × level^1.6` (30,597 XP in total to reach level 30). Every pack member gets the full XP of a fight.

**How the table is built (so it can be tuned):**
- *Basic hit* = the fighter's hit by the damage factor (§4a). It rises from 9 to 146 (×16) while HP rises from 54 to
  564 (×10), because skills, crits and area spells push damage further and a longer fight is more fun than a shorter one.
- *Foe HP* = 4 × the basic hit. So a standard foe takes about 4 basic hits, i.e. two rounds of focused fire.
- *Foe attack* is set so one hit takes **16% of the fighter's HP at levels 1–5, 14% at 6–20, 12% at 21–30**. Early hits are
  scary, late hits are survivable; this is the "cozy but threatening" curve. **Re-derived 22 Oct for the HoMM3 factor (D):**
  solving `0.39 × A × F(A, fighter's defence) = share × fighter's HP` gives about **1.14 × the old subtraction values** at every
  level. A side effect worth knowing: the factor widens the gap between sturdy and fragile kobolds (at L10 a foe hit on the
  wizard is 1.56× a hit on the fighter, against 1.39× under subtraction), so defence matters a little more than before.
- *XP per foe* = XP to next level ÷ (0.75 × fights to next level × foes per fight); with a pack of four it is ¾ of the old value, since
  there are 4/3 as many foes. The 0.8 is the share of XP that
  comes from random fights; the other 20% comes from bosses, challenges and quests.
- *Foes per fight* (a pack of four, D): **3.33 at levels 1–5, 4 at 6–12, 4.27 after**, i.e. the pack-of-three figures × 4/3.
  **The rule: foes scale with the pack**, so the fight length (the pack's damage grows by 4/3 too) and the share of HP each
  kobold loses stay exactly as designed. In play: three or four foes early, four or five later.
- *Gold per foe* = 1.15 × (2 + 0.9 × level), unchanged. **Gold per fight (income) F** = gold per foe × foes per fight, so it is
  4/3 of the pack-of-three value. **Prices are set in a separate unit, F₀ = the pack-of-three gold per fight** (the old F),
  so income and the cost of kitting four kobolds both grow by 4/3 and **the shop coverage stays 66–84%**. Rewards (bosses
  6F, chests 1.5F, main quests 4F) use the income F.
- *Fights to next level*: **2, 3, then 5 (levels 3–7), 6 (8–12), 7 (13–17 and 18–22), 8 (23–29)**. The first two levels
  come fast on purpose.

**Tier jumps (P5, arithmetic, 22 Oct).** With gear at 80% of the tier level's base attack, a new tier lifts attack by **+40%
(T2 at level 5), +25% (T3), +18% (T4), +13% (T5), +10% (T6)**, and damage against an on-level foe by +53%, +32%, +24%, +17%, +13%
(the HoMM3 factor turns 1% of attack into about 1.24% of damage). The old claim "+20–25% a tier" was only true around T3 and is
withdrawn. **Kept as it is (J):** early tiers are dramatic, late tiers modest; late progress comes from uniques, sets and
Pip's leader points (section 9). Foes are defined from the reference fighter, so the shares set how a jump *feels*, not how
hard the game is.

### The other eleven classes

Each class has a **power budget of 1.0**, split between damage, durability and utility. *For the casters (cleric, druid, bard, wizard, sorcerer, warlock) the
**attack** column is their spell power, i.e. their special attack; their weapon attack is ×0.6 (the special-attack table below).* The split is the class's identity;
nothing is "worse", only different. Stats are multipliers on the reference fighter at the same level.

| class | damage | durability | utility | HP | attack | defence | speed | mana L1 → L30 | skill casts per fight |
|---|---|---|---|---|---|---|---|---|---|
| Fighter | .30 | .50 | .20 | ×1.00 | ×1.00 | ×1.00 | ×1.0 | 8 → 30 | 3 |
| Barbarian | .50 | .35 | .15 | ×1.10 | ×1.20 | ×0.63 | ×1.0 | 6 → 24 | 2 |
| Paladin | .30 | .40 | .30 | ×0.95 | ×0.95 | ×0.88 | ×0.9 | 8 → 36 | 3 |
| Ranger | .45 | .20 | .35 | ×0.80 | ×1.12 | ×0.69 | ×1.3 | 10 → 40 | 4 |
| Rogue | .45 | .20 | .35 | ×0.75 | ×1.07 | ×0.78 | ×1.4 | 8 → 36 | 4 |
| Monk | .33 | .33 | .34 | ×0.90 | ×0.93 | ×0.82 | ×1.1 | 10 → 46 (ki) | 5 (cheap skills); ki power and pool × (0.5 + Balance) |
| Cleric | .15 | .30 | .55 | ×0.85 | ×0.77 | ×0.93 | ×0.9 | 14 → 62 | 6 |
| Druid | .25 | .25 | .50 | ×0.85 | ×0.82 | ×0.74 | ×1.0 | 14 → 62 | 6 |
| Bard | .20 | .20 | .60 | ×0.75 | ×0.78 | ×0.82 | ×1.1 | 12 → 58 | 6 |
| Wizard | .55 | .10 | .35 | ×0.65 | ×1.09 | ×0.67 | ×0.95 | 16 → 70 | 6 |
| Sorcerer | .60 | .12 | .28 | ×0.70 | ×1.22 | ×0.67 | ×1.0 | 14 → 64 | 5 |
| Warlock | .50 | .22 | .28 | ×0.80 | ×1.03 | ×0.76 | ×1.0 | 12 → 52 | 5 |

**Attack re-solved for the one hit formula (P23, decided 22 Oct, D).** *Rule: a change to the hit rules never rebalances the
classes.* Under the one formula the fighter's +5 class accuracy counts and spells are resisted more at range, which moved every class
2–13% against the fighter; each class's attack (special attack for casters) is solved so its damage relative to the fighter is what
the table intended (barbarian 1.15 → 1.20, paladin 0.90 → 0.95, ranger 1.05 → 1.12, rogue 1.05 → 1.07, monk 0.90 → 0.93, cleric
0.70 → 0.77, druid 0.75 → 0.82, bard 0.70 → 0.78, wizard 1.00 → 1.09, sorcerer 1.10 → 1.22, warlock 0.95 → 1.03; solved by
bisection in the model, exact against the old model at level 10). The fighter itself hits 95% now, against the flat 90% the old
model gave all melee; the pack average is 84% against the 85% the fight lengths assumed, so the level table stands.

**Defence re-derived for the HoMM3 factor (P3, arithmetic, 22 Oct).** The damage factor punishes low defence harder than
subtraction did (a foe hit on the wizard went from 1.39× to 1.56× a hit on the fighter), which pushed the documented table to
73–83% of the fighter's power for the casters, against the promise of 85–115%. **Rule: each class's defence multiplier is solved
so its effective HP equals the durability its power split implies** (`y = g/√ρ`, the same derivation as the threat table).
HP stays; only the defence column moves (barbarian 0.80 → 0.63, paladin 1.10 → 0.88, rogue 0.60 → 0.78, cleric 0.70 → 0.93,
bard 0.60 → 0.82, wizard 0.40 → 0.67, sorcerer 0.45 → 0.67, …). With casters acting with a skill every turn (+30% per action, J),
every class then lands at **86–100% of the fighter** (druid 87%, bard 86%, the rest 92–100%). The threat table and special
defence follow from the new defence. *Arithmetic at level 10; **U** until playtested.*

### Ability scores: the six (J, Joakim's request, 21 Oct)

Every kobold has the six D&D scores. They are **a layer on top of the class table, not a second system**: each existing stat
has exactly one governing score, so nothing is counted twice. The class table (HP, attack, defence, speed, mana) stays the
class's identity (like a hit die); the scores add to it.

| score | governs in combat | governs outside combat |
|---|---|---|
| **Strength (STR)** | melee attack and melee accuracy (blades, axes, fists) | pushing and breaking (field moves that need a shove) |
| **Dexterity (DEX)** | ranged and dagger attack, ranged accuracy, dodge, speed, initiative, crit chance | sneaking past patrols |
| **Constitution (CON)** | HP, HP regeneration, defence | stamina: how far a kobold walks before it complains (flavour) |
| **Intelligence (INT)** | spell power for the wizard; **foe detail**: shows weaknesses and resistances | crafting yield; reading signs and maps |
| **Wisdom (WIS)** | resistance and special defence (spells and statuses landing on you), spotting the unseen; spell power for cleric, druid, ranger | finding hidden chests; noticing patrols |
| **Charisma (CHA)** | chance your statuses land (foe resistance −2 per point); song and buff strength; threat; morale; spell power for bard, sorcerer, warlock, paladin | shop prices (−1% per point), fame, companion mood |

This table is the summary of the score-to-stat mapping below; if they ever disagree, the mapping wins. What each stat *is* is
in `design.md` §8 (the character sheet).

- **One point of modifier = 5 power points (J)**, split inside its score (CON: +5% HP; STR: +5% attack; DEX: +2.5 dodge points and +2.5 accuracy; INT/WIS/CHA: +5% of the casting or status effect they govern). It uses the same price as gear (`items.md`). Since +2 to a score is +1 to its modifier, **+1 to a score costs 2.5 pp** and
  +2 costs 5 pp (corrected 22 Oct).
- **Modifier = (score − 10) ÷ 2, rounded down.** A score of 10 is average and adds nothing.
- **The player buys the six scores (point buy, J, Joakim, 24 Oct),** on the new-hero screen after picking the class: every score
  starts at 8, and **27 points** raise them to at most 15 at the D&D price (a score of 9 costs 1 point in all, 10: 2, 11: 3, 12: 4,
  13: 5, 14: 7, 15: 9). Everyone has the same 27 points, so the budget stays equal by construction. *Begin* waits until no point can be
  spent (a hero never starts weak by a slip).
  The price makes a peak cost total: 15, 15, 15, 8, 8, 8 is +3 in modifiers, the standard array +5, an even spread (12s and 14s)
  at most +6. That is the trade, not a flaw: the peak is in the score the class's attack uses.
- **Suggest** fills in the class's **standard array, 15, 14, 13, 12, 10 and 8** (exactly 27 points), in the class's own priority
  order below (modifiers +2, +2, +1, +1, 0, −1: 5 modifier points, 25 power points). Companions and test heroes use it, and it is
  the class's **reference** that accuracy is read against:

| class | priority order (15, 14, 13, 12, 10, 8) |
|---|---|
| Fighter, Barbarian | STR, CON, DEX, WIS, CHA, INT |
| Paladin | STR, CHA, CON, WIS, DEX, INT |
| Ranger | DEX, WIS, CON, STR, INT, CHA |
| Rogue | DEX, INT, CON, CHA, WIS, STR |
| Monk | none: the even array 12, 12, 12, 12, 12, 12 (24 points, 3 left to spend; Balance 100%; one modifier point more than the others, about 5 pp, accepted 22 Oct, P25) |
| Cleric | WIS, CON, STR, CHA, DEX, INT |
| Druid | WIS, CON, DEX, INT, STR, CHA |
| Bard | CHA, DEX, CON, WIS, INT, STR |
| Wizard | INT, CON, DEX, WIS, CHA, STR |
| Sorcerer, Warlock | CHA, CON, DEX, INT or WIS, WIS or INT, STR |

- **Accuracy is read the same way (D, P17, 22 Oct; point buy 24 Oct).** The class's reference puts its 15 or 14 in the score its
  attack uses, so the class accuracy table (§4a) is read **including the reference scores**: a score adds +2.5 accuracy per
  modifier point *above the reference* and takes 2.5 per point below it (a fighter who buys STR 8 instead of 15 misses 7.5 more). Counting the start again put fighters at 100% in melee and the average hit at 87%, over the target;
  read this way the average is **84%** (model, `node tools/balance-model.js rules`).
- **Growth:** the stat picks among the talents (about 30% of the 30 picks, so about 9) each give **+1 to a score**, up to a
  cap of 20. A cap makes the player spread points instead of stacking one. This replaces the old "+0.45 attack, +0.375
  defence and +2.1 HP per level" line. **Gear** can give +1 or +2 to a score.
- **Reconciled 22 Oct (D, arithmetic):** the level table is read as the reference fighter **including its scores** (STR 15,
  CON 14: attack, defence and HP ×1.10 at the start), so its base stat lines are the table's values ÷ 1.10 and nothing else moves.
  The growth matches the old talent line: a fighter that spends its 9 stat picks as 4 on STR (15 → 19) and 5 on CON (14 → 19)
  gains +10% attack, +10% defence and +10% HP by level 30, against +9.7%, +10.6% and +12.0% from the old "+0.45 / +0.375 / +2.1
  per level". So the level table stands, and the talent line is retired.

#### The monk: the generalist, scaling on Balance (J, Joakim's design, 22 Oct)

The monk is the build that commits to **being even**, as the other classes commit to a peak. It is Bork's arc (sloth to
diligence) made mechanical: it grows by fixing its weakest point.

**Balance**, the monk's own stat (shown as a percentage on its sheet, with the next threshold marked):

$$\mu = \tfrac16\textstyle\sum_i s_i, \qquad \sigma = \sqrt{\tfrac16\sum_i (s_i-\mu)^2}, \qquad \text{Balance} = \max\!\left(0,\; 1 - \sigma/\mu\right)$$

| scores | Balance |
|---|---|
| 12 ×6 (the monk's start) | 100% |
| 13, 13, 12, 12, 11, 11 | 93% |
| 15, 14, 13, 12, 10, 8 (the standard array) | 80% |
| 20, 20, 10, 8, 8, 6 (stacked) | 52% |

**Two parts, kept apart:** *how much* the monk has invested is the average of its six modifiers, `m̄`, used wherever another
class uses its governing score; *how even* it is, is Balance. Stacking one score raises `m̄` a little and drops Balance a lot.

| monk ability | scales on Balance |
|---|---|
| ki skills (strike, mend, ward) | power × (0.5 + Balance): ×1.5 at 100%, ×1.0 at 50% |
| ki pool | × (0.5 + Balance) |
| crafting yield | × (0.5 + Balance) |
| filling the pack's gap (a weak version of the missing role: heal, threat, ...) | strength × Balance |
| knowledge | at 70%: sees foes' weaknesses and resistances (shared with the pack and co-op players); at 90%: also each foe's next action |
| Adapt (swap one of the four equipped skills mid-fight) | once per fight; twice at 90% or more |

- **Any weapon:** no off-class penalty; the weapon's own multiplier and steadiness apply. Swapping in battle costs 1 AP
  (free each turn for Way of the Hand).
- **Ki is the monk's mana** and powers small versions of other classes' magic, always weaker than the specialist's
  (Ki mend is about half a cleric's heal). Ki strike takes the element the monk chooses, so the monk always has the foe's
  weakness.
- **Growth:** a stat pick is best spent on the lowest score (it raises Balance most); monk gear can carry
  "+1 to your lowest score".
- **What it costs:** no peaks (no jackpot crits, no set bonus that needs one high score, no peak ultimate), ki magic weaker than
  a specialist's, and less added value in a well-built group than another specialist would bring.
- **Why it balances (the mean-floor-ceiling rule):** over the mix of encounters the monk's average should match a
  specialist's within a few percent; its worst encounter is well above a specialist's worst, its best well below a
  specialist's best. In a pack the best tool is used, so specialists shine together and **the monk shines solo and in a pack
  with a hole**: its added value is `max(0, v_monk − best of the others)` in each encounter. If the monk's average ever
  beats the specialists, cut the gap-filling first.
- *Not simulated. The 0.5 + Balance shape, the 70% and 90% thresholds and the class numbers are **U**.*

#### Score-to-stat mapping (J, 21 Oct): every stat has one governing score

Each stat is driven by exactly one score. Where a stat has two natural scores, the one that matches the weapon or spell family
is used, so there is never a choice to make at the sheet.

| stat | governing score | why |
|---|---|---|
| Attack (melee: blades, axes, fists) | STR | strength swings |
| Attack (ranged and daggers) | DEX | aim and speed |
| Special attack (spell power) | the class's casting score: INT (wizard); WIS (cleric, druid, ranger); CHA (bard, sorcerer, warlock, paladin); the monk uses `m̄` | the class decides, not the weapon, so a sorcerer holding a wand still casts with CHA |
| Defence | CON | toughness |
| Special defence (resistance to magic) | WIS | willpower |
| Dodge | DEX | reflex |
| Accuracy | DEX (ranged), STR (melee) | the same score as the attack it modifies |
| Max HP, HP regen | CON | toughness |
| Max mana | governing score of the caster's family | the mana pool scales with its magic |
| Speed | DEX | footwork |
| Initiative | DEX | reaction |
| Crit chance | DEX | precision |
| Threat | CHA | presence draws attention |
| Morale | CHA | leadership in its small form |
| Luck | none, no governing score | luck is luck (the score is not used; it is the one place where a roll is not explained) |
| Corruption | none | it grows from choices, not from a score |
| Fame | CHA | presence |
| Resistance | WIS | the spell or status resist value |

Modifiers go in as $m$ in every formula above. $m_{\text{gov}}$ means "the governing score's modifier", and a stat with no score
uses 0.

**Resistance feeds the spell formula (D).** The resist chance becomes

$$r = \operatorname{clamp}\!\left(0.10 + 0.01\,\max(0,\,L_t - L_c) + 0.01\,\text{Res}_t,\; 0.05,\; 0.40\right) + \frac{s}{100}\,(d-1), \qquad r \le 1$$

so each point of the target's resistance **raises** its chance to resist by one point (corrected 22 Oct: the first version had the sign
backwards), and the resistance stat is no longer decorative. `s` is the spell family's steadiness and `d` the distance in tiles: the
distance term is the one formula's (§4a), outside the 5–40% clamp, so a far spell still reaches "too far" (corrected 22 Oct, P17: the
first version used 1 point a tile, which disagreed with §4a).

**Reach (D).** A melee attack can hit every target within `reach` tiles, but the damage falls off with distance: the target at
tile $j$ takes $\text{dmg} \cdot (1 - 0.25\,\max(0,\,j-1))$, so the extra tiles of a long weapon cost nothing at the front and hurt
only at the edge. Reach is an integer, and the weapon sets its base. A reach of 2 hits the front tile in full and the next tile
at 75%.

**Fame (J).** Fame gains $+1$ per boss win and $+1$ per Smiler piece found, and loses nothing. Its effect is a single threshold
table: at $\text{Fame} \ge 5, 10, 20$ a town greeting changes, and each threshold cuts shop prices by 2% (up to 6%). Fame never
touches combat.

**Corruption thresholds (J).** Corruption $C$ is read against three steps, and each step unlocks but never forces. **Its price (decided
22 Oct):** pack morale loses the pack's mean corruption ÷ 10 (above), so dark power is paid for with the pack's bond. Everything else is in
**`corruption.md`**: every skill's dark version (×1.25, ×1.4 from 50), the deeds that raise and lower it, the reactions.
- $C \ge 10$: the dark versions of the class's own skills.
- $C \ge 25$: the subclass's dark versions; companions and keepers react (one line each); Smudge's stall and the guards' quartermasters sell at −10%.
- $C \ge 50$: the dark capstone; every dark version rises to ×1.4. **Corruption is combat only** (decided 22 Oct): no ending branch and no
  story effect beyond the reactions at 25.

*Open, not simulated:* these mappings and steps are proposals. The numbers (5% per point, 2% per threshold, the steps of 10, 25 and 50) are J and need the playtest to settle them.

#### The new stats: their rules (P15, by arithmetic, 22 Oct)

Each rule below is derived where it can be (D) and priced in power points so gear can carry it (`items.md` §1). Base AP is 2 a turn
and movement is `2 + 0.35 × speed` tiles (3 to 6), both borrowed from the engine (B).

**Special attack and special defence.** Spells use the same damage rule with SpA against SpD:
`dmg = 0.39 × SpA × M × F(SpA, SpD × (1 − piercing))`. Every class splits its attack multiplier between the two by archetype, and
its special defence is its defence times a ward factor (martial 0.8, half-caster 1.0, caster 1.6). About a quarter of the damage
foes deal is magical (J), so the ward factor moves durability only a little; it mostly lets casters stand up to caster foes.

| class | attack | special attack | defence | special defence |
|---|---|---|---|---|
| Fighter | ×1.00 | ×0.50 | ×1.00 | ×0.80 |
| Barbarian | ×1.20 | ×0.50 | ×0.63 | ×0.50 |
| Rogue | ×1.07 | ×0.50 | ×0.78 | ×0.62 |
| Paladin | ×0.95 | ×0.74 | ×0.88 | ×0.88 |
| Ranger | ×1.12 | ×0.60 | ×0.69 | ×0.69 |
| Monk | ×0.93 | ×0.93 | ×0.82 | ×0.82 |
| Cleric | ×0.60 | ×0.77 | ×0.93 | ×1.49 |
| Druid | ×0.60 | ×0.82 | ×0.74 | ×1.18 |
| Bard | ×0.60 | ×0.78 | ×0.82 | ×1.31 |
| Wizard | ×0.60 | ×1.09 | ×0.67 | ×1.07 |
| Sorcerer | ×0.60 | ×1.22 | ×0.67 | ×1.07 |
| Warlock | ×0.60 | ×1.03 | ×0.76 | ×1.22 |

The casters' special attack is their attack multiplier from the class table, so their damage is unchanged; their weapon attack is ×0.6 (the
weapon is an afterthought, as `items.md` already prices holy and instruments). Foes: special defence = defence, and caster
foes use their attack as special attack.

**Initiative (turn order: the timeline, decided 22 Oct).** `I = 10 + DEX modifier + class bonus (ranger +2, rogue +2, monk +1) + gear`;
foes have 10 (quick foes 12, brutes 8). Turn order is **charge time** (`systems.md` §1): a unit's rate is `90 + I`, its charge grows by
the rate each tick, and at 100 or more it acts and keeps the remainder (`CT − 100`). No die: the order is decided and shown. Speed is
movement only. A rate of 104 gains an extra turn every 25, so **+1 initiative = +1% of turns (1 pp)**, the old price.

**Threat (who the foes go for).** A foe picks kobold *i* with probability `threat_i ÷ Σ threat`. **The base threat is the class's
effective HP relative to the fighter (D)**, because attacks spread in proportion to what each kobold can take make the whole
pack last longest (everyone runs out at the same time):

| fighter | barbarian | paladin | ranger | rogue | monk | cleric | druid | bard | wizard | sorcerer | warlock |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.00 | 0.84 | 0.87 | 0.64 | 0.64 | 0.79 | 0.81 | 0.70 | 0.66 | 0.51 | 0.55 | 0.67 |

Then `× (1 + 0.1 × CHA modifier)`, ×2 while guarding or taunting, ×0.5 while unseen. Threat only moves damage between kobolds
(the total is the same), so **threat on gear costs 0 pp**: it is a choice about who takes the hits, not power.

**Armour piercing.** The share of the target's defence a hit ignores, inside the factor. 10% piercing adds +2.4% damage against a
normal foe, +5.5% against a boss and +8.5% against a heavy foe (defence 80% of the attack): weighted (70% normal, 30% heavy) +4.2%,
so **1 pp = 2.4% piercing**. It is a stat that rewards picking your target.

**Morale and AP.** Each kobold has a morale score (an integer): **+1 for its companion quest done and +1 per campfire chat with
it** (its bond, kept), **+1 for each fight won with nobody falling and −1 each time it falls** (its streak, back to zero at an
inn, **never above +3**: decided 22 Oct, P24, so a clean run is rewarded without a dungeon getting easier as it goes). Pack morale is the
mean plus Pip's Leadership, minus a tenth of the pack's mean corruption (decided 22 Oct: the companions don't like dark magic; the mean, so a dark pack is a choice, not a trap, `corruption.md` §1):

$$M_{\text{pack}} = \overline{M} + \frac{\text{Leadership}}{5} - \frac{\overline{C}}{10}, \qquad p = \frac{|M_{\text{pack}}|}{|M_{\text{pack}}| + 6}$$

Each turn each kobold gains 1 AP with chance `p` if morale is positive, or loses 1 with chance `p` if it is negative. On a base of
2 AP that is +7% actions at morale 1, +12.5% at 2, +17% at 3, +25% at 6, +33% at 12: it keeps growing but never runs away.
**+1 morale on one kobold ≈ 7 pp** (the first point; later points are worth less).

**Luck touches everything (Joakim, 22 Oct).** One rule: **every random outcome is tilted in the lucky kobold's favour.** For a
yes/no event whose good outcome (for that kobold) has chance `p`, the odds are multiplied by `q = 1.1^luck`:

$$p' = \frac{p\,q}{p\,q + 1 - p}$$

For a range roll (the ±15% damage spread, loot amounts) the roll `u ∈ [0, 1]` becomes `u^{1/q}`, tilted toward
the good end. When two sides with luck meet (a duel, a lucky foe), `q = 1.1^{(\text{luck}_{\text{self}} - \text{luck}_{\text{other}})}`. So luck reaches its hits,
its crits, its damage rolls, the foes' hits on it (it is missed more), spells and statuses both ways, its
morale AP rolls, and the pack's loot (the pack's mean luck). The mercy rule stays.

What one point does (to a kobold hitting 82%): hit 82% → 83.4%, crit 8% → 8.7%, damage roll +0.7%, so **own output +2.7%** (only
+1.6% to a fighter that already hits 95%: luck is worth most to the kobolds who miss most); foes' hits on it 80% →
78.4%, **damage taken −2%**; its spells resisted 10% → 9.2%; its statuses land 80% → 81.5%. **+1 luck ≈ 5 pp.** It never caps,
it only bends the odds: luck 10 makes an 82% hit 92% and a foe's 80% hit 61%; luck 20 makes them 97% and 37%.

**The gambler synergy (fixed 22 Oct by P22: luck's crit gain is paid by value, so the paragraph below is history).** Because luck now reaches crit chance, it is worth far more to a jackpot build: at a 1% crit
for ×100, +1 luck lifts the crit to 1.1% and the average damage by about +10%, against +2.7% for an ordinary kobold, and it also
makes the jackpot less risky. Luck plus a jackpot is therefore a real build ("the lucky gambler"), in the spirit of rewarding
commitment, but its price of 5 pp is set for an ordinary kobold. If playtests show gamblers stacking luck past everything else,
the structural fix is to price luck on gear by what it does to the wearer's own crit budget, not to cap it.

**Pip's leader stats (Might, Wits, Leadership).** Pip gains **one leader point every second level** (15 by level 30) to put in:
- **Might:** the whole pack's attack and defence × (1 + 0.01 × Might): **5.6 pp per point** across four kobolds.
- **Wits:** the whole pack's special attack and special defence × (1 + 0.01 × Wits): 5.6 pp per point.
- **Leadership:** pack morale + Leadership ÷ 5: **6.5 pp for each of the first five points**, less after (the morale curve
  saturates), so a Leadership Pip is strong early and a Might or Wits Pip strong late.

Fifteen points are worth about +7% to the pack whatever the split, so **foe HP and foe attack carry × (1 + 0.0025 × (L − 1))**
(+7% at level 30): the curve expects Pip to lead. (In the tables since 22 Oct, P29: the model's foe scale is g(L) times this.)

**The curve also expects the bond (D, decided 22 Oct, P24).** Chats and quests are spread over the story, so the expected bond grows
about evenly, `b(L) = 5 (L − 1) / 29` (a companion with every chat and its quest has about 5), and a pack at that bond has `p(b)/2` more
actions. **Every foe's and boss's HP and attack carry a second factor**

$$g(L) = 1 + \frac{1}{2}\cdot\frac{b(L)}{b(L) + 6}$$

×1.05 at level 5, ×1.10 at 10, ×1.14 at 15, ×1.18 at 20, ×1.20 at 25, ×1.23 at 30. XP and gold per foe stay as the tables give them
(they pay for the fight, not for the HP). So a pack that has heard its chats is exactly on the curve, one that skipped them is a little
weaker, and the streak (at most +3) is the reward for clean play on top. *In the model: `P.bond`, `foeScale`.*

*All of this is arithmetic, not simulated; the 25% magical share, the ward factors, the class initiative bonuses and the morale
sources are **J**, and the prices are **U** until playtested.*

- **Why the mana numbers:** a caster should be able to cast about six times per fight for two fights before an ether, a
  fountain or an inn. With an average skill cost of 5.5 that is 66 mana; the L30 figures are that. The engine's current
  mage mana growth (4.5 a level, 146 at level 30) is far too generous for fixed-cost skills and removes all mana tension.
  Mana grows steadily, by the amounts in the table.
- **Each victory restores 10% of max mana**, so a dungeon is sustainable without ethers, but a caster still has to choose.
- **Mixed packs are the point.** A pack of four should be best with one front-liner or healer, one damage dealer and one
  utility. Two of the same class works but loses about 10% effectiveness.

### Skills: the cost rule

Every skill is priced by one rule, so new skills can be added without guessing:

**mana cost = 1 + 3 × (damage multiplier × average targets − 1) + status cost**, rounded.
Status costs: slow +1, **fall +1.5**, root +2, weaken or hex +2, stun +3, confuse +4, **burn +4, poison +4** (all from one rule: about 2 mana per action-equivalent, see the statuses section; rounded at the end). Average targets: single 1, line 2, area 2.2, chain 2.5.
Healing: a single-target heal of 45% of max HP is 3 mana; a group heal is priced per effective target.
Action points: 1 AP for cheap or utility skills, 2 AP for strong or area skills, "ends the turn" for heavy melee.

**The AP economy in one place (from the engine, 22 Oct):** every kobold has **2 AP** a turn (morale may add or take one). A move costs
1 AP (a dash, twice as far, 2). A basic attack **ends the turn**, except with a quick weapon (guns, daggers, fists: 1 AP, ×0.635 each, so
two of them make one normal attack, `items.md` §2) or a heavy one (axes: 2 AP). Skills cost what `skills.md` says (1, 2 or end), mana
limits how often. An item or leaving the board costs 1. So the usual turn is *move and attack*; standing still buys a quick second hit or a
1-AP skill. A morale AP is a second move, a quick hit or a cheap skill: about half an action, as §3 prices it. The model keeps one
attack a turn, which the ×0.635 rule makes equal in damage.

**Hit chance and risk (J, 21 Oct).** The price above is at the skill type's *typical* hit chance against a normal foe (melee 90%, ranged about 66%, spells
100% listed, 95% after resists; see "The one formula"). The base `h` in the rule below is that typical figure for the weapon. A skill that hits less often is not only compensated, it is **paid for its risk**: equal expected damage would make a
gamble no better than a sure thing, and nobody would take it. A hit-or-miss skill has a relative spread
`CV = √((1 − h) ÷ h)` (0.33 at 90%, 0.65 at 70%, 1.0 at 50%), and the skill gets back 25% of its extra spread:

**value = multiplier × (h ÷ base h) × (1 + 0.25 × (CV − CV at base))**, and the mana cost uses `value × targets` in place of `multiplier × targets`.

Needed damage rise when the hit chance falls from 90%: 85% → +8%, 80% → +17%, 70% → +39%, 60% → +68%, 50% → +110%
(equal expectation alone would be +6, +13, +29, +50, +80%). No skill is built under 50% effective hit chance; below that it is
a coin flip, not a choice. The 0.25 is **U**: if playtests show the risky skills are never picked, it goes up. Spells are resisted
not missed (see "Resisted spells"): their base value is 95% of the listed damage and their spread is small
(`CV` 0.16, against 0.33 for a melee attack at 90%), so they sit near the bottom of the premium scale and an
unusually resistible spell is priced from its own base in the same way.

It reproduces the skills the engine already has (Power bonk 3, Clang 4, Ice bolt 3, Fireball 5, Headshot 5, Meteor 8).
**Every class's skills, with their costs by this rule, are in `skills.md`** (the one list; heals and buffs have their own pricing
rules there).

**A skill that costs less than 2 mana is too cheap; one that costs more than 8 should end the fight.**

## 4. Fights: the shape

A fight is *four kobolds against foes* (a pack of four, decided 22 Oct; the foe counts, fight and boss numbers were re-derived for four, `number-audit.md` P19) on a board of about 10 × 13 tiles (bosses 12 × 14, with a boss that
takes up 2 × 2 tiles).

**Big foes and area attacks (J, Joakim's rule, 21 Oct):** a foe that covers several tiles is **hit once for every one of its
tiles inside the area**. A fireball over the corner of a 2 × 2 boss hits it once or twice; centred on it, four times. In the
model a boss takes **3 hits on average** from an area skill (`bossOverlap`), single-target skills still hit once. Why: it
lets the area casters (wizard, sorcerer, and later the cold and fire sub-classes) do real work against a boss instead of
wasting the spell, and it makes *where* you aim worth a thought. Without the rule, glass packs won only 10–25% of boss
fights against 70% for the rest (model, 21 Oct). **Engine:** area skills must count the target's tiles, not its heads; the same
holds for line and cone skills. Each overlapped tile rolls its own hit and crit, so a few big hits stay rarer than one.

| fight | rounds | pack HP lost | notes |
|---|---|---|---|
| normal, on level | 3–4 | 20–30% (target 25%) | a skill or two used; no one falls |
| normal, two levels under | 5 | 45% | the game says it's a hard one |
| patrol or elite (a visible group) | 5 | 35% | worth more XP (×1.5), one tough foe |
| a dungeon floor guardian | 6 | 40% | roughly a small boss; the end of a floor |
| **boss** | 7–12 | 40–55% | four attacks a round (one per kobold), no one-shots; one telegraphed big attack; add-ons on round 4 |

**Pace of a normal fight:** the pack deals about 3.5 × a basic hit per round (skills and an area spell help), and foes have
4 × the basic hit in HP each, so three foes die in about 3.4 rounds (with a pack of four, 4/3 the damage against 4/3 the foes:
the same length). The foes' damage then costs the pack about 0.5 of
one member's HP in total across the fight, spread over the pack: about 16%, and about 25% once skills, crits and misses
are counted. This is what the table of foe attack numbers is built for.

**Fights between a heal:** four normal fights cost about the whole pack's HP, so **a heal is needed every 3–4 fights**:
that is a fountain, an inn, a campfire (one free heal per dungeon visit, half-way), or a potion.

### Bosses

**Two rules make every boss** (`node tools/balance-model.js bosses`; checked on the average of six varied packs). The designer picks only the level and the **target length R in rounds** (7–12); everything else follows:

1. **HP (D):** `k = R × (4.67 + 0.04 × level)` times the basic hit (a pack of four: the pack-of-three rule `R × (3.5 + 0.03 × level)` × 4/3). The pack deals 3.5 basic hits a round against a single boss at level 1 and about 4.4 at level 30 (the big-foe rule lets area casters score, defence takes more off weak attacks as foes toughen). So the boss lasts R rounds.
2. **Pressure (D/J):** a boss makes **one attack per kobold slot each round (four)**, and over the whole fight it deals a **damage budget of `T = 5.73 + 0.053 × level` fighter-HPs** (6.0 at level 5, 7.3 at level 30; the pack-of-three budget × 4/3). Each attack is therefore `T / (4R)` of a fighter's HP, the same size as before. The pack has about 3.2 fighter-HPs of its own, so it must heal, guard, dodge the telegraphed attack or win quickly; the budget grows with level because the pack's toolbox (skills, mana, potions) grows. Constants fitted once to a 70–75% first-try win; the table below is **computed, not fitted boss by boss**.

**Why several attacks and not one big one (J, tested with three; with a pack of four it is four, one per kobold):** the same damage as one 55% blow, but nobody is knocked out from full HP (about 0.00 one-shots per fight against 0.10), the pack is under steady pressure it can answer, and about 1 win in 4 is a close call that was earned. **The telegraphed big attack** (every third round, avoidable by moving) is a relief valve, not extra damage: in the sim, removing it dropped the first boss from 53% to 24%. That is why **no boss is shorter than 7 rounds**: the pack always sees at least two telegraphed turns.

**Fun checks (U, must hold in the sim and in play):** one-shot kills from full HP ≈ 0; about 1 kobold falls per boss (0.8–1.3 in the sim); 24–32% of wins end under 40% pack HP; no round where the pack has nothing useful to do.

**Every pack gets a fair fight** (measured 21 Oct with packs of three, before the pack of four, P19; all 252 real packs: Pip in any class plus two of the seven companions): mean first-try win 73%, 238 of 252 between 50 and 95%, none over 95%, 8 under 30% (all stacking casters and supports). Packs with a bard win 70%, packs without 75%. The game never needs a "must-have" class. Co-op bosses are covered in "Playing together" below.

| boss | level | rounds R | HP multiple k | HP (× g(L)) | each of 4 hits (× g) | % of fighter HP | fighter's HP | first-try win at −2 / 0 / +2 levels (sim, pack of three) | the trick |
|---|---|---|---|---|---|---|---|---|---|
| Grubb the toll boss | 5 | 7 | 34× | 869 | 25 | 23% | 111 | 0% / 70% / 100% | blocks the mill road; cheap, loud, easy to read |
| Snipe the copper snatcher | 8 | 7 | 35× | 1,153 | 35 | 24% | 145 | 9% / 80% / 100% | hides behind cover, rides a copper cart |
| Sunhaven guard captain | 12 | 8 | 41× | 2,304 | 48 | 23% | 208 | 25% / 78% / 98% | drains the oasis tiles one by one |
| Emberreach guard captain | 16 | 8 | 42× | 3,453 | 71 | 25% | 291 | 2% / 80% / 95% | seizes ovens: heat tiles that hurt |
| Snatchclaw (Emberreach) | 18 | 10 | 54× | 5,174 | 64 | 20% | 316 | 45% / 82% / 98% | talks the pack into standing down (a mock "stun") |
| Bun-road toll captain | 18 | 8 | 43× | 4,120 | 80 | 25% | 316 | 45% / 78% / 95% | brings reinforcements every third round |
| Draft sergeant (Frostwick) | 22 | 8 | 44× | 5,733 | 106 | 27% | 393 | 18% / 72% / 89% | tries to draft a pack member for three turns |
| Pier captain (Saltspray) | 26 | 8 | 46× | 6,848 | 130 | 29% | 456 | 43% / 69% / 94% | fights from boats at range |
| Castle commander | 28 | 10 | 58× | 10,185 | 122 | 23% | 522 | 24% / 74% / 89% | a wall of guards that opens in phases |
| Snatchclaw (castle) | 29 | 11 | 64× | 11,480 | 119 | 22% | 550 | 50% / 73% / 89% | goes for the tower fire; the player must hold him |
| Glitterbeak | 30 | 12 | 70× | 13,477 | 113 | 20% | 564 | 47% / 74% / 87% | cold: heals when he eats buns, loses it when the pack's embers glow |

*HP and hits carry the bond factor g(L) (P24, 22 Oct); the win rates were measured before it, against a pack without its bond, so they
still describe a pack that has heard its chats.*

The designed curve was 5 / 35 / 70 / 92 / 99% for −4 / −2 / 0 / +2 / +4 levels. The model gives about **70–82% at equal level, 0–50% two levels under
and 87–100% two over**. So the low side is steeper than designed: two levels under an early boss is almost a sure loss. That is
why the hint after two losses matters, and why the goal bar shows a warning mark when the pack is two levels under (U: playtest
whether this feels fair or whether the low side should be softened).

#### Playing together: bosses and everything else (J, 21 Oct)

*The game is multiplayer: a shared world, personal stories, level sync, and a rule that absence is never punished
(`design.md` §10). Every boss is tuned for one player alone; co-op is help, never a requirement.*

- **No scaling with the number of players (decided 22 Oct):** a fight holds **at most four kobolds and four players**, who
  share the four places (one player brings up to four, two bring two each, four bring one each). Every fight, boss and
  encounter is tuned for four kobolds, so a group plays exactly the fight a solo player does, and **bringing fewer kobolds is
  the player's own handicap**. The earlier rules (+25% per extra player; a set of attacks and 90% HP per extra player) are
  dropped.
- **Level sync:** the helper's pack is brought down to the friend's level for the fight; gear counts as the synced level's.
- **Buffs do not stack across players:** the same buff or hex from two bards or two warlocks does not add; the stronger one
  applies (no "two bards = ×1.56").
- **Downed kobolds can be revived by another player**, an easy and friendly verb for co-op.
- **Credit and loot are personal:** everyone present gets their own XP and drops, so nobody can steal a kill and nobody rolls
  for loot.
- **Strength words on patrols** (Few / Several / Pack / Lots / Overwhelming) are shown **relative to the viewer's synced
  level**, and one group fight counts the same for everyone in the group.
- **Chests, patrols and bounties are personal**: each player opens their own chest and fights their own patrol, so there is no race and
  no griefing. (There are no daily-producing places such as mines or dwellings: the old line about them is cut, 22 Oct.)
- **Turns:** the timeline (`systems.md` §1) decides whose kobold acts; its owner has a 20-second timer, then it guards. (Replaced the
  shared phase on 22 Oct: one turn order for solo and co-op, and initiative keeps its value.)
- *Not simulated; arithmetic only. The sim has no co-op fights.*

Bosses can be retried at once with no loss beyond the potions used. **Each defeat softens that boss's HP by 10%** (up to
three defeats, a small visible "softened" mark, gone after a win). After two defeats the game also offers a hint (Mallow or
the nearest keeper says which skill would help); after three, it offers to step the boss down one notch. Nobody is ever
stuck. *Why this rule and not a more careful number (model, 21 Oct):* a boss is a race, so a 20% error in its HP moves the
first-try win rate from 75% to 45% and **no change to the fight's shape can flatten that** (a half-HP breather was tested
and made no difference at equal difficulty). What does help is correcting after the fact: with softening, a boss that turned
out 20% too hard leaves **5%** of players still stuck after three tries (17% without), a 40% error 23% (61% without), and a
boss tuned right is untouched (1.34 tries on average against 1.29).

## 4a. Hit chances and crits

**The rule in one line:** *positioning changes the odds, levels change the damage, and the number on the screen is the
whole truth.* A player should be able to look at a foe, read "65%", and know exactly why.

**What we want the player to feel:** a miss is *bad luck*, never *unfair*. About one attack in six misses (we aim for an
average hit rate of **80–85%**); the misses that hurt most are the ones the player chose to risk (a shot from far away, at a
foe in cover), not ones they could not see coming.

### The one formula (J, Joakim's rule, 21 Oct)

**chance = 100% + the attacker's accuracy − the target's dodge − cover − distance − the multiple-attack penalty, clamped
between 0% and 100%.**

- **The multiple-attack penalty (Pathfinder, decided 22 Oct):** the first attack a kobold makes in a turn takes 0, the second
  −5, the third and later −10. Light weapons (daggers, fists) take 0, −4, −8. It counts every separate attack roll in the
  turn, including the hits of a multi-hit skill; an area skill's targets are one attack and keep their own −10 per target.

There is no "90% base for melee". 90% is simply what a blade does against the average foe, which has 10% dodge. The
chance comes from the *target*, so it can be read off the foe:

- **A target with no dodge is hit 100% of the time by melee.** A slow brute, a sleeping foe, a stunned or rooted foe
  (its dodge counts as 0), a surprised foe: a swing from arm's length simply lands.
- **Melee has no distance and ignores cover** (you are next to the foe).
- **Ranged has no maximum range, only a falling chance.** Every tile of distance beyond the first costs the weapon's
  *steadiness* (percentage points per tile), so a far shot is a gamble and a very far one reaches 0% and is not offered
  ("too far"). Only **line of sight** limits a shot. Cover subtracts as before.
- **Anything that raises accuracy also raises range**, because they are the same number. A weapon's reach is simply the
  distance at which the chance still holds: `tiles at 50% against a normal foe = 1 + (40 + accuracy) ÷ steadiness`. An
  accuracy bonus of +10 adds `10 ÷ steadiness` tiles (+2 at steadiness 5); Aimed shot (+20) adds 4.
- **Spells follow the same rule, with the target's *resistance* in place of dodge.** The chance a spell *lands* is
  `100% + accuracy − the target's resistance − steadiness × (tiles − 1)`; a spell that does
  not land is *resisted* and deals half damage (see "Resisted spells"). So a far spell is resisted more often, but it is
  never worth less than half, and it reaches 0% and is not offered ("too far") only at extreme distance. Spells ignore
  cover (they fly over it) but not line of sight. **Healing and other spells on friends never roll and have no distance
  penalty**: they reach anyone in sight.
- **Magic steadiness, by family** (`items.md`): wands 3, orbs 4 (a little unstable), teapots 2.5 (steady), holy 5, nature 4,
  instruments 5 points per tile. Reach at 50% landed against a normal foe is `1 + 40 ÷ steadiness`: wands 14 tiles, orbs 11,
  teapots 17, holy 9, nature 11, instruments 9. A wand's expected damage is 95% of the listed number at 1 tile, 89% at 5,
  83% at 9, 77% at 13 (`0.5 × (1 + chance landed)`). Area spells measure the distance to their centre and each target
  rolls its own resistance.
- **Unseen attackers are easier to hit.** If the target cannot see the attacker, **its dodge (or resistance) counts as half**
  and the attacker gets +10 crit. A foe with no dodge gains nothing from not seeing, and gains nothing it did not already
  have from being unaware (see below).

**Steadiness, by weapon** (the guns family, `items.md`): the higher the tier, the farther it shoots with the same accuracy.

| weapon | steadiness (points per tile) | reach at 50% vs a normal foe | feel |
|---|---|---|---|
| Popgun | 6 | 7 tiles | cheap, short |
| Reed bow | 5 | 9 | the all-rounder |
| Blunderbuss | 12, and +15 accuracy | 5 | scatter: deadly close, hopeless far |
| Longbow | 4 | 11 | the sniper's start |
| Frost musket | 3.5 | 12 | |
| Ember cannon | 3 | 14 (the whole board) | |

Example, Reed bow against a normal foe in the open: 90% at 1 tile, 70% at 5, 50% at 9, 30% at 13, 0% at 19 tiles.

**Dodge** is what the target brings:

| target | dodge | examples |
|---|---|---|
| brute, slow, big | 0–5% | most bosses are big (5%), grubs, golems |
| normal foe | **10%** | so a blade hits 90% on average |
| quick or small | 20% | scouts, rats, imps |
| elite or patrol leader | 25% | |
| the kobolds | 10% base (small and quick) plus gear | boots, cloaks and rings add; by mid-game about 20%, so foes hit about 80% |

Total dodge from gear and skills is capped at 30% (before guarding). Dodge is a defence against *being hit*; defence
(the stat) still takes damage off a hit, so a heavy foe is easy to hit and hard to hurt, a nimble one the other way round.

### Class accuracy (added to accuracy; it also extends range)

| class | modifier | reason |
|---|---|---|
| Fighter | +5 | the reliable one |
| Barbarian | −5 | swings wild; makes up for it in damage |
| Paladin | 0 | |
| Ranger | +10 (ranged) | the marksman: about 2 extra tiles of reach |
| Rogue | +5 | strikes where it counts (an unaware or stunned foe has no dodge, so the old "+10 against flanked or unaware" is no longer needed) |
| Monk | +5 | trained |
| Cleric, Druid, Bard | −10 on weapon attacks | weapons are an afterthought; spells are only rarely resisted |
| Wizard, Sorcerer, Warlock | none (weapon attacks are spells) | |

### Tactical modifiers (the same for both sides)

Everything the player can change by moving or choosing:

| situation | modifier | notes |
|---|---|---|
| target in **half cover** | **−20** | ranged only; melee ignores cover |
| target in **full cover** | **−40** | ranged only |
| target **flanked** (an ally on the opposite side) | cover is ignored; **+15 crit** | the reward for positioning |
| distance (ranged only) | **steadiness × (tiles − 1)** | see "The one formula"; blunderbuss has +15 accuracy |
| target in **tall grass**, not adjacent | −10 | |
| target is **guarding** | dodge +25 (so −25 to be hit), and −25% damage taken | a real defensive choice |
| target is **stunned or rooted** | dodge counts as 0 | it cannot dodge; a foe with no other dodge is hit 100% |
| target **unaware** (surprise) | dodge counts as 0, and +10 crit | the ambush bonus |
| attacker **unseen** by the target (hidden in tall grass or a bush, in darkness or fog, invisible, or out of the foe's sight range) | target's dodge or resistance counts as **half**, and +10 crit; the attack reveals the attacker | "you cannot dodge what you cannot see"; the same for both sides |
| target's **dodge** (kind, gear, skill) | −1 per 1% dodge, gear and skill dodge capped at 30% | |
| attacker's **free hit** (leaving reach) | −10 | |
| attacker on **watch** | −15 | |
| attacker is **weakened** | −10 | |

### Skill modifiers (accuracy; each also extends the skill's reach)

| skill | hit modifier | note |
|---|---|---|
| Power bonk, Clang, Shield bash, Palm strike, Ki strike | 0 | |
| Aimed shot | +20 | the careful one |
| Headshot | +15 | |
| Arrow rain, Volley (area, ranged) | −10 *per target* | each foe rolls separately; coverage costs reliability |
| Cleave, Whirlwind, Stomp (area, melee) | −10 per target | |
| Flurry | three rolls at 0 / −4 / −8 (the multiple-attack penalty for fists) | on average about 2.6 hits of 3 against a normal foe |
| Reckless swing | +10 | the recklessness is in the drawback, not the aim |
| Sneak attack | ×2.4 on a stunned, flanked, **unseen** or unaware foe (a foe with no dodge needs no accuracy bonus) | otherwise 0 |
| Smite, spells, Teapot blast, Hex | never miss; resisted 10% of the time for half damage | see "Resisted spells" |
| Traps | no roll | they spring when stepped on |

### Statuses (stun, fall, slow, root, hex, weaken, confuse, burn, poison)

A status applied *by a damaging skill* happens if the hit lands. A *pure* status skill (Lullaby, Vine snare, Hex, Rumour)
rolls a **resist check**:

**chance = 80% − 2 per level the target is above the caster − the target's resistance + 2 × the caster's CHA modifier (never
under 40%)**, then
**normal foe ×1.0, elite ×0.8, boss ×0.5**.

| target | stun, root, confuse chance (same level) | duration |
|---|---|---|
| normal foe | 80% | 1–2 turns |
| elite or patrol leader | 64% | 1 turn |
| boss | 40% | 1 turn (never 2) |

So a boss can be stunned but only as a gamble; a stun is never the plan, only a bonus. The stunned foe is the exception
to "no hidden levels": its resistance is shown as "likely" / "unlikely" on the skill.

#### Resisted spells (J, Joakim's rule, 21 Oct)

**Every attack rolls: a weapon rolls to hit; a spell rolls to land against the target's resistance. A spell that fails is
*resisted*, not missed: it deals half damage and still costs its mana.** One resistance rule serves damage spells and
status spells alike:

- **Damage spell, chance to be resisted = 10% + 1 per level the target is above the caster, plus the distance penalty** (the
  resistance part never under 5% or over 40%). At equal level and point blank the expected damage is 0.9 + 0.1 × 0.5 = **95%**
  of the listed number; at the average spell distance (3–4 tiles) about **89%**.
- **Status spell, chance to be resisted** = the existing rule (20% + 2 per level above, times 1.0 / 0.8 / 0.5 for normal foe,
  elite, boss), i.e. exactly twice the damage-spell figure. A resisted status simply fails.
- **Element:** a foe weak to the spell's element resists it 10 points less often (never under 5%); a resistant foe 15
  points more often (never over 40%). Every town's foes have one weakness and one resistance (Emberreach: weak to frost,
  resistant to fire; Frostwick the reverse), so bringing the right caster is a real choice.
- **Bosses resist damage spells no more than other foes** (only their statuses are harder to land), so the boss tables
  stand. A damage spell shows the chance it lands as a number, "78%, else half", like any hit (22 Oct: one formula, one way of showing
  it); only *pure status* skills keep "likely / maybe / unlikely", because a boss's status resistance is the one hidden number.
- *Not simulated: arithmetic only. The model's spells still never miss, about an 11% difference in caster damage at the
  average distance; rerun the class and boss checks when the rule reaches the engine (casters may need slightly more
  power, or shorter average distances on the boards).*

#### One price list for statuses and terrain (J, by arithmetic, 21 Oct)

**The unit is the action-equivalent (AE): the share of one foe's turn a status removes, summed over its duration. A spell
costs about 2 mana per AE, so a more crippling status is always dearer.**

| status | what it takes away | AE | mana |
|---|---|---|---|
| slow | part of its movement, 2 turns | 0.5 | +1 |
| **fall** (prone) | half its next turn to stand up, and it is easier to hit (+15) until it stands | 0.75 | +1.5 |
| root | its movement for 2 turns (it can still attack) | 1 | +2 |
| weaken, hex | a quarter of its attack, or a quarter more damage taken | 1 | +2 |
| **stun** | its whole turn, for 1–2 turns | 1.5 | +3 |
| confuse | its turn, and it hits its own friends | 2 | +4 |
| **burn** (Pokémon-style) | 1/16 of the target's HP each turn for 3 turns (0.75 basic hits in all) and weaken (−25% attack) | 0.75 hits + 1 | +4 |
| **poison** (Pokémon-style) | 1/8 of the target's HP each turn for 3 turns (1.5 basic hits in all) | 1.5 hits | +4 |

**Burn and poison (decided 22 Oct).** Damage over time is a share of the target's max HP, **but never more than that share of a
standard foe's HP at the target's level** (4 basic hits), so a boss with 50 basic hits of HP takes the same burn as a normal
foe, not twelve times more. The same status does not stack: a new burn on a burning foe refreshes the 3 turns. A resisted
burn or poison (see "Resisted spells") does half. Fire skills and hot oven tiles burn; Sourdough-starter drains and some
foes' bites poison. Their price is the cost rule's 3 mana per basic hit of damage, plus 2 for burn's weaken.

So **fall is always cheaper than stun**, and a new status must be placed on this ladder by what it takes away, not by feel.

**Terrain uses the same ladder but is weaker than a spell, because no one pays mana for it.** A terrain hazard (ice, mud,
oil, hot oven tiles) applies a status when a creature *enters* the tile:

- **Ice → fall.** Chance = **40% − 1 per level the creature is above the terrain's level** (never under 15%), bosses ×0.5. This is
  half of the same-level spell chance (80% − 2 per level). Stable footing is easy to keep: a hero a few levels above the
  ice falls rarely, and the slope teaches the player to go round or take it slowly.
- **One check per creature per turn**, so nobody falls twice in a turn.
- **It works on both sides**, so the player can lure foes onto ice as well as avoid it.
- **Value per tile entered** = chance × AE = 0.4 × 0.75 = **0.3 AE** at equal level, against 1.2 AE for a same-level stun
  spell: terrain is about **a quarter** of the power of a spell of the same status. A route or dungeon may therefore carry
  terrain hazards without moving the fight budget (section 5); a hazard that costs more than 0.3 AE per tile must be priced
  as a skill.
- Other terrain follows the ladder: mud = slow (chance 60%, 0.5 AE), a hot oven tile = damage instead of a status (priced as
  a fraction of a hit; the Emberreach captain's "heat tiles" use this).

*Not simulated: this is arithmetic only, and the engine has none of it yet (no prone state, no terrain statuses).*

### Limits

- **Chances run from 0% to 100%, with no soft ceiling or floor.** A hit is certain when the target cannot dodge, and that is
  fine: the *risk* in the game comes from what the player chooses (a far shot, a foe in cover, a dodgy target), not from
  a random 5% on every swing. A shot that would be under 15% is drawn in red with a "long shot" mark; one at 0% is not
  offered ("too far"). At point blank the worst case is 100 − 30 (dodge cap) − 40 (full cover) = **30%**, so nothing nearby is a
  trap. The mercy rule only matters below 100%.
- **No accuracy by level.** The level gap shows up in damage and HP (the level table in section 3), not in the odds.
  This keeps the numbers readable.
- **Bosses' big, telegraphed attacks do not roll.** They are avoided by moving out of the shown area; if you are in it you
  are hit. The danger is a decision, not a die.
- **Mercy rule (player only):** after **two misses in a row** by the same kobold, its next attack gets **+15%**. It is shown
  in the breakdown ("mercy +15"). It evens out streaks of bad luck without changing the average much (about +0.5% overall; it triggers about once every three fights).
  *(P6, 22 Oct: kept as a feel rule. With luck now tilting every roll and chances running 0–100%, mercy is the only
  streak protection; it adds about +0.5% on average and is shown in the breakdown. A chance pushed past 100% stays at 100%.)*

### Damage: the attack-versus-defence factor (HoMM3, decided 22 Oct)

$$\Delta = 40\cdot\frac{A - D'}{A + D'}, \qquad F = \begin{cases} 1 + 0.05\,\Delta, & \Delta \ge 0 \\ \max(0.3,\; 1 + 0.025\,\Delta), & \Delta < 0 \end{cases}, \qquad \text{dmg} = \max\bigl(1,\; 0.39\cdot A\cdot M\cdot F\bigr)\cdot U(0.85,\,1.15)$$

`A` is the attacker's attack (special attack for spells), `D' = D × (1 − armour piercing)` the target's defence (special
defence for spells), `M` the skill multiplier. HoMM3 adds 5% per point of attack above defence and takes 2.5% per point below;
because our stats grow with level, the gap is measured **relative to the two stats** (Δ runs from −40 to +40), so the factor
behaves the same at level 1 and level 30. It runs from **×0.3** (a hopeless attack still scratches) to **×3** (no defence at
all), never reaches zero, and every point of defence or piercing matters a little instead of a flat wall.

Check against the level table (fighter against an on-level foe): L1 `0.39 × 9 × 2.60 = 9.1` (table 9), L10 `0.39 × 49 × 2.32 = 44.4`
(44), L30 `0.39 × 134 × 2.29 = 119.6` (119). The foes' attacks against kobolds come out about 20% lower than the table's
16 / 14 / 12% targets and must be re-derived (P20). *The 40, 0.05, 0.025, 0.3 are HoMM3's shape; 0.39 is fitted.*

### Crits

| | value |
|---|---|
| base crit chance | **8%** |
| crit damage | **×1.5** base, no upper limit |
| flanked target | +15 (paid by value: `+15 × 0.5 ÷ (D − β)` for a crit build, below) |
| unaware target | +10 (the same) |
| gear and talents | priced by expected value: 1 power point = +1% expected damage, i.e. `100 × Δ[c × (D − 1)]` pp (so +2% crit chance at ×1.5 is 1 pp, as before) |
| crit chance | a probability: never above 100%; luck tilts it like every other roll |
| spells | can crit at the same chance and multiplier |

On a normal fight a crit adds about 4% damage (8% × 0.5): for most kobolds crits are a pleasant flash. But **crit builds
are a real choice**, and they are paid for their risk.

#### Crit builds: the risk is rewarded (J, Joakim's rule, 21 Oct)

A crit build gives up steady damage for rare, huge hits. Equal average damage would make that gamble no better than a
sure thing, so **a riskier crit is worth more than its plain average**, by the same idea as low-hit-chance skills
(section 3, "Hit chance and risk").

**The trade.** A normal hit deals `β` of the usual damage, a crit deals `D` times the usual damage, crit chance `c`:

$$E = (1-c)\,\beta + c\,D, \qquad \sigma = (D-\beta)\sqrt{c\,(1-c)}, \qquad \text{CV} = \sigma / E$$

**The premium** (saturating, so no build becomes free):

$$\text{premium} = 1 + \lambda\cdot\frac{\text{CV}}{1 + \text{CV}/4}$$

- **Trades that cost nothing** (an item or talent that cuts normal damage to raise crit damage): `λ = 0.15`, and the crit
  multiplier must be the **rewarded D**, the one for which `E = premium`.
- **Crit bought with power points** (gear that adds crit chance or crit damage without a drawback): cost in pp is
  `100 × (E − 1) ÷ premium` with `λ = 0.5`, priced at a crit chance of at least 1% (an item with less is charged as if it had
  1%), so a near-impossible lottery cannot buy a large average for nothing.

**Rewarded crit multiplier for a free trade (λ = 0.15)**, with how often a kobold lands no crit at all in a 10-round boss fight:

| crit chance | normal hit β | break-even D | **rewarded D** | average damage | no crit in 10 attacks |
|---|---|---|---|---|---|
| 50% | ×0.50 | ×1.5 | **×1.6** | ×1.07 | 0% |
| 50% | ×0.10 | ×1.9 | **×2.1** | ×1.11 | 0% |
| 30% | ×0.50 | ×2.2 | **×2.5** | ×1.10 | 3% |
| 15% | ×0.50 | ×3.8 | **×4.8** | ×1.15 | 20% |
| 15% | ×0.10 | ×6.1 | **×7.5** | ×1.21 | 20% |
| 8% | ×0.50 | ×6.8 | **×9.2** | ×1.20 | 43% |
| 8% | ×0.10 | ×11 | **×15** | ×1.26 | 43% |
| 3% | ×0.50 | ×17 | **×26** | ×1.28 | 74% |
| 3% | ×0.10 | ×30 | **×42** | ×1.34 | 74% |
| 1% | ×0.50 | ×51 | **×87** | ×1.37 | 90% |
| 1% | ×0.25 | ×75 | **×116** | ×1.40 | 90% |
| 1% | ×0.10 | ×90 | **×132** | ×1.42 | 90% |

(Break-even is `D = (1 − (1 − c) β) ÷ c`.) **The rule:** anything that lowers normal damage must raise crit damage to the
rewarded `D` for the crit chance it is used with. Halving normal damage needs about ×2 only when crits come half the time;
at 8% it needs ×9. A ×100 crit is a real build: about a 1% chance with normal hits cut to a quarter, +40% damage on
average, and nine boss fights in ten without a single crit.

**Positional crit bonuses by value (decided 22 Oct, P22).** Flanked (+15) and unseen (+10) *add* to the crit chance, which is
worth +7.5% damage to an ordinary kobold and a fortune to a jackpot build: a 1% build at ×116 that flanks lands 16% crits, and on
the average board it deals **×4.6** a plain fighter instead of the table's ×1.4. The structural fix: **a bonus to crit chance is a
bonus to expected damage, paid in the build's own currency**, so it is worth the same to every build:

$$\Delta c' = \Delta c \cdot \frac{0.5}{D - \beta}$$

(flanked +15 at ×1.5; +0.065 at ×116 with normal hits ×0.25). On the board this puts the builds back on the table: ×1.15, ×1.30 and
×1.35 for the 8%, 3% and 1% rows (×1.20, ×1.36, ×1.41 in the table). The same rule would fix the gambler synergy (luck tilting crit
chance, §3). **Luck's tilt on crit chance is paid the same way**, so the gambler synergy is gone: a point of luck is worth the same to a jackpot
as to anyone. Bought crit chance (gear, talents) still adds directly, since its price already depends on the build's D. In the model:
`P.critRule = 'value'`.

**Open (proposed, not decided):** overkill carrying over to the nearest foe within 1 tile, so a jackpot can clear a group,
and boss phase lines (75 / 50 / 25%) that one hit cannot cross more than one of, with a crit that crosses a line costing the
boss its next turn. Both cut the realized value of the biggest crits a little below the table.

*Arithmetic only, not simulated. λ (0.15 free, 0.5 bought), the 4 in the saturation and the 1% pricing floor are **U**.*

### What the average comes to (the check)

For an average pack in an average fight, the attacks are about 40% melee, 40% ranged and 20% spells:

| | share | average chance |
|---|---|---|
| melee (100 − foe dodge 10 + class) | 40% | 90% |
| ranged (100 − dodge 10 − cover − distance) | 40% | about 66% (average shot 4–5 tiles at steadiness about 5.5 costs about 19; the average foe is in half cover 30% of the time, about 6) |
| spells (resisted for half, more often far away) | 20% | about 89% of the damage at 3–4 tiles |
| **overall** | | **40%×90 + 40%×66 + 20%×89 = 80%** |

*With each class's own accuracy and steadiness (the model's `rules` check, 22 Oct): melee 88%, ranged (the ranger) 77%, spells' damage
91%, **overall 84%**.* That is inside the 80–85% target (the table above, without class accuracy, is the bottom of it; it was 82% before spells followed distance), and the damage model in section 3 (which assumed 85%) is close enough. **If the sim finds
the average below 78%, fights run too long and the first fix is less cover on the boards, not a higher base chance.**
In a 3–4 round fight a pack makes about 14 attacks, so the expected number of misses is **2.5**; roughly 6% of fights have
no misses at all and about 9% have five or more.

### How it is shown

- Each foe shows its hit chance as a small badge when the active kobold could attack it: **white at 80% or more, yellow
  50–79%, orange under 50%**, with a shape as well as a colour. It is the real number, never rounded for comfort.
- **Press and hold** shows the breakdown in plain words: "100, foe dodge −10, half cover −20, 6 tiles −25, mercy +15 =
  60%", plus the crit chance and the damage range, and a skull badge when the hit would kill.
- A pure status skill shows "likely" (65% or more), "maybe" (40–64%) or "unlikely" (under 40%) instead of a number.
- Enemies' chance to hit *you* is shown on your kobold when you hover or hold it, the same way.

## 5. Encounters, routes and the distance walked

**How encounters work (22 Oct, matched to the maps):** on routes, **only tall grass rolls** (the desert's dunes and the snowfield's
drifts are their kinds of tall grass), so the player can always see where a fight can start and choose to walk round it. **Every
route's road crosses tall grass for 40% of its middle** (as R1 was drawn; the map's goals in the editor check its length and the grass-free ends), and a grass step rolls at the route's
chance ÷ 0.4, so the averages below still hold for a player who keeps to the road. Off-road grass rolls the same, so a player who wants
more fights wades in. Dungeon floors roll on every step (caves have no grass).

| ground | chance per road step (average) | per tall-grass step | one fight about every |
|---|---|---|---|
| town | 0 | 0 | never |
| grass route | 3.0% | 7.5% | 33 steps |
| desert, pass, snow | 3.5% | 8.75% | 29 steps |
| the march (R6, backwards) | 2.0% | 5.0% | 50 steps |
| dungeon floor | 6.0% (every step) | | 17 steps |

The engine's current rate (6% a step on every route) is far too high for 160-step routes and is replaced by the table above.

**Four rules protect the feeling of a stroll:**
1. The first 10 steps and the last 10 steps of a route are always safe (leaving or entering a town never starts a fight).
2. At least **12 steps** between two fights, and never two fights back to back.
3. The first fight on a route always shows that route's newest foe, so the player learns it once.
4. Any normal fight can be left through an exit tile for one move. Fleeing gives no XP and no gold, so running from
   everything costs about a level per stretch.

**Walking speed:** 4.6 tiles per second in a straight line. With turns and detours a route takes about 1.4 times longer.

### Routes

| route | from → to | path length (steps) | chance per step | steps per fight | one-way fights | one-way walking time | levels of the foes |
|---|---|---|---|---|---|---|---|
| R1 | Hearthspire → Pebblebrook | 120 | 3.0% | 33 | **3.0** | 37 s | 3–6 |
| R2 | Pebblebrook → Sunhaven | 160 | 3.5% | 29 | **4.9** | 49 s | 8–11 |
| R3 | Sunhaven → Emberreach | 170 | 3.5% | 29 | **5.3** | 52 s | 13–16 |
| R4 | Emberreach → Hearthspire (bun road) | 150 | 3.0% | 33 | **3.9** | 46 s | 16–18 |
| R5 | Hearthspire → Frostwick | 160 | 3.5% | 29 | **4.9** | 49 s | 19–22 |
| R6 | Hearthspire → Saltspray | 160 | 3.0% | 33 | **4.2** | 49 s | 23–25 |
| R7 | Saltspray → islands (boat) | 90 | 3.0% | 33 | **2.1** | 27 s | 25–27 |

(One-way fights = (path length − 20 safe steps) × chance per step.) So **a route is 3 to 5 fights and under a minute of
walking, about 4 to 6 minutes with the fights.** Routes are short in distance because the world is 420 × 340 tiles; they are
long in *content* because of the places beside them.

### The town areas (new, one per town)

A route alone cannot supply the fights the levels need, so each town has one **area**, a small dungeon beside it, where the
rest of the stretch's fights happen:

| town | area | floors | steps per floor | chance per step | fights in one full visit | what's in it |
|---|---|---|---|---|---|---|
| Pebblebrook | **the mine** | 3 | 45 | 6% | 6.9 | the keeper's miners, copper, Snipe's cart, a campfire on floor 2 |
| Sunhaven | **the honey cellars** | 3 | 45 | 6% | 9.9 (1.2 visits) | drained cisterns, the signs' hidden room, a campfire |
| Emberreach | **the crater** | 3 | 45 | 6% | 9.9 (1.2 visits) | the cold ovens, Glitterbeak's first shadow, a campfire |
| Frostwick | **the ice cellars** | 3 | 45 | 6% | 9.9 (1.2 visits) | the flour store, the draft camp's outpost, a campfire |
| Saltspray | **the shipwreck** (2 floors) and **the island cave** (by boat) | 2 and 3 | 45 | 6% | 6.0 and 4.8 | pearls, the ember-lantern |

Hearthspire has no area; its fights are scripted set-pieces. **They are the one exception to "tuned for four":** act 1's set-pieces
(the cellar, the yard drill) are tuned for the pack the story gives at that moment (Pip alone, then three), since Bork only joins at the gate.

### The fight budget (the main path)

This is the check that the levels, the XP and the places add up. *Needed* = the fights the pack must win to reach the
stretch's end level, after bosses and challenges are counted. **XP is paid per basic hit of foe HP defeated, counted before the bond factor g(L) (P4, D, 22 Oct)**, one rule for every foe,
so a boss is worth its HP: 2.2 to 4.1 fights' XP (Snipe 2.2 … Glitterbeak 4.1; 32 in all, against the old flat 4 each = 44).
Challenges stay at 3 fights' XP (J). The share of XP from random fights becomes **0.75** (was 0.8), and the XP per foe formula
uses it. *Planned* = what the
places supply. **Planned ÷ needed should be 1.05–1.20**: a player who fights 85% of what they meet keeps pace; someone who
runs from more falls behind, someone who does the optional content is ahead.

| stretch | levels | fights to level | from bosses and challenges | fights needed | fights planned | planned ÷ needed | planned fights come from |
|---|---|---|---|---|---|---|---|
| 1 Hearthspire act 1 | 1→3 | 5 | 0 | 5 | 5.9 | 1.18 | 5 set-pieces (the cellar ×2, the yard drill ×2, outside the gate; `slice-dialogue.md` §1) and R1 start (0.9) |
| 2 R1 + Pebblebrook | 3→8 | 25 | 7.7 (Grubb, Snipe, 1 challenge) | 17.3 | 19.3 | 1.12 | R1 ×2 passes 6.0, mill road 2.4, the mine 6.9, 1 lookout, **+2 patrols** |
| 3 R2 + Sunhaven | 8→13 | 30 | 5.6 (1 boss, 1 challenge) | 24.4 | 26.7 | 1.09 | R2 ×2 9.8, the cellars 8.3, the oasis 2.1, 6 patrols |
| 4 R3 + Emberreach | 13→18 | 35 | 8.6 (2 bosses, 1 challenge) | 26.4 | 28.4 | 1.08 | R3 ×2 10.5, the crater 8.3, the fields 2.1, 7 patrols |
| 5 R4 + home + Ordeal | 18→19 | 7 | 2.5 (1 boss) | 4.5 | 5.4 | 1.21 | R4 once 3.9, **+1 patrol** (a deliberately thin stretch) |
| 6 R5 + Frostwick | 19→23 | 28 | 5.6 (1 boss, 1 challenge) | 22.4 | 24.7 | 1.10 | R5 ×2 9.8, the ice cellars 8.3, the draft outpost 3, the snow 2.1, **+1 patrol** |
| 7 R6, R7 + Saltspray | 23→27 | 32 | 5.7 (1 boss, 1 challenge) | 26.3 | 28.3 | 1.08 | R6 ×2 8.4, the shipwreck 5.0, the island cave 4.8, R7 2.1, 8 patrols |
| 8 The march + finale | 27→30 | 24 | 11.3 (3 bosses) | 12.8 | 14.8 | 1.16 | the march 2.8, 9 set-piece fights in the castle (mandatory), **+2 patrols** on the march |
| **total** | 1→30 | **186** | 47 | 139 | **153.5** + 11 bosses | | |

So the whole main story is about **142 normal fights and 11 boss fights**: one normal fight about every 3 minutes of play (by count, section 2).

**A "visible patrol"** is a group of foes standing on the route you can see and avoid or walk up to. They give 1.5× XP and
are the way a player who dislikes random fights can still keep pace (it is also why route fights can be lower than a pure
random design would need).

## 6. Grind, optional content and being stuck

**There is no required grinding.** A player who fights about 85% of the random fights they meet and wins the bosses is
within one level of the end level of every stretch.

**Optional content** (what you do by choice), **by count** in Pebblebrook (22 Oct; every town fills the same kit):

| what | minutes |
|---|---|
| side-quest and route-extra talk (script §2.1, §3.14) | 0.6 |
| bounty hunts: 2, one fight each (the named foe and its escort) | 2.9 |
| the hidden trial: Old Shellback (elite × 1.5 HP, one fight) | 2.2 |
| the goat walked home (R1 to the farms, by the maps) | 0.5 |
| the ghost of the mill (the mill, a chick) | 0.2 |
| the seed swap (moss tufts drop in fights already fought; one visit) | 0.2 |
| five chests (about 20 steps off the path each) | 0.8 |
| **optional, by count** | **7** |

**About 7 minutes a town stretch, under an hour in the whole game** (five full town stretches; act 1, the Ordeal stretch and the
march have a little). The town kit's old "about 64 minutes" was a target with nothing in it; the count is what the content gives.
**A bounty hunt is one fight** (the named foe and its escort, 1.5× XP), as the town kit and the board describe. Counted in fights' XP,
a completionist gains about **+20% XP** (two hunts at 1.5×, the trial at about 2 fights, against 25 fights to level a stretch) and
the trial's unique piece: about one level ahead, as designed.

**If the pack is stuck** (two or more levels under a boss's level): the game says so (a warning mark on the goal bar, a
villager's hint). A level takes 5–8 fights, about 7 to 12 minutes at 87 s a fight. **The worst-case top-up is about 20 minutes**, and the
bounty board is the fastest way (a named fight per hunt, 1.5× XP). We aim for an *average* top-up of zero.

**Post-game (small; its length will be what its content gives, counted when it is designed):** the islands' trials and Glitterbeak's hoard (minimal version: `systems.md` §15), level 30 gear, no new levels.

## 7. Gold

**Income** comes from fights (always), bosses (6 fights' worth each), chests, main quests and selling. The player can never
be softlocked by gold: potions are cheap, and half the gold is kept after losing.

| stretch | fight gold | bosses | chests | main quests | potions (−25%) | net | next gear tier (a pack of 3, all slots) | shops cover |
|---|---|---|---|---|---|---|---|---|
| 1 | 46 | 0 | 90 | 80 | −54 | **162** | T1: 528 | 31% (starter gear is free) |
| 2 | 515 | 324 | 243 | 216 | −325 | **974** | T2: 1,426 | **68%** |
| 3 | 1,170 | 252 | 378 | 336 | −534 | **1,602** | T3: 2,218 | **72%** |
| 4 | 2,016 | 732 | 549 | 488 | −946 | **2,839** | T4: 3,379 | **84%** |
| 5 | 469 | 420 | 630 | 560 | −520 | **1,559** | T4 (left over): 3,379 | 46% (spent in stretch 4) |
| 6 | 2,107 | 462 | 693 | 616 | −970 | **2,909** | T5: 4,382 | **66%** |
| 7 | 2,816 | 540 | 810 | 720 | −1,222 | **3,665** | T5 (rest): 4,382 | **84%** |
| 8 | 2,376 | 1,836 | 918 | 816 | −1,487 | **4,460** | T6: 5,386 | **83%** |

- **Gold per fight (F)** is the unit everything is priced in: 8 at level 1, 18 at level 5, 39 at level 10, 58 at level 15,
  74 at level 20, 90 at level 25, 106 at level 30.
- **Shops cover about 70–85% of the next gear tier.** The rest comes from drops (about 8% of fights), chests, crafting
  and selling spare gear (35% of the shop price). The optional content adds 35% on top, enough to buy nearly all of it.
  **Gold should always feel slightly short and never hopeless.**
- **Prices are multiples of F at the tier's entry level** (`items.md` has the full table): weapon 4F, armour 2.5F,
  shield 1.8F, neck 1.8F, helm, boots, cloak and rings 1.5F each, a potion 0.4F, an ether 0.5F, a Phoenix feather 2.5F,
  an inn bed 0.5F (never under 10). One kobold's full set of one tier is about 17.6F; a pack of four is 70 F₀. Prices are in F₀, the
  pack-of-three unit, while income F grows by 4/3 with the extra foes, so the coverage figures here hold for a pack of four.
- **Income per stretch (net of potions)** is the table's "net" column; per counted hour that is about 930 gold in stretch 2 and about
  2,900 in stretch 7.
- **Sinks:** potions and ethers (25%), gear (about 55%), the smith's crafting fee (40% of the shop price, plus materials),
  reforging (30 gold at tier 1, scaled by F), the moon shrine (reset talents: 4F), the inn (0.5F).
- **Losing a fight** costs half the gold on hand. The player is encouraged to spend rather than hoard: a normal
  stretch ends with under one stretch's income unspent, so the loss is at most a few hundred gold.
- **Fountains are free**, so an inn is not for healing; it is for the roster, saving, and the campfire chat. (The
  inn heals everyone too, but the fountain is nearer.)

## 8. Items: what we expect from them (the full list is in `items.md`)

| item kind | the job | how often the player meets one | the player's decision |
|---|---|---|---|
| **Weapon** | defines your damage and your feeling | a new tier about every 5 levels (every 2 hours) | save for the next one or craft it? |
| **Armour, helm, shield, boots** | survival | one upgrade every ~12 minutes of play (drops, chests, shops) | who gets the new one? |
| **Neck, cloak, rings** | build identity (crit, dodge, mana, regen) | a choice every ~30 minutes | which stat do I lack? |
| **Potions, ethers** | a safety net | about 1 potion per 3 fights on average, up to 3 on a boss | spend now or save for the boss? |
| **Ember-buns** | the three emergency full-heals of the game | 3 in the whole story | once per boss? once per game? |
| **Materials** | make crafted gear, so grinding has a point | about 40% of fights drop one | which recipe next? |
| **Sets** | a long goal across a stretch | one set per town (3 pieces each) | chase the set or take better single pieces? |
| **Rare drops** | a thrill | bosses always, ~1 per 40 fights otherwise | |

An upgrade the player *wants* should reach them about every 12 minutes: loot, a shop, a chest, a crafting result or a
quest reward.

## 9. Player progression: what unlocks when

| story time (by count) | level | what arrives | why then |
|---|---|---|---|
| 0:00 | 1 | walk, talk, tap things; light the lamp from the tower fire | the first 5 minutes teach nothing else |
| 0:02 | 1 | the first fight: move, basic attack, see the hit chance | one idea per screen |
| 0:03 | 2 | the first talent pick (3 offered) | the first reward comes before the first boredom |
| 0:04 | 2 | the class skill (first mana use) | after the basic attack is understood |
| 0:08 | 2 | Wizzle and Glint join: a pack of three | a pack before the second idea |
| 0:10 | 2 | the first chest, the equipment screen | a thing to equip first |
| 0:13 | 3 | Bork at the gate; the shop and potions | |
| 0:17 | 3 | leave Hearthspire; the first route; the world map in the inn | the world opens |
| 0:30 | 4 | gear tier 2 appears in shops; materials start dropping | |
| 0:42 | 5 | Nugget joins; the smith and crafting | |
| 1:20 | 8 | **subclass choice**; the first Smiler piece; **raptors** | the end of stretch 2 |
| 2:32 | 13 | the second piece; **fast travel**; gear tier 3 | after the early routes have been walked twice |
| 3:51 | 18 | gear tier 4; the third piece; the bun-road toll opens | |
| 4:17 | 19 | the Ordeal; the pack is empty on purpose | |
| 5:26 | 23 | gear tier 5; Wizzle back; the fins (swap the pack at any fountain) | |
| 6:41 | 27 | gear tier 6; the ember chamber; **boats** (given in stretch 7) | |
| 7:32 | 30 | the Smiler | |

**Talents:** one pick per level from level 2 (29 picks). Each offer shows three options, and about two in three offers
include a skill. By level 30 a character has about **8 skills** (class, weapon, talent and subclass skills) and about
20 stat picks. **Four skills are equipped** (`skills.md`): the battle menu shows them beside Attack, and the kit is changed at a fountain, an inn or a
campfire, so choosing the four is part of the build (the monk's Adapt is the exception, mid-fight).
**Gear tiers** arrive at levels 1, 5, 10, 16, 22 and 28. **Subclass** at level 8.

### The cadence of rewards (the 10-minute rule)

| something new every… | what |
|---|---|
| about 8 minutes (act 1), then **13–19 minutes** (by count, `tools/timecount.js`) | a level-up and a talent pick |
| ~6 minutes | a gear piece, found or bought (10 in Pebblebrook's 63 minutes) |
| ~2 minutes | a story beat or a joke worth reading (32 beats and 147 boxes in 63 minutes) |
| per route | a new foe type, a new landmark |
| per stretch (about 70 minutes) | a new town, a new companion or a piece, a gear tier |
| ~55 minutes | a new skill (8 by level 30) |

**Level pace (P10, by count, 22 Oct):** a level is what its fights, scenes and menus take: about **8 minutes** in act 1 and **13 to 19
minutes** after (the Ordeal stretch's single level takes about 26, on purpose), about 16 on average. The fights a level needs still rise
from 5 to 8, so later levels take longer; late progress is also felt through Pip's leader points, subclass skills, uniques and sets.

## 10. What the simulator must report (the check list)

Rewrite `test/sim` so one run prints these, against the targets above, for every class in `design.md` and for a mixed pack:

1. Level at the end of each stretch, fighting 85% of encounters (target within ±1 of the table).
2. Normal fight: rounds and pack HP lost, per level (3–4 rounds, 20–30%).
3. Boss: rounds, pack HP lost and first-try win rate by level difference (the 5/35/70/92/99 table).
4. Gold at the end of each stretch and the share of the next tier it buys (the 68–84% column).
5. Potions used per stretch (about 25% of income).
6. Fights per hour and the time per stretch (the time table).
7. Each class alone against the same foes: no class below 85% or above 115% of the fighter's clear time at the same level.
8. Average hit rate per attack kind and overall (target 80–85%, melee 90, ranged about 66, spells 95 after resists), crit rate (about
   10% overall), the number of misses and resists per fight (about 2.5) and how often the mercy rule triggers (about once every three fights).

**Open questions for Joakim are in `gate1-review.md`.**

## 11. How sure are we? (sensitivity, 21 Oct)

`node tools/balance-sensitivity.js` moves each number 20% either way and measures three things on the reference packs:
rounds in a normal fight (band 2.5–4.5), pack HP lost in a normal fight (15–35%) and the first-try boss win rate (50–90%).
Base: **3.54 rounds, 22% HP lost, 75% boss win.**

| number | −20%: rounds / lost / boss | +20%: rounds / lost / boss | breaks a band? |
|---|---|---|---|
| foe HP (4 × basic hit) | 3.0 / 18% / 75% | 4.0 / 24% / 75% | no |
| foe damage (share of fighter HP) | 3.5 / 19% / 77% | 3.6 / 25% / 71% | no |
| pack hit chance | 4.2 / 25% / 41% | 3.4 / 20% / 80% | **−20%: boss too hard** |
| foes' hit chance | 3.5 / 18% / 90% | 3.6 / 25% / 46% | **both ends: bosses** |
| gear share, talents | unchanged | unchanged | no (see below) |
| mana pools | 3.5 / 22% / 62% | 3.5 / 22% / 81% | no |
| mercy bonus, crit chance | no change | no change | no |
| potion strength | 3.5 / 22% / 69% | 3.5 / 22% / 77% | no |
| foes per fight | 2.9 / 16% / 75% | 4.2 / 27% / 75% | no |
| **boss damage budget T** | 3.5 / 22% / 95% | 3.5 / 22% / 44% | **both ends** |
| **boss HP multiple k** | 3.5 / 22% / 93% | 3.5 / 22% / 43% | **both ends** |

**What this says.**

- **Normal fights are forgiving**: nothing moved them out of their bands. A wrong foe number costs half a round, not the game.
- **Bosses are knife-edged by nature**: four numbers (T, k, the foes' hit chance, the pack's hit chance) swing a boss by 40–50 points of win rate. We do not try to make bosses insensitive (a phase break was tested and failed at equal difficulty); we **make mistakes cheap** with the softening rule in section 4.
- **Gear share and talents show no change because the model normalises foes to the reference fighter**: their size cancels out. What gear really changes is the *gap* when the player is a tier behind (a skipped upgrade) or ahead. Check in the next pass: one gear tier behind should cost about one level of win rate (about 20 points), no more.
- **Mercy and crit are cosmetic** for balance (they smooth the feeling of luck, not the odds), so they stay for the feeling.
- **The XP exponent is cosmetic too**: ±20% on 1.6 changes the total XP from 30,597 to 11,812 or 80,456, but the *time* does not move, because the XP per foe is derived from the fights-per-level table (`need ÷ (0.8 × fights × foes)`). The table is the design; the exponent only sets how big the numbers on the screen are. 1.6 stays because it gives a gentle rise (level 29→30 needs 73× the XP of level 2→3), and the screen numbers stay readable.
- **Pacing, by arithmetic (not simulated):**
  - minutes per fight, boss or challenge ±20%: ±26, ±11, ±25 minutes of 932 (3% each at most);
  - ~~"everything else" ±20%: ±112 minutes, the single largest uncertainty in the 15.5 hours;~~ withdrawn 22 Oct: the length is
    counted, not guessed (section 2);
  - encounter rate −20%: fights supplied fall to 0.84–0.96 of those needed (4–16% short, about 6–20 fights, roughly 15 minutes of optional top-up); +20%: 26–44% too many, the player is about a level ahead of the bosses (bosses about 20 points easier) unless they skip fights, which they may;
  - gold ±20%: coverage 68/72/84/46/66/84/83% becomes 54–101%: the weakest stretch (46%) is the one to watch.
- **Not yet tested (still open):** a skipped gear tier; ranged hit chance on its own; the status resist formula; encounter rates against the real 600 × 340 map.
