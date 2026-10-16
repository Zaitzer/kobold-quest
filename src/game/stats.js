import {rp} from '../core/state.js';
import {RP_ADV,RP_CLS,RP_TAL} from '../data/classes.js';
import {RP_IT,RP_W} from '../data/items.js';
import {WEAPONS} from '../engine/art.js';
import {rpSetsOn} from './gear.js';
function rpSkills(w){const W=WEAPONS[w],R=RP_W[w]||{};let s=[];
  if(w==='healwand')s=['heal'];else if(w==='frostrod')s=['ice'];else if(w==='firewand')s=['fireball'];else if(w==='archstaff')s=['fireball','meteor'];
  else if(W.ranged)s=['volley'];else s=['bonk'];
  return s.concat(R.sk||[]).filter((x,i,a)=>a.indexOf(x)===i)}
/* stats */
function rpClsOfWeapon(w){const W=WEAPONS[w];return w==='healwand'?'cleric':W.magic?'mage':W.ranged?'ranger':'warrior'}
function rpStats(m){
  const C=RP_CLS[m.cls]||RP_CLS.warrior,l=m.lvl-1,R=RP_W[m.w]||{pow:4};
  const st={hp:C.base.hp+C.gr.hp*l,mp:C.base.mp+C.gr.mp*l,atk:C.base.atk+C.gr.atk*l+R.pow,def:C.base.def+C.gr.def*l,spd:C.base.spd+C.gr.spd*l+(R.spd||0),crit:.08,dodge:0,regen:0,mpregen:0,rage:0};
  const add=o=>{if(!o)return;for(const k in o)st[k]=(st[k]||0)+o[k]};
  (m.tal||[]).forEach(t=>{const T=(RP_TAL[m.cls]||{})[t];if(T){add(T.st);add(T.pas)}});
  if(m.eq)for(const s in m.eq){const it=RP_IT[m.eq[s]];if(it){add(it.st);add(it.pas)}}
  if(m.adv&&RP_ADV[m.adv]){const A=RP_ADV[m.adv];add(A.st);add(A.pas);for(const k in A.gr)st[k]+=A.gr[k]*Math.max(0,m.lvl-8)}
  rpSetsOn(m).forEach(S=>{add(S.st);add(S.pas)});
  st.hp=Math.round(st.hp);st.mp=Math.round(st.mp);return st;
}
function rpMemSkills(m){
  const out=(RP_CLS[m.cls]||{sk:[]}).sk.slice();
  rpSkills(m.w).forEach(k=>{if(!out.includes(k))out.push(k)});
  (m.tal||[]).forEach(t=>{const T=(RP_TAL[m.cls]||{})[t];if(T&&T.sk&&!out.includes(T.sk))out.push(T.sk)});
  if(m.adv&&RP_ADV[m.adv]&&!out.includes(RP_ADV[m.adv].sk))out.push(RP_ADV[m.adv].sk);
  return out;
}
function rpHat(m){const h=m.eq&&m.eq.head&&RP_IT[m.eq.head];return h?h.hat:(RP_CLS[m.cls]||{hat:'none'}).hat}
function rpOffers(m){
  const P=RP_TAL[m.cls]||{},ks=Object.keys(P).filter(k=>(P[k].rep||!(m.tal||[]).includes(k))&&(P[k].lvl||0)<=m.lvl);
  const sk=ks.filter(k=>P[k].sk||P[k].pas),rest=ks.filter(k=>!(P[k].sk||P[k].pas));
  const out=[];const take=a=>{if(!a.length)return;const k=a.splice(Math.random()*a.length|0,1)[0];out.push(k)};
  if(Math.random()<.65)take(sk);take(rest);while(out.length<2&&(sk.length||rest.length))take(sk.length?sk:rest);
  return out.slice(0,2);
}
function rpAutoTalents(m,n){for(let i=0;i<n;i++){const o=rpOffers(m);if(o.length)m.tal.push(o[0])}}
function rpMember(name,cls,lvl){
  const C=RP_CLS[cls],m={name,cls,w:C.start,lvl:1,xp:0,hp:0,mp:0,tal:[],eq:{},pend:0,offer:null};
  while(m.lvl<lvl){m.lvl++;rpAutoTalents(m,1)}
  const st=rpStats(m);m.hp=st.hp;m.mp=st.mp;return m;
}
const rpXpNeed=l=>Math.round(12*Math.pow(l,1.6));
/* ---------- side quests ---------- */
function rpGiveXp(n){const s=rp.s,ups=[];s.party.forEach(m=>{m.xp+=n;while(m.xp>=rpXpNeed(m.lvl)){m.xp-=rpXpNeed(m.lvl);m.lvl++;m.pend=(m.pend||0)+1;ups.push(m.name)}});return ups}
export {rpAutoTalents,rpClsOfWeapon,rpGiveXp,rpHat,rpMemSkills,rpMember,rpOffers,rpSkills,rpStats,rpXpNeed};
