# Kobold Quest: skills and talents (every class, 22 Oct 2026)

*Part of the design document (`design.md`). **This file is the one list of skills**; `balance.md` §3 holds the rules that price
them. Every mana cost is computed by those rules (`node tools/skills-table.js`), so regenerate rather than edit. Arithmetic
only, nothing simulated.*

## 1. How a kit is built

- **Eight skills per character by level 30:** one at the start, **four learned as talent picks** (offered from levels 2, 5, 11
  and 14), and **two from the subclass** (levels 8 and 16), plus the subclass's **capstone passive** at level 24. Pip is any class
  and also has his leader points (`balance.md` §3).
- **Four skills equipped** (the battle menu shows them beside Attack). The kit is changed at a fountain, an inn or a campfire;
  the monk's Adapt changes one mid-fight.
- **Mana by the cost rule:** `1 + 3 × (value × targets − 1) + status cost`, where *value* is the multiplier with the risk premium
  for hit modifiers (`balance.md` §3). Two pricing rules are added here, so every kind of skill has one:
  - **Heals:** `1 + 2 × (heal ÷ 45%) × friends healed` (a 45% heal is 3 mana, as before).
  - **Buffs:** `2 × action-equivalents × 0.5 − 2` (never under 2): the buff's value is its bonus × friends × turns, half of it
    lands before the fight ends or the foes fall, and the turn spent casting is paid back. It is calibrated to the bard check
    (Rousing song costs 4, as the 252-pack run needed).
  - **Utility** (move, hide, cover, guard, mark): 2 mana per action-equivalent.
- **AP:** 1 for single targets and utility, 2 for areas, lines and multi-hits, "end" for heavy melee.
- **Bounds:** 2 to 8 mana (Adapt, which is free, is the only exception).

## 2. Talents: one pick a level, three offered

From level 2 every level offers three cards, **one of each kind**, and the player takes one:

1. **A score:** +1 to any ability score (the monk's card always points at its lowest).
2. **A skill or a rank:** a class skill whose level has come, or, when none is waiting, **rank 2 or 3 of a known skill** (+15% to
   its effect, same mana).
3. **A class passive** (below), each worth about **3 pp** and allowed more than once.

29 picks give about 9 score picks (the growth `balance.md` §3 is built on), 4 skills and about 16 passives or ranks. A wrong pick
can be undone at the moon shrine in Hearthspire (4F₀).

## 3. Every class

### Fighter (blades)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Power bonk** | start | a big hit on one foe | 1 | 3 | 1 + 3(1.80×1 − 1) |
| **Cleave** | talent L2 | swing through every foe in front (−10 per target) | 2 | 3 | 1 + 3(0.79×2.2 − 1) |
| **Shield bash** | talent L5 | hit and stun one foe | 1 | 4 | 1 + 3(1.10×1 − 1) + stun 3 |
| **Battle cry** | talent L11 | the pack hits 25% harder for 3 turns | 1 | 2 | buff 3.0 AE |
| **Second wind** | talent L14 | heal yourself 30% | 1 | 2 | heal 30%×1 |
| **Shield wall** | Knight, L8 | you and friends beside you take 30% less for 3 turns | 1 | 2 | buff 2.7 AE |
| **Challenge** | Knight, L16 | every foe within 4 tiles must attack you for 2 turns (threat ×4) | 1 | 4 | 2 AE |
| *Bulwark* | Knight, L24 | guarding also guards the friends beside you (passive) | — | — | the capstone |
| **Whirlwind** | Battle master, L8 | spin and hit everything in reach (−10 per target) | 2 | 6 | 1 + 3(1.16×2.2 − 1) |
| **Riposte** | Battle master, L16 | the next melee attack on you this round is answered with ×1.0 | 1 | 2 | 1 + 3(1.00×1 − 1) |
| *Momentum* | Battle master, L24 | each foe you fell gives +1 AP (once a turn) (passive) | — | — | the capstone |

**Fighter talent passives** (each about 3 pp, can be taken more than once): Tough: +3% HP; Weapon focus: +3% attack; Iron skin: +7.5% defence; Shield training: guarding gives +10 more dodge.

### Ranger (guns)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Volley** | start | shoot every foe in an area (−10 per target) | 2 | 2 | 1 + 3(0.62×2.2 − 1) |
| **Aimed shot** | talent L2 | a careful, deadly shot (+20 to hit) | 1 | 6 | 1 + 3(2.64×1 − 1) |
| **Mark** | talent L5 | the foe takes +30% from the whole pack for 3 hits | 1 | 2 | 1 AE |
| **Arrow rain** | talent L11 | shots on every foe in a wide area | 2 | 5 | 1 + 3(1.05×2.2 − 1) |
| **Hunter's snare** | talent L14 | a hidden tile: whoever steps on it is rooted 2 turns | 1 | 2 | 1 + 3(0.60×1 − 1) + root 2 |
| **Headshot** | Sniper, L8 | a perfect shot (+15 to hit) | 1 | 7 | 1 + 3(3.00×1 − 1) |
| **Long shot** | Sniper, L16 | one shot with steadiness halved (about twice the reach) | 1 | 4 | 1 + 3(1.60×1 − 1) + 0.5 AE |
| *Deadeye* | Sniper, L24 | crit damage +1 (×2.5 instead of ×1.5) (passive) | — | — | the capstone |
| **Hit and run** | Scout, L8 | shoot, then move again | 1 | 3 | 1 + 3(1.20×1 − 1) + 0.5 AE |
| **Flare** | Scout, L16 | reveals every unseen foe; the pack gets +10 accuracy for 2 turns | 1 | 2 | buff 0.8 AE |
| *Pathfinder* | Scout, L24 | +1 move; difficult tiles cost nothing (passive) | — | — | the capstone |

**Ranger talent passives** (each about 3 pp, can be taken more than once): Sharp eye: +3 accuracy; Steady hands: −0.6 steadiness; Swift feet: +1 speed; Quick draw: +3 initiative.

### Wizard (wands)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Ice bolt** | start | frost; hit and slow one foe | 1 | 3 | 1 + 3(1.30×1 − 1) + slow 1 |
| **Fireball** | talent L2 | fire on every foe in an area | 2 | 5 | 1 + 3(1.00×2.2 − 1) |
| **Stone spike** | talent L5 | earth, a line of spikes | 2 | 5 | 1 + 3(1.10×2 − 1) |
| **Chain lightning** | talent L11 | storm; jumps between foes, may stun (25%) | 2 | 6 | 1 + 3(0.90×2.5 − 1) + 0.4 AE |
| **Arcane shield** | talent L14 | yourself: special defence +50% and defence +30% for 3 turns | 1 | 2 | buff 1.2 AE |
| **Meteor** | Archmage, L8 | fire from the sky on a wide area | 2 | 8 | 1 + 3(1.50×2.2 − 1) |
| **Spell surge** | Archmage, L16 | your next spell this turn is ×1.5 and costs no AP | 1 | 3 | 1.5 AE |
| *Mastery* | Archmage, L24 | every spell costs 1 less mana (never under 2) (passive) | — | — | the capstone |
| **Frost nova** | Battlemage, L8 | frost around you; slows all it hits | 2 | 6 | 1 + 3(1.10×2.2 − 1) + slow 1 |
| **Blink** | Battlemage, L16 | teleport up to 4 tiles in sight | 1 | 2 | 1 AE |
| *Warded* | Battlemage, L24 | +30% defence and special defence (passive) | — | — | the capstone |

**Wizard talent passives** (each about 3 pp, can be taken more than once): Arcane mind: +3% mana; Spell power: +3% special attack; Focus: −0.6 steadiness for spells; Elemental study: your resisted spells deal 60% instead of 50%.

### Cleric (holy)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Heal** | start | heal one friend 45% | 1 | 3 | heal 45%×1 |
| **Group heal** | talent L2 | heal every friend 25% (about 3 hurt on average) | 1 | 4 | heal 25%×3 |
| **Blessing** | talent L5 | the pack takes 30% less damage for 3 turns | 1 | 2 | buff 3.6 AE |
| **Smite** | talent L11 | a holy whack on one foe | 1 | 2 | 1 + 3(1.40×1 − 1) |
| **Revive** | talent L14 | raise a fallen friend at 40% | 1 | 7 | heal 40%×1 + 2 AE |
| **Sanctuary** | Saint, L8 | friends within 2 tiles heal 30% | 1 | 4 | heal 30%×2.5 |
| **Purify** | Saint, L16 | every friend loses its statuses | 1 | 4 | 2 AE |
| *Grace* | Saint, L24 | heals +30% (passive) | — | — | the capstone |
| **Holy strike** | War cleric, L8 | smite and heal yourself 30% of the damage | 1 | 3 | 1 + 3(1.60×1 − 1) + heal 10%×1 |
| **Judgement** | War cleric, L16 | holy light on a small area | 2 | 5 | 1 + 3(1.20×2 − 1) |
| *Zeal* | War cleric, L24 | after you heal, your next hit is +25% (passive) | — | — | the capstone |

**Cleric talent passives** (each about 3 pp, can be taken more than once): Devotion: +3% mana; Vigour: +3% HP; Gentle hands: heals +4%; Faith: +9 resistance.

### Monk (fists (or any))

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Ki strike** | start | a hit in the element you choose (×0.8 × (0.5 + Balance)) | 1 | 2 | 1 + 3(1.20×1 − 1) |
| **Ki mend** | talent L2 | heal a friend 15% × (0.5 + Balance) | 1 | 2 | heal 22%×1 |
| **Flurry** | talent L5 | three hits of ×0.5 (multiple-attack penalty 0 / −4 / −8) | 2 | 3 | 1 + 3(1.50×1 − 1) |
| **Ki ward** | talent L11 | a friend gains resistance +10 × (0.5 + Balance) for 2 turns | 1 | 2 | 0.5 AE |
| **Ki step** | talent L14 | move twice this turn | 1 | 2 | 0.5 AE |
| **Adapt** | start | swap one of the four equipped skills mid-fight (once a fight; twice at Balance 90%) | 1 | 0 | set |
| **Palm strike** | Way of the Hand, L8 | hit and stun | end | 4 | 1 + 3(1.00×1 − 1) + stun 3 |
| **Counterflow** | Way of the Hand, L16 | dodge +25 this round; each foe that misses you is hit ×0.8 | 1 | 2 | 1 AE |
| *Many hands* | Way of the Hand, L24 | Flurry has four hits (passive) | — | — | the capstone |
| **Raise cover** | Way of the Hearth, L8 | half cover on an empty tile beside you for 3 turns | 1 | 2 | 1 AE |
| **Mend gear** | Way of the Hearth, L16 | a friend's defence +20% for 3 turns | 1 | 2 | buff 0.6 AE |
| *Master builder* | Way of the Hearth, L24 | your cover lasts until moved; crafting gives +1 affix (passive) | — | — | the capstone |

**Monk talent passives** (each about 3 pp, can be taken more than once): Centre: +1 to your lowest score (counts toward Balance); Light step: +1 speed; Ki well: +3% ki; Open palm: +3% attack and special attack while Balance is 90% or more.

### Sorcerer (orbs)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Spark** | start | cheap fire on one foe | 1 | 2 | 1 + 3(1.20×1 − 1) |
| **Ember burst** | talent L2 | fire in an area | 2 | 5 | 1 + 3(1.00×2.2 − 1) |
| **Dragon's breath** | talent L5 | a line of fire that burns (15%) | 2 | 5 | 1 + 3(1.10×2 − 1) + 0.3 AE |
| **Wild surge** | talent L11 | ×1.5 with a random extra effect (neutral on average) | 1 | 3 | 1 + 3(1.50×1 − 1) |
| **Heat haze** | talent L14 | you are unseen for 1 turn | 1 | 2 | 1 AE |
| **Scales** | Dragonblood, L8 | defence and special defence +40% for 3 turns | 1 | 2 | buff 1.2 AE |
| **Dragon roar** | Dragonblood, L16 | weakens every foe within 3 tiles | 1 | 4 | 1 AE + weaken 2 |
| *Fire in the blood* | Dragonblood, L24 | every fire spell burns 15% of the time (passive) | — | — | the capstone |
| **Surge storm** | Wild, L8 | two Wild surges on one foe | 2 | 7 | 1 + 3(1.50×2 − 1) |
| **Chaos bolt** | Wild, L16 | ×2.0 in a random element: a weakness doubles it, a resistance halves it (a gamble with the same average) | 1 | 4 | 1 + 3(2.00×1 − 1) |
| *Wild magic* | Wild, L24 | every spell has a 10% chance of a free surge (passive) | — | — | the capstone |

**Sorcerer talent passives** (each about 3 pp, can be taken more than once): Spell power: +3% special attack; Ember blood: +3% HP; Kindling: fire spells burn 3% of the time; Volatile: crit damage +0.15.

### Bard (instruments)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Vicious mockery** | start | hit and weaken (−25% attack, 2 turns) | 1 | 2 | 1 + 3(0.80×1 − 1) + weaken 2 |
| **Rousing song** | talent L2 | the pack hits 25% harder and takes 25% less for 3 turns | 1 | 4 | buff 6.0 AE |
| **Lullaby** | talent L5 | slows every foe in an area | 1 | 3 | 1 AE + slow 1 |
| **Rumour** | talent L11 | one foe attacks its friends for a turn | 1 | 4 | confuse 4 |
| **Ballad of rest** | talent L14 | friends regain 8% a turn for 3 turns | 1 | 3 | heal 24%×2 |
| **Cutting words** | Lore, L8 | the foe's next attack does 50% less | 1 | 2 | 1 AE |
| **Countersong** | Lore, L16 | the pack gains resistance +20 for 3 turns | 1 | 2 | buff 1.8 AE |
| *Encore* | Lore, L24 | songs last one turn longer (passive) | — | — | the capstone |
| **Valiant strike** | Valor, L8 | a sword hit; your song's bonus doubles on it | 1 | 2 | 1 + 3(1.40×1 − 1) |
| **Battle hymn** | Valor, L16 | sing while you fight: Rousing song costs no action this turn | 1 | 2 | 1 AE |
| *Duelist* | Valor, L24 | +20% defence while singing (passive) | — | — | the capstone |

**Bard talent passives** (each about 3 pp, can be taken more than once): Showmanship: songs +4% stronger; Charm: +3 initiative; Encouragement: +0.4 morale for the pack; Quick tongue: +3% mana.

### Rogue (daggers)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Sneak attack** | start | ×2.4 on a stunned, flanked, unseen or unaware foe, else ×1.2 | end | 3 | 1 + 3(1.80×1 − 1) |
| **Trap** | talent L2 | a hidden tile: ×1.2 and stun to whoever steps on it | 1 | 5 | 1 + 3(1.20×1 − 1) + stun 3 |
| **Slip past** | talent L5 | move through foes with no free hits | 1 | 2 | 1 AE |
| **Hide** | talent L11 | you are unseen until you attack (not next to a foe) | 1 | 2 | 1 AE |
| **Pickpocket** | talent L14 | ×0.6 and steal a material | end | 2 | 1 + 3(0.60×1 − 1) + 0.5 AE |
| **Smoke bomb** | Thief, L8 | the whole pack is unseen for 1 turn | 1 | 4 | 2 AE |
| **Lift** | Thief, L16 | steal the foe's next turn's buff or a potion it carries | 1 | 2 | 1 AE |
| *Fortune* | Thief, L24 | +2 luck (passive) | — | — | the capstone |
| **Spike trap** | Trapper, L8 | ×1.5 and root to whoever steps on it | 1 | 5 | 1 + 3(1.50×1 − 1) + root 2 |
| **Trap field** | Trapper, L16 | three traps at once in an area | 2 | 8 | 1 + 3(1.20×2 − 1) + stun 3 |
| *Hair trigger* | Trapper, L24 | traps stun for 2 turns (passive) | — | — | the capstone |

**Rogue talent passives** (each about 3 pp, can be taken more than once): Precision: +1.5% crit chance; Shadow: +3 dodge; Sticky fingers: +5% materials from fights; Opportunist: +6% damage to flanked foes.

### Barbarian (axes)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Reckless swing** | start | ×2.4, you take +25% next turn | 1 | 4 | 1 + 3(2.40×1 − 1) + -0.5 AE |
| **Rage** | talent L2 | +30% attack and −20% damage taken for 3 turns | 1 | 2 | buff 1.5 AE |
| **Stomp** | talent L5 | hit everything next to you | 2 | 4 | 1 + 3(0.90×2.2 − 1) |
| **Shrug it off** | talent L11 | heal yourself 30% | 1 | 2 | heal 30%×1 |
| **Leap** | talent L14 | jump up to 3 tiles and hit ×1.0 where you land | 1 | 2 | 1 + 3(1.00×1 − 1) + 0.5 AE |
| **Frenzy** | Berserker, L8 | two hits of ×1.0 (only below half HP) | end | 3 | 1 + 3(2.00×1 − 1) + -0.5 AE |
| **Unstoppable** | Berserker, L16 | immune to stun, fall and root for 3 turns | 1 | 2 | 1 AE |
| *Fury* | Berserker, L24 | +35% damage below half HP (passive) | — | — | the capstone |
| **Bear totem** | Totem, L8 | the pack takes 15% less for 3 turns | 1 | 2 | buff 1.8 AE |
| **Wolf totem** | Totem, L16 | the pack gets +1 move for 3 turns | 1 | 3 | 1.5 AE |
| *Spirit guard* | Totem, L24 | once a fight, you get up at 20% when you fall (passive) | — | — | the capstone |

**Barbarian talent passives** (each about 3 pp, can be taken more than once): Thick hide: +7.5% defence; Brawn: +3% attack; Bloodlust: heal 2% when you fell a foe; Hard head: +9 resistance.

### Paladin (blades)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Smite** | start | a holy whack on one foe | 1 | 3 | 1 + 3(1.70×1 − 1) |
| **Lay on hands** | talent L2 | heal a friend 60% | 1 | 4 | heal 60%×1 |
| **Guard** | talent L5 | take the next hit for a friend beside you | 1 | 2 | 1 AE |
| **Oath** | talent L11 | friends within 1 tile take 20% less for 3 turns | 1 | 2 | buff 1.8 AE |
| **Divine shield** | talent L14 | you ignore the next hit | 1 | 3 | 1.5 AE |
| **Aura of warding** | Devotion, L8 | the pack gains resistance +15 for 3 turns | 1 | 2 | buff 1.4 AE |
| **Sacred ground** | Devotion, L16 | a 3 × 3 area heals 10% a turn for 3 turns | 1 | 4 | heal 30%×2 |
| *Steadfast* | Devotion, L24 | you cannot fall while a friend stands beside you (once a fight) (passive) | — | — | the capstone |
| **Vow** | Vengeance, L8 | one foe takes +30% from you until it falls | 1 | 2 | 1 AE |
| **Avenging strike** | Vengeance, L16 | ×2.0 and heal yourself 20% | end | 5 | 1 + 3(2.00×1 − 1) + heal 20%×1 |
| *Relentless* | Vengeance, L24 | +1 move toward your vowed foe (passive) | — | — | the capstone |

**Paladin talent passives** (each about 3 pp, can be taken more than once): Faith: +9 resistance; Sturdy: +3% HP; Holy might: +3% attack; Mercy: Lay on hands +6%.

### Druid (nature)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Vine snare** | start | root a foe for 2 turns (it can still attack) | 1 | 2 | 1 + 3(0.50×1 − 1) + root 2 |
| **Plant cover** | talent L2 | a bush gives half cover for 3 turns | 1 | 2 | 1 AE |
| **Thorns** | talent L5 | friends reflect 20% of melee damage for 3 turns | 1 | 2 | buff 2.4 AE |
| **Rain** | talent L11 | friends in the area regain 15% a turn for 3 turns | 1 | 5 | heal 45%×2 |
| **Poison spores** | talent L14 | nature; a cloud that poisons | 2 | 6 | 1 + 3(0.60×2.2 − 1) + poison 4 |
| **Bloom** | Land, L8 | heal three friends 25% | 1 | 4 | heal 25%×3 |
| **Grove** | Land, L16 | trees grow in a 3 × 3 area: half cover and 8% healing a turn for 3 turns | 1 | 5 | heal 24%×2 + 1 AE |
| *Green thumb* | Land, L24 | plant skills last one turn longer (passive) | — | — | the capstone |
| **Bear shape** | Moon, L8 | become a bear for 3 turns: HP ×1.5, melee ×1.3 | 1 | 2 | buff 1.2 AE |
| **Maul** | Moon, L16 | a bear's swipe: ×1.6 and knock down (fall) | 1 | 4 | 1 + 3(1.60×1 − 1) + fall 1.5 |
| *Moonlit hide* | Moon, L24 | +30% defence in bear shape (passive) | — | — | the capstone |

**Druid talent passives** (each about 3 pp, can be taken more than once): Bark skin: +7.5% defence; Wild growth: plant skills +4% stronger; Nature's gift: +3% mana; Deep roots: +9 resistance.

### Warlock (teapots)

| skill | learned | what it does | AP | mana | priced as |
|---|---|---|---|---|---|
| **Teapot blast** | start | steady ranged fire | 1 | 2 | 1 + 3(1.30×1 − 1) |
| **Hex** | talent L2 | the foe takes +25% from everything for 3 turns | 1 | 2 | hex 2 |
| **Whisper** | talent L5 | a friend gets +20% attack and +10 dodge for 3 turns | 1 | 2 | buff 0.9 AE |
| **Brew** | talent L11 | ×1.2 drain: heal yourself half the damage | 1 | 2 | 1 + 3(1.20×1 − 1) + heal 10%×1 |
| **Pact boon** | talent L14 | ×2.5 once a fight; you lose 10% of your HP | end | 5 | 1 + 3(2.50×1 − 1) + -0.5 AE |
| **Boiling spout** | The Teapot, L8 | a line of fire that burns (15%) | 2 | 5 | 1 + 3(1.00×2 − 1) + 0.3 AE |
| **Steam cloud** | The Teapot, L16 | the pack is unseen for 1 turn | 1 | 4 | 2 AE |
| *Kettle's patience* | The Teapot, L24 | +1 mana each turn (passive) | — | — | the capstone |
| **Gooey slow** | The Sourdough Starter, L8 | an area of goo: slows | 2 | 4 | 1 + 3(0.70×2.2 − 1) + slow 1 |
| **Rise** | The Sourdough Starter, L16 | drain in an area: heal yourself a third of the damage | 2 | 5 | 1 + 3(1.00×2.2 − 1) + heal 10%×1 |
| *Starter culture* | The Sourdough Starter, L24 | poisons last one turn longer (passive) | — | — | the capstone |

**Warlock talent passives** (each about 3 pp, can be taken more than once): Spell power: +3% special attack; Dark pact: +3% mana; Bitter brew: hexes +4% stronger; Stubborn: +9 resistance.

## 4. What changed from the engine

The engine's 26 skills keep their names; costs now come from the rules (Battle cry 4 → 2, Blessing 5 → 2, Lay on hands 5 → 4,
Revive 8 → 7, Mark 3 → 2), because buffs and heals were priced by feel. Old promotions are replaced by the subclasses above.
