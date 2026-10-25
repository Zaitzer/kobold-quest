/* ---------- Kobold Quest v6: the slice's world (build step 11; systems.md §6, §9; world/) ----------
   The maps and rooms of world/ (made in the map editor; MAPS6, ROOMS6, LINKS6, TILES6) walked with the engine's movement. A v6 game has rp.s.w6 set to
   the place it stands in ('hearthspire', 'r1', ..., or 'room:bakery'); the engine's grid, solids, tiles, encounters and drawing ask
   this module. */
import {v6EliteKey, v6Mix} from '../battle/combat.js';
import {emit} from '../core/bus.js';
import {startFight} from '../core/hooks.js';
import {feature} from '../core/registry.js';
import {test} from '../core/rules.js';
import {PHASE, controls, rp, walker} from '../core/state.js';
import {PLACES6} from '../data/v6/foes.js';
import {LINKS6, MAPS6, ROOMS6, TILES6} from '../data/v6/maps.js';
import {CHESTS6} from '../data/v6/story.js';
import {sfx} from '../engine/audio.js';
import {button} from '../engine/html.js';
import {rpSay, rpToast} from './dialogue.js';
import {v6OpenChest} from './items.js';
import {packMeanLevel, v6Stats} from './sheet.js';
import {s6Npcs, s6Step} from './story.js';

/* ------------------------------------------------------------------ places and tiles */
/* the tile letters (world/tiles.json): one legend for maps and one for rooms */
const w6SolidIn = (p, c) => {
  const t = TILES6[isRoom(p) ? 'room' : 'map'][c];
  return !!(t && t.solid);
};
const isRoom = p => String(p).startsWith('room:');
function w6Place(p) {
  return isRoom(p) ? ROOMS6[p.slice(5)] : MAPS6[p];
}
function w6Rows(p) {
  const P = w6Place(p);
  return P ? P.rows : null;
}
function w6Title(p) {
  const P = w6Place(p);
  return P ? P.title : '';
}
function w6Solid(c, x, y) {
  const p = rp.s && rp.s.w6;
  if (x != null && w6Flooded(p, x, y)) return true;
  return w6SolidIn(p, c);
}
/* the encounter table for a place (systems.md §6, balance.md §5): R1's grass and the mine's floors; towns and rooms never */
/* each map's encounters ({place: the bestiary's place, grass/floor: the chance a step, theme}) and fight board theme, set in the map editor */
const w6Enc = p => (MAPS6[p] && MAPS6[p].enc) || null;
const w6Theme = p => (MAPS6[p] && MAPS6[p].theme) || 'meadow';
const W6_GAP = 12; // at least 12 steps between two fights (balance.md §5)
function w6LinkAt(p, x, y, how) {
  return LINKS6.find(l => l[0] === p && l[1] === x && l[2] === y && (!how || l[6] === how));
}
function w6MarkNear(p, x, y) {
  const P = w6Place(p);
  if (!P || !P.marks) return null;
  if (isRoom(p)) {
    const c = P.rows[y] && P.rows[y][x];
    const m = P.marks.find(m => m[0] === c);
    return m ? m[1] : null;
  }
  let best = null,
    bd = 2.01;
  P.marks.forEach(([mx, my, l]) => {
    const d = Math.hypot(mx - x, my - y);
    if (d < bd) {
      bd = d;
      best = l;
    }
  });
  return best;
}

/* the place as the network sees it (net/core.js: who is where) and the grid the engine walks on */
function rpPlace() {
  if (!rp.s || !rp.s.w6) return 'none';
  return 'w6:' + rp.s.w6 + ((rp.s.q.act || 0) < 7 ? ':own:' + PHASE : '');
}
function rpApplyWorld() {
  const R = rp.s && rp.s.w6 && w6Rows(rp.s.w6);
  if (R) rp.grid = R.map(r => r.split(''));
  walker.mapImg = null;
  emit('world:apply');
}
/* ------------------------------------------------------------------ entering a place */
/* the free tile nearest (x, y) that is not a link, so arriving never sends you straight back */
function w6Arrive(p, x, y) {
  const R = w6Rows(p),
    solid = c => w6SolidIn(p, c);
  let best = [x, y],
    bd = 1e9;
  for (let j = 0; j < R.length; j++)
    for (let i = 0; i < R[0].length; i++) {
      if (solid(R[j][i]) || w6LinkAt(p, i, j)) continue;
      const d = Math.abs(i - x) + Math.abs(j - y) + (j < y && !isRoom(p) ? 0.1 : 0);
      if (d < bd) {
        bd = d;
        best = [i, j];
      }
    }
  return best;
}
function w6Go(p, x, y) {
  const s = rp.s,
    from = s.w6;
  if (!w6Place(p)) return false;
  if (from && (isRoom(p) || isRoom(from))) emit('w6:door');
  const [ax, ay] = w6Arrive(p, x, y);
  s.w6 = p;
  s.x = ax;
  s.y = ay;
  s.face = isRoom(p) ? 'up' : 'down';
  walker.dir8 = s.face;
  rpApplyWorld();
  walker.pos = null;
  walker.path = null;
  controls.held = null;
  walker.grace = 4;
  if (from && !isRoom(from) && from !== p && !isRoom(p)) s.w6visit = (s.w6visit || 0) + 1; // a new visit: campfires heal again (systems.md §5)
  if (!rp.headless) sfx('door');
  emit('w6:enter', p, from);
  return true;
}
/* a fresh v6 game in the slice's world: Hearthspire's entry, with a pack of v6 kobolds */
function w6Start(pack, opt) {
  opt = opt || {};
  const s = rp.s;
  s.party = pack;
  s.w6 = null;
  s.w6st = Object.assign(
    {
      fountains: [],
      stables: [],
      respawn: 'hearthspire',
      chests: [],
      since: 99,
      switches: {},
      cart: 'home',
      campfire: {},
      patrols: {},
      enc: {}
    },
    opt.st || {}
  );
  s.gold = opt.gold == null ? 30 : opt.gold;
  s.bag = opt.bag || {potion: 3, ether: 1};
  const M = MAPS6[opt.map || 'hearthspire'];
  w6Go(opt.map || 'hearthspire', ...(opt.at || M.entry));
  rp.mode = 'map';
  walker.pk = null;
  rp.bt = null;
  return s;
}

/* ------------------------------------------------------------------ patrols (systems.md §6): visible groups on the road */
const W6_DIR = {east: [1, 0], west: [-1, 0], north: [0, -1], south: [0, 1]};
function w6Patrols(p) {
  const P = MAPS6[p];
  if (!P || !P.patrols || !P.enc) return []; // a patrol is drawn from the map's encounters: none without them
  const st = rp.s.w6st;
  return P.patrols.map((t, i) => Object.assign({id: p + ':' + i}, t)).filter(t => !st.patrols[t.id]);
}
/* the patrol's sight: the 3 tiles straight ahead and the ones beside them (a 3 × 3 box in front) */
function w6InSight(t, x, y) {
  const [dx, dy] = W6_DIR[t.face] || [1, 0];
  for (let k = 1; k <= 3; k++)
    for (let s = -1; s <= 1; s++) {
      const px = t.x + dx * k + (dy ? s : 0),
        py = t.y + dy * k + (dx ? s : 0);
      if (px === x && py === y) return true;
    }
  return false;
}
/* the patrol's strength word, by its level against the pack's (balance.md §9: Few, Several, Pack, Lots, Overwhelming) */
function w6PatrolLevel(p) {
  const P = PLACES6[w6Enc(p).place];
  return P.L + 1;
}
function w6Strength(p) {
  const d = w6PatrolLevel(p) - w6PackLevel();
  return d <= -3 ? 'Few' : d <= -1 ? 'Several' : d === 0 ? 'Pack' : d <= 2 ? 'Lots' : 'Overwhelming';
}
function w6PackLevel() {
  return Math.max(1, Math.round(packMeanLevel(rp.s.party)));
}
function w6PatrolCheck(x, y, c) {
  const p = rp.s.w6;
  for (const t of w6Patrols(p)) {
    const near = Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1;
    const seen = w6InSight(t, x, y) && c !== '"';
    if (seen || near) {
      w6PatrolFight(p, t, seen);
      return true;
    }
  }
  return false;
}
function w6PatrolFight(p, t, aware) {
  const E = w6Enc(p),
    P = PLACES6[E.place],
    L = w6PatrolLevel(p),
    keys = [v6EliteKey(P.pool[0], L)].concat(v6Mix(Object.assign({}, P, {L, target: P.target - 1})));
  walker.path = null;
  controls.held = null;
  rp.s.w6st.fighting = t.id;
  /* shared with a friend in the same place when one is free (systems.md §12) */
  startFight(keys, {
    members: rp.s.party.map(m => ({m, ctl: 'me', own: 'h'})),
    zone: ',',
    v6: 1,
    theme: w6Theme(p),
    patrol: t.id,
    xpMul: 1.5,
    aware: !!aware,
    title: t.name,
    msg: aware ? t.name + ' saw you coming!' : 'You catch ' + t.name + ' unawares!'
  });
}

/* ------------------------------------------------------------------ stables, raptors and fast travel (systems.md §6) */
function w6StableAt(p, x, y) {
  const P = MAPS6[p];
  return !!(P && P.stables && P.stables.some(([sx, sy]) => sx === x && sy === y));
}
function w6Pieces() {
  return (rp.s.w6st.pieces || []).length;
}
function w6Stable(p, x, y) {
  const st = rp.s.w6st;
  if (w6Pieces() < 1) {
    rpSay([{who: '', text: 'The stable is shut. A sign says: "Raptors for heroes only. Come back with something to show."'}]);
    return true;
  }
  const k = p + ':' + x + ',' + y;
  if (!st.stables.includes(k)) st.stables.push(k);
  rp.w6travel = 'stable';
  rp.mode = 'w6travel';
  return true;
}
/* where you can go: the stables visited (on a raptor, from a stable), or every fountain drunk from (from the second piece, from anywhere) */
function w6TravelList(kind) {
  const st = rp.s.w6st;
  if (kind === 'stable')
    return st.stables.map(k => {
      const [p, xy] = k.split(':');
      const [x, y] = xy.split(',').map(Number);
      return {p, x, y, n: 'the stable at ' + w6Title(p).replace(/ \(.*\)$/, '')};
    });
  return w6Pieces() >= 2
    ? st.fountains.map(p => {
        const F = w6FountainAt(p);
        return {p, x: F[0], y: F[1] + 1, n: 'the fountain in ' + w6Title(p).replace(/ \(.*\)$/, '')};
      })
    : [];
}
function w6FountainAt(p) {
  const R = w6Rows(p);
  for (let y = 0; y < R.length; y++) {
    const x = R[y].indexOf('F');
    if (x >= 0) return [x, y];
  }
  return MAPS6[p].entry;
}
function w6Travel(i) {
  const L = w6TravelList(rp.w6travel)[i];
  rp.mode = 'map';
  if (!L) return false;
  if (rp.w6travel === 'stable') emit('w6:stable');
  w6Go(L.p, L.x, L.y + (rp.w6travel === 'stable' ? 1 : 0));
  if (!rp.headless) rpToast('Off you go!');
  return true;
}

/* ------------------------------------------------------------------ the flooded south road (systems.md §6) and flavour weather (§15) */
const w6Dry = () => test({pb: {gte: 6}});
function w6Flooded(p, x, y) {
  const F = MAPS6[p] && MAPS6[p].flood;
  return !!(F && !w6Dry() && x === F[0][0] && y >= F[0][1] && y <= F[1][1]);
}

/* ------------------------------------------------------------------ stepping and bumping */
function w6Step(x, y, c) {
  const s = rp.s,
    p = s.w6,
    st = s.w6st;
  st.since = (st.since || 0) + 1;
  const L = w6LinkAt(p, x, y, 'step');
  if (L) return w6Follow(L);
  if (w6StableAt(p, x, y)) return w6Stable(p, x, y);
  if (w6ChestAt(p, x, y) && !st.chests.includes(p + ':' + x + ',' + y)) return w6Chest(p, x, y); // a chest on open ground opens as you step on it
  if (s6Step(x, y)) return true;
  if (w6PatrolCheck(x, y, c)) return true;
  const E = w6Enc(p);
  if (!E || walker.grace > 0 || st.since < W6_GAP) return false;
  const chance = c === '"' ? E.grass || 0 : E.floor && !w6Solid(c) ? E.floor : 0;
  if (!chance || Math.random() >= chance) return false;
  st.since = 0;
  w6Fight(p, E);
  return true;
}
/* a link's flag: 'never' (shut for now), a flag's name (open once it is set) or a condition (core/rules.js) */
const linkOpen = f => !f || (f === 'never' ? false : typeof f === 'string' ? test({[f]: {gte: 1}}) : test(f));
function w6Follow(L) {
  const [, , , to, tx, ty, , flag] = L;
  if (!linkOpen(flag)) {
    rpToast(flag === 'never' ? 'That way is for later.' : 'The way is shut.');
    walker.path = null;
    controls.held = null;
    return true;
  }
  return w6Go(to, tx, ty);
}
function w6Fight(p, E) {
  const P = PLACES6[E.place],
    L = w6PackLevel(),
    first = !rp.s.w6st.enc[p];
  /* the foes' level: the place's, nudged toward the pack (levels 3–6 on R1, 6–8 in the mine; balance.md §5) */
  const lv = Math.max(P.L - 1, Math.min(P.L + 2, L)),
    keys = v6Mix(Object.assign({}, P, {L: lv}));
  rp.s.w6st.enc[p] = (rp.s.w6st.enc[p] || 0) + 1;
  walker.path = null;
  controls.held = null;
  startFight(keys, {
    members: rp.s.party.map(m => ({m, ctl: 'me', own: 'h'})),
    zone: ',',
    v6: 1,
    theme: E.theme || w6Theme(p),
    first,
    title: P.n || 'A fight'
  });
}
/* walking into something solid: bump links (the tower), and the things on the maps */
function w6Bump(x, y) {
  const s = rp.s,
    p = s.w6,
    c = (rp.grid[y] || [])[x];
  const L = w6LinkAt(p, x, y, 'bump');
  if (L) {
    w6Follow(L);
    return true;
  }
  if ((!isRoom(p) && c === 'F') || (isRoom(p) && c === 'H' && p === 'room:tower')) return w6Fountain(p);
  if (!isRoom(p) && c === 'o') {
    const m = w6MarkNear(p, x, y);
    rpSay([{who: '', text: m ? m.replace(/^sign: /, '') : 'A board. Nothing on it yet.'}]);
    return true;
  }
  if (w6ChestAt(p, x, y) || c === 'c') return w6Chest(p, x, y);
  if (!isRoom(p) && c === 'x' && p === 'mine1') return w6Cart();
  if (w6Flooded(p, x, y)) {
    rpSay([{who: '', text: 'The road south is under the brook. Somebody shut the dam and sent the water over it.'}]);
    return true;
  }
  if (w6StableAt(p, x, y)) return w6Stable(p, x, y);
  if (isRoom(p) && c === 'p') return w6Rest(p);
  return false;
}
/* tiles you stand on and tap: rail switches, the campfire */
function w6Use(x, y) {
  const s = rp.s,
    p = s.w6,
    c = (rp.grid[y] || [])[x];
  if (c === 'S' && p === 'mine1') {
    const k = x + ',' + y;
    s.w6st.switches[k] = !s.w6st.switches[k];
    rpToast('Clunk. The switch is ' + (s.w6st.switches[k] ? 'over' : 'back') + '.');
    return true;
  }
  if (c === 'C') return w6Campfire(p);
  return false;
}

/* ------------------------------------------------------------------ fountains, rest, campfires (systems.md §5, §6) */
function w6HealAll() {
  rp.s.party.forEach(m => {
    const st = v6Stats(m);
    m.hp = st.hp;
    m.mp = st.mp;
  });
}
function w6Fountain(p) {
  const st = rp.s.w6st;
  w6HealAll();
  emit('w6:sound', 'fountain');
  if (!st.fountains.includes(p)) st.fountains.push(p);
  st.respawn = p;
  if (w6Pieces() >= 2 && st.fountains.length > 1) {
    rpToast('Everyone feels better.');
    rp.w6travel = 'fountain';
    rp.mode = 'w6travel';
    return true;
  } // from the second piece: travel from any fountain
  rpSay([{who: '', text: 'Cold, clear water. Everyone feels better. (' + w6Title(p) + ' is where you will wake if the pack falls.)'}]);
  return true;
}
function w6Rest(p) {
  w6HealAll();
  emit('w6:sound', 'nom');
  rp.s.party.forEach(m => {
    m.streak = 0;
  });
  const st = rp.s.w6st;
  st.patrols = {};
  rpSay([{who: '', text: 'A good sleep. Everyone is rested (and the beaten patrols are back on the roads).'}]);
  return true;
}
function w6Campfire(p) {
  const st = rp.s.w6st,
    k = p + ':' + (rp.s.w6visit || 0);
  if (st.campfire[k]) {
    rpToast('The fire is low. It will be warm again on your next visit.');
    return true;
  }
  st.campfire[k] = 1;
  w6HealAll();
  rpSay([{who: '', text: 'You sit by the campfire for a while. Everyone is patched up.'}]);
  return true;
}

/* ------------------------------------------------------------------ chests (systems.md §8's table, opened by items.js) */
/* a chest stands where the world puts one (world/: a place's chests, made in the map editor) */
function w6ChestAt(p, x, y) {
  return CHESTS6.some(c => c.place === p && c.x === x && c.y === y);
}
function w6Chest(p, x, y) {
  const st = rp.s.w6st,
    k = p + ':' + x + ',' + y;
  if (st.chests.includes(k)) {
    rpToast('Empty.');
    return true;
  }
  st.chests.push(k);
  emit('w6:chest', p, x, y);
  const C = CHESTS6.find(c => c.place === p && c.x === x && c.y === y),
    got = C ? v6OpenChest(C.name) : [];
  rpSay([
    {
      who: '',
      text: got.length ? 'You open the chest: ' + got.join(', ') + '.' : 'You open the chest. Dust, and a spider who looks offended.'
    }
  ]);
  return true;
}

/* ------------------------------------------------------------------ the rail puzzle (systems.md §9): three switches, one setting brings the cart home */
const W6_RAIL = {loopIn: '21,16', loopOut: '17,16', siding: '12,13'};
function w6CartResult(sw) {
  if (!sw[W6_RAIL.loopIn]) return 'gap';
  if (!sw[W6_RAIL.loopOut]) return 'loop';
  if (sw[W6_RAIL.siding]) return 'siding';
  return 'home';
}
/* the puzzle's Hint button (ui-design.md §8): what the cart would do now, said plainly, then the switch that is wrong */
function w6RailHint() {
  const st = rp.s.w6st,
    r = w6CartResult(st.switches);
  st.hints = (st.hints || 0) + 1;
  const where = {gap: "the switch by the loop's way in", loop: "the switch by the loop's way out", siding: 'the switch by the siding'}[r];
  return r === 'home'
    ? 'The switches are right. Push the cart!'
    : st.hints < 2
      ? 'Walk the rail with your eyes: where would the cart stop now? Each switch on a tile you stand on flips with a tap.'
      : 'The cart would stop ' + {gap: 'at the broken rail', loop: 'in the loop', siding: 'in the siding'}[r] + '. Look at ' + where + '.';
}
function w6Cart() {
  const st = rp.s.w6st;
  if (st.cart === 'done') {
    rpToast('The cart is home.');
    return true;
  }
  const r = w6CartResult(st.switches);
  const say = {
    gap: "You push. The cart rolls, rolls... and stops at the broken rail with a CLANK. Rails don't like gaps. Go round.",
    loop: 'Round and round the loop it goes, and stops where it began. Something has to let it out.',
    siding: 'The cart rattles off into the dead-end siding and bumps the buffer. Wrong way! You push it back.',
    home: 'The cart rolls round the broken rail, out of the loop and all the way to the stairs. Ore will be pleased!'
  }[r];
  if (r === 'home') {
    st.cart = 'done';
    emit('w6:cart');
  }
  rpSay([{who: '', text: say}]);
  return true;
}

function w6TravelHtml() {
  const L = w6TravelList(rp.w6travel);
  return (
    '<div class="rpdlg"><div class="who">' +
    (rp.w6travel === 'stable' ? 'Ride a raptor' : 'Travel to a fountain') +
    '</div><p>' +
    (L.length ? 'Where to?' : 'Nowhere yet.') +
    '</p></div><div class="rpcmd">' +
    L.map((t, i) => button('w6go', t.n, {cls: 'go', v: i, raw: 1})).join('') +
    button('w6stay', 'Stay', {cls: 'x'}) +
    '</div>'
  );
}
/* ------------------------------------------------------------------ the dark floor (systems.md §9): sight 3, glow grubs and the campfire light tiles */
function w6Lit(p, x, y) {
  const R = w6Rows(p);
  if (!R) return true;
  if (R[y] && R[y][x] !== 'd') return true;
  for (let j = -4; j <= 4; j++)
    for (let i = -4; i <= 4; i++) {
      const c = R[y + j] && R[y + j][x + i];
      if (c === 'C' && Math.hypot(i, j) <= 4) return true;
    }
  const P = w6Place(p);
  return !!(P.marks || []).some(([mx, my, l]) => /glow grub/.test(l) && Math.hypot(mx - x, my - y) <= 2);
}

feature({
  id: 'world6',
  panels: {
    w6travel: {sig: () => rp.w6travel + JSON.stringify(rp.s && rp.s.w6st && [rp.s.w6st.stables, rp.s.w6st.fountains]), html: w6TravelHtml}
  },
  actions: {
    w6go: d => {
      w6Travel(+d.v);
    },
    w6stay: () => {
      rp.mode = 'map';
    },
    w6fast: () => {
      rp.w6travel = 'fountain';
      rp.mode = 'w6travel';
    }
  },
  on: {
    'battle:end': b => {
      if (!rp.s || !rp.s.w6 || !b || !b.v6) return;
      if (b.patrol && b.over === 'win') rp.s.w6st.patrols[b.patrol] = 1;
      if (b.over === 'lose') {
        const st = rp.s.w6st;
        const p = st.respawn || 'hearthspire';
        w6HealAll();
        rp.s.gold = Math.floor(rp.s.gold / 2);
        w6Go(p, ...MAPS6[p].entry);
      }
    }
  }
});

/* ------------------------------------------------------------------ the grid the hero walks: who stands where, what is solid, the path to a tapped tile */

function rpArea() {
  return rp.s && rp.s.w6 ? w6Title(rp.s.w6) : '';
}
function rpNpcs() {
  return rp.s && rp.s.w6 ? s6Npcs() : [];
}
function rpNpcAt(x, y) {
  return rpNpcs().find(n => n.x === x && n.y === y);
}
function rpSolid(x, y) {
  if (x < 0 || y < 0 || !rp.grid[y] || x >= rp.grid[y].length) return true;
  return w6Solid(rp.grid[y][x], x, y) || !!rpNpcAt(x, y);
}
const DIR8_STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
];
function rpBfs(tx, ty, toNeighbor) {
  const s = rp.s,
    key = (x, y) => x + ',' + y,
    prev = {},
    q = [[s.x, s.y]];
  let seen = 0;
  prev[key(s.x, s.y)] = null;
  while (q.length) {
    const [x, y] = q.shift();
    if (toNeighbor ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty) {
      const out = [];
      let k = key(x, y);
      while (prev[k] !== null) {
        const [px, py] = prev[k];
        out.unshift([+k.split(',')[0], +k.split(',')[1]]);
        k = key(px, py);
      }
      return out;
    }
    if (++seen > 6000) return null; /* only search near the hero (taps are always on screen) */
    /* 8 ways (25 Oct): straight steps first, so a straight line stays straight; a diagonal step never cuts a corner: both tiles
       beside it must be open and not a door or stairs */
    for (const [dx, dy] of DIR8_STEPS) {
      const nx = x + dx,
        ny = y + dy,
        k = key(nx, ny);
      if (k in prev || rpSolid(nx, ny) || Math.abs(nx - s.x) + Math.abs(ny - s.y) > 40) continue;
      if (
        dx &&
        dy &&
        [
          [x + dx, y],
          [x, y + dy]
        ].some(([cx, cy]) => rpSolid(cx, cy) || w6LinkAt(s.w6, cx, cy))
      )
        continue;
      prev[k] = [x, y];
      q.push([nx, ny]);
    }
  }
  return null;
}
export {
  DIR8_STEPS,
  W6_DIR,
  W6_GAP,
  W6_RAIL,
  isRoom,
  linkOpen,
  rpApplyWorld,
  rpArea,
  rpBfs,
  rpNpcAt,
  rpNpcs,
  rpPlace,
  rpSolid,
  w6Arrive,
  w6Bump,
  w6Campfire,
  w6Cart,
  w6CartResult,
  w6Chest,
  w6ChestAt,
  w6Dry,
  w6Enc,
  w6Fight,
  w6Flooded,
  w6Follow,
  w6Fountain,
  w6FountainAt,
  w6Go,
  w6HealAll,
  w6InSight,
  w6LinkAt,
  w6Lit,
  w6MarkNear,
  w6PackLevel,
  w6PatrolCheck,
  w6PatrolFight,
  w6PatrolLevel,
  w6Patrols,
  w6Pieces,
  w6Place,
  w6RailHint,
  w6Rest,
  w6Rows,
  w6Solid,
  w6SolidIn,
  w6Stable,
  w6StableAt,
  w6Start,
  w6Step,
  w6Strength,
  w6Theme,
  w6Title,
  w6Travel,
  w6TravelHtml,
  w6TravelList,
  w6Use
};
