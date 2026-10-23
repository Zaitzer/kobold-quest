# Kobaldia: audio plan (draft, story v6 added 22 Oct 2026)

*Step 1.6 of the roadmap, and 2.5 for the slice (Hearthspire and the castle).*

## Approach

The game already makes its own music and sounds in code: little chiptune tracks built from a key, a tempo and a seed
(`engine/music.js`), and short synth sounds (`engine/audio.js`). That suits the game: it costs nothing to download,
works offline, and every area can have its own tune. The plan keeps that: all music and sounds are
made in code.

Rules:
1. **Sound is on by default, quiet by default.** A tap starts the audio (browsers require it); a mute button is always one tap away.
2. **Music never fights dialogue.** It dips while someone talks.
3. **Every important moment has a sound:** a Smiler piece, a level up, a key item, a recruit joining. Small actions
   (talking, opening a door) get a soft click so the game feels alive.
4. **Each place sounds like itself:** the land picks the instrument and the scale; towns get calmer, slower versions.
5. **A town's trouble takes a layer away; fixing it brings the layer back** (v6). Each town's track loses its drums while its
   trouble lasts and gets them back at the reconciliation: Pebblebrook's drums *are* the mill wheel, so when the wheel turns the
   music starts walking again. One rule, five towns, no extra tracks, and the player hears the town get better.
6. **One tune is fixed, not generated: Mallow's rhyme** (v6). It is the game's theme: Mallow hums it in the bakery, it
   plays thin and slow in the Reward when the ember glows, and in full at the new hatching.

## Music (one track per kind of place, plus story moments)

*The engine's tracks are a key, a tempo, a scale, a 4-chord loop, a seed, a lead voice and a drum pattern (`engine/music.js`).
New tracks below are given in those terms so they are a line each in `RP_TRACKS`. Old-story tracks are marked cut.*

| track | where | mood | built from |
|---|---|---|---|
| ~~Burrowhome~~ | cut (the village track becomes Hearthspire's) | | |
| **Hearthspire, morning** | act 1 | warm, bouncy, a little smug | new: `bpm 100, root 62, major, [0,3,4,0], seed 3, triangle, dr light`; the rhyme's first bar as an intro |
| **Hearthspire, under the guards** | after the hatching, until the march | the same tune, but the guards' step has crept in | same seed: `bpm 88, harm, square, dr march` (the rule of layers: the town's drums become the guards' boots) |
| **The empty square** | the Approach and the Ordeal (the bench) | lonely | same seed: `bpm 70`, lead only, no chords, no drums |
| **Hearthspire, everyone came** | the march home and the capital filling | big, walking | same seed: `bpm 108, major, dr march`, the rhyme as the lead |
| **The castle** | the yard, the hall, the tower stairs; Snatchclaw's scenes | polite, steady, very sure of itself (he never cheats, so it is not sinister) | new: `bpm 96, root 50, dorian, [0,4,0,5], seed 43, square, dr march`; indoors `dr soft` |
| **The tower fire** | the top of the tower | still, holy-ish | no music: the fire crackle alone (a sound, below) |
| **Glitterbeak** | his scenes (the mill roof, the volcano, the castle roof) | shivering, spoiled | new: `bpm 120, root 71, harm, [0,1,0,1], seed 47, sine, dr drip`: high, thin and cold |
| Town | every town (each town shifts key and tempo) | calm, friendly | done; now with rule 5 (no drums until the trouble is fixed) |
| Pebblebrook | the town | the town tune, its drums the mill wheel | rule 5: `dr none` until the wheel turns, then `dr bounce` |
| Grass route | grassy routes (R1) | light, adventurous | exists (meadow) |
| Woods | forest routes | soft, curious | exists |
| Cave | the mine, the crater, the cellars | slow, drippy | exists; the mine's floor 2 (the dark) drops the lead to `sine` |
| Desert | Sunhaven routes | hot, swaying | done |
| Mountain pass | passes, Emberreach | stomping, steady | done |
| Snow | Frostwick | twinkly, slow | done |
| ~~Marsh~~ | cut with Glimmerfen (kept for a route stop if one needs it) | | |
| Shore | Saltspray, the island boats | breezy | done |
| Battle | normal fights | quick | exists |
| Boss | bosses | heavy | exists; Snatchclaw's fight uses the castle track at `bpm 140, dr drive` |
| ~~Rival~~ | cut with Tikka | | |
| ~~Snatchclaw~~ | becomes **The castle** above | | |
| ~~Crisis~~ | cut (Glitterbeak never rampages; he is cold) | | |
| ~~Old Guardian~~ | cut (no Frostpeak summit in v6) | | |
| **The Hatching** | the finale and the new hatching | big and happy | new: the rhyme in full, `bpm 112, major, sawtooth lead, dr drive`, ending on one held chord (one ember) |

**The rhyme's tune** (scale degrees in the track's key, one bar a line of the rhyme, four beats a bar; `-` holds):
`0 2 4 4 | 5 4 2 - | 0 2 4 4 | 3 2 1 - | 4 4 5 7 | 7 5 4 - | 3 2 1 2 | 0 - - -`. A lullaby a kobold could hum; Joakim may
replace it. The engine needs a `tune` field on a track to play fixed notes instead of seeded ones (tech plan).

Short jingles: Smiler piece gained, level up, recruit joins, key item, battle won, battle lost.

## Sounds

| sound | when | status |
|---|---|---|
| hit, crit, miss, knock-out | battles | exists |
| nom, pet, pop, drop, win | eating, petting, small events, items, victory | exists |
| yip | the yip button | exists (pitched per player) |
| talk blip | each dialogue line | done (each speaker their own pitch) |
| door | in and out of houses | done |
| chest | opening a chest | done |
| fountain | drinking, healing | done |
| bump | walking into a barrier | done |
| Smiler piece | gaining a piece (was the spark sound) | done, renamed |
| level up | | done (also recruit, key item, battle lost) |
| egg crack, dragon roar | the hatchings, Glitterbeak | done (the CRACK line; his first line in a conversation) |
| Glitterbeak's MINE | each time he says it: a low, greedy blip | done |
| tower fire | an ambient crackle at the tower and the bakery oven | done |
| ember glow | the Reward, once: a soft rising chime | done (the sound; the Reward is after the slice) |
| stone in the bag | Pebblebrook's circle: a clack per stone | done (a line about the stones at the circle) |
| mill wheel | creak and splash, on a loop near the mill once it turns | done |
| raptor | a skree when mounting, and Ghost the chick | done |
| menu tap | buttons | done |

Music dips indoors, more while someone talks, and nearly vanishes under a jingle (done).

## As built (23 Oct, build step 18)

`src/game/music6.js` holds the rule: a pure function of the game's state picks the track (Hearthspire's four versions by `act`,
`empty` and `march`; the castle yard and hall; Glitterbeak while he speaks; Mallow's hum and the fire in the bakery; the tower's
fire alone; Pebblebrook without drums until `pb 6`, then with them, and the wheel's creak within 7 tiles of the mill; R1; the mine,
the dark floor with a sine lead; fights and bosses, Snatchclaw on the castle track). The rhyme is the `tune` field; Hearthspire's
morning opens with its first bar; *everyone came* and *the Hatching* play it whole. The story's sounds come from its lines (`CUES`):
CRACK, Glitterbeak's first line and every MINE, Mallow singing, the circle's stones, skree. Tests: `logic/music6`, `browser/tsound6`.

## Decision

- **Everything generated in code** (Joakim, 17 Oct 2026). No recorded sounds; the `art/sounds` idea is dropped.
