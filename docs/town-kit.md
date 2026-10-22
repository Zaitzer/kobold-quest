# Kobold Quest: the town kit (22 Oct 2026)

*Part of the design document (`design.md`); Gate 1 review B2. This is the checklist every town fills; its length is
what the content gives, counted (`balance.md` §2, about an hour a town), never a target to pad to. It is with **Pebblebrook filled in completely** as the template. The story is `story-hatching.md` (v6) and is
not changed here: the kit only decides where its beats happen and what the player does between them.*

## 1. What a town's stretch comes to (by count, 22 Oct)

*The length is what the content gives (Joakim, 22 Oct): the kit below says what a town must contain, and its time is counted from the
script and the maps (`node tools/timecount.js`), never set as a target to fill. Pebblebrook, counted:*

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

**Optional content, counted:**

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

**The rule of stops:** a session may end every 5–15 minutes (vision: phone-first). Every kit item below ends at a fountain, an
inn, a challenge step or a chest, never mid-scene.

## 2. The kit (every town fills every line)

| # | item | count | what it must do |
|---|---|---|---|
| 1 | **Arrival** | 1 | a welcome sign with a joke; the town's trouble visible **within 30 seconds**; the fountain in sight |
| 2 | **The four beats** (introduction, development, twist, reconciliation) | 4 | each beat tied to a place the player walks to, never only a cutscene |
| 3 | **The keeper's challenge** | 1, in 4–5 steps | not a battle; solved by finding what each kobold actually needs; no fail state; a hint one tap away |
| 4 | **The guard boss** (Snatchclaw's step) | 1–2 | comes after the challenge has started; its trick is the town's trouble made into a fight |
| 5 | **The town area** (a small dungeon) | 1 | 3 floors of about 45 steps, a free campfire half-way, the rest of the stretch's fights, one beat of the story inside |
| 6 | **The companion beat** | 1–2 | a companion joins or reaches a step of their arc; one or two campfire chats unlock at the inn |
| 7 | **Side quests** | 3 | about 10 minutes each; one about a kobold's own trouble (the theme), one about the land, one funny |
| 8 | **Route extras** | 2 per route | a chest hunt, a lost animal, a joke |
| 9 | **Bounty hunts** | 2 | a named foe from the bestiary, at the board |
| 10 | **The hidden trial** | 1 | an optional mini-boss in the area's last floor; gives the set's second piece |
| 11 | **Chests** | 5 | two on the route, two in the area, one hidden in town |
| 12 | **The set** | 3 pieces | one from the challenge, one from the trial, one crafted or bought |
| 13 | **Shop update** | 1 | the tier that has just arrived, the town's consumable, a robe and a scout piece |
| 14 | **The landmark** | 1 | something you'd draw on a postcard; the map shows it |
| 15 | **Jokes** | at least 5 | signs, a villager line, a background gag |
| 16 | **A guess at the Smiler** | 1 | every town guesses what it is (the story's running gag) |
| 17 | **Playing together** | 1 | a meeting place (the fountain square), a sign for notes, and the boss can be fought together |
| 18 | **Pillars** | at least 3 of 4 | exploring, battles, together, story and jokes |
| 19 | **Line budget** | 150–250 lines | the four review questions on every line (`story-hatching.md`) |

## 3. Pebblebrook (stretch 2: levels 3 → 8, the template)

**The trouble in 30 seconds:** the mill wheel is still, and a guard (Grubb) sits on the mill road with a toll box. The welcome sign:
*"PEBBLEBROOK. Home of the best flour in Kobaldia. (Flour currently unavailable.)"*

### The four beats, placed

| beat | where | what the player does |
|---|---|---|
| **Introduction:** the mill has stopped; Grubb's toll | the mill road, the square | pays nothing, gets told off; Ruddle explains at the mill; **Grubb** (boss, L5) when the player tries the mill road |
| **Development:** the dam vote lost by one stone; the shift circle hasn't met in nine years | the mill, the mine, the farms | the keeper's challenge (below); **Nugget** joins in the mine, haggling for everything |
| **Twist:** Grubb is a Pebblebrook kobold; he went to the guards because nobody ever listened to him at the circle | the circle stones, at dusk | the fifth miner who "never comes" is Grubb; a scene at the empty circle, his toll box under his arm |
| **Reconciliation:** the circle meets, Grubb included; the mill turns; the tube | the circle, then the mill | **Snipe** (boss, L8) deep in the mine first, then the circle meets; the old mill axle comes free: **the tube**; the raptor stable opens |

### The keeper's challenge: get the miners to the circle (five steps, about 25 minutes)

Miller Ruddle needs the whole shift at the circle to vote the dam open. Each miner has their own reason not to come; none of
them is moved by a speech.

| step | the miner | their trouble | how it's solved | where |
|---|---|---|---|---|
| 1 | **Ore**, the foreman | his cart is stuck on mine floor 1 | push it free (a short puzzle with the cart rails) | the mine, floor 1 |
| 2 | **Tansy** | lost her lunch by the pond and won't go anywhere hungry | find it (a beetle took it: one fight) | the pond on R1 |
| 3 | **Flint and Grit**, brothers | a grudge: each thinks the other dropped the stone that lost the dam vote | find the real stone (side quest "The one stone" shows it was a hole in the bag) | the old vote bag in the mill loft |
| 4 | **Old Marl** | "the circle never listens anyway" | let her speak first at the circle: Ruddle agrees | Ruddle's mill |
| 5 | **Grubb** (the twist) | went to the guards because nobody listened | the circle sends Pip, Nugget and Marl to ask him | the toll box, after Snipe |

Reward: the **mill cap** (Millers' set, helm) and the circle's vote. No fail state: a wrong answer is a joke and the miner
waits.

### The rest of the kit

| item | Pebblebrook |
|---|---|
| guard bosses | **Grubb** (L5, the mill road: loud, easy to read, a telegraphed swing every third round); **Snipe** (L8, the mine's bottom: rides a copper cart behind cover) |
| the area | **the mine**: floor 1 (carts and rails, Ore's cart), floor 2 (dark tiles lit by glow grubs; the campfire), floor 3 (Snipe's copper pile, the hidden trial's flooded gallery) |
| companion beat | **Nugget** joins on floor 1, haggling over a lantern; campfire chats: *Nugget's first* ("everything has a price, even you") and *Wizzle's envy* (he glares at the miners' embers) |
| side quests | **The one stone** (a kobold's own trouble: the brothers' grudge, the vote bag with a hole in it); **Seed swap** (the land: a Mossback farmer trades seeds for moss tufts, reward Moss cape+); **The ghost of the mill** (funny: the "ghost" is a flour-covered raptor chick, which the stable keeps) |
| route extras (R1) | the chest behind the pond; a runaway goat that follows the pack until it's walked home (reward: a Clover ring, copper) |
| bounty hunts | **Big Pinch** (a copper beetle elite on R1); **the Nettlenose scout leader** (a guard sergeant's cousin, mine floor 2) |
| hidden trial | **Old Shellback**, a huge copper beetle in the flooded gallery (mine floor 3): elite × 1.5 HP, curls up every second turn; drops the **flour-dusted apron** (Millers' set, armour) |
| chests (7) | behind the pond (R1); on the lookout (R1); by the dam (the hidden one, town); mine floor 1 (the side room); mine floor 2 (in the dark); mine floor 3 (behind Snipe's cart); the mill loft (needs the vote bag). Contents: `systems.md` §8 |
| the set | Millers' set: mill cap (challenge), flour-dusted apron (trial), miller's boots (smith: 5 gold scrap) |
| shop | tier 2 (from level 5): weapons and armour, Scribe's robe and Runner's vest; Potion, Ether, **Phoenix feather** |
| landmark | the mill wheel, and the dam behind it |
| jokes (5+) | the welcome sign; Grubb's toll sign ("TOLL: one bun. Or two. I'm flexible."); the pond's sign "NO SWIMMING (beetles)"; Ruddle's "nine years" counter chalked on the circle stones; the goat |
| the Smiler guess | "a flute," says Ruddle. "For a very big kobold." |
| playing together | the circle stones are the meeting place; a note board at the fountain; Grubb and Snipe can be fought together |
| pillars | exploring (the mine, the pond, the loft), battles (two bosses, the mine), together (the circle, co-op bosses), story and jokes (the twist): **all four** |
| line budget | about 200 |

### Minutes, counted

See §1: **63 minutes** of main path and **7** of optional content, counted from the script and the maps (`tools/timecount.js`).
The old table (140 minutes, "scenes 25", "looking around 15") was a target with nothing in it and is withdrawn.

## 4. The other towns, against the kit (to be filled like Pebblebrook when each is built)

| item | Sunhaven (8 → 13) | Emberreach (13 → 18) | Frostwick (19 → 23) | Saltspray (23 → 27) |
|---|---|---|---|---|
| trouble in 30 s | the oasis pool half empty; two signs nobody reads | cold ovens, a queue for bread | the fort half built, snow coming | boats tied at the guards' pier; carts of stay-home buns |
| challenge steps | read five pairs of signs (the well, the honey shares, the border, the barracks, the oasis) | relight five ovens in the right order with the igniter, with a funny "smash" option each time | build the fort in a small build mode: plan, lose, build the winner | read the two ledgers; find the bribed master; patch the leak (reed, pearl) |
| bosses | the guard captain (drains the oasis tiles) | the guard captain (heat tiles), **Snatchclaw** (first fight) | the draft sergeant (drafts a kobold) | the pier captain (from a boat) |
| area | the honey cellars | the crater | the ice cellars | the shipwreck, and the island cave by boat |
| companion | **Saffi** joins (lectures); **Glint**'s lens quest | **Cinder** joins, furious at being used; Wizzle meets kobolds who wasted embers | **Wizzle** rescued; **Bork** stays awake all night; Saffi's plan loses | **Crumb** gives up her ration and joins |
| hidden trial | the queen bee's comb (cellar floor 3) | the magma slug's mother (crater floor 3) | the old ice wyrm statue that moves (ice cellar floor 3) | the ghost ship's captain (island cave) |
| landmark | the oasis and the honey-glass dome | the volcano ovens, glowing | the fort on the ridge | the lighthouse and the pier |
| the Smiler guess | "a very long hat" | "a bread oven you hold" | "a snow cannon? We'd like one" | "a telescope; for seeing the islands we can't reach" |
| set | Honey-glass set | Bakers' set | Fort set | Harbour set |
| playing together | the market by the well | the bakers' square | the fort's yard (a shared build) | the pier (the boats leave from it) |

## 5. Hearthspire is not a town stretch

It has no area and no keeper; its fights are set-pieces. It carries the beginning (act 1), the midpoint (the empty square and the
Ordeal) and the finale, and it changes over the game (the bakery notice, the throne in the yard, the shut gates). Its kit is the
story itself; what it must keep: the fountain square as the biggest meeting place, the moon shrine (talent reset), the smith,
and the market board.
