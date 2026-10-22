# Kobaldia: style guide (for Joakim's drawings)

*Step 1.5 of the roadmap. Joakim draws in Paint.NET with a pen on a touch screen. This page says what to draw, at what
size, and how to hand it over. The look itself is up to him; the "suggested" parts are only a starting point.*

## How a drawing gets into the game

**Once, to set up (5 minutes, on the PC):**
1. Install **GitHub Desktop** (desktop.github.com) and sign in with your GitHub account.
2. **File → Clone repository → Zaitzer/kobold-quest**. It lands in e.g. `Documents\GitHub\kobold-quest`.

**Every time:**
1. In GitHub Desktop, press **Fetch origin** (and **Pull** if it offers), so you have my latest changes.
2. Open the drawing's file in `art\sprites\` (e.g. `pip.png`). Every file is already there, as a copy of its template
   with the grid. Draw on a **new layer** and hide the grid layer.
3. **File → Save** (PNG, flatten) over the same file. Untouched copies are ignored, so anything you haven't drawn keeps
   its look drawn in code. Keep the `.pdn` somewhere outside the repo if you want the layers.
4. In GitHub Desktop: type a short summary (e.g. "Pip"), press **Commit to main**, then **Push origin**.
5. About **2 minutes** later it's on joakimskar.no (reload the page). The Claude page gets it with my next update.

The game takes it from there: it moves feet that are slightly off the line onto it, flips characters to face left,
and uses the drawing wherever that character or tile appears (map, battles, the party screen). Anything without a
drawing keeps its look drawn in code, so you can draw in any order. To change a drawing, save over it and push
again; to go back, GitHub Desktop's **History** has every version.

`art/WANTED.md` is the checklist: every drawing the game can use, its template, and ✅ once it's in.

## Sizes: pixel art at twice Ruby's resolution (decided 22 Oct 2026)

The game is **pixel art at twice the resolution of Pokémon Ruby and Emerald** (the GBA's 16 × 16 tiles and 16 × 32 characters).
Draw **one pixel per pixel** at the size below; the game scales it up on screen with no smoothing (nearest-neighbour), so every
pixel stays a crisp square on any phone. A drawing is small, so a character takes minutes, not an evening.

| what | canvas (draw at this size) | template | on screen | rules |
|---|---|---|---|---|
| Map tile | **32 × 32** | `tile-32.png` | 32 px, scaled up whole on dense screens | edges tile with the same tile on every side |
| Character (kobold, villager, foe) | **32 × 64** | `character-32x64.png` | one tile wide, two tall | **facing right** (the game flips it for left); feet on the red line (row 60); stay inside the green box |
| Boss (a 2 × 2-tile foe) | **64 × 96** | `boss-64x96.png` | two tiles wide, three tall | same rules, twice as wide |
| House or building | **128 × 96** (4 × 3 tiles) | `house-128x96.png` | | door in the red box, bottom middle |
| Portrait (dialogue, optional) | **64 × 64** | `portrait-64.png` | shown at 3× | head and shoulders, facing right |

**Pip** was drawn on the old 128 × 128 template and needs redrawing at 32 × 64 (a shrunk copy loses the pixel look).

## Style rules (suggested)

1. **A one-pixel dark outline** around every character and object, so they read on a small screen. The ink colour is a deep
   purple, `#140a35`. Tiles have no outline inside the ground.
2. **Few colours:** up to 16 per drawing including the outline (twice what a GBA sprite could use on its own palette, so two or
   three shades per colour are fine).
3. **Big heads, small bodies** for kobolds: about half the height is the head, so the face reads at a fingertip's size.
4. **Each kobold has one strong colour** so friends tell them apart at a glance (Pip orange, Bork green, Wizzle blue...).
5. **Tiles are calmer than characters:** lower contrast, so characters stand out.
6. **No anti-aliasing:** in Paint.NET turn antialiasing off (the button in the toolbar) and use the pencil, not the brush.

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

## What to draw first (the new slice, 22 Oct 2026)

The slice is **Hearthspire act 1 → the capital gate → R1 → Pebblebrook and the mine** (`scope.md` M1). Everything not on this
list stays drawn in code until phase 3, so draw top to bottom and stop anywhere: each drawing makes the game better on its own.
`art/WANTED.md` is regenerated for the new cast when the slice starts; existing files with the right name (`bork.png`,
`glint.png`, `mallow.png`, `nugget.png`, `grubb.png`, `glitterbeak.png`, `beetle.png`) are reused.

**A. The first ten (the faces of the whole game)**

| # | file | who / what | template | why first |
|---|---|---|---|---|
| 0 | `pip.png` | Pip (redraw at 32 × 64) | character-32x64 | the hero; the old drawing was on the 128 template |
| 1 | `mallow.png` | Mallow, the baker | character-32x64 | the mentor; on screen in every act |
| 2 | `bib.png` | Bib on his bench | character-32x64 | the theme in one kobold; first and last scene |
| 3 | `wizzle.png` | Wizzle | character-32x64 | joins in act 1 |
| 4 | `glint.png` | Glint | character-32x64 | joins in act 1 |
| 5 | `bork.png` | Bork | character-32x64 | joins at the gate |
| 6 | `guard.png` | one of Snatchclaw's guards | character-32x64 | the most common foe and villager of the game |
| 7 | `scout.png` | a Nettlenose scout | character-32x64 | the first foe on R1 |
| 8 | `glitterbeak.png` | Glitterbeak, hatched | boss-64x96 | the hatching's big moment |
| 9 | `tile-marble.png` | Hearthspire's street | tile-32 | the capital is the first place anyone sees |
| 10 | `nugget.png` | Nugget | character-32x64 | joins in the mine |

**B. The rest of the slice's cast**

| file | who / what | template |
|---|---|---|
| `ruddle.png` | Miller Ruddle (keeper) | character-32x64 |
| `grubb.png` | Grubb (boss) | boss-64x96 |
| `snipe.png` | Snipe on his copper cart (boss) | boss-64x96 |
| `smudge.png` | Smudge, the friendly cousin | character-32x64 |
| `bramble.png` | Bramble, who backs the sprouty egg | character-32x64 |
| `egg-sprouty.png`, `egg-sleepy.png`, `egg-shiny.png` | the three eggs at the nest | character-32x64 |
| `slinger.png` | a Nettlenose slinger | character-32x64 |
| `beetle.png` | a copper beetle | character-32x64 |
| `glowgrub.png` | a glow grub | character-32x64 |
| `rat.png` | a cellar rat | character-32x64 |
| `miner.png` | a miner (Ore, Tansy, Flint and Grit, Marl share it, tinted) | character-32x64 |

**C. Places (tiles and buildings)**

| file | what | template |
|---|---|---|
| `tile-castlewall.png`, `tile-nest.png` | the castle wall; the Great Nest's straw | tile-32 |
| `bakery.png`, `castlegate.png`, `inn.png` | Mallow's bakery (with the cellar door), the capital gate, an inn | house-128x96 |
| `tile-grass.png`, `tile-tallgrass.png`, `tile-path.png`, `tile-pond.png` | R1 | tile-32 |
| `mill.png` | the mill and its wheel (Pebblebrook's landmark) | house-128x96 |
| `tile-minefloor.png`, `tile-rails.png`, `tile-dark.png` | the mine | tile-32 |

**Later (phase 3):** Snatchclaw, the other companions (Saffi, Cinder, Crumb), the keepers, each town's foes and tiles, walking
frames and portraits. In all the game wants roughly 80 to 110 drawings (`gate1-review.md` B1); the slice needs about 35.
