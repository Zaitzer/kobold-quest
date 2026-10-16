import {rp} from '../core/state.js';
import {RP_CLS,RP_SK} from '../data/classes.js';
import {RP_IT,RP_LOOT,RP_W} from '../data/items.js';
import {sfx} from '../engine/audio.js';
import {pick} from '../engine/util.js';
import {rpSetDesc} from './gear.js';
import {rpSkills,rpStats} from './stats.js';
function rpGive(id){rp.s.inv.push(id)}
function rpCanEquip(m,id){const it=RP_IT[id];return !!it&&(!it.cls||it.cls.includes(m.cls))}
function rpEquip(mi,id,slot){
  const s=rp.s,m=s.party[mi],it=RP_IT[id];if(!m||!it||!rpCanEquip(m,id))return false;
  const i=s.inv.indexOf(id);if(i<0)return false;
  if(it.slot==='weapon'){s.inv.splice(i,1);s.inv.push('w_'+m.w);m.w=it.w}
  else{let sl=it.slot==='ring'?(slot==='ring1'||slot==='ring2'?slot:(!m.eq.ring1?'ring1':!m.eq.ring2?'ring2':'ring1')):it.slot;
    s.inv.splice(i,1);if(m.eq[sl])s.inv.push(m.eq[sl]);m.eq[sl]=id}
  const st=rpStats(m);m.hp=Math.min(m.hp,st.hp);m.mp=Math.min(m.mp,st.mp);
  if(!rp.headless)sfx('drop');return true;
}
function rpUnequip(mi,slot){const m=rp.s.party[mi];if(!m||slot==='weapon'||!m.eq[slot])return false;rp.s.inv.push(m.eq[slot]);delete m.eq[slot];const st=rpStats(m);m.hp=Math.min(m.hp,st.hp);m.mp=Math.min(m.mp,st.mp);if(!rp.headless)sfx('pop');return true}
function rpItemDesc(id){const it=RP_IT[id];if(!it)return'';const S=it.st||{},P=it.pas||{},parts=[];
  const lab={atk:'Attack',def:'Defence',spd:'Speed',hp:'Health',mp:'Mana',sight:'Sight'};
  if(it.w){parts.push('Power '+RP_W[it.w].pow);parts.push('Skills: '+rpSkills(it.w).map(k=>RP_SK[k].n).join(', '))}
  for(const k in lab)if(S[k])parts.push((S[k]>0?'+':'')+S[k]+' '+lab[k]);
  if(P.crit)parts.push('+'+Math.round(P.crit*100)+'% crits');if(P.dodge)parts.push(Math.round(P.dodge*100)+'% dodge');if(P.regen)parts.push('regain '+Math.round(P.regen*100)+'% health a turn');if(P.stealth)parts.push('hard to spot');
  if(it.cls)parts.push(it.cls.map(c=>RP_CLS[c].n).join('/')+' only');
  {const sd=rpSetDesc(id);if(sd)parts.push(sd)}
  return parts.join(' · ');
}
function rpLootRoll(zone,chance){const L=RP_LOOT[zone];if(!L||Math.random()>chance)return null;return pick(L)}
export {rpCanEquip,rpEquip,rpGive,rpItemDesc,rpLootRoll,rpUnequip};
