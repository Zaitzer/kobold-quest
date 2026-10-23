/* ---------- Kobold Quest v6: the combat rules as pure functions (build step 5) ----------
   Every rule from balance.md §3 and §4a, systems.md §1 and corruption.md, with no game state: the battle code calls these, and
   test/logic/v6rules.test.js checks them against tools/balance-model.js (the design's own model). Change a rule here only after the
   design says so, in writing. */

/* ---------------------------------------------------------------- damage: HoMM3's attack-versus-defence factor (balance.md §4a) */
export const DMG_C = 0.39,
  SPREAD = 0.15;
export function HF(A, D) {
  const d = (40 * (A - D)) / Math.max(1e-9, A + D);
  return d >= 0 ? 1 + 0.05 * d : Math.max(0.3, 1 + 0.025 * d);
}
/* one hit: attack A, skill multiplier M, defence D, armour piercing ap (0..1), spread roll u in [0,1] (already tilted by luck) */
export function damage(A, M, D, ap, u) {
  const D2 = D * (1 - (ap || 0));
  const base = Math.max(1, DMG_C * A * M * HF(A, D2));
  return base * (1 + SPREAD * (2 * (u == null ? 0.5 : u) - 1));
}

/* ---------------------------------------------------------------- luck: every random outcome tilts (balance.md §3) */
export const tilt = (p, luck) => {
  if (!luck) return p;
  const q = Math.pow(1.1, luck);
  return (p * q) / (p * q + 1 - p);
};
export const tiltU = (u, luck) => (luck ? Math.pow(u, 1 / Math.pow(1.1, luck)) : u);

/* ---------------------------------------------------------------- the one hit formula (balance.md §4a)
   s: {kind:'melee'|'ranged', acc (points), dodge (target's, points), cover (0 | 20 | 40, ranged only), tiles, steady (points a tile),
       i (attack index this turn, for the multiple-attack penalty), light (daggers, fists), unseen, noDodge (stunned, rooted, unaware),
       mercy (two misses in a row), luck (attacker's minus target's)}                                                             */
export const MAP = (i, light) => (i <= 0 ? 0 : light ? (i === 1 ? 4 : 8) : i === 1 ? 5 : 10);
export function hitChance(s) {
  const dodge = s.noDodge ? 0 : (s.dodge || 0) * (s.unseen ? 0.5 : 1);
  let p = 100 + (s.acc || 0) - dodge - MAP(s.i || 0, s.light);
  if (s.kind === 'ranged') p -= (s.cover || 0) + (s.steady || 5) * Math.max(0, (s.tiles || 1) - 1);
  if (s.mercy) p += 15;
  return tilt(Math.min(1, Math.max(0, p / 100)), s.luck || 0);
}
/* a damage spell lands or is resisted for half (balance.md §4a "Resisted spells", §3 the score mapping):
   s: {res (target's), lvlGap (target level − caster level), tiles, steady, unseen, el ('weak' | 'resist' | null), luck}            */
export function spellLand(s) {
  let r = 0.1 + 0.01 * Math.max(0, s.lvlGap || 0) + 0.01 * (s.res || 0);
  if (s.el === 'weak') r -= 0.1;
  else if (s.el === 'resist') r += 0.15;
  r = Math.min(0.4, Math.max(0.05, r));
  if (s.unseen) r *= 0.5;
  r += ((s.steady || 4) / 100) * Math.max(0, (s.tiles || 1) - 1);
  return tilt(Math.min(1, Math.max(0, 1 - r)), s.luck || 0);
}
/* a pure status spell lands (balance.md §4a "Statuses"): 80 − 2 a level above − resistance + 2 × CHA modifier, never under 40, × kind */
export function statusLand(s) {
  let p = 80 - 2 * Math.max(0, s.lvlGap || 0) - (s.res || 0) + 2 * (s.cha || 0);
  p = Math.max(40, p);
  p *= s.kind === 'boss' ? 0.5 : s.kind === 'elite' ? 0.8 : 1;
  return tilt(Math.min(1, p / 100), s.luck || 0);
}

/* ---------------------------------------------------------------- crits (balance.md §4a): base 8%, ×1.5; position and luck paid by value (P22)
   c: {base (default .08, plus bought crit chance), D (crit multiplier), beta (normal hit), flank, unseen, unaware, luck}            */
export const CRIT = 0.08,
  CRIT_MUL = 1.5;
export function critChance(c) {
  const D = c.D || CRIT_MUL,
    beta = c.beta == null ? 1 : c.beta,
    base = c.base == null ? CRIT : c.base;
  const pos = (c.flank ? 0.15 : 0) + (c.unseen ? 0.1 : 0) + (c.unaware ? 0.1 : 0);
  const scale = (CRIT_MUL - 1) / Math.max(CRIT_MUL - 1, D - beta); // a bonus is worth to a build what it is worth at ×1.5
  let p = base + pos * scale;
  if (c.luck) {
    const g = tilt(CRIT, c.luck) - CRIT;
    p += g * scale;
  }
  return Math.min(1, Math.max(0, p));
}

/* ---------------------------------------------------------------- scores, Balance (balance.md §3) */
export const SCORES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
export const modOf = v => Math.floor((v - 10) / 2);
export function balanceOf(sc) {
  const v = SCORES.map(k => sc[k]),
    mu = v.reduce((a, b) => a + b, 0) / 6,
    sg = Math.sqrt(v.reduce((a, b) => a + (b - mu) ** 2, 0) / 6);
  return Math.max(0, 1 - sg / mu);
}
export const mbar = sc => SCORES.reduce((a, k) => a + modOf(sc[k]), 0) / 6;

/* ---------------------------------------------------------------- the timeline (systems.md §1): charge time */
export const rateOf = init => 90 + init;
/* advance the clock one tick; returns the units that act this tick, in order (highest charge first; pack before foes; then the order
   they joined the fight, `seat`, never the position: systems.md §1) */
export function tick(units) {
  units.forEach(u => {
    if (u.hp > 0) u.ct = (u.ct || 0) + rateOf(u.init == null ? 10 : u.init);
  });
  const out = [];
  for (;;) {
    const ready = units
      .filter(u => u.hp > 0 && u.ct >= 100)
      .sort((a, b) => b.ct - a.ct || a.side - b.side || (a.seat || 0) - (b.seat || 0) || (a.id || 0) - (b.id || 0));
    if (!ready.length) break;
    ready.forEach(u => {
      u.ct -= 100;
      out.push(u);
    });
  }
  return out;
}
/* the next n turns, without changing anything (the turn-order bar) */
export function preview(units, n) {
  const c = units.map(u => Object.assign({}, u)),
    out = [];
  for (let t = 0; t < 1000 && out.length < n; t++) tick(c).forEach(u => out.push(u.id));
  return out.slice(0, n);
}

/* ---------------------------------------------------------------- morale (balance.md §3, corruption.md §1) */
export const moraleP = M => Math.abs(M) / (Math.abs(M) + 6);
export const packMorale = (bondMean, leadership, corrMean) => bondMean + (leadership || 0) / 5 - (corrMean || 0) / 10;
export const STREAK_MAX = 3;
/* the bond factor on foes (P24): the curve expects the pack's bond */
export const bondExpected = L => (5 * (L - 1)) / 29;
export const bondFactor = L => {
  const b = bondExpected(L);
  return 1 + (0.5 * b) / (b + 6);
};

/* ---------------------------------------------------------------- the AP economy (balance.md §3, items.md §2) */
export const AP_BASE = 2,
  QUICK_MUL = 1 / (1 + 0.6 * 0.96);
/* what a basic attack costs: 'end' for most weapons, 1 for quick ones, 2 for heavy ones */
export const attackCost = fam => (fam && fam.quick ? 1 : fam && fam.heavy ? 2 : 'end');

/* ---------------------------------------------------------------- burn and poison (balance.md §4a) */
export const DOT = {burn: {share: 1 / 16, weaken: 0.25}, poison: {share: 1 / 8, weaken: 0}};
export const dotAmount = (kind, targetMax, stdFoeHp, resisted) => DOT[kind].share * Math.min(targetMax, stdFoeHp) * (resisted ? 0.5 : 1);

/* ---------------------------------------------------------------- threat: who a foe goes for (balance.md §3) */
export function pickByThreat(list, r) {
  const w = list.map(u => Math.max(0, u.threat == null ? 1 : u.threat)),
    tw = w.reduce((a, b) => a + b, 0);
  let x = r * tw;
  for (let i = 0; i < list.length; i++) {
    x -= w[i];
    if (x <= 0) return list[i];
  }
  return list[list.length - 1];
}

/* ---------------------------------------------------------------- dark versions (corruption.md): ×1.25, ×1.4 from 50; +1 a cast */
export const darkMul = corruption => (corruption >= 50 ? 1.4 : 1.25);
