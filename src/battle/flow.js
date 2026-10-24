/* A battle's flow (systems.md §1, §2): rpBattle sets up the board and the units, then rounds and turns in timeline order, each
   action's sequence of steps (move, strike, skill, item), the end, and the camera. The rules are battle/combat.js and battle/math.js. */
import {rpAiTurn, tcPosScore} from './ai.js';
import {v6Gen, v6Theme} from './board.js';
import {
  RP_E,
  RP_SK,
  RP_ST,
  v6Crit,
  v6DmgRange,
  v6DoSkill,
  v6HealMul,
  v6Hit,
  v6InReach,
  v6Move,
  v6OnTile,
  v6Queue,
  v6Revive,
  v6Strike,
  v6Together,
  v6TurnStart,
  v6Upcoming
} from './combat.js';
import {v6Fall, v6GiveXp, v6Keep, v6Leave} from './end.js';
import {
  rpTW,
  tcActCost,
  tcBase,
  tcCanPay,
  tcCheb,
  tcCover,
  tcFits,
  tcGen,
  tcGrass,
  tcHome,
  tcLive,
  tcMelee,
  tcPath,
  tcPay,
  tcReach,
  tcSees,
  tcShown,
  tcSideSees,
  tcStat,
  tcT,
  tcTiles,
  tcVis,
  tcW
} from './grid.js';
import {emit} from '../core/bus.js';
import {hooks, partnerName, rpInputReset, rpUI, shareFx} from '../core/hooks.js';
import {BVH, BVW, TT, rpResize} from '../core/layout.js';
import {rpBuzz, rpOpt} from '../core/options.js';
import {rpSave} from '../core/save.js';
import {controls, rp, walker} from '../core/state.js';
import {RP_ITEMS} from '../data/items.js';
import {WEAPONS, makeK} from '../engine/art.js';
import {sfx} from '../engine/audio.js';
import {burst, confetti, ftext, parts, set_shake, shake, texts} from '../engine/fx.js';
import {sheetOfFoe, sheetOfKobold} from '../engine/sheets.js';
import {artName} from '../engine/sprites.js';
import {R, clamp} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {v6Stats} from '../game/sheet.js';

function rpBattle(keys, opt) {
  opt = opt || {};
  const s = rp.s,
    boss = opt.boss || null,
    duel = !!opt.duel,
    T6 = opt.v6 && opt.theme ? v6Theme(opt.theme) : null,
    theme = T6 ? T6.base : 'meadow';
  const members = opt.members || s.party.map(m => ({m, ctl: 'me', own: 'h'})),
    foes = opt.foes || [];
  const n = duel ? 3 : keys.length,
    W = boss ? 12 : n <= 2 ? 9 : n === 3 ? 10 : 11,
    H = boss ? 14 : n <= 2 ? 12 : n === 3 ? 13 : 14;
  const b = {
    win: opt.win || null,
    W,
    H,
    g: T6 ? v6Gen(opt.theme, W, H, boss, (Math.random() * 1e9) | 0) : tcGen(theme, W, H, boss, (Math.random() * 1e9) | 0),
    theme,
    dark: !!(T6 && T6.dark),
    theme6: T6 ? opt.theme : null,
    units: [],
    vis: new Uint8Array(W * H),
    queue: [],
    cur: null,
    round: 0,
    phase: 'place',
    mode: 'move',
    pend: null,
    seq: [],
    step: null,
    cam: {x: 0, y: 0},
    camT: null,
    over: null,
    boss,
    zone: opt.zone || null,
    msg: '',
    exits: !boss && !duel,
    lastSeen: [],
    chans: [],
    img: null,
    placeSel: null,
    moveId: 0,
    t: 0,
    duel,
    v6: !!opt.v6
  };
  if (opt.net) b.net = {role: 'host', id: opt.nid, peer: opt.net, gParty: opt.gParty || []};
  for (const k of ['story', 'patrol', 'xpMul']) if (opt[k] != null) b[k] = opt[k]; // v6: carried in the options so a lobby or a retry keeps them
  rp.bt = b;
  v6Keep(b, keys, opt);
  const px = (W >> 1) - 1;
  const addKob = (mem, i, side) => {
    const m = mem.m,
      st = v6Stats(m);
    const u = {
      side,
      m,
      own: mem.own,
      ctl: mem.ctl,
      gi: mem.gi,
      name: m.name,
      x: 0,
      y: 0,
      sz: 1,
      ap: 0,
      stun: 0,
      slow: 0,
      buff: {atk: 0, def: 0},
      guard: 0,
      watch: 0,
      chan: null,
      aware: true,
      fled: false,
      get hp() {
        return m.hp;
      },
      set hp(v) {
        m.hp = v;
      },
      get max() {
        return v6Stats(m).hp;
      }
    };
    u.k = makeK({team: side === 1 ? 3 : 0, name: m.name, art: artName(m.name), weapon: m.w, hp: st.hp, size: 0.62}, 0, 0, !rp.headless);
    u.k.face = side ? -1 : 1;
    {
      u.k.sheetFn = () => sheetOfKobold(m);
      u.k.colour6 = m.hero && rp.s.hero ? rp.s.hero.colour : null;
    } /* a drawn v6 sheet, if there is one */
    if (m.hp <= 0) {
      u.k.state = 'ko';
      u.k.rot = -Math.PI / 2;
    }
    const y0 = side ? 0 : H - 3,
      yc = side ? 1 : H - 2;
    let spot = null,
      bd = 1e9;
    for (let y = y0; y < y0 + 3; y++)
      for (let x = 0; x < W; x++) {
        if (!tcFits(b, u, x, y)) continue;
        const d = Math.abs(x - (px + i)) + Math.abs(y - yc) * 1.5;
        if (d < bd) {
          bd = d;
          spot = [x, y];
        }
      }
    u.x = spot[0];
    u.y = spot[1];
    b.units.push(u);
  };
  members.forEach((mem, i) => addKob(mem, i, 0));
  if (duel) {
    for (let y = 0; y < 3; y++) for (let x = 0; x < W; x++) if (tcT(b.g[y][x]).solid && tcT(b.g[y][x]).cov === 2) b.g[y][x] = tcBase(theme);
    foes.forEach((mem, i) => addKob(mem, i, 1));
  }
  /* enemies wait in one or two hidden groups in the far half of the board */
  const pods = boss ? 1 : keys.length >= 3 && Math.random() < 0.7 ? 2 : 1,
    centers = [];
  for (let p = 0; p < pods; p++) {
    let c = null;
    for (let tries = 0; tries < 60 && !c; tries++) {
      const x = 1 + ((Math.random() * (W - 2)) | 0),
        y = 1 + ((Math.random() * Math.max(2, H * 0.42 - 1)) | 0);
      if (centers.every(o => Math.hypot(o[0] - x, o[1] - y) >= 4)) c = [x, y];
    }
    centers.push(c || [W >> 1, 2]);
  }
  keys.forEach((key, i) => {
    const E = RP_E[key],
      scale = 1,
      sz = E.boss ? 2 : 1,
      pod = boss ? 0 : i % pods;
    const u = {
      side: 1,
      E,
      key,
      name: E.n,
      x: 0,
      y: 0,
      sz,
      hp: Math.round(E.hp * scale),
      max: Math.round(E.hp * scale),
      atk: E.atk * (E.boss ? 1 : Math.sqrt(scale)),
      def: E.def,
      spd: E.spd,
      ap: 0,
      stun: 0,
      slow: 0,
      buff: {atk: 0, def: 0},
      guard: 0,
      watch: 0,
      chan: null,
      aware: !!boss,
      pod,
      turns: 0,
      fled: false,
      own: 'e',
      ctl: 'ai'
    };
    let spot = null;
    if (E.boss) spot = [(W >> 1) - 1, 1];
    else {
      const [cx, cy] = boss ? [W >> 1, 3] : centers[pod];
      let best = -1e9;
      for (let y = Math.max(0, cy - 3); y <= Math.min(H - 5, cy + 3); y++)
        for (let x = Math.max(0, cx - 3); x <= Math.min(W - 1, cx + 3); x++) {
          u.x = x;
          u.y = y;
          if (!tcFits(b, u, x, y)) continue;
          const sc = -Math.hypot(x - cx, y - cy) + tcCover(b, u, x, H).c * 1.5 + (tcGrass(b, u) ? 1 : 0) + Math.random();
          if (sc > best) {
            best = sc;
            spot = [x, y];
          }
        }
    }
    if (!spot) spot = [i % W, 0];
    u.x = spot[0];
    u.y = spot[1];
    u.k = makeK(
      {team: E.team, name: E.n, art: E.art || key, weapon: E.w, hp: E.hp, size: E.boss ? 1.25 : 0.62 * (E.size || 1)},
      0,
      0,
      !rp.headless
    );
    u.k.face = -1;
    u.k.sheetFn = () => sheetOfFoe(E);
    b.units.push(u);
  });
  b.units.forEach(u => {
    const h = tcHome(u);
    u.k.x = h.x;
    u.k.y = h.y;
  });
  tcVis(b);
  tcCamTo(b, b.units[0], true);
  rp.mode = 'battle';
  walker.path = null;
  controls.held = null;
  rpInputReset();
  b.msg = duel
    ? 'Duel with ' + partnerName() + '! Place your kobolds, then start.'
    : boss
      ? RP_E[boss].n + ' blocks the way! Place your kobolds, then start.'
      : 'Ambush! Something lurks in the fog. Place your kobolds, then start.';
  if (!rp.headless) sfx('crit');
  rpBuzz(boss ? [60, 40, 90] : 40);
  if (opt.aware)
    b.units.forEach(u => {
      if (u.side === 1) u.aware = true;
    });
  if (opt.msg) b.msg = opt.msg;
  if (rp.headless) rpTacBegin();
  rpUI(true);
}
function rpTacBegin() {
  const b = rp.bt;
  if (!b || b.phase !== 'place') return;
  b.placeSel = null;
  b.phase = 'busy';
  b.round = 0;
  b.queue = [];
  tcVis(b);
  if (b.boss)
    b.units.forEach(u => {
      if (u.side === 1) u.aware = true;
    });
  b.msg = 'The fight begins!';
  tcNext();
}
/* ---------- turn order ---------- */
function tcRound(b) {
  b.round++;
  /* nobody has seen anybody for a while: both sides hear each other */
  const seen =
    b.units.some(e => e.side === 1 && tcLive(e) && tcShown(b, e)) || b.units.some(p => p.side === 0 && tcLive(p) && tcSideSees(b, 1, p));
  b.quiet = seen ? 0 : (b.quiet || 0) + 1;
  if (b.quiet >= 3) {
    b.quiet = 0;
    b.units.forEach(p => {
      if (p.side === 0 && tcLive(p)) tcSeen(b, p);
    });
    const es = b.units.filter(e => e.side === 1 && tcLive(e));
    b.pings = es.map(e => ({x: e.x, y: e.y, r: b.round}));
    if (es.length) {
      const e = es[0],
        c = b.units.find(p => p.side === 0 && tcLive(p)) || e;
      b.msg =
        'You hear something to the ' +
        (Math.abs(e.y - c.y) >= Math.abs(e.x - c.x) ? (e.y < c.y ? 'north' : 'south') : e.x < c.x ? 'west' : 'east') +
        '…';
    }
  }
  if (b.pings) b.pings = b.pings.filter(p => b.round - p.r < 2);
  if (b.round >= 5)
    b.units.forEach(e => {
      if (e.side === 1 && tcLive(e) && !e.aware) {
        b.units.forEach(p => {
          if (p.side === 0 && tcLive(p)) tcSeen(b, p);
        });
        tcAlert(b, e.pod, false);
      }
    });
  b.queue = v6Queue(b);
}
function tcUpcoming(b, n) {
  return v6Upcoming(b, n + 1);
}
function tcCheckEnd() {
  const b = rp.bt;
  if (!b || b.over) return true;
  if (b.duel) {
    const a = b.units.some(u => u.side === 0 && tcLive(u)),
      c = b.units.some(u => u.side === 1 && tcLive(u));
    if (!a || !c) {
      b.over = a ? 'duelwin' : 'duellose';
      b.phase = 'end';
      b.cur = null;
      b.seq = [];
      b.step = null;
      b.msg = a ? 'You won the duel against ' + partnerName() + '!' : partnerName() + ' won the duel. Good fight!';
      if (a && !rp.headless) confetti();
      rpUI(true);
      return true;
    }
    return false;
  }
  if (!b.units.some(u => u.side === 1 && tcLive(u))) {
    rpWin();
    return true;
  }
  const on = b.units.filter(u => u.side === 0 && tcLive(u));
  if (!on.length) {
    if (b.units.some(u => u.side === 0 && u.fled && u.hp > 0)) {
      b.over = 'run';
      b.phase = 'end';
      b.msg = 'Your party slipped away.';
      rpUI(true);
    } else rpLose();
    return true;
  }
  return false;
}
function tcNext() {
  const b = rp.bt;
  if (!b || b.over) return;
  if (tcCheckEnd()) return;
  if (!b.queue.length) tcRound(b);
  const u = b.queue.shift();
  if (!u || !tcLive(u)) return tcNext();
  b.cur = u;
  u.ap = 2;
  u.guard = 0;
  u.watch = 0;
  u.atkd = 0;
  b.pend = null;
  b.mode = 'move';
  if (v6TurnStart(b, u)) {
    b.cur = null;
    return tcNext();
  }
  if (u.buff.atk > 0) u.buff.atk--;
  if (u.buff.def > 0) u.buff.def--;
  if (u.m) {
    const st = v6Stats(u.m);
    if (st.regen && u.m.hp < st.hp) {
      const a = Math.max(1, Math.round(st.hp * st.regen));
      u.m.hp = Math.min(st.hp, u.m.hp + a);
      tcFloatU(u, '+' + a, '#9af0a0');
    }
    if (st.mpregen && u.m.mp < st.mp) u.m.mp = Math.min(st.mp, u.m.mp + st.mpregen);
  }
  if (u.side === 1) u.turns++;
  if (u.slow) {
    u.slow = 0;
    u.ap = 1;
    tcFloatU(u, 'slowed', '#bfeaff');
  }
  if (u.chan) {
    const c = u.chan;
    u.chan = null;
    b.chans = b.chans.filter(x => x !== c);
    u.ap = Math.min(u.ap, 1);
    tcQ({k: 'area', a: u, sk: c.sk, cx: c.cx, cy: c.cy});
  }
  if (u.stun) {
    u.stun = 0;
    u.ap = 0;
    b.msg = u.name + ' is stunned and loses the turn!';
    tcFloatU(u, 'stunned', '#ffe27a');
    tcQ({k: 'wait', d: 0.6});
    b.phase = 'busy';
    rpUI(true);
    return;
  }
  const ctl = u.ctl || (u.side === 0 ? 'me' : 'ai');
  b.turnT = performance.now();
  b.warned = 0;
  /* a player who left mid-fight: their kobolds guard until the fight ends (systems.md §12) */
  if (ctl === 'guard') {
    u.guard = 1;
    u.ap = 0;
    b.msg = u.name + ' guards.';
    tcFloatU(u, 'guard', '#9ad0ff');
    tcQ({k: 'wait', d: 0.4});
    b.phase = 'busy';
    rpUI(true);
    return;
  }
  if (ctl === 'remote') {
    b.phase = b.seq.length ? 'busy' : 'remote';
    b.msg = partnerName() + ' is moving ' + u.name + '…';
    tcCamTo(b, u);
    rpUI(true);
    return;
  }
  if (ctl === 'me') {
    b.phase = b.seq.length ? 'busy' : 'turn';
    b.msg =
      u.name +
      "'s turn · " +
      u.ap +
      ' AP' +
      (rp.s.q.tac
        ? ''
        : '. Tap a blue tile to move there, a foe to attack it (its hit chance is over its head). Drag the board to look around.');
    tcCamTo(b, u);
    if (rp.autoParty) rpAiTurn(u);
  } else {
    b.phase = 'ai';
    if (tcShown(b, u)) tcCamTo(b, u);
    rpAiTurn(u);
  }
  rpUI(true);
}
function tcEndTurn() {
  const b = rp.bt;
  if (!b) return;
  const u = b.cur;
  if (u) u.ap = 0;
  b.pend = null;
  b.cur = null;
  tcNext();
}
/* ---------- the action queue (moves, attacks, spells) ---------- */
function tcQ(st) {
  rp.bt.seq.push(st);
}
function tcSpeed(u) {
  const b = rp.bt;
  if (rp.headless) return 0;
  if (u && !u.m && !tcShown(b, u)) return 0;
  return u && (u.ctl === 'ai' || !u.m) ? rpOpt.bspd || 1 : 1;
}
function tcFloatU(u, t, c) {
  tcFx(u, t, c, 13);
}
function tcFx(u, t, c, sz, dy) {
  rpFloat(u.k.x, u.k.y - (dy || 46 * (u.sz > 1 ? 1.6 : 1)), t, c, sz || 13);
  shareFx({u: rp.bt.units.indexOf(u), t, c, s: sz || 13, dy: dy || 0});
}
function tcStepRun(dt) {
  const b = rp.bt;
  for (let guard = 0; guard < 200; guard++) {
    if (!b.step) {
      if (!b.seq.length) return true;
      b.step = b.seq.shift();
      b.step.t = 0;
      if (b.step.k === 'fn') {
        b.step.fn();
        b.step = null;
        continue;
      }
    }
    const st = b.step,
      sp = tcSpeed(st.u || st.a);
    if (st.k === 'wait') {
      st.t += dt * (sp || 1e9);
      if (st.t < st.d) return false;
      b.step = null;
      continue;
    }
    if (st.k === 'move') {
      if (!tcLive(st.u)) {
        b.step = null;
        continue;
      }
      /* one unit to a tile, always: a path planned before another unit moved stops short of a tile that is taken now */
      if (st.t === 0 && !tcFits(b, st.u, st.path[st.i][0], st.path[st.i][1])) {
        b.step = null;
        st.u.k.moving = false;
        const h = tcHome(st.u);
        st.u.k.x = h.x;
        st.u.k.y = h.y;
        continue;
      }
      const per = 0.13;
      if (sp) st.t += dt * sp;
      else st.t = per;
      const [nx, ny] = st.path[st.i],
        u = st.u,
        h0 = tcHome(u),
        h1 = {x: (nx + u.sz / 2) * TT, y: (ny + u.sz - 0.16) * TT},
        p = clamp(st.t / per, 0, 1);
      u.k.x = h0.x + (h1.x - h0.x) * p;
      u.k.y = h0.y + (h1.y - h0.y) * p;
      u.k.moving = true;
      u.k.walk += dt * 12;
      if (h1.x !== h0.x) u.k.face = h1.x > h0.x ? 1 : -1;
      if (st.t < per) return false;
      const prev = {x: u.x, y: u.y, sz: u.sz};
      u.x = nx;
      u.y = ny;
      st.i++;
      st.t = 0;
      u.k.moving = st.i < st.path.length;
      const react = tcOnStep(u, prev, st);
      if (st.i >= st.path.length || !tcLive(u) || st.stop) {
        b.step = null;
        u.k.moving = false;
        const h = tcHome(u);
        u.k.x = h.x;
        u.k.y = h.y;
        if (react.length) b.seq.unshift(...react);
        continue;
      }
      if (react.length) {
        b.step = null;
        b.seq.unshift(...react, st);
        continue;
      }
      if (!sp) continue;
      return false;
    }
    if (st.k === 'atk' || st.k === 'area' || st.k === 'heal') {
      const dur = st.k === 'atk' && tcMelee(st.a) && !st.o.spell ? 0.62 : 0.66;
      if (sp) st.t += dt * sp;
      else st.t = dur;
      tcAnim(st, clamp(st.t / dur, 0, 1));
      if (!st.done && st.t >= dur * 0.6) {
        st.done = 1;
        tcResolve(st);
      }
      if (st.t < dur) return false;
      const a = st.a;
      if (a && a.k) {
        a.k.state = tcLive(a) ? 'idle' : 'ko';
        const h = tcHome(a);
        if (tcLive(a)) {
          a.k.x = h.x;
          a.k.y = h.y;
        }
      }
      b.anim = null;
      b.step = null;
      continue;
    }
    b.step = null;
  }
  return false;
}
/* things that happen when a unit steps onto a tile: free hits, overwatch, spotting */
function tcOnStep(u, prev, st) {
  const b = rp.bt,
    out = [];
  if (u.side === 0) tcVis(b);
  v6OnTile(b, u);
  b.units.forEach(o => {
    if (o.side === u.side || !tcLive(o) || o.stun || (o.side === 1 && !o.aware)) return;
    if (tcMelee(o) && o.aooId !== st.id) {
      const r = rpTW(tcW(o)).r;
      if (tcCheb(o, prev) <= r && tcCheb(o, u) > r && tcSees(b, o, u)) {
        o.aooId = st.id;
        out.push({k: 'atk', a: o, tg: u, o: {mul: 1, aoo: 1, name: 'Free hit'}});
      }
    }
    if (o.watch && tcSees(b, o, u) && v6InReach(b, o, u)) {
      o.watch = 0;
      out.push({k: 'atk', a: o, tg: u, o: {mul: 1, watch: 1, name: 'Watch shot'}});
    }
  });
  if (out.length) st.stop = st.stop || out.some(x => x.o.watch);
  tcSpot(b, u.side === 0);
  if (u.side === 1 && u.aware)
    b.units.forEach(p => {
      if (p.side === 0 && tcLive(p) && tcSees(b, u, p)) tcSeen(b, p);
    });
  return out;
}
function tcSeen(b, p) {
  b.lastSeen = b.lastSeen.filter(o => o.u !== p);
  b.lastSeen.push({u: p, x: p.x, y: p.y});
}
/* hidden groups notice you when one of them can see a kobold */
function tcSpot(b, scamper) {
  b.units.forEach(e => {
    if (e.side !== 1 || !tcLive(e) || e.aware) return;
    const p = b.units.find(p => p.side === 0 && tcLive(p) && tcSees(b, e, p));
    if (p) {
      tcSeen(b, p);
      tcAlert(b, e.pod, scamper);
    }
  });
}
function tcAlert(b, pod, scamper) {
  const fresh = b.units.filter(e => e.side === 1 && tcLive(e) && !e.aware && e.pod === pod);
  if (!fresh.length) return;
  fresh.forEach(e => {
    e.aware = true;
    if (tcShown(b, e)) tcFloatU(e, '!', '#ffd54a');
  });
  if (fresh.some(e => tcShown(b, e))) {
    b.msg = 'Spotted! The enemy scrambles for cover.';
    if (!rp.headless) sfx('crit');
    rpBuzz(30);
  }
  if (scamper)
    fresh.forEach(e => {
      const R = tcReach(b, e, v6Move(e));
      let best = null,
        bs = -1e9;
      R.dist.forEach((d, k) => {
        const x = k % b.W,
          y = (k / b.W) | 0,
          sc = tcPosScore(b, e, x, y) - d * 0.3;
        if (sc > bs) {
          bs = sc;
          best = [x, y];
        }
      });
      if (best && (best[0] !== e.x || best[1] !== e.y)) {
        const p = tcPath(R, best[0], best[1]);
        if (p && p.length) b.seq.unshift({k: 'move', u: e, path: p, i: 0, id: ++b.moveId});
      }
    });
}
/* ---------- attacks and spells ---------- */
function tcAnim(st, p) {
  const a = st.a;
  if (!a || !a.k) return;
  const k = a.k,
    tgt = st.tg || (st.cx != null ? {k: {x: (st.cx + 0.5) * TT, y: (st.cy + 0.8) * TT}} : null);
  if (!tgt) return;
  const melee = st.k === 'atk' && tcMelee(a) && !st.o.spell,
    h = tcHome(a);
  if (tgt.k.x !== k.x) k.face = tgt.k.x > h.x ? 1 : -1;
  if (melee) {
    const tx = tgt.k.x - (tgt.k.x > h.x ? 18 : -18),
      ty = tgt.k.y;
    if (p < 0.45) {
      k.x = h.x + (((tx - h.x) * p) / 0.45) * 0.8;
      k.y = h.y + (((ty - h.y) * p) / 0.45) * 0.8;
      k.state = 'windup';
      k.wa = -0.6;
    } else {
      k.state = 'strike';
      k.wa = 1.6;
    }
  } else {
    k.state = p < 0.3 ? 'windup' : 'strike';
    const gun = !WEAPONS[k.weapon].magic && WEAPONS[k.weapon].ranged;
    k.wa = p < 0.3 ? (gun ? 1.2 : -0.6) : gun ? 0.9 : 1.6;
    if (p > 0.3) {
      const q = clamp((p - 0.3) / 0.32, 0, 1);
      const sx = h.x + (k.face > 0 ? 10 : -10),
        sy = h.y - 18;
      rp.bt.anim = {
        x: sx + (tgt.k.x - sx) * q,
        y: sy + (tgt.k.y - 18 - sy) * q - Math.sin(q * Math.PI) * 14,
        proj: st.k === 'heal' ? 'heal' : WEAPONS[k.weapon].proj || 'cork'
      };
    }
  }
}
function tcResolve(st) {
  const b = rp.bt;
  b.anim = null;
  if (st.k === 'atk') tcStrike(st.a, st.tg, st.o);
  else if (st.k === 'heal') {
    const t = st.tg,
      o = st.o;
    if (o.revive) {
      if (!tcLive(t) && !t.fled) {
        t.m.hp = Math.round(v6Stats(t.m).hp * o.revive);
        t.k.state = 'idle';
        t.k.rot = 0;
        t.k.rotT = 0;
        tcFloatU(t, 'Back up!', '#ffb347');
        if (!rp.headless) sfx('win');
      }
    } else if (tcLive(t)) {
      const amt = Math.round(t.max * o.amt * (1 + ((st.a && st.a.m && v6Stats(st.a.m).healp) || 0)) * v6HealMul(st.a, o));
      t.hp = Math.min(t.max, t.hp + amt);
      tcFloatU(t, '+' + amt, '#9af0a0');
      if (!rp.headless) {
        burst(t.k.x, t.k.y - 24, 5, ['#ff8fb1', '#ffb3c1'], 60, 'heart');
        sfx('nom');
      }
    }
  } else if (st.k === 'area') {
    const S = RP_SK[st.sk],
      T = RP_ST[st.sk] || {},
      a = st.a;
    if (!tcLive(a) && !T.chan) return;
    const hit = b.units.filter(
      u => tcLive(u) && (T.ff || u.side !== a.side) && tcTiles(u).some(([x, y]) => Math.hypot(x - st.cx, y - st.cy) <= T.area + 0.01)
    );
    if (!rp.headless) {
      burst((st.cx + 0.5) * TT, (st.cy + 0.5) * TT, 14, ['#ff8a2b', '#ffe9a8', '#fff'], 150, 'star');
      set_shake(Math.max(shake, 3));
    }
    hit.forEach(u => {
      const n = Math.max(1, tcTiles(u).filter(([x, y]) => Math.hypot(x - st.cx, y - st.cy) <= T.area + 0.01).length); // a big foe: once per overlapped tile (balance.md §4)
      for (let i = 0; i < n; i++)
        tcStrike(a, u, {mul: S.mul, spell: T.spell, stunP: S.stunP, slow: S.slow, name: S.n, area: 1, v6: T.v6, dark: st.dark});
    });
    if (!hit.length) rpFloat((st.cx + 0.5) * TT, (st.cy + 0.3) * TT, 'nothing there', '#d7c9e3', 12);
  }
}
function tcStrike(a, t, o) {
  return v6Strike(a, t, o);
  const b = rp.bt;
  if (!t || !tcLive(t)) return;
  o = o || {};
  let fl = false;
  if (!o.spell) {
    const H = v6Hit(b, a, t, o);
    fl = H.fl;
    if (Math.random() * 100 >= H.h) {
      tcFloatU(t, 'miss', '#d7c9e3');
      if (!rp.headless) sfx('pop');
      tcWake(b, t);
      return;
    }
  }
  const [lo, hi] = v6DmgRange(b, a, t, o.mul || 1, o);
  let d = Math.round(R(lo, hi));
  if (Math.random() < v6Crit(b, a, t, fl) && !o.spell) {
    d = Math.round(d * 1.5);
    tcFx(t, 'CRIT!', '#ffb347', 14, 62);
  }
  t.hp = Math.max(0, t.hp - d);
  t.k.hurt = 0.3;
  t.k.squash = 1;
  tcFx(t, String(d), '#ffffff', 16, 48);
  shareFx({u: b.units.indexOf(t), h: 1});
  if (a.m && o.drain) {
    const st = v6Stats(a.m),
      h = Math.round(d * o.drain);
    a.m.hp = Math.min(st.hp, a.m.hp + h);
    tcFloatU(a, '+' + h, '#9af0a0');
  }
  if (t.hp > 0 && (o.stun || (o.stunP && Math.random() < o.stunP)) && !(t.E && t.E.boss)) {
    t.stun = 1;
    tcFloatU(t, 'stunned', '#ffe27a');
  }
  if (t.hp > 0 && o.slow) {
    t.slow = 1;
    tcFloatU(t, 'brr!', '#bfeaff');
  }
  if (o.splash && !o.area)
    b.units.forEach(u => {
      if (u !== t && u.side === t.side && tcLive(u) && tcCheb(u, t) <= 1) {
        const sd = Math.max(1, Math.round(d * 0.4));
        u.hp = Math.max(0, u.hp - sd);
        tcFx(u, String(sd), '#ffd0a0', 13, 48);
        if (u.hp <= 0) tcKo(u);
      }
    });
  if (t.hp <= 0) tcKo(t);
  else if (!rp.headless) sfx('hit');
  if (!rp.headless) set_shake(Math.max(shake, 2));
  tcWake(b, t);
}
function tcWake(b, t) {
  if (t.side === 1 && !t.aware) tcAlert(b, t.pod, true);
  if (t.side === 0) tcSeen(b, t);
}
function tcKo(t) {
  const b = rp.bt;
  v6Fall(b, t);
  t.k.state = 'ko';
  t.k.rotT = ((t.side ? 1 : -1) * Math.PI) / 2;
  t.chan = null;
  b.chans = b.chans.filter(c => c.u !== t);
  if (t.side === 0) rpBuzz(70);
  if (!rp.headless) {
    burst(t.k.x, t.k.y - 20, 10, ['#ffe27a', '#fff'], 130, 'star');
    sfx('ko');
  }
}
/* do an action: used by both the player (after confirming) and the AI */
function tcDo(u, act) {
  const b = rp.bt,
    c = tcActCost(u, act);
  if (!tcCanPay(u, c)) return false;
  if (act.k === 'move') {
    const cost = act.cost;
    if (u.ap < cost) return false;
    u.ap -= cost;
    tcQ({k: 'move', u, path: act.path, i: 0, id: ++b.moveId});
    b.msg = u.name + (cost > 1 ? ' dashes.' : ' moves.');
    return true;
  }
  tcPay(u, c);
  if (act.k === 'atk') {
    u.atkd = 1;
    const TW = rpTW(tcW(u));
    tcQ({
      k: 'atk',
      a: u,
      tg: act.t,
      o: {
        mul: 1,
        quick: !!tcStat(u).quick,
        splash: TW.splash,
        slow: TW.slow && Math.random() < TW.slow,
        stun: !!(u.E && u.E.stun && Math.random() < u.E.stun),
        name: WEAPONS[tcW(u)].n
      }
    });
    b.msg = u.name + ' attacks ' + act.t.name + '.';
    return true;
  }
  if (act.k === 'sk') {
    const S = RP_SK[act.sk],
      T = RP_ST[act.sk] || {};
    if (u.m) {
      if (u.m.mp < S.mp) return false;
      u.m.mp -= S.mp;
    }
    b.msg = u.name + ' uses ' + S.n + '!';
    const dark = !!(u.m && u.m.dark && u.m.dark[act.sk]);
    if (dark) {
      u.m.corr = (u.m.corr || 0) + 1;
      b.msg = u.name + ' uses ' + (T.v6 && T.v6.dark ? T.v6.dark.n : S.n) + '!';
    }
    act.dark = dark;
    if (T.v6 && v6DoSkill(b, u, act, S, T)) return true;
    if (T.chan) {
      const ch = {u, sk: act.sk, cx: act.cx, cy: act.cy, area: T.area, side: u.side};
      u.chan = ch;
      b.chans.push(ch);
      u.ap = 0;
      b.msg = u.name + ' starts casting ' + S.n + '! It lands on ' + u.name + "'s next turn.";
      if (!rp.headless) sfx('drop');
      return true;
    }
    if (T.area) {
      tcQ({k: 'area', a: u, sk: act.sk, cx: act.cx, cy: act.cy, dark: act.dark});
      return true;
    }
    if (T.around) {
      b.units
        .filter(t => t.side !== u.side && tcLive(t) && tcCheb(u, t) <= (T.aroundR || rpTW(tcW(u)).r))
        .forEach(t => tcQ({k: 'atk', a: u, tg: t, o: {mul: S.mul, name: S.n, spell: T.spell, v6: T.v6, dark: act.dark}}));
      return true;
    }
    if (T.self) {
      const al = b.units.filter(t => t.side === u.side && tcLive(t) && tcCheb(u, t) <= T.self);
      if (S.heal) al.forEach(t => tcQ({k: 'heal', a: u, tg: t, o: {amt: S.heal, sk: act.sk, dark: act.dark}}));
      else if (S.buff)
        tcQ({
          k: 'fn',
          fn: () => {
            al.forEach(t => {
              t.buff[S.buff] = 3;
              tcFloatU(t, S.buff === 'atk' ? 'ATK up!' : 'DEF up!', '#ffe27a');
            });
            if (!rp.headless) sfx('win');
          }
        });
      return true;
    }
    if (S.heal) {
      tcQ({k: 'heal', a: u, tg: act.t, o: {amt: S.heal, sk: act.sk, dark: act.dark}});
      return true;
    }
    if (S.revive) {
      tcQ({k: 'heal', a: u, tg: act.t, o: {revive: S.revive}});
      return true;
    }
    if (T.chain) {
      let prev = act.t;
      const hit = [prev];
      for (let i = 0; i < T.chain; i++) {
        const nx = b.units
          .filter(x => x.side === prev.side && tcLive(x) && !hit.includes(x) && tcCheb(x, prev) <= 2)
          .sort((x, y) => tcCheb(x, prev) - tcCheb(y, prev))[0];
        if (!nx) break;
        hit.push(nx);
        prev = nx;
      }
      hit.forEach((t, i) =>
        tcQ({k: 'atk', a: u, tg: t, o: {mul: S.mul * (i ? 0.7 : 1), spell: 1, stunP: S.stunP, name: S.n, v6: T.v6, dark: act.dark}})
      );
      return true;
    }
    tcQ({
      k: 'atk',
      a: u,
      tg: act.t,
      o: {mul: S.mul, spell: T.spell, aim: T.aim, stun: S.stun, slow: S.slow, drain: S.drain, name: S.n, v6: T.v6, dark: act.dark}
    });
    return true;
  }
  if (act.k === 'it') {
    const t = act.t,
      m = t.m,
      k = act.it;
    if (u.ctl !== 'remote') rp.s.bag[k]--;
    tcQ({
      k: 'fn',
      fn: () => {
        const st = v6Stats(m);
        if (k === 'bun') {
          const a = st.hp - m.hp;
          m.hp = st.hp;
          m.mp = st.mp;
          tcFloatU(t, '+' + a + ' · full MP', '#ffcf6a');
        } else if (k === 'potion') {
          const a = Math.min(Math.round(st.hp * 0.35), st.hp - m.hp);
          /* items.md §7: 35% of max HP */ m.hp += a;
          tcFloatU(t, '+' + a, '#9af0a0');
        } else if (k === 'ether') {
          const a = Math.min(Math.round(st.mp * 0.3), st.mp - m.mp);
          /* 30% of max mana */ m.mp += a;
          tcFloatU(t, '+' + a + ' MP', '#9ad0ff');
        } else if (k === 'feather') {
          m.hp = Math.round(st.hp * 0.5);
          t.k.state = 'idle';
          t.k.rot = 0;
          t.k.rotT = 0;
          tcFloatU(t, 'Back up!', '#ffb347');
        }
        if (!rp.headless) sfx('nom');
      }
    });
    b.msg = u.name + ' uses a ' + RP_ITEMS[k].n.toLowerCase() + '.';
    return true;
  }
  if (act.k === 'watch') {
    u.watch = 1;
    b.msg = u.name + ' keeps watch.';
    tcFloatU(u, 'watching', '#9ad0ff');
    return true;
  }
  if (act.k === 'guard') {
    u.guard = 1;
    b.msg = u.name + ' takes cover and guards.';
    tcFloatU(u, 'guard', '#9ad0ff');
    return true;
  }
  if (act.k === 'end') {
    u.ap = 0;
    b.msg = u.name + ' ends the turn.';
    return true;
  }
  if (act.k === 'together') return v6Together(b, u, act.f, act.t);
  if (act.k === 'revive') return v6Revive(b, u, act.t);
  if (act.k === 'leave') {
    u.fled = true;
    b.msg = u.name + ' slips off the edge of the field.';
    v6Leave(b, u);
    if (!rp.headless) sfx('pop');
    return true;
  }
  return false;
}
/* ---------- each frame ---------- */
function rpBattleStep(dt) {
  const b = rp.bt;
  if (!b) return;
  b.t += dt;
  for (const u of b.units) {
    const k = u.k;
    k.t += dt;
    k.pop = Math.min(1, k.pop + dt * 3);
    k.hurt = Math.max(0, k.hurt - dt);
    k.squash += (0 - k.squash) * Math.min(1, dt * 9);
    k.blink -= dt;
    if (k.blink < -0.12) k.blink = R(2, 5.5);
    if (k.state === 'ko') k.rot += (k.rotT - k.rot) * Math.min(1, dt * 8);
    else if (!(b.step && (b.step.u === u || b.step.a === u))) {
      const h = tcHome(u);
      k.x += (h.x - k.x) * Math.min(1, dt * 12);
      k.y += (h.y - k.y) * Math.min(1, dt * 12);
      k.moving = false;
      const gun = WEAPONS[k.weapon] && WEAPONS[k.weapon].ranged && !WEAPONS[k.weapon].magic;
      k.wa += ((b.over === 'win' && u.side === 0 ? -0.5 + Math.sin(k.t * 10) * 0.3 : gun ? 1.45 : 0.35) - k.wa) * Math.min(1, dt * 10);
      if (b.over === 'win' && u.side === 0 && tcLive(u) && k.z === 0 && Math.random() < dt * 1.5) k.vz = 150;
    }
    if (k.z > 0 || k.vz > 0) {
      k.vz -= 720 * dt;
      k.z += k.vz * dt;
      if (k.z <= 0) {
        k.z = 0;
        k.vz = 0;
      }
    }
  }
  const guest = b.net && b.net.role === 'guest';
  if (guest) hooks.guestFrame(b, dt);
  if (!guest && (b.phase === 'busy' || b.phase === 'ai' || (b.phase === 'turn' && b.seq.length))) {
    if (b.phase === 'turn') b.phase = 'busy';
    let done;
    try {
      done = tcStepRun(dt);
    } catch (err) {
      console.error('battle step failed', err);
      b.step = null;
      b.seq = [];
      b.anim = null;
      done = true;
    }
    if (done && !b.over) {
      if (tcCheckEnd()) return;
      const u = b.cur,
        ctl = u && (u.ctl || (u.side === 0 ? 'me' : 'ai'));
      if (!u || !tcLive(u) || u.ap <= 0 || ctl === 'ai') tcEndTurn();
      else if (ctl === 'remote') {
        b.phase = 'remote';
        rpUI(true);
      } else if (ctl === 'me') {
        if (rp.autoParty) {
          b.phase = 'ai';
          rpAiTurn(u);
          if (!b.seq.length) tcEndTurn();
        } else {
          b.phase = 'turn';
          b.msg = u.name + ' · ' + u.ap + ' AP left';
          rpUI(true);
        }
      } else tcEndTurn();
    }
  }
  if (b.net && b.net.role === 'host') hooks.hostFrame(b, dt);
  if (b.camT) {
    b.cam.x += (b.camT.x - b.cam.x) * Math.min(1, dt * 6);
    b.cam.y += (b.camT.y - b.cam.y) * Math.min(1, dt * 6);
  }
  if (!rp.headless) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        parts.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.g * dt;
      p.rot += p.vr * dt;
    }
    for (let i = texts.length - 1; i >= 0; i--) {
      const q = texts[i];
      q.life -= dt;
      if (q.life <= 0) {
        texts.splice(i, 1);
        continue;
      }
      q.y += q.vy * dt;
      q.vy *= Math.pow(0.2, dt);
    }
    set_shake(shake * Math.pow(0.002, dt));
    if (shake < 0.05) set_shake(0);
  }
}
/* ---------- results ---------- */
function rpFloat(x, y, t, c, sz) {
  if (!rp.headless) ftext(x, y, t, c, sz);
}
function rpWin() {
  const b = rp.bt;
  b.over = 'win';
  b.phase = 'end';
  b.cur = null;
  b.seq = [];
  b.step = null;
  rpRewards(b);
}
function rpRewards(b) {
  const s = rp.s;
  s.q.tac = 1;
  let xp = 0,
    gold = 0;
  b.units.forEach(f => {
    if (f.side === 1) {
      xp += f.E.xp;
      gold += f.E.gold;
    }
  });
  xp = Math.round(xp * (b.xpMul || 1));
  s.gold += gold;
  const ups = [];
  v6GiveXp(b, xp, ups);
  b.xp6 = xp;
  b.gold6 = gold;
  b.ups6 = ups; /* drops: items.js on 'battle:won' */
  b.msg = 'Victory! +' + xp + ' XP, +' + gold + ' gold.' + (ups.length ? ' ' + ups.join(' ') : '');
  b.units.forEach(u => {
    u.buff = {atk: 0, def: 0};
    u.guard = 0;
    u.watch = 0;
    b.vis.fill(2);
  });
  if (!rp.headless) {
    confetti();
    sfx('win');
  }
  emit('battle:won', b);
  rpUI(true);
}
function rpLose() {
  const b = rp.bt;
  b.over = 'lose';
  b.phase = 'end';
  b.cur = null;
  b.msg = 'Your party fell...';
  if (!rp.headless) sfx('lose');
  emit('battle:lost', b);
  rpUI(true);
}
function rpEndBattle() {
  const b = rp.bt,
    s = rp.s;
  if (!b) return;
  if (b.over === 'lost' || b.over === 'duelwin' || b.over === 'duellose') b.over = b.over === 'lost' ? 'run' : 'duel';
  rp.bt = null;
  rp.mode = 'map';
  walker.grace = 8;
  parts.length = 0;
  texts.length = 0;
  s.party.forEach(m => {
    if (m.hp <= 0 && b.over !== 'lose') m.hp = 1;
  });
  if (b.over === 'duel') rpToast('Duel over.');
  else if (b.over === 'run') rpToast('You got away!');
  emit('battle:end', b);
  rpSave();
  rpUI(true);
  requestAnimationFrame(rpResize);
}

if (!hooks.fight) hooks.fight = rpBattle; // alone (net/lobby.js takes over when the network is loaded)
/* the camera: centre on a unit (smoothly, or at once with snap) */
function tcCamTo(b, u, snap) {
  const h = u.k ? {x: u.k.x, y: u.k.y} : {x: (u.x + 0.5) * TT, y: (u.y + 0.5) * TT};
  const t = {x: clamp(h.x - BVW / 2, 0, Math.max(0, b.W * TT - BVW)), y: clamp(h.y - BVH * 0.55, 0, Math.max(0, b.H * TT - BVH))};
  b.camT = t;
  if (snap) {
    b.cam.x = t.x;
    b.cam.y = t.y;
  }
}
export {
  rpBattle,
  rpBattleStep,
  rpEndBattle,
  rpFloat,
  rpLose,
  rpRewards,
  rpTacBegin,
  rpWin,
  tcAlert,
  tcAnim,
  tcCamTo,
  tcCheckEnd,
  tcDo,
  tcEndTurn,
  tcFloatU,
  tcFx,
  tcKo,
  tcNext,
  tcOnStep,
  tcQ,
  tcResolve,
  tcRound,
  tcSeen,
  tcSpeed,
  tcSpot,
  tcStepRun,
  tcStrike,
  tcUpcoming,
  tcWake
};
