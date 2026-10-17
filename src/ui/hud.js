import {rpResize} from '../core/layout.js';
import {rpOpt} from '../core/options.js';
import {actions,feature,panels,routes} from '../core/registry.js';
import {rp} from '../core/state.js';
import {RP_CLS} from '../data/classes.js';
import {sfx} from '../engine/audio.js';
import {$,clamp,esc2} from '../engine/util.js';
import {rpActFacing,rpTry} from '../game/move.js';
import {rpQuestLine} from '../game/npcs.js';
import {rpStats} from '../game/stats.js';
import {rpArea} from '../game/world.js';
import {net} from '../net/core.js';
import {netMapRow} from '../net/ui.js';
function rpBar(v,m,col){const p=clamp(v/m*100,0,100);return '<i class="rpbar"><b style="width:'+p.toFixed(0)+'%;background:'+col+'"></b></i>'}
function rpPartyHtml(){return '<div class="rpparty">'+rp.s.party.map(m=>{const st=rpStats(m);return '<div class="rpm'+(m.hp<=0?' down':'')+'"><b>'+esc2(m.name)+' <small>'+RP_CLS[m.cls].n+' '+m.lvl+(m.pend?' ★':'')+'</small></b>'+rpBar(m.hp,st.hp,m.hp>st.hp*.5?'#7ad67a':m.hp>st.hp*.25?'#ffc857':'#ff6b6b')+'<small>HP '+Math.max(0,m.hp)+'/'+st.hp+' · MP '+m.mp+'/'+st.mp+'</small></div>'}).join('')+'</div>'}
function rpUI(force){
  const top=$('rp-top');if(!top||!rp.s)return;
  const s=rp.s,area=rp.mode==='battle'?(rp.bt&&rp.bt.boss?'Boss battle':'Battle'):rpArea(s.x,s.y);
  const tt='<b>'+area+'</b><span>'+Math.floor(s.gold)+' gold</span><span class="rpq">'+rpQuestLine()+'</span>';
  if(top.dataset.h!==tt){top.dataset.h=tt;$('rp-topt').innerHTML=tt}
  {const v=$('v-rpg');v.classList.toggle('lefty',rpOpt.hand==='right');if(v.dataset&&v.dataset.mode!==rp.mode){v.dataset.mode=rp.mode;requestAnimationFrame(rpResize)}}
  /* the side sheet for this mode comes from whichever feature registered it; a panel can decline (null) and the map shows */
  const P=$('rp-panel');let pn=panels[rp.mode],h=pn&&pn.html();
  if(h==null){pn=panels.map;h=pn.html()}
  const sig=rp.mode+'|'+(pn.sig?pn.sig():'');
  /* never rebuild the panel under a thumb that is holding the joystick */
  if(rp.joyP&&rp.mode==='map'&&P.querySelector&&P.querySelector('[data-joy]'))return;
  if(force||sig!==rp.sig){rp.sig=sig;/* keep what the player is typing (chat, a letter) when the sheet redraws */
    const ae=document.activeElement,keep=ae&&ae.id&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)?{id:ae.id,v:ae.value}:null;P.innerHTML=h;if(keep){const i=document.getElementById(keep.id);if(i){i.value=keep.v;i.focus()}}}
}
function rpMenuClick(e){
  const b=e.target.closest&&e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  /* buttons are routed by their data attribute: data-tac, data-net, data-g... go to that feature's handler,
     data-rp="x" goes to the action registered as x. An action returning false redraws by itself. */
  if(!rp.headless&&d.rp!=='next')sfx('tap');
  for(const k in routes)if(d[k]!=null){routes[k](d,b);rpUI(true);return}
  const a=actions[d.rp];if(a&&a(d,b)===false)return;
  rpUI(true);
}
const MAP_PANEL={
  sig:()=>rp.s.party.map(m=>m.hp+'/'+m.mp+'/'+m.lvl).join(',')+'|'+netMapRow(),
  html:()=>netMapRow()+rpPartyHtml()+'<div class="rppad"><div class="rpjoy" data-joy="1" role="application" aria-label="Joystick: drag to walk"><i></i></div>'+
    '<div class="rpside"><button class="pill go big" type="button" data-rp="act">Talk / Use</button><div class="rprow2">'+(net.on?'<button class="pill" type="button" data-net="chat" aria-label="Chat">💬</button>':'')+'<button class="pill" type="button" data-rp="hero">⚔ Gear</button><button class="pill" type="button" data-rp="menu">☰ Menu</button></div><p class="rptip">Hold and drag the joystick to walk. You can also tap a spot on the map.</p></div></div>'};
feature({id:'hud',panels:{map:MAP_PANEL},routes:{dir:d=>rpTry(d.dir)},actions:{act:()=>rpActFacing()}});
export {MAP_PANEL,rpBar,rpMenuClick,rpPartyHtml,rpUI};
