# Kobold Quest: UI design (targets, v1, 20 Oct 2026)

*Part of the design document (`design.md`). This says how the game should *feel to operate*: how many taps each thing costs,
what is highlighted, what gets the best place on the screen. These are targets for the build, not a description of the
current screens. At Gate 2 every row of the tap table is counted in the real game and any miss is fixed.*

## 1. Principles

1. **Phone first, held sideways, two thumbs.** The screen is divided into a left thumb zone and a right thumb zone; the
   middle is for looking. Desktop gets the same layout plus keys.
2. **Three taps for anything you do often, two for anything in a fight.** No action needs more than four taps.
3. **Tap the thing, not a menu about the thing.** Tap a kobold to select it, a tile to go there, a foe to attack it, an
   NPC to talk to it.
4. **Nothing needs typing.** The only text fields are the name, the chat and the letters, and each is optional.
5. **Numbers on demand, pictures by default.** A health bar and a hit percentage are always visible; the full sheet is one
   tap away.
6. **One idea per screen, one primary button, one colour for "go".** The primary button is always bottom-right.
7. **Undo is cheap, mistakes are cheap.** A move can be undone before an action is taken. Nothing destructive happens
   without a confirmation (selling a unique, discarding, spending a talent).
8. **Every number you see answers a question you have.** If a screen shows a stat nobody uses to decide, remove it.
9. **Cozy.** Rounded, warm colours, a soft sound on every tap, short animations (under 200 ms) that can be turned off.

## 2. Layout (held sideways)

```
OVERWORLD                                        BATTLE
+------------------------------------------+     +------------------------------------------+
| [☰]  GOAL: Find Miller Ruddle    [🍞 3]  |     | round 3   Pip ▶    [turn order ▸▸▸]      |
|                                          |     |                                          |
|                                          |     |        foes (hit chance on each)         |
|              the world                   |     |                                          |
|                                          |     |        the board (10×13)                 |
|                                          |     |                                          |
| (friends' names, chat bubble)            |     | [Pip 60%♥ 20✦] [Wizzle..] [Bork..]       |
|  [pack ▣]                  [💬] [talk/E] |     |  [Move] [Attack] [Skills ▾] [Item] [End] |
+------------------------------------------+     +------------------------------------------+
  left thumb: pack, chat       right thumb: talk / primary
```

- **Top bar:** the menu (☰), the **goal** (always one line, tap for the quest log), the ember-bun count (the three buns
  matter, so they are always visible).
- **Left thumb zone:** pack (hero sheets), chat. **Right thumb zone:** the primary action (talk, open, enter, and in
  battle the action buttons).
- **Battle bottom bar:** one row. The three pack members' health and mana on the left, the actions on the right.
- **Desktop:** the same screen with keys: WASD (move), E (talk), I (pack), M (map), Esc (menu), 1–9 (battle actions).

## 3. Taps per action (the budget)

*Counted from the moment the player decides to do it. A "tap" is a single press. A walk is one tap on the destination.*

### Overworld

| action | taps | how |
|---|---|---|
| walk anywhere | 1 | tap the tile; the kobold walks (auto-path) |
| talk to someone | 1 | tap them (walks up and talks) |
| open a chest, a door, read a sign | 1 | tap it |
| advance a line of dialogue | 1 | tap anywhere |
| skip a whole conversation | 1 + hold | hold the skip button for half a second |
| answer a choice | 1 | tap the answer |
| drink at a fountain (heal) | 1 | tap the fountain |
| rest at an inn and save | 2 | tap the innkeeper, tap Rest |
| **fast travel** | **3** | ☰ → Map → tap a fountain (or tap the fountain you stand at, then the destination) |
| ride a raptor | 3 | tap the stable keeper → tap the destination on the map → confirm |
| sail a boat | 3 | same as the raptor |
| open the world map | 1 | M, or the map button |
| read the quest log | 1 | tap the goal bar |

### Pack and gear

| action | taps | how |
|---|---|---|
| open a kobold's sheet | 1 | tap its portrait in the pack |
| equip an item | 3 | pack → tap the slot → tap the item (the best is first) |
| equip the best item automatically | 2 | pack → "Best" button (never swaps a unique or a set piece in mid-fight) |
| compare an item | 0 | the stat difference (+3 / −1) is always shown beside the item |
| pick a talent | 2 | the "!" badge on the portrait → tap one of three |
| swap a pack member | 3 | inn → roster → tap who goes in; or at any fountain after the fins |
| reorder the pack | 2 | drag a portrait |
| use a potion outside battle | 3 | pack → Items → tap the potion → tap who (Quick: long-press a portrait for the potion menu, 2 taps) |
| change a kobold's class | , | never: Pip's class is fixed; the moon shrine only resets talents (3 taps + confirm) |

### Shops, crafting and the rest

| action | taps | how |
|---|---|---|
| buy | 2 | tap the item → tap Buy |
| buy several of a stackable | 2 + holds | tap the item, hold + (potion) |
| sell | 2 | tap the item → tap Sell (bulk "sell junk": 2 taps, with a list to confirm) |
| craft | 3 | smith → tap a recipe → tap Craft |
| accept a quest | 1 | answer the quest giver |
| hand in a quest | 1 | talk to them |
| read a letter / write a letter | 2 / 3 | Quill → read; Quill → write → send |
| open the chat / send a yip | 1 / 2 | tap 💬; tap 💬 → pick a yip |

### Battle

| action | taps | how |
|---|---|---|
| place the pack at the start | 3 (one per kobold) | tap a kobold, tap a start tile; "Start" is the primary |
| **move** | **1** | tap a blue tile |
| **basic attack on a foe in reach** | **1** | tap the foe (the hit chance is shown; a second tap is not needed) |
| **move and attack** | **2** | tap a tile, then tap the foe |
| **a skill on one foe** | **3, or 2 with the quick button** | tap Skills, tap the skill, tap the foe; *the last-used skill is a quick button* next to Attack, so the common cast is: tap the quick button, tap the foe |
| a skill on an area | 3 | skill, tap the centre tile, confirm the preview |
| a heal on a friend | 2 | tap the skill (or the quick button), tap the friend |
| a buff on the pack | 1 | the quick button (it needs no target) |
| use a potion | 3 | Item, tap the potion, tap who |
| end the turn | 1 | tap End (or it ends by itself when the kobold has no action points left) |
| guard / watch | 1 | tap the shield button |
| undo a move | 1 | tap Undo (before any action) |
| flee a fight | 2 | walk to an exit tile and tap it, or Flee → confirm |

**One unit-turn = one move + one action = 2 to 3 taps.** **A pack's round = 3 unit-turns = 6 to 9 taps.**
**A normal fight = 3 to 4 rounds + placement = about 25 to 35 taps**. **A boss = about 100 taps.** Over a main-path hour: about 9 fights × 30 + 0.7 bosses × 100 = **about 340
battle taps an hour.**

## 4. How often things are used (from most to least)

*An estimate for the average hour of the main path, used to decide where things go on the screen.*

| rank | thing | taps an hour | design consequence |
|---|---|---|---|
| 1 | advance dialogue | ~250 | tap anywhere; the whole screen is the button |
| 2 | battle: move, attack | ~280 (skills and items bring battle to ~340) | the board is the interface; no extra buttons for these |
| 3 | walk | ~100 | tap-to-walk with auto-path; never joystick-only |
| 4 | interact (NPC, chest, door) | ~60 | tap the thing |
| 5 | battle: skills | ~60 | **quick button for the last-used skill**; the rest in a list of five |
| 6 | equip, talents, pack | ~25 | the "!" badge shows when something is worth a look |
| 7 | shop | ~15 | one screen, two taps per purchase |
| 8 | potions in battle | ~10 | three taps, but only for emergencies |
| 9 | chat and yips | ~10 | one button, never in the way |
| 10 | quest log, world map | ~6 | one button each |
| 11 | crafting | ~4 | at the smith only |
| 12 | fast travel | ~2 | after piece 2; lives in the map |
| 13 | duels, gifts, the market, letters | ~0.5 | in the ☰ menu, not on the main screen |
| 14 | the moon shrine (reset talents) | ~0.1 | at the shrine only |
| 15 | admin | ~0 | hidden, for admins only |

**Layout rule:** whatever is used more than ten times an hour is on the main screen. Whatever is used less than once an
hour goes behind ☰. The bottom-right corner is the best spot on the screen and belongs to rank 1 and 2 only.

## 5. What gets highlighted

**Priority rule:** at most three highlights compete at once. The order is below. If there are more, the lowest ones wait.

| priority | highlight | look |
|---|---|---|
| 1 | **danger to a friend** (low HP, about to fall) | the portrait pulses red; the bar is blinking below 25% |
| 2 | **what you can do now** (reachable tiles, range) | tiles tinted blue (move), red (attack range), green (support range) |
| 3 | **what this hit will do** | the hit chance on the foe; a skull badge when the hit would kill; the damage range shown on tap-hold |
| 4 | **the goal** | one line at the top; a small arrow at the screen edge pointing the way (off by default in towns) |
| 5 | **something worth a look** | a "!" badge: a talent pick, a better item in the bag, a new skill; a "?" on an NPC with a quest, a "!" on an NPC with a main-story line |
| 6 | **rarity** | item names in plain, blue, purple, gold, green; a hammer mark for crafted |
| 7 | **friends** | name tags over other players; their chat bubble |
| 8 | **ambient** | sparkles on chests, the fountain, a campfire |

**Always visible:** each pack member's HP, mana and a status icon (stunned, slowed, buffed, rooted, hexed); the foe's HP bar;
the hit chance; the ember-bun count; the goal.
**Never shown unless asked:** raw attack and defence numbers, the full hit-chance breakdown (it is one tap-hold away:
"half cover −20, far −10"), foe stats (long-press a foe).

**Colour is never the only signal:** red tiles also carry a crosshair pattern, blue tiles a footprint pattern, rarity has a
shape badge as well as a colour. The game works in a colourblind palette.

## 6. Screens

| screen | what's on it | notes |
|---|---|---|
| **Title and login** | name and password, Play | username + password (decided); the name is also the in-game name |
| **Class pick** | eight cards in the slice, twelve at 1.0; each with a hat, a one-line role and its first two skills | Pip's class; one tap on a card shows more, a second confirms |
| **Overworld** | as in section 2 | no menu clutter |
| **Dialogue** | portrait, name, up to 3 short lines, the answers as buttons | the line is never more than 140 characters; choices only where the story has them |
| **Battle** | as in section 2 | the board is the centre; the action bar is one row |
| **Pack** | up to three portraits with HP, mana, level, "!" badges | tap one to open its sheet |
| **Kobold sheet** | the doll (9 slots), the stats, talents, skills, subclass | stats are grouped: attack, defence, speed, health, mana, crit, move, sight |
| **Equip list** | all items for a slot, the best first, the stat difference beside each | rarity colour; unique items have a gold border |
| **Talent pick** | three cards, one tap each, a confirm | the skill cards show the mana cost and a one-line effect |
| **Shop** | the stock on the left, the pack's gear on the right, the difference on tap | stackables have + and − |
| **Smith** | recipes with the materials you have (green) and lack (grey) | crafted items show their bonus |
| **Inn** | rest, roster, world map, the campfire chat | the campfire chat is optional |
| **World map** | towns, routes, the fountains you have drunk from, the next goal | fast travel by tapping a fountain |
| **Quest log** | main goal, side goals, hints | the main goal is always at the top |
| **Smiler diagram** | the tube, filling piece by piece; the sixth piece (the instructions) | vague until the finale |
| **Challenge screens** | four layouts (see section 8) | each has a one-tap hint |
| **Menu (☰)** | save, options, sound, chat, duels, gifts, market, letters, admin | rare things live here |

## 7. The battle in detail

1. **Placement.** The pack's start tiles glow; tap a kobold, tap a tile, repeat. "Start" is the big button. (Placement is
   skippable: "Auto" places them sensibly.)
2. **A kobold's turn.** The active kobold is lit; its reach shows in blue. It has **two action points**: a move and an
   action, or two moves. Tap the destination (a move) and then the foe or a skill. The action bar shows only what is possible
   (a greyed skill says why: "needs 5 mana", "no line of sight").
3. **Targeting.** One tap on a foe in reach attacks; the hit chance sits on the foe. Skills with an area show the area
   (a circle or a line) and **the second tap confirms**, so an area skill never fires by accident.
4. **Tile targets (new).** Traps, plant cover and a few others need a tile: tap the skill, tap the tile (the legal tiles glow),
   done. The same two-tap pattern as an area skill.
5. **Quick skill.** The last skill used on this kobold is a button next to Attack; long-pressing a foe opens the skill list.
   This brings the common cast down to **two taps**.
6. **Ending a turn.** By itself when the kobold has no action points. A kobold that wants to wait taps End.
7. **Feedback.** A number floats up from the foe; a crit shows a flash and a brief shake; a miss shows a puff. Spells have a
   sound of their own. Haptics are short and can be turned off.
8. **Result.** A single card: XP, gold, items and level-ups, one button "Onward".

## 8. The new screens the redesign needs

| new thing | what it needs on screen |
|---|---|
| **Eight classes at the start** | the class pick screen (above) |
| **More skills** | the battle menu shows five skills at a time; "more" opens the rest |
| **Tile-targeting** | the glowing legal tiles and the two-tap pattern |
| **Smiler pieces** | the diagram on the pause menu; a short ceremony animation when a piece is won |
| **Seven companions** | a campfire chat screen at inns (portraits side by side); the roster screen with pins ("away: caught in the draft camp") |
| **Four challenge types** | (1) *fetch-and-fix*: a list of five names with a check mark each; (2) *compare two documents*: two signs side by side, tap the mismatch; (3) *sequence*: ovens that light in order, a hint button; (4) *build*: a small board with parts to place, a "plan" and a "winner" |
| **The follower line** | none; sprites behind Pip |
| **Phasing** | none; other players are simply not drawn in the story scenes |
| **Raptors and boats** | a map with stable and pier pins; one tap, one confirm |
| **Helper's reward** | a small banner after a co-op fight: "+3 bun crumbs" |

## 9. Sound and touch feedback

- A soft pop on every tap; a different one for "can't". A rising chime on a level-up; a fanfare on a Smiler piece; a different
  jingle for each town and for each boss's start.
- Haptics: 40 ms on a hit, 3 short buzzes on a boss's start. A setting turns them off.
- The sound and the music are on by default and have a master volume and a mute in the ☰ menu.

## 10. Accessibility and small screens

- Tap targets are at least **44 CSS pixels** and have at least 8 px between them.
- Text is at least 14 px; the dialogue is 18 px. A "big text" setting makes everything 25% larger.
- Contrast: all text meets 4.5:1; the colourblind palette is a setting.
- Reduced motion: no screen shake, no pulsing; a setting.
- One-handed play works on the overworld (everything reachable by a right thumb); battle needs two.
- The game must also work at 568 × 320 (a small phone held sideways): the board scrolls rather than shrinks.

## 11. How we check it

1. **The tap test:** a scripted run of the real game counts the taps of every row in section 3; the test fails if any row is
   over its budget by more than one.
2. **The 10-second test:** a friend who has never played finds "equip a better helm", "use a potion" and "see the next goal"
   within 10 seconds each, without help.
3. **The clutter test:** no screen shows more than seven things the player can tap, other than a list.
4. **The thumb test:** every main-screen button is reachable by the thumb of a hand holding a phone sideways.
5. **The battle length test:** a normal fight takes the simulated tap count in section 3, within 20%.
