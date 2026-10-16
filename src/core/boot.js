/* Boot: loading screen, the title screen, the sound toggle and the one frame loop. */
import {view} from './app.js';
import {rpOpt,rpOptSave} from './options.js';
import {inits} from './registry.js';
import {installHooks} from '../dev/hooks.js';
import {ctx,drawKobold,makeK,set_ctx} from '../engine/art.js';
import {audio,audioReady,set_soundOn,sfx,soundOn,unlockAudio} from '../engine/audio.js';
import {$,RM} from '../engine/util.js';
import {rpFrame} from '../game/play.js';

const TITLE_KS=[
  {team:0,weapon:'stick',hat:'leaf',x:70,y:112,face:1},
  {team:0,weapon:'frostrod',hat:'wizard',x:130,y:106,face:1},
  {team:3,weapon:'sword',hat:'crown',x:228,y:112,face:-1,size:1.3,state:'windup'}];
let titleKs=null;
function drawTitle(dt){
  const c=$('title-cv');if(!c||!c.getContext)return;const g=c.getContext('2d');
  if(!titleKs)titleKs=TITLE_KS.map(o=>{const k=makeK({team:o.team,name:'',weapon:o.weapon,hat:o.hat,pers:'brave',speed:1,hp:30,size:o.size||1},o.x,o.y,false);k.face=o.face;if(o.state)k.state=o.state;return k});
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);
  const main=ctx;set_ctx(g);
  for(const k of titleKs){k.t+=dt;k.blink-=dt;if(k.blink<-.12)k.blink=1+Math.random()*4;drawKobold(k)}
  set_ctx(main);
}
/* sound is on unless the player turned it off (remembered); phones only allow sound after the first tap,
   so the first tap anywhere wakes the audio up, and later sounds (a friend's yip) can play by themselves */
function soundButton(){set_soundOn(rpOpt.sound!==false);const b=$('sound');
  const sync=()=>{if(!b)return;b.setAttribute('aria-pressed',soundOn?'true':'false');b.textContent=soundOn?'Sound on':'Sound off'};sync();
  if(b)b.addEventListener('click',()=>{set_soundOn(!soundOn);rpOpt.sound=soundOn;rpOptSave();sync();if(soundOn){audio();sfx('drop')}});
  const wake=()=>{unlockAudio();if(audioReady()){['pointerdown','keydown','touchend'].forEach(t=>document.removeEventListener(t,wake,true))}};
  ['pointerdown','keydown','touchend'].forEach(t=>document.addEventListener(t,wake,true))}
function bootScreen(){
  const bt=$('boot'),bb=$('boot-bar'),tx=$('boot-t');
  const done=()=>{bt.hidden=true;try{sessionStorage.setItem('kobold-pit-booted','1')}catch(e){}};
  let seen=false;try{seen=!!sessionStorage.getItem('kobold-pit-booted')}catch(e){}
  if(RM||seen){done();return}
  bt.addEventListener('click',done);
  let t0=0;const tick=ts=>{if(bt.hidden)return;if(!t0)t0=ts;const p=Math.min(100,Math.round((ts-t0)/16));
    bb.style.width=p+'%';tx.textContent='Loading... '+p+'%';if(p>=100)setTimeout(done,250);else requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}
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
  soundButton();bootScreen();requestAnimationFrame(frame);
}
export {TITLE_KS,bootScreen,drawTitle,frame,last,soundButton,titleKs};
