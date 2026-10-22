# Kobold Quest: items (targets, v1, 20 Oct 2026; every item, 22 Oct)

*Part of the design document (`design.md`). The numbers match `balance.md` (same model). This is what the items should be,
not what the engine holds today. The current item tables in the code are replaced by these.*

## 1. How items are balanced (one rule, so nothing is guessed)

**Power points.** Every stat is priced in *power points* (pp), where 1 pp is worth the same in play whatever the stat:

| 1 pp = | at the tier's entry level |
|---|---|
| +1% attack | 1% of base attack |
| +1% HP | 1% of base HP |
| +2.5% defence | defence is worth less per point (each point removes only half a point of damage) |
| +2% crit chance | at ×1.5; in general crit is priced by expected value with a risk premium (`balance.md`, "Crit builds") |
| +1% dodge | |
| +1% accuracy | the same as dodge; it also adds `1 ÷ steadiness` tiles of reach |
| +⅓ speed | 3 pp = 1 speed |
| +0.25% HP regen per turn | |
| +1% mana | of base mana |
| +1% special attack | like attack (spell damage) |
| +2.5% special defence | like defence |
| +1 accuracy, +1 dodge | 1 point each (accuracy also adds reach) |
| +1 initiative | acting first is worth about 1.1% of a fight's output (`balance.md` §3, the new stats) |
| +2.4% armour piercing | 10% piercing is +4.2% damage, weighted over normal and heavy foes |
| +3 resistance | one point cuts spell damage taken by about 0.12% and statuses landing by 1 point; the 40% resist cap makes it saturate (corrected 22 Oct from 5) |
| −1 steadiness (a point per tile) | about +5% ranged damage at the average distance; **5 pp per point** |
| +0.2 luck (+1 luck = **5 pp**) | luck tilts every roll in the wearer's favour: about +2.7% output and −2% damage taken per point |
| +1 to an ability score = **2.5 pp** | +2 to a score is +1 modifier (5 pp) |
| +1 morale on one kobold = **7 pp** | the first point; the morale curve saturates |
| threat ±any | **0 pp**: it only moves the foes' attacks between kobolds |
| +1 reach | **10 pp** (J): an extra tile at 75% damage, used about a third of the time |
| Pip only: +1 Might or Wits = 5.6 pp; +1 Leadership = 6.5 pp | pack-wide stats, four kobolds each |

**Slot budgets** (the same in every tier; the *numbers* grow with the tier because pp are percentages of the base stats at
the level the tier arrives):

| slot | budget | share of the whole kit |
|---|---|---|
| weapon | 60 pp attack | the headline: 60 of the 80 attack points |
| armour | 14 pp defence | the biggest defence piece |
| shield | 5 pp defence + 3 pp attack | |
| helm | 4 pp defence + 3 pp HP | |
| boots | 4 pp speed + 2 pp defence | |
| cloak | 5 pp HP + 2 pp defence | |
| neck | 7 pp attack + 4 pp HP | |
| ring (two) | 5 pp attack + 5 pp HP each | |

A full tier kit gives about **+80% of base attack, +68% of base defence and +22% of base HP**, which is what the level
table in `balance.md` assumes. A new tier lifts attack by +40% (T2), +25% (T3), +18% (T4), +13% (T5), +10% (T6): dramatic early,
modest late (`balance.md` §3, P5).

**Tiers** arrive at levels **1, 5, 10, 16, 22 and 28** and appear in shops one level earlier (so a player who has saved up
meets them just before they need them). Item stat numbers are in section 3.

## 2. Weapons

Each class uses one *family*. Every family has six tiers, with the same price per tier, and a modifier on the weapon's
attack (the number is the multiplier on the tier's weapon power: 3, 8, 15, 23, 31, 39).

| family | classes | ×power | range and feel | T1 | T2 | T3 | T4 | T5 | T6 |
|---|---|---|---|---|---|---|---|---|---|
| blades | fighter, paladin | 1.00 | melee 1, balanced | Stick | Bone | Copper sword | Iron sword | Frost-forged blade | Ember blade |
| axes | barbarian | 1.15 | melee, heavy (ends the turn), −1.5 speed | Knobbly club | Spiked club | Stone axe | Basalt axe | Glacier axe | Magma maul |
| guns | ranger | 0.95 | steadiness by tier (6, 5, 12 close-range, 4, 3.5, 3 points per tile), quick | Popgun | Reed bow | Blunderbuss | Longbow | Frost musket | Ember cannon |
| daggers | rogue | 0.85 | melee 1, quick, +crit | Butter knife | Dagger | Hook-knife | Dart pipe | Frost stiletto | Shadow blade |
| fists | monk | 0.80 | melee 1, quick, multi-hit skills | Wraps | Knuckle-wraps | Bell gloves | Iron wraps | Frost gauntlets | Ember fists |
| wands | wizard | 1.00 | steadiness 3 (reach 14), 10% resisted for half damage | Frost rod | Fire wand | Birch staff | Archstaff | Frost staff | Ember staff |
| orbs | sorcerer | 1.05 | steadiness 4 (reach 11), a little unstable | Spark stone | Ember stone | Cinder orb | Flame heart | Frost heart | Dragon heart |
| teapots | warlock | 0.95 | steadiness 2.5 (reach 17), steady | Chipped teapot | Brass teapot | Copper kettle | Silver pot | Frost samovar | Dragon-glaze urn |
| holy | cleric | 0.60 | steadiness 5 (reach 9), **+15% healing**; healing never rolls | Healing wand | Oak crook | Sun-bell | Ember censer | Frost chime | Hearthspire lantern |
| nature | druid | 0.85 | steadiness 4 (reach 11), +10% plant skills | Twig | Root staff | Moss staff | Bramble crook | Frost-bark staff | Ember-wood staff |
| instruments | bard | 0.60 | steadiness 5 (reach 9), **+15% song strength** | Whistle | Fiddle | Lute | Drum | Frost horn | Golden harp |

**Why the multipliers:** the healer, the bard and the druid win by their skills, not their weapons, so their weapons carry
less raw attack and more of the budget goes to the skill bonus (the 15% on top). The barbarian trades speed for damage.
The daggers and fists hit weaker but twice as often.

**Weapon power by tier and family** (rounded):

| family | T1 | T2 | T3 | T4 | T5 | T6 |
|---|---|---|---|---|---|---|
| blades, wands | 3 | 8 | 15 | 23 | 31 | 39 |
| axes | 3 | 10 | 17 | 26 | 35 | 44 |
| guns, teapots | 3 | 8 | 14 | 22 | 29 | 37 |
| orbs | 3 | 9 | 16 | 24 | 32 | 41 |
| daggers, nature | 3 | 7 | 13 | 19 | 26 | 33 |
| fists | 2 | 7 | 12 | 18 | 25 | 31 |
| holy, instruments | 2 | 5 | 9 | 14 | 18 | 23 |

A starter weapon (T1) is free. The best weapon on sale in a town is the one for the tier that has just arrived.

**Spell weapons** (wands, orbs, teapots, holy, nature, instruments): their power is **special attack**, not attack, and each one casts
its basic spell in an **element** (the town tables in `bestiary.md` say who is weak to what). Holy and instruments are elementless:
healing and songs never meet a resistance.

| family | T1 | T2 | T3 | T4 | T5 | T6 |
|---|---|---|---|---|---|---|
| wands | Frost rod (frost) | Fire wand (fire) | Birch staff (nature) | Archstaff (storm) | Frost staff (frost) | Ember staff (fire) |
| orbs | Spark stone (fire) | Ember stone (fire) | Cinder orb (fire) | Flame heart (fire) | Frost heart (frost) | Dragon heart (fire) |
| teapots | Chipped teapot (fire) | Brass teapot (fire) | Copper kettle (storm) | Silver pot (frost) | Frost samovar (frost) | Dragon-glaze urn (fire) |
| holy | Healing wand (—) | Oak crook (—) | Sun-bell (—) | Ember censer (—) | Frost chime (—) | Hearthspire lantern (—) |
| nature | Twig (nature) | Root staff (earth) | Moss staff (nature) | Bramble crook (nature) | Frost-bark staff (frost) | Ember-wood staff (earth) |
| instruments | Whistle (—) | Fiddle (—) | Lute (—) | Drum (—) | Frost horn (frost) | Golden harp (—) |

## 3. The other slots: names and numbers by tier

(Stat numbers are for the reference fighter and are the *same* for every class; the cost of a slot is the same for all.)

| slot | T1 (L1) | T2 (L5) | T3 (L10) | T4 (L16) | T5 (L22) | T6 (L28) |
|---|---|---|---|---|---|---|
| **armour** | Leather vest · +1.0 def | Padded jacket · +3.6 def | Scale mail · +6.7 def | Basalt plate · +11 def | Frostfur coat · +14 def | Ember plate · +18 def |
| **shield** | Pot lid · +0.4 def, +0.1 atk | Pan guard · +1.3 def, +0.4 atk | Spiked shield · +2.4 def, +0.7 atk | Basalt buckler · +3.8 def, +1.1 atk | Ice slab · +5.1 def, +1.5 atk | Baker's tray · +6.5 def, +1.9 atk |
| **helm** | Leaf crown · +0.3 def, +1.3 HP | Iron pot · +1.0 def, +2.6 HP | Bucket helm · +1.9 def, +4.3 HP | Copper kettle · +3.0 def, +6.3 HP | Frostfur hood · +4.1 def, +8.3 HP | Pearl circlet · +5.2 def, +10 HP |
| **boots** | Frog boots · +1.3 spd, +0.2 def | Quick boots · +1.3 spd, +0.5 def | Iron boots · +1.3 spd, +1.0 def | Ember treads · +1.3 spd, +1.5 def | Snowshoes · +1.3 spd, +2.0 def | Sea-legs · +1.3 spd, +2.6 def |
| **cloak** | Moss cape · +2.2 HP, +0.2 def | Cozy scarf · +4.4 HP, +0.5 def | Shadow cloak · +7.2 HP, +1.0 def | Honey-silk cloak · +10 HP, +1.5 def | Frostfur cloak · +14 HP, +2.0 def | Ember mantle · +17 HP, +2.6 def |
| **neck** | Snail-shell charm · +0.4 atk, +1.8 HP | Glowcap pendant · +1.0 atk, +3.5 HP | Dragon tooth · +1.7 atk, +5.7 HP | Honey-glass charm · +2.7 atk, +8.4 HP | Frost pearl · +3.6 atk, +11 HP | Ember locket · +4.5 atk, +14 HP |
| **ring** (wear two) | Copper ring · +0.3 atk, +2.2 HP | Honey ring · +0.7 atk, +4.4 HP | Gold-scrap ring · +1.2 atk, +7.2 HP | Ember ring · +1.9 atk, +10 HP | Ice ring · +2.6 atk, +14 HP | Pearl ring · +3.2 atk, +17 HP |

**Variants (the same budget, spent differently).** Every armour, helm and cloak also comes as:
- a **robe** (for casters): half the defence becomes mana, 1 pp = 1% of base mana;
- a **scout** version (for rangers, rogues and monks): half the defence becomes speed, 3 pp = 1 speed.

The variants are sold in the same shops at the same prices. They exist so a wizard is not forced to wear a vest.

| slot · variant | T1 (L1) | T2 (L5) | T3 (L10) | T4 (L16) | T5 (L22) | T6 (L28) |
|---|---|---|---|---|---|---|
| armour · **robe** (casters) | Apprentice robe · +0.5 def, +0.8 mana | Scribe's robe · +1.8 def, +1.2 mana | Sand-silk robe · +3.4 def, +1.6 mana | Ember robe · +5.3 def, +2.1 mana | Frost-weave robe · +7.1 def, +2.6 mana | Pearl robe · +9 def, +3.1 mana |
| armour · **scout** (ranger, rogue, monk) | Twig jerkin · +0.5 def, +2.3 spd | Runner's vest · +1.8 def, +2.3 spd | Sand-scale jerkin · +3.4 def, +2.3 spd | Basalt-lite vest · +5.3 def, +2.3 spd | Snow-scout coat · +7.1 def, +2.3 spd | Shore-scout coat · +9 def, +2.3 spd |
| helm · **robe** (casters) | Cloth cap · +0.2 def, +0.2 mana, +1.3 HP | Scholar's hat · +0.5 def, +0.3 mana, +2.6 HP | Honey-silk hood · +1 def, +0.5 mana, +4.3 HP | Ember hood · +1.5 def, +0.6 mana, +6.3 HP | Snow cowl · +2 def, +0.7 mana, +8.3 HP | Pearl cowl · +2.6 def, +0.9 mana, +10.2 HP |
| helm · **scout** (ranger, rogue, monk) | Feather band · +0.2 def, +0.7 spd, +1.3 HP | Scout's cap · +0.5 def, +0.7 spd, +2.6 HP | Goggles · +1 def, +0.7 spd, +4.3 HP | Ember visor · +1.5 def, +0.7 spd, +6.3 HP | Fur ear-flaps · +2 def, +0.7 spd, +8.3 HP | Gull-feather cap · +2.6 def, +0.7 spd, +10.2 HP |
| cloak · **robe** (casters) | Linen shawl · +0.1 def, +0.1 mana, +2.2 HP | Reading shawl · +0.3 def, +0.2 mana, +4.4 HP | Sun shawl · +0.5 def, +0.2 mana, +7.2 HP | Cinder shawl · +0.8 def, +0.3 mana, +10.5 HP | Fog shawl · +1 def, +0.4 mana, +13.8 HP | Tide shawl · +1.3 def, +0.4 mana, +17.1 HP |
| cloak · **scout** (ranger, rogue, monk) | Grass cape · +0.1 def, +0.3 spd, +2.2 HP | Dust cape · +0.3 def, +0.3 spd, +4.4 HP | Dune cape · +0.5 def, +0.3 spd, +7.2 HP | Ash cape · +0.8 def, +0.3 spd, +10.5 HP | White cape · +1 def, +0.3 spd, +13.8 HP | Sea-spray cape · +1.3 def, +0.3 spd, +17.1 HP |

**Prices** (a multiple of F₀, the gold of one pack-of-three fight at the tier's entry level; see `balance.md` §3):

| tier | F₀ | weapon (4F₀) | armour (2.5F₀) | shield, neck (1.8F₀) | helm, boots, cloak, ring (1.5F₀) |
|---|---|---|---|---|---|
| T1 | 10 | 40 | 25 | 18 | 15 |
| T2 | 27 | 108 | 68 | 49 | 41 |
| T3 | 42 | 168 | 105 | 76 | 63 |
| T4 | 64 | 256 | 160 | 115 | 96 |
| T5 | 83 | 332 | 208 | 149 | 125 |
| T6 | 102 | 408 | 255 | 184 | 153 |

A full kit for one kobold costs 17.6 F (T2: about 475 gold); a pack of four costs 70 F₀ (T2: about 1,900 gold). Prices here are in F₀, the pack-of-three gold per fight; income grows by 4/3 with a pack of four, so the coverage holds (`balance.md` §3). Spare gear
sells for 35% of the shop price.

## 4. Random bonuses (affixes)

Dropped gear (never shop gear) can have a bonus. A **prefix is worth 3 pp, a suffix 4 pp**; a piece with both is worth 7 pp.

| bonus | pays | |
|---|---|---|
| Sturdy | defence | prefix |
| Swift | speed | prefix |
| Mighty | attack | prefix |
| Hale | HP | prefix |
| Wise | mana | prefix |
| Keen | crit chance | prefix |
| Sly | dodge | prefix |
| of the Bear | HP and defence | suffix |
| of the Fox | speed and dodge | suffix |
| of the Owl | mana and sight | suffix |
| of the Boar | attack | suffix |
| of Thorns | defence | suffix |
| of Mending | regeneration | suffix |
| Arcane | special attack | prefix |
| Warded | special defence | prefix |
| Quick | initiative (+3) | prefix |
| Piercing | armour piercing (+7%) | prefix |
| Steady | −0.6 steadiness (guns and spell weapons only) | prefix |
| of Fortune | luck (+1: 5 pp, the one suffix that rounds up) | suffix |
| of the Rally | morale (+1 on the wearer: 7 pp, so it takes both bonus places) | prefix and suffix |
| of Warding | resistance (+12) | suffix |
| of Embers | 6% of hits burn | suffix |
| of Venom | 6% of hits poison | suffix |

Integer stats (luck, initiative, morale, resistance) are rounded, and what is left of the affix budget goes to HP.

**Drop chances for a gear drop:** plain 67%, one bonus 25%, both 8%. A both-bonus ring is worth about 70% more than a plain one
(7 pp on a 10 pp slot). **That is the whole point of looking at loot.** It is meant to be a pleasant surprise, not a
requirement. For the big slots (weapon, armour) a plain piece of the next tier always beats a both-bonus piece of the last
one; for the small slots (rings, neck) they come out about equal, which is fine, because it is a real choice.

## 5. Unique items (11 bosses, one each)

Bosses always drop their unique: the tier's normal budget **+25%** and one small passive. They are worn in the slot shown.

| boss | item | slot | tier | passive |
|---|---|---|---|---|
| Grubb | Toll pot | helm | T2 | +10% gold from fights |
| Snipe | Copper-cart wheel | shield | T2 | −10% damage from ranged attacks |
| Sunhaven captain | Drain-key | neck | T3 | regain 1 mana a turn |
| Emberreach captain | Oven mitts | ring | T4 | immune to heat tiles |
| Snatchclaw (Emberreach) | Captain's sash | cloak | T4 | +10% crit chance |
| Bun-road toll captain | Bun satchel | armour | T4 | potions heal +20% |
| Draft sergeant | Sergeant's whistle | neck | T5 | the first hit each fight ignores 20% defence |
| Pier captain | Net cloak | cloak | T6 | +10% dodge |
| Castle commander | Marble gauntlets | ring | T6 | +1 move |
| Snatchclaw (castle) | Throne splinter | helm | T6 | +5% damage |
| Glitterbeak | Warm scale | neck | T6 | regain 3% HP a turn |

## 6. Sets (one per town)

Each town has a set of three pieces. **Two pieces give 40% of the bonus, all three give all of it (10 pp worth)**, in the set's theme, on top of the
pieces' own stats (a three-piece set is therefore as good as an extra ring).
How you get the pieces: **one from the keeper's challenge** (guaranteed), **one from the town's hidden trial** (optional),
**one crafted** or bought.

| set | town (tier) | pieces | bonus |
|---|---|---|---|
| **Mossback regalia** | R1 and the farms (T1–T2) | Leaf crown, Moss cape, Frog boots | regain 2.5% HP a turn (= 10 pp; kept from the first game) |
| **Millers' set** | Pebblebrook (T2) | flour-dusted apron (armour), mill cap (helm), miller's boots | regain 2% HP a turn and +2 pp HP |
| **Honey-glass set** | Sunhaven (T3) | scribe's cap, honey-silk cloak, honey-glass charm | +5% mana, +1 sight, +5% to hit |
| **Bakers' set** | Emberreach (T4) | baker's hat, oven-glove ring, ember apron | +10 pp attack |
| **Fort set** | Frostwick (T5) | fort helm, ice slab, snow boots | +10 pp defence |
| **Harbour set** | Saltspray (T6) | sea-legs boots, pearl circlet, net cloak | +10% dodge |

The old Dragonbone, Glowcap and Shadow stalker sets are cut (their tiers no longer exist).

## 7. Consumables

| item | effect | price | where from |
|---|---|---|---|
| Potion | heals 35% of max HP | 8 | every shop |
| Hearty potion | 55% | 28 | from Sunhaven (T3) |
| Great potion | 75% | 60 | from Frostwick (T5) |
| Ether | 30% of max mana | 10 | every shop |
| Hearty ether | 50% | 30 | from Sunhaven (T3) |
| Great ether | 70% | 65 | from Frostwick (T5) |
| Phoenix feather | revives a fallen friend at 50% HP | 70 | from Pebblebrook (T2) |
| Golden feather | revives at 100% HP | 220 | from Frostwick (T5) |
| **Ember-bun** | full HP and mana for the whole pack | not for sale | **3 in the whole game** |
| Bun crumbs | cosmetic; the helper's reward when you help a friend | not for sale | co-op |

Potions are percentages, so the same potion works at level 3 and level 30. They cost 0.4–0.7 of one fight's gold, which is
why they are about a quarter of income.

## 8. Materials and crafting

**Six materials plus the boss fang**, each with a home (the rule from the first design: every material has a place):

| material | where it drops | the town that uses it |
|---|---|---|
| Moss tuft | R1, R4, the farms | Pebblebrook |
| Gold scrap | the mine, R3, the crater | Pebblebrook, Emberreach |
| Sand glass | R2, the honey cellars | Sunhaven |
| Reed | the oasis, R6 shore, R7 | Sunhaven, Saltspray |
| Frost shard | R5, the ice cellars | Frostwick |
| Pearl | R6, R7, the shipwreck, the island cave | Saltspray |
| Boss fang | every boss | any |

**A fight drops one material 40% of the time**, from its zone, so 10 materials per stretch.

**Crafting rule:** a crafted item has **15% more** budget than the shop version of its tier, costs **(3 + the tier number)
materials** of its home type, and **40% of the shop price in gold**. The smith crafts at Hearthspire (T1–T3), Pebblebrook
(T2–T3) and the Emberreach forge (T4–T6, and reforging).

| tier | recipes (materials → item) |
|---|---|
| T2 | 5 moss → **Moss cape+**; 5 gold scrap → **Copper pot-helm**; 3 moss and 2 gold scrap → **Miller's spear** (weapon) |
| T3 | 6 sand glass → **Sand-glass charm** (neck); 6 reed → **Reed sandals** (boots); 3 sand glass and 3 reed → **Honeycomb shield** |
| T4 | 7 gold scrap → **Gold-scrap ring+**; 5 gold scrap and 1 fang → **Basalt plate+**; 6 gold scrap and 1 fang → **Crater axe** (weapon) |
| T5 | 8 frost shards → **Frostfur cloak+**; 6 shards and 1 fang → **Ice slab+**; 7 shards → **Shard stiletto** (weapon) |
| T6 | 8 pearls → **Pearl circlet+**; 4 reed and 4 pearls → **Net cloak+**; 6 pearls and 2 fangs → **Harbour blade** (weapon) |

**Reforging** (re-roll the bonuses on a dropped piece) costs 30 gold at T1 and scales with the tier (about 0.3 F).

## 9. What the player finds, and how often

For a stretch of about 25 fights (2.5 hours):

| source | amount | note |
|---|---|---|
| materials | about 10 | 40% of fights |
| gear drops | about 2 | 8% of fights, at the stretch's tier; 15% of them are one tier up ("lucky") |
| consumables | about 1.5 | 6% of fights |
| chests | 5 | about 3 gear, 2 gold or consumables |
| boss uniques | 1 or 2 | guaranteed |
| shop purchases | about 6 to 10 | 70–85% of the next tier |
| crafts | 1 or 2 | a stretch's worth of one material type |
| quest rewards | about 1 | |
| **gear changes in all** | **about 14** | **about one upgrade the player wants every 11–12 minutes** |

**Rarity colours** (for the screens, see `ui-design.md`): plain (white), one bonus (blue), both bonuses (purple),
unique (gold), crafted (a small hammer mark), set piece (green).

## 10. What is cut from the old items

Crown of Vexx, Gorb's mushroom plate, the Dragonbone, Glowcap and Shadow stalker sets, the four-tier weapon ladder by
class (replaced by the eleven families), and the old key items (lantern, water flask, warm boots). Items from the first
slice stay in saves as long as the save format allows; they are retired at the progress reset.

## 11. Tuning checks for items

1. A full tier kit adds 80 ± 5% attack, 68 ± 5% defence and 22 ± 3% HP to the reference fighter (the sim reads the
   tables above).
2. Wearing a tier-N kit at the level tier N arrives, against tier-N foes, wins a normal fight in 3–4 rounds losing 20–30%.
3. Wearing tier N−1 at level N-arrival: 5 rounds and about 45% HP lost (the same as being two levels under). That is the
   "feel the step" test.
4. Each class's weapon family, with its modifier, clears fights in 85–115% of the fighter's time (`balance.md`, check 7).
5. A plain next-tier weapon or armour always beats a both-bonus one of the previous tier; for rings and necks the two are
   within 5% of each other.

## 12. Gear for the new stats (22 Oct)

Each of these is a normal piece of its slot whose budget is spent on a stat from the character sheet (`design.md` §8). Flat stats
(luck, initiative, piercing, resistance, morale, accuracy) **take half the slot budget**, because they are worth the same share of
power at every level; the other half is HP, which grows with the tier, so a higher tier is still the better piece. Special attack
and special defence scale with the tier and take the whole budget. Names follow the ring ladder's materials (Copper, Honey,
Gold-scrap, Ember, Ice, Pearl). Prices are the slot's, like any piece of its tier.

| item (slot) | T1 | T2 | T3 | T4 | T5 | T6 | what it is for |
|---|---|---|---|---|---|---|---|
| **Clover ring** (ring) | Copper · +1 luck, +2.2 HP | Honey · +1 luck, +4.4 HP | Gold-scrap · +1 luck, +7.2 HP | Ember · +1 luck, +10.5 HP | Ice · +1 luck, +13.8 HP | Pearl · +1 luck, +17.1 HP | luck tilts every roll (balance.md, the new stats) |
| **Quickstep anklet** (boots) | Copper · +3 init, +1.3 HP | Honey · +3 init, +2.6 HP | Gold-scrap · +3 init, +4.3 HP | Ember · +3 init, +6.3 HP | Ice · +3 init, +8.3 HP | Pearl · +3 init, +10.2 HP | acts earlier; speed is the boots' usual job, so this trades it |
| **Pick-charm** (neck) | Copper · +13.2% piercing, +2.4 HP | Honey · +13.2% piercing, +4.8 HP | Gold-scrap · +13.2% piercing, +7.9 HP | Ember · +13.2% piercing, +11.5 HP | Ice · +13.2% piercing, +15.1 HP | Pearl · +13.2% piercing, +18.8 HP | armour piercing: best against brutes and bosses |
| **Ward bell** (neck) | Copper · +17 res, +2.3 HP | Honey · +17 res, +4.7 HP | Gold-scrap · +17 res, +7.6 HP | Ember · +17 res, +11.1 HP | Ice · +17 res, +14.7 HP | Pearl · +17 res, +18.2 HP | resistance: spells and statuses land less often |
| **Warding robe** (armour) | Copper · +1.1 sp.def | Honey · +3.6 sp.def | Gold-scrap · +6.7 sp.def | Ember · +10.5 sp.def | Ice · +14.3 sp.def | Pearl · +18.1 sp.def | special defence instead of defence: for facing casters |
| **Spellband** (ring) | Copper · +0.5 sp.atk | Honey · +1.4 sp.atk | Gold-scrap · +2.5 sp.atk | Ember · +3.8 sp.atk | Ice · +5.1 sp.atk | Pearl · +6.4 sp.atk | special attack for casters and the monk |
| **Rally drum** (neck) | Copper · +1 morale, +1.8 HP | Honey · +1 morale, +3.5 HP | Gold-scrap · +1 morale, +5.7 HP | Ember · +1 morale, +8.4 HP | Ice · +1 morale, +11 HP | Pearl · +1 morale, +13.6 HP | one kobold's morale (the first point is worth 7 pp) |
| **Hunter's eyeglass** (helm) | Copper · +3.5 acc, +1.5 HP | Honey · +3.5 acc, +3.1 HP | Gold-scrap · +3.5 acc, +5 HP | Ember · +3.5 acc, +7.3 HP | Ice · +3.5 acc, +9.6 HP | Pearl · +3.5 acc, +11.9 HP | accuracy, which also adds reach at range |
| **Herd bell** (neck) | Copper · threat ×1.5, +4.8 HP | Honey · threat ×1.5, +9.7 HP | Gold-scrap · threat ×1.5, +15.7 HP | Ember · threat ×1.5, +23 HP | Ice · threat ×1.5, +30.3 HP | Pearl · threat ×1.5, +37.5 HP | threat ×1.5: draw the foes onto the wearer (0 pp: the rest of the budget stays HP) |
| **Shadow scarf** (cloak) | Copper · threat ×0.5, +3.1 HP | Honey · threat ×0.5, +6.2 HP | Gold-scrap · threat ×0.5, +10 HP | Ember · threat ×0.5, +14.6 HP | Ice · threat ×0.5, +19.3 HP | Pearl · threat ×0.5, +23.9 HP | threat ×0.5: the foes look elsewhere (0 pp) |

## 13. The gambler's gear (free trades on the rewarded-crit table)

These cost no power points: they trade normal damage for crit damage at the **rewarded** value for their crit chance
(`balance.md`, crit builds, λ = 0.15), so the average goes up exactly as much as the risk does. Luck tilts their crit chance
like any roll (the "lucky gambler", watched in playtests).

| item | slot | normal hits | crit chance | crit damage | average | no crit in a 10-round boss fight |
|---|---|---|---|---|---|---|
| **Loaded die** | ring | ×0.50 | (yours, 8%) | ×9.2 | ×1.20 | 43% |
| **Gambler's glove** | ring | ×0.50 | (yours, 15% with a flanking build) | ×4.8 | ×1.15 | 20% |
| **Lucky penny** | neck | ×0.25 | sets it to 3% | ×36 | ×1.32 | 74% |
| **Wishing coin** | neck | ×0.25 | sets it to 1% | ×116 | ×1.40 | 90% |

## 14. Pip's regalia and the monk's gear

| item (slot) | T1 | T2 | T3 | T4 | T5 | T6 | note |
|---|---|---|---|---|---|---|---|
| **Leader's sash** (neck) | Copper · +1 Might, +2.4 HP | Honey · +1 Might, +4.8 HP | Gold-scrap · +1 Might, +7.7 HP | Ember · +1 Might, +11.3 HP | Ice · +1 Might, +14.9 HP | Pearl · +1 Might, +18.4 HP | Pip only: the whole pack hits and holds harder |
| **Thinking cap** (helm) | Copper · +1 Wits, +0.6 HP | Honey · +1 Wits, +1.2 HP | Gold-scrap · +1 Wits, +2 HP | Ember · +1 Wits, +2.9 HP | Ice · +1 Wits, +3.9 HP | Pearl · +1 Wits, +4.8 HP | Pip only: the whole pack's spells and magic defence |
| **Square bell** (neck) | Copper · +1 Leadership, +2 HP | Honey · +1 Leadership, +4 HP | Gold-scrap · +1 Leadership, +6.4 HP | Ember · +1 Leadership, +9.4 HP | Ice · +1 Leadership, +12.4 HP | Pearl · +1 Leadership, +15.3 HP | Pip only: pack morale; strong early, saturates late |
| **Balance beads** (neck) | Copper · +2 to a score (your lowest), +2.6 HP | Honey · +2 to a score (your lowest), +5.3 HP | Gold-scrap · +2 to a score (your lowest), +8.6 HP | Ember · +2 to a score (your lowest), +12.5 HP | Ice · +2 to a score (your lowest), +16.5 HP | Pearl · +2 to a score (your lowest), +20.5 HP | the monk: always raises the lowest score, so Balance climbs |
| **Ki band** (ring) | Copper · +1.2 mana ki | Honey · +1.7 mana ki | Gold-scrap · +2.3 mana ki | Ember · +3 mana ki | Ice · +3.7 mana ki | Pearl · +4.4 mana ki | the monk: a bigger ki pool (+10% of base mana) |

Pip also earns leader points by level (one every second level, `balance.md` §3); regalia add on top.

## 15. Weapon variants

Any weapon of a family can come as a variant: 10 of its 60 pp move from attack to the variant's effect. They drop and can be crafted
(the crafting rule's +15% applies), but are never sold in shops.

| variant (any weapon family) | what it does | its price inside the weapon's 60 pp |
|---|---|---|
| **Ember-coated** | 15% of hits burn (1/16 of HP a turn for 3 turns, and weaken) | 10 pp (the weapon keeps 50 pp of attack) |
| **Venom-tipped** | 15% of hits poison (1/8 of HP a turn for 3 turns) | 10 pp |
| **Pike-hafted** (blades, axes) | reach +1 (the next tile at 75%) | 10 pp |
| **Steady-stocked** (guns) | steadiness −2 points per tile (about +2 tiles of reach) | 10 pp |
| **Heavy-headed** (axes, fists) | 25% armour piercing | 10 pp |

## 16. The count

Weapons 66 (11 families × 6 tiers) plus 5 variants of each; armour, shield, helm, boots, cloak, neck and ring 42; robe and scout
versions 36; special-stat gear 60 (10 kinds × 6 tiers); Pip's regalia 18 and the monk's gear 12; the gambler's gear 4; boss uniques 11;
set pieces 18; crafted pieces 15; consumables 10; materials 7. **About 300 items in all**, every one priced by the power-point rule.

