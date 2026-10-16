import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {RP_ADV,RP_CLS,RP_TAL} from '../data/classes.js';
import {RP_MATS,RP_RECIPES} from '../data/gear.js';
import {RP_IT} from '../data/items.js';
import {WEAPONS} from '../engine/art.js';
import {esc2} from '../engine/util.js';
import {rpCanCraft,rpCraft,rpItemTone,rpMats,rpMatsLine,rpReforge,rpReforgeCost,rpReforgeable,rpSetOf} from '../game/gear.js';
import {rpItemDesc} from '../game/items.js';
import {rpPendingMember,rpPickClass,rpPickTalent,rpPromote,rpPromoteWho} from '../game/promote.js';
import {rpOffers} from '../game/stats.js';
import {rpPartyHtml} from './hud.js';
function rpLevelUpHtml(){
  const m=rpPendingMember();if(!m)return'';if(!m.offer||!m.offer.length)m.offer=rpOffers(m);
  const T=RP_TAL[m.cls];
  return '<div class="rpdlg lvup"><div class="who">Level up!</div><p><b>'+esc2(m.name)+'</b> the '+RP_CLS[m.cls].n.toLowerCase()+' reached level '+(m.lvl-m.pend+1)+'. Choose a talent:</p></div><div class="rpcmd lvl">'+
    m.offer.map((k,i)=>'<button class="rpb '+(T[k].sk?'sk':T[k].pas?'it':'go')+'" type="button" data-rp="talent" data-i="'+i+'"><span class="tic">'+(T[k].sk?'✦':T[k].pas?'❖':'▲')+'</span>'+T[k].n+'<small>'+T[k].d+'</small></button>').join('')+'</div>';
}
/* class choice for Pip at the start */
function rpClassHtml(){return '<div class="rpdlg"><div class="who">Choose Pip\'s class</div><p>Every class grows differently, uses different weapons and learns different talents.</p></div><div class="rpcmd">'+
  Object.keys(RP_CLS).map(k=>{const C=RP_CLS[k];return '<button class="rpb go" type="button" data-rp="cls" data-k="'+k+'">'+C.n+'<small>'+C.d+' Starts with a '+WEAPONS[C.start].n.toLowerCase()+'.</small></button>'}).join('')+'</div>'}
function rpSmithHtml(){
  const s=rp.s,M=rpMats(),hot=s.q.forge;let h='<div class="rpdlg"><div class="who">Clink the smith</div><p>'+(rp.smithRe?'Which piece should get a new bonus? 30 gold and any 3 materials. The old bonus is lost.':'"Bring me monster bits and I\'ll bang them into something nice." You have '+Math.floor(s.gold)+' gold.')+'</p><div class="mats">'+rpMatsLine()+'</div></div><div class="rpcmd shop">';
  if(rp.smithRe){const L=rpReforgeable();h+=L.length?L.map(o=>'<button class="rpb'+rpItemTone(o.id)+'" type="button" data-g="refpick" data-i="'+o.i+'"'+(rpReforgeCost()?'':' disabled')+'>'+esc2(RP_IT[o.id].n)+'<small>'+rpItemDesc(o.id)+'</small></button>').join(''):'<p class="rptip">Nothing in your backpack to reforge. Take gear off in ⚔ Gear first.</p>';
    h+='<button class="rpb x" type="button" data-g="smithback">✕ Back</button></div>';return h}
  h+=RP_RECIPES.map((R,i)=>{const it=RP_IT[R.it];return '<button class="rpb'+(rpSetOf(R.it)?' set':' go')+'" type="button" data-g="craft" data-i="'+i+'"'+(rpCanCraft(R)?'':' disabled')+'>'+it.n+' · '+R.g+'g<small>'+Object.keys(R.m).map(k=>R.m[k]+' '+RP_MATS[k].n.toLowerCase()).join(', ')+' · '+rpItemDesc(R.it)+'</small></button>'}).join('');
  h+='<button class="rpb sk" type="button" data-g="reforge"'+(hot?'':' disabled')+'>Reforge a bonus<small>'+(hot?'30 gold + any 3 materials':'The big forge is cold. Clink needs 3 glow spores to light it.')+'</small></button><button class="rpb x" type="button" data-g="leave">Leave</button></div>';
  return h;
}
function rpPromoteHtml(){const m=rpPromoteWho();if(!m)return'';const opts=Object.keys(RP_ADV).filter(k=>RP_ADV[k].base===m.cls);
  return rpPartyHtml()+'<div class="rpdlg lvup"><div class="who">Promotion!</div><p><b>'+esc2(m.name)+'</b> has mastered the ways of the '+RP_CLS[m.cls].n.toLowerCase()+'. Choose a path. This is for good (the shrine only resets talents).</p></div><div class="rpcmd lvl">'+
    opts.map(k=>'<button class="rpb go" type="button" data-g="promote" data-k="'+k+'"><span class="tic">✦</span>'+RP_ADV[k].n+'<small>'+RP_ADV[k].d+'</small></button>').join('')+'</div>'}
function rpGearBtn(d){
  switch(d.g){
    case 'craft':rpCraft(+d.i);break;case 'reforge':rp.smithRe=true;break;case 'smithback':rp.smithRe=false;break;
    case 'refpick':rpReforge(+d.i);break;case 'leave':rp.mode='map';rp.smithRe=false;rpSave();break;
    case 'promote':rpPromote(d.k);break;
  }
}

feature({id:'sheets',
  panels:{
    levelup:{sig:()=>rp.s.party.map(m=>m.pend+':'+(m.offer||[]).join()).join(),html:()=>rpPartyHtml()+rpLevelUpHtml()},
    class:{html:()=>rpClassHtml()},
    promote:{sig:()=>rp.s.party.map(m=>m.adv).join(),html:()=>rpPromoteHtml()},
    smith:{sig:()=>rp.s.gold+'|'+JSON.stringify(rpMats())+rp.s.inv.join()+rp.smithRe,html:()=>rpSmithHtml()}},
  routes:{g:d=>rpGearBtn(d)},
  actions:{talent:d=>rpPickTalent(+d.i),cls:d=>rpPickClass(d.k)}});
export {rpClassHtml,rpGearBtn,rpLevelUpHtml,rpPromoteHtml,rpSmithHtml};
