/* everyone else on my map */
import {view} from '../core/app.js';
import {RT} from '../core/layout.js';
import {rp,rpPlace} from '../core/state.js';
import {OL,WEAPONS,ctx,makeK} from '../engine/art.js';
import {R,rr} from '../engine/util.js';
import {net,netName} from './core.js';

/* other players are drawn only when they are on the same map (outdoors, or the same room) */
function netHere(P){return(P.presence.pl||'world')===rpPlace()}
function netPartnerK(dt){
  if(!rp.s||view!=='rpg')return[];const out=[];
  (net.others||[]).forEach(P=>{const pr=P.presence;if(pr.m==='battle'||!netHere(P))return;let E=net.pks[P.peer];
    if(!E||E.k.weapon!==pr.w){E=net.pks[P.peer]={k:makeK({team:0,name:netName(P),weapon:WEAPONS[pr.w]?pr.w:'stick',hat:pr.h||'none',pers:'brave',speed:1,hp:30,size:.72},0,0,false),pos:null}}
    const k=E.k;k.hat=pr.h||'none';const tx=(+pr.x||0)*RT,ty=(+pr.y||0)*RT+10;
    if(!E.pos||Math.hypot(E.pos.x-tx,E.pos.y-ty)>RT*6)E.pos={x:tx,y:ty};
    const dx=tx-E.pos.x,dy=ty-E.pos.y;E.pos.x+=dx*Math.min(1,dt*10);E.pos.y+=dy*Math.min(1,dt*10);
    k.x=E.pos.x;k.y=E.pos.y;k.t+=dt;k.blink-=dt;if(k.blink<-.12)k.blink=R(2,5);k.moving=Math.hypot(dx,dy)>1;if(k.moving)k.walk+=dt*12;if(Math.abs(dx)>.5)k.face=dx>0?1:-1;
    k.wa+=((WEAPONS[k.weapon].ranged&&!WEAPONS[k.weapon].magic?1.45:.35)-k.wa)*Math.min(1,dt*10);E.peer=P;out.push(k)});
  return out}
function netBubble(x,y,txt){if(!txt)return;ctx.font='700 12px "Fredoka",system-ui,sans-serif';ctx.textAlign='center';const w=Math.min(170,ctx.measureText(txt).width+14);
  rr(ctx,x-w/2,y-20,w,20,9);ctx.fillStyle='rgba(255,255,255,.95)';ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.stroke();ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.lineTo(x,y+6);ctx.closePath();ctx.fillStyle='#fff';ctx.fill();
  ctx.fillStyle='#2a1a5e';ctx.fillText(txt.length>26?txt.slice(0,25)+'…':txt,x,y-6)}
function netDrawTags(){
  const now=performance.now();
  (net.others||[]).forEach(P=>{const E=net.pks[P.peer];if(!E||P.presence.m==='battle'||!netHere(P))return;const k=E.k,nm=netName(P)+(P.presence.lv?' · '+P.presence.lv:'');
    ctx.font='800 11px "Fredoka",system-ui,sans-serif';ctx.textAlign='center';const w=ctx.measureText(nm).width+12;
    rr(ctx,k.x-w/2,k.y-58,w,15,7);ctx.fillStyle='rgba(20,10,53,.82)';ctx.fill();ctx.fillStyle='#9ad0ff';ctx.fillText(nm,k.x,k.y-47);
    if(P.presence.op){const y=k.y-72+Math.sin(rp.t*6)*2;ctx.font='400 18px system-ui';ctx.fillText('⚔',k.x,y)}
    const B=net.bubbles[P.peer];if(B&&now-B.t<5000)netBubble(k.x,k.y-62,B.txt)});
  const mine=net.bubbles.me;if(mine&&now-mine.t<5000&&rp.pk)netBubble(rp.pk.x,rp.pk.y-50,mine.txt);
}
export {netBubble,netDrawTags,netHere,netPartnerK};
