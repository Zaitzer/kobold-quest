/* tile letter → drawing name in art/sprites (see art/WANTED.md) */
import {RPH,RPW,RT,rpDpr,rpS,rpctx,rpcv} from '../core/layout.js';
import {rp} from '../core/state.js';
import {OL,WEAPONS,ctx,drawKobold,makeK,set_ctx} from '../engine/art.js';
import {sheetOfKobold,sheetOfNpc} from '../engine/sheets6.js';
import {artName} from '../engine/sprites.js';
import {R,clamp,rr} from '../engine/util.js';
import {rpHat} from '../game/stats.js';
import {s6Marker} from '../game/story6.js';
import {rpNpcs} from '../game/world.js';
import {netDrawTags,netPartnerK} from '../net/draw.js';
import {w6Overlay,w6Tile} from './map6.js';

/* every tile is drawn by the v6 renderer (map6.js) */
function rpTile(g,c,x,y,X,Y){w6Tile(g,c,x,y,X,Y)}
/* the map is drawn in chunks of 16 × 16 tiles, made the first time they come on screen and kept for a while
   (the world is far too big for one picture). rp.mapImg is the chunk store; setting it to null redraws everything. */
const CHUNK=16,CHUNK_KEEP=48;
function rpMapImage(){rp.mapImg={chunks:new Map(),k:Math.min(2.5,rpS*rpDpr)}}
function rpChunk(cx,cy){const M=rp.mapImg,key=cx+','+cy;let c=M.chunks.get(key);if(c){M.chunks.delete(key);M.chunks.set(key,c);return c}
  const W=rp.grid[0].length,H=rp.grid.length,k=M.k,x0=cx*CHUNK,y0=cy*CHUNK,x1=Math.min(W,x0+CHUNK),y1=Math.min(H,y0+CHUNK);
  c=document.createElement('canvas');c.width=Math.ceil((x1-x0)*RT*k);c.height=Math.ceil((y1-y0)*RT*k);
  const g=c.getContext('2d');g.setTransform(k,0,0,k,-x0*RT*k,-y0*RT*k);
  for(let y=y0;y<y1;y++){const row=rp.grid[y];for(let x=x0;x<x1;x++)rpTile(g,row[x],x,y,x*RT,y*RT)}
  M.chunks.set(key,c);if(M.chunks.size>CHUNK_KEEP)M.chunks.delete(M.chunks.keys().next().value);return c}
/* draw the chunks the camera sees */
function rpDrawChunks(cx,cy){const k=rpS*rpDpr,size=CHUNK*RT,W=rp.grid[0].length,H=rp.grid.length;
  const a=Math.max(0,Math.floor(cx/size)),b=Math.min(Math.ceil(W/CHUNK)-1,Math.floor((cx+RPW)/size)),c=Math.max(0,Math.floor(cy/size)),d=Math.min(Math.ceil(H/CHUNK)-1,Math.floor((cy+RPH)/size));
  for(let j=c;j<=d;j++)for(let i=a;i<=b;i++){const im=rpChunk(i,j);ctx.drawImage(im,Math.round((i*size-cx)*k),Math.round((j*size-cy)*k),Math.round(im.width/rp.mapImg.k*k),Math.round(im.height/rp.mapImg.k*k))}}
function rpNpcK(n){let k=rp.npcK[n.id];if(!k){k=makeK({team:n.team,name:n.name,art:artName(n.art||n.id),weapon:n.w,hat:n.hat,pers:'brave',speed:1,hp:30,size:(n.size||1)*.72},0,0,false);k.face=n.face||1;   /* never undefined: a scale of NaN is skipped by the canvas, which drew people a third too big until Pip came near */
  if(String(n.id).startsWith('v6:')){k.sheetFn=()=>sheetOfNpc(n.id,n.sheet);k.onMap=1}rp.npcK[n.id]=k}return k}
function rpDrawMap(dt){
  const s=rp.s,ctx0=ctx;set_ctx(rpctx);
  if(!rp.mapImg)rpMapImage();
  let px=rp.pos?rp.pos.x-.5:s.x,py=rp.pos?rp.pos.y-.5:s.y;
  /* keep Pip in the open part of the screen when a sheet (dialogue, shop, menu) covers one side */
  const sheet=rp.mode!=='map'&&rp.mode!=='battle',land=RPW>RPH,o=rp.camOff||(rp.camOff={x:0,y:0}),tx=sheet&&land?.23:0,ty=sheet&&!land?.23:0;o.x+=(tx-o.x)*Math.min(1,dt*8);o.y+=(ty-o.y)*Math.min(1,dt*8);
  /* follow Pip; a room smaller than the screen sits in the middle of it */
  const mw=rp.grid[0].length*RT,mh=rp.grid.length*RT;
  const cx=mw<=RPW?(mw-RPW)/2:clamp(px*RT+RT/2-RPW/2+o.x*RPW,0,mw-RPW),cy=mh<=RPH?(mh-RPH)/2:clamp(py*RT+RT/2-RPH/2+o.y*RPH,0,mh-RPH);rp.cam={x:cx,y:cy};
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,rpcv.width,rpcv.height);
  const k=rpS*rpDpr;ctx.fillStyle=rp.s.w6&&rp.s.w6.startsWith('room:')?'#1a0f24':'#2a64a8';ctx.fillRect(0,0,rpcv.width,rpcv.height);rpDrawChunks(cx,cy);
  ctx.setTransform(k,0,0,k,-cx*k,-cy*k);
  if(rp.path&&rp.path.length){ctx.fillStyle='rgba(255,226,122,.55)';rp.path.forEach(([x,y])=>{ctx.beginPath();ctx.arc(x*RT+16,y*RT+16,3,0,7);ctx.fill()})}
  const ents=rpNpcs().map(n=>{const kk=rpNpcK(n);kk.x=n.x*RT+16;kk.y=n.y*RT+26;kk.t+=dt;kk.blink-=dt;if(kk.blink<-.12)kk.blink=R(2,5);kk.moving=false;kk.wa=.35+Math.sin(kk.t*2+kk.phase)*.4;
    if(Math.abs(s.x-n.x)+Math.abs(s.y-n.y)<=2){kk.face=s.x>n.x?1:s.x<n.x?-1:kk.face}return kk});
  const P0=s.party[0]&&WEAPONS[s.party[0].w]?s.party[0]:Object.assign({},s.party[0]||{},{w:'stick'});   // the heroes screen has nobody yet; a save without a weapon look draws a stick
  const pk=rp.pk||(rp.pk=makeK({team:0,name:'Pip',art:'pip',weapon:P0.w,hat:P0.hat,pers:'brave',speed:1,hp:30,size:.72},0,0,false));
  if(pk.weapon!==P0.w){pk.weapon=P0.w;pk.W=WEAPONS[pk.weapon]}pk.hat=rpHat(P0);
  pk.x=px*RT+16;pk.y=py*RT+26;pk.t+=dt;pk.blink-=dt;if(pk.blink<-.12)pk.blink=R(2,5);pk.moving=rp.moving;if(rp.moving)pk.walk+=dt*12;
  if(s.face==='left')pk.face=-1;else if(s.face==='right')pk.face=1;
  if(s.w6){const H=s.party.find(m=>m.hero)||s.party[0];pk.sheetFn=()=>sheetOfKobold(H);pk.onMap=1;pk.dir6=s.face;pk.colour6=s.hero&&s.hero.colour}else pk.sheetFn=null;pk.wa+=((WEAPONS[pk.weapon].ranged&&!WEAPONS[pk.weapon].magic?1.45:.35)-pk.wa)*Math.min(1,dt*10);
  ents.concat([pk],netPartnerK(dt)).sort((a,b)=>a.y-b.y).forEach(drawKobold);netDrawTags();
  // quest markers
  rpNpcs().forEach(n=>{const m=rpMarker(n.id);if(!m)return;const x=n.x*RT+16,y=n.y*RT-4+Math.sin(rp.t*4)*2;ctx.font='400 18px "Lilita One","Fredoka",system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle=OL;ctx.strokeText(m,x,y);ctx.fillStyle=m==='!'?'#ffd54a':'#9dff6e';ctx.fillText(m,x,y)});
  ctx.setTransform(k,0,0,k,0,0);
  if(s.w6)w6Overlay(ctx,cx,cy);
  const here=rp.grid[s.y][s.x];if(!s.w6&&(here==='C'||here==='g'||here==='c')){const gr=ctx.createRadialGradient(RPW/2,RPH/2,60,RPW/2,RPH/2,230);gr.addColorStop(0,'rgba(8,4,14,0)');gr.addColorStop(1,'rgba(8,4,14,.75)');ctx.fillStyle=gr;ctx.fillRect(0,0,RPW,RPH)}
  if(rp.stick&&rp.stick.on){const sx=rp.stick.lx*RPW,sy=rp.stick.ly*RPH,m=Math.min(1,Math.hypot(rp.stick.dx,rp.stick.dy)/40),a=Math.atan2(rp.stick.dy,rp.stick.dx);
    ctx.fillStyle='rgba(20,10,53,.35)';ctx.strokeStyle='rgba(255,226,122,.8)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(sx,sy,26,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,226,122,.9)';ctx.beginPath();ctx.arc(sx+Math.cos(a)*16*m,sy+Math.sin(a)*16*m,10,0,7);ctx.fill()}
  if(rp.toast&&rp.toast.life>0){rp.toast.life-=dt;ctx.globalAlpha=clamp(rp.toast.life,0,1);ctx.font='800 14px "Fredoka",system-ui,sans-serif';ctx.textAlign='center';const w=Math.min(RPW-20,ctx.measureText(rp.toast.t).width+24);
    const ty0=Math.round(52/(rpS||1));rr(ctx,RPW/2-w/2,ty0,w,28,10);ctx.fillStyle='rgba(20,10,53,.9)';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#ffd54a';ctx.stroke();ctx.fillStyle='#fff';ctx.fillText(rp.toast.t,RPW/2,ty0+19);ctx.globalAlpha=1}
  set_ctx(ctx0);
}
/* "!" over someone with a story scene waiting (ui-design.md §5) */
function rpMarker(id){return s6Marker(id)}
export {CHUNK,CHUNK_KEEP,rpChunk,rpDrawChunks,rpDrawMap,rpMapImage,rpMarker,rpNpcK,rpTile};
