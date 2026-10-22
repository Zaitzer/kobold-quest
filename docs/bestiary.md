# Kobold Quest: bestiary (every opponent, 22 Oct 2026)

*Part of the design document (`design.md`). Every number here is **derived** from the balance rules (`balance.md`): a foe is a
**role** applied to the level foe of the level table, at the level of the place it lives in. The tables are printed by
`node tools/content-tables.js foes` and `mixes`; regenerate them rather than editing by hand. Arithmetic only, nothing simulated.*

## 1. The rules every foe follows

- **The bond factor (decided 22 Oct, `balance.md` §3, P24):** every foe's HP and damage carry `g(L) = 1 + ½ b/(b + 6)`, the pack's
  expected bond at that level (×1.05 at level 5, ×1.10 at 10, ×1.18 at 20, ×1.23 at 30). The tables below include it; XP and gold do not.
- **Stats = role × the level foe at the place's level.** The level foe is the one in the level table: HP 4 basic hits, attack set so a
  hit takes 16 / 14 / 12% of the fighter's HP, defence 1 + 0.95 × (level − 1). A foe met in a higher place uses that place's level.
- **Weight** is how much of a fight a foe counts as: `√(effective HP × damage)`, relative to a normal foe (D). **A fight's foes add
  up to the target weight** (3.33 at levels 1–5, 4 at 6–12, 4.27 after: a pack of four), so a fight of one brute and two scouts
  is as long and as dangerous as four normal foes.
- **XP follows effective HP** (XP per basic hit of HP defeated, `balance.md` §5): a foe that takes more hits to fell pays more.
  Gold follows weight.
- **Elements:** each town's creatures share **one weakness and one resistance**, and every element is a weakness exactly once,
  so every caster has a town where it shines:

| town and its places | weak to | resists |
|---|---|---|
| Pebblebrook (R1, the mine) | earth | storm |
| Sunhaven (R2, the honey cellars) | nature | earth |
| Emberreach (R3, the crater) | frost | fire |
| Frostwick (R5, the ice cellars) | fire | frost |
| Saltspray (R6, R7, the shipwreck, the island cave) | storm | fire |
| kobolds of any side (Nettlenose, guards) | — | — |

- **Cartoon rules:** nobody dies. A beaten foe storms off, falls asleep, or scuttles away.
- **Luck:** foes have none (0), except where noted.

## 2. Roles

| role | HP | attack | defence | sp.def | dodge | init | move | res | weight (D) | XP × (D) | foe hit on the fighter at L18 | note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| normal | ×1.00 | ×1.00 | ×1.00 | ×1.0 | 10 | 10 | 4 | 0 | 1.00 | ×1.00 | 16% of HP | the yardstick |
| brute | ×1.60 | ×1.20 | ×1.60 | ×1.0 | 3 | 8 | 3 | 0 | 1.52 | ×1.70 | 22% of HP | slow, hard to hurt, hits hard |
| quick | ×0.70 | ×0.85 | ×0.70 | ×0.8 | 22 | 12 | 6 | 0 | 0.75 | ×0.75 | 12% of HP | hard to hit, falls fast |
| ranged | ×0.80 | ×0.90 | ×0.80 | ×0.8 | 10 | 10 | 4 | 0 | 0.80 | ×0.76 | 14% of HP | shoots from afar (steadiness 6) |
| caster | ×0.75 | ×1.10 | ×0.60 | ×1.6 | 10 | 10 | 4 | 10 | 0.89 | ×0.68 | 19% of HP | uses special attack; resists magic |
| elite | ×2.00 | ×1.25 | ×1.30 | ×1.2 | 25 | 11 | 4 | 10 | 1.92 | ×2.57 | 23% of HP | a patrol leader: worth more |
| swarm | ×0.40 | ×0.60 | ×0.50 | ×0.5 | 15 | 11 | 5 | 0 | 0.39 | ×0.38 | 7% of HP | comes in numbers |

## 3. Every opponent

| foe | role | levels | where | weak / resists | stats at level (L) | weight | XP | gold | uses | how it fights | drops |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Cellar rat** | swarm | 1–2 | Mallow's cellar (set-piece) | — / — | L1: HP 15, atk 7, def 1, sp.def 1, dodge 15, init 11, move 5, res 0 | 0.42 | 1 | 1 | — | runs at the nearest kobold in twos and threes; flees at low HP | — |
| **Guard recruit** | normal | 2–3 | the castle yard drill (set-piece) | — / — | L2: HP 43, atk 15, def 2, sp.def 2, dodge 10, init 10, move 4, res 0 | 1.00 | 5 | 4 | — | guards (dodge +25) when hurt; a tutorial in cover | — |
| **Nettlenose scout** | quick | 3–30 | every road as the story goes on | — / — | L5: HP 71, atk 26, def 3, sp.def 4, dodge 22, init 12, move 6, res 0 | 0.76 | 10 | 6 | unseen in tall grass | ambushes from grass, hits the most hurt kobold, slips away | moss or the zone's material |
| **Nettlenose slinger** | ranged | 3–30 | every road | — / — | L5: HP 81, atk 27, def 4, sp.def 4, dodge 10, init 10, move 4, res 0 | 0.80 | 10 | 6 | — | keeps 5–6 tiles away behind cover; retreats when a kobold comes close | the zone's material |
| **Snatchclaw's guard** | normal | 8–30 | roads, toll gates, barracks, castle | — / — | L12: HP 219, atk 59, def 11, sp.def 11, dodge 10, init 10, move 4, res 0 | 1.00 | 36 | 15 | — | shield wall: guards an ally beside it; taunts (threat ×2) | gold scrap |
| **Guard sergeant** | elite | 16–30 | R4, the castle, patrols | — / — | L20: HP 779, atk 135, def 25, sp.def 23, dodge 25, init 11, move 4, res 10 | 1.93 | 167 | 44 | weaken (shout) | leads a patrol; shouts weaken at the pack; calls a guard if alone | boss fang (10%) |
| **Copper beetle** | brute | 3–8 | R1, the mine | earth / storm | L5: HP 162, atk 37, def 8, sp.def 5, dodge 3, init 8, move 3, res 0 | 1.50 | 21 | 11 | — | charges in a line; curls up (defence ×2) for a turn when hurt | moss, gold scrap |
| **Glow grub** | caster | 5–8 | the mine | earth / storm | L7: HP 91, sp.atk 39 (atk 19), def 4, sp.def 11, dodge 10, init 10, move 4, res 10 | 0.89 | 12 | 8 | slow (sticky spit) | spits from range at the kobold with the lowest defence; lights the dark tiles | gold scrap |
| **Sand skink** | quick | 8–13 | R2, the oasis | nature / earth | L10: HP 140, atk 44, def 7, sp.def 8, dodge 22, init 12, move 6, res 0 | 0.75 | 20 | 10 | poison (bite) | darts in, bites, darts out; hides under sand (unseen) on sand tiles | sand glass |
| **Cellar bee** | swarm | 10–13 | the honey cellars | nature / earth | L11: HP 81, atk 33, def 5, sp.def 5, dodge 15, init 11, move 5, res 0 | 0.39 | 12 | 5 | poison (sting) | flies over terrain in a cloud of three; goes for the healer | sand glass, reed |
| **Wax golem** | brute | 11–13 | the honey cellars | nature / earth | L12: HP 350, atk 71, def 18, sp.def 11, dodge 3, init 8, move 3, res 0 | 1.52 | 61 | 22 | slow (wax) | plods, leaves wax tiles (slow) behind it; melts (defence ×0.5) when burned | sand glass |
| **Rock goat** | brute | 13–16 | R3, the pass | frost / fire | L14: HP 380, atk 83, def 21, sp.def 13, dodge 3, init 8, move 3, res 0 | 1.53 | 63 | 26 | fall (charge) | charges two tiles and knocks the target down (fall); butts kobolds off ledges | gold scrap |
| **Stoker** | caster | 13–18 | R3, the crater | frost / fire | L15: HP 230, sp.atk 91 (atk 45), def 9, sp.def 23, dodge 10, init 10, move 4, res 10 | 0.90 | 28 | 16 | burn | throws embers that burn; stokes hot tiles around itself | gold scrap |
| **Magma slug** | brute | 15–18 | the crater | frost / fire | L17: HP 541, atk 110, def 26, sp.def 16, dodge 3, init 8, move 3, res 0 | 1.52 | 85 | 30 | burn (hot trail) | leaves a trail of hot tiles (burn on entry); very slow | gold scrap, boss fang (5%) |
| **Snow beast** | brute | 19–22 | R5, the snowfield | fire / frost | L20: HP 623, atk 129, def 30, sp.def 19, dodge 3, init 8, move 3, res 0 | 1.52 | 111 | 35 | fall (ice) | stamps ice tiles around it (fall on entry); hugs (root) when adjacent | frost shard |
| **Frost guard** | normal | 19–23 | R5, the draft outpost | fire / frost | L21: HP 468, atk 110, def 20, sp.def 20, dodge 10, init 10, move 4, res 0 | 1.00 | 70 | 24 | slow (frost spear) | a guard with a frost spear: reach 2, slows on hit | frost shard |
| **Ice mite** | swarm | 20–23 | the ice cellars | fire / frost | L22: HP 198, atk 68, def 10, sp.def 10, dodge 15, init 11, move 5, res 0 | 0.40 | 28 | 10 | fall (slick) | skitters in fours; makes the floor slick where it dies | frost shard |
| **Shore crab** | brute | 23–27 | R6, R7, the shipwreck | storm / fire | L24: HP 830, atk 150, def 37, sp.def 23, dodge 3, init 8, move 3, res 0 | 1.53 | 129 | 41 | — | armoured (defence ×1.6); pinches and holds (root) the kobold in front | pearl, reed |
| **Smuggler** | quick | 23–26 | R6, the shipwreck | storm / fire | L24: HP 363, atk 106, def 16, sp.def 18, dodge 22, init 12, move 6, res 0 | 0.75 | 57 | 20 | unseen (hides) | hides in crates (unseen), strikes, pockets gold (−1% of the pack's gold, given back on defeat) | reed, pearl |
| **Sea guard** | ranged | 25–27 | R7, the islands | storm / fire | L26: HP 448, atk 121, def 20, sp.def 20, dodge 10, init 10, move 4, res 0 | 0.79 | 66 | 23 | — | throws harpoons (steadiness 4); pulls a kobold one tile closer on hit | pearl |
| **Cave eel** | caster | 26–27 | the island cave | storm / fire | L27: HP 484, sp.atk 168 (atk 84), def 15, sp.def 41, dodge 10, init 10, move 4, res 10 | 0.90 | 63 | 27 | — | storm bolts that chain to one more kobold; lives in water tiles (cover) | pearl |
| **Royal guard** | elite | 27–30 | the castle | — / — | L29: HP 1341, atk 210, def 36, sp.def 33, dodge 25, init 11, move 4, res 10 | 1.94 | 263 | 63 | stun (shield bash) | guards Snatchclaw's hall in pairs; shield-bash stun; never flees | boss fang (15%) |
| **Castle crossbow** | ranged | 27–30 | the castle walls | — / — | L29: HP 536, atk 151, def 22, sp.def 22, dodge 10, init 10, move 4, res 0 | 0.79 | 78 | 26 | — | fires from the walls (full cover) at 8–10 tiles; steadiness 3 | gold scrap |

## 4. Who you meet where (typical groups)

The game picks a group from the place's foes whose weights add up to the target (within 10%). Three examples per place:

| place | level | target weight | three typical groups (weight) |
|---|---|---|---|
| R1 (the capital gate → Pebblebrook) | 4 | 3.33 | 1 nettlenose scout + 1 nettlenose slinger + 1 copper beetle (3.05); 1 nettlenose scout + 3 nettlenose slinger (3.17); 2 nettlenose scout + 2 nettlenose slinger (3.13) |
| the mine (Pebblebrook) | 7 | 4.00 | 1 copper beetle + 2 glow grub + 1 nettlenose scout (4.05); 1 copper beetle + 1 glow grub + 2 nettlenose scout (3.91); 2 glow grub + 3 nettlenose scout (4.04) |
| R2 (→ Sunhaven) | 10 | 4.00 | 1 snatchclaw's guard + 3 sand skink + 1 nettlenose slinger (4.05); 1 snatchclaw's guard + 2 sand skink + 2 nettlenose slinger (4.10); 1 snatchclaw's guard + 1 sand skink + 3 nettlenose slinger (4.14) |
| the honey cellars (Sunhaven) | 12 | 4.00 | 1 cellar bee + 1 wax golem + 3 sand skink (4.16); 4 cellar bee + 1 wax golem + 1 sand skink (3.83); 1 cellar bee + 2 wax golem + 1 sand skink (4.19) |
| R3 (→ Emberreach) | 15 | 4.27 | 1 rock goat + 2 stoker + 1 nettlenose slinger (4.11); 1 rock goat + 1 stoker + 2 nettlenose slinger (4.01); 3 stoker + 2 nettlenose slinger (4.28) |
| the crater (Emberreach) | 17 | 4.27 | 2 stoker + 1 magma slug + 1 nettlenose scout (4.06); 1 stoker + 1 magma slug + 2 nettlenose scout (3.92); 1 stoker + 1 magma slug + 3 nettlenose scout (4.66) |
| R4, the bun road | 17 | 4.27 | 1 snatchclaw's guard + 1 guard sergeant + 1 nettlenose slinger + 1 nettlenose scout (4.48); 1 guard sergeant + 2 nettlenose slinger + 1 nettlenose scout (4.27); 2 snatchclaw's guard + 1 nettlenose slinger + 2 nettlenose scout (4.29) |
| R5 (→ Frostwick) | 21 | 4.27 | 1 snow beast + 2 frost guard + 1 nettlenose scout (4.28); 1 snow beast + 1 frost guard + 2 nettlenose scout (4.02); 2 frost guard + 3 nettlenose scout (4.23) |
| the ice cellars (Frostwick) | 22 | 4.27 | 2 ice mite + 1 snow beast + 2 frost guard (4.33); 4 ice mite + 1 snow beast + 1 frost guard (4.12); 1 ice mite + 2 snow beast + 1 frost guard (4.47) |
| R6 (→ Saltspray) | 24 | 4.27 | 1 shore crab + 1 smuggler + 2 snatchclaw's guard (4.28); 1 shore crab + 2 smuggler + 1 snatchclaw's guard (4.02); 3 smuggler + 2 snatchclaw's guard (4.23) |
| the shipwreck (Saltspray) | 25 | 4.27 | 1 shore crab + 3 smuggler + 1 nettlenose slinger (4.56); 1 shore crab + 2 smuggler + 2 nettlenose slinger (4.61); 2 shore crab + 1 smuggler + 1 nettlenose slinger (4.61) |
| R7 and the islands | 26 | 4.27 | 1 shore crab + 3 sea guard (3.91); 2 shore crab + 2 sea guard (4.66); 2 shore crab + 1 sea guard (3.87) |
| the island cave | 27 | 4.27 | 2 cave eel + 1 shore crab + 1 sea guard (4.12); 1 cave eel + 1 shore crab + 2 sea guard (4.01); 3 cave eel + 2 sea guard (4.27) |
| the march and the castle | 29 | 4.27 | 2 castle crossbow + 1 snatchclaw's guard + 1 guard sergeant (4.53); 1 royal guard + 2 castle crossbow + 1 snatchclaw's guard (4.53); 1 royal guard + 1 castle crossbow + 1 guard sergeant (4.69) |

**Visible patrols** are the same groups led by a guard sergeant or a brute, standing on the map: the player can avoid them or walk
up to them. Their XP is higher because their leader is worth more, not by a separate multiplier.

## 5. Bosses (one row each; HP and hits come from the boss rules in `balance.md` §4)

| boss | level | where | element | what it does | adds | drops |
|---|---|---|---|---|---|---|
| **Grubb** the toll boss | 5 | the mill road | — | loud and easy to read: a big telegraphed swing every third round | 2 Nettlenose scouts on round 4 | Toll pot (helm, T2) |
| **Snipe** the copper snatcher | 8 | the mine | — | rides a copper cart behind cover (full cover against ranged); leaves it to throw | none | Copper-cart wheel (shield, T2) |
| **Sunhaven guard captain** | 12 | the barracks by the oasis | — | drains the oasis tiles one by one (dry tiles slow); stands in the last wet one | 2 guards | Drain-key (neck, T3) |
| **Emberreach guard captain** | 16 | the seized ovens | — | seizes ovens: hot tiles around him burn on entry | 1 stoker | Oven mitts (ring, T4) |
| **Snatchclaw** (Emberreach) | 18 | the forge square | — | talks the pack into standing down: a confuse on one kobold every third round instead of the big attack | 2 guards | Captain's sash (cloak, T4) |
| **Bun-road toll captain** | 18 | the R4 toll gate | — | brings a guard every third round until the gate bell is rung | guards, one at a time | Bun satchel (armour, T4) |
| **Draft sergeant** | 22 | the draft outpost on R5 | — | "drafts" a kobold for three turns (it fights for him, a confuse) | 1 frost guard | Sergeant's whistle (neck, T5) |
| **Pier captain** | 26 | the harbour | — | fights from a boat at range (steadiness 3); the pack must bring him to the pier | 2 sea guards | Net cloak (cloak, T6) |
| **Castle commander** | 28 | the castle gate | — | a wall of royal guards that opens in phases (75 / 50 / 25%) | royal guards, two per phase | Marble gauntlets (ring, T6) |
| **Snatchclaw** (castle) | 29 | the throne room | — | runs for the tower fire; whoever has the most threat must hold him | 2 royal guards | Throne splinter (helm, T6) |
| **Glitterbeak** | 30 | the castle roof | weak to **fire**, resists **frost** | cold: heals when he eats buns (a telegraphed dive at the bun cart), loses it while the pack's embers glow; **luck 2** (a dragon's luck) | none | Warm scale (neck, T6) |

Every boss has 5 dodge, 11 initiative and 10 resistance, attacks once per kobold slot each round (four), and softens 10% after each defeat.

## 6. What is cut

The first slice's foes (Gorb, Vexx, the hoard guards, bog frogs, fog wisps, owls, dune bandits, spore critters, sea bandits) are
retired at the progress reset. The Mossbacks are farmers, not foes.
