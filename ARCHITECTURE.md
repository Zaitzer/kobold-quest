# Kobold Quest: how the code is put together

One HTML page is still what ships (`dist/kobold-quest.html`). It is built from small ES modules in `src/`,
seven stylesheets in `styles/` and `index.html`.

```
npm i                      # esbuild, acorn, eslint-scope, postcss (dev only)
node tools/build.js        # → dist/kobold-quest.html (publish this) and dist/kq_test.html (test hooks)
node tools/imports.js      # rewrites every module's import/export lines from what it uses
node test/run.js           # everything; `node test/run.js quick` skips the browser scenarios
```

## Folders

| folder | what lives there | depends on |
|---|---|---|
| `engine/` | kobold art, weapons drawing, sound, music, particles, small helpers | nothing |
| `data/` | the generated content (`data/v6/`: classes, skills, foes, items, maps, story, made from the design by `tools/gen-data.js`), the registries the battle code reads, consumables | engine |
| `core/` | game state, the save format (`save6.js`), event bus, feature registry, story conditions, layout, input, boot | data, engine |
| `adapters/` | browser storage and the page's online services (room, user, db) | nothing |
| `game/` | the world (`world6.js`), the story (`story6.js`), the character sheet, talents, items, music choice, movement | core, data |
| `battle/` | tactical battles: rules, flow, enemy AI, drawing, touch input | core, data |
| `render/` | map drawing | engine, data |
| `ui/` | the heroes screen, the HUD, the ☰ menu, the pack's sheets, the Book, settings | everything above |
| `net/` | friends online: presence, lobby, co-op and duel battles, gifts, chat, market, letters, admin tools | everything above |
| `dev/` | test hooks, only in the test build | |

`src/systems.js` lists every module in load order. `src/main.js` imports it, then `core/boot.js` runs
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

Put it in a new module, add one line to `src/systems.js`, run `node tools/imports.js`. Adding `fishing:false` to `FLAGS` in `core/registry.js`
switches the whole feature off. `test/logic/wiring.test.js` fails if a button or mode has no handler.

Events on the bus (`core/bus.js`): `game:start`, `tile:enter`, `talk`, `battle:won`, `battle:lost`, `battle:end`, `save`.

## Content is data

* **Everything is made from the design.** `tools/gen-data.js` reads the design's tools and documents and writes `src/data/v6/`
  (classes, skills, foes, items, the slice's maps and rooms, the script and its scenes). Don't edit those files; change the design and
  run it again. `test/logic/v6data.test.js` fails if they are out of date.
* **The story** (`docs/story-hatching.md`, `docs/slice-dialogue.md`) is played by `game/story6.js`: scenes from `tools/v6/scenes.js`
  with their places, conditions (`core/rules.js`) and steps (say, fight, choice, join, give, deed…). `test/logic/story6.test.js`
  plays it from the bakery to the tube, once per class.
* **The world** is `game/world6.js` on the maps in `data/v6/maps.js`: links, fountains, stables, patrols, encounters, chests, the
  dark floor, the flood, the rail puzzle.
* **Sprite sheets** (`art/v6`, listed in `art/v6/ASSETS.md`) replace the look drawn in code wherever one is drawn
  (`engine/sheets6.js`). The Claude page has them built in (`KQ_ART`); the website fetches `art/manifest.json`, which
  `deploy/install.sh` makes on every update with `server/art.js`.

## Saves

`core/save6.js` owns the format (one document per hero, six slots: `ui/chars6.js`). Missing fields take their defaults as a save
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
