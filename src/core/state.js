/* a fresh game state: the v6 save (core/save.js) fills it; the story (game/story.js) starts it */

function rpNewState() {
  return {v: 6, x: 0, y: 0, face: 'down', gold: 30, party: [], bag: {potion: 3, ether: 1}, inv: [], chests: [], q: {}, steps: 0};
}
/* the game being played: the hero's save (s), the battle (bt), which screen (mode), the dialogue (dlg), the map's grid, the panel's
   signature (sig), the clock (t); headless in the logic tests */
const rp = {
  grid: null,
  s: null,
  mode: 'map',
  dlg: null,
  bt: null,
  t: 0,
  headless: false,
  sig: ''
};
/* the thumbs and the keys: the on-map thumbstick, the panel's joystick, held directions and keys, the last bump (app/input.js) */
const controls = {stick: null, held: null, joy: null, joyP: null, keys: new Set(), stickUsed: false, bumpT: 0, bumpLock: 0};
/* walking the map and looking at it: the path to a tapped tile, Pip's smooth position, the safe steps after a fight, Pip and the people
   as drawable kobolds, the drawn map, the camera (game/move.js, render/map.js) */
const walker = {
  path: null,
  pathEnd: null,
  pos: null,
  moving: false,
  dir8: null, // the way the hero looks on the map, 8 ways (the sheets' walking rows); s.face stays 4-way for the game's logic
  grace: 4,
  pk: null,
  npcK: {},
  mapImg: null,
  cam: {x: 0, y: 0},
  camOff: null
};
/* which place the hero is in, for meeting others online. v6 phasing (systems.md §12): Hearthspire's morning (act 1, up to the gate)
   is your own copy of the place */
const PHASE = Math.random().toString(36).slice(2, 8);
export {PHASE, controls, rp, rpNewState, walker};
