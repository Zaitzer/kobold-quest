# Number audit: every number and equation, on purpose (20 Oct 2026)

*The rule: no number in `balance.md`, `items.md` or `ui-design.md` stays unless we can say why it is that number. This is the
to-do list for getting there. Work through it in order; tick a row only when its five questions are answered **in the
document next to the number**.*

## The sixth rule: a rule before a number

When something is off, **look for the structural cause first**; change a number only when the rule is right and the constant
is not. Examples from this audit: area casters losing to bosses was not a caster-HP problem but a *rule* (a big foe is hit
once per overlapped tile); 22 fitted boss values became **two formulas**; the bard was weak because the song was priced as
an attack but had no defence side, so it gained a second modest effect instead of a bigger number; short bosses were hard
because they had too few telegraphed (relief) turns, so the rule is a minimum length instead of a softer first boss.

## The five questions (asked of every number)

1. **What is it for?** Which feeling or rule (from `balance.md` §1) does it serve?
2. **Where does it come from?** Mark it exactly one of: **D** derived (an equation, shown), **J** judgment (a choice, with the
   reason written down), **B** borrowed (taken from the current engine, and we say so), **U** unverified (a guess to be
   checked by the sim or a playtest).
3. **What depends on it?** Which other numbers move if it moves?
4. **What if it is 20% off?** (high and low) Does the game still feel right? If not, it is a *sensitive* number and gets a
   test.
5. **How will we know?** The sim output or playtest question that confirms it.

## Problems already found (a first honest pass)

These are things I noticed while re-reading my own work. They are the first rows to fix.

| # | problem | where | why it matters |
|---|---|---|---|
| P1 | ~~**Boss HP multiples contradict the boss length.** `balance.md` §4 says bosses take 8–12 rounds, but the pack deals about 3.5 × a basic hit a round, so HP = 22× (the captains) gives about 6 rounds, 18× (Snipe) about 5 and 12× (Grubb) about 3.4. Only the 30×–42× bosses reach 8–12. | §4 boss table | the numbers and the promise disagree; either the multiples rise to 28–42× or the promise drops to 5–8 rounds~~ **Resolved 20 Oct:** pack damage vs one target is 2.7×, so k = 2.7 × rounds (the old 22× captains were right); boss damage reshaped to 3 hits × 23% for fun. |
| P2 | **"The pack deals about 3.5 × a basic hit a round" is asserted, not derived.** The foe HP (4× the basic hit), the fight length, the boss length and the damage taken all hang on it. | §4 | it is the keystone; a pack with a cleric and a bard deals much less than one with a wizard |
| P3 | **Class multipliers are judgment, not derived** from the damage/durability/utility split. The split looks principled, the multipliers do not follow from it. | §3 class table | "no class below 85% or above 115%" is a promise the table does not yet keep on paper |
| P4 | **The 0.8 share** (XP from random fights) and **the 4- and 3-fight values** of a boss and a challenge are chosen, not derived. | §3, §5 | they set how many random fights a stretch needs, and so the route and area design |
| P5 | **Gear shares (80 / 68 / 22 %)** were set to look like the engine's weapon ratio, not derived from a target power step. | §3, `items.md` §1 | they decide how big a tier jump feels (stated as +20–25%, never checked) |
| P6 | **The mercy rule, the 15–95% clamp and the status resist formula** are judgment with no sensitivity check. | §4a | the hit-chance feeling depends on them |
| P7 | **Minutes per fight (1), per boss (5), per challenge (25) and the 60% "everything else"** are guesses. | §2 | the whole 15.5-hour claim rests on them |
| P8 | **Frequencies in `ui-design.md` §4** (taps an hour) are estimates built on the P7 guesses. | UI §4 | they set what sits on the main screen |
| P9 | **World size vs route length:** the routes were set for a 600 × 340-tile world without checking each town's distance on the real map. | world plan | a route that does not fit the map must be moved or cut |
| P11 | ~~**Pack mix swings boss difficulty enormously:** at gap 0 the win rate runs from 34% (paladin + bard + sorcerer) to 91% (barbarian + rogue + druid). After the P12 fix, at L18: fighter+cleric+ranger 90%, barbarian+rogue+druid 88%, monk+warlock+cleric 89%, fighter×3 96%, fighter+cleric+wizard 61%, paladin+bard+sorcerer 31%, wizard+sorcerer+warlock 10%, cleric+druid+bard 12%. Fun goal: every sensible pack 50–95%. Bosses are the class-balance test; either the three-fragile pack is under-tuned or the sim's AI (casting order, targeting) is poor. | boss sim | a class set that is "fun to pick" must not lose a boss by design~~ **Resolved 21 Oct:** the cause was area spells wasted on a single boss. Joakim's rule (a big foe is hit once per overlapped tile) plus Rousing song +50% gives, over all 252 real packs, mean 69%, 214 in the 50–95% band, none over 95%. Open: 14 all-caster/all-support packs under 30%; check by playtest whether that is acceptable "hard mode". |
| P12 | ~~**Pure supports' attack multiplier is an artefact** (cleric 2.26×, druid 2.74×) from the solver compensating weak weapon attacks; heal value should carry the budget instead. | class derivation | would give healers absurd damage if used as written~~ **Resolved 21 Oct:** supports keep a plain weapon (x1.0); their budget is the heal/buff. |
| P13 | ~~**Boss win-rate curve is not level-independent** at 3 hits × 23%: L8 86% / L18 77% / L30 47% at gap 0 (target 70%). Late game the pack is weaker than the model assumes (fixed mana, flat gear shares). Needs a per-level hit share (about 24% early, 19% at L30) or a stronger late-game pack.~~ **Resolved 21 Oct:** k and hit share are fitted per boss (22–53×, 14–24%, refitted after the big-foe rule); all 11 bosses win 60–76% at gap 0. Mana size was tested (manaK 2.2/3.5/5) and is not the cause. | boss sim | late bosses would feel unfairly hard |
| P14 | ~~The six ability scores are not reconciled~~ **Mapping written 21 Oct** (`balance.md`, score-to-stat table); still open: the fighter yardstick and talent line must be re-derived to include the scores. | **The six ability scores are not reconciled** with the class table or the talents line: the old per-level stat growth is replaced by +1 per stat pick, and the fighter yardstick must include its scores. | §3 | the class and level tables must be re-derived once, together |
| P10 | **Late-game level gap (about 40 minutes)** is a consequence of the XP curve, not a decision. | §9 | it may feel too slow, or the exponent 1.6 may be wrong |

## The to-do list

Each item produces: the derivation written into the document, a mark (D / J / B / U) on every number, a sensitivity line
(what if ±20%) and the check the sim must pass. **Item 1 comes first because it makes the others cheaper.**

| # | task | the numbers and equations to examine |
|---|---|---|
| 1 | **One model, one place.** Write `tools/balance-model.js`: a single parameter block and the equations, printing every table in the three documents. Docs are regenerated from it, so they cannot drift. | all of them |
| 2 | **XP and level pacing** | `12 × L^1.6`; 30,597 total; fights per level (2, 3, 5, 6, 7, 8); the 0.8 share; boss = 4 fights, challenge = 3; the level-up gap by level; the first two levels |
| 3 | **Base stats, gear and talents** | attack 5 + 2.2/level, defence 3 + 1.8, HP 44 + 11; gear tiers at 1, 5, 10, 16, 22, 28 and why those gaps; gear shares 80 / 68 / 22; talents 0.45 / 0.375 / 2.1 and the 30% stat-pick assumption |
| 4 | **Damage and the foe model** | `attack × mul − defence × 0.5`; ±15%; foe HP = 4× basic hit; foe defence `1 + 0.95(L−1)`; foe attack from 16 / 14 / 12% of fighter HP; foes per fight 2.5 / 3 / 3.2 |
| 5 | **Pack damage and fight length (P2)** | derive the pack damage per round for real pack mixes (fighter + cleric + wizard, etc.); rounds per fight; HP lost per fight; fix the 3–4 round promise |
| 6 | **Bosses (P1)** | HP multiples; hit at 20% of fighter HP; rounds 8–12; the win-rate table; co-op +25% per player; telegraphed attacks |
| 7 | **Classes (P3)** | derive HP / attack / defence / speed multipliers from the power split; mana pools L1 → L30; casts per fight; mana restored 10% per win |
| 8 | **Skills** | the cost rule `1 + 3(mul × targets − 1) + status`; status costs (slow 1, root 2, weaken/hex 2, stun 3, confuse 4); every skill's multiplier, AP and mana; the "2 to 8 mana" bounds |
| 9 | **Hit chances (P6)** | bases 90 / 75 / 100; class modifiers; cover −20 / −40; range −10 a tile; flank, guard, stun, surprise; clamp 15–95; mercy +15; resist `80 − 2/level`, ×1.0 / 0.8 / 0.5; crit 8%, ×1.5, cap 50; the 82% average |
| 10 | **Encounters, routes and time (P7, P9)** | chance per step 3.0 / 3.5 / 6.0 / 2.0%; safe ends 10; gap 12; route lengths vs the real map; walking 4.6 tiles/s × 1.4; planned ÷ needed 1.05–1.20; patrol 1.5× XP; dungeon floors; minutes per fight, boss, challenge; the 15.5 hours |
| 11 | **Gold and prices** | `F = 1.15 × 3 × (2 + 0.9L)`; boss 6F, chest 1.5F, main quest 4F; potions 25%; price multiples 4 / 2.5 / 1.8 / 1.5 / 0.4 / 0.5 / 2.5; sell 35%; craft 40%; coverage 66–84%; the half-gold loss |
| 12 | **Items** | the power-point rates (1 pp = 1% attack = 1% HP = 2.5% defence = 2% crit = 1% dodge = ⅓ speed = 0.25% regen); slot budgets; unique +25%; affix 3 / 4 pp; set 10 pp; crafted +15%; materials 3 + tier; drop rates 40 / 8 / 6%; the 11-minute upgrade claim; weapon family multipliers |
| 13 | **Progression and cadence (P10)** | the unlock times; the reward cadence; talents one per level, 3 offered, about 8 skills; the 10-minute rule against a 40-minute late level |
| 14 | **UI numbers (P8)** | tap budgets; frequencies; the highlight limit of three; target size 44 px; text 14 / 18 px; contrast 4.5:1; hit-chance colours at 80 / 50 |
| 15 | **Cross-check the documents** | every number appears in one place and nowhere else; no two files disagree; update `gate1-review.md`; fix `design.md` references |
| 16 | ~~**Sensitivity runs**~~ **done 21 Oct** for combat (`balance.md` §11, `tools/balance-sensitivity.js`); pacing by arithmetic; still open: a skipped gear tier, ranged hit alone, status resist, the real map. | move ten key numbers ±20% in the model (XP exponent, hit rates, foe HP, gold, encounter rate, gear share, boss k, mana, mercy, minutes per fight); list the ones that break a feeling; those get the first playtest questions |

## When it is done

- Every number has a letter (D / J / B / U) and a reason.
- Every **U** has a sim output or a playtest question attached.
- The model script regenerates the tables and the documents match it exactly.
- A short "numbers I am least sure of" list sits at the top of `balance.md` so the first playtests know where to look.
