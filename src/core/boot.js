/* Boot: the title screen, the sound toggle and the one frame loop. */
import {view} from './app.js';
import {inits} from './registry.js';
import {installHooks} from '../dev/hooks.js';
import {ctx,drawKobold,makeK,set_ctx} from '../engine/art.js';
import {audio,set_soundOn,sfx,soundOn} from '../engine/audio.js';
import {$} from '../engine/util.js';
import {rpFrame} from '../game/play.js';

const TITLE_KS=[
  {team:0,weapon:'stick',x:70,y:112,face:1},
  {team:0,weapon:'frostrod',x:130,y:106,face:1},
  {team:3,weapon:'sword',x:228,y:112,face:-1,size:1.3,state:'windup'}];
let titleKs=null;
function drawTitle(dt){
  const c=$('title-cv');if(!c||!c.getContext)return;const g=c.getContext('2d');
  if(!titleKs)titleKs=TITLE_KS.map(o=>{const k=makeK({team:o.team,name:'',weapon:o.weapon,hp:30,size:o.size||1},o.x,o.y,false);k.face=o.face;if(o.state)k.state=o.state;return k});
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);
  const main=ctx;set_ctx(g);
  for(const k of titleKs){k.t+=dt;k.blink-=dt;if(k.blink<-.12)k.blink=1+Math.random()*4;drawKobold(k)}
  set_ctx(main);
}
function soundButton(){const b=$('sound');if(!b)return;
  const sync=()=>{b.setAttribute('aria-pressed',soundOn?'true':'false');b.textContent=soundOn?'Sound on':'Sound off'};sync();
  b.addEventListener('click',()=>{set_soundOn(!soundOn);sync();if(soundOn){audio();sfx('drop')}})}
let last=0;
function frame(ts){
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
  if(view==='rpg'){try{rpFrame(dt)}catch(err){console.error('Kobold Quest frame error',err)}}
  else if(view==='title')drawTitle(dt);
  requestAnimationFrame(frame);
}
export function boot(){
  if(typeof TEST!=='undefined'&&TEST)installHooks();
  for(const fn of inits)fn();
  soundButton();requestAnimationFrame(frame);
}
export {TITLE_KS,drawTitle,frame,last,soundButton,titleKs};
