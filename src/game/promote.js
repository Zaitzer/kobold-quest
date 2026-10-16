/* level-up talent choice (the hero picks one of two, like a HoMM3 skill choice) */
import {rpBuzz} from '../core/options.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {RP_ADV,RP_CLS,RP_TAL} from '../data/classes.js';
import {sfx} from '../engine/audio.js';
import {confetti} from '../engine/fx.js';
import {rpToast} from './dialogue.js';
import {rpOffers,rpStats} from './stats.js';

function rpPendingMember(){return rp.s.party.find(m=>m.pend>0)}
function rpPickTalent(i){rpBuzz([25,30,25]);const m=rpPendingMember();if(!m)return;if(!m.offer||!m.offer.length)m.offer=rpOffers(m);const k=m.offer[i];if(!k)return;m.tal.push(k);m.pend--;m.offer=null;
  const st=rpStats(m);m.hp=Math.min(st.hp,m.hp+12);m.mp=Math.min(st.mp,m.mp+4);if(!rp.headless)sfx('win');
  if(!rpPendingMember()){rp.mode='map';rpToast(m.name+' learned '+RP_TAL[m.cls][k].n+'!')}rpSave()}
function rpPickClass(k){const s=rp.s,m=s.party[0],C=RP_CLS[k];if(!C)return;m.cls=k;m.w=C.start;m.tal=[];const st=rpStats(m);m.hp=st.hp;m.mp=st.mp;s.q.cls=1;rp.pk=null;rp.mode='map';rpToast('Pip the '+C.n.toLowerCase()+' sets out!');rpSave()}
function rpPromoteWho(){return rp.s.party.find(m=>m.lvl>=8&&!m.adv)}
function rpPromote(k){const m=rpPromoteWho();if(!m||!RP_ADV[k]||RP_ADV[k].base!==m.cls)return;m.adv=k;const st=rpStats(m);m.hp=st.hp;m.mp=st.mp;rpBuzz([40,40,80]);if(!rp.headless){sfx('win');confetti()}
  rpToast(m.name+' is now a '+RP_ADV[k].n+'!');if(!rpPromoteWho())rp.mode='map';rpSave()}
export {rpPendingMember,rpPickClass,rpPickTalent,rpPromote,rpPromoteWho};
