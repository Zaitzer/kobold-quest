# The world

The maps, rooms, people, chests, doors and scenes of Kobold Quest. Edit them with the **map editor**; the game is built from
these files.

## Editing (Joakim)

1. Open `tools/editor/index.html` in **Chrome or Edge** on the computer (double-click it in the repo folder).
2. The first time, choose the **kobold-quest** folder (the one GitHub Desktop keeps). After that, "Open kobold-quest again".
3. Edit, then **Save** (Ctrl+S). The **Problems** tab must say 0 before the game will take the change.
4. In GitHub Desktop: commit and push. GitHub checks the world, builds the game and releases it ("World to the game" in the
   repo's Actions); joakimskar.no has it about 2 minutes after that. A red cross in GitHub means a problem: open the editor and look
   at the Problems tab.

What the editor does:

- **Paint** tiles (brush, rectangle, fill, pick). Right-drag or the "Move view" tool moves the view; the mouse wheel zooms.
- **Select** a tile to see what is on it and edit it: **links** (doors, gates, stairs, hatches: where walking onto or into the
  tile takes you, and "Make the way back"), **people** (name, colour, when they are there, their idle lines from the script),
  **chests** (name and contents), **marks**, **patrols**, **raptor stables**, where the map **starts**. Drag things to move them.
- **+ New** makes a map or a room. The **Place** tab sets its title, size, music, town, fight board, dark floor, encounters,
  flood and **goals** (checked on every save: "stairs to stairs is 30 to 60 steps", "no encounter grass within 10 steps of a gate").
- **Scenes**: when a scene plays (talk to someone, walk near a spot, step on a tile, come in, a new game), on which flags
  (`act >= 2, goat = 0`), and what happens: lines, fights, choices, joins, items, flags, deeds, chests, moving the hero. The lines
  themselves stay in `docs/slice-dialogue.md`: tap a line to start a scene there, Shift+tap to end it there. Set pieces (the fixed
  fights) and campfire chats are in the same tab.
- **Tiles**: the tile letters, their colours, which are solid, and which `art/tiles` sheet draws them.

## The files

| file | what |
|---|---|
| `tiles.json` | the tile letters: one legend for maps, one for rooms (name, colour, solid, sheet, what it stands on) |
| `maps/<id>.json` | a map (outdoors); the game calls it `<id>` |
| `rooms/<id>.json` | a room (indoors); the game calls it `room:<id>` |
| `scenes.json` | companions, the classes offered at the yard drill, set pieces, scenes, campfire chats |

A place is rows of letters, one letter a 32 × 32 tile, plus its links, people, chests, marks, patrols, stables, encounters and
goals. `tools/world/world.js` describes every field, writes the files in one format (so every save diffs cleanly), and checks the
world: every row the right width and every letter a tile; everything reachable from where the place starts; every link lands on
the map and has a way back; every person, chest and patrol on the map; every scene's place, person, set piece, chest and line
found; the goals met. `node tools/gen-data.js` runs the checks and writes `src/data/v6/maps.js` and `story.js` (never edit those).
