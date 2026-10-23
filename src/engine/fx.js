import {rpOpt} from '../core/options.js';
import {quiet} from './audio.js';
import {R,RM,pick} from './util.js';
const parts=[],texts=[];let shake=0;
function burst(x,y,n,colors,spd,type){
  if(quiet)return;
  for(let i=0;i<n;i++){
    const a=Math.random()*6.283,v=spd*R(.35,1),life=R(.45,.85);
    parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-spd*.35,g:320,life,max:life,type,color:pick(colors),size:R(2.2,4.2),rot:R(0,6),vr:R(-9,9)});
  }
}
function ftext(x,y,text,color,size){if(quiet)return;texts.push({x,y,vy:-30,life:.95,max:.95,text,color:color||'#fff',size:size||13})}
function confetti(){if(rpOpt.calm)return;
  if(quiet)return;
  const cols=['#ffb347','#fff','#ff7aa8','#7ad67a','#6fd3ee','#b79bff'],n=RM?14:70;
  for(let i=0;i<n;i++)parts.push({x:R(0,480),y:R(-30,40),vx:R(-30,30),vy:R(30,110),g:25,life:R(2.6,4.2),max:4.2,type:'confetti',color:pick(cols),size:R(3,5),rot:R(0,6),vr:R(-9,9)});
}
function set_shake(v){return shake=rpOpt.calm?0:v}   /* reduced motion: no shake (ui-design.md §10) */
export {burst,confetti,ftext,parts,set_shake,shake,texts};
