# Kobold Quest: design document (v2 draft, 20 Oct 2026, for story v6)

*Step 1.2 of the roadmap; last maintained 22 Oct 2026. Built from the vision (`vision.md`), the story (`story-hatching.md`),
the world plan (`world-plan.md`) and what the engine already does (`src/data/classes.js`). Sections marked **Decide** need
the creative director. Numbers are NOT set here: they live in `balance.md` and `items.md` (section 0).*

## 0. Where the numbers live

This document says *what the game is*. The numbers and the screens are in three companions, built from one model so they
agree with each other:

| file | what it holds |
|---|---|
| **`balance.md`** | the feelings we want; time per stretch; the level table (damage, HP, XP, gold); the other eleven classes; the six ability scores and the monk's Balance; the skill cost rule and every new skill; fights, bosses and co-op scaling; hit chances, spells, statuses, terrain and crits; encounter rates, route lengths and the fight budget; grind and optional content; gold; player progression; sensitivity |
| **`items.md`** | the power-point rule; slot budgets; weapons for all eleven families; every slot by tier; prices; affixes; boss uniques; sets; consumables; materials and crafting; what the player finds |
| **`bestiary.md`** | every opponent: roles, stats by place, weights, XP, elements, who you meet where, the bosses |
| **`ui-design.md`** | layout; taps per action; what is used most and least; what is highlighted; every screen; the battle in detail; accessibility; how we check |

Where this file and those disagree, **those win** for numbers and screens; this file wins for rules and story.

## 1. Core loop

- **Moment to moment (seconds):** walk, bump into things, talk, open, fight. Every tap does something.
- **Session (5–15 minutes, or an evening of them):** pick a goal from the top bar → travel a route (fights, finds) →
  reach a town → solve one step of the town's trouble → heal at the fountain → save. Every step is a natural place to
  stop.
- **Long term:** five **Smiler pieces** (plus the sixth from Mallow's book) → the Smiler → the new hatching.
  Alongside: levels, subclasses, gear sets, seven companions and their quests, side quests.
- **No story choices.** It's Pip's story, told the same way every time. The player chooses Pip's class, the pack, the
  gear and how to fight; never what the story says.

## 2. Exploring

- **The map:** Hearthspire in the middle, five towns, seven routes (see the world plan).
- **The bun at the capital gate is flavour only:** the guards "take a bun" but it costs the player nothing. Ember-buns
  stay at three in the whole game.
- **Barriers are story, not keys:** the toll on the bun road (until three pieces), the shut north and east gates
  (until the flour tunnel, after the Ordeal), the island boats (until the harbour is patched). Each one is explained by
  a sign or a villager before you hit it. The old key items (lantern, flask, boots) are cut.
- **Field moves:**

| move | when you get it | what it does |
|---|---|---|
| **Raptors** | after the first piece, at the riders' stable on the mill road | ride between stables; the loop becomes quick travel; one cliff shortcut on R3 |
| **Boats** | after the harbour is patched in Saltspray | sail to the two islands |

- **Fast travel:** fountains you have drunk from let you warp to any other drunk-from fountain. Unlocked after the
  second piece, so the early routes are walked at least once. Raptors add stable-to-stable travel on top.
- **Finds:** chests, hidden items, side quests, signs with jokes. Every route has at least one thing off the path, and
  every route has its own landmark (see the world plan).

## 3. Battles

- Small turn-based grid battles (already built): position, range, line of sight, skills that cost mana.
- **The rules, in short** (details and numbers in `balance.md` §4 and §4a):
  - **Damage** uses HoMM3's attack-versus-defence factor (never zero, at most ×3, at least ×0.3), not subtraction.
  - **One hit formula:** chance = 100% + accuracy − the target's dodge − cover − distance − the multiple-attack penalty
    (Pathfinder: the second attack in a turn −5, the third −10). A foe with no dodge is hit 100% in
    melee; ranged and magic lose a little per tile and have no maximum range, only line of sight.
  - **Spells are resisted, not missed:** a resisted spell deals half damage; resistance rises with distance.
  - **Unseen attackers** halve the target's dodge or resistance; stunned, rooted and surprised foes have none.
  - **A big foe is hit once per tile** an area attack overlaps.
  - **Statuses are priced on one ladder** (slow, fall, root, weaken and hex, stun, confuse, and burn and poison, which deal
    damage each turn, Pokémon-style), and terrain (ice) applies them at
    a quarter of a spell's power.
  - **Crit builds are rewarded for their risk**: no cap on crit damage; anything that lowers normal damage must raise crit
    damage to the rewarded value.
  - **Bosses** come from two rules (length and a damage budget), attack three times a round, telegraph every third round,
    and soften 10% after each defeat.
- **Foes by place** (every one, with stats, in `bestiary.md`): Nettlenose scouts and slingers (Snatchclaw's, spreading along the roads as the story goes on),
  Snatchclaw's guards (a strong version later), and the land's own creatures (beetles, sand skinks, rock goats, stokers,
  snow beasts, crabs, smugglers).
- **Bosses:** Grubb and Snipe (Pebblebrook), a guard captain per town, Snatchclaw (Emberreach, then the castle),
  Glitterbeak (the castle roof). Each boss has its own trick.
- You can always run from normal fights; bosses can be retried with no loss beyond the potions used.
- **Losing** sends you back to the last fountain you drank from, with half your gold (decided).
- Nobody dies in the story (cartoon rules): defeated foes "storm off" or "fall asleep", never die.

## 4. Classes: the classic twelve, in two waves

Pip can be any class. Each class has a role, 3–4 signature skills, and **two subclasses at level 8** (today's
promotions). The existing four classes are renamed and kept; the other eight are new. Skills use the engine's existing
fields where possible (`foe`, `foes`, `ally`, `allies`, `stun`, `slow`, `heal`, `buff`, `drain`, `revive`); the
**New engine** column says what must be built.

### Wave 1: the classes the slice needs (8)

The four we have, plus the four that the first companions play (Bork, Wizzle, Glint, Nugget).

| class | flavour | role | signature skills | subclasses (level 8) | new engine |
|---|---|---|---|---|---|
| **Fighter** (was warrior) | capital soldier | front line, most health and defence | Power bonk, Cleave, Shield bash, Battle cry | **Knight** (Shield wall) · **Battle master** (Whirlwind; was Berserker) | none |
| **Ranger** | raptor scout | range, goes first | Volley, Aimed shot, Arrow rain, **Mark** (a marked foe takes extra hits) | **Sniper** (Headshot) · **Scout** (hit and run) | mark |
| **Wizard** (was mage) | scholar | big area spells, fragile | Ice bolt, Fireball, Chain lightning, Meteor | **Archmage** (Meteor, stronger spells) · **Battlemage** (Frost nova, sturdier) | none |
| **Cleric** | temple healer | heals and protects | Heal, Group heal, Blessing, Revive | **Saint** (stronger heals, Sanctuary) · **War cleric** (Holy strike; was Paladin) | none |
| **Monk** | fort-builder (Bork) | **the generalist**: any weapon, ki magic of every kind, reads foes, crafts and builds; everything scales on **Balance** (how even its six scores are, `balance.md` §3) | **Ki strike** (any element), **Ki mend** (small heal), **Ki ward** (resistance), **Ki step** (move twice), **Adapt** (swap a skill mid-fight), **Flurry** (3 weak hits) | **Way of the Hand** (martial: Flurry, Palm strike stun, a free weapon swap each turn) · **Way of the Hearth** (the builder: cover, traps and repairs in battle, the best crafting outside) | multi-hit, Balance stat, element choice, buildable cover, mid-fight skill swap |
| **Sorcerer** | ember-blooded (Wizzle) | raw fire, unstable | **Spark** (cheap fire), **Ember burst** (big area), **Dragon's breath** (line), **Wild surge** (random extra effect) | **Dragonblood** (tougher, fire) · **Wild** (more surges, more risk) | surge table, line attack |
| **Bard** | town crier (Glint) | buffs and confuses | **Rousing song** (the pack hits harder and takes less), **Lullaby** (slows a group), **Vicious mockery** (hit and weaken), **Rumour** (a foe attacks its friends) | **Lore** (more debuffs) · **Valor** (armour and a sword) | confuse, weaken |
| **Rogue** | sapper and pickpocket (Nugget) | sneak attacks, traps, slips past lines | **Sneak attack** (big hit on a stunned, flanked, unseen or unaware foe), **Trap** (a hidden square), **Slip past** (move through foes), **Pickpocket** (steal a material from a foe) | **Thief** (steals more, finds more) · **Trapper** (more traps, bigger) | sneak bonus, traps, steal |

### Wave 2: before Emberreach (4)

| class | flavour | role | signature skills | subclasses | new engine |
|---|---|---|---|---|---|
| **Barbarian** | volcano-born (Cinder) | huge damage, stronger when hurt | **Rage** (+damage, takes less), **Reckless swing** (big hit, leaves you open), **Stomp** (hit all nearby), **Shrug it off** (heal on kill) | **Berserker** (fury below half health) · **Totem** (tougher, protects friends) | rage state |
| **Paladin** | a guard who kept her oath | protector, smites, a little healing | **Smite**, **Lay on hands**, **Guard** (take a hit for a friend), **Oath** (aura: friends nearby take less damage) | **Devotion** (protect) · **Vengeance** (hunt one foe) | guard, aura |
| **Druid** | Mossback farmer | roots foes, plants cover | **Vine snare** (root a foe), **Plant cover** (a bush blocks line of sight), **Thorns**, **Rain** (small heal over time) | **Land** (healing, plants) · **Moon** (a bear shape: tougher, melee) | root, terrain, shapeshift |
| **Warlock** | pact with a talking teapot | curses, steady damage | **Hex** (a foe takes more damage), **Teapot blast** (steady ranged), **Whisper** (the teapot gives advice and a buff), **Pact boon** | **The Teapot** (fire, kind-of-evil jokes) · **The Sourdough Starter** (a bubbling thing: drains, gooey slow) | hex, advice (flavour) |

Why this split: the first four companions are met in the slice and in act 2 before Emberreach, so their classes
must exist by then. Cinder (barbarian) joins at Emberreach, so wave 2 lands just before it, in phase 3.

**The golden mean in the class list:** barbarian is "too much caring" (smash it all); the monk is the mean itself, the
kobold whose power is how *balanced* it is (Bork's diligence). Not a rule, just a joke the writers can lean on.

## 5. The pack and companions

- **Words:** the group is called the **pack** in everything the player reads (never "party", which reads as politics).
  The internal name and the save key stay `party`.
- **Pip plus up to three others** at a time (a **pack of four**), chosen from the roster. Every fight is tuned for four
  kobolds; bringing fewer is the player's own handicap. Those not in the pack wait at the inn and catch up
  in level slowly.
- **The roster is Pip and the seven companions. No extra recruits** (the old Fennel, Brass, Pell, Mist, Tikka and Skipper Gull are cut). Seven is
  enough to carry the theme, and each one has a purpose.
- **Companion classes are fixed** by the story: Pip is the only one whose class you pick. If Pip is also a monk,
  there are two monks. That is fine.
- **Each companion's side story** is told in campfire chats at inns and one small quest, along the story circle in
  `story-hatching.md`. Lessons come out in banter and their own quest, never in a speech.

| companion | sin → virtue | class | joins | their quest (one small, not a battle) | the pack feels |
|---|---|---|---|---|---|
| **Wizzle** | envy → kindness | sorcerer | Hearthspire (act 1) | rescued from the guards' draft camp at Frostwick; gets his first ember at the hatching | the kid you protect |
| **Glint** | lust (infatuation) → discernment | bard | Hearthspire (act 1) | gets the honey-glass lens in Sunhaven; trades his sticker collection to get it back | the sucker for shiny things |
| **Bork** | sloth → diligence | monk | the capital gate (act 1) | stays awake all night guarding the fort at Frostwick | the napper you fall for |
| **Nugget** | greed → charity | rogue | Pebblebrook (act 2) | finds his grandad's duck nugget in Glitterbeak's hoard; gives it to Mallow's oven | the haggler |
| **Saffi** | pride → humility | wizard | Sunhaven (act 2) | her clever plan loses to a builder's simple one; she says so | the know-it-all |
| **Cinder** | wrath → patience | barbarian | Emberreach (act 2) | fixes Mallow's oven slowly, instead of smashing it | the temper |
| **Crumb** | gluttony → temperance | cleric | Saltspray (act 3) | gives up her stay-home bun ration; cooks the hatching feast | the cook |

- **Mid-story roster changes:** the pack Pip takes is always his choice, but story moments pin people: Wizzle is gone
  in the Ordeal and rescued at Frostwick; Cinder is thrown out at the Ordeal. A pinned companion simply isn't on the
  roster for a stretch, and the story says why.
- **Bib is never a companion.** The player can never recruit him.

## 6. Towns, keepers and challenges

Five towns, each a four-beat small story (introduction, development, **twist**, reconciliation, see the story) with
a **keeper** who sets the town's own challenge. **The challenge is not a battle.** The rule from the story: *speeches
move nobody; a kobold's own trouble does.* Every challenge is solved by finding out what each kobold actually needs.

| town | keeper | challenge | what the player does | why it works as play |
|---|---|---|---|---|
| **Pebblebrook** | Miller Ruddle | get the miners to the shift circle | walk the mine and the mill road, find five miners, each with a small trouble of their own (a stuck cart, a lost lunch, a grudge); fix it, then they come | fetch-and-fix, easy to learn; the twist (Grubb is a local kobold) is a conversation, not a fight |
| **Sunhaven** | the head scribe | find the drainer by reading the signs | every public choice is posted on two signs side by side; read both, find the mismatch, follow the water to the guards' barracks | a reading puzzle; no fail state, the player can ask Saffi for a hint |
| **Emberreach** | the forge master | relight the ovens before Cinder smashes them | light the ovens in the right order using the igniter; an optional tempting shortcut (smash) | a short sequence puzzle with a "wrong" option that is funny, not punishing |
| **Frostwick** | the fort captain | build the fort | pick a plan, build it in a small build mode; the plan loses to a simpler one; build the winner anyway | choice and consequence; teaches that losing and building anyway is how to be listened to |
| **Saltspray** | two harbour masters | patch the leaking harbour | collect materials (reed, pearl); identify the bribed master from the ledgers; patch the leak | gathering plus a light deduction |

All challenge steps are data in `src/core/rules.js` (choices carry `if` / `show`). Each town's guard boss comes **after**
the challenge and is optional-feeling: the fight is how Snatchclaw's step is undone.

## 7. The Dragon Smiler pieces

- **Five pieces, one per town, and the sixth is the instructions** in Mallow's recipe book (from act 1).
  Replacing the sparks; the save flag stays `seals` so old saves keep working.

| piece | town | gameplay reward (my proposal, **Decide**) |
|---|---|---|
| the tube | Pebblebrook | the raptors (the stable opens) |
| the sight | Sunhaven | hidden chests on routes show as "?" |
| the igniter | Emberreach | a new campfire chat at every inn |
| the cooling fins | Frostwick | swap the pack at any fountain, not only at inns |
| the ember chamber | Saltspray | (the boats come from patching the harbour, not from the piece) a bonus to the finale's loading scene |

- **In the HUD:** a small Smiler diagram on the pause screen fills in piece by piece. The fully built tube is the RPG-7
  reveal, so the diagram is a vague "something long" until the very end (the story joke).
- **Fast travel** unlocks at the second piece. **The bun road toll** (R4) opens at the third.
- Pieces are collected at the **end** of each keeper's challenge. They are not dropped by bosses.

## 8. Growth, the character sheet and gear

- Levels give a talent pick (3 offered). At level 8 a subclass. The moon shrine resets talents for gold (Hearthspire).
- Level range for the story: about 1 to 30.
- Slots: weapon, head, armour, cloak, shield, boots, neck, two rings. Item sets give bonuses.
- Monsters drop **materials** by land: moss, sand glass, gold scrap, frost shard, pearl, reed. Every material has a home
  on the map. The smith crafts at Hearthspire and Pebblebrook, and reforges at Emberreach's forge.
- Shops sell potions and basic gear; better gear comes from chests, bosses, crafting.
- **Ember-buns:** three in the game, each heals everything. They are scarce on purpose: Mallow's hat, and two in the
  Reward. (Bib's bun at the start is an extra, the last bun of the old days.)

### The character sheet (Joakim, 21–22 Oct: more stats is better)

Every kobold has the stats below; **\*** marks Pip only (he is always the pack's leader and cannot be swapped out), and
**†** the monk only. The domain and range are design rules: a stat is only limited where the limit is natural (a share,
a probability, a count). How each one feeds the fight is in `balance.md`; what is still unwritten is marked *open*.

| group | stat | domain, range | what it does | rule |
|---|---|---|---|---|
| core | HP | ℝ, [0, +∞] | how much a kobold can take | `balance.md` §3 |
| | Mana (the monk's is **ki**) | ℝ, [0, +∞] | pays for skills | §3 |
| | Attack | ℝ, [0, +∞] | weapon damage | §3 |
| | Defence | ℝ, [0, +∞] | reduces weapon damage | §3 |
| | Special attack | ℝ, [0, +∞] | spell damage and healing | §3, the new stats |
| | Special defence | ℝ, [0, +∞] | reduces spell damage | §3, the new stats |
| | Speed | ℝ, [0, +∞] | movement (turn order is initiative) | §3 |
| | Action points (AP) | ℕ, [0, +∞] | actions per turn | §3 (skill AP costs) |
| | Morale | ℤ, (−∞, +∞) | positive: a chance of +1 AP; negative: a chance of −1 AP | §3, the new stats |
| | Corruption | ℝ, [0, +∞] | grows with dark magic and dark deeds, never falls by itself; **combat only**, no story effect (decided 22 Oct) | §3 (thresholds) |
| scores | STR, DEX, CON, INT, WIS, CHA | ℤ, [1, +∞] | each governs a fixed set of stats | §3, ability scores and the score-to-stat mapping |
| | Balance † | ℝ, [0, 1] | how even the six scores are; all monk abilities scale on it | §3, the monk |
| hit and avoid | Accuracy | ℝ, (−∞, +∞), in points | raises hit chance and reach | §4a |
| | Dodge | ℝ, [0, +∞], in points | lowers the chance to be hit | §4a |
| | Resistance | ℝ, [0, +∞] | lowers the chance spells and statuses land | §3, §4a |
| | Crit chance | ℝ, [0, 1] | a probability | §4a, crits |
| | Crit damage | ℝ, [1, +∞] | the crit multiplier; no upper limit | §4a, crit builds |
| | Armour piercing | ℝ, [0, 1] | the share of the target's defence a hit ignores | §3, §4a |
| weapon | Damage multiplier | ℝ, [0, +∞] | the weapon family's power | `items.md` |
| | Steadiness | ℝ, [0, +∞], points per tile | how fast hit chance falls with distance | §4a |
| | Reach | ℕ, [0, +∞], tiles | how far a melee attack reaches | §3 |
| tempo | Initiative | ℝ, (−∞, +∞) | turn order | §3, the new stats |
| | Threat | ℝ, [0, +∞] | how likely foes are to attack this kobold | §3, the new stats |
| | HP regen | ℝ, [0, +∞], a share of max HP per turn | healing over time | `items.md` |
| world | Luck | ℤ, (−∞, +∞) | tilts every random outcome in the kobold's favour (hits, crits, damage rolls, being hit, spells, statuses, initiative, morale, loot) | §3, the new stats |
| | Fame | ℝ, [0, +∞] | greetings and shop prices; never combat | §3 |
| progress | Level | ℕ, [1, +∞] | | §3 |
| | XP | ℕ, [0, +∞] | | §3 |
| leader \* | Might \* | ℝ, [0, +∞] | the whole pack's attack and defence | §3, the new stats |
| | Wits \* | ℝ, [0, +∞] | the whole pack's special attack and special defence | §3, the new stats |
| | Leadership \* | ℝ, [0, +∞] | raises the pack's morale | §3, the new stats |
| | Pack morale \* | ℝ, (−∞, +∞) | the kobolds' mean morale plus Leadership ÷ 5 | §3, the new stats |
| status | turns left on each condition | ℕ, [0, +∞] | | §4a, statuses |

On screen, **everything is on the sheet** (decided 22 Oct): every stat, grouped, with its total, and no press-and-hold
breakdown on the sheet (`ui-design.md`, the kobold sheet). In battle the hit chance keeps its own breakdown (`balance.md` §4a).

## 9. Economy

- Gold from fights, quests and bounties; spent on rest, potions, gear, crafting, shrine resets.
- The **market** lets players trade gear with each other (online only).
- No real money, ever.

## 10. Playing together

**Model: a shared world with personal stories**, plus a touch of async co-op. *Decided, and unchanged.*

- **One shared world:** everyone online walks the same map at the same time; you see each other, chat and yip.
- **Personal stories:** each player has their own save and story progress. Barriers are per player.
- **Group fights count for everyone who is ready:** a boss beaten together counts for each player who has reached that
  step of their own story (done the talking before it).
- **Level sync:** when you help a lower-level friend, your pack is brought down to their level for that fight. You
  still earn XP and loot suited to your real level, plus a **helper's reward** for cosmetics.
- **Duels** for fun, **gifts** of items, the **market** for trading, **notes left on signs** for friends.
- **Phasing for story scenes:** while you are in Hearthspire's story scenes (the empty square, the Ordeal), other players
  are hidden from you, so "nobody comes" is true. In the finale the opposite: online players show up in the crowd and can
  load their ember into the Smiler. (`gate1-review.md`, A3.)
- **Fights together** (`balance.md` §4, "Playing together"): **a fight holds at most four kobolds and four players**, who
  share the four places (one player brings up to four, two bring two each, four bring one each). Nothing scales with the
  number of players: every fight is tuned for four kobolds. Buffs from two players do not stack; a downed kobold can be
  revived by another player; XP and loot are personal; shared-world resources are personal instances; all players act in
  the same phase with a short timer.
- Playing together never blocks anyone's story, and nobody has to play with others.
- **Theme check:** the multiplayer is the theme made playable. A boss is beaten by whoever shows up; a friend who
  doesn't, doesn't. The helper's reward means showing up is rewarded, and nothing is lost by staying home except the
  fun. Keep it that way: never punish absence.

## 11. Onboarding and difficulty

- The first 10 minutes (Hearthspire's morning): walk, talk, light a lamp from the tower fire (the setup for the
  finale), meet Bib, get an ember at the hatching. No walls of text. The cellar door under the bakery is shown here, and
  Mallow mentions the flour carts (the setup for the flour tunnel).
- Normal difficulty should rarely lose a fight if you heal at fountains; bosses are the real tests.

## 12. What is cut from the first design

Burrowhome and its valley, sparks, bandits, Elder Mumble, Witch Yarrow, Tikka the rival, key items (lantern, flask, boots), the
extra recruits (Fennel, Brass, Pell, Mist, Skipper Gull), eight of the fifteen routes, five of the ten towns, the old promotions that clash with the
classes (Berserker now belongs to the barbarian, Paladin to its own class).

## 13. Decisions

1. **Losing a fight:** back to the last fountain, lose half your gold. *Decided.*
2. **Shared story moments:** a shared world with personal stories; group boss fights count for everyone who is ready,
   with level sync for helpers. *Decided.*
3. **Pack:** Pip plus up to three others from a roster (a pack of four, decided 22 Oct). The roster is Pip and the seven companions.
4. **Length:** long, 15+ hours, depth not padding. *Decided.*
5. **No story choices for the player.** *Decided 19 Oct.*

## 14. Decided (Claude's calls, Joakim said "you decide", 20 Oct 2026)

1. **Wave split: eight, then four.** Wave 1 is fighter, ranger, wizard, cleric, monk, sorcerer, bard, rogue, so every
   companion in the slice and act 2 has a class. Wave 2 is barbarian, paladin, druid, warlock, built before Emberreach.
2. **Roster: Pip and the seven companions only.** Fennel, Brass, Pell, Mist, Skipper Gull and Tikka are cut for good.
3. **Subclass names:** Fighter's Berserker becomes **Battle master**, Cleric's Paladin becomes **War cleric**.
4. **Piece rewards: keep them**, small, as listed in section 7. They give each piece a feel in play. Easy to drop later.
5. **Challenge types: four, not five.** Sunhaven (reading the two signs) and Saltspray (reading the ledgers) share one
   "compare two documents" mechanic. Pebblebrook (fetch-and-fix), Emberreach (sequence) and Frostwick (build) stay
   their own. Only Pebblebrook's is built for the slice.

Joakim can overrule any of these at Gate 1.

## 15. Decided 21–22 Oct (Joakim, in the number audit)

1. **A rule before a number:** when something is off, look for the structural cause first.
2. **One hit formula** (accuracy − dodge − cover − distance), no maximum range, only line of sight; magic follows distance too;
   an unseen attacker halves the target's dodge.
3. **Spells are resisted, not missed** (half damage).
4. **A big foe is hit once per overlapped tile** by area attacks.
5. **Statuses priced on one ladder**; fall is cheaper than stun; terrain at a quarter of a spell.
6. **Crit builds are rewarded for their risk**; no cap on crit damage.
7. **More stats is better**: the character sheet in §8, with Pip as the pack's leader and the six D&D scores.
8. **The monk is the generalist**, scaling on Balance.
9. **Co-op bosses scale with the players.**
10. **No more simulations unless asked;** arithmetic and playtests instead.

## 16. Gate 1 decisions (Joakim, 22 Oct)

1. **Build on `main`.** Safe as long as `release/` and the Claude page are not rebuilt from the new work until the slice is
   ready: the live server serves `release/`.
2. **Tile-targeting first**, as a spike, before the new classes; every tile skill reuses it.
3. **Cinder rebuilds the oven** in act 3 (the bakery cellar, through the flour tunnel); Nugget's copper finishes it.
4. **The eggs stay as they are** (the imperfect-eggs idea is dropped).
5. **Corruption is combat only**: dark magic is stronger and some shops and kobolds react; no story effect, no ending branch.
6. **A pack of four; at most four kobolds and four players in a fight.** Everything is tuned for four kobolds; bringing
   fewer is the player's handicap. Nothing scales with the number of players.
7. **Pip's leader stats are Might, Wits and Leadership.**
8. **Everything on the sheet**, no press-and-hold layer on it.
9. **The hard packs stay hard** (no front line is a choice with a cost).
10. **Adopted:** HoMM3's attack-versus-defence damage factor, Pathfinder's multiple-attack penalty, Pokémon-style burn and poison.

