/* ---------- Kobold Quest v6: a kobold and its character sheet (build step 7) ----------
   One rule per stat, from balance.md §3 (the level table, the class table, the ability scores and their mapping, the new stats),
   items.md (gear) and corruption.md. A v6 kobold is a plain object with v6:1; the battle reads its numbers from v6Stats(). */
import {SCORES, balanceOf, mbar, modOf} from '../battle/math.js';
import {BASE6, CLASSES6, FAMILIES, TIER_POWER} from '../data/v6/classes.js';
import {GEAR6} from '../data/v6/items.js';
import {KITS6, PASSIVES6} from '../data/v6/skills.js';
import {v6GearExtras} from './items.js';

const V6_ARRAY = [15, 14, 13, 12, 10, 8];
const V6_TIERS = [1, 5, 10, 16, 22, 28];
/* the score each class's attack runs on (balance.md §3, the score-to-stat mapping); the monk uses its mean modifier */
const V6_ATK_SCORE = {
  fighter: 'STR',
  barbarian: 'STR',
  paladin: 'STR',
  ranger: 'DEX',
  rogue: 'DEX',
  monk: 'mbar',
  cleric: 'WIS',
  druid: 'WIS',
  bard: 'CHA',
  wizard: 'INT',
  sorcerer: 'CHA',
  warlock: 'CHA'
};
const V6_CAST_SCORE = {
  fighter: 'STR',
  barbarian: 'STR',
  paladin: 'CHA',
  ranger: 'WIS',
  rogue: 'DEX',
  monk: 'mbar',
  cleric: 'WIS',
  druid: 'WIS',
  bard: 'CHA',
  wizard: 'INT',
  sorcerer: 'CHA',
  warlock: 'CHA'
};
/* what each family looks like in the engine's drawings (engine/art.js WEAPONS) until v6 weapon art exists */
const V6_LOOK = {
  blades: 'sword',
  axes: 'club',
  guns: 'popgun',
  daggers: 'spoon',
  fists: 'fish',
  wands: 'frostrod',
  orbs: 'firewand',
  teapots: 'squirt',
  holy: 'healwand',
  nature: 'archstaff',
  instruments: 'stick'
};
const V6_VARIANT = {
  wizard: 'robe',
  sorcerer: 'robe',
  warlock: 'robe',
  cleric: 'robe',
  druid: 'robe',
  bard: 'robe',
  ranger: 'scout',
  rogue: 'scout',
  monk: 'scout'
};

function v6StartScores(cls) {
  const C = CLASSES6[cls],
    o = {};
  if (!C || !C.prio) {
    SCORES.forEach(k => (o[k] = 12));
    return o;
  }
  C.prio.split(' ').forEach((k, i) => (o[k] = V6_ARRAY[i]));
  return o;
}
/* point buy (balance.md §3): every score starts at 8 and 27 points raise them to 15 at most; Begin once no point can be spent */
const V6_BUY = {8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9},
  V6_POINTS = 27;
const v6BuyCost = sc => SCORES.reduce((a, k) => a + (V6_BUY[sc[k]] ?? 99), 0);
const v6BuyStep = (sc, k) => (sc[k] < 15 ? V6_BUY[sc[k] + 1] - V6_BUY[sc[k]] : 99); // what one more point in k costs
const v6BuyLeft = sc => V6_POINTS - v6BuyCost(sc);
const v6BuyDone = sc => !!sc && v6BuyLeft(sc) >= 0 && SCORES.every(k => v6BuyStep(sc, k) > v6BuyLeft(sc));
const v6TierFor = lvl => {
  let t = 0;
  V6_TIERS.forEach((x, i) => {
    if (x <= lvl + 1) t = i;
  });
  return t;
}; // as the level table: a tier is in the shops from the level before it (balance-model.js tierAt)
/* the stat picks a kobold of this level would have made (one score card about every 3.2 levels, 9 by level 30): the class's first two
   scores in turn (up to 20); the monk raises its lowest. Used for companions joining and for test heroes (systems.md §7). */
function v6AutoScores(cls, lvl) {
  const s = v6StartScores(cls),
    C = CLASSES6[cls],
    picks = Math.floor(((lvl - 1) * 9) / 29);
  for (let i = 0; i < picks; i++) {
    let k;
    if (!C.prio) k = SCORES.slice().sort((a, b) => s[a] - s[b])[0];
    else {
      const p = C.prio.split(' ');
      k = s[p[i % 2]] < 20 ? p[i % 2] : p[(i + 1) % 2];
    }
    if (s[k] < 20) s[k]++;
  }
  return s;
}
/* a full shop kit of one tier (items.md §3), in the class's variant */
function v6KitAt(cls, t) {
  const C = CLASSES6[cls],
    v = V6_VARIANT[cls] || 'plain',
    g = {weapon: {fam: C.fam, tier: t}};
  for (const slot of ['armour', 'helm', 'cloak']) g[slot] = {slot, tier: t, v: GEAR6[slot][v] ? v : 'plain'};
  for (const slot of ['shield', 'boots', 'neck']) g[slot] = {slot, tier: t, v: 'plain'};
  g.ring1 = {slot: 'ring', tier: t, v: 'plain'};
  g.ring2 = {slot: 'ring', tier: t, v: 'plain'};
  return g;
}
/* the class's four starting skills: its starting skill(s) and the talents its level has reached, newest last, at most four */
function v6KitSkills(cls, lvl) {
  const K = KITS6[cls];
  if (!K) return [];
  const list = K.start.slice();
  K.talents.filter(t => t.lvl <= lvl).forEach(t => list.push(t.id));
  return list.slice(0, 4);
}
/* the passives a kobold of this level would have taken: every pick that is not a score or a talent skill, the class's first three in turn
   (the same picks the model's reference fighter makes, balance-model.js picksAt) */
function v6AutoPassives(cls, lvl) {
  const n = Math.max(0, lvl - 1),
    sc = Math.floor((n * 9) / 29),
    sk = [2, 5, 11, 14].filter(x => x <= lvl).length,
    P = PASSIVES6[cls] || [],
    out = [];
  for (let i = 0; i < Math.max(0, n - sc - sk); i++) if (P.length) out.push(P[i % Math.min(3, P.length)].n);
  return out;
}
/* the leader points a test hero would have spent: Leadership to 5 first (strong early), then Might and Wits in turn (balance.md §3) */
function v6AutoLead(lvl) {
  const o = {might: 0, wits: 0, lead: 0};
  for (let i = 0; i < Math.floor(lvl / 2); i++) {
    if (o.lead < 5) o.lead++;
    else if (o.might <= o.wits) o.might++;
    else o.wits++;
  }
  return o;
}
/* every skill a kobold of this level knows: the start and the talents its level has reached (the four equipped are v6KitSkills) */
function v6KnownAt(cls, lvl) {
  const K = KITS6[cls];
  return K ? K.start.concat(K.talents.filter(t => t.lvl <= lvl).map(t => t.id)) : [];
}
function v6Kobold(name, cls, lvl, opt) {
  opt = opt || {};
  const m = {
    v6: 1,
    name,
    cls,
    lvl,
    xp: 0,
    scores: opt.scores || v6AutoScores(cls, lvl),
    start: v6StartScores(cls),
    passives: opt.passives || v6AutoPassives(cls, lvl),
    gear: opt.gear || v6KitAt(cls, v6TierFor(lvl)),
    skills: opt.skills || v6KitSkills(cls, lvl),
    dark: {},
    bond: opt.bond || 0,
    streak: 0,
    corr: opt.corr || 0,
    luck: opt.luck || 0,
    pend: 0,
    hero: !!opt.hero,
    known: opt.known || v6KnownAt(cls, lvl),
    ranks: {},
    sub: opt.sub || null,
    lead: opt.hero ? opt.lead || v6AutoLead(lvl) : null
  };
  m.w = V6_LOOK[CLASSES6[cls].fam];
  const st = v6Stats(m);
  m.hp = st.hp;
  m.mp = st.mp;
  return m;
}

/* ---------------------------------------------------------------- the sheet */
function v6Gear(m) {
  const out = {atk: 0, def: 0, hp: 0, spd: 0, mana: 0, wpow: 0, magic: false, steady: 5, quick: false, heavy: false, fam: null};
  for (const [k, g] of Object.entries(m.gear || {})) {
    if (!g) continue;
    if (k === 'weapon') {
      const F = FAMILIES[g.fam];
      out.fam = F;
      out.famId = g.fam;
      out.wpow = TIER_POWER[g.tier] * F.p;
      out.magic = !!F.magic;
      out.quick = !!F.quick;
      out.heavy = !!F.heavy;
      out.steady = Array.isArray(F.steady) ? F.steady[g.tier] : F.steady || 5;
      continue;
    }
    const row = (GEAR6[g.slot || k] || {})[g.v || 'plain'] || GEAR6[g.slot || k].plain;
    const p = row && row[g.tier];
    if (!p) continue;
    for (const [s, v] of Object.entries(p.st)) out[s === 'mana' ? 'mana' : s] += v;
  }
  return out;
}
/* the sheet is asked for very often (the AI scores every tile against every unit), so it is kept per kobold and worked out again
   only when something it depends on changes: class, level, scores, starting scores, passives, gear, luck, corruption */
const statsMemo = new WeakMap();
function statsSig(m) {
  let g = '';
  const G = m.gear;
  if (G)
    for (const k in G) {
      const x = G[k];
      if (x)
        g +=
          k +
          ':' +
          x.tier +
          (x.v || '') +
          (x.fam || '') +
          (x.slot || '') +
          (x.aff ? x.aff.join('+') : '') +
          (x.set || '') +
          (x.uniq || '') +
          ';';
    }
  let sc = '';
  for (const k in m.scores) sc += m.scores[k] + ',';
  let s0 = '';
  if (m.start) for (const k in m.start) s0 += m.start[k] + ',';
  return (
    m.cls +
    '|' +
    m.lvl +
    '|' +
    sc +
    '|' +
    s0 +
    '|' +
    (m.passives ? m.passives.join('+') : '') +
    '|' +
    g +
    '|' +
    (m.luck || 0) +
    '|' +
    (m.corr || 0)
  );
}
function v6Stats(m) {
  const sig = statsSig(m),
    c = statsMemo.get(m);
  if (c && c.sig === sig) return c.S;
  const S = v6StatsCalc(m);
  statsMemo.set(m, {sig, S});
  return S;
} /* shared: callers read it, never write it */
function v6StatsCalc(m) {
  const C = CLASSES6[m.cls],
    L = m.lvl,
    sc = m.scores,
    st0 = m.start || v6StartScores(m.cls),
    G = v6Gear(m),
    X = v6GearExtras(m); // X: bonuses, sets, uniques (items.js)
  const P = {};
  for (const n of m.passives || []) {
    const d = (PASSIVES6[m.cls] || []).find(x => x.n === n);
    if (d) for (const [k, v] of Object.entries(d.fx)) P[k] = (P[k] || 0) + v;
  }
  const mod = k => (k === 'mbar' ? mbar(sc) : modOf(sc[k])),
    grow = k => (k === 'mbar' ? mbar(sc) - mbar(st0) : modOf(sc[k]) - modOf(st0[k]));
  const f = k => (1 + 0.05 * mod(k)) / 1.1; // the level table is the fighter with its scores (×1.10): balance.md §3, "Reconciled"
  const bA = BASE6.atk[0] + BASE6.atk[1] * (L - 1),
    bD = BASE6.def[0] + BASE6.def[1] * (L - 1),
    bH = BASE6.hp[0] + BASE6.hp[1] * (L - 1);
  const atk = (bA + G.atk + (X.atk || 0) + (G.magic ? 0 : G.wpow)) * C.atk * f(V6_ATK_SCORE[m.cls]) * (1 + (P.atkP || 0));
  const spa = (bA + G.atk + (X.spa || 0) + (G.magic ? G.wpow : 0)) * C.spa * f(V6_CAST_SCORE[m.cls]) * (1 + (P.spaP || 0));
  const def = (bD + G.def + (X.def || 0)) * C.def * f('CON') * (1 + (P.defP || 0)),
    sd = (bD + G.def + (X.sd || 0)) * C.sd * f('CON') * (1 + (P.defP || 0)),
    hp = (bH + G.hp + (X.hp || 0)) * C.hp * f('CON') * (1 + (P.hpP || 0) + (X.hpP || 0));
  const m30 = C.mana[1],
    m1 = C.mana[0],
    baseMana = m1 + ((m30 - m1) * (L - 1)) / 29,
    mp = baseMana * (1 + (G.mana + (X.mana || 0)) / 100) * (1 + (P.mpP || 0));
  const spd = (5 + 0.5 * (L - 1)) * C.spd + G.spd + (X.spd || 0) + (P.spd || 0);
  const accScore = G.fam && G.fam.ranged ? 'DEX' : 'STR';
  const S = {
    hp: Math.round(hp),
    mp: Math.round(mp),
    atk,
    spa,
    def,
    sd,
    spd,
    move: Math.min(6, Math.max(3, Math.round(2 + 0.35 * spd))),
    acc: C.acc + 2.5 * grow(accScore) + (P.acc || 0), // the class table includes the starting scores (P21)
    dodge: Math.min(30, 10 + 2.5 * grow('DEX') + (P.dodge || 0) + (X.dodge || 0)), // points: 10 base, gear and skills capped at 30
    res: (V6_CAST_SCORE[m.cls] === 'WIS' ? 0 : 15 * grow('WIS')) + (P.res || 0) + (X.res || 0), // 5 pp a WIS modifier at 3 resistance a pp (balance.md §3)
    init: 10 + modOf(sc.DEX) + C.init + (P.init || 0) + (X.init || 0),
    threat: C.threat * (1 + 0.1 * modOf(sc.CHA)),
    cha: modOf(sc.CHA),
    crit: 0.08 + (P.crit || 0) + (X.crit || 0),
    critD: 1.5 + (P.critD || 0),
    pas: P,
    beta: 1,
    ap: X.ap || 0,
    luck: (m.luck || 0) + (X.luck || 0),
    regen: X.regen || 0,
    mpregen: 0,
    burnP: X.burnP || 0,
    poisonP: X.poisonP || 0,
    goldP: X.goldP || 0,
    rangedTaken: X.rangedTaken || 0,
    morale: X.morale || 0,
    steady: Math.max(1, G.steady + (X.steady || 0) + (G.magic ? P.steadySpell || 0 : P.steady || 0)),
    magic: G.magic,
    quick: G.quick,
    heavy: G.heavy,
    fam: G.famId,
    balance: balanceOf(sc),
    corr: m.corr || 0,
    sight: X.sight || 0,
    stealth: X.stealth || 0
  }; // gear's sight (of the Owl) and stealth, read by the battle's line of sight
  if (m.cls === 'monk') S.kiMul = 0.5 + S.balance;
  return S;
}

/* the four equipped skills; the class's name */
function rpMemSkills(m) {
  return (m.skills || []).slice();
} /* the four equipped skills */
function rpClsName(m) {
  return (CLASSES6[m.cls] || {n: m.cls}).n;
}
/* the hero of a save's pack (the one marked hero, else the first), and the pack's mean level */
function packHero(s) {
  const P = (s && s.party) || [];
  return P.find(m => m.hero) || P[0] || null;
}
function packMeanLevel(P) {
  return P && P.length ? P.reduce((a, m) => a + m.lvl, 0) / P.length : 1;
}
export {
  V6_ARRAY,
  V6_ATK_SCORE,
  V6_BUY,
  V6_CAST_SCORE,
  V6_LOOK,
  V6_POINTS,
  V6_TIERS,
  V6_VARIANT,
  packHero,
  packMeanLevel,
  rpClsName,
  rpMemSkills,
  statsMemo,
  statsSig,
  v6AutoLead,
  v6AutoPassives,
  v6AutoScores,
  v6BuyCost,
  v6BuyDone,
  v6BuyLeft,
  v6BuyStep,
  v6Gear,
  v6KitAt,
  v6KitSkills,
  v6KnownAt,
  v6Kobold,
  v6StartScores,
  v6Stats,
  v6StatsCalc,
  v6TierFor
};
