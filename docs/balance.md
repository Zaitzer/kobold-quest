# Kobold Quest: balance and pacing (targets, v1, 20 Oct 2026)

*Part of the design document (`design.md`). **These are the numbers the game should have, not the numbers it has
today.** The engine's current values are a starting point only; where the two differ, this file wins and the
simulators (`test/sim`) are rewritten to hit these targets. Items are in `items.md`, screens and taps in `ui-design.md`.*

**How to use this file.** Every number is a *target* with a reason. The sim must reproduce each curve within ±15%; if it
can't, we change the content, not the target, unless the target itself turns out to feel wrong in play (then we change it
here first, in writing). The tables were computed together (one model, one script), so they agree with each other.

## 1. The feelings we want

Every number below exists to produce one of these. If a number makes the anti-feeling, the number is wrong.

| moment | the feeling | what makes it | the anti-feeling |
|---|---|---|---|
| **First fight** (minute 6–8) | "I can do this" | foes die in 2 rounds; a foe hit takes 16% of Pip's HP; nobody can die | confusion, a wall of rules |
| **A normal fight** | a small puzzle solved in about a minute | 3–4 rounds; the pack loses about 25% of its HP; position matters more than numbers | a chore, a damage race |
| **A boss** | an event | 8–12 rounds; the pack loses 40–55% of its HP; one telegraphed danger turn; 70% to win first try at the right level | an HP sponge; a coin flip |
| **A level-up** | a small present | a level every 10 to 40 minutes (see section 9); always a pick to make | a number going up with nothing to do |
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

The main story is **15.5 hours**; everything optional adds about **6 hours**; the small post-game another 3.

| stretch | levels | target hours | cumulative |
|---|---|---|---|
| 1 Hearthspire, act 1 | 1→3 | 1.0 | 1.0 |
| 2 R1 and Pebblebrook | 3→8 | 2.5 | 3.5 |
| 3 R2 and Sunhaven | 8→13 | 2.5 | 6.0 |
| 4 R3 and Emberreach | 13→18 | 2.5 | 8.5 |
| 5 R4, home, the Ordeal | 18→19 | 1.5 | 10.0 |
| 6 R5 and Frostwick | 19→23 | 2.0 | 12.0 |
| 7 R6, R7 and Saltspray | 23→27 | 2.0 | 14.0 |
| 8 The march and the finale | 27→30 | 1.5 | 15.5 |

**Where the minutes go** (main path, 932 minutes):

| what | minutes | share | note |
|---|---|---|---|
| normal fights | 129 | 14% | about 9 normal fights an hour, 1 minute each |
| boss fights | 55 | 6% | 11 bosses, 5 minutes each |
| keeper challenges | 125 | 13% | five of them, about 25 minutes |
| walking between places | 63 | 7% | routes are short on purpose |
| talk, story, exploring, shop, menus, side bits | 560 | 60% | this is the game |

So in a typical hour: about 9 normal fights, 0.7 of a boss, 8 minutes of a challenge, 4 minutes of walking, and 36
minutes of everything else. **Battle is about a fifth of the time**, in line with the four equal pillars of the vision.

## 3. Player power: the model

A single yardstick, the **reference fighter**, with the other classes scaled from it. Everything else (foes, bosses,
items, gold) is defined *relative* to it, so changing one number moves the rest in step.

- **Base stats (before gear and talents):** attack 5 + 2.2 per level, defence 3 + 1.8 per level, HP 44 + 11 per level.
- **Gear** supplies about +80% of base attack (weapon 60%, the rest 20%), about +68% of base defence and +22% of base HP,
  at the level its tier arrives (see `items.md`; the level table below uses 70% and 25%, close enough to leave as is). Gear tiers arrive at levels **1, 5, 10, 16, 22, 28**.
- **Talents** (one pick per level, about 30% of picks are stats): about +0.45 attack, +0.375 defence and +2.1 HP per level.
- **Damage:** a hit does `attack × skill multiplier − enemy defence × 0.5`, ±15%. Melee hits 90% of the time, ranged 75%,
  spells never miss. Crit chance 8%, crit damage ×1.5.

### The level table (the reference fighter, on-level standard foes)

| L | gear tier | XP to next | total XP | HP | attack | defence | basic hit | foe HP | foe attack | foe defence | XP per foe | gold per foe | gold per fight | fights to next level |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | T1 | 12 | 12 | 55 | 9 | 5.1 | 9 | 34 | 11 | 1 | 3 | 3 | 8 | 2 |
| 2 | T1 | 36 | 48 | 68 | 12 | 7.3 | 11 | 43 | 15 | 2 | 6 | 4 | 10 | 3 |
| 3 | T1 | 70 | 118 | 81 | 14 | 9.5 | 13 | 51 | 18 | 3 | 7 | 5 | 13 | 5 |
| 5 | T2 | 158 | 386 | 118 | 26 | 18.8 | 24 | 96 | 28 | 5 | 16 | 7 | 18 | 5 |
| 8 | T2 | 334 | 1,201 | 158 | 34 | 25.4 | 30 | 122 | 35 | 8 | 23 | 11 | 33 | 6 |
| 10 | T3 | 478 | 2,083 | 198 | 49 | 36 | 44 | 176 | 46 | 10 | 33 | 13 | 39 | 6 |
| 13 | T3 | 727 | 4,006 | 237 | 57 | 42.5 | 51 | 202 | 54 | 12 | 41 | 16 | 51 | 7 |
| 15 | T4 | 914 | 5,738 | 280 | 73 | 54.5 | 66 | 262 | 66 | 14 | 51 | 18 | 58 | 7 |
| 18 | T4 | 1,224 | 9,092 | 319 | 81 | 61 | 72 | 288 | 75 | 17 | 68 | 21 | 67 | 7 |
| 20 | T4 | 1,448 | 11,874 | 345 | 86 | 65.3 | 76 | 306 | 81 | 19 | 81 | 23 | 74 | 7 |
| 23 | T5 | 1,811 | 16,938 | 401 | 105 | 79.4 | 94 | 374 | 88 | 22 | 88 | 26 | 83 | 8 |
| 25 | T5 | 2,070 | 20,947 | 427 | 110 | 83.8 | 98 | 392 | 93 | 24 | 101 | 28 | 90 | 8 |
| 27 | T6 | 2,341 | 25,492 | 470 | 126 | 95.7 | 113 | 452 | 104 | 26 | 114 | 30 | 96 | 8 |
| 30 | T6 | 2,771 | 30,597 | 509 | 134 | 102.2 | 119 | 478 | 112 | 29 | , | 33 | 106 | , |

**The XP formula** is `12 × level^1.6` (30,597 XP in total to reach level 30). Every pack member gets the full XP of a fight.

**How the table is built (so it can be tuned):**
- *Basic hit* = the fighter's attack minus half the foe's defence. It rises from 9 to 119 (×13) while HP rises from 55 to
  509 (×9), because skills, crits and area spells push damage further and a longer fight is more fun than a shorter one.
- *Foe HP* = 4 × the basic hit. So a standard foe takes about 4 basic hits, i.e. two rounds of focused fire.
- *Foe attack* is set so one hit takes **16% of the fighter's HP at levels 1–5, 14% at 6–20, 12% at 21–30**. Early hits are
  scary, late hits are survivable; this is the "cozy but threatening" curve.
- *XP per foe* = XP to next level ÷ (0.8 × fights to next level × foes per fight). The 0.8 is the share of XP that
  comes from random fights; the other 20% comes from bosses, challenges and quests.
- *Foes per fight*: 2.5 at levels 1–5, 3 at 6–12, 3.2 after (the pack is three, so three or four foes is the norm).
- *Gold per foe* = 1.15 × (2 + 0.9 × level).
- *Fights to next level*: **2, 3, then 5 (levels 3–7), 6 (8–12), 7 (13–17 and 18–22), 8 (23–29)**. The first two levels
  come fast on purpose.

### The other eleven classes

Each class has a **power budget of 1.0**, split between damage, durability and utility. The split is the class's identity;
nothing is "worse", only different. Stats are multipliers on the reference fighter at the same level.

| class | damage | durability | utility | HP | attack | defence | speed | mana L1 → L30 | skill casts per fight |
|---|---|---|---|---|---|---|---|---|---|
| Fighter | .30 | .50 | .20 | ×1.00 | ×1.00 | ×1.00 | ×1.0 | 8 → 30 | 3 |
| Barbarian | .50 | .35 | .15 | ×1.10 | ×1.15 | ×0.80 | ×1.0 | 6 → 24 | 2 |
| Paladin | .30 | .40 | .30 | ×0.95 | ×0.90 | ×1.10 | ×0.9 | 8 → 36 | 3 |
| Ranger | .45 | .20 | .35 | ×0.80 | ×1.05 | ×0.60 | ×1.3 | 10 → 40 | 4 |
| Rogue | .45 | .20 | .35 | ×0.75 | ×1.05 | ×0.60 | ×1.4 | 8 → 36 | 4 |
| Monk | .40 | .30 | .30 | ×0.85 | ×0.95 | ×0.75 | ×1.4 | 8 → 40 | 5 (cheap skills) |
| Cleric | .15 | .30 | .55 | ×0.85 | ×0.70 | ×0.70 | ×0.9 | 14 → 62 | 6 |
| Druid | .25 | .25 | .50 | ×0.85 | ×0.75 | ×0.70 | ×1.0 | 14 → 62 | 6 |
| Bard | .20 | .20 | .60 | ×0.75 | ×0.70 | ×0.60 | ×1.1 | 12 → 58 | 6 |
| Wizard | .55 | .10 | .35 | ×0.65 | ×1.00 | ×0.40 | ×0.95 | 16 → 70 | 6 |
| Sorcerer | .60 | .12 | .28 | ×0.70 | ×1.10 | ×0.45 | ×1.0 | 14 → 64 | 5 |
| Warlock | .50 | .22 | .28 | ×0.80 | ×0.95 | ×0.70 | ×1.0 | 12 → 52 | 5 |

- **Why the mana numbers:** a caster should be able to cast about six times per fight for two fights before an ether, a
  fountain or an inn. With an average skill cost of 5.5 that is 66 mana; the L30 figures are that. The engine's current
  mage mana growth (4.5 a level, 146 at level 30) is far too generous for fixed-cost skills and removes all mana tension.
  Mana grows steadily, by the amounts in the table.
- **Each victory restores 10% of max mana**, so a dungeon is sustainable without ethers, but a caster still has to choose.
- **Mixed packs are the point.** A pack of three should be best with one front-liner or healer, one damage dealer and one
  utility. Two of the same class works but loses about 10% effectiveness.

### Skills: the cost rule

Every skill is priced by one rule, so new skills can be added without guessing:

**mana cost = 1 + 3 × (damage multiplier × average targets − 1) + status cost**, rounded.
Status costs: slow +1, root +2, weaken or hex +2, stun +3, confuse +4. Average targets: single 1, line 2, area 2.2, chain 2.5.
Healing: a single-target heal of 45% of max HP is 3 mana; a group heal is priced per effective target.
Action points: 1 AP for cheap or utility skills, 2 AP for strong or area skills, "ends the turn" for heavy melee.

It reproduces the skills the engine already has (Power bonk 3, Clang 4, Ice bolt 3, Fireball 5, Headshot 5, Meteor 8).
The new skills, by the same rule:

| class | skill | effect | multiplier × targets | status | AP | mana |
|---|---|---|---|---|---|---|
| Ranger | Mark | the foe takes +30% from the whole pack for 3 hits | , | utility | 1 | 3 |
| Monk | Flurry | three hits of ×0.5 (defence applies to each) | 1.5 × 1 | , | 2 | 3 |
| Monk | Palm strike | hit and stun | 1.0 × 1 | stun | end | 4 |
| Monk | Step | move twice this turn | , | utility | 1 | 2 |
| Monk | Still mind | +25% dodge for 2 turns | , | utility | 1 | 3 |
| Sorcerer | Spark | cheap fire | 1.2 × 1 | , | 1 | 2 |
| Sorcerer | Ember burst | area fire | 1.0 × 2.2 | , | 2 | 5 |
| Sorcerer | Dragon's breath | a line of fire | 1.1 × 2 | , | 2 | 5 |
| Sorcerer | Wild surge | ×1.5 hit with a random effect (neutral on average) | 1.5 × 1 | random | 1 | 3 |
| Bard | Rousing song | pack +50% attack for 3 turns | , | buff | 1 | 4 |
| Bard | Lullaby | slow every foe in the area | , | slow | 2 | 5 |
| Bard | Vicious mockery | hit and weaken (−25% attack, 2 turns) | 0.8 × 1 | weaken | 1 | 2 |
| Bard | Rumour | one foe attacks its friends for a turn | , | confuse | 2 | 5 |
| Rogue | Sneak attack | ×2.4 on a stunned, flanked or unaware foe, else ×1.2 | 1.8 × 1 | , | end | 4 |
| Rogue | Trap | a hidden square: ×1.2 and stun to whoever steps on it | 1.2 × 1 | stun | 1 | 5 |
| Rogue | Slip past | move through foes with no free hits | , | utility | 1 | 2 |
| Rogue | Pickpocket | ×0.6 and steal a material | 0.6 × 1 | steal | end | 3 |
| Barbarian | Rage | +30% attack, −20% damage taken, 3 turns | , | buff | 1 | 3 |
| Barbarian | Reckless swing | ×2.4, you take +25% damage next turn | 2.4 × 1 | drawback | end | 4 |
| Barbarian | Stomp | hit everything nearby | 0.9 × 2.2 | , | end | 5 |
| Barbarian | Shrug it off | heal 30% of your HP | , | heal | 1 | 3 |
| Paladin | Lay on hands | heal an ally 60% | , | heal | 1 | 5 |
| Paladin | Guard | take the next hit for an adjacent friend | , | utility | 1 | 2 |
| Paladin | Oath | allies within 1 tile take −20% for 3 turns | , | buff | 1 | 5 |
| Druid | Vine snare | root a foe for 2 turns (it can still attack) | 0.5 × 1 | root | 1 | 3 |
| Druid | Plant cover | a bush gives half cover for 3 turns | , | terrain | 1 | 3 |
| Druid | Thorns | allies reflect 20% of melee damage, 3 turns | , | buff | 1 | 5 |
| Druid | Rain | allies in the area regain 15% a turn for 3 turns | , | heal | 2 | 6 |
| Warlock | Hex | the foe takes +25% from everything for 3 turns | , | hex | 1 | 3 |
| Warlock | Teapot blast | steady ranged fire | 1.3 × 1 | , | 1 | 2 |
| Warlock | Whisper | an ally gets +20% attack and +10% dodge, 3 turns | , | buff | 1 | 3 |
| Warlock | Pact boon | ×2.5 once a fight; you lose 10% of your HP | 2.5 × 1 | drawback | end | 4 |

**A skill that costs less than 2 mana is too cheap; one that costs more than 8 should end the fight.**

## 4. Fights: the shape

A fight is *three kobolds against two to four foes* on a board of about 10 × 13 tiles (bosses 12 × 14, with a boss that
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
| **boss** | 6–12 | 40–55% | three attacks a round, no one-shots; one telegraphed big attack; add-ons on round 4 |

**Pace of a normal fight:** the pack deals about 3.5 × a basic hit per round (skills and an area spell help), and foes have
4 × the basic hit in HP each, so three foes die in about 3.4 rounds. The foes' damage then costs the pack about 0.5 of
one member's HP in total across the fight, spread over the pack: about 16%, and about 25% once skills, crits and misses
are counted. This is what the table of foe attack numbers is built for.

**Fights between a heal:** four normal fights cost about the whole pack's HP, so **a heal is needed every 3–4 fights**:
that is a fountain, an inn, a campfire (one free heal per dungeon visit, half-way), or a potion.

### Bosses

**Derived rules** (`node tools/balance-model.js bosses`; calibrated on the average of six varied packs, not one):

- **Length (D, fitted per boss):** against one 2 × 2 boss the pack deals **3.7–4.5 × the basic hit per round** (single targets cost the area casters, the big-foe rule gives it back, healing and potions take turns). So the HP multiple `k` is **fitted per boss** until the six-pack average takes the target rounds: 22× for the first boss up to 53× for Glitterbeak. The first draft's 12–42× did not give the promised lengths.
- **Shape, chosen for fun (J, tested):** a boss makes **three attacks a round**, instead of one big blow. Same total damage, but nobody is knocked out from full HP (about 0.00 one-shots per fight, against 0.10 for a single 55% blow), the pack is under steady pressure it can answer (heal, guard, step away), and about 1 win in 4 ends with the pack under 40% HP: a close call that was earned. The telegraphed big attack (every third round, avoidable by moving) stays on top.
- **Hit size (D, fitted per boss):** each of the three hits takes 14–24% of the fighter's HP, softer for the later, longer fights. Fitted so the six-pack average wins first try about 70% at equal level (60–76% in the sim).
- **Fun checks (U, must hold in the sim and in play):** one-shot kills from full HP ≈ 0; about 1 kobold falls per boss (0.9–1.4 in the sim); 15–25% of wins end under 40% pack HP; no round where the pack has nothing useful to do.
- **Every pack gets a fair fight (checked on all 252 real packs, Pip in any class plus two of the seven companions, Bun-road captain, L18):** mean first-try win 69%; 214 of 252 packs between 50 and 95%; none over 95%; 14 under 30% (nearly all stack three of bard, wizard, sorcerer and cleric). Mean by Pip's class: fighter 76, barbarian 75, paladin 77, ranger 65, rogue 69, monk 71, cleric 68, druid 67, wizard 74, sorcerer 80, warlock 69, **bard 43 before the Rousing-song change** (+25% to +50%: bard packs 48% to 66%, others 81%).
- Bosses are not scaled by the number of players, except in co-op where HP and attack scale by +25% per extra player.

| boss | level | rounds (target) | HP multiple | HP | each of 3 hits | % of fighter HP | fighter's HP | the trick |
|---|---|---|---|---|---|---|---|---|
| Grubb the toll boss | 5 | 6 | 22× | 533 | 28 | 24% | 116 | blocks the mill road; cheap, loud, easy to read |
| Snipe the copper snatcher | 8 | 7 | 26× | 800 | 34 | 22% | 155 | hides behind cover, rides a copper cart |
| Sunhaven guard captain | 12 | 8 | 31× | 1,496 | 44 | 20% | 220 | drains the oasis tiles one by one |
| Emberreach guard captain | 16 | 8 | 33× | 2,228 | 57 | 20% | 286 | seizes ovens: heat tiles that hurt |
| Snatchclaw (Emberreach) | 18 | 10 | 40× | 2,875 | 56 | 18% | 313 | talks the pack into standing down (a mock "stun") |
| Bun-road toll captain | 18 | 8 | 32× | 2,300 | 63 | 20% | 313 | brings reinforcements every third round |
| Draft sergeant (Frostwick) | 22 | 8 | 33× | 3,007 | 76 | 20% | 380 | tries to draft a pack member for three turns |
| Pier captain (Saltspray) | 26 | 8 | 34× | 3,394 | 86 | 20% | 432 | fights from boats at range |
| Castle commander | 28 | 10 | 44× | 5,049 | 76 | 16% | 473 | a wall of guards that opens in phases |
| Snatchclaw (castle) | 29 | 11 | 49× | 5,729 | 78 | 16% | 486 | goes for the tower fire; the player must hold him |
| Glitterbeak | 30 | 12 | 53× | 6,312 | 70 | 14% | 499 | cold: heals when he eats buns, loses it when the pack's embers glow |

**First-try win rate by level difference**, measured in the sim (average of six packs; the design target was 5 / 35 / 70 / 92 / 99%):

| pack level vs the boss's level | −4 | −2 | 0 | +2 | +4 |
|---|---|---|---|---|---|
| target | 5% | 35% | **70%** | 92% | 99% |
| sim, early and mid bosses (L5–22) | 0% | 0–45% | 60–73% | 88–100% | 99–100% |
| sim, late bosses (L26–30) | 0–29% | 6–52% | 61–76% | 75–94% | 72–99% |

So the curve is **steeper than the target on the low side**: two levels under an early boss is almost a sure loss. That is
why the hint after two losses matters, and why the goal bar shows a warning mark when the pack is two levels under (U:
playtest whether this feels fair or whether the low side should be softened).

Bosses can be retried at once with no loss beyond the potions used. After two losses the game offers a hint (Mallow or
the nearest keeper says which skill would help); after three, it offers to step the boss down one notch. Nobody is ever
stuck.

## 4a. Hit chances and crits

**The rule in one line:** *positioning changes the odds, levels change the damage, and the number on the screen is the
whole truth.* A player should be able to look at a foe, read "65%", and know exactly why.

**What we want the player to feel:** a miss is *bad luck*, never *unfair*. About one attack in six misses (we aim for an
average hit rate of **80–85%**); the misses that hurt most are the ones the player chose to risk (a shot from far away, at a
foe in cover), not ones they could not see coming.

### Base chance, by kind of attack

| attack | base chance | why |
|---|---|---|
| melee (blades, axes, fists, daggers) | **90%** | you are next to the foe and risk the counter-attack, so it is reliable |
| ranged (guns, bows, slings) | **75%** | safe from a distance, so less reliable; cover and range matter |
| spells (wands, orbs, teapots, holy, nature, songs) | **100%, never miss** | casters pay in mana, fragility and fewer, costlier actions; they also have status resistance to fight against |
| skills | the weapon's chance plus the skill's own modifier (below) | |

### Class accuracy (added to the base)

| class | modifier | reason |
|---|---|---|
| Fighter | +5 melee | the reliable one |
| Barbarian | −5 melee | swings wild; makes up for it in damage |
| Paladin | 0 | |
| Ranger | +10 ranged | the marksman |
| Rogue | +5 melee, +10 against a flanked or unaware foe | strikes where it counts |
| Monk | +5 melee | trained |
| Cleric, Druid, Bard | −10 on weapon attacks | weapons are an afterthought; spells never miss anyway |
| Wizard, Sorcerer, Warlock | none (weapon attacks are spells) | |

### Tactical modifiers (the same for both sides)

Everything the player can change by moving or choosing:

| situation | modifier | notes |
|---|---|---|
| target in **half cover** | **−20** | ranged only; melee ignores cover |
| target in **full cover** | **−40** | ranged only |
| target **flanked** (an ally on the opposite side) | cover is ignored; **+15 crit** | the reward for positioning |
| beyond the weapon's best range | **−10 per tile** | each weapon has a best range (popgun 5 of 7, cannon 7 of 9) |
| close range with a close-range weapon | +15 | blunderbuss and the like |
| target in **tall grass**, not adjacent | −10 | |
| target is **guarding** | −25, and −25% damage taken | a real defensive choice |
| target is **stunned or rooted** | +20 | it cannot dodge |
| target **unaware** (surprise) | +20, and +10 crit | the ambush bonus |
| target's **dodge** (gear, skill) | −1 per 1% dodge, total dodge capped at 30% | |
| attacker's **free hit** (leaving reach) | −10 | |
| attacker on **watch** | −15 | |
| attacker is **weakened** | −10 | |

### Skill modifiers

| skill | hit modifier | note |
|---|---|---|
| Power bonk, Clang, Shield bash, Palm strike | 0 | |
| Aimed shot | +20 | the careful one |
| Headshot | +15 | |
| Arrow rain, Volley (area, ranged) | −10 *per target* | each foe rolls separately; coverage costs reliability |
| Cleave, Whirlwind, Stomp (area, melee) | −10 per target | |
| Flurry | three rolls, each −10 | on average 2.4 hits of 3 |
| Reckless swing | +10 | the recklessness is in the drawback, not the aim |
| Sneak attack | +20 if flanked, stunned or unaware | otherwise 0 |
| Smite, spells, Teapot blast, Hex | never miss | |
| Traps | no roll | they spring when stepped on |

### Statuses (stun, slow, root, hex, weaken, confuse)

A status applied *by a damaging skill* happens if the hit lands. A *pure* status skill (Lullaby, Vine snare, Hex, Rumour)
rolls a **resist check**:

**chance = 80% − 2 per level the target is above the caster (never under 40%)**, then
**normal foe ×1.0, elite ×0.8, boss ×0.5**.

| target | stun, root, confuse chance (same level) | duration |
|---|---|---|
| normal foe | 80% | 1–2 turns |
| elite or patrol leader | 64% | 1 turn |
| boss | 40% | 1 turn (never 2) |

So a boss can be stunned but only as a gamble; a stun is never the plan, only a bonus. The stunned foe is the exception
to "no hidden levels": its resistance is shown as "likely" / "unlikely" on the skill.

### Limits

- **Every chance is clamped between 15% and 95%.** Below 15% an attack is a trap for the player; at 100% it is a
  guarantee that feels too safe. 95% leaves the thrill of a rare miss.
- **No accuracy by level.** The level gap shows up in damage and HP (the level table in section 3), not in the odds.
  This keeps the numbers readable.
- **Bosses' big, telegraphed attacks do not roll.** They are avoided by moving out of the shown area; if you are in it you
  are hit. The danger is a decision, not a die.
- **Mercy rule (player only):** after **two misses in a row** by the same kobold, its next attack gets **+15%**. It is shown
  in the breakdown ("mercy +15"). It evens out streaks of bad luck without changing the average much (about +0.5% overall; it triggers about once every three fights).

### Crits

| | value |
|---|---|
| base crit chance | **8%** |
| crit damage | **×1.5** |
| flanked target | +15 |
| unaware target | +10 |
| gear and talents | 1 power point = +2% (a ring of crit is worth +6% at most) |
| cap | **50%** |
| spells | can crit at the same chance; a crit adds ×1.5 |

On a normal fight a crit adds about 4% damage (8% × 0.5), which is small on purpose: crits are a pleasant flash, not a
build. A crit-focused build (rogue with the right gear) can reach 35–40% and then adds about 18% damage.

### What the average comes to (the check)

For an average pack in an average fight, the attacks are about 40% melee, 40% ranged and 20% spells:

| | share | average chance |
|---|---|---|
| melee (90 + class) | 40% | 90% |
| ranged (75 + class − cover − range) | 40% | about 66% (the average foe is in half cover 30% of the time, and about 15% of shots are past best range) |
| spells | 20% | 100% |
| **overall** | | **40%×90 + 40%×66 + 20%×100 = 82%** |

That is inside the 80–85% target, and the damage model in section 3 (which assumed 85%) is close enough. **If the sim finds
the average below 78%, fights run too long and the first fix is less cover on the boards, not a higher base chance.**
In a 3–4 round fight a pack makes about 14 attacks, so the expected number of misses is **2.5**; roughly 6% of fights have
no misses at all and about 9% have five or more.

### How it is shown

- Each foe shows its hit chance as a small badge when the active kobold could attack it: **white at 80% or more, yellow
  50–79%, orange under 50%**, with a shape as well as a colour. It is the real number, never rounded for comfort.
- **Press and hold** shows the breakdown in plain words: "75 base, half cover −20, past best range −10, mercy +15 =
  60%", plus the crit chance and the damage range, and a skull badge when the hit would kill.
- A pure status skill shows "likely" (65% or more), "maybe" (40–64%) or "unlikely" (under 40%) instead of a number.
- Enemies' chance to hit *you* is shown on your kobold when you hover or hold it, the same way.

## 5. Encounters, routes and the distance walked

**How encounters work:** each step on a route tile rolls for a fight. The number is the *chance per step*.

| ground | chance per step | one fight about every |
|---|---|---|
| town | 0 | never |
| grass route | 3.0% | 33 steps |
| desert, pass, snow | 3.5% | 29 steps |
| the march (R6, backwards) | 2.0% | 50 steps |
| dungeon floor | 6.0% | 17 steps |

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
walking, about 4 to 6 minutes with the fights.** Routes are short in distance because the world is 600 × 340 tiles; they are
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

Hearthspire has no area; its fights are scripted set-pieces.

### The fight budget (the main path)

This is the check that the levels, the XP and the places add up. *Needed* = the fights the pack must win to reach the
stretch's end level, after bosses (4 fights' worth of XP each) and challenges (3 each) are counted. *Planned* = what the
places supply. **Planned ÷ needed should be 1.05–1.20**: a player who fights 85% of what they meet keeps pace; someone who
runs from more falls behind, someone who does the optional content is ahead.

| stretch | levels | fights to level | from bosses and challenges | fights needed | fights planned | planned ÷ needed | planned fights come from |
|---|---|---|---|---|---|---|---|
| 1 Hearthspire act 1 | 1→3 | 5 | 0 | 5 | 5.9 | 1.18 | 5 set-pieces (cellar, yard drill, gate) and R1 start (0.9) |
| 2 R1 + Pebblebrook | 3→8 | 25 | 11 (Grubb, Snipe, 1 challenge) | 14 | 16.3 | 1.16 | R1 ×2 passes 6.0, mill road 2.4, the mine 6.9, 1 lookout |
| 3 R2 + Sunhaven | 8→13 | 30 | 7 (1 boss, 1 challenge) | 23 | 25.2 | 1.09 | R2 ×2 9.8, the cellars 8.3, the oasis 2.1, 5 patrols |
| 4 R3 + Emberreach | 13→18 | 35 | 11 (2 bosses, 1 challenge) | 24 | 26.9 | 1.12 | R3 ×2 10.5, the crater 8.3, the fields 2.1, 6 patrols |
| 5 R4 + home + Ordeal | 18→19 | 7 | 4 (1 boss) | 3 | 3.9 | 1.30 | R4 once 3.9 (a deliberately thin stretch) |
| 6 R5 + Frostwick | 19→23 | 28 | 7 (1 boss, 1 challenge) | 21 | 23.2 | 1.10 | R5 ×2 9.8, the ice cellars 8.3, the draft outpost 3, the snow 2.1 |
| 7 R6, R7 + Saltspray | 23→27 | 32 | 7 (1 boss, 1 challenge) | 25 | 28.3 | 1.13 | R6 ×2 8.4, the shipwreck 5.0, the island cave 4.8, R7 2.1, 8 patrols |
| 8 The march + finale | 27→30 | 24 | 12 (3 bosses) | 12 | 11.8 | 0.98 | the march 2.8, 9 set-piece fights in the castle (mandatory, so 1.0 is right) |
| **total** | 1→30 | **186** | 59 | 127 | **141.5** + 11 bosses | | |

So the whole main story is about **142 normal fights and 11 boss fights**: one normal fight every 6.5 minutes of play.

**A "visible patrol"** is a group of foes standing on the route you can see and avoid or walk up to. They give 1.5× XP and
are the way a player who dislikes random fights can still keep pace (it is also why route fights can be lower than a pure
random design would need).

## 6. Grind, optional content and being stuck

**There is no required grinding.** A player who fights about 85% of the random fights they meet and wins the bosses is
within one level of the end level of every stretch.

**Optional content** (what you do by choice, mostly the same fights with more reward):

| per stretch | what | minutes |
|---|---|---|
| side quests | 3 per town, each a small story with a reward | 30 |
| route extras | 2 per route (a chest hunt, a joke, a lost goat) | 10 |
| the bounty board | 2 hunts (a named foe, 3 fights) | 8 |
| a hidden trial | an optional mini-boss with a unique piece of gear | 6 |
| exploring and chests | 5 chests per stretch | 10 |
| **total** | | **about 64** |

Stretches 2, 3, 4, 6, 7 have the full set (about 5.3 hours); stretch 1 has 5 minutes, stretch 5 has 20, stretch 8 has 15:
**about 6 hours in all.** A completionist's gain is **+20% XP and +35% gold**, which puts them about one level ahead and
one tier piece richer. They are over-levelled a little, so fights are easier; that is the reward.

**If the pack is stuck** (two or more levels under a boss's level): the game says so (a warning mark on the goal bar, a
villager's hint). A level takes 5–8 fights, about 6 to 8 minutes. **The worst-case top-up is about 15 minutes**, and the
bounty board is the fastest way (3 named fights per hunt, 1.5× XP). We aim for an *average* top-up of zero.

**Post-game (about 3 hours, small):** the islands' trials and Glitterbeak's hoard, level 30 gear, no new levels.

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
  an inn bed 0.5F (never under 10). One kobold's full set of one tier is about 17.6F; a pack of three is 53F.
- **Income per hour (net of potions):** about 390 gold an hour in stretch 2 and about 1,830 an hour in stretch 7.
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

| story time | level | what arrives | why then |
|---|---|---|---|
| 0:00 | 1 | walk, talk, tap things; light the lamp from the tower fire | the first 5 minutes teach nothing else |
| 0:06 | 1 | the first fight: move, basic attack, see the hit chance | one idea per screen |
| 0:10 | 2 | the first talent pick (3 offered) | the first reward comes before the first boredom |
| 0:15 | 2 | the class skill (first mana use) | after the basic attack is understood |
| 0:30 | 2 | Wizzle and Glint join: a pack of three | a pack before the second idea |
| 0:35 | 2 | the first chest, the equipment screen | a thing to equip first |
| 0:45 | 3 | Bork at the gate; the shop and potions | |
| 1:00 | 3 | leave Hearthspire; the first route; the world map in the inn | the world opens |
| 1:30 | 4 | gear tier 2 appears in shops; materials start dropping | |
| 2:00 | 5 | Nugget joins; the smith and crafting | |
| 3:30 | 8 | **subclass choice**; the first Smiler piece; **raptors** | the end of stretch 2 |
| 6:00 | 13 | the second piece; **fast travel**; gear tier 3 | after the early routes have been walked twice |
| 8:30 | 18 | gear tier 4; the third piece; the bun-road toll opens | |
| 10:00 | 19 | the Ordeal; the pack is empty on purpose | |
| 12:00 | 23 | gear tier 5; Wizzle back; the fins (swap the pack at any fountain) | |
| 14:00 | 27 | gear tier 6; the ember chamber; **boats** (given in stretch 7) | |
| 15:30 | 30 | the Smiler | |

**Talents:** one pick per level from level 2 (29 picks). Each offer shows three options, and about two in three offers
include a skill. By level 30 a character has about **8 skills** (class, weapon, talent and subclass skills) and about
20 stat picks. The battle menu shows five skills at once; more go behind a "more" button.
**Gear tiers** arrive at levels 1, 5, 10, 16, 22 and 28. **Subclass** at level 8.

### The cadence of rewards (the 10-minute rule)

| something new every… | what |
|---|---|
| 10 minutes (levels 1–2), 25 (3–7), 30–35 (8–22), 40 (late) | a level-up and a talent pick |
| ~12 minutes | a gear piece, found or bought |
| ~8 minutes | a story beat or a joke worth reading |
| per route | a new foe type, a new landmark |
| per stretch (about 2.5 hours) | a new town, a new companion or a piece, a gear tier |
| ~40 minutes | a new skill |

Late levels are 40 minutes apart, so late progress must be *felt* through gear tiers, subclass skills, companion arcs and
the Smiler, not through the level number. This is deliberate, and is why the XP curve is steeper than the 15-hour story
alone would need.

## 10. What the simulator must report (the check list)

Rewrite `test/sim` so one run prints these, against the targets above, for every class in `design.md` and for a mixed pack:

1. Level at the end of each stretch, fighting 85% of encounters (target within ±1 of the table).
2. Normal fight: rounds and pack HP lost, per level (3–4 rounds, 20–30%).
3. Boss: rounds, pack HP lost and first-try win rate by level difference (the 5/35/70/92/99 table).
4. Gold at the end of each stretch and the share of the next tier it buys (the 68–84% column).
5. Potions used per stretch (about 25% of income).
6. Fights per hour and the time per stretch (the time table).
7. Each class alone against the same foes: no class below 85% or above 115% of the fighter's clear time at the same level.
8. Average hit rate per attack kind and overall (target 80–85%, melee 90, ranged about 66, spells 100), crit rate (about
   10% overall), the number of misses per fight (about 2.5) and how often the mercy rule triggers (about once every three fights).

**Open questions for Joakim are in `gate1-review.md`.**
