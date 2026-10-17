# Kobaldia: style guide (for Joakim's drawings)

*Step 1.5 of the roadmap. Joakim draws in Paint.NET with a pen on a touch screen. This page says what to draw, at what
size, and how to hand it over. The look itself is up to him; the "suggested" parts are only a starting point.*

## How to hand over a drawing

1. Start from a template in `art/templates/` (open it in Paint.NET, draw on a **new layer** above the grid, hide the
   grid layer before saving).
2. **File → Save As → PNG**, transparent background. Keep the `.pdn` too, in case it needs changes.
3. Name it as in the lists below, e.g. `pip.png`, `tile-grass.png`.
4. Send it in this chat (attach the PNG). I put it in `art/` in the repo and wire it into the game.

You can send rough sketches too; a placeholder drawing in the game beats waiting for a perfect one.

## Sizes (templates)

| what | canvas | template | rules |
|---|---|---|---|
| Map tile | 64 × 64 | `tile-64.png` | shows at 32 px on screen; draw at double size so phones stay sharp. Edges should tile with the same tile on every side |
| Character (kobold, villager, monster) | 128 × 128 | `character-128.png` | **facing right** (the game flips it for left); feet on the red line; stay inside the green box |
| Boss | 256 × 256 | `boss-256.png` | same rules, twice the size |
| House or building | 256 × 192 (4 × 3 tiles) | `house-4x3.png` | door in the red box, bottom middle |
| Portrait (dialogue) | 192 × 192 | `portrait-192.png` | head and shoulders, facing right; optional, for later |

## Style rules (suggested)

1. **Thick dark outline** around every character and object (about 4–6 px at template size), so they read on a small
   screen. The game's outline colour is a deep ink purple, `#140a35`.
2. **Flat colours**, at most one shade per colour. No gradients or textures inside shapes.
3. **Big heads, small bodies** for kobolds. Faces need to read at the size of a fingertip.
4. **Each kobold has one strong colour** so friends tell them apart at a glance (Pip orange, Bork green, Wizzle blue...).
5. **Tiles are calmer than characters:** lower contrast, no outlines inside the ground tiles, so characters stand out.

## Palette (suggested starting point, from the current game)

| use | colours |
|---|---|
| outline / ink | `#140a35` |
| grass | `#6cbf4c` `#4f9a3c` |
| forest | `#3f7f3a` `#24672d` |
| water | `#3a8fd9` `#7bb6e6` |
| sand | `#e9d18b` |
| snow | `#eef4fb` |
| rock / cliff | `#4d3f57` `#62526d` |
| wood | `#a8743f` `#7a4f27` |
| roofs | `#c4523a` |
| gold / shiny | `#ffd54a` |
| UI purple | `#4a35b0` `#2a1a73` |

## What to draw, in order (the vertical slice first)

**1. The heroes** (most important, seen all the time)
- `pip.png`, `bork.png`, `wizzle.png`

**2. Burrowhome's people**
- `elder-mumble.png`, `yarrow.png`, `tikka.png`, `toast.png`, `biscuit.png`, `clink.png`, `pebble.png`, `nettle.png`, `quill.png`

**3. The slice's story**
- `turnip.png`, `fennel.png`, `ruddle.png`, `nugget.png`, `pickett.png`, `dusty.png`, `shale.png`
- `grubb.png`, `snipe.png`, `snatchclaw.png`
- `glitterbeak.png` (boss size), the three eggs: `egg-spiky.png`, `egg-sleepy.png`, `egg-shiny.png` (character size)

**4. Monsters of the slice**
- `bandit-scout.png`, `bandit-slinger.png`, `beetle.png`, `rock-goat.png`, `spore-critter.png`

**5. Tiles** (only if you want to: the drawn tiles can stay for a while)
- `tile-grass.png`, `tile-tallgrass.png`, `tile-path.png`, `tile-tree.png`, `tile-water.png`, `tile-flowers.png`, `house-small.png`

Later: walking frames (two extra poses per character), portraits, the other towns' people and monsters.
