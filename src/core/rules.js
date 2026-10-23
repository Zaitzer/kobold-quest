/* Conditions: the small language the story's tables are written in (scenes' "when", NPCs' "show", goals).
     {q1:0}                 a story flag equals
     {kills:{lt:5}}         lt lte gt gte ne
     {gold:{gte:10}}        gold, party (pack size), mat.<name> (materials), lvl (the hero's level) also work
     {any:[{...},{...}]}    either one
     a function (s,q)=>bool for anything else */
import {rp} from './state.js';

const OPS = {lt: (a, b) => a < b, lte: (a, b) => a <= b, gt: (a, b) => a > b, gte: (a, b) => a >= b, ne: (a, b) => a !== b};
function value(k) {
  const s = rp.s,
    q = s.q;
  if (k === 'gold') return s.gold;
  if (k === 'party') return s.party.length;
  if (k === 'lvl') return s.party[0] ? s.party[0].lvl : 1;
  if (k.startsWith('mat.')) return (rp.s.mats6 || {})[k.slice(4)] || 0;
  return q[k] || 0;
}
function test(c) {
  if (!c) return true;
  if (typeof c === 'function') return !!c(rp.s, rp.s.q);
  for (const k in c) {
    const want = c[k];
    if (k === 'any') {
      if (!want.some(test)) return false;
      continue;
    }
    const v = value(k);
    if (want && typeof want === 'object') {
      for (const op in want) if (!OPS[op](v, want[op])) return false;
    } else if (v !== want) return false;
  }
  return true;
}
function fill(t, ctx) {
  return String(t).replace(/\{(\w+(?:\.\w+)?)\}/g, (m, k) =>
    k === 'up' ? (ctx && ctx.ups && ctx.ups.length ? ' · level up!' : '') : String(value(k))
  );
}
export {OPS, fill, test, value};
