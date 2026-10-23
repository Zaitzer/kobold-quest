import {rpTacClick} from '../battle/input.js';
import {view} from './app.js';
import {RPH,RPW,RT,rpLayout,rpLoc,rpResize,rpVec,rpcv} from './layout.js';
import {feature} from './registry.js';
import {rp} from './state.js';
import {$} from '../engine/util.js';
import {rpChoose,rpDlgNext} from '../game/dialogue.js';
import {rpTapTile} from '../game/move.js';
import {netSay} from '../net/chat.js';
import {rpMenuClick,rpUI} from '../ui/hud.js';
function rpStickEnd(e){const S=rp.stick;if(!S||(e&&S.id!==e.pointerId))return;if(S.on){rp.held=null;rp.stickUsed=true;setTimeout(()=>{rp.stickUsed=false},0)}rp.stick=null}
const RP_KEYS={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
function rpJoyKnob(dx,dy){const j=document.querySelector?document.querySelector('#rp-panel [data-joy]'):null;if(!j||!j.style)return;j.style.setProperty('--jx',dx+'px');j.style.setProperty('--jy',dy+'px');j.classList.toggle('on',!!(dx||dy))}
function rpJoyMove(e){const P=rp.joyP;if(!P)return;const v=rpVec(e.clientX-P.cx,e.clientY-P.cy);let dx=v.x,dy=v.y;const d=Math.hypot(dx,dy);if(d>P.R){dx*=P.R/d;dy*=P.R/d}rp.joy={x:dx/P.R,y:dy/P.R};rpJoyKnob(dx,dy)}
function rpJoyEnd(e){const P=rp.joyP;if(!P||(e&&e.pointerId!==P.id))return;rp.joyP=null;rp.joy=null;rpJoyKnob(0,0)}
/* never keep walking once no finger is on the screen */
function rpInputReset(){rp.joy=null;rp.joyP=null;rp.held=null;rp.keys.clear();if(rp.stick)rp.stick=null;rpJoyKnob(0,0)}
feature({id:'core-input',init(){
rp.stick=null;
rpcv.addEventListener('pointerdown',e=>{if(rp.mode!=='map')return;{const L=rpLoc(e,rpcv);rp.stick={id:e.pointerId,x:e.clientX,y:e.clientY,lx:L.x/L.w,ly:L.y/L.h,dx:0,dy:0,on:false}}try{rpcv.setPointerCapture(e.pointerId)}catch(_){}});
rpcv.addEventListener('pointermove',e=>{const S=rp.stick;if(!S||S.id!==e.pointerId)return;{const v=rpVec(e.clientX-S.x,e.clientY-S.y);S.dx=v.x;S.dy=v.y}
  if(!S.on&&Math.hypot(S.dx,S.dy)>14){S.on=true;rp.path=null}
  if(S.on)e.preventDefault()});
rpcv.addEventListener('pointerup',rpStickEnd);
rpcv.addEventListener('pointercancel',rpStickEnd);
rpcv.addEventListener('click',e=>{
  if(rp.stickUsed)return;
  if(rp.mode==='battle'){if(rp.bt)rpTacClick(e);return}
  if(rp.mode==='dialog'){rpDlgNext();return}
  if(rp.mode!=='map')return;const L=rpLoc(e,rpcv),x=L.x/L.w*RPW+rp.cam.x,y=L.y/L.h*RPH+rp.cam.y;rpTapTile(Math.floor(x/RT),Math.floor(y/RT))});
$('rp-panel').addEventListener('click',rpMenuClick);
$('rp-panel').addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('button[data-dir]');if(b){rp.held=b.dataset.dir;rp.path=null;e.preventDefault()}});
['pointerup','pointercancel','pointerleave'].forEach(t=>$('rp-panel').addEventListener(t,()=>{rp.held=null}));
document.addEventListener('keydown',e=>{if(view!=='rpg')return;if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')){if(e.key==='Enter'&&e.target.id==='kq-chat'){netSay(e.target.value);e.target.value='';e.preventDefault()}return}const k=e.key.toLowerCase();
  if(RP_KEYS[k]&&rp.mode==='map'){rp.keys.add(RP_KEYS[k]);rp.path=null;e.preventDefault();return}
  if(k==='m'){if(rp.mode==='map'){rp.mode='menu';rp.menuSel=null;rpUI(true)}else if(rp.mode==='menu'){rp.mode='map';rpUI(true)}return}
  if(k==='escape'){if(rp.mode==='menu'){rp.mode='map';rpUI(true)}else if(rp.mode!=='map'&&rp.mode!=='battle'&&rp.mode!=='dialog'){rp.mode='map';rpUI(true)}return}
  if(rp.mode==='dialog'&&/^[1-9]$/.test(k)&&rp.dlg&&rp.dlg.choices&&rp.dlg.i>=rp.dlg.lines.length-1){rpChoose(+k-1);return}
  if(k==='h'||k==='i'){if(rp.mode==='map'){rp.mode='v6sheet';rpUI(true)}else if(rp.mode==='v6sheet'){rp.mode='map';rpUI(true)}return}
  if(k==='enter'||k===' '||k==='e'){if(rp.mode==='dialog'&&(!rp.dlg.choices||rp.dlg.i<rp.dlg.lines.length-1))rpDlgNext();else if(rp.mode==='map')rpMenuClick({target:{closest:()=>({disabled:false,dataset:{rp:'act'}})}});e.preventDefault()}});
document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(RP_KEYS[k])rp.keys.delete(RP_KEYS[k])});
window.addEventListener('blur',()=>{rp.keys.clear();rp.held=null});
window.addEventListener('resize',()=>{if(view==='rpg'){rpLayout();rpResize()}});
rp.joy=null;
rp.joyP=null;
$('rp-panel').addEventListener('pointerdown',e=>{const j=e.target.closest&&e.target.closest('[data-joy]');if(!j)return;const r=j.getBoundingClientRect();
  rp.joyP={id:e.pointerId,cx:r.left+r.width/2,cy:r.top+r.height/2,R:r.width*.36};rpJoyMove(e);e.preventDefault();try{j.setPointerCapture(e.pointerId)}catch(_){}});
window.addEventListener('pointermove',e=>{if(rp.joyP&&e.pointerId===rp.joyP.id){rpJoyMove(e);e.preventDefault()}},{passive:false});
window.addEventListener('pointerup',rpJoyEnd);
window.addEventListener('pointercancel',rpJoyEnd);
['touchend','touchcancel'].forEach(t=>window.addEventListener(t,e=>{if(!e.touches||e.touches.length===0)rpInputReset()}));
window.addEventListener('blur',rpInputReset);
document.addEventListener('visibilitychange',()=>{if(document.hidden)rpInputReset()});
}});
export {RP_KEYS,rpInputReset,rpJoyEnd,rpJoyKnob,rpJoyMove,rpStickEnd};
