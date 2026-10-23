import {tcHitBadge,tcTargets} from './input.js';
import {tcBase,tcHome,tcLive,tcMov,tcReach,tcShown,tcT} from './rules.js';
import {v6LegalTiles} from './v6battle.js';
import {BVH,BVW,TT} from './view.js';
import {RT,rpDpr,rpS,rpctx,rpcv} from '../core/layout.js';
import {rp} from '../core/state.js';
import {OL,ctx,drawKobold,el,set_ctx} from '../engine/art.js';
import {parts,shake,texts} from '../engine/fx.js';
import {R,RM,clamp,heartPath,rr,starPath} from '../engine/util.js';
import {rpTile} from '../render/map.js';
function tcCamTo(b,u,snap){const h=u.k?{x:u.k.x,y:u.k.y}:{x:(u.x+.5)*TT,y:(u.y+.5)*TT};
  const t={x:clamp(h.x-BVW/2,0,Math.max(0,b.W*TT-BVW)),y:clamp(h.y-BVH*.55,0,Math.max(0,b.H*TT-BVH))};b.camT=t;if(snap){b.cam.x=t.x;b.cam.y=t.y}}
/* ---------- drawing ---------- */
function tcTile(g,c,x,y,X,Y,th){
  const base=tcBase(th),S=TT/RT;g.save();g.translate(X,Y);g.scale(S,S);
  const under=ch=>rpTile(g,ch,x,y,0,0);
  if(c==='R'){under(base);g.fillStyle=OL;g.beginPath();g.ellipse(16,18,13,11,0,0,7);g.fill();g.fillStyle=th==='cave'?'#62526d':'#9a94a8';g.beginPath();g.ellipse(16,17,11,9,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(12,13,4,3,0,0,7);g.fill()}
  else if(c==='h'){under(base);if(th==='woods'||(x+y)%2){g.fillStyle=OL;g.beginPath();g.arc(16,19,12,0,7);g.fill();g.fillStyle='#3e8a2c';g.beginPath();g.arc(16,19,10,0,7);g.fill();g.fillStyle='#5fb04a';g.beginPath();g.arc(12,15,5,0,7);g.fill()}
    else{g.fillStyle=OL;rr(g,3,13,26,12,5);g.fill();g.fillStyle='#8a5a30';rr(g,5,15,22,8,4);g.fill();g.fillStyle='#c09060';g.beginPath();g.ellipse(25,19,3,4,0,0,7);g.fill()}}
  else if(c==='m'){under('C');g.fillStyle='rgba(255,140,200,.18)';g.beginPath();g.arc(16,16,14,0,7);g.fill();g.fillStyle='#efe3d0';g.fillRect(13,16,6,12);g.fillStyle=OL;g.beginPath();g.ellipse(16,16,12,8,0,Math.PI,0);g.fill();g.fillStyle='#e05a8a';g.beginPath();g.ellipse(16,16,10,6.5,0,Math.PI,0);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(12,13,1.6,0,7);g.arc(19,12,1.6,0,7);g.fill()}
  else if(c==='G'){under('K');g.fillStyle=OL;g.beginPath();g.ellipse(16,22,13,8,0,0,7);g.fill();g.fillStyle='#ffd54a';g.beginPath();g.ellipse(16,21,11,6.5,0,0,7);g.fill();g.fillStyle='#ffe98a';[[11,18],[18,16],[21,21],[14,22]].forEach(([a,c2])=>{g.beginPath();g.arc(a,c2,2.4,0,7);g.fill()})}
  else if(c==='P'){under('K');g.fillStyle=OL;g.fillRect(8,2,16,28);g.fillStyle='#a8a4c8';g.fillRect(10,4,12,24);g.fillStyle='#c8c4e0';g.fillRect(10,4,4,24);g.fillStyle='#8c88a6';g.fillRect(7,2,18,4);g.fillRect(7,26,18,4)}
  else if(c==='o'){under('K');g.fillStyle='#a8323e';g.fillRect(0,0,RT+1,RT+1);g.fillStyle='#ffd54a';g.fillRect(x%2?RT-3:0,0,3,RT+1)}
  else if(c==='T'&&th!=='woods'){under(base);g.fillStyle='#6b4423';g.fillRect(13,18,6,12);g.fillStyle=OL;g.beginPath();g.arc(16,13,13,0,7);g.fill();g.fillStyle='#2f8a3a';g.beginPath();g.arc(16,13,11,0,7);g.fill();g.fillStyle='#4fb04e';g.beginPath();g.arc(12,9,5,0,7);g.fill()}
  else under(c);
  g.restore();g.strokeStyle='rgba(20,10,53,.13)';g.lineWidth=1;g.strokeRect(X+.5,Y+.5,TT-1,TT-1);
}
function tcBoardImg(b){const k=rpS*rpDpr,c=document.createElement('canvas');c.width=Math.max(1,Math.round(b.W*TT*k));c.height=Math.max(1,Math.round(b.H*TT*k));
  const g=c.getContext('2d');if(!g||!g.setTransform){b.img=c;return}g.setTransform(k,0,0,k,0,0);
  for(let y=0;y<b.H;y++)for(let x=0;x<b.W;x++)tcTile(g,b.g[y][x],x,y,x*TT,y*TT,b.theme);
  if(b.exits)for(let x=0;x<b.W;x++){if(tcT(b.g[b.H-1][x]).solid)continue;g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(x*TT+TT/2,(b.H-1)*TT+TT-5);g.lineTo(x*TT+TT/2-6,(b.H-1)*TT+TT-13);g.lineTo(x*TT+TT/2+6,(b.H-1)*TT+TT-13);g.closePath();g.fill()}
  b.img=c}
function rpDrawBattle(){
  const b=rp.bt,ctx0=ctx;set_ctx(rpctx);const k=rpS*rpDpr;
  if(!b.img)tcBoardImg(b);
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0d0820';ctx.fillRect(0,0,rpcv.width,rpcv.height);
  const cx=b.cam.x,cy=b.cam.y;
  ctx.drawImage(b.img,cx*k,cy*k,BVW*k,BVH*k,0,0,BVW*k,BVH*k);
  ctx.setTransform(k,0,0,k,-cx*k,-cy*k);
  if(shake>0&&!RM)ctx.translate(R(-shake,shake),R(-shake,shake));
  const u=b.cur,mine=b.phase==='turn'&&u&&u.side===0;
  /* start zone while placing */
  if(b.phase==='place'){ctx.fillStyle='rgba(111,184,255,.22)';ctx.fillRect(0,(b.H-3)*TT,b.W*TT,3*TT);if(b.placeSel){const h=tcHome(b.placeSel);ctx.strokeStyle='#ffd54a';ctx.lineWidth=2.5;ctx.strokeRect(b.placeSel.x*TT+2,b.placeSel.y*TT+2,TT-4,TT-4)}}
  /* where the active kobold can go: blue = 1 AP, gold = 2 AP */
  if(mine&&b.mode==='move'&&!b.pend){const mov=tcMov(u),R2=tcReach(b,u,u.ap>=2?mov*2:mov);
    R2.dist.forEach((d,kk)=>{const x=kk%b.W,y=(kk/b.W)|0;if(x===u.x&&y===u.y)return;ctx.fillStyle=d<=mov?'rgba(111,184,255,.28)':'rgba(255,213,74,.22)';ctx.fillRect(x*TT+1,y*TT+1,TT-2,TT-2)})}
  /* the legal tiles for a tile or area skill (build step 4) */
  if(mine&&!b.pend&&b.mode.startsWith('sk:')){const L=v6LegalTiles(b,u,b.mode.slice(3));if(L){ctx.fillStyle='rgba(155,227,107,'+(.18+.06*Math.sin(b.t*4))+')';L.forEach(([x,y])=>ctx.fillRect(x*TT+1,y*TT+1,TT-2,TT-2))}}
  /* charging spells */
  b.chans.forEach(c=>{const T=Math.ceil(c.area);ctx.fillStyle='rgba(255,90,60,'+(.18+.1*Math.sin(b.t*6))+')';for(let y=c.cy-T;y<=c.cy+T;y++)for(let x=c.cx-T;x<=c.cx+T;x++)if(Math.hypot(x-c.cx,y-c.cy)<=c.area+.01)ctx.fillRect(x*TT,y*TT,TT,TT)});
  /* preview */
  const P=b.pend;
  if(P&&P.path){ctx.fillStyle='rgba(255,226,122,.85)';P.path.forEach(([x,y])=>{ctx.beginPath();ctx.arc(x*TT+TT/2,y*TT+TT/2,3.5,0,7);ctx.fill()});const [ex,ey]=P.path[P.path.length-1];ctx.strokeStyle='#ffd54a';ctx.lineWidth=3;ctx.strokeRect(ex*TT+3,ey*TT+3,TT-6,TT-6);
    if(P.cover)tcShield(ex*TT+TT-9,ey*TT+9,P.cover)}
  if(P&&P.tiles){ctx.fillStyle='rgba(255,107,107,.32)';P.tiles.forEach(([x,y])=>ctx.fillRect(x*TT,y*TT,TT,TT))}
  /* fog */
  for(let y=Math.max(0,Math.floor(cy/TT));y<Math.min(b.H,Math.ceil((cy+BVH)/TT));y++)for(let x=Math.max(0,Math.floor(cx/TT));x<Math.min(b.W,Math.ceil((cx+BVW)/TT));x++){const v=b.vis[y*b.W+x];if(v===2)continue;ctx.fillStyle=v===1?'rgba(13,8,32,.55)':'#0d0820';ctx.fillRect(x*TT-.5,y*TT-.5,TT+1,TT+1)}
  if(b.pings)b.pings.forEach(p=>{if(b.vis[p.y*b.W+p.x]===2)return;rpFloatStatic((p.x+.5)*TT,(p.y+.7)*TT+Math.sin(b.t*5)*2,'?','#ffd54a')});
  /* targets for the chosen action */
  if(mine&&!b.pend){tcTargets(b,u).forEach(t=>{if(t.k){ctx.strokeStyle='#ff6b6b';ctx.lineWidth=2.5;ctx.setLineDash([4,3]);ctx.beginPath();ctx.ellipse(t.k.x,t.k.y+1,15*t.sz,6*t.sz,0,0,7);ctx.stroke();ctx.setLineDash([])}})}
  if(P&&P.t&&P.t.k){ctx.strokeStyle='#ffd54a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(P.t.k.x,P.t.k.y+1,16*P.t.sz,7*P.t.sz,0,0,7);ctx.stroke()}
  if(P&&P.aoo)P.aoo.forEach(o=>rpFloatStatic(o.k.x,o.k.y-50,'⚠','#ff6b6b'));
  /* units */
  const shown=b.units.filter(x=>!x.fled&&(x.side===0||tcShown(b,x)||(!tcLive(x)&&b.vis[x.y*b.W+x.x]===2)));
  if(u&&tcLive(u)&&(u.side===0||tcShown(b,u))){ctx.fillStyle='rgba(255,213,74,.35)';ctx.beginPath();ctx.ellipse(u.k.x,u.k.y+1,16*u.sz,6*u.sz,0,0,7);ctx.fill()}
  shown.slice().sort((a,c)=>a.k.y-c.k.y).forEach(x=>drawKobold(x.k));
  shown.forEach(x=>{if(!tcLive(x))return;const w=26*x.sz,X=x.k.x-w/2,Y=x.k.y-40*(x.sz>1?2:1)-6,r=clamp(x.hp/x.max,0,1);ctx.fillStyle=OL;ctx.fillRect(X-1,Y-1,w+2,6);ctx.fillStyle=x.side===0?(r>.5?'#7ad67a':r>.25?'#ffc857':'#ff6b6b'):'#ff6b6b';ctx.fillRect(X,Y,w*r,4);
    if(x.guard||x.watch){ctx.font='700 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#9ad0ff';ctx.fillText(x.watch?'👁':'🛡',x.k.x+w/2+6,Y+5)}
    if(x.chan){ctx.font='800 11px "Fredoka",system-ui';ctx.textAlign='center';ctx.fillStyle='#ff8a5c';ctx.fillText('casting…',x.k.x,Y-4)}});
  /* v6: the hit chance on every foe in reach, a skull when the hit can fell it (ui-design.md §5, priority 3) */
  if(mine&&!b.pend)tcTargets(b,u).forEach(t=>{if(t.side!==1||!t.k)return;const B=tcHitBadge(b,u,t);if(B)rpFloatStatic(t.k.x,t.k.y-(t.sz>1?78:54),B.h+'%'+(B.kill?' 💀':''),B.kill?'#ffd54a':'#ffffff')});
  /* active marker */
  if(u&&tcLive(u)&&(u.side===0||tcShown(b,u))){ctx.fillStyle='#ffd54a';const y=u.k.y-40*(u.sz>1?2:1)-12+Math.sin(rp.t*6)*2;ctx.beginPath();ctx.moveTo(u.k.x-6,y-8);ctx.lineTo(u.k.x+6,y-8);ctx.lineTo(u.k.x,y);ctx.closePath();ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.stroke()}
  if(b.anim){const a=b.anim;if(a.proj==='heal'){ctx.fillStyle='#ff7aa8';heartPath(ctx,a.x,a.y,6);ctx.fill()}else if(a.proj==='fire'){el(a.x,a.y,6,6,'#ff8a2b');el(a.x,a.y,3,3,'#ffe9a8')}else if(a.proj==='ice'){el(a.x,a.y,5,5,'#d8f3ff')}else if(a.proj==='water'){el(a.x,a.y,4,4,'#7fd0ff')}else el(a.x,a.y,3.5,3.5,'#ffb347')}
  parts.forEach(p=>{const a=clamp(p.life/p.max*1.6,0,1);ctx.globalAlpha=a;ctx.fillStyle=p.color;if(p.type==='star'){starPath(ctx,p.x,p.y,p.size,p.rot);ctx.fill()}else if(p.type==='heart'){heartPath(ctx,p.x,p.y,p.size*1.6);ctx.fill()}else if(p.type==='confetti'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillRect(-p.size,-p.size*.6,p.size*2,p.size*1.2);ctx.restore()}else{ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,7);ctx.fill()}});
  ctx.globalAlpha=1;ctx.textAlign='center';ctx.lineJoin='round';
  texts.forEach(q=>{ctx.globalAlpha=clamp(q.life/q.max*2,0,1);ctx.font='800 '+q.size+'px "Fredoka",system-ui,sans-serif';ctx.lineWidth=3.5;ctx.strokeStyle='rgba(20,10,30,.88)';ctx.strokeText(q.text,q.x,q.y);ctx.fillStyle=q.color;ctx.fillText(q.text,q.x,q.y)});
  ctx.globalAlpha=1;
  set_ctx(ctx0);
}
function rpFloatStatic(x,y,t,c){ctx.font='800 15px "Fredoka",system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=3.5;ctx.strokeStyle=OL;ctx.strokeText(t,x,y);ctx.fillStyle=c;ctx.fillText(t,x,y)}
function tcShield(x,y,c){ctx.fillStyle=OL;ctx.beginPath();ctx.moveTo(x-7,y-7);ctx.lineTo(x+7,y-7);ctx.lineTo(x+7,y+1);ctx.quadraticCurveTo(x,y+9,x,y+9);ctx.quadraticCurveTo(x-7,y+5,x-7,y+1);ctx.closePath();ctx.fill();
  ctx.fillStyle=c===2?'#6fb8ff':'#9ad0ff';ctx.beginPath();ctx.moveTo(x-5,y-5);ctx.lineTo(x+5,y-5);ctx.lineTo(x+5,y+1);ctx.quadraticCurveTo(x,y+6.5,x,y+6.5);ctx.quadraticCurveTo(x-5,y+3.5,x-5,y+1);ctx.closePath();ctx.fill();
  if(c===1){ctx.fillStyle=OL;ctx.fillRect(x,y-5,5,12)}}
export {rpDrawBattle,rpFloatStatic,tcBoardImg,tcCamTo,tcShield,tcTile};
