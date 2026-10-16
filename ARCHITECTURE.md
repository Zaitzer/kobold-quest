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
| `data/` | content tables: items, classes, skills, monsters, zones, world map, NPC dialogue and quests | engine |
| `core/` | game state, saves and migrations, event bus, feature registry, quest rules, layout, input, boot | data, engine |
| `adapters/` | browser storage and the page's online services (room, user, db) | nothing |
| `game/` | map play: movement, NPCs, stats, items, gear crafting, promotions | core, data |
| `battle/` | tactical battles: rules, flow, enemy AI, drawing, touch input | core, data |
| `render/` | map and item icon drawing | engine, data |
| `ui/` | the HUD, the ☰ menu, side sheets, the heroes and gear screen | everything above |
| `net/` | friends online: presence, lobby, co-op and duel battles, gifts, chat, market, cloud saves | everything above |
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
  tiles:{F:{use:(x,y)=>{rp.mode='fishing'}}},                               // bump into a map tile letter F
  menu:[{order:20,html:()=>'<button class="rpb" data-rp="cast">Fish</button>'}],
  options:[{id:'bobber',label:()=>'Bobber '+…,hint:'…',toggle(){…}}],      // a settings row
  net:{fishgift(d,msg){…}},                                                 // an online message type
  on:{'battle:won':b=>…,'tile:enter':(x,y,c)=>…},                           // react to game events
  frame:dt=>…, init(){…}
})
```

Put it in a new module, add one line to `src/systems.js`, run `node tools/imports.js`. Adding `fishing:false` to `FLAGS` in `core/registry.js`
switches the whole feature off. `test/logic/wiring.test.js` fails if a button, mode or tile has no handler.

Events on the bus (`core/bus.js`): `game:start`, `tile:enter`, `talk`, `battle:won`, `battle:lost`, `battle:end`, `save`.

## Content is data

* **Dialogue and quests** are rules in `data/dialogue.js`, read by `core/rules.js`. Each villager has a list of
  rules; the first whose `if` holds speaks. Effects (`set`, `add`, `gold`, `xp`, `item`, `join`, `fight`, `toast`…)
  run `now`, `then`, or on a choice. The quest log and the top-bar quest line are rule lists too.
* **Bosses** (what beating them does and drops), **kill tallies** and **bounties** are in `data/quests.js`.
* **The world** (`data/overworld.js`) is 1280 × 960 tiles, grown from a seed: terrain from noise, 16 empty town sites joined by
  roads, and the hand-made Burrowhome valley in the north-west corner. Rows are worked out when first looked at and the map is
  drawn in 16 × 16 chunks, so size costs little. Towns are clearings waiting for content; `test/logic/overworld.test.js` checks
  every town can be walked to.
* **Rooms** are drawn as rows of letters in `data/places.js`; `RP_DOORS` says which world door leads where. NPCs, chests and
  quest spots take `place:'inn'` to live inside. `test/logic/places.test.js` checks every room is closed in and reachable.
* **Pickups and quest spots** on the map are in `data/world.js` (`RP_PICKUPS`, `RP_SPOTS`).
* Balance knobs are `BAL` in `data/battle.js`; `test/sim/battle.js` and `test/sim/quest.js` measure them.

## Saves

`core/save.js` owns the format. To change it: bump `SAVE_VERSION`, add `MIGRATIONS[oldVersion](save)`.
Every save copy (this browser, the cloud) goes through the migrations as it loads, and the newest copy wins.
A save from a newer version is left alone rather than overwritten. Local key `kobold-pit-rpg`,
cloud doc `data/users/<id>/save`, market collection `market`, room topic `kq`: all unchanged.

## Layout and styles

Sideways only: an upright phone gets the whole view turned a quarter turn (`core/layout.js`, `rpLoc`/`rpVec`
turn touches back). Styles are split by screen: `base`, `title`, `hud`, `sheets`, `battle`, `hero`, `online`
(order in `styles/order.json`). `node test/browser/styles.js save|compare file.json` snapshots the computed style
of every element on 16 screens at 3 sizes, to restyle without surprises.

## Tests

* `test/logic/*` run the whole game in Node (`test/lib/game.js`). Parity tests replay the same dice through the
  last hand-written version (`test/fixtures/v37.html`): 48 full battles, 9,600 conversations, every content table, saves.
* `test/browser/*` drive the real page in Chromium at phone, upright phone and desktop sizes; `tnet` and `tmmo`
  play two and three players through a mocked room and database (`netmock.js`).
