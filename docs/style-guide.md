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

## What to draw first

The full list with file names is `art/WANTED.md`. Suggested order:
1. **Heroes:** `pip.png`, `bork.png`, `wizzle.png`.
2. **Burrowhome:** `elder.png`, `yarrow.png`, `tikka.png`, `toast.png`, `biscuit.png`, `clink.png`, `pebble.png`, `nettle.png`, `quill.png`.
3. **The first towns:** `turnip.png`, `grubb.png`, `ruddle.png`, `snipe.png`, `pickett.png`, `nugget.png`, `dusty.png`, `shale.png`.
4. **Monsters met early:** `scout.png`, `slinger.png`, `thief.png`.
5. **Tiles**, if you want to: `tile-grass.png`, `tile-tallgrass.png`, `tile-path.png`, `tile-tree.png`, `tile-water.png`.

Later: walking frames, portraits, houses, the eggs, the other towns' people and monsters.
