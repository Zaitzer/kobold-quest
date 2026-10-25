# Kobaldia: style guide (for Joakim's drawings)

*Step 1.5 of the roadmap. Joakim draws in Paint.NET with a pen on a touch screen. This page says what to draw, at what
size, and how to hand it over. The look itself is up to him; the "suggested" parts are only a starting point.*

## How a drawing gets into the game

**Once, to set up (5 minutes, on the PC):**
1. Install **GitHub Desktop** (desktop.github.com) and sign in with your GitHub account.
2. **File → Clone repository → Zaitzer/kobold-quest**. It lands in e.g. `Documents\GitHub\kobold-quest`.

**Every time:**
1. In GitHub Desktop, press **Fetch origin** (and **Pull** if it offers), so you have my latest changes.
2. Open the sheet's file in `art\` (e.g. `characters\heroes\pip.png`). Every file is already there, as a simple stand-in at
   the right size. Import its template from `art\templates\` as a layer (frame borders, the feet line, the safe box), draw
   underneath, then delete the template layer.
3. **File → Save** (PNG, flatten) over the same file. Until you do, the game shows the stand-in. Keep the `.pdn` somewhere outside the repo if you want the layers.
4. In GitHub Desktop: type a short summary (e.g. "Pip"), press **Commit to main**, then **Push origin**.
5. About **2 minutes** later it's on joakimskar.no (reload the page).

The game takes it from there: it picks each row (by direction and facing; nothing is mirrored) and frame by what the character is doing,
and uses the sheet wherever that character or tile appears (map, battles). Anything without a
drawing keeps its look drawn in code, so you can draw in any order. To change a drawing, save over it and push
again; to go back, GitHub Desktop's **History** has every version.

`art/ASSETS.md` is the checklist: every sheet the game can use, its size and template.

## Sizes: pixel art at twice Ruby's resolution (decided 22 Oct 2026)

The game is **pixel art at twice the resolution of Pokémon Ruby and Emerald** (the GBA's 16 × 16 tiles and 16 × 32 characters).
Draw **one pixel per pixel** at the size below; the game scales it up on screen with no smoothing (nearest-neighbour), so every
pixel stays a crisp square on any phone. A drawing is small, so a character takes minutes, not an evening.

| what | canvas (draw at this size) | template | on screen | rules |
|---|---|---|---|---|
| Map tile | **32 × 32** | `tile-32.png` | 32 px, scaled up whole on dense screens | edges tile with the same tile on every side |
| Character (kobold, villager, foe) | **32 × 32** (24 Oct) | `hero-128x224.png`, `villager-96x128.png`, `foe-96x128.png` | one tile, the same pixel size as the tiles | every direction drawn (no flipping, 25 Oct); feet on the red line (row 30); each frame is labelled (DN1 = walk down, frame 1); `templates/guides/` names every frame in words |
| Boss (a 2 × 2-tile foe) | **64 × 64** | `boss-192x256.png` | two tiles by two | same rules, feet on row 60 |
| House or building | **128 × 96** (4 × 3 tiles) | `house-128x96.png` | | door in the red box, bottom middle |
| Portrait (dialogue, optional) | **64 × 64** | `portrait-64.png` | shown at 3× | head and shoulders, facing right |

**Eight directions, four frames, nothing mirrored (Joakim, 25 Oct).** A character walks in 8 directions (the map has diagonal
walking), each a row of 4 frames (stand, step, stand, the other step). Left and right are **drawn separately**, never flipped by
the game, so a character can be asymmetrical: a staff in the right hand stays in the right hand. The battle poses (idle,
attack, cast, hurt / down / cheer) each have a facing-right row and a facing-left row, 4 frames each. The rows of every sheet
type are in `art/ASSETS.md`; each template frame is labelled, and `art/templates/guides/` names every frame in words.

**With ChatGPT (25 Oct):** `art/templates/gpt/` has big templates an image AI can fill in (one row of a sheet, or the
8-way turnaround), the prompt, and `tools/gpt-art.py`, which turns a filled template into the row of the real sheet.

**Characters are one tile (Joakim, 24 Oct):** a kobold is as big as a tile, squat and big-headed, with no tall frame for the head to rise
over the tile behind. Half the pixels of the old 32 × 64, and the same pixel size as the map, so nothing clashes.
Joakim's first Pip (drawn on the old 32 × 64 sheet the same day) is kept in `art/reference/pip-32x64.png`; `pip.png` and the
12 class sheets were shrunk from it automatically as a start, so their outlines need tidying by hand.

## Style rules (suggested)

1. **A one-pixel dark outline** around every character and object, so they read on a small screen. The ink colour is a deep
   purple, `#140a35`. Tiles have no outline inside the ground.
2. **Few colours:** up to 16 per drawing including the outline (twice what a GBA sprite could use on its own palette, so two or
   three shades per colour are fine).
3. **Big heads, small bodies** for kobolds: about half the height is the head, so the face reads at a fingertip's size.
4. **Each kobold has one strong colour** so friends tell them apart at a glance (Pip orange, Bork green, Wizzle blue...).
5. **Tiles are calmer than characters:** lower contrast, so characters stand out.
6. **No anti-aliasing:** in Paint.NET turn antialiasing off (the button in the toolbar) and use the pencil, not the brush.

## The hero's colour (decided 23 Oct, build step 19)

The hero's sheets (`pip.png` and the class outfits) are drawn with **Pip's orange** as the scale colour. The player picks one of six
colours for their hero (orange, green, blue, pink, gold, purple); the game recolours every pixel whose hue is orange (10° to 45°, not
grey) to the chosen hue and keeps its light and shade. So: draw the scales orange, and keep other orange things (a carrot, a flame) a
little red or yellow, or greyer, if they should stay as they are.

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

## The art folder: `art/` (sprite sheets, 22 Oct 2026; moved out of `art/v6` on 23 Oct)

Every asset of the new game is now waiting in **`art/`**, sorted in folders (characters, foes, bosses, tiles, buildings, fx,
portraits, objects, icons), as an **empty transparent placeholder at the right size**. Each one is a **sprite sheet**: its
animations in rows (walk down, up and side; battle idle; attack; cast; hurt, down and cheer), frames left to right. The
templates with frame borders, feet lines and safe boxes are in `art/templates/`; **`art/ASSETS.md`** lists all 469 assets
with their sheet type and marks the 202 the slice uses (★). To draw one: open the placeholder, import the template as a layer,
draw underneath, delete the template layer, save, push. The list below says what to draw **first**; ★ in `ASSETS.md` says everything the slice will use
(what isn't drawn yet shows its simple stand-in in the game).

## What to draw first (the new slice, 22 Oct 2026)

The slice is **Hearthspire act 1 → the capital gate → R1 → Pebblebrook and the mine** (`scope.md` M1). Everything not on this
list stays drawn in code until phase 3, so draw top to bottom and stop anywhere: each drawing makes the game better on its own.
The old game's drawings (`art/sprites`, on the 128 × 128 template) were retired with the old game on 23 Oct; they are in the
repository's history if any are worth redrawing at 32 × 32.

**A. The first ten (the faces of the whole game)**

| # | file | who / what | template | why first |
|---|---|---|---|---|
| 0 | `pip.png` | Pip (redraw at 32 × 32) | character-32x32 | the hero; the old drawing was on the 128 template |
| 1 | `mallow.png` | Mallow, the baker | character-32x32 | the mentor; on screen in every act |
| 2 | `bib.png` | Bib on his bench | character-32x32 | the theme in one kobold; first and last scene |
| 3 | `wizzle.png` | Wizzle | character-32x32 | joins in act 1 |
| 4 | `glint.png` | Glint | character-32x32 | joins in act 1 |
| 5 | `bork.png` | Bork | character-32x32 | joins at the gate |
| 6 | `guard.png` | one of Snatchclaw's guards | character-32x32 | the most common foe and villager of the game |
| 7 | `scout.png` | a Nettlenose scout | character-32x32 | the first foe on R1 |
| 8 | `glitterbeak.png` | Glitterbeak, hatched | boss-64x64 | the hatching's big moment |
| 9 | `tile-marble.png` | Hearthspire's street | tile-32 | the capital is the first place anyone sees |
| 10 | `nugget.png` | Nugget | character-32x32 | joins in the mine |

**B. The rest of the slice's cast**

| file | who / what | template |
|---|---|---|
| `ruddle.png` | Miller Ruddle (keeper) | character-32x32 |
| `grubb.png` | Grubb (boss) | boss-64x64 |
| `snipe.png` | Snipe on his copper cart (boss) | boss-64x64 |
| `smudge.png` | Smudge, the friendly cousin | character-32x32 |
| `bramble.png` | Bramble, who backs the sprouty egg | character-32x32 |
| `egg-sprouty.png`, `egg-sleepy.png`, `egg-shiny.png` | the three eggs at the nest | character-32x32 |
| `slinger.png` | a Nettlenose slinger | character-32x32 |
| `beetle.png` | a copper beetle | character-32x32 |
| `glowgrub.png` | a glow grub | character-32x32 |
| `rat.png` | a cellar rat | character-32x32 |
| `miner.png` | a miner (Ore, Tansy, Flint and Grit, Marl share it, tinted) | character-32x32 |

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
