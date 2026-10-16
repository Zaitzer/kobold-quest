import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {RP_AFFIX,RP_MATS,RP_PRE,RP_RECIPES,RP_REFORGE_G,RP_SETS,RP_SUF,RP_ZONEMAT} from '../data/gear.js';
import {RP_IT,RP_IT_BASE} from '../data/items.js';
import {sfx} from '../engine/audio.js';
import {esc2,pick} from '../engine/util.js';
import {rpToast} from './dialogue.js';
import {rpGive} from './items.js';
const rpAffCache=new Map();
function rpAffixed(id){
  if(rpAffCache.has(id))return rpAffCache.get(id);
  const [base,...aff]=id.split('#'),B=RP_IT_BASE[base];if(!B)return undefined;
  const st=Object.assign({},B.st),pas=Object.assign({},B.pas||{});let pre='',suf='';
  aff.forEach(a=>{const A=RP_AFFIX[a];if(!A)return;for(const k in A.st||{})st[k]=(st[k]||0)+A.st[k];for(const k in A.pas||{})pas[k]=(pas[k]||0)+A.pas[k];if(A.pre)pre=A.n+' ';else suf=' '+A.n});
  const it=Object.assign({},B,{n:pre+B.n+suf,st,pas,base,aff,price:Math.round((B.price||60)*(1+.4*aff.length))});
  rpAffCache.set(id,it);return it;
}
const rpBase=id=>String(id).split('#')[0];
function rpRollAffix(id){const it=RP_IT[id];if(!it||it.slot==='weapon'||it.rare||String(id).includes('#'))return id;
  const r=Math.random();if(r<.6)return id;
  if(r<.88)return id+'#'+(Math.random()<.5?pick(RP_PRE):pick(RP_SUF));
  return id+'#'+pick(RP_PRE)+'#'+pick(RP_SUF)}
function rpItemTone(id){return String(id).includes('#')?' mg':rpSetOf(rpBase(id))?' set':''}
function rpSetOf(base){for(const k in RP_SETS)if(RP_SETS[k].pc.includes(base))return k;return null}
function rpWornBases(m){return Object.values(m.eq||{}).map(rpBase)}
function rpSetsOn(m){const w=rpWornBases(m);return Object.values(RP_SETS).filter(S=>S.pc.every(p=>w.includes(p)))}
function rpSetLine(m){const w=rpWornBases(m),parts=[];
  for(const k in RP_SETS){const S=RP_SETS[k],n=S.pc.filter(p=>w.includes(p)).length;if(n)parts.push('<span class="hh-set'+(n===S.pc.length?' on':'')+'" title="'+esc2(S.d)+'">'+S.n+' '+n+'/'+S.pc.length+(n===S.pc.length?' ✦':'')+'</span>')}
  return parts.length?'<div class="hh-sets">'+parts.join('')+'</div>':''}
function rpSetDesc(id){const k=rpSetOf(rpBase(id));if(!k)return'';const S=RP_SETS[k];return 'Set: '+S.n+' (wear all '+S.pc.length+': '+S.d+')'}
function rpMats(){const s=rp.s;if(!s.mats)s.mats={moss:0,shard:0,spore:0,scrap:0,fang:0};return s.mats}
function rpMatsLine(){const M=rpMats();return Object.keys(RP_MATS).map(k=>'<span class="mat" style="--mc:'+RP_MATS[k].c+'">'+RP_MATS[k].n+' ×'+M[k]+'</span>').join('')}
/* called when a battle is won: materials, zone kill counts, bonus rolls on loot */
function rpBattleSpoils(b){
  const s=rp.s,M=rpMats(),got={};
  if(!s.q.kz)s.q.kz={};
  const z=b.zone==='g'?'C':b.zone;
  b.units.forEach(u=>{if(u.side!==1)return;if(z)s.q.kz[z]=(s.q.kz[z]||0)+1;
    const mk=u.E.boss?'fang':RP_ZONEMAT[b.zone];if(!mk)return;const n=u.E.boss?2:Math.random()<.45?1:0;if(n){M[mk]+=n;got[mk]=(got[mk]||0)+n}});
  if(b.boss==='gorb'){M.spore+=2;got.spore=(got.spore||0)+2}
  if(b.boss==='vexx'){M.scrap+=4;got.scrap=(got.scrap||0)+4}
  b.drops=b.drops.map(rpRollAffix);
  return Object.keys(got).map(k=>got[k]+' '+RP_MATS[k].n.toLowerCase()+(got[k]>1?'s':'')).join(', ');
}
function rpCanCraft(R){const M=rpMats();return rp.s.gold>=R.g&&Object.keys(R.m).every(k=>M[k]>=R.m[k])}
function rpCraft(i){const R=RP_RECIPES[i];if(!R||!rpCanCraft(R))return;const M=rpMats();rp.s.gold-=R.g;for(const k in R.m)M[k]-=R.m[k];rpGive(R.it);if(!rp.headless)sfx('win');rpToast(RP_IT[R.it].n+' forged!');rpSave()}
function rpReforgeCost(){const M=rpMats();const have=Object.keys(M).filter(k=>k!=='fang').reduce((a,k)=>a+M[k],0);return have>=3&&rp.s.gold>=RP_REFORGE_G}
function rpReforgeable(){return rp.s.inv.map((id,i)=>({id,i})).filter(o=>{const it=RP_IT[o.id];return it&&it.slot!=='weapon'&&!it.rare})}
function rpReforge(bi){const s=rp.s,id=s.inv[bi],it=RP_IT[id];if(!it||it.slot==='weapon'||it.rare||!rpReforgeCost())return;
  const M=rpMats();for(let n=0;n<3;n++){const k=Object.keys(M).filter(k=>k!=='fang').sort((a,b)=>M[b]-M[a])[0];M[k]--}s.gold-=RP_REFORGE_G;
  const base=rpBase(id),r=Math.random();const nid=r<.55?base+'#'+pick(RP_PRE):r<.8?base+'#'+pick(RP_SUF):base+'#'+pick(RP_PRE)+'#'+pick(RP_SUF);
  s.inv[bi]=nid;if(!rp.headless)sfx('win');rpToast('Clang! It is now '+RP_IT[nid].n+'.');rpSave()}
export {rpAffCache,rpAffixed,rpBase,rpBattleSpoils,rpCanCraft,rpCraft,rpItemTone,rpMats,rpMatsLine,rpReforge,rpReforgeCost,rpReforgeable,rpRollAffix,rpSetDesc,rpSetLine,rpSetOf,rpSetsOn,rpWornBases};
