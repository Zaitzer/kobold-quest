/* ---------- campfire chats (data/banter.js) ----------
   Every won fight bonds each pair in the party; at an inn, "Sit by the fire" plays the next chat they've unlocked. */
import {feature} from '../core/registry.js';
import {test} from '../core/rules.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {banterNext,bondKey} from '../data/banter.js';
import {rpSay} from './dialogue.js';

function rpBanterNext(){return rp.s?banterNext(rp.s,test):null}
function rpFireside(){const B=rpBanterNext();if(!B){rpSay([{who:'',text:'Everyone stares into the fire. Somebody\'s tummy rumbles.'}]);return}
  rp.s.banter=(rp.s.banter||[]).concat([B.id]);rpSay([{who:'',text:'You sit by the fire. '+B.a+' and '+B.b+' get talking.'}].concat(B.lines.map(l=>({who:l.who,text:l.text}))));rpSave()}
feature({id:'banter',on:{'battle:won'(){const s=rp.s;if(!s)return;const n=s.party.map(m=>m.name);s.bond=s.bond||{};
  for(let i=0;i<n.length;i++)for(let j=i+1;j<n.length;j++){const k=bondKey(n[i],n[j]);s.bond[k]=(s.bond[k]||0)+1}}}});
export {rpBanterNext,rpFireside};
