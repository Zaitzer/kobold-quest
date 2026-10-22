# Kobold Quest: corruption (22 Oct 2026)

*Part of the design document (`design.md`). Corruption is **an option for every class**: a dark path that gives every skill an
**alternative version**. It touches combat only (decided 22 Oct): no story branch, no ending, a few reactions. The tables at the end
are printed by `node tools/corruption-table.js`; regenerate rather than edit.*

## 1. The rule

- **Every skill and capstone has a dark version** (§5): the same role, mana and AP, a dark name and look, and **×1.25 to its main
  number** (damage multiplier, heal, buff bonus, status chance and length). **From corruption 50 the dark versions are ×1.4.**
- **A dark version is an alternative, not an extra:** it takes the plain version's place among the four equipped skills, swapped at
  a fountain, an inn or a campfire like any skill (`skills.md`). A kobold can carry plain and dark skills side by side.
- **Each cast of a dark version adds +1 corruption** to the kobold that cast it.
- **The price is the pack's bond.** Pack morale loses the pack's **mean** corruption ÷ 10:
  $$M_{\text{pack}} = \overline{M} + \frac{\text{Leadership}}{5} - \frac{\overline{C}}{10}$$
  (22 Oct: the mean, not the total, by arithmetic. With the total, one dark kobold cost the pack more than it gave, so the dark path was
  a trap. With the mean, **a whole pack at 50 gives up about its full bond, +5 morale, about +23% actions, for ×1.4 skills, about +25%
  output**: a real choice, not a trap or a free lunch. One dark kobold at 10 costs −0.25 morale, about −1.5% actions, for about +4% pack
  output: a small, honest gain. *U: measure this in play.*)

## 2. Thresholds (each unlocks, none forces)

| corruption | unlocks |
|---|---|
| **10** | the dark versions of the class's own skills (start and talents) |
| **25** | the dark versions of the subclass skills; companions and keepers react (one line each, §4); Smudge's stall and the guards' quartermasters sell at −10% |
| **50** | the dark capstone; every dark version rises to ×1.4 |

## 3. How corruption grows and falls

**Combat deeds go to the kobold that did them; world deeds and kind deeds go to Pip** (he is the one walking the world). It never
falls by itself, and it never goes under 0.

### Deeds that raise it

| # | deed | corruption | where it can happen | in the slice |
|---|---|---|---|---|
| 1 | casting a dark version of a skill | +1 a cast | any fight | from corruption 10 |
| 2 | defeating a foe that has turned to run (a foe under 25% HP may flee) | +1 | any fight | yes |
| 3 | striking a foe that is asleep (Lullaby, Dread lullaby) | +1 | any fight | no (wave 1 bard has Lullaby: yes) |
| 4 | aiming an area skill so it hits a friend | +1 a friend hit | any fight | yes |
| 5 | leaving the field while a friend is down | +2 a kobold who leaves | normal fights | yes |
| 6 | winning a fight against foes five or more levels under the pack (bullying) | +1 a fight | routes | yes |
| 7 | finishing a foe with a dark version | +1 more | any fight | from corruption 10 |
| 8 | Pickpocket or Lift on a villager instead of a foe | +2, and a few coins | towns | yes (Nugget) |
| 9 | eating a found lost item meant for someone (Tansy's lunch) | +2; they still come, grumbling | quests | yes (script §2.2: a second answer) |
| 10 | buying from Smudge's shiny offers on the road | +1 a purchase | R2, R3 | no |
| 11 | greasing a toll (pay a guard to look away) | +2 | toll gates (R4, the gate) | no |
| 12 | taking a stay-home bun from the cart | +2 a bun | Saltspray | no |
| 13 | selling a gift a friend gave you | +1 | the shop, the market | yes (online) |
| 14 | shooing a lost animal away instead of walking it home | +1 | route extras | yes (the goat) |
| 15 | breaking a villager's pots or crates | +1 each, at most 3 a house | houses | yes |
| 16 | reading a diary left on a shelf | +1 | houses (one a town) | yes (the brothers' house) |
| 17 | tipping over a sign | +1 | every sign | yes |
| 18 | scribbling on the mural | +1 (once) | the castle hall | yes |
| 19 | skipping out of an inn without paying for the bed | +2 | inns | yes |
| 20 | kicking a downed foe in a duel (an attack on a downed duel kobold) | +2 | duels | online |
| 21 | snatching the last potion from a friend's gift box in co-op | +1 | co-op | online |
| 22 | warming the shiny egg again at the new hatching (the epilogue's free warming) | +3 | the finale | no |
| 23 | feeding a stolen bun to Glitterbeak's collectors | +2 | the castle (act 2) | no |
| 24 | ringing the square's bell for nothing | +1 (once a visit) | Hearthspire | yes |

### Deeds that lower it (kindness, never below 0)

| # | deed | corruption | in the slice |
|---|---|---|---|
| 1 | the moon shrine's cleansing: −10 for 4F gold (the price of a talent reset), any kobold | −10 | yes (Hearthspire) |
| 2 | walking a lost animal home | −1 | yes (the goat) |
| 3 | returning a lost item to its owner | −1 | yes (Tansy's lunch) |
| 4 | helping a friend's boss fight (the helper's reward) | −1 | online |
| 5 | finishing a keeper's challenge | −2 | yes |
| 6 | a companion's quest done | −2 for the companion | later |
| 7 | giving a potion to a hurt villager (one in every town, sitting by the fountain) | −1 | yes |
| 8 | standing a sign back up | −1 (undoes 17) | yes |

## 4. Reactions (at 25; one line each, never a lecture)

| who | line |
|---|---|
| Mallow | "Your ember's gone a funny colour, dear. Have a bun anyway." |
| Bib | "You look tired. Buns are fine, though." |
| Wizzle | "Whoa. Can I have some of that? ...Should I want some of that?" |
| Glint | "It's shiny. It's the wrong kind of shiny." |
| Bork | "Bork does not like the purple." |
| Nugget | "Dark stuff sells for more. Just saying. Don't do it." |
| Ruddle | "The wheel creaks when you walk past. It never creaks." |
| Smudge | "Friend! Ten off, for a friend of the family." |
| a guard | "You'd make a good guard." |

## 5. Every dark version

### Fighter

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Power bonk | **Grudge bonk** | the stick glows purple and remembers who it hit | corruption 10 |
| Cleave | **Hate cleave** | a black arc that leaves a smear in the air | corruption 10 |
| Shield bash | **Spite bash** | the shield face grows teeth for a moment | corruption 10 |
| Battle cry | **War howl** | a cry that makes friends hit harder and flowers wilt | corruption 10 |
| Second wind | **Stolen breath** | breath drawn from the cold air around the foes | corruption 10 |
| Shield wall | **Iron grudge** | a wall of shields with spikes turned inward | corruption 25 (Knight) |
| Challenge | **Taunt of ash** | foes must come at you; their eyes burn red | corruption 25 (Knight) |
| *Bulwark* (Knight capstone) | **Bulwark of spite** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Whirlwind | **Black whirl** | a spin that drags smoke behind it | corruption 25 (Battle master) |
| Riposte | **Spite riposte** | the answer comes before the question | corruption 25 (Battle master) |
| *Momentum* (Battle master capstone) | **Bloodlust** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Ranger

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Volley | **Thorn volley** | black-fletched shots that whistle | corruption 10 |
| Aimed shot | **Cruel aim** | a shot at the softest spot | corruption 10 |
| Mark | **Doom mark** | a mark only the pack can see, like a bruise | corruption 10 |
| Arrow rain | **Ash rain** | a rain of shots that leaves soot on the board | corruption 10 |
| Hunter's snare | **Biting snare** | the snare has teeth | corruption 10 |
| Headshot | **Grim shot** | one shot, no sound | corruption 25 (Sniper) |
| Long shot | **Shadow shot** | the shot vanishes and reappears at the target | corruption 25 (Sniper) |
| *Deadeye* (Sniper capstone) | **Death's eye** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Hit and run | **Cut and vanish** | shoot, then melt into the nearest shadow | corruption 25 (Scout) |
| Flare | **Black flare** | a flare of dark light that shows every heartbeat | corruption 25 (Scout) |
| *Pathfinder* (Scout capstone) | **Shadow path** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Wizard

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Ice bolt | **Grave frost** | frost that crackles like old bones | corruption 10 |
| Fireball | **Hellfire** | purple fire that burns cold | corruption 10 |
| Stone spike | **Bone spike** | spikes of grey stone shaped like ribs | corruption 10 |
| Chain lightning | **Black lightning** | a jumping bolt the colour of a bruise | corruption 10 |
| Arcane shield | **Shadow mantle** | a cloak of smoke that drinks the blows | corruption 10 |
| Meteor | **Falling star of ash** | a star that should not be there | corruption 25 (Archmage) |
| Spell surge | **Overcharge** | the next spell crackles purple | corruption 25 (Archmage) |
| *Mastery* (Archmage capstone) | **Forbidden mastery** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Frost nova | **Grave nova** | a ring of grey frost | corruption 25 (Battlemage) |
| Blink | **Shadow step** | you step out of your own shadow | corruption 25 (Battlemage) |
| *Warded* (Battlemage capstone) | **Shrouded** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Cleric

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Heal | **Borrowed life** | the wound closes with warmth taken from somewhere else | corruption 10 |
| Group heal | **Blood tithe** | everyone heals; the grass around goes grey | corruption 10 |
| Blessing | **Dark covenant** | the pack is shielded by something that watches | corruption 10 |
| Smite | **Wrath** | the holy whack lands with a black flash | corruption 10 |
| Revive | **Raise again** | the fallen get up a little too quickly | corruption 10 |
| Sanctuary | **Shadow sanctuary** | a circle of dusk where wounds close | corruption 25 (Saint) |
| Purify | **Devour** | statuses are eaten rather than cleansed | corruption 25 (Saint) |
| *Grace* (Saint capstone) | **Borrowed grace** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Holy strike | **Unholy strike** | a smite that heals you from the foe's hurt | corruption 25 (War cleric) |
| Judgement | **Condemnation** | a small area of grey light | corruption 25 (War cleric) |
| *Zeal* (War cleric capstone) | **Fervour** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Monk

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Ki strike | **Void strike** | the element is always "nothing", and nothing hurts | corruption 10 |
| Ki mend | **Ki theft** | a mend paid for with a foe's breath | corruption 10 |
| Flurry | **Hungry flurry** | three hits that each want more | corruption 10 |
| Ki ward | **Void ward** | resistance from a hollow in the air | corruption 10 |
| Ki step | **Void step** | two moves through a gap in the world | corruption 10 |
| Adapt | **Unmake** | swap a skill, and the old one is forgotten for the fight | corruption 10 |
| Palm strike | **Hollow palm** | a strike that stops the breath | corruption 25 (Way of the Hand) |
| Counterflow | **Spite flow** | every miss on you is punished | corruption 25 (Way of the Hand) |
| *Many hands* (Way of the Hand capstone) | **Many claws** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Raise cover | **Bone wall** | cover built from old, grey stone | corruption 25 (Way of the Hearth) |
| Mend gear | **Cursed fit** | a friend's gear fits too well | corruption 25 (Way of the Hearth) |
| *Master builder* (Way of the Hearth capstone) | **Bone mason** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Sorcerer

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Spark | **Black spark** | a spark that burns purple | corruption 10 |
| Ember burst | **Ash burst** | a burst that leaves the tiles grey | corruption 10 |
| Dragon's breath | **Wyrm breath** | breath the colour of an old bruise | corruption 10 |
| Wild surge | **Chaos surge** | the surge table, but the good results are darker | corruption 10 |
| Heat haze | **Shadow haze** | a haze nobody sees through | corruption 10 |
| Scales | **Black scales** | scales like burnt glass | corruption 25 (Dragonblood) |
| Dragon roar | **Dread roar** | a roar that makes small foes forget their names | corruption 25 (Dragonblood) |
| *Fire in the blood* (Dragonblood capstone) | **Ash in the blood** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Surge storm | **Chaos storm** | a storm of wild magic, all of it hungry | corruption 25 (Wild) |
| Chaos bolt | **Ruin bolt** | chaos, but it always picks the worst | corruption 25 (Wild) |
| *Wild magic* (Wild capstone) | **Chaos magic** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Bard

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Vicious mockery | **Venom tongue** | words that sting for days | corruption 10 |
| Rousing song | **War dirge** | a song that makes the pack fierce and a little mean | corruption 10 |
| Lullaby | **Dread lullaby** | a lullaby with the wrong ending | corruption 10 |
| Rumour | **Poison whisper** | a rumour that is half true and all cruel | corruption 10 |
| Ballad of rest | **Ballad of debts** | rest now, pay later (in morale, by the rule) | corruption 10 |
| Cutting words | **Flaying words** | every word leaves a mark | corruption 25 (Lore) |
| Countersong | **Silence** | a song that stops other songs | corruption 25 (Lore) |
| *Encore* (Lore capstone) | **Dirge** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Valiant strike | **Vainglorious strike** | a strike for the crowd, not the cause | corruption 25 (Valor) |
| Battle hymn | **Battle dirge** | a hymn sung backwards | corruption 25 (Valor) |
| *Duelist* (Valor capstone) | **Bully** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Rogue

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Sneak attack | **Backstab** | the same strike, with no warning and no mercy | corruption 10 |
| Trap | **Cruel trap** | a trap with a nasty surprise inside | corruption 10 |
| Slip past | **Shadow slip** | through foes like smoke | corruption 10 |
| Hide | **Vanish** | gone, and the foes feel watched | corruption 10 |
| Pickpocket | **Rob** | take the material and a little of their courage | corruption 10 |
| Smoke bomb | **Black smoke** | smoke that smells of old fires | corruption 25 (Thief) |
| Lift | **Plunder** | steal twice as much, with nothing left behind | corruption 25 (Thief) |
| *Fortune* (Thief capstone) | **Ill fortune (yours is good)** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Spike trap | **Barbed trap** | spikes that hook | corruption 25 (Trapper) |
| Trap field | **Killing field** | a field of traps that hum | corruption 25 (Trapper) |
| *Hair trigger* (Trapper capstone) | **Cruel trigger** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Barbarian

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Reckless swing | **Ruinous swing** | a swing that does not care what it hits | corruption 10 |
| Rage | **Black rage** | rage that burns blue-black | corruption 10 |
| Stomp | **Quake of spite** | a stomp that cracks the board | corruption 10 |
| Shrug it off | **Feed on it** | a fallen foe's strength becomes yours | corruption 10 |
| Leap | **Pounce** | a leap that lands claws first | corruption 10 |
| Frenzy | **Blood frenzy** | a frenzy that smells the hurt | corruption 25 (Berserker) |
| Unstoppable | **Relentless dark** | nothing slows you, nothing at all | corruption 25 (Berserker) |
| *Fury* (Berserker capstone) | **Black fury** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Bear totem | **Dread totem** | a totem with too many eyes | corruption 25 (Totem) |
| Wolf totem | **Hunger totem** | a totem that howls at nothing | corruption 25 (Totem) |
| *Spirit guard* (Totem capstone) | **Spite guard** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Paladin

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Smite | **Wrath** | the holy whack lands with a black flash | corruption 10 |
| Lay on hands | **Lay on claws** | healing hands with a cold touch | corruption 10 |
| Guard | **Hold hostage** | you take the hit for a friend, and the foe pays for it | corruption 10 |
| Oath | **Dark oath** | an aura that promises pain to whoever hurts your friends | corruption 10 |
| Divine shield | **Shadow shield** | a shield of dusk | corruption 10 |
| Aura of warding | **Aura of dread** | foes near you shake | corruption 25 (Devotion) |
| Sacred ground | **Cursed ground** | ground that bites at foes | corruption 25 (Devotion) |
| *Steadfast* (Devotion capstone) | **Unyielding** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Vow | **Blood vow** | a vow sealed with a scratch | corruption 25 (Vengeance) |
| Avenging strike | **Vengeful strike** | a strike that remembers every hurt | corruption 25 (Vengeance) |
| *Relentless* (Vengeance capstone) | **Hunter of grudges** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Druid

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Vine snare | **Strangling vines** | vines that squeeze | corruption 10 |
| Plant cover | **Thorn hedge** | a bush of black thorns | corruption 10 |
| Thorns | **Barbs** | thorns that hook and stay | corruption 10 |
| Rain | **Blood rain** | a warm, red-tinted rain that heals the pack | corruption 10 |
| Poison spores | **Rot spores** | spores that smell of a cellar | corruption 10 |
| Bloom | **Grave bloom** | grey flowers that heal | corruption 25 (Land) |
| Grove | **Dead grove** | a grove of leafless trees | corruption 25 (Land) |
| *Green thumb* (Land capstone) | **Black thumb** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Bear shape | **Dire shape** | a bear made of shadow | corruption 25 (Moon) |
| Maul | **Rend** | a maul that tears | corruption 25 (Moon) |
| *Moonlit hide* (Moon capstone) | **Moonless hide** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |

### Warlock

| skill | dark version (×1.25; ×1.4 from 50) | what is different | unlocked at |
|---|---|---|---|
| Teapot blast | **Kettle of woe** | the teapot boils over with something black | corruption 10 |
| Hex | **Doom hex** | a hex that grins | corruption 10 |
| Whisper | **Dark counsel** | the teapot's advice is good, and unkind | corruption 10 |
| Brew | **Foul brew** | a brew that works, and tastes of regret | corruption 10 |
| Pact boon | **Deeper pact** | the teapot asks for a little more | corruption 10 |
| Boiling spout | **Scalding spout** | a line of black steam | corruption 25 (The Teapot) |
| Steam cloud | **Choking cloud** | a cloud that coughs back | corruption 25 (The Teapot) |
| *Kettle's patience* (The Teapot capstone) | **Kettle's grudge** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |
| Gooey slow | **Tar slow** | goo like tar | corruption 25 (The Sourdough Starter) |
| Rise | **Rise, starter** | the sourdough starter lifts a friend, a little too eagerly | corruption 25 (The Sourdough Starter) |
| *Starter culture* (The Sourdough Starter capstone) | **Old culture** | the same passive, ×1.25 (×1.4 from 50) | corruption 50 |


## 6. What it needs from the engine

A `dark` flag on an equipped skill (×1.25 or ×1.4 to its main number, purple effects, +1 corruption a cast), the deed hooks above
(most are already events: `battle:won`, a skill used, a talk, a tile entered), the morale term, and the sheet's corruption row with the
next threshold marked. The slice needs deeds 2, 4, 5, 6, 8, 9, 13–19 and 24, kindness 1–3, 5, 7, 8, and the dark versions of the eight
wave-1 classes.
