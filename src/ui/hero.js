/* ---------- hero screen in the style of Heroes of Might and Magic 3 ---------- */
import {rpMoveOf} from '../battle/rules.js';
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {RP_ADV,RP_CLS,RP_SK,RP_TAL} from '../data/classes.js';
import {RP_IT,RP_SLOTNAME,RP_SLOTS9} from '../data/items.js';
import {ctx,drawKobold,makeK,set_ctx} from '../engine/art.js';
import {artName} from '../engine/sprites.js';
import {$,esc2} from '../engine/util.js';
import {rpItemTone,rpSetLine} from '../game/gear.js';
import {rpCanEquip,rpEquip,rpItemDesc,rpUnequip} from '../game/items.js';
import {rpHat,rpMemSkills,rpStats,rpXpNeed} from '../game/stats.js';
import {rpIcon} from '../render/icons.js';
import {rpBar,rpUI} from './hud.js';

const RP_DOLL={head:[41,1],neck:[68,12],cloak:[14,12],weapon:[1,40],shield:[81,40],armor:[41,46],ring1:[4,70],ring2:[78,70],boots:[41,80]};
function rpHeroOpen(mi){rp.mode='hero';rp.hero.mi=mi||0;rp.hero.sel=null;rp.hero.page=0;rpHeroRender()}
function rpHeroClose(){rp.mode='map';$('rp-hero').hidden=true;rpSave();rpUI(true)}
function rpHeroSlotFor(m,id){const it=RP_IT[id];if(!it)return[];if(it.slot==='ring')return['ring1','ring2'];return[it.slot]}
function rpHeroRender(){
  const el=$('rp-hero');if(!el||!rp.s)return;el.hidden=false;
  const s=rp.s,H=rp.hero,m=s.party[H.mi]||s.party[0],st=rpStats(m),C=RP_CLS[m.cls];
  const selId=H.sel&&(H.sel.bag!=null?s.inv[H.sel.bag]:H.sel.slot==='weapon'?'w_'+m.w:m.eq[H.sel.slot]);
  const glow=H.sel&&H.sel.bag!=null&&selId&&rpCanEquip(m,selId)?rpHeroSlotFor(m,selId):[];
  let h='<div class="hh-tabs">'+s.party.map((p,i)=>'<button type="button" class="hh-tab'+(i===H.mi?' on':'')+'" data-hh="tab" data-i="'+i+'">'+esc2(p.name)+'<small>'+RP_CLS[p.cls].n+' '+p.lvl+'</small></button>').join('')+'<button type="button" class="hh-x" data-hh="close">Done</button></div>';
  h+='<div class="hh-main"><div class="hh-doll"><canvas class="hh-por" id="hh-por"></canvas>';
  RP_SLOTS9.forEach(sl=>{const id=sl==='weapon'?'w_'+m.w:m.eq[sl],[x,y]=RP_DOLL[sl];
    h+='<div class="hh-slot'+(id?' full'+rpItemTone(id):'')+(glow.includes(sl)?' glow':'')+(H.sel&&H.sel.slot===sl?' sel':'')+'" style="left:'+x+'%;top:'+y+'%" data-slot="'+sl+'" role="button" tabindex="0" aria-label="'+RP_SLOTNAME[sl]+(id?': '+RP_IT[id].n:', empty')+'">'+(id?'<canvas data-icon="'+id+'"></canvas>':'<span>'+RP_SLOTNAME[sl]+'</span>')+'</div>'});
  h+='</div><div class="hh-side"><div class="hh-cls"><b>'+(m.adv?RP_ADV[m.adv].n:C.n)+'</b> · Level '+m.lvl+(m.adv?' <small>('+C.n+')</small>':'')+'</div>'+rpSetLine(m)+'<div class="hh-xp">'+rpBar(m.xp,rpXpNeed(m.lvl),'#ffd54a')+'<small>XP '+m.xp+'/'+rpXpNeed(m.lvl)+'</small></div>'+
    '<div class="hh-stats">'+[['⚔','Attack',Math.round(st.atk)],['🛡','Defence',Math.round(st.def*10)/10],['➶','Speed',Math.round(st.spd*10)/10],['♥','Health',m.hp+'/'+st.hp],['✦','Mana',m.mp+'/'+st.mp],['✸','Crit',Math.round(st.crit*100)+'%'],['👣','Move',rpMoveOf(m)+' tiles'],['👁','Sight',(7+(st.sight||0))+' tiles']].map(([i,n,v])=>'<div><i>'+i+'</i><span>'+n+'</span><b>'+v+'</b></div>').join('')+'</div>'+
    '<div class="hh-tal"><small>Skills</small>'+rpMemSkills(m).map(k=>'<span class="chip" title="'+esc2(RP_SK[k].d)+'">'+RP_SK[k].n+'</span>').join('')+'</div>'+
    '<div class="hh-tal"><small>Talents</small>'+(m.tal.length?m.tal.map(t=>{const T=RP_TAL[m.cls][t];return '<span class="chip" title="'+esc2(T.d)+'">'+T.n+'</span>'}).join(''):'<span class="chip">none yet</span>')+'</div></div></div>';
  const info=selId?'<b>'+esc2(RP_IT[selId].n)+'</b> '+rpItemDesc(selId)+(H.sel.bag!=null?(rpCanEquip(m,selId)?' · tap a glowing slot to equip':' · '+m.name+' can\'t use this'):(H.sel.slot!=='weapon'?' · tap the backpack to take it off':' · swap weapons from the backpack')):'Tap or drag items between the backpack and the slots. Each kobold has their own gear.';
  h+='<div class="hh-info">'+info+'</div>';
  const per=8,pages=Math.max(1,Math.ceil(s.inv.length/per));H.page=Math.min(H.page,pages-1);
  h+='<div class="hh-bag"><button type="button" class="hh-arr" data-hh="prev"'+(H.page<=0?' disabled':'')+'>◀</button><div class="hh-cells" data-bagzone="1">';
  for(let i=0;i<per;i++){const bi=H.page*per+i,id=s.inv[bi];h+='<div class="hh-cell'+(id?' full'+rpItemTone(id):'')+(H.sel&&H.sel.bag===bi?' sel':'')+(id&&!rpCanEquip(m,id)?' no':'')+'" data-bag="'+(id?bi:'')+'" role="button" tabindex="0" aria-label="'+(id?RP_IT[id].n:'empty')+'">'+(id?'<canvas data-icon="'+id+'"></canvas>':'')+'</div>'}
  h+='</div><button type="button" class="hh-arr" data-hh="next"'+(H.page>=pages-1?' disabled':'')+'>▶</button></div>';
  el.innerHTML=h;
  el.querySelectorAll('canvas[data-icon]').forEach(c=>rpIcon(c,c.dataset.icon,c.closest('.hh-slot')?44:38));
  const por=$('hh-por');if(por&&por.getContext){const sz=por.clientWidth||160,d=Math.min(2,window.devicePixelRatio||1);por.width=sz*d;por.height=sz*d;const g=por.getContext('2d');
    if(g.setTransform){const main=ctx;set_ctx(g);g.setTransform(d*sz/100,0,0,d*sz/100,0,0);const k=makeK({team:0,name:m.name,art:artName(m.name),weapon:m.w,hat:rpHat(m),pers:'brave',speed:1,hp:30,size:1.15},50,92,false);k.face=1;k.wa=.35;
      g.fillStyle='rgba(255,215,90,.12)';g.beginPath();g.ellipse(50,92,34,9,0,0,7);g.fill();drawKobold(k);set_ctx(main)}}
}
function rpHeroAct(target){
  const s=rp.s,H=rp.hero,m=s.party[H.mi];if(!m)return;
  if(target.slot){
    if(H.sel&&H.sel.bag!=null){const id=s.inv[H.sel.bag];if(rpHeroSlotFor(m,id).includes(target.slot)&&rpEquip(H.mi,id,target.slot)){H.sel=null;rpHeroRender();return}}
    const has=target.slot==='weapon'||m.eq[target.slot];H.sel=has?(H.sel&&H.sel.slot===target.slot?null:{slot:target.slot}):null;rpHeroRender();return}
  if(target.bag!=null){
    if(H.sel&&H.sel.slot&&H.sel.slot!=='weapon'){rpUnequip(H.mi,H.sel.slot);H.sel=null;rpHeroRender();return}
    if(target.bag==='')H.sel=null;else{const bi=+target.bag;H.sel=H.sel&&H.sel.bag===bi?null:{bag:bi}}rpHeroRender();return}
}
function rpHeroDrop(from,toEl){
  const s=rp.s,H=rp.hero,m=s.party[H.mi];if(!toEl)return;
  const slot=toEl.closest('[data-slot]'),bag=toEl.closest('[data-bagzone]'),tab=toEl.closest('[data-hh="tab"]');
  if(from.bag!=null&&tab){const ti=+tab.dataset.i;const id=s.inv[from.bag];H.mi=ti;H.sel=null;const mm=s.party[ti];if(rpCanEquip(mm,id))rpEquip(ti,id);rpHeroRender();return}
  if(from.bag!=null&&slot){const id=s.inv[from.bag];if(rpHeroSlotFor(m,id).includes(slot.dataset.slot))rpEquip(H.mi,id,slot.dataset.slot);H.sel=null;rpHeroRender();return}
  if(from.slot&&bag&&from.slot!=='weapon'){rpUnequip(H.mi,from.slot);H.sel=null;rpHeroRender();return}
  if(from.slot&&slot&&from.slot!==slot.dataset.slot&&from.slot.startsWith('ring')&&slot.dataset.slot.startsWith('ring')){const a=m.eq[from.slot];m.eq[from.slot]=m.eq[slot.dataset.slot];m.eq[slot.dataset.slot]=a;if(!m.eq[from.slot])delete m.eq[from.slot];rpHeroRender()}
}
feature({id:'ui-hero',init(){
rp.hero={mi:0,sel:null,page:0,drag:null};
(function(){
  const el=$('rp-hero');if(!el)return;
  el.addEventListener('click',e=>{
    if(rp.hero.dragged){rp.hero.dragged=false;return}
    const b=e.target.closest&&e.target.closest('[data-hh]');
    if(b){const a=b.dataset.hh;if(a==='close')return rpHeroClose();if(a==='tab'){rp.hero.mi=+b.dataset.i;rp.hero.sel=null}if(a==='prev')rp.hero.page--;if(a==='next')rp.hero.page++;rpHeroRender();return}
    const sl=e.target.closest&&e.target.closest('[data-slot]');if(sl)return rpHeroAct({slot:sl.dataset.slot});
    const bg=e.target.closest&&e.target.closest('[data-bag]');if(bg)return rpHeroAct({bag:bg.dataset.bag});
    const bz=e.target.closest&&e.target.closest('[data-bagzone]');if(bz)return rpHeroAct({bag:''});
  });
  el.addEventListener('pointerdown',e=>{
    const sl=e.target.closest&&e.target.closest('.hh-slot.full'),bg=e.target.closest&&e.target.closest('.hh-cell.full');if(!sl&&!bg)return;
    const src=sl||bg,from=sl?{slot:sl.dataset.slot}:{bag:+bg.dataset.bag};
    rp.hero.drag={from,x:e.clientX,y:e.clientY,src,ghost:null};
  });
  window.addEventListener('pointermove',e=>{const D=rp.hero.drag;if(!D)return;
    if(!D.ghost){if(Math.hypot(e.clientX-D.x,e.clientY-D.y)<8)return;const c=D.src.querySelector('canvas');if(!c)return;
      const g=document.createElement('canvas');rpIcon(g,c.dataset.icon,48);g.className='hh-ghost';document.body.appendChild(g);D.ghost=g;D.src.classList.add('dragging')}
    D.ghost.style.left=(e.clientX-24)+'px';D.ghost.style.top=(e.clientY-24)+'px';e.preventDefault()});
  window.addEventListener('pointerup',e=>{const D=rp.hero.drag;if(!D)return;rp.hero.drag=null;
    if(D.ghost){D.ghost.remove();rp.hero.dragged=true;setTimeout(()=>{rp.hero.dragged=false},50);const t=document.elementFromPoint(e.clientX,e.clientY);rpHeroDrop(D.from,t)}});
  el.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-slot],[data-bag]')){e.preventDefault();e.target.click()}if(e.key==='Escape')rpHeroClose()});
})();
}});

feature({id:'hero-panel',panels:{hero:{sig:()=>'hero',html:()=>'<p class="tdhint">Equipping…</p>'}},actions:{hero:()=>{rpHeroOpen(0);return false}}});
export {RP_DOLL,rpHeroAct,rpHeroClose,rpHeroDrop,rpHeroOpen,rpHeroRender,rpHeroSlotFor};
