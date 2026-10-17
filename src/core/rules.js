/* Quest rules: the small language the dialogue and quest tables are written in.

   Conditions ("if"): an object; every key must hold.
     {q1:0}                 quest flag equals
     {kills:{lt:5}}         lt lte gt gte ne
     {gold:{gte:10}}        gold, party (party size), mat.spore (materials), lvl (Pip's level) also work
     {any:[{...},{...}]}    either one
     a function (s,q)=>bool for anything else
   Effects ("now", "then", or a choice's "do"): an object, applied in this order
     set:{flag:v}  add:{flag:n}  gold:n  bag:{ether:2}  item:'cap_cone'  mat:{spore:-3}  xp:n
     join:{name,cls,min} (waits at the inn if the party is full)  heal:true  save:true  open:'shop'|'smith'|'letter'|'roster'  fight:[keys,opt]  toast:'text'
   A line can be {who,text} to have someone else say it (Pip thinking aloud).
   Text: "{kills}" fills in a quest flag, "{up}" becomes " · level up!" when the effects levelled someone up. */
import {rpSave} from './save.js';
import {rp} from './state.js';
import {rpSay,rpToast} from '../game/dialogue.js';
import {rpMats} from '../game/gear.js';
import {rpGive} from '../game/items.js';
import {rpHealAll,rpOpenShop,rpOpenSmith} from '../game/npcs.js';
import {rpGiveXp,rpMember} from '../game/stats.js';
import {rpFight} from '../net/lobby.js';
import {rpOpenLetter} from '../net/mail.js';
import {rpJoinRoster,rpOpenRoster} from '../ui/roster.js';

const OPS={lt:(a,b)=>a<b,lte:(a,b)=>a<=b,gt:(a,b)=>a>b,gte:(a,b)=>a>=b,ne:(a,b)=>a!==b};
function value(k){const s=rp.s,q=s.q;
  if(k==='gold')return s.gold;if(k==='party')return s.party.length;if(k==='lvl')return s.party[0].lvl;
  if(k.startsWith('mat.'))return rpMats()[k.slice(4)]||0;return q[k]||0}
function test(c){if(!c)return true;if(typeof c==='function')return !!c(rp.s,rp.s.q);
  for(const k in c){const want=c[k];
    if(k==='any'){if(!want.some(test))return false;continue}
    const v=value(k);
    if(want&&typeof want==='object'){for(const op in want)if(!OPS[op](v,want[op]))return false}
    else if(v!==want)return false}
  return true}
function fill(t,ctx){return String(t).replace(/\{(\w+(?:\.\w+)?)\}/g,(m,k)=>k==='up'?(ctx&&ctx.ups&&ctx.ups.length?' · level up!':''):String(value(k)))}
const EFFECTS={
  set:o=>Object.assign(rp.s.q,o),
  add:o=>{for(const k in o)rp.s.q[k]=(rp.s.q[k]||0)+o[k]},
  gold:n=>{rp.s.gold+=n},
  bag:o=>{for(const k in o)rp.s.bag[k]=(rp.s.bag[k]||0)+o[k]},
  item:id=>rpGive(id),
  mat:o=>{const m=rpMats();for(const k in o)m[k]=(m[k]||0)+o[k]},
  xp:(n,ctx)=>{ctx.ups=(ctx.ups||[]).concat(rpGiveXp(n))},
  join:j=>{const s=rp.s;if(s.party.concat(s.roster||[]).some(m=>m.name===j.name))return;rpJoinRoster(rpMember(j.name,j.cls,Math.max(j.min||1,s.party[0].lvl)))},
  heal:()=>rpHealAll(),
  save:()=>rpSave(),
  open:w=>{if(w==='shop')rpOpenShop();else if(w==='smith')rpOpenSmith();else if(w==='letter')rpOpenLetter();else if(w==='roster')rpOpenRoster()},
  fight:([keys,opt])=>rpFight(keys,opt),
  toast:(t,ctx)=>rpToast(fill(t,ctx))};
const ORDER=['set','add','gold','bag','item','mat','xp','join','heal','save','toast','open','fight'];
function run(fx,ctx){ctx=ctx||{};if(!fx)return ctx;if(typeof fx==='function'){fx(rp.s,rp.s.q);return ctx}
  for(const k of ORDER)if(fx[k]!==undefined)EFFECTS[k](fx[k],ctx);return ctx}
/* run one NPC's rule list: the first rule whose condition holds speaks */
function talk(rules,who){
  const r=rules.find(r=>test(r.if));if(!r)return false;
  const ctx=run(r.now);
  if(!r.say){run(r.then,ctx);return true}
  const lines=r.say.map(t=>typeof t==='string'?{who:r.who||who,text:fill(t,ctx)}:{who:t.who,text:fill(t.text,ctx)});
  const choices=r.ask&&r.ask.map(c=>({t:c.t,ok:c.if?()=>test(c.if):null,fn:c.do?()=>run(c.do):null}));
  rpSay(lines,choices||null,r.then?()=>run(r.then,ctx):null);
  return true}
export {EFFECTS,OPS,ORDER,fill,run,talk,test,value};
