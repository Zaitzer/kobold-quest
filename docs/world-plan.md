# Kobaldia: world plan (draft)

*Step 1.4 of the roadmap. What each town and route is for, how tough it is, and where things are. The map itself is
`REGION` in `src/data/overworld.js`; the story steps are in `story-bible.md`.*

## Shape of a playthrough

The story runs from level 1 to about 30 over 15+ hours. Each stretch is roughly one evening, or several coffee breaks:

| stretch | places, in order | levels | hours |
|---|---|---|---|
| 1. Home | Burrowhome, Pebble Hills, Whisper Woods | 1–3 | 0.5 |
| 2. First sparks | Route 1, **Pebblebrook**, Route 3, **Copperhollow** | 2–8 | 2 |
| 3. Into the land | Route 8 tunnel, **Thistledown**, Route 9, **Sunhaven** | 8–14 | 3 |
| 4. Fire and ice | Route 14, **Emberreach**, Route 13, **Frostwick** | 13–19 | 3 |
| 5. The crisis | Route 10, **Glimmerfen**, Frostpeak (back north) | 19–23 | 2.5 |
| 6. The hideout | Route 11, Saltspray, Route 15 bridges, **Brindlecove** | 22–28 | 2.5 |
| 7. Home again | Route 5, Mossmere, Route 2, Burrowhome: the second hatching | 26–30 | 1.5 |
| Post-game | Frostpeak trials, Snatchclaw's stash, rare recruits | 30+ | open |

## Towns

| town | role | levels | services | story | recruit | key item |
|---|---|---|---|---|---|---|
| **Burrowhome** | home; start and finale | 1–3 | inn (rest, roster, world map), shop (tier 1), smith, market board, bounty board, moon shrine | the Hatching opens and ends here | Bork and Wizzle (story) | |
| **Pebblebrook** | farming village | 3–5 | inn, shop (tier 1), fountain | spark 1 | Fennel (cleric) | |
| **Copperhollow** | mining town | 6–8 | inn, shop (tier 2), **smith** (better recipes) | spark 2 | Nugget (warrior) | lantern |
| **Thistledown** | the big city | 9–11 | inn, shop (tier 2), **market board**, bounty board | spark 3, rival 1 | Brass (ranger) | |
| **Sunhaven** | desert oasis | 12–14 | inn, shop (tier 3) | spark 4 | Saffi (mage) | water flask |
| **Emberreach** | volcano forge town | 14–16 | inn, shop (tier 3), **forge** (reforging, set gear) | spark 5, Snatchclaw 1 | Cinder (warrior) | |
| **Frostwick** | snow town | 17–19 | inn, shop (tier 3) | spark 6, rival 2 | Pell (cleric) | warm boots |
| **Glimmerfen** | foggy marsh town | 21–23 | inn, shop (tier 4) | spark 7, the crisis | Mist (ranger) | |
| **Saltspray** | harbour | 23–25 | inn, shop (tier 4), bounty board | the approach | Skipper Gull (ranger) | |
| **Brindlecove** | island; the hideout | 25–28 | inn (after the boss) | spark 8, final boss | | |
| **Mossmere** | woodland village | early visit 3–6; finale 26–28 | inn, shop (tier 1) | the five stay-homes, rival 3 | Tikka (ranger, after rival 3) | |

Every town has a **healing fountain** (fast travel after spark 2) and a welcome sign.

## Routes

| route | from–to | land | levels | foes | material | off the path | blocked by |
|---|---|---|---|---|---|---|---|
| 1 | Burrowhome–Pebblebrook | grass | 2–4 | Mossback bandits, beetles | moss | Fennel's runaway goat; a chest behind the pond | |
| 2 | Burrowhome–Mossmere | woods | 3–6 | grape bandits, owls | frost shard | a hidden clearing with a rare chest | |
| 3 | Pebblebrook–Copperhollow | grass, then mountain pass | 5–8 | bandits, rock goats | moss, **gold scrap** | a lookout with a view of the land | |
| 4 | Pebblebrook–Thistledown | grass | 8–10 | bandits | moss | | toll gate (until the end) |
| 5 | Mossmere–Saltspray | woods, then grass | 24–26 | grape bandits (strong) | frost shard | | toll gate (until the end) |
| 6 | Mossmere–Thistledown | grass, marsh | 10–12 | bog frogs | reed | | toll gate (until the end) |
| 7 | Copperhollow–Emberreach | mountain pass | 16–18 | rock goats, stokers | gold scrap | a miners' rest stop | rockslide (until Frostwick) |
| 8 | Copperhollow–Thistledown | cave tunnel | 8–10 | spore critters | spores | glowing side cave | darkness (until the lantern) |
| 9 | Thistledown–Sunhaven | desert | 11–13 | sand skinks, dune bandits | sand glass | a buried chest marked by a cactus | |
| 10 | Thistledown–Glimmerfen | grass, then marsh | 19–22 | bog frogs, fog wisps | reed | a frog choir (joke) | |
| 11 | Saltspray–Glimmerfen | shore | 22–24 | crabs, smugglers | pearl | a shipwreck | |
| 12 | Thistledown–Brindlecove | grass, then shore | 25–27 | smugglers | pearl | | toll gate (until the end) |
| 13 | Emberreach–Frostwick | snowfield | 16–19 | frost bandits, snow beasts | frost shard | a snowkobold contest (joke) | |
| 14 | Emberreach–Sunhaven | mountain pass, desert | 13–15 | sand skinks, stokers | sand glass, gold scrap | hot springs (heals) | heat (until the water flask) |
| 15 | Glimmerfen–Brindlecove | shore and sea bridges | 24–27 | crabs, sea bandits | pearl | a little island halfway with a chest | |

**New areas needed:** Frostpeak (above Route 13, needs the warm boots), Thistledown's sewers (the quartermaster's
hideout), the volcano crater above Emberreach, and Snatchclaw's hideout on Brindlecove.

**New foes needed:** beetles, owls, rock goats, sand skinks, dune bandits, stokers, snow beasts, bog frogs, fog wisps,
crabs, smugglers, sea bandits. **New materials:** sand glass, reed, pearl (and gold scrap gets its home on the mountain passes).

## Rules for level design

1. Every route has at least one thing off the path: a chest, a joke, a side quest.
2. A fountain or inn is never more than one route away.
3. Key items and barriers are always explained by a sign or a villager before you hit them.
4. A town's first visit shows its trouble within 30 seconds of walking in.
5. Routes that open late (4, 5, 6, 12) become shortcuts for the end and the post-game.
