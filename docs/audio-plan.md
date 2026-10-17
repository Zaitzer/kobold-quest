# Kobaldia: audio plan (draft)

*Step 1.6 of the roadmap.*

## Approach

The game already makes its own music and sounds in code: little chiptune tracks built from a key, a tempo and a seed
(`engine/music.js`), and short synth sounds (`engine/audio.js`). That suits the game: it costs nothing to download,
works offline in the Claude page, and every area can have its own tune. The plan keeps that: all music and sounds are
made in code.

Rules:
1. **Sound is on by default, quiet by default.** A tap starts the audio (browsers require it); a mute button is always one tap away.
2. **Music never fights dialogue.** It dips while someone talks.
3. **Every important moment has a sound:** a new spark, a level up, a key item, a recruit joining. Small actions
   (talking, opening a door) get a soft click so the game feels alive.
4. **Each place sounds like itself:** the land picks the instrument and the scale; towns get calmer, slower versions.

## Music (one track per kind of place, plus story moments)

| track | where | mood | built from |
|---|---|---|---|
| Burrowhome | home valley | warm, bouncy | exists (village) |
| Town | every town (each town shifts key and tempo) | calm, friendly | new, from the village track |
| Grass route | grassy routes | light, adventurous | exists (meadow) |
| Woods | forest routes, Whisper Woods | soft, curious | exists |
| Cave | the tunnel, caves | slow, drippy | exists |
| Desert | Sunhaven routes | hot, swaying | new |
| Mountain pass | passes, Emberreach | stomping, steady | new |
| Snow | Frostwick, the snowfield, Frostpeak | twinkly, slow | new |
| Marsh | Glimmerfen | foggy, odd | new |
| Shore | Saltspray, Brindlecove, the bridges | breezy | new |
| Battle | normal fights | quick | exists |
| Boss | bosses | heavy | exists |
| Rival | Tikka's battles | cheeky, fast | new |
| Snatchclaw | his scenes and fights | sly showman | new |
| Crisis | Glitterbeak's rampage | urgent | new |
| Old Guardian | Frostpeak summit | slow, ancient | new |
| The Hatching | the finale | big and happy | new |

Short jingles: spark gained, level up, recruit joins, key item, battle won, battle lost.

## Sounds

| sound | when | status |
|---|---|---|
| hit, crit, miss, knock-out | battles | exists |
| nom, pet, pop, drop, win | eating, petting, small events, items, victory | exists |
| yip | the yip button | exists (pitched per player) |
| talk blip | each dialogue line | new |
| door | in and out of houses | new |
| chest | opening a chest | new |
| fountain | drinking, healing | new (uses pop now) |
| bump | walking into a barrier or wall | new |
| spark | gaining a spark | new jingle |
| level up | | new jingle |
| egg crack, dragon roar | the hatchings, Glitterbeak | new |
| menu tap | buttons | new, very soft |

## Decision

- **Everything generated in code** (Joakim, 17 Oct 2026). No recorded sounds; the `art/sounds` idea is dropped.
