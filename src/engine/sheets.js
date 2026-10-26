/* ---------- Kobold Quest v6: sprite sheets (build step 19, art/ASSETS.md, style-guide.md) ----------
   Joakim's sheets from art/ (and the stand-ins until he draws over them): one PNG per character, animations in rows, frames left to right, 128 × 128 frames shown one tile big (bosses 256 × 256, 2 × 2 tiles; 26 Oct), every direction drawn (no mirroring, 25 Oct), crisp where a frame pixel is a screen pixel or bigger. A sheet is used only when it is drawn (the stand-ins are
   left out by the build and the server); anything without one keeps its look drawn in code. The hero's sheet is drawn orange and
   recoloured to the hero's colour (style-guide.md, "The hero's colour"). */
import {SPR, sprite} from './sprites.js';

/* the sheet types (ASSETS.md "Sheet types", tools/assets.js): frame size and the rows' names, 4 frames in every row. Characters walk in
   8 directions and have every battle pose facing right (R) and left (L): nothing is mirrored, so a drawing can be asymmetrical (25 Oct) */
const DIR8 = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
/* the 8-way direction of a vector (y down), as the sheets' walking rows name it */
const dirOf = (x, y) => DIR8[(Math.round(Math.atan2(x, y) / (Math.PI / 4)) + 8) % 8];
const rowsOf = names => Object.fromEntries(names.map((n, i) => [n, i]));
const sides = poses => ['R', 'L'].flatMap(s => poses.map(p => p + s));
const SHEET6 = {
  hero: {fw: 128, fh: 128, rows: rowsOf(DIR8.concat(sides(['idle', 'attack', 'cast', 'hurt'])))},
  villager: {fw: 128, fh: 128, rows: rowsOf(DIR8.concat(['talk']))},
  foe: {fw: 128, fh: 128, rows: rowsOf(sides(['idle', 'walk', 'attack', 'hurt']))},
  boss: {fw: 256, fh: 256, rows: rowsOf(sides(['idle', 'attack', 'tele', 'hurt']))}
};
const FEET = 124 / 128; // the feet line (row 124 of 128; a boss's row 248 of 256)
/* every loaded v6 sheet by its last name ("wizzle", "cellar-rat"), so a character finds its sheet without knowing the folder */
let index = null,
  indexN = 0;
function byBase(base) {
  const keys = Object.keys(SPR);
  if (!index || keys.length !== indexN) {
    index = {};
    indexN = keys.length;
    for (const k of keys) index[k.split('/').pop()] = k;
  }
  const k = index[base];
  return k && sprite(k) ? k : null;
}
const dash = s =>
  String(s || '')
    .toLowerCase()
    .replace(/^v6[eb]?:/, '')
    .replace(/:.*$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
/* the sheet for a v6 kobold: the hero's class outfit, else the plain hero; a companion's own sheet */
function sheetOfKobold(m) {
  if (!m || !m.v6) return null;
  if (m.hero) return (m.cls && byBase('pip-' + m.cls)) || byBase('pip');
  return m.cid ? byBase(dash(m.cid)) : byBase(dash(m.name));
}
/* a foe or a boss: its id in the bestiary */
function sheetOfFoe(E) {
  if (!E) return null;
  return byBase(dash(E.v6boss ? E.v6boss : E.id || E.n));
}
/* a person on the map: the first of the sheets they may look like (world/: looksOf in tools/world/world.js) that is drawn as a character
   or a boss (never a tile that shares a word, like the fountain) */
const personSheet = b => {
  const k = byBase(b);
  return k && /^(characters|bosses)\//.test(k) ? k : null;
};
function sheetOfPerson(looks) {
  return (looks || []).map(personSheet).find(Boolean) || null;
}
function typeOf(key) {
  if (/^bosses\//.test(key)) return 'boss';
  if (/^foes\//.test(key)) return 'foe';
  if (/^characters\/(heroes|companions)\//.test(key)) return 'hero';
  return 'villager';
}

/* the hero's colour (style-guide.md): pixels of Pip's orange (hue 10°–45°, not grey) take the colour's hue; light and shade stay */
const HUE = {orange: null, green: 110, blue: 210, pink: 330, gold: 50, purple: 272};
const recol = {};
function rgb2hsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const M = Math.max(r, g, b),
    m = Math.min(r, g, b),
    l = (M + m) / 2;
  let h = 0,
    s = 0;
  if (M !== m) {
    const d = M - m;
    s = l > 0.5 ? d / (2 - M - m) : d / (M + m);
    h = M === r ? (g - b) / d + (g < b ? 6 : 0) : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}
function hsl2rgb(h, s, l) {
  const k = n => (n + h / 30) % 12,
    a = s * Math.min(l, 1 - l),
    f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255].map(Math.round);
}
function recolour(key, colour) {
  const s = sprite(key),
    hue = HUE[colour];
  if (!s || hue == null) return s;
  const id = key + '|' + colour;
  if (recol[id]) return recol[id];
  try {
    const c = document.createElement('canvas');
    c.width = s.w;
    c.height = s.h;
    const g = c.getContext('2d');
    g.drawImage(s.img, 0, 0);
    const D = g.getImageData(0, 0, s.w, s.h),
      d = D.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 40) continue;
      const [h, sat, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]);
      if (h >= 10 && h <= 45 && sat > 0.35) {
        const [r, gg, b] = hsl2rgb(hue, sat, l);
        d[i] = r;
        d[i + 1] = gg;
        d[i + 2] = b;
      }
    }
    g.putImageData(D, 0, 0);
    recol[id] = {img: c, w: s.w, h: s.h, ready: true};
    return recol[id];
  } catch (e) {
    return s;
  }
}
/* which frame a character shows now: on the map a walk in its 8-way direction (frame 1 standing; stand, step, stand, other step),
   in a fight its idle, attack, cast, hurt, down or cheer, facing right or left (k.face) */
function frameOf(type, k, map) {
  const R = SHEET6[type].rows,
    t = k.t || 0,
    side = (k.face || 1) < 0 ? 'L' : 'R',
    pose = p => R[p + side];
  let row = null,
    f = 0;
  if (k.state === 'ko' && pose('hurt') != null) {
    row = pose('hurt');
    f = 1;
  } else if (k.hurt > 0 && pose('hurt') != null) row = pose('hurt');
  else if (k.state === 'cheer' && type === 'hero') {
    row = pose('hurt');
    f = 2 + (((t * 4) | 0) % 2);
  } else if ((k.state === 'windup' || k.state === 'strike') && pose('attack') != null) {
    row = pose('attack');
    f = k.state === 'windup' ? 0 : 1 + (((t * 8) | 0) % 3);
  } else if (k.state === 'cast' && pose('cast') != null) {
    row = pose('cast');
    f = ((t * 6) | 0) % 4;
  } else if ((map || pose('idle') == null) && R.down != null) {
    row = R[k.dir8 && R[k.dir8] != null ? k.dir8 : 'down'];
    f = k.moving ? ((t * 8) | 0) % 4 : 0;
  } else if (map && pose('walk') != null) {
    row = pose('walk');
    f = k.moving ? ((t * 8) | 0) % 4 : 0;
  } else {
    row = pose('idle') != null ? pose('idle') : R.down;
    f = ((t * 3) | 0) % 4;
  }
  return [row, f];
}
/* draw one frame with its feet at (0,0), crisp, at the tiles' pixel size: a 32-pixel frame is one tile (40 units), a boss's 64 two */
const UNIT = 40 / 128; // a 128-pixel frame is one tile (40 units), a boss's 256 two (26 Oct)
function drawSheet(g, key, k, opt) {
  opt = opt || {};
  const type = typeOf(key),
    T = SHEET6[type],
    s = opt.colour ? recolour(key, opt.colour) : sprite(key);
  if (!s) return false;
  const [row, f] = frameOf(type, k, opt.map),
    u = UNIT,
    fw = T.fw,
    fh = T.fh;
  const sm = g.imageSmoothingEnabled;
  g.save();
  if ((k.face || 1) < 0) g.scale(-1, 1); // the caller draws in the kobold's facing (flipped for left); a sheet is never mirrored: undo it
  /* crisp when a frame pixel is a screen pixel or bigger; smoothed when it is drawn smaller (a phone shows 128 pixels about 1:1, a
     desktop window fewer), so a big drawing shrinks without flicker */
  const m = g.getTransform ? g.getTransform() : null;
  g.imageSmoothingEnabled = !!m && Math.hypot(m.a, m.b) * u < 0.99;
  g.imageSmoothingQuality = 'high';
  g.drawImage(s.img, f * fw, row * fh, fw, fh, (-fw / 2) * u, -fh * FEET * u, fw * u, fh * u);
  g.restore();
  g.imageSmoothingEnabled = sm;
  sheetDraws.n++;
  return true;
}
const sheetDraws = {n: 0}; // counted for the test: a drawn sheet really shows
export {
  DIR8,
  FEET,
  HUE,
  SHEET6,
  UNIT,
  byBase,
  dash,
  dirOf,
  drawSheet,
  frameOf,
  hsl2rgb,
  index,
  indexN,
  personSheet,
  recol,
  recolour,
  rgb2hsl,
  rowsOf,
  sheetDraws,
  sheetOfFoe,
  sheetOfKobold,
  sheetOfPerson,
  sides,
  typeOf
};
