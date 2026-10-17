/* ---------- jingles for big moments: a new spark, a recruit, a level up ----------
   Watches the save instead of hooking every place that grants these; waits until a battle is over. */
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {sfx} from '../engine/audio.js';

let jLast={s:null,sig:null};
function jingleSig(s){const all=s.party.concat(s.roster||[]);return{sparks:s.q.seals||0,n:all.length,lv:all.reduce((a,m)=>a+m.lvl,0)}}
/* the one jingle to play for a change (the biggest moment wins), or null */
function jingleFor(o,g){return g.sparks>o.sparks?'spark':g.n>o.n?'recruit':g.lv>o.lv?'level':null}
feature({id:'jingles',frame(){const s=rp.s;if(!s||rp.mode==='battle')return;const g=jingleSig(s);
  if(jLast.s!==s){jLast={s,sig:g};return}const k=jingleFor(jLast.sig,g);jLast.sig=g;if(k&&!rp.headless)sfx(k)}});
export {jLast,jingleFor,jingleSig};
