/* ---------- Kobold Quest: tactical battles ----------
   Grid board, fog of war, cover, two action points, speed-ordered turns,
   attacks of opportunity, overwatch, hidden enemy pods and a utility AI. */
import {RPH,RPW} from '../core/layout.js';
import {rp} from '../core/state.js';

const TT=40,TVW=9,TVH=11,BVW=TT*TVW,BVH=TT*TVH;
function rpViewW(){return rp.mode==='battle'&&rp.bt?BVW:RPW}
function rpViewH(){return rp.mode==='battle'&&rp.bt?BVH:RPH}
export {BVH,BVW,TT,TVH,TVW,rpViewH,rpViewW};
