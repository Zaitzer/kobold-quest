# Number audit: every number and equation, on purpose (20 Oct 2026, maintained 22 Oct)

*The rule: no number in `balance.md`, `items.md` or `ui-design.md` stays unless we can say why it is that number. This is the
to-do list for getting there. Work through it in order; tick a row only when its five questions are answered **in the
document next to the number**.*

## The sixth rule: a rule before a number

When something is off, **look for the structural cause first**; change a number only when the rule is right and the constant
is not. Examples from this audit: area casters losing to bosses was not a caster-HP problem but a *rule* (a big foe is hit
once per overlapped tile); 22 fitted boss values became **two formulas**; the bard was weak because the song was priced as
an attack but had no defence side, so it gained a second modest effect instead of a bigger number; short bosses were hard
because they had too few telegraphed (relief) turns, so the rule is a minimum length instead of a softer first boss.

## The working rules (from Joakim, 21–22 Oct)

- **A rule before a number** (the sixth rule above).
- **No simulations unless asked.** Arithmetic and playtests are the default checks; the model and sims are run only on request.
- **When Joakim says "only in chat", nothing is written to the repo.**

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
| P1 | ~~**Boss HP multiples contradict the boss length.**~~ **Resolved 21 Oct:** bosses now come from two rules, `k = R × (3.5 + 0.03L)` and a damage budget `T = 4.3 + 0.04L` fighter-HPs over three attacks a round (`balance.md` §4). | §4 boss table | |
| P2 | ~~**"The pack deals about 3.5 × a basic hit a round" is asserted, not derived.** The foe HP (4× the basic hit), the fight length, the boss length and the damage taken all hang on it.~~ **Resolved (measured 20 Oct, scaled 22 Oct):** 3.6–4.1 basic hits a round in normal fights and 2.3–2.7 against one boss with a pack of three; with four, ×4/3 against ×4/3 the foes, so fights still last 3–4 rounds; the boss rule uses 3.5 at L1 to 4.4 at L30 (`balance.md` §4). | §4 | it is the keystone; a pack with a cleric and a bard deals much less than one with a wizard |
| P3 | ~~**Class multipliers are judgment, not derived** from the damage/durability/utility split. The split looks principled, the multipliers do not follow from it.~~ **Resolved 22 Oct (arithmetic):** defence re-derived so each class's effective HP meets its split; every class 86–100% of the fighter. | §3 class table | "no class below 85% or above 115%" is a promise the table does not yet keep on paper |
| P4 | ~~**The 0.8 share** (XP from random fights) and **the 4- and 3-fight values** of a boss and a challenge are chosen, not derived.~~ **Resolved 22 Oct (arithmetic):** XP per basic hit of foe HP defeated (bosses 2.2–4.1 fights), share 0.75, +8 patrols keep planned ÷ needed 1.08–1.21. | §3, §5 | they set how many random fights a stretch needs, and so the route and area design |
| P5 | ~~**Gear shares (80 / 68 / 22 %)** were set to look like the engine's weapon ratio, not derived from a target power step.~~ **Resolved 22 Oct (arithmetic):** tier jumps are +40/25/18/13/10% attack; the +20–25% claim withdrawn; shares kept (J). | §3, `items.md` §1 | they decide how big a tier jump feels (stated as +20–25%, never checked) |
| P6 | ~~**The mercy rule, the 15–95% clamp and the status resist formula** are judgment with no sensitivity check.~~ **Resolved 22 Oct:** clamp is now 0–100% by the formula; mercy kept as streak protection; status chance rewritten with resistance and CHA. | §4a | the hit-chance feeling depends on them |
| P7 | **Minutes per fight (1), per boss (5), per challenge (25) and the 60% "everything else"** are guesses. **Estimate (22 Oct, arithmetic):** with a pack of four a normal fight is about **90 s**, not 60 (16 kobold turns at about 4.5 s, foes about 1.2 s each, 10 s in and out); over 142 fights that is about **+70 minutes** on the 15.5 hours, and battle rises from a fifth to about a quarter of play. **Accepted 22 Oct (Joakim):** fights stay as they are; the story is about 16.7 hours. Still to time in a real session. | §2 | the whole 15.5-hour claim rests on them |
| P8 | **Frequencies in `ui-design.md` §4** (taps an hour) are estimates built on the P7 guesses. | UI §4 | they set what sits on the main screen |
| P9 | ~~**World size vs route length:** the routes were set for a 600 × 340-tile world without checking each town's distance on the real map.~~ **Resolved 22 Oct (arithmetic):** the layout fits; about 110 tiles of empty ring each side, so shrink the grid to about 420 × 340 at the slice. | world plan | a route that does not fit the map must be moved or cut |
| P11 | ~~**Pack mix swings boss difficulty enormously**~~ (34–91% at equal level). **Resolved 21 Oct:** the cause was area spells wasted on a single boss; Joakim's rule (a big foe is hit once per overlapped tile) and Rousing song's second effect (25% less damage taken) give, over all 252 real packs, mean 73%, 238 in the 50–95% band, none over 95%, 8 under 30%. Open: whether those 8 all-caster/all-support packs are an acceptable hard mode (playtest). | boss sim | |
| P12 | ~~**Pure supports' attack multiplier is an artefact** (cleric 2.26×, druid 2.74×) from the solver compensating weak weapon attacks; heal value should carry the budget instead. | class derivation | would give healers absurd damage if used as written~~ **Resolved 21 Oct:** supports keep a plain weapon (x1.0); their budget is the heal/buff. |
| P13 | ~~**Boss win rate is not level-independent.**~~ **Resolved 21 Oct** by the two boss rules (the damage budget grows with level); all 11 bosses 69–82% first-try at equal level in the sim. | boss sim | |
| P14 | ~~**The six ability scores are not reconciled** with the class table or the talent line. The mapping is written (`balance.md` §3, score-to-stat table, made consistent 22 Oct); still open: the fighter yardstick and the level table must be re-derived with the scores, and the talent line replaced by +1 per stat pick.~~ **Resolved 22 Oct (arithmetic):** the level table is the fighter including its scores; 4 STR + 5 CON picks reproduce the old talent line within 2 points. | §3 | the class and level tables must be re-derived once, together |
| P15 | ~~**New stats without a rule yet** (22 Oct): special attack and special defence (spell damage still uses attack), initiative, threat, armour piercing, morale, luck, and Pip's Might, Wits and Leadership. They are on the character sheet (`design.md` §8) with *open* marked.~~ **Resolved 22 Oct (arithmetic):** rules written for special attack and defence, initiative, threat (base = effective HP), armour piercing, morale, luck, Might, Wits and Leadership (`balance.md` §3, the new stats). | §3, §4a | a stat that feeds no formula makes a deep sheet feel fake |
| P16 | ~~**Corruption's ending branch conflicts with "no story choices"**~~ **Resolved 22 Oct:** corruption is combat only. | §3 | |
| P17 | ~~**The model lags the rules.**~~ **Resolved 22 Oct:** `tools/balance-model.js` now has the one hit formula on an average board (distance, cover, flanking, unseen, class accuracy, the multiple-attack penalty), spells resisted by distance and steadiness, crit builds (β, D, c), the ability scores and Balance (Ki strike × (0.5 + Balance)), luck on every roll, initiative (I + d6), threat (base × CHA), morale (AP banked, +1 or −1), and burn and poison. `node tools/balance-model.js rules` checks them by arithmetic: the level table (9.1, 44.5, 119.4), Balance (100/80/52/93%), Ki strike ×1.20, luck (83.4%, 8.7%), morale (+7.1 … +33.3%), initiative (65/78/88/99%), burn and poison (0.75, 1.5 hits) all match `balance.md`. It found three things: a spell-distance formula that disagreed with §4a (fixed), accuracy counted twice with the scores (fixed, P21 below), and P22, P23. The sim is not rerun. | tools | any rerun would measure the old game |
| P18 | ~~**Items and the new stats:** `items.md` has no budget lines for special attack and defence, initiative, threat, armour piercing, luck or the ability scores (only "+1 score = 5 pp" in `balance.md`).~~ **Resolved 22 Oct (arithmetic):** power-point prices for every new stat (`items.md` §1); +1 ability score corrected to 2.5 pp; threat costs 0 pp. | `items.md` §1 | gear cannot be priced for half the sheet |
| P19 | ~~**Pack of four (decided 22 Oct).** Every fight, boss, encounter, gold and item number was derived for a pack of three: foes per fight, the boss rules' constants (3.5 + 0.03L, 4.3 + 0.04L), the 252-pack check, the shop coverage, the class budgets of mixed packs. All must be re-derived once for four.~~ **Resolved 22 Oct (arithmetic):** foes per fight, the boss HP rule and the boss budget × 4/3, one boss attack per kobold, XP per foe × ¾, income × 4/3 with prices in F₀ (the pack-of-three unit), so length, HP lost per kobold and shop coverage stay. The win rates were measured with three and stay **U**. | `balance.md` §3–§7, `items.md` | the largest re-derivation left |
| P20 | ~~**The HoMM3 damage factor (decided 22 Oct)** replaces subtraction. `0.39` is fitted so the level table's basic hit holds (within 1% at L1, L10, L30), but foe attack against kobolds comes out about 20% under the 16 / 14 / 12% targets; the foe attack column, the boss budgets and armour piercing's value must be re-derived.~~ **Resolved 22 Oct (arithmetic):** foe attack re-derived (about 1.14× the old values); the factor makes defence matter a little more for fragile kobolds. | `balance.md` §3, §4a | foes would hit too softly |
| P21 | ~~**Accuracy counted twice.** The scores add +2.5 accuracy a modifier point, and every class starts with 15 in its attack score, so fighters hit 100% in melee and the average was 87%.~~ **Resolved 22 Oct (D):** the class accuracy table is read including the starting scores (like the level table); only growth above the start adds. Average 84%. | `balance.md` §3, §4a | misses would vanish for martial classes |
| P22 | ~~**Positional crit bonuses break jackpot builds.** Flanked +15 and unseen +10 added to the crit chance; a 1% ×116 build dealt ×4.6 a plain fighter on the average board.~~ **Decided 22 Oct (Joakim):** a crit-chance bonus from position or luck is paid by value, `Δc' = Δc × 0.5 / (D − β)`; jackpots back to ×1.35, and the gambler synergy is gone. | `balance.md` §4a, `items.md` §13 | jackpot builds would dominate |
| P23 | ~~**The hit rules moved the classes 2–13% against the fighter.**~~ **Decided 22 Oct (Joakim):** rule: a hit-rule change never rebalances the classes. Attack (special attack for casters) re-solved by bisection: barbarian 1.20, paladin 0.95, ranger 1.12, rogue 1.07, monk 0.93, cleric 0.77, druid 0.82, bard 0.78, wizard 1.09, sorcerer 1.22, warlock 1.03. | `balance.md` §3 | casters and rangers would quietly fall behind |
| P24 | ~~**Morale growth is not in the foe curve.**~~ **Decided 22 Oct (Joakim):** foes and bosses carry `g(L) = 1 + ½ b/(b + 6)` with the expected bond `b(L) = 5(L − 1)/29` (×1.23 at level 30); the streak counts at most +3; corruption costs −1 pack morale per 10. | `balance.md` §3 | the late game would have been about a quarter too easy |
| P25 | ~~**The monk starts with one more modifier point.**~~ **Decided 22 Oct (Joakim): kept.** 12 ×6 stays (6 modifier points against 5, about 5 pp ahead at level 1). | `balance.md` §3 | accepted |
| P10 | ~~**Late-game level gap (about 40 minutes)** is a consequence of the XP curve, not a decision.~~ **Resolved 22 Oct (arithmetic):** the stretch plan gives 30 minutes a level, flat; the 40-minute figure withdrawn; combat density rises from about 6 to 12 fights an hour, kept. | §9 | it may feel too slow, or the exponent 1.6 may be wrong |

## The to-do list

Each item produces: the derivation written into the document, a mark (D / J / B / U) on every number, a sensitivity line
(what if ±20%) and the check the sim must pass. **Item 1 comes first because it makes the others cheaper.**

| # | task | the numbers and equations to examine |
|---|---|---|
| 1 | **(model built 20 Oct; docs not yet regenerated from it, and it lags the rules, P17)** **One model, one place.** Write `tools/balance-model.js`: a single parameter block and the equations, printing every table in the three documents. Docs are regenerated from it, so they cannot drift. | all of them |
| 2 | **XP and level pacing** | `12 × L^1.6`; 30,597 total; fights per level (2, 3, 5, 6, 7, 8); the 0.8 share; boss = 4 fights, challenge = 3; the level-up gap by level; the first two levels |
| 3 | **Base stats, gear and talents** | attack 5 + 2.2/level, defence 3 + 1.8, HP 44 + 11; gear tiers at 1, 5, 10, 16, 22, 28 and why those gaps; gear shares 80 / 68 / 22; talents 0.45 / 0.375 / 2.1 and the 30% stat-pick assumption |
| 4 | **Damage and the foe model** | `attack × mul − defence × 0.5`; ±15%; foe HP = 4× basic hit; foe defence `1 + 0.95(L−1)`; foe attack from 16 / 14 / 12% of fighter HP; foes per fight 2.5 / 3 / 3.2 |
| 5 | **(done 20 Oct: 3.6–4.1 basic hits a round in normal fights, 2.3–2.7 against one boss)** **Pack damage and fight length (P2)** | derive the pack damage per round for real pack mixes (fighter + cleric + wizard, etc.); rounds per fight; HP lost per fight; fix the 3–4 round promise |
| 6 | **(done 21 Oct: two rules, softening on defeat, co-op scaling)** **Bosses (P1)** | HP multiples; hit at 20% of fighter HP; rounds 8–12; the win-rate table; co-op +25% per player; telegraphed attacks |
| 7 | **(open; now also the ability scores, P14)** **Classes (P3)** | derive HP / attack / defence / speed multipliers from the power split; mana pools L1 → L30; casts per fight; mana restored 10% per win |
| 8 | **Skills** | the cost rule `1 + 3(mul × targets − 1) + status`; status costs (slow 1, root 2, weaken/hex 2, stun 3, confuse 4); every skill's multiplier, AP and mana; the "2 to 8 mana" bounds |
| 9 | **(rewritten 21 Oct as one formula, `balance.md` §4a; constants still to mark)** **Hit chances (P6)** | bases 90 / 75 / 100 (now replaced by the formula); class modifiers; cover −20 / −40; range −10 a tile; flank, guard, stun, surprise; clamp 15–95; mercy +15; resist `80 − 2/level`, ×1.0 / 0.8 / 0.5; crit 8%, ×1.5, cap 50; the 82% average |
| 10 | **Encounters, routes and time (P7, P9)** | chance per step 3.0 / 3.5 / 6.0 / 2.0%; safe ends 10; gap 12; route lengths vs the real map; walking 4.6 tiles/s × 1.4; planned ÷ needed 1.05–1.20; patrol 1.5× XP; dungeon floors; minutes per fight, boss, challenge; the 15.5 hours |
| 11 | **Gold and prices** | `F = 1.15 × 3 × (2 + 0.9L)`; boss 6F, chest 1.5F, main quest 4F; potions 25%; price multiples 4 / 2.5 / 1.8 / 1.5 / 0.4 / 0.5 / 2.5; sell 35%; craft 40%; coverage 66–84%; the half-gold loss |
| 12 | **Items** | the power-point rates (1 pp = 1% attack = 1% HP = 2.5% defence = 2% crit = 1% dodge = ⅓ speed = 0.25% regen); slot budgets; unique +25%; affix 3 / 4 pp; set 10 pp; crafted +15%; materials 3 + tier; drop rates 40 / 8 / 6%; the 11-minute upgrade claim; weapon family multipliers |
| 13 | **Progression and cadence (P10)** | the unlock times; the reward cadence; talents one per level, 3 offered, about 8 skills; the 10-minute rule against a 40-minute late level |
| 14 | **UI numbers (P8)** | tap budgets; frequencies; the highlight limit of three; target size 44 px; text 14 / 18 px; contrast 4.5:1; hit-chance colours at 80 / 50 |
| 15 | **(done 22 Oct: design.md, balance.md, ui-design.md, vision.md, gate1-review.md, HANDOFF, ROADMAP, tech-plan)** **Cross-check the documents** | every number appears in one place and nowhere else; no two files disagree; update `gate1-review.md`; fix `design.md` references |
| 16 | ~~**Sensitivity runs**~~ **done 21 Oct** for combat (`balance.md` §11, `tools/balance-sensitivity.js`); pacing by arithmetic; still open: a skipped gear tier, ranged hit alone, status resist, the real map. | move ten key numbers ±20% in the model (XP exponent, hit rates, foe HP, gold, encounter rate, gear share, boss k, mana, mercy, minutes per fight); list the ones that break a feeling; those get the first playtest questions |

## When it is done

- Every number has a letter (D / J / B / U) and a reason.
- Every **U** has a sim output or a playtest question attached.
- The model script regenerates the tables and the documents match it exactly.
- A short "numbers I am least sure of" list sits at the top of `balance.md` so the first playtests know where to look.
