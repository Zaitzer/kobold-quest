# Kobaldia: world plan (v2, 20 Oct 2026, for story v6)

*Step 1.4 of the roadmap. What each place is for, how tough it is, and where it sits. Rebuilt around **Hearthspire in
the middle**, five towns and fewer routes. The story is `story-hatching.md`; the map data is `REGION` in
`src/data/overworld.js` (rebuilt in the slice, not before Gate 1).*

## The map in one picture

The towns follow the bun chain, and Hearthspire sits in the middle of it like a hub.

```
                  FROSTWICK  (ice cellars)
                      |  R5 snowfield
 PEBBLEBROOK --R1-- HEARTHSPIRE --R6-- SALTSPRAY ~~ boats ~~ islands
 (mill, mine)          |  R4 bun road     (harbour)
      | R2             |
 SUNHAVEN ----R3---- EMBERREACH
 (honey, water)       (volcano ovens)
```

- **West and south, a loop:** Hearthspire → Pebblebrook → Sunhaven → Emberreach → back up the bun road to Hearthspire.
  That is act 2. It ends at home, which is exactly where the midpoint happens.
- **North and east, two spokes:** Frostwick and Saltspray. They are act 3.
- **Why the spokes are shut in act 2:** the guards have closed the north and east gates "by order". After the Ordeal,
  Pip leaves by **Mallow's flour tunnel** under the bakery, the way the flour carts used to go. (A cheap in-world reason
  the map opens exactly when the story wants it to.)
- **Why the loop works:** every town is one route from the next, and the capital is one route from three of them.
  Raptors later turn the whole loop into quick travel.
- **Size:** it all fits inside today's 60 × 34 block grid (600 × 340 tiles). The outer ring stays forest, cliffs and sea.
  If it feels empty we shrink the grid later; we don't pad it with routes.

## Shape of a playthrough

Level 1 to about 30 over 15+ hours.

| stretch | story beats | places, in order | levels | hours |
|---|---|---|---|---|
| 1. Hearthspire | 1–4 | the bakery, the square, the nest, Mallow's kitchen | 1–3 | 1 |
| 2. The first piece | 5–6 | the capital gate, **R1**, **Pebblebrook** and its mine | 3–8 | 2.5 |
| 3. The desert | 6 | **R2**, **Sunhaven** | 8–13 | 2.5 |
| 4. The ovens | 6 | **R3**, **Emberreach** (Snatchclaw's first fight) | 13–18 | 2.5 |
| 5. Home | 7–9 | **R4** the bun road, the empty square, the castle, the Ordeal | 17–19 | 1.5 |
| 6. The cold | 10 | the flour tunnel, **R5**, **Frostwick** | 19–23 | 2 |
| 7. The sea | 10 | **R6**, **Saltspray**, the island boats | 23–27 | 2 |
| 8. The march | 10–12 | the march home, the capital, the castle, the hatching | 27–30 | 1.5 |
| Post-game | | optional: the islands' trials, Glitterbeak's hoard | 30+ | open |

## Hearthspire (the middle)

| | |
|---|---|
| **Role** | home, hub, start and end; the story's beginning, midpoint and finale |
| **Levels** | 1–3 at the start; 17–19 at the midpoint; no random fights in town |
| **Places** | the bakery (Mallow), Bib's bench, the square, the Great Nest in the castle yard, the tower fire, the castle hall (the mural), the guards' barracks, the capital gate, the flour tunnel |
| **Services** | inn (rest, roster, world map), shop (tier 1, upgrading with the story), smith, market board, bounty board, fountain |
| **Story** | the hatching and the call; Mallow and the rhyme; the empty square; the Ordeal; the finale and the new hatching |
| **Companions** | Wizzle and Glint join here; Bork at the gate |
| **Fights** | Snatchclaw (castle), Glitterbeak (castle roof) |
| **Changes over the game** | the bakery notice "EVERY BATCH TO THE GUARDS FIRST"; the throne going up in the yard; the north and east gates shut; at the end, all of it undone and the square full |

## Towns

| town | where | job in the bun chain | levels | services | keeper's challenge | guard boss | companion | piece | field move |
|---|---|---|---|---|---|---|---|---|---|
| **Pebblebrook** | west, one route out | the mill, the dam and the copper mine | 3–8 | inn, shop (tier 1), fountain, **smith** | Ruddle: get the miners to the shift circle | **Grubb** and **Snipe** (tolls) | Nugget | **the tube** (mill axle) | **raptors** (stable on the mill road) |
| **Sunhaven** | south-west, desert oasis | honey and water | 8–13 | inn, shop (tier 2), fountain | the head scribe: find the drainer by reading the signs | a guard captain (the drain) | Saffi | **the sight** (honey-glass lens) | |
| **Emberreach** | south-east, volcano | the bakers' ovens | 13–18 | inn, shop (tier 3), fountain, **forge** (reforging) | the forge master: relight the ovens | **Snatchclaw** (first fight) | Cinder | **the igniter** (volcano flint) | |
| **Frostwick** | north, snow | ice cellars for the flour | 19–23 | inn, shop (tier 3), fountain | the fort captain: build the fort, your plan loses, build the winner | the draft sergeant | (Wizzle is rescued) | **the cooling fins** | |
| **Saltspray** | east, harbour | salt, fish and the island boats | 23–27 | inn, shop (tier 4), fountain, bounty board | the two harbour masters: patch the leak | the pier captain | Crumb | **the ember chamber** (island lantern) | **boats** |

Every town has a **healing fountain** (fast travel after the second piece) and a welcome sign. A town's trouble shows
within 30 seconds of walking in.

**Mossbacks** (the farmers, druids) live on Pebblebrook's farms, so they appear there and nowhere else. The
**Nettlenose** scouts and slingers are Snatchclaw's, and they spread along the roads as the story goes on.

## Routes

Seven routes, down from fifteen. Each is a place worth walking, not a corridor.

| route | from–to | land | levels | foes | material | off the path | blocked by |
|---|---|---|---|---|---|---|---|
| **R1** | Hearthspire (gate) → Pebblebrook | grass, then a mill road | 3–6 | Nettlenose scouts, beetles | moss | Fennel's old runaway goat; a chest behind the pond; **the raptor stable** (shut until the first piece) | |
| **R2** | Pebblebrook → Sunhaven | grass, then desert | 8–11 | guards on the road, sand skinks | sand glass | a cactus-marked chest; a Mossback farmer who thinks you're a bun | |
| **R3** | Sunhaven → Emberreach | desert, then mountain pass | 13–16 | rock goats, stokers, Nettlenose slingers | gold scrap | hot springs (heals); a miners' rest stop; Smudge selling shiny junk | |
| **R4** | Emberreach → Hearthspire (the **bun road**) | mountain pass, then grass | 16–18 | guards (strong), Nettlenose, a toll gate | gold scrap, moss | the cart that lost its buns (joke) | the toll until Pip has three pieces |
| **R5** | Hearthspire → Frostwick | grass, then snowfield | 19–22 | snow beasts, frost guards, Nettlenose | frost shard | a snowkobold contest (joke); the draft camp's outpost | the north gate (shut until the flour tunnel) |
| **R6** | Hearthspire → Saltspray | grass, then shore | 23–25 | crabs, smugglers, guards | pearl, reed | a shipwreck; Glint's best shiny offer yet | the east gate (shut until the flour tunnel) |
| **R7** | Saltspray → the islands (by boat) | sea and two small islands | 25–27 | crabs, sea guards | pearl | a little island with a chest; the ember-lantern isle | boats (after the harbour is patched) |

**New foes (the minimum):** Nettlenose scouts and slingers, Snatchclaw's guards (with a strong version), beetles, sand
skinks, rock goats, stokers, snow beasts, crabs, smugglers. **Cut from the old plan:** bog frogs, fog wisps, owls, dune
bandits, spore critters, sea bandits.
**Materials:** moss, sand glass, gold scrap, frost shard, pearl, reed.

## Field moves

| move | opens | learned | what it does |
|---|---|---|---|
| **Raptors** | Pebblebrook's stable on the mill road | after the first piece (the tube) | ride between stables in each town; the loop becomes quick travel; opens one cliff shortcut on R3 |
| **Boats** | the island boats at Saltspray | after the harbour is patched | sail to the two islands; the ember-lantern isle holds the fifth piece's trial |
| **The flour tunnel** | the bakery cellar | after the Ordeal | not a field move: the story's way out to the shut gates |

## What the old plan loses, and where it goes

| old place | now |
|---|---|
| Burrowhome and its valley | removed; Hearthspire takes its role as home and finale |
| Copperhollow | folds into Pebblebrook (the mine) |
| Thistledown | removed; Hearthspire is the big city |
| Mossmere | the Mossback farms, part of Pebblebrook |
| Glimmerfen, Brindlecove | removed; the islands in R7 take the island-hideout feel |
| Frostpeak | optional post-game, later |
| 8 routes more | cut (see above) |

## Rules for level design (kept)

1. Every route has at least one thing off the path: a chest, a joke, a side quest.
2. A fountain or inn is never more than one route away.
3. Key items and barriers are always explained by a sign or a villager before you hit them.
4. A town's first visit shows its trouble within 30 seconds of walking in.
5. Routes that open late (R5, R6, R7) become shortcuts for the end and the post-game.

## Questions for Joakim (the choices I'd like you to confirm)

1. **Frostwick north, Saltspray east.** Does that feel right, or should the cold town be the far end of the loop?
2. **The shut gates and the flour tunnel** as the reason the map opens in act 3. Keep, or find a different reason?
3. **Seven routes.** Is that still too many? The slice only needs R1 and Hearthspire; the rest can stay on paper.
