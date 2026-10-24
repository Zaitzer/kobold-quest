/* ---------- Kobold Quest v6: the slice's story (build step 12; slice-dialogue.md, docs/slice-scenes.md, systems.md §7, §10) ----------
   Scenes from src/data/v6/story.js: the script's own lines, played where and when world/scenes.json (the map editor) puts them, with their fights,
   the class pick, companions joining, items, deeds and flags. NPCs stand at their places and say their lines; the goal bar and the
   quest log read the flags; campfire chats play at an inn's hearth; the pack is chosen at the roster board. */
import {RP_E, v6BossKey, v6EliteKey, v6FoeKey} from '../battle/combat.js';
import {rpBattle} from '../battle/flow.js';
import {emit} from '../core/bus.js';
import {openLetter, partnerName, startFight} from '../core/hooks.js';
import {feature} from '../core/registry.js';
import {test} from '../core/rules.js';
import {rpSave} from '../core/save.js';
import {controls, rp, walker} from '../core/state.js';
import {CLASSES6} from '../data/v6/classes.js';
import {FOES6} from '../data/v6/foes.js';
import {CHATS6, COMPANIONS6, DEEDS6, GOALS6, KIND6, MINERS6, NPCS6, SCENES6, SCRIPT6, SETPIECES6, WAVE16} from '../data/v6/story.js';
import {button} from '../engine/html.js';
import {esc2} from '../engine/util.js';
import {rpSay, rpToast} from './dialogue.js';
import {
  needOf,
  v6Buy,
  v6CanWear,
  v6Craft,
  v6Drops,
  v6ItemName,
  v6OpenChest,
  v6Price,
  v6Recipes,
  v6Sell,
  v6SellPrice,
  v6ShopStock
} from './items.js';
import {packHero, packMeanLevel, v6Kobold, v6Stats} from './sheet.js';
import {w6Cart, w6Go, w6Start} from './world.js';

const PACK = 4;
const hero = () => packHero(rp.s);
const fillHero = t => String(t).replace(/\{hero\}/g, hero() ? hero().name : 'Pip');
const seen = () => (rp.s.w6st.seen = rp.s.w6st.seen || {});
const story = {q: null, scene: null, busy: false};

/* ------------------------------------------------------------------ playing a scene */
function lineOf(it) {
  return it.dir ? {who: '', text: fillHero(it.dir)} : {who: fillHero(it.who), text: fillHero(it.text)};
}
function linesOf(scene, a, b) {
  const items = SCRIPT6[scene.from || scene.id].items;
  return items
    .slice(a, b + 1)
    .filter(it => !it.dir || it.show)
    .map(lineOf);
}
function sceneById(id) {
  return SCENES6.find(s => s.id === id);
}
function play(id) {
  const sc = sceneById(id);
  if (!sc) return false;
  story.scene = sc;
  story.q = sc.steps.slice();
  story.busy = true;
  walker.path = null;
  controls.held = null;
  next();
  return true;
}
function done() {
  const sc = story.scene;
  if (sc && !sc.repeat) seen()[sc.id] = 1;
  story.scene = null;
  story.q = null;
  story.busy = false;
  emit('w6:scene', sc && sc.id);
  rp.mode = rp.mode === 'dialog' ? rp.mode : 'map';
}
function next() {
  const sc = story.scene;
  if (!sc) return;
  const st = story.q.shift();
  if (!st) {
    done();
    return;
  }
  const [k, a, b] = st;
  switch (k) {
    case 'say': {
      const L = linesOf(sc, st[3], st[4]);
      if (!L.length) {
        next();
        return;
      }
      rpSay(L, null, next);
      return;
    }
    case 'fight':
      setPiece(a);
      return;
    case 'class':
      rp.mode = 'w6class';
      return;
    case 'choice': {
      rpSay(
        [{who: '', text: 'What do you do?'}],
        a.map(([label, steps]) => ({
          t: label,
          fn: () => {
            story.q = steps.concat(story.q);
            next();
          }
        }))
      );
      return;
    }
    case 'set':
      Object.assign(rp.s.q, a);
      break;
    case 'join':
      join(a);
      break;
    case 'give':
      give(a, b);
      break;
    case 'deed':
      deed(DEEDS6[a], a, 1);
      break;
    case 'kind':
      deed(KIND6[a], a, 0);
      break;
    case 'piece': {
      const st6 = rp.s.w6st;
      st6.pieces = st6.pieces || [];
      if (!st6.pieces.includes(a)) st6.pieces.push(a);
      rpToast('A Smiler piece: the ' + a + '!');
      emit('w6:piece', a);
      break;
    }
    case 'tint':
      rp.tint = a;
      break;
    case 'chest': {
      const got = v6OpenChest(a);
      rpSay([{who: '', text: 'You find ' + a + ': ' + got.join(', ') + '.'}], null, next);
      return;
    }
    case 'goto':
      w6Go(a, b, st[3]);
      break;
    case 'cart': {
      w6Cart();
      if (rp.s.w6st.cart === 'done') rp.s.q.cart = 1;
      story.q = [];
      done();
      return;
    } // the cart's own words play; the scene ends with them
    case 'scene': {
      const n = sceneById(a);
      if (n) {
        if (!sc.repeat) seen()[sc.id] = 1;
        story.scene = n;
        story.q = n.steps.slice();
        next();
        return;
      }
      break;
    }
  }
  next();
}
/* the set pieces (slice-dialogue.md: five in act 1, then the slice's fixed fights); a lost set piece can be tried again at once */
function setPiece(id) {
  const S = SETPIECES6[id];
  if (!S) {
    next();
    return;
  }
  const s = rp.s,
    h = hero();
  const beat = s.w6st.beat || {};
  if (beat[id]) {
    delete beat[id];
    rpSay([{who: '', text: 'You already beat this one, with ' + beat[id + ':who'] + '.'}], null, next);
    delete beat[id + ':who'];
    return;
  }
  const members = (S.solo ? [h] : s.party).map(m => ({m, ctl: 'me', own: 'h'}));
  /* the set-piece rule (systems.md §4): the script's foes weigh at most 0.75 × the kobolds in the fight; heavier, and each is scaled down */
  const has = (tag, t) => !!tag && tag.split('+').includes(t);
  const base = S.boss
    ? []
    : S.foes.map(([f, L, tag]) => {
        const k = has(tag, 'elite') ? v6EliteKey(f, L) : v6FoeKey(f, L);
        const E = RP_E[k],
          w = (FOES6[f].by[E.L] || {}).w || 1;
        return {k, w: w * (has(tag, 'big') ? 2 : has(tag, 'elite') ? 2.57 : 1)};
      });
  const total = base.reduce((a, x) => a + x.w, 0),
    scale = total ? Math.min(1, (0.75 * members.length) / total) : 1;
  const keys = S.boss
    ? [v6BossKey(S.boss)]
    : S.foes.map(([f, L, tag, name], i) => {
        const k = base[i].k,
          E = RP_E[k];
        if (scale === 1 && !name && !tag) return k;
        const nk = k + ':' + id + ':' + i;
        const big = has(tag, 'big'),
          m = scale * (big ? 2 : 1);
        RP_E[nk] = Object.assign({}, E, {
          n: name || E.n,
          tele: has(tag, 'tele') ? 1 : 0,
          hp: Math.max(1, Math.round(E.hp * m)),
          atk: +(E.atk * scale * (big ? 1.2 : 1)).toFixed(1),
          xp: Math.max(1, Math.round(E.xp * m)),
          size: big ? 1.2 : E.size
        });
        return nk;
      });
  /* a boss can be fought together (systems.md §12): the lobby opens when a friend is free in the same place */
  story.fight = id;
  const opt = Object.assign(
    {members, zone: ',', v6: 1, theme: S.theme, setPiece: 1, story: id},
    S.boss ? {boss: keys[0], title: RP_E[keys[0]].n} : {}
  );
  if (S.boss && !S.solo) startFight(keys, opt);
  else rpBattle(keys, opt);
}
/* the test hero's "any fight" (systems.md §17): a set piece outside its scene */
function s6TestFight(id) {
  if (rp.s && rp.s.test && SETPIECES6[id]) setPiece(id);
}
/* a shared boss won as the friend: it counts if this player's story has reached that scene, else a helper's mark */
function s6SharedWin(id) {
  if (!id || !rp.s || !rp.s.w6st || rp.s.test) return;
  const st = rp.s.w6st,
    sc = SCENES6.find(c => c.steps.some(x => x[0] === 'fight' && x[1] === id));
  if (sc && due(sc) && !(st.beat || {})[id]) {
    st.beat = st.beat || {};
    st.beat[id] = 1;
    st.beat[id + ':who'] = partnerName();
    rpToast('This counts for your story!');
  } else {
    st.helps = (st.helps || 0) + 1;
    rpToast("A helper's mark! (" + st.helps + ')');
  }
}
/* ------------------------------------------------------------------ what scenes do */
/* a companion joins (systems.md §7): at the pack's mean level rounded down, never above the hero, with its kit and this tier's gear;
   into the pack if there is room, else to the bench at the inn */
function join(id) {
  const C = COMPANIONS6[id],
    s = rp.s;
  if (!C || s.party.concat(s.w6st.bench || []).some(m => m.cid === id)) return;
  const L = Math.min(hero().lvl, Math.max(1, Math.floor(packMeanLevel(s.party))));
  const m = v6Kobold(C.n, C.cls, L, {});
  m.cid = id;
  m.colour = C.colour;
  emit('w6:sound', 'recruit');
  if (s.party.length < PACK) {
    s.party.push(m);
    rpToast(C.n + ' joins the pack!');
  } else {
    (s.w6st.bench = s.w6st.bench || []).push(m);
    rpToast(C.n + ' joins! (waiting at the inn)');
  }
}
const ITEMS = {
  lamp: "Mallow's lamp",
  ember: "{hero}'s ember (cold)",
  book: "Mallow's recipe book",
  bun: 'an ember-bun',
  'clover-ring': 'a lucky clover ring'
};
function give(k, n) {
  const s = rp.s;
  n = n || 1;
  if (ITEMS[k] && k !== 'bun') emit('w6:sound', 'item');
  if (k === 'gold') {
    s.gold += n;
    rpToast('+' + n + ' gold');
    return;
  }
  if (k === 'bun') {
    s.buns = (s.buns || 0) + n;
  }
  s.bag[k] = (s.bag[k] || 0) + n;
  rpToast('Got ' + fillHero(ITEMS[k] || k) + '.');
}
/* a deed or a kind deed (corruption.md): the hero did it */
function deed(D, n, bad) {
  if (!D) return;
  const m = hero();
  m.corr = Math.max(0, (m.corr || 0) + D.v);
  rpToast((bad ? 'Corruption +' : 'Corruption ') + D.v);
}
/* the class pick at the yard drill (wave 1's eight): the hero becomes that class at its level, keeping its XP and name */
function pickClass(cls) {
  if (!WAVE16.includes(cls)) return false;
  const s = rp.s,
    old = hero(),
    i = s.party.indexOf(old);
  const m = v6Kobold(old.name, cls, old.lvl, {hero: 1});
  m.xp = old.xp || 0;
  m.colour = old.colour;
  m.corr = old.corr || 0;
  s.party[i] = m;
  walker.pk = null;
  rp.mode = 'map';
  rpToast(fillHero('{hero} the ' + CLASSES6[cls].n.toLowerCase() + '!'));
  next();
  return true;
}

/* ------------------------------------------------------------------ triggers */
const due = sc => !seen()[sc.id] && test(sc.when || null);
function sceneAt(kind, p, x, y, npc) {
  return SCENES6.find(sc => {
    const a = sc.at;
    if (!a || a.place !== p || !due(sc)) return false;
    if (kind === 'enter') return !!a.enter;
    if (kind === 'npc') return a.npc === npc;
    if (kind === 'tile') return !!a.tile && a.tile[0] === x && a.tile[1] === y;
    if (kind === 'area') return !!a.area && Math.hypot(x - a.area[0], y - a.area[1]) <= a.area[2];
    if (kind === 'bump') return !!a.bump && Math.hypot(x - a.bump[0], y - a.bump[1]) <= a.bump[2];
    return false;
  });
}
/* a waiting scene for this NPC (its "!" on the map) */
function s6Marker(id) {
  const n = String(id).replace(/^v6:/, '');
  return SCENES6.some(sc => sc.at && sc.at.npc === n && sc.at.place === rp.s.w6 && due(sc)) ? '!' : '';
}
function s6Step(x, y) {
  if (story.busy || rp.bt) return false;
  const sc = sceneAt('area', rp.s.w6, x, y);
  return sc ? play(sc.id) : false;
}
function s6Enter(p) {
  if (story.busy) return false;
  const sc = sceneAt('enter', p);
  return sc ? play(sc.id) : false;
}
/* tapping or bumping something: an NPC's scene or line, a scene's tile, a bump area, the hearth's chat, the roster board */
function s6Bump(x, y) {
  if (story.busy) return false;
  const p = rp.s.w6,
    n = s6NpcAt(x, y, true);
  if (n) {
    const sc = sceneAt('npc', p, x, y, n.id);
    if (sc) return play(sc.id);
    return npcLine(n);
  }
  let sc = sceneAt('tile', p, x, y) || sceneAt('bump', p, x, y);
  if (sc) return play(sc.id);
  const c = (rp.grid[y] || [])[x];
  if (c === 'H' && p.startsWith('room:') && p !== 'room:tower') return chat(p);
  if (c === 'o' && p.startsWith('room:')) return roster();
  return false;
}
function npcLine(n) {
  if (n.letter) {
    openLetter();
    return true;
  } /* Quill the scribe: the letter desk (net/mail.js) */
  if (!n.lines || !n.lines.length) {
    rpSay([{who: n.n, text: '...'}]);
    return true;
  }
  const st = rp.s.w6st;
  st.talk = st.talk || {};
  const i = st.talk[n.id] || 0;
  st.talk[n.id] = (i + 1) % n.lines.length;
  const it = SCRIPT6[n.from].items[n.lines[i]];
  let L = lineOf(it);
  /* "(after the hatching:)" splits a line in two (slice-dialogue.md §1.10) */
  const parts = L.text.split(/\s*\(after the hatching:\)\s*/);
  if (parts.length > 1) L.text = (rp.s.q.act || 0) >= 5 ? parts[1] : parts[0];
  rpSay(
    [L],
    null,
    n.shop
      ? () => {
          rp.w6shop = n.shop;
          rp.w6tab = 'buy';
          rp.mode = 'w6shop';
        }
      : null
  );
  return true;
}

/* ------------------------------------------------------------------ NPCs on the map */
function s6Npcs() {
  const p = rp.s && rp.s.w6;
  if (!p) return [];
  return NPCS6.filter(n => n.place === p && !n.door && test(n.show || null) && !(n.id === 'bork_gate' && rp.s.q.bork)).map(n => ({
    id: 'v6:' + n.id,
    v6id: n.id,
    name: n.n,
    x: n.x,
    y: n.y,
    team: 2,
    art: n.id,
    looks: n.looks,
    w: 'stick',
    col: n.colour
  }));
}
function s6NpcAt(x, y, withDoors) {
  const p = rp.s.w6;
  return NPCS6.find(n => n.place === p && n.x === x && n.y === y && (withDoors || !n.door) && test(n.show || null));
}

/* ------------------------------------------------------------------ campfire chats and the roster (slice-dialogue.md §6, systems.md §7) */
function chat(inn) {
  const s = rp.s,
    st = s.w6st;
  st.chats = st.chats || {};
  const inPack = id => s.party.some(m => m.cid === id);
  const c = CHATS6.find(c => c.inn === inn && !st.chats[c.id] && c.who.every(inPack) && test(c.when || null));
  if (!c) {
    rpSay([{who: '', text: 'You sit by the fire for a while. Nobody has anything to say tonight.'}]);
    return true;
  }
  st.chats[c.id] = 1;
  s.party
    .filter(m => c.who.includes(m.cid))
    .forEach(m => {
      m.bond = (m.bond || 0) + 1;
    });
  rpSay(SCRIPT6[c.id].items.filter(it => !it.dir || it.show).map(lineOf), null, () => rpToast('Bond +1'));
  return true;
}
function roster() {
  rp.mode = 'w6roster';
  return true;
}
function swap(i) {
  const s = rp.s,
    b = (s.w6st.bench = s.w6st.bench || []);
  const all = s.party.concat(b),
    m = all[i];
  if (!m || m.hero) return;
  if (s.party.includes(m)) {
    s.party.splice(s.party.indexOf(m), 1);
    b.push(m);
  } else if (s.party.length < PACK) {
    b.splice(b.indexOf(m), 1);
    s.party.push(m);
  }
}
/* the bench (systems.md §7): half the pack's XP, but never more than two levels under the hero */
function benchXp(xp) {
  const s = rp.s,
    h = hero();
  for (const m of s.w6st.bench || []) {
    const floor = m.lvl < h.lvl - 2;
    m.xp = (m.xp || 0) + (floor ? xp : Math.floor(xp / 2));
    while (m.lvl < 30 && m.xp >= Math.round(12 * Math.pow(m.lvl, 1.6))) {
      m.xp -= Math.round(12 * Math.pow(m.lvl, 1.6));
      m.lvl++;
      m.pend = (m.pend || 0) + 1;
    }
  }
}

/* ------------------------------------------------------------------ the goal bar and the quest log (systems.md §10) */
function goals() {
  const q = rp.s.q,
    eq = w => Object.entries(w).every(([k, v]) => (q[k] || 0) === v);
  const out = GOALS6.filter(g => eq(g.when));
  const miners = ['miner_ore', 'miner_tansy', 'miner_brothers', 'miner_marl'].filter(k => q[k]).length + (q.pb >= 5 ? 1 : 0);
  return out.map(g => ({goal: g.goal.replace('{miners}', miners), hint: g.hint}));
}
function s6GoalLine() {
  const g = goals();
  return g.length ? g.map(x => x.goal).join(' ') : '';
}
function logHtml() {
  const q = rp.s.q,
    G = goals();
  let h =
    '<div class="rpdlg"><div class="who">What now</div>' +
    G.map(g => '<p><b>' + esc2(g.goal) + '</b><br><small>' + esc2(g.hint) + '</small></p>').join('');
  if (q.pb === 2) {
    const done = {Ore: q.miner_ore, Tansy: q.miner_tansy, 'Flint and Grit': q.miner_brothers, 'Old Marl': q.miner_marl, Grubb: q.pb >= 5};
    h += '<p>' + MINERS6.map(m => (done[m.who] ? '✔ ' : '· ') + '<b>' + esc2(m.who) + '</b>: ' + esc2(m.hint)).join('<br>') + '</p>';
  }
  return h + '</div><div class="tbar">' + button('w6back', 'Back', {cls: 'x'}) + '</div>';
}
function w6RosterHtml() {
  const s = rp.s,
    all = s.party.concat(s.w6st.bench || []);
  return (
    '<div class="rpdlg"><div class="who">The roster</div><p>Pick the pack (four at most). Those not in it wait here and learn a little anyway.</p></div><div class="rpcmd">' +
    all
      .map((m, i) =>
        button('w6swap', esc2(m.name), {
          cls: s.party.includes(m) ? 'go' : '',
          v: i,
          disabled: m.hero,
          sub: esc2(CLASSES6[m.cls].n) + ' ' + m.lvl + (s.party.includes(m) ? ' · in the pack' : ' · waiting'),
          raw: 1
        })
      )
      .join('') +
    button('w6back', 'Done', {cls: 'x'}) +
    '</div>'
  );
}

/* ------------------------------------------------------------------ a new story */
function s6NewGame(name, colour) {
  const s = rp.s;
  const h = v6Kobold(name || 'Pip', 'fighter', 1, {hero: 1, skills: [], known: [], passives: []});
  h.noclass = 1;
  h.colour = colour || 'orange';
  s.q = {act: 0, pb: 0};
  s.buns = 0;
  s.hero = {name: h.name, colour: h.colour};
  w6Start([h], {map: 'room:bakery', at: [6, 5], gold: 30, bag: {potion: 2}});
  s.w6st.seen = {};
  story.busy = false;
  play('1.1');
}

/* starting and continuing (until the character select screen, build step 14): ☰ → New story / Continue story */
/* ------------------------------------------------------------------ the shop and the smith (systems.md §8) */
function shopHtml() {
  const town = rp.w6shop,
    tab = rp.w6tab || 'buy',
    s = rp.s,
    h =
      '<div class="rpcmd">' +
      [
        ['buy', 'Buy'],
        ['sell', 'Sell']
      ]
        .concat(v6Recipes(town).length ? [['smith', 'Smith']] : [])
        .map(([k, n]) => button('w6tab', n, {cls: k === tab ? 'on' : '', v: k, raw: 1}))
        .join('') +
      button('w6back', 'Leave', {cls: 'x'}) +
      '</div><p><b>' +
      Math.floor(s.gold) +
      ' gold</b></p>';
  const fits = it =>
    it.k === 'use'
      ? ''
      : s.party
          .filter(m => v6CanWear(m, it))
          .map(m => m.name)
          .join(', ');
  if (tab === 'buy')
    return (
      h +
      '<div class="rpcmd">' +
      v6ShopStock(town)
        .map((it, i) => {
          const p = v6Price(it),
            f = fits(it);
          return button('w6buy', esc2(v6ItemName(it)), {
            cls: it.k === 'use' ? 'it' : '',
            v: i,
            disabled: s.gold < p,
            sub:
              p +
              ' gold' +
              (it.k === 'use' ? '' : ' · T' + (it.tier + 1) + ' ' + it.slot + (f ? ' · ' + esc2(f) : ' · nobody can wear it')),
            raw: 1
          });
        })
        .join('') +
      '</div>'
    );
  if (tab === 'sell') {
    const L = s.inv6 || [];
    return (
      h +
      (L.length
        ? '<div class="rpcmd">' +
          L.map(it =>
            button('w6sell', esc2(v6ItemName(it)), {
              v: it.id,
              sub: 'sells for ' + v6SellPrice(it) + ' gold' + (it.uniq || it.set ? ' · are you sure? it is special' : ''),
              raw: 1
            })
          ).join('') +
          '</div>'
        : '<p>Nothing to sell.</p>')
    );
  }
  const mats = s.mats6 || {};
  return (
    h +
    '<p><small>' +
    (Object.entries(mats)
      .filter(([k, v]) => v > 0)
      .map(([k, v]) => k + ' ×' + v)
      .join(' · ') || 'No materials yet.') +
    '</small></p><div class="rpcmd">' +
    v6Recipes(town)
      .map((R, i) => {
        const N = needOf(R),
          can = N.every(x => (mats[x.mat] || 0) >= x.n);
        return button('w6craft', esc2(R.n), {cls: can ? 'go' : '', v: i, disabled: !can, sub: 'needs ' + esc2(R.need), raw: 1});
      })
      .join('') +
    '</div>'
  );
}
feature({
  id: 'story6',
  menu: [
    {
      order: 4,
      html: () => (rp.s && rp.s.w6 ? button('w6log', 'What now', {cls: 'go', sub: esc2(s6GoalLine() || 'the quest log'), raw: 1}) : '')
    }
  ],
  panels: {
    w6shop: {
      sig: () => JSON.stringify([rp.w6shop, rp.w6tab, rp.s && rp.s.gold, rp.s && (rp.s.inv6 || []).length, rp.s && rp.s.mats6]),
      html: shopHtml
    },
    w6log: {sig: () => JSON.stringify(rp.s && rp.s.q), html: logHtml},
    w6roster: {
      sig: () => JSON.stringify(rp.s && [rp.s.party.map(m => m.name), (rp.s.w6st.bench || []).map(m => m.name)]),
      html: w6RosterHtml
    }
  },
  actions: {
    w6tab: d => {
      rp.w6tab = d.v;
    },
    w6buy: d => {
      if (v6Buy(rp.w6shop, +d.v)) {
        rpToast('Bought!');
        rpSave();
      }
    },
    w6sell: d => {
      if (v6Sell(d.v)) {
        rpToast('Sold.');
        rpSave();
      }
    },
    w6craft: d => {
      const it = v6Craft(rp.w6shop, +d.v);
      if (it) {
        rpToast('The smith made ' + it.n + '!');
        rpSave();
      }
    },
    w6back: () => {
      rp.mode = 'map';
    },
    w6swap: d => {
      swap(+d.v);
    },
    w6log: () => {
      if (rp.s && rp.s.w6) rp.mode = 'w6log';
    }
  },
  on: {
    'w6:enter': p => {
      if (rp.s.w6st && rp.s.w6st.seen) s6Enter(p);
    },
    'battle:won': b => {
      if (b && b.v6 && rp.s.w6) {
        benchXp(b.xp6 || 0);
        const got = v6Drops(b),
          gp = Math.max(0, ...rp.s.party.map(m => v6Stats(m).goldP || 0));
        if (gp && b.gold6) {
          const g = Math.round(b.gold6 * gp);
          rp.s.gold += g;
          got.push(g + ' extra gold');
        }
        b.got6 = got;
        if (got.length) b.msg += ' Found: ' + got.join(', ') + '.';
      }
    },
    'battle:end': b => {
      if (!b || !b.story || !story.busy) return;
      if (b.over === 'win') {
        story.fight = null;
        setTimeout0(next);
      } else {
        story.busy = false;
        story.scene = null;
        story.q = null;
      }
    }
  }
}); // lost (and not retried) or fled: the scene stops; walking back in plays it again
/* a lost set piece: the scene stops, so walking back in plays it again (systems.md §4: set pieces can be retried) */
const setTimeout0 = f => {
  if (rp.headless) f();
  else setTimeout(f, 0);
};
export {
  ITEMS,
  PACK,
  benchXp,
  chat,
  deed,
  done,
  due,
  fillHero,
  give,
  goals,
  hero,
  join,
  lineOf,
  linesOf,
  logHtml,
  next,
  npcLine,
  pickClass,
  play,
  roster,
  s6Bump,
  s6Enter,
  s6GoalLine,
  s6Marker,
  s6NewGame,
  s6NpcAt,
  s6Npcs,
  s6SharedWin,
  s6Step,
  s6TestFight,
  sceneAt,
  sceneById,
  seen,
  setPiece,
  setTimeout0,
  shopHtml,
  story,
  swap,
  w6RosterHtml
};
