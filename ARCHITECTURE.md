# Kobold Quest: how the code is put together

One HTML page is what ships: the website, `server/public/index.html`, served by the game server in `server/`. It is built from small ES modules in `src/`,
seven stylesheets in `styles/` and `index.html`.

```
npm i                      # esbuild, acorn, eslint-scope, postcss (dev only)
node tools/build.js        # → server/public/index.html (the website) and dist/kq_test.html, dist/kq_site_test.html (test hooks)
node tools/imports.js      # rewrites every module's import/export lines from what it uses, checks the layers, formats (prettier)
node test/run.js           # everything; `node test/run.js quick` skips the browser scenarios
```

## Layers and folders

The folders are layers. A module imports only from its own layer and the ones below; `node tools/imports.js` refuses to build
otherwise. When a lower layer must call up (the battle asks the network to share a fight, the story opens the letter desk, anything
redraws the panel), it calls a hook in `core/hooks.js`, which the higher module fills in when it loads.

```
 5  app/  dev/            the frame loop, boot, keyboard and touch input; test hooks
 4  ui/  render/          screens and panels (the HUD, menus, sheets, the battle's buttons); drawing the map and the battle
 3  net/                  friends online: presence, lobby, co-op and duels, gifts, chat, market, letters, admin
 2  game/  battle/        the rules: the world, the story, characters, items, music choice; battle rules, flow, AI
 1  core/                 state, hooks, event bus, feature registry, conditions, options, layout, the save format
 0  engine/  data/  adapters/   drawing kobolds, sound and synth, effects, helpers; generated content; storage and the server link
```

| folder | what lives there |
|---|---|
| `engine/` | the kobold drawn in code, sprite sheets, sound effects, the music synth (it plays what `game/music.js` asks for), particles, small helpers |
| `data/` | the generated content (`data/v6/`: classes, skills, foes, items, maps, story, made from the design and `world/` by `tools/gen-data.js`), the registries the battle code reads, consumables |
| `adapters/` | browser storage and the page's online services (room, user, db) |
| `core/` | game state (`state.js`), the hooks (`hooks.js`), event bus, feature registry, story conditions, options, layout and the battle view's size, the save format (`save.js`) |
| `game/` | the world (`world.js`), the story (`story.js`), the character sheet, talents, items, music choice, movement, dialogue |
| `battle/` | tactical battles: rules, flow (and its camera), boards, endings, enemy AI |
| `net/` | friends online (the server link is `net.online`, made by `ui/login.js`) |
| `render/` | drawing the map (`map.js`, `map.js`) and the battle (`battle.js`) |
| `ui/` | the heroes screen, the HUD, the ☰ menu, the pack's sheets, the Book, settings, the battle's buttons (`battle.js`), login |
| `app/` | boot, the frame (`play.js`), keyboard and touch input |
| `dev/` | test hooks, only in the test build |

**Names.** Every module-level name is unique across `src/` (`tools/imports.js` checks it), so a name says where it lives:
`tc…` the battle grid (`battle/grid.js`), `v6…` characters and battle rules (`game/sheet.js`, `battle/combat.js`, `battle/math.js`),
`w6…` the world (`game/world.js`), `s6…` the story, `c6…` the heroes screen, `net…` the network, `rp…` the engine and screens.
`node tools/rename.js old=new` renames a name everywhere it is used (by scope: a local that shares the name is left alone), tests included;
`--into` moves the callers of a pass-through function onto the function it called.

`src/systems.js` lists every module in load order. `src/main.js` imports it, then `app/boot.js` runs
each feature's `init()` and starts the frame loop.

## Adding something without touching the core

Everything that used to be a hard-coded `switch` is now a registry (`core/registry.js`). A feature describes itself:

```js
feature({
  id:'fishing',
  panels:{fishing:{sig:()=>rp.s.fish, html:()=>'<div class="rpdlg">…</div>'}}, // side sheet for rp.mode='fishing'
  actions:{cast:d=>castLine(), 'net:fishgift':d=>…},                       // data-rp="cast", data-net="fishgift"
  menu:[{order:20,html:()=>'<button class="rpb" data-rp="cast">Fish</button>'}],
  options:[{id:'bobber',label:()=>'Bobber '+…,hint:'…',toggle(){…}}],      // a settings row
  net:{fishgift(d,msg){…}},                                                 // an online message type
  on:{'battle:won':b=>…,'tile:enter':(x,y,c)=>…},                           // react to game events
  frame:dt=>…, init(){…}
})
```

Screens are built with `button(action,label,{sub,cls,v,disabled})`, `buttons([...])` and `panel(title,body)` from `engine/html.js`:
they escape the text, route the action (`'w6buy'` to a feature's action, `'net:give'`, `'tac:ok'` to theirs) and keep one look.
The pack's hero and its mean level are `packHero(save)` and `packMeanLevel(party)` (`game/sheet.js`).

Put it in a new module, add one line to `src/systems.js`, run `node tools/imports.js`. Adding `fishing:false` to `FLAGS` in `core/registry.js`
switches the whole feature off. `test/logic/wiring.test.js` fails if a button or mode has no handler.

Events on the bus (`core/bus.js`): `game:start`, `tile:enter`, `talk`, `battle:won`, `battle:lost`, `battle:end`, `save`.

## Content is data

* **Everything is made from the design.** `tools/gen-data.js` reads the design's tools and documents and writes `src/data/v6/`
  (classes, skills, foes, items, the slice's maps and rooms, the script and its scenes). Don't edit those files; change the design and
  run it again. `test/logic/v6data.test.js` fails if they are out of date.
* **The story** (`docs/story-hatching.md`, `docs/slice-dialogue.md`) is played by `game/story.js`: scenes from `world/scenes.json` (the map editor)
  with their places, conditions (`core/rules.js`) and steps (say, fight, choice, join, give, deed…). `test/logic/story6.test.js`
  plays it from the bakery to the tube, once per class.
* **The world** is `game/world.js` on the maps in `data/v6/maps.js` (generated from `world/`, made in the map editor `tools/editor`; the tile legend, encounters, music, dark floors are per map there): links, fountains, stables, patrols, encounters, chests, the
  dark floor, the flood, the rail puzzle.
* **Sprite sheets** (`art/`, listed in `art/ASSETS.md`; a stand-in in each until Joakim draws over it) replace the look drawn in code
  (`engine/sheets.js`). The website fetches `art/manifest.json` (the test build has test sheets built in as `KQ_ART`), which
  `deploy/install.sh` makes on every update with `server/art.js`.

## Saves

`core/save.js` owns the format (one document per hero, six slots: `ui/heroes.js`). Missing fields take their defaults as a save
loads; a change of shape gets a migration in `MIGRATIONS6`. `SAVE6_EPOCH` with `"epoch"` in `server/config.json` resets everyone's
progress once. Cloud docs `data/users/<id>/char<n>` and `lock<n>`, market collection `market`, room topic `kq`.

## Layout and styles

Sideways only: an upright phone gets the whole view turned a quarter turn (`core/layout.js`, `rpLoc`/`rpVec`
turn touches back). Styles are split by screen: `base`, `title`, `hud`, `sheets`, `battle`, `hero`, `online`
(order in `styles/order.json`).

## Tests

* `test/logic/*` run the whole game in Node (`test/lib/game.js`); `test/browser/*` drive the real page in Chromium, at four screen
  sizes, two players through a mocked room (`netmock.js`), and the website against a real local server (`tsite`).
* `node test/run.js` runs every test as its own job, side by side; `test/qa.js` maps every system in `systems.md` §0 to its tests.
