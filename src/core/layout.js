/* ---------- Kobold Quest (RPG) ---------- */
import {rpViewH,rpViewW} from '../battle/view.js';
import {rpOpt} from './options.js';
import {rp} from './state.js';
import {$} from '../engine/util.js';

const RT=32,RVW=11,RVH=11,RP_TILES=10;
let RPW=RT*RVW,RPH=RT*RVH;
/* when the game is turned sideways on an upright phone, touch points must be turned too */
function rpLoc(e,el){const r=el.getBoundingClientRect();if(rp.rot)return{x:e.clientY-r.top,y:r.right-e.clientX,w:r.height,h:r.width};return{x:e.clientX-r.left,y:e.clientY-r.top,w:r.width,h:r.height}}
function rpVec(dx,dy){return rp.rot?{x:dy,y:-dx}:{x:dx,y:dy}}
/* battles: see tac.js */
/* drawing */
const rpcv=document.getElementById('rpcv'),rpctx=rpcv.getContext('2d');
let rpS=1,rpDpr=1;
function rpResize(){
  const pe=rpcv.parentElement,box={width:pe.clientWidth,height:pe.clientHeight};if(!box.width||!box.height)return;
  /* the map fills the whole screen; the shorter side shows about 10 tiles */
  if(!(rp.mode==='battle'&&rp.bt)){const k=RP_TILES*RT/Math.min(box.width,box.height);RPW=Math.round(box.width*k);RPH=Math.round(box.height*k)}
  const VW=rpViewW(),VH=rpViewH(),sc=Math.min(box.width/VW,box.height/VH),w=Math.floor(VW*sc),h=Math.floor(VH*sc);
  rpcv.style.width=w+'px';rpcv.style.height=h+'px';rpDpr=Math.min(2,window.devicePixelRatio||1);
  const cw=Math.round(w*rpDpr),ch=Math.round(h*rpDpr);if(rpcv.width!==cw||rpcv.height!==ch){rpcv.width=cw;rpcv.height=ch}
  rpS=w/VW;rp.mapImg=null;if(rp.bt)rp.bt.img=null;
}
/* sideways only: an upright phone gets the whole view turned a quarter turn, so it is held like a handheld */
function rpLayout(){const v=$('v-rpg');if(!v||!v.classList)return;const rot=innerHeight>innerWidth;
  if(rot!==rp.rot||!v.classList.contains('land')){rp.rot=rot;v.classList.toggle('rot',rot);v.classList.add('land');if(typeof rpResize==='function')requestAnimationFrame(rpResize)}}
/* fullscreen and a landscape lock where the browser allows it (needs a tap to start) */
function rpGoFull(force){if(rpOpt.full===false&&!force)return;if(!force&&!(window.matchMedia&&matchMedia('(pointer:coarse)').matches))return;
  const el=document.documentElement;try{const p=el.requestFullscreen?el.requestFullscreen({navigationUI:'hide'}):el.webkitRequestFullscreen?el.webkitRequestFullscreen():null;
    if(p&&p.then)p.then(()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}catch(e){}}
function rpExitFull(){try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{})}catch(e){}}
export {RPH,RPW,RP_TILES,RT,RVH,RVW,rpDpr,rpExitFull,rpGoFull,rpLayout,rpLoc,rpResize,rpS,rpVec,rpctx,rpcv};
