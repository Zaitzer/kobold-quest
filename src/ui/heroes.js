/* ---------- Kobold Quest v6: accounts and characters (build step 14; systems.md §16) ----------
   Six character slots per account (the website login). Each slot is
   one hero and one save: cached in the browser and kept on the server at data/users/<id>/char<n> (the database's documents have an
   even number of path parts, so "chars/<n>" became "char<n>"). Deleting keeps a hero for 7 days. One device at a time per hero:
   a lock document renewed every 30 seconds. Old saves are not carried over (progress was reset for v6). */
import {store} from '../adapters/storage.js';
import {show} from '../core/app.js';
import {rpUI} from '../core/hooks.js';
import {rpLayout, rpResize} from '../core/layout.js';
import {feature, frames} from '../core/registry.js';
import {SLOTS6, key6, rpSave, v6HeroName, v6Load, v6SaveOf} from '../core/save.js';
import {rp, rpNewState, walker} from '../core/state.js';
import {CLASSES6} from '../data/v6/classes.js';
import {button} from '../engine/html.js';
import {SHEET6, byBase, recolour} from '../engine/sheets.js';
import {esc2} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {packHero} from '../game/sheet.js';
import {s6NewGame, s6TestFight, story} from '../game/story.js';
import {rpApplyWorld, w6Title} from '../game/world.js';
import {adminApplyFixes, adminLetter, adminSetHooks, adminSetTestFight} from '../net/admin.js';
import {net} from '../net/core.js';

const DAY = 864e5,
  KEEP = 7 * DAY,
  LOCK_MS = 60000,
  RENEW_MS = 30000,
  C6_COLOURS = ['orange', 'green', 'blue', 'pink', 'gold', 'purple'];
const C6 = {slot: null, cloud: {}, form: {name: 'Pip', colour: 'orange', slot: 0}, del: null, lockT: 0, dev: null, ask: null};
const acct = () => net.me || 'guest';
const key = key6;
const devId = () =>
  C6.dev ||
  (C6.dev =
    store.get('kq6:dev', null) ||
    (() => {
      const d = 'd' + Math.random().toString(36).slice(2, 10);
      store.set('kq6:dev', d);
      return d;
    })());
/* ------------------------------------------------------------------ reading and writing slots (newest copy wins, as before) */
function raw(i) {
  const a = acct(),
    L = store.get(key(a, i), null),
    R = C6.cloud[i] || null;
  return L && R ? ((R.savedAt || 0) > (L.savedAt || 0) ? R : L) : L || R;
}
function slotInfo(i) {
  const s = raw(i);
  if (!s) return null;
  const h = packHero(s) || {};
  return {
    slot: i,
    name: (s.hero && s.hero.name) || h.name || 'Pip',
    colour: s.hero && s.hero.colour,
    cls: h.noclass ? null : h.cls,
    lvl: h.lvl || 1,
    where: (s.w6st && s.w6st.respawn) || s.w6,
    pieces: ((s.w6st && s.w6st.pieces) || []).length,
    played: s.played || 0,
    savedAt: s.savedAt || 0,
    deleted: s.deletedAt || null
  };
}
function cloudRef(i) {
  return net.db && net.me ? net.db.doc('data/users/' + net.me + '/char' + i) : null;
}
async function cloudLoad() {
  if (!net.db || !net.me) return;
  for (let i = 0; i < SLOTS6; i++) {
    try {
      const sn = await cloudRef(i).get();
      C6.cloud[i] = sn.exists ? sn.data() : null;
    } catch (e) {}
  }
  rp.sig = '';
}
/* saving: this device's copy at once, the server's a moment later (one write for a burst of saves). Every save is stamped, so the newest
   copy wins wherever the hero is opened next; the waiting write belongs to its own slot and goes out at once when the hero changes or the
   page is left. */
let saveT = 0,
  cloudPending = null;
function chars6Save(s) {
  if (C6.slot == null) return;
  const a = acct(),
    slot = C6.slot;
  s.savedAt = Date.now();
  const d = v6SaveOf(s);
  store.set(key(a, slot), d);
  const ref = cloudRef(slot);
  if (!ref) return;
  clearTimeout(saveT);
  cloudPending = {ref, d, slot};
  saveT = setTimeout(cloudFlush, 2500);
}
function cloudFlush() {
  clearTimeout(saveT);
  const P = cloudPending;
  cloudPending = null;
  if (!P) return;
  P.ref
    .set(JSON.parse(JSON.stringify(P.d)))
    .then(() => {
      C6.cloud[P.slot] = P.d;
    })
    .catch(() => {});
  C6.cloud[P.slot] = P.d;
}
function write(i, d) {
  d.savedAt = Date.now();
  store.set(key(acct(), i), d);
  const ref = cloudRef(i);
  if (ref) ref.set(JSON.parse(JSON.stringify(d))).catch(() => {});
  C6.cloud[i] = net.me ? d : C6.cloud[i];
}
/* ------------------------------------------------------------------ the lock: one device at a time (systems.md §16) */
function lockRef(i) {
  return net.db && net.me ? net.db.doc('data/users/' + net.me + '/lock' + i) : null;
}
async function lockFree(i) {
  const r = lockRef(i);
  if (!r) return true;
  try {
    const sn = await r.get();
    const L = sn.exists && sn.data();
    return !L || L.dev === devId() || L.until < Date.now();
  } catch (e) {
    return true;
  }
}
function lockTake(i) {
  const r = lockRef(i);
  if (r) r.set({dev: devId(), until: Date.now() + LOCK_MS}).catch(() => {});
}
async function lockCheck() {
  const i = C6.slot,
    r = lockRef(i);
  if (i == null || !r) return;
  try {
    const sn = await r.get();
    const L = sn.exists && sn.data();
    if (L && L.dev !== devId() && L.until > Date.now()) {
      chars6Save(rp.s);
      C6.slot = null;
      rpToast('This hero is being played on another device now.');
      openSelect();
      return;
    }
  } catch (e) {}
  lockTake(i);
}
/* ------------------------------------------------------------------ playing, making, deleting */
async function c6Play(i, force) {
  cloudFlush();
  const s = v6Load(raw(i));
  if (!s) {
    rpToast('That save could not be read.');
    return;
  }
  if (!force && !(await lockFree(i))) {
    C6.ask = i;
    rp.mode = 'c6busy';
    rpUI(true);
    return;
  }
  /* what an admin left in the server's copy (systems.md §17): fixes, and whether it is a test hero */
  const R = C6.cloud[i];
  const lines = R ? adminApplyFixes(s, R.fix) : [];
  if (R) s.test = R.test ? 1 : 0;
  C6.slot = i;
  lockTake(i);
  rp.s = s;
  rp.bt = null;
  walker.pk = null;
  walker.npcK = {};
  rpApplyWorld();
  rp.mode = 'map';
  story.busy = false;
  story.scene = null;
  rp.sig = '';
  rpUI(true);
  if (lines.length) {
    chars6Save(s);
    adminLetter(lines);
  }
}
/* a fix arrives while this hero is played: read the server's copy now, apply, save */
async function c6FixNow() {
  const i = C6.slot,
    ref = i != null && cloudRef(i);
  if (!ref || !rp.s) return;
  try {
    const sn = await ref.get();
    const d = sn.exists && sn.data();
    if (!d) return;
    const lines = adminApplyFixes(rp.s, d.fix);
    rp.s.test = d.test ? 1 : 0;
    if (lines.length && rp.s.w6) rpApplyWorld();
    chars6Save(rp.s);
    adminLetter(lines);
    rpUI(true);
  } catch (e) {}
}
function c6Create() {
  const n = v6HeroName(C6.form.name);
  if (!n) {
    rpToast('2 to 12 letters, please.');
    return;
  }
  const taken = [0, 1, 2, 3, 4, 5].some(i => {
    const x = slotInfo(i);
    return x && !x.deleted && x.name.toLowerCase() === n.toLowerCase();
  });
  if (taken) {
    rpToast('You already have a hero called ' + n + '.');
    return;
  }
  C6.slot = C6.form.slot;
  lockTake(C6.slot);
  rp.s = rpNewState();
  s6NewGame(n, C6.form.colour);
  rp.s.created = Date.now();
  chars6Save(rp.s);
}
function askDelete(i) {
  C6.del = {i, typed: ''};
  rp.mode = 'c6del';
}
function doDelete() {
  const i = C6.del && C6.del.i,
    info = slotInfo(i),
    e = typeof document !== 'undefined' && document.getElementById('c6-name');
  const typed = C6.del.typed || (e ? e.value : '');
  if (!info || String(typed).trim().toLowerCase() !== info.name.toLowerCase()) {
    rpToast('Type ' + (info ? info.name : 'the name') + ' to delete.');
    return;
  }
  const d = Object.assign({}, raw(i), {deletedAt: Date.now()});
  write(i, d);
  C6.del = null;
  rp.mode = 'c6';
  rpToast(info.name + ' is kept for 7 days, then gone.');
}
function restore(i) {
  const d = Object.assign({}, raw(i));
  delete d.deletedAt;
  write(i, d);
  rpToast('Welcome back, ' + d.hero.name + '!');
}
function purge(i) {
  const info = slotInfo(i);
  if (info && info.deleted && Date.now() - info.deleted > KEEP) {
    store.set(key(acct(), i), null);
    const r = cloudRef(i);
    if (r) r.delete().catch(() => {});
    C6.cloud[i] = null;
  }
}
/* a guest's hero kept on this device moves into a free slot when its player logs in (systems.md §16, "Keep this hero") */
function guestHeroes() {
  if (acct() === 'guest') return [];
  const out = [];
  for (let i = 0; i < SLOTS6; i++) {
    const d = store.get(key('guest', i), null);
    if (d && !d.deletedAt) out.push(i);
  }
  return out;
}
function keepGuest(gi) {
  const free = [0, 1, 2, 3, 4, 5].find(i => {
    const x = slotInfo(i);
    return !x;
  });
  if (free == null) {
    rpToast('All six slots are full.');
    return;
  }
  write(free, store.get(key('guest', gi), null));
  store.set(key('guest', gi), null);
  rpToast('Kept!');
}
/* ------------------------------------------------------------------ the screens */
const ago = t => {
  if (!t) return 'never';
  const d = (Date.now() - t) / DAY;
  return d < 1 / 24 ? 'just now' : d < 1 ? Math.round(d * 24) + ' h ago' : Math.round(d) + ' d ago';
};
const hm = s => {
  s = Math.floor((s || 0) / 60);
  return Math.floor(s / 60) + ' h ' + (s % 60) + ' min';
};
/* the heroes and the new-hero screens fill the screen (the world waits behind them): each hero stands on its card in its colour and
   class outfit (art/characters/heroes), painted into the card's canvas every frame (paintHeroes) */
const C6_SWATCH = {orange: '#f08a2a', green: '#5fb04a', blue: '#3f8fe0', pink: '#e05aa8', gold: '#e8c13a', purple: '#8a5ae0'};
const C6_NAMES = [
  'Pip',
  'Wick',
  'Nib',
  'Fizz',
  'Scrap',
  'Cobble',
  'Tinder',
  'Spark',
  'Kip',
  'Twig',
  'Rook',
  'Sooty',
  'Pebble',
  'Dot',
  'Ash',
  'Moss',
  'Clink',
  'Puff'
];
const heroCv = (cls, colour, big) =>
  '<canvas class="c6hero' +
  (big ? ' big' : '') +
  '" width="' +
  (big ? 96 : 48) +
  '" height="' +
  (big ? 192 : 96) +
  '" data-hero="' +
  (cls || '') +
  '" data-colour="' +
  (colour || 'orange') +
  '"></canvas>';
function selectHtml() {
  for (let i = 0; i < SLOTS6; i++) purge(i);
  let h =
    '<div class="c6screen"><div class="c6head"><h2>Your heroes</h2><p>' +
    (net.me
      ? 'Six heroes on your account. Pick one to play, or make a new one.'
      : 'Playing on this device as a guest. Log in to keep your heroes everywhere.') +
    '</p></div><div class="c6grid">';
  for (let i = 0; i < SLOTS6; i++) {
    const x = slotInfo(i);
    if (!x) {
      h +=
        '<button class="c6card new" type="button" data-rp="c6new" data-v="' +
        i +
        '"><span class="plus">+</span><b>New hero</b><small>slot ' +
        (i + 1) +
        '</small></button>';
      continue;
    }
    if (x.deleted) {
      h +=
        '<button class="c6card gone" type="button" data-rp="c6restore" data-v="' +
        i +
        '">' +
        heroCv(x.cls, x.colour) +
        '<b>' +
        esc2(x.name) +
        '</b><small>deleted · tap to restore · ' +
        Math.max(0, Math.ceil((KEEP - (Date.now() - x.deleted)) / DAY)) +
        ' days left</small></button>';
      continue;
    }
    h +=
      '<div class="c6slot"><button class="c6card" type="button" data-rp="c6play" data-v="' +
      i +
      '">' +
      heroCv(x.cls, x.colour) +
      '<b>' +
      esc2(x.name) +
      '</b><small>' +
      (x.cls ? esc2(CLASSES6[x.cls].n) + ', ' : '') +
      'level ' +
      x.lvl +
      '<br>' +
      esc2(x.where ? w6Title(x.where).replace(/ \(.*\)$/, '') : 'Hearthspire') +
      ' · ' +
      x.pieces +
      ' pieces<br>' +
      hm(x.played) +
      ' · ' +
      ago(x.savedAt) +
      '</small></button>' +
      '<button class="c6del" type="button" data-rp="c6delask" data-v="' +
      i +
      '" aria-label="Delete ' +
      esc2(x.name) +
      '">✕</button></div>';
  }
  h += '</div>';
  for (const gi of guestHeroes()) {
    const d = store.get(key('guest', gi), null);
    h += button('c6keep', 'Keep this hero: ' + esc2(d.hero.name), {
      cls: 'go',
      v: gi,
      sub: 'played here as a guest; moves into a free slot',
      raw: 1
    });
  }
  return h + '</div>';
}
function c6NewHtml() {
  const F = C6.form;
  return (
    '<div class="c6screen c6make"><div class="c6stage">' +
    heroCv(null, F.colour, true) +
    '<div class="c6name">' +
    esc2(F.name || '…') +
    '</div></div><div class="c6form"><h2>A new hero</h2>' +
    '<label class="c6lbl" for="c6-new">Name</label><div class="c6row"><input id="c6-new" maxlength="12" value="' +
    esc2(F.name) +
    '" aria-label="Hero name" autocomplete="off"><button class="rpb" type="button" data-rp="c6dice" aria-label="Another name">🎲</button></div>' +
    '<label class="c6lbl">Scales</label><div class="c6sw">' +
    C6_COLOURS.map(
      c =>
        '<button class="sw' +
        (c === F.colour ? ' on' : '') +
        '" type="button" data-rp="c6col" data-v="' +
        c +
        '" style="--c:' +
        C6_SWATCH[c] +
        '" aria-label="' +
        c +
        '"></button>'
    ).join('') +
    '</div>' +
    '<p class="c6note">2 to 12 letters; everyone in the story calls your hero by it. Your class is chosen in the story, at the castle\'s yard drill.</p>' +
    '<div class="c6btns">' +
    button('c6make', 'Begin', {cls: 'go big'}) +
    button('c6back', 'Back', {cls: 'x'}) +
    '</div></div></div>'
  );
}
/* paint every hero canvas on the screen: the battle idle row of the hero's sheet (its class outfit once it has one), in its colour */
let paintT = 0;
function paintHeroes() {
  if (typeof document === 'undefined' || !/^c6/.test(rp.mode)) return;
  const now = performance.now();
  if (now - paintT < 120) return;
  paintT = now; // the idle animation has 2 frames a second: 8 paints a second is plenty
  const ni = document.getElementById('c6-new'),
    nm = document.querySelector('#rp-panel .c6name');
  if (ni && nm && nm.textContent !== (ni.value || '…')) nm.textContent = ni.value || '…';
  const cvs = document.querySelectorAll('#rp-panel canvas[data-hero]');
  if (!cvs.length) return;
  const t = performance.now() / 1000;
  cvs.forEach((c, i) => {
    const cls = c.dataset.hero,
      key = (cls && byBase('pip-' + cls)) || byBase('pip'),
      g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    if (!key) {
      g.fillStyle = C6_SWATCH[c.dataset.colour] || '#f08a2a';
      g.beginPath();
      g.ellipse(c.width / 2, c.height * 0.62, c.width * 0.32, c.height * 0.3, 0, 0, 7);
      g.fill();
      return;
    }
    const s = recolour(key, c.dataset.colour);
    if (!s || !s.img) return;
    const T = SHEET6.hero,
      row = T.rows.idle,
      f = ((t * 2 + i * 0.37) | 0) % T.n[row];
    g.imageSmoothingEnabled = false;
    g.drawImage(s.img, f * T.fw, row * T.fh, T.fw, T.fh, 0, 0, c.width, c.height);
  });
}
function delHtml() {
  const x = slotInfo(C6.del.i);
  return (
    '<div class="c6screen c6ask">' +
    heroCv(x.cls, x.colour, true) +
    '<div class="rpdlg"><div class="who">Delete ' +
    esc2(x.name) +
    '?</div><p>Type the hero\'s name to confirm. You can restore them from this screen for 7 days.</p><div class="chatin"><input id="c6-name" maxlength="12" aria-label="Type the name"></div></div>' +
    '<div class="tbar">' +
    button('c6del', 'Delete', {cls: 'x'}) +
    button('c6back', 'Keep them', {cls: 'go'}) +
    '</div></div>'
  );
}
function busyHtml() {
  const x = slotInfo(C6.ask);
  return (
    '<div class="c6screen c6ask">' +
    (x ? heroCv(x.cls, x.colour, true) : '') +
    '<div class="rpdlg"><div class="who">' +
    esc2(x ? x.name : 'This hero') +
    ' is being played on another device.</div><p>Play here instead? The other device will save and go back to its heroes.</p></div><div class="tbar">' +
    button('c6force', 'Play here', {cls: 'go'}) +
    button('c6back', 'Not now', {cls: 'x'}) +
    '</div></div>'
  );
}
/* the select screen sits over Hearthspire, with nobody in it */
function openSelect() {
  cloudFlush();
  rp.s = rpNewState();
  rp.s.w6 = 'hearthspire';
  rp.s.w6st = {fountains: [], stables: [], chests: [], patrols: {}, enc: {}, switches: {}, campfire: {}, seen: {}};
  rp.s.party = [];
  rp.s.x = 19;
  rp.s.y = 17;
  rpApplyWorld();
  rp.bt = null;
  rp.dlg = null;
  walker.pk = null;
  walker.npcK = {};
  C6.slot = null;
  rp.mode = 'c6';
  show('rpg');
  rpLayout();
  requestAnimationFrame(() => {
    rpResize();
    rpUI(true);
  });
  cloudLoad().then(() => rpUI(true));
}
function readName() {
  const e = typeof document !== 'undefined' && document.getElementById('c6-new');
  if (e) C6.form.name = e.value;
}
/* the moments worth saving at once: a scene played out, a chest, a new place, a Smiler piece */
const saveNow = () => {
  if (rp.s && rp.s.w6 && C6.slot != null) rpSave();
};
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      saveNow();
      cloudFlush();
    }
  });
  window.addEventListener('pagehide', () => {
    saveNow();
    cloudFlush();
  });
}
feature({
  id: 'chars6',
  on: {save6: s => chars6Save(s), 'w6:scene': saveNow, 'w6:chest': saveNow, 'w6:enter': saveNow, 'w6:piece': saveNow},
  frame: () => paintHeroes(),
  init() {
    adminSetHooks(() => chars6Save(rp.s), c6FixNow);
    adminSetTestFight(id => s6TestFight(id));
  },
  panels: {
    c6: {sig: () => JSON.stringify([C6.cloud, store.get('kq6:' + acct() + ':0', null) && 1]), html: selectHtml},
    c6new: {sig: () => JSON.stringify(C6.form), html: c6NewHtml},
    c6del: {sig: () => 'd' + (C6.del && C6.del.i), html: delHtml},
    c6busy: {sig: () => 'b' + C6.ask, html: busyHtml}
  },
  menu: [{order: 3, html: () => (rp.s && rp.s.w6 && C6.slot != null ? button('c6menu', 'Heroes', {sub: 'save and change hero'}) : '')}],
  actions: {
    c6play: d => {
      c6Play(+d.v);
    },
    c6force: () => {
      c6Play(C6.ask, true);
    },
    c6new: d => {
      C6.form = {name: 'Pip', colour: 'orange', slot: +d.v};
      rp.mode = 'c6new';
    },
    c6col: d => {
      readName();
      C6.form.colour = d.v;
    },
    c6dice: () => {
      readName();
      const L = C6_NAMES.filter(n => n !== C6.form.name);
      C6.form.name = L[Math.floor(Math.random() * L.length)];
    },
    c6make: () => {
      readName();
      c6Create();
    },
    c6back: () => {
      rp.mode = 'c6';
    },
    c6delask: d => askDelete(+d.v),
    c6del: () => doDelete(),
    c6restore: d => restore(+d.v),
    c6keep: d => keepGuest(+d.v),
    c6menu: () => {
      chars6Save(rp.s);
      openSelect();
    }
  }
});
/* the lock is renewed while a hero is played, and played time is counted */
let c6tick = 0;
frames.push(dt => {
  if (C6.slot == null || !rp.s || !rp.s.w6) return;
  rp.s.played = (rp.s.played || 0) + dt;
  c6tick += dt;
  if (c6tick * 1000 >= RENEW_MS) {
    c6tick = 0;
    lockCheck();
  }
});
export {
  C6,
  C6_COLOURS,
  C6_NAMES,
  C6_SWATCH,
  DAY,
  KEEP,
  LOCK_MS,
  RENEW_MS,
  acct,
  ago,
  askDelete,
  busyHtml,
  c6Create,
  c6FixNow,
  c6NewHtml,
  c6Play,
  c6tick,
  chars6Save,
  cloudFlush,
  cloudLoad,
  cloudPending,
  cloudRef,
  delHtml,
  devId,
  doDelete,
  guestHeroes,
  heroCv,
  hm,
  keepGuest,
  key,
  lockCheck,
  lockFree,
  lockRef,
  lockTake,
  openSelect,
  paintHeroes,
  paintT,
  purge,
  raw,
  readName,
  restore,
  saveNow,
  saveT,
  selectHtml,
  slotInfo,
  write
};
