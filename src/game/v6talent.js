/* ---------- Kobold Quest v6: talents, the subclass, the kit, dark versions, Pip's leader points (build step 7) ----------
   skills.md §1–2 (one pick a level from level 2, three cards, one of each kind; the subclass at 8 with skills at 8 and 16;
   four skills equipped, changed at rest), corruption.md §1 (dark versions unlock at corruption 10 / 25 / 50, swapped like any
   skill), balance.md §3 (Pip: one leader point every second level, in Might, Wits or Leadership). */
import {SCORES} from '../battle/v6rules.js';
import {rp} from '../core/state.js';
import {KITS6,PASSIVES6,SKILLS6} from '../data/v6/skills.js';
import {v6Stats} from './v6sheet.js';

const V6_EQUIP=4,V6_RANK_MAX=3,V6_SUB_LVL=[8,16];
/* the skills a kobold knows: its start, the talent skills it picked, its subclass skills */
function v6Known(m){if(!m.known)m.known=(m.skills||[]).slice();return m.known}
function v6IsSub(id){const S=SKILLS6[id];return!!(S&&S.sub)}
/* a level: one pick from level 2 (skills.md §2), HP and mana grow in proportion, subclass skills arrive */
function v6LevelUp(m){const a=v6Stats(m);m.lvl++;if(m.lvl>=2)m.pend=(m.pend||0)+1;v6SubGrant(m);const z=v6Stats(m);
  m.hp=Math.max(1,Math.round((m.hp/a.hp)*z.hp));m.mp=Math.round(((m.mp||0)/Math.max(1,a.mp))*z.mp);return m}
function v6SubGrant(m){if(!m.sub)return;const S=KITS6[m.cls].subs[m.sub];if(!S)return;const k=v6Known(m);
  V6_SUB_LVL.forEach((L,i)=>{const id=S.skills[i];if(id&&m.lvl>=L&&!k.includes(id)){k.push(id);if((m.skills||[]).length<V6_EQUIP)m.skills.push(id)}})}
function v6SubOptions(m){const K=KITS6[m.cls];return m.lvl>=8&&!m.sub&&K?Object.keys(K.subs):[]}
function v6ChooseSub(m,name){if(!v6SubOptions(m).includes(name))return false;m.sub=name;v6SubGrant(m);return true}
/* the three cards (skills.md §2): a score, a skill (or a rank when none is waiting), a class passive */
function v6Cards(m){if(!(m.pend>0))return null;const K=KITS6[m.cls],k=v6Known(m),sc=m.scores;
  const score={k:'score',opts:m.cls==='monk'?[SCORES.slice().sort((a,b)=>sc[a]-sc[b])[0]]:SCORES.filter(s=>sc[s]<20)};
  const next=K.talents.find(t=>t.lvl<=m.lvl&&!k.includes(t.id));
  const skill=next?{k:'skill',opts:[next.id]}:{k:'rank',opts:k.filter(id=>SKILLS6[id]&&((m.ranks||{})[id]||1)<V6_RANK_MAX)};
  const passive={k:'passive',opts:(PASSIVES6[m.cls]||[]).map(p=>p.n)};
  return[score,skill,passive].filter(c=>c.opts.length)}
function v6Pick(m,kind,choice){const c=(v6Cards(m)||[]).find(c=>c.k===kind);if(!c||!c.opts.includes(choice))return false;
  if(kind==='score')m.scores[choice]++;
  else if(kind==='skill'){v6Known(m).push(choice);m.skills=m.skills||[];if(m.skills.length<V6_EQUIP)m.skills.push(choice)}
  else if(kind==='rank'){m.ranks=m.ranks||{};m.ranks[choice]=(m.ranks[choice]||1)+1}
  else if(kind==='passive')(m.passives=m.passives||[]).push(choice);
  m.pend--;const st=v6Stats(m);m.hp=Math.min(m.hp,st.hp);return true}
/* the kit: four equipped, changed only at rest (a fountain, an inn, a campfire; the fight lab counts as rest) */
function v6AtRest(){return!rp.bt}
function v6Equip(m,id){if(!v6AtRest()||!v6Known(m).includes(id))return false;m.skills=m.skills||[];const i=m.skills.indexOf(id);
  if(i>=0){m.skills.splice(i,1);return true}if(m.skills.length>=V6_EQUIP)return false;m.skills.push(id);return true}
/* dark versions: the class's own skills from corruption 10, the subclass's from 25 (corruption.md §1) */
function v6DarkOpen(m,id){const S=SKILLS6[id];return!!(S&&S.dark&&(m.corr||0)>=(v6IsSub(id)?25:10))}
function v6ToggleDark(m,id){if(!v6AtRest()||!v6DarkOpen(m,id))return false;m.dark=m.dark||{};if(m.dark[id])delete m.dark[id];else m.dark[id]=1;return true}
/* Pip's leader points: one every second level (15 by level 30) */
const v6LeadTotal=m=>m&&m.hero?Math.floor(m.lvl/2):0;
function v6LeadFree(m){const L=m.lead||{};return v6LeadTotal(m)-(L.might||0)-(L.wits||0)-(L.lead||0)}
function v6LeadAdd(m,k){if(!['might','wits','lead'].includes(k)||v6LeadFree(m)<1)return false;m.lead=Object.assign({might:0,wits:0,lead:0},m.lead);m.lead[k]++;return true}
export {V6_EQUIP,V6_RANK_MAX,V6_SUB_LVL,v6AtRest,v6Cards,v6ChooseSub,v6DarkOpen,v6Equip,v6IsSub,v6Known,v6LeadAdd,v6LeadFree,v6LeadTotal,v6LevelUp,v6Pick,v6SubGrant,v6SubOptions,v6ToggleDark};
