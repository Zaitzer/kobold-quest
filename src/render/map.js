import {RPH,RPW,RT,rpDpr,rpS,rpctx,rpcv} from '../core/layout.js';
import {test} from '../core/rules.js';
import {rp,rpPlace} from '../core/state.js';
import {RP_CHESTS,RP_SPOTS} from '../data/world.js';
import {OL,WEAPONS,ctx,drawKobold,makeK,set_ctx} from '../engine/art.js';
import {R,clamp,rr,seeded} from '../engine/util.js';
import {rpHat} from '../game/stats.js';
import {rpChestKey,rpNpcs} from '../game/world.js';
import {netDrawTags,netPartnerK} from '../net/draw.js';
import {rpDrawSpot,rpTileRoom} from './rooms.js';
function rpTile(g,c,x,y,X,Y){
  if(rpTileRoom(g,c,x,y,X,Y))return;
  const r=seeded(x*131+y*977);
  const grass=()=>{g.fillStyle='#6cbf4c';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='rgba(30,80,20,.25)';for(let i=0;i<3;i++)g.fillRect(X+r()*28,Y+r()*28,3,2)};
  const forest=()=>{g.fillStyle='#3f7f3a';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='rgba(10,40,10,.3)';for(let i=0;i<3;i++)g.fillRect(X+r()*28,Y+r()*28,3,3)};
  const cave=()=>{g.fillStyle='#3d3247';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='rgba(255,230,255,.07)';for(let i=0;i<3;i++){g.beginPath();g.arc(X+r()*30,Y+r()*30,1.5,0,7);g.fill()}};
  const castle=()=>{g.fillStyle=(x+y)%2?'#5d4f72':'#665880';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='rgba(255,215,90,.12)';g.fillRect(X+2,Y+2,RT-4,2)};
  const up=rp.grid[y-1]&&rp.grid[y-1][x];
  switch(c){
    case '.':grass();break;
    case 'F':grass();['#ff8fb1','#ffe27a','#fff'].forEach((col,i)=>{g.fillStyle=col;g.beginPath();g.arc(X+6+r()*20,Y+6+r()*20,2.6,0,7);g.fill()});break;
    case ',':grass();g.strokeStyle='#3e8a2c';g.lineWidth=2;for(let i=0;i<6;i++){const a=X+3+r()*26,b2=Y+8+r()*22;g.beginPath();g.moveTo(a,b2);g.lineTo(a-2,b2-8);g.moveTo(a,b2);g.lineTo(a+3,b2-7);g.stroke()}break;
    case ';':forest();break;
    case 'T':forest();g.fillStyle='#6b4423';g.fillRect(X+13,Y+18,6,12);g.fillStyle=OL;g.beginPath();g.arc(X+16,Y+13,13,0,7);g.fill();g.fillStyle='#2f8a3a';g.beginPath();g.arc(X+16,Y+13,11,0,7);g.fill();g.fillStyle='#4fb04e';g.beginPath();g.arc(X+12,Y+9,5,0,7);g.fill();break;
    case '~':g.fillStyle='#3a8fd9';g.fillRect(X,Y,RT+1,RT+1);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;g.beginPath();g.moveTo(X+4,Y+10+(x%2)*8);g.quadraticCurveTo(X+10,Y+6+(x%2)*8,X+16,Y+10+(x%2)*8);g.stroke();break;
    case 'b':g.fillStyle='#3a8fd9';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='#a0703c';g.fillRect(X+3,Y,RT-6,RT);g.strokeStyle='#6b4423';g.lineWidth=1.5;for(let i=4;i<RT;i+=7){g.beginPath();g.moveTo(X+3,Y+i);g.lineTo(X+RT-3,Y+i);g.stroke()}break;
    case '=':g.fillStyle='#d8b98a';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='rgba(120,80,40,.18)';for(let i=0;i<3;i++)g.fillRect(X+r()*28,Y+r()*28,3,3);break;
    case '#':g.fillStyle='#4d3f57';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='#62526d';g.beginPath();g.ellipse(X+16,Y+14,13,10,0,0,7);g.fill();g.strokeStyle=OL;g.lineWidth=2;g.stroke();break;
    case 'H':case 'd':{g.fillStyle='#b9824e';g.fillRect(X,Y,RT+1,RT+1);g.strokeStyle='rgba(80,40,10,.4)';g.lineWidth=1.5;for(let i=8;i<RT;i+=8){g.beginPath();g.moveTo(X,Y+i);g.lineTo(X+RT,Y+i);g.stroke()}
      if(up!=='H'&&up!=='d'){g.fillStyle='#c4523a';g.fillRect(X,Y,RT,14);g.fillStyle='#e0745a';g.fillRect(X,Y,RT,4)}
      if(c==='d'){g.fillStyle='#5a3418';g.fillRect(X+8,Y+8,16,24);g.fillStyle='#ffd54a';g.fillRect(X+19,Y+20,3,3)}break}
    case 'W':g.fillStyle='#8c88a6';g.fillRect(X,Y,RT+1,RT+1);g.strokeStyle='#5d587a';g.lineWidth=2;g.strokeRect(X+1,Y+1,15,10);g.strokeRect(X+16,Y+1,15,10);g.strokeRect(X+8,Y+11,16,10);g.strokeRect(X+1,Y+21,15,10);g.strokeRect(X+16,Y+21,15,10);break;
    case 'K':castle();break;
    case 'S':grass();g.fillStyle=OL;g.fillRect(X+7,Y+6,18,24);g.fillStyle='#b8b2cc';g.fillRect(X+9,Y+8,14,20);g.fillStyle='#8f88a8';g.fillRect(X+6,Y+26,20,5);g.fillStyle='#ffe27a';g.beginPath();g.arc(X+16,Y+15,5,0,7);g.fill();g.fillStyle='#b8b2cc';g.beginPath();g.arc(X+18.5,Y+13.5,4,0,7);g.fill();break;
    case 'N':grass();g.fillStyle='#6b4423';g.fillRect(X+7,Y+18,3,12);g.fillRect(X+22,Y+18,3,12);g.fillStyle=OL;g.fillRect(X+3,Y+5,26,16);g.fillStyle='#c99a5e';g.fillRect(X+5,Y+7,22,12);g.fillStyle='#fff7e0';g.fillRect(X+8,Y+9,7,8);g.fillRect(X+17,Y+9,7,6);break;
    case 'M':grass();g.fillStyle=OL;g.fillRect(X+3,Y+6,26,6);g.fillStyle='#e05a8a';for(let i=0;i<4;i++)g.fillRect(X+4+i*6.5,Y+7,3.5,4);g.fillStyle='#fff';for(let i=0;i<4;i++)g.fillRect(X+7.5+i*6.5,Y+7,3,4);g.fillStyle='#6b4423';g.fillRect(X+5,Y+12,3,18);g.fillRect(X+24,Y+12,3,18);g.fillStyle=OL;g.fillRect(X+4,Y+20,24,8);g.fillStyle='#c99a5e';g.fillRect(X+5,Y+21,22,6);g.fillStyle='#ffd54a';g.beginPath();g.arc(X+11,Y+19,2.6,0,7);g.arc(X+17,Y+18,2.6,0,7);g.fill();break;
    case 'A':grass();g.fillStyle=OL;g.fillRect(X+5,Y+12,22,9);g.fillRect(X+11,Y+20,10,9);g.fillStyle='#6f7889';g.fillRect(X+7,Y+13,18,6);g.fillRect(X+13,Y+20,6,8);g.fillStyle='#ff8a2b';g.beginPath();g.arc(X+26,Y+26,3,0,7);g.fill();break;
    case 'X':castle();g.fillStyle='#3a3550';g.fillRect(X,Y,RT+1,RT+1);g.strokeStyle='#a8a4c8';g.lineWidth=3;for(let i=5;i<RT;i+=7){g.beginPath();g.moveTo(X+i,Y);g.lineTo(X+i,Y+RT);g.stroke()}g.fillStyle='#ffd54a';g.beginPath();g.arc(X+16,Y+16,4,0,7);g.fill();break;
    case 'C':cave();break;
    case 'g':cave();g.fillStyle='rgba(140,255,200,.25)';g.beginPath();g.arc(X+16,Y+18,12,0,7);g.fill();g.fillStyle='#e8fff4';g.fillRect(X+14,Y+18,4,8);g.fillStyle='#7dffc4';g.beginPath();g.ellipse(X+16,Y+17,8,5,0,Math.PI,0);g.fill();break;
    case 'c':g.fillStyle='#4d3f57';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='#0c0614';g.beginPath();g.ellipse(X+16,Y+22,12,14,0,Math.PI,0);g.fill();g.fillRect(X+4,Y+22,24,10);break;
    case 'z':{g.fillStyle=(x+y)%3?'#e9d18b':'#e3c97f';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='rgba(160,120,60,.25)';for(let i=0;i<4;i++)g.fillRect(X+r()*28,Y+r()*28,2,2);break}
    case 'q':{g.fillStyle='#e9d18b';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle=OL;g.fillRect(X+12,Y+4,9,26);g.fillRect(X+5,Y+11,7,4);g.fillRect(X+5,Y+8,4,8);g.fillRect(X+21,Y+14,7,4);g.fillRect(X+24,Y+9,4,9);
      g.fillStyle='#4f9a3f';g.fillRect(X+14,Y+6,5,23);g.fillRect(X+7,Y+12,6,2);g.fillRect(X+7,Y+10,2,5);g.fillRect(X+20,Y+15,6,2);g.fillRect(X+25,Y+11,2,6);break}
    case 'v':{g.fillStyle=(x+y)%2?'#eef4fb':'#e4edf7';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='rgba(120,150,190,.25)';for(let i=0;i<3;i++)g.fillRect(X+r()*28,Y+r()*28,4,2);break}
    case 'P':{g.fillStyle='#eef4fb';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='#5a3a22';g.fillRect(X+14,Y+22,5,8);g.fillStyle=OL;g.beginPath();g.moveTo(X+16,Y+1);g.lineTo(X+29,Y+24);g.lineTo(X+3,Y+24);g.closePath();g.fill();
      g.fillStyle='#2f6b4a';g.beginPath();g.moveTo(X+16,Y+4);g.lineTo(X+26,Y+22);g.lineTo(X+6,Y+22);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(X+16,Y+4);g.lineTo(X+20,Y+11);g.lineTo(X+12,Y+11);g.closePath();g.fill();break}
    default:grass();
  }
}
/* the map is drawn in chunks of 16 × 16 tiles, made the first time they come on screen and kept for a while
   (the world is far too big for one picture). rp.mapImg is the chunk store; setting it to null redraws everything. */
const CHUNK=16,CHUNK_KEEP=48;
function rpMapImage(){rp.mapImg={chunks:new Map(),k:Math.min(2.5,rpS*rpDpr)}}
function rpChunk(cx,cy){const M=rp.mapImg,key=cx+','+cy;let c=M.chunks.get(key);if(c){M.chunks.delete(key);M.chunks.set(key,c);return c}
  const W=rp.grid[0].length,H=rp.grid.length,k=M.k,x0=cx*CHUNK,y0=cy*CHUNK,x1=Math.min(W,x0+CHUNK),y1=Math.min(H,y0+CHUNK);
  c=document.createElement('canvas');c.width=Math.ceil((x1-x0)*RT*k);c.height=Math.ceil((y1-y0)*RT*k);
  const g=c.getContext('2d');g.setTransform(k,0,0,k,-x0*RT*k,-y0*RT*k);
  for(let y=y0;y<y1;y++){const row=rp.grid[y];for(let x=x0;x<x1;x++)rpTile(g,row[x],x,y,x*RT,y*RT)}
  RP_CHESTS.forEach(ch=>{if((ch.place||'world')!==rpPlace()||rp.s.chests.includes(rpChestKey(ch))||ch.x<x0||ch.x>=x1||ch.y<y0||ch.y>=y1)return;const X=ch.x*RT,Y=ch.y*RT;g.fillStyle=OL;g.fillRect(X+5,Y+10,22,17);g.fillStyle='#a0612a';g.fillRect(X+7,Y+12,18,13);g.fillStyle='#c07a3a';g.fillRect(X+7,Y+12,18,5);g.fillStyle='#ffd54a';g.fillRect(X+7,Y+16,18,2);g.fillRect(X+14,Y+15,4,5)});
  M.chunks.set(key,c);if(M.chunks.size>CHUNK_KEEP)M.chunks.delete(M.chunks.keys().next().value);return c}
/* draw the chunks the camera sees */
function rpDrawChunks(cx,cy){const k=rpS*rpDpr,size=CHUNK*RT,W=rp.grid[0].length,H=rp.grid.length;
  const a=Math.max(0,Math.floor(cx/size)),b=Math.min(Math.ceil(W/CHUNK)-1,Math.floor((cx+RPW)/size)),c=Math.max(0,Math.floor(cy/size)),d=Math.min(Math.ceil(H/CHUNK)-1,Math.floor((cy+RPH)/size));
  for(let j=c;j<=d;j++)for(let i=a;i<=b;i++){const im=rpChunk(i,j);ctx.drawImage(im,Math.round((i*size-cx)*k),Math.round((j*size-cy)*k),Math.round(im.width/rp.mapImg.k*k),Math.round(im.height/rp.mapImg.k*k))}}
function rpNpcK(n){let k=rp.npcK[n.id];if(!k){k=makeK({team:n.team,name:n.name,weapon:n.w,hat:n.hat,pers:'brave',speed:1,hp:30,size:(n.size||1)*.72},0,0,false);k.face=n.face;rp.npcK[n.id]=k}return k}
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
  const k=rpS*rpDpr;ctx.fillStyle=rp.s.place?'#1a0f24':'#2a64a8';ctx.fillRect(0,0,rpcv.width,rpcv.height);rpDrawChunks(cx,cy);
  ctx.setTransform(k,0,0,k,-cx*k,-cy*k);
  if(rp.path&&rp.path.length){ctx.fillStyle='rgba(255,226,122,.55)';rp.path.forEach(([x,y])=>{ctx.beginPath();ctx.arc(x*RT+16,y*RT+16,3,0,7);ctx.fill()})}
  for(const sp of RP_SPOTS)if((sp.place||'world')===rpPlace()&&test(sp.if)&&!rpDrawSpot(sp)&&sp.draw==='hat'){const X=sp.x*RT+16,Y=sp.y*RT+22+Math.sin(rp.t*3)*1.5;ctx.fillStyle=OL;ctx.beginPath();ctx.moveTo(X,Y-15);ctx.lineTo(X+9,Y+3);ctx.lineTo(X-9,Y+3);ctx.closePath();ctx.fill();ctx.fillStyle='#ff8a2b';ctx.beginPath();ctx.moveTo(X,Y-12);ctx.lineTo(X+6.5,Y+1.5);ctx.lineTo(X-6.5,Y+1.5);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(X-4,Y-4,8,2.2)}
  const ents=rpNpcs().map(n=>{const kk=rpNpcK(n);kk.x=n.x*RT+16;kk.y=n.y*RT+26;kk.t+=dt;kk.blink-=dt;if(kk.blink<-.12)kk.blink=R(2,5);kk.moving=false;kk.wa=.35+Math.sin(kk.t*2+kk.phase)*.4;
    if(Math.abs(s.x-n.x)+Math.abs(s.y-n.y)<=2){kk.face=s.x>n.x?1:s.x<n.x?-1:kk.face}return kk});
  const pk=rp.pk||(rp.pk=makeK({team:0,name:'Pip',weapon:s.party[0].w,hat:s.party[0].hat,pers:'brave',speed:1,hp:30,size:.72},0,0,false));
  if(pk.weapon!==s.party[0].w){pk.weapon=s.party[0].w;pk.W=WEAPONS[pk.weapon]}pk.hat=rpHat(s.party[0]);
  pk.x=px*RT+16;pk.y=py*RT+26;pk.t+=dt;pk.blink-=dt;if(pk.blink<-.12)pk.blink=R(2,5);pk.moving=rp.moving;if(rp.moving)pk.walk+=dt*12;
  if(s.face==='left')pk.face=-1;else if(s.face==='right')pk.face=1;pk.wa+=((WEAPONS[pk.weapon].ranged&&!WEAPONS[pk.weapon].magic?1.45:.35)-pk.wa)*Math.min(1,dt*10);
  ents.concat([pk],netPartnerK(dt)).sort((a,b)=>a.y-b.y).forEach(drawKobold);netDrawTags();
  // quest markers
  rpNpcs().forEach(n=>{const m=rpMarker(n.id);if(!m)return;const x=n.x*RT+16,y=n.y*RT-4+Math.sin(rp.t*4)*2;ctx.font='400 18px "Lilita One","Fredoka",system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle=OL;ctx.strokeText(m,x,y);ctx.fillStyle=m==='!'?'#ffd54a':'#9dff6e';ctx.fillText(m,x,y)});
  ctx.setTransform(k,0,0,k,0,0);
  const here=rp.grid[s.y][s.x];if(here==='C'||here==='g'||here==='c'){const gr=ctx.createRadialGradient(RPW/2,RPH/2,60,RPW/2,RPH/2,230);gr.addColorStop(0,'rgba(8,4,14,0)');gr.addColorStop(1,'rgba(8,4,14,.75)');ctx.fillStyle=gr;ctx.fillRect(0,0,RPW,RPH)}
  if(rp.stick&&rp.stick.on){const sx=rp.stick.lx*RPW,sy=rp.stick.ly*RPH,m=Math.min(1,Math.hypot(rp.stick.dx,rp.stick.dy)/40),a=Math.atan2(rp.stick.dy,rp.stick.dx);
    ctx.fillStyle='rgba(20,10,53,.35)';ctx.strokeStyle='rgba(255,226,122,.8)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(sx,sy,26,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,226,122,.9)';ctx.beginPath();ctx.arc(sx+Math.cos(a)*16*m,sy+Math.sin(a)*16*m,10,0,7);ctx.fill()}
  if(rp.toast&&rp.toast.life>0){rp.toast.life-=dt;ctx.globalAlpha=clamp(rp.toast.life,0,1);ctx.font='800 14px "Fredoka",system-ui,sans-serif';ctx.textAlign='center';const w=Math.min(RPW-20,ctx.measureText(rp.toast.t).width+24);
    const ty0=Math.round(52/(rpS||1));rr(ctx,RPW/2-w/2,ty0,w,28,10);ctx.fillStyle='rgba(20,10,53,.9)';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#ffd54a';ctx.stroke();ctx.fillStyle='#fff';ctx.fillText(rp.toast.t,RPW/2,ty0+19);ctx.globalAlpha=1}
  set_ctx(ctx0);
}
function rpMarker(id){const q=rp.s.q;
  if(id==='elder')return q.q1===0?'!':q.q1===1&&q.kills>=5?'?':'';
  if(id==='yarrow')return q.q1>=2&&q.q2===0?'!':q.q2===1&&q.glow>=3?'?':'';
  if(id==='gorb')return q.q2>=1?'!':'';if(id==='vexx')return q.gate?'!':'';if(id==='bork')return'';return''}
export {CHUNK,CHUNK_KEEP,rpChunk,rpDrawChunks,rpDrawMap,rpMapImage,rpMarker,rpNpcK,rpTile};
