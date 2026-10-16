/* Drawing the inside of houses: one function per room letter (see data/places.js). */
import {RT} from '../core/layout.js';
import {rp} from '../core/state.js';
import {OL,ctx} from '../engine/art.js';

const WOOD='#a8743f',WOOD_D='#7a4f27',WOOD_L='#c48d52';
function plank(g,X,Y,x,y){g.fillStyle=(x+y)%2?WOOD:'#b07a44';g.fillRect(X,Y,RT+1,RT+1);g.strokeStyle='rgba(70,35,10,.35)';g.lineWidth=1.5;
  for(let i=8;i<RT;i+=8){g.beginPath();g.moveTo(X,Y+i);g.lineTo(X+RT,Y+i);g.stroke()}
  g.beginPath();g.moveTo(X+((x*7+y*3)%4)*8,Y);g.lineTo(X+((x*7+y*3)%4)*8,Y+8);g.stroke()}
function box(g,X,Y,w,h,fill,dx,dy){g.fillStyle=OL;g.fillRect(X+dx-2,Y+dy-2,w+4,h+4);g.fillStyle=fill;g.fillRect(X+dx,Y+dy,w,h)}
const ROOM={
  f:(g,X,Y,x,y)=>plank(g,X,Y,x,y),
  e:(g,X,Y,x,y)=>{plank(g,X,Y,x,y);box(g,X,Y,24,12,'#d9b45a',4,10);g.fillStyle='#b8902f';for(let i=0;i<5;i++)g.fillRect(X+6+i*4,Y+12,2,8);
    g.fillStyle='rgba(255,240,180,.9)';g.beginPath();g.moveTo(X+16,Y+31);g.lineTo(X+11,Y+25);g.lineTo(X+21,Y+25);g.closePath();g.fill()},
  r:(g,X,Y,x,y,up,dn,lf,rt)=>{plank(g,X,Y,x,y);g.fillStyle='#b8384a';g.fillRect(X+(lf?0:3),Y+(up?0:3),RT-(lf?0:3)-(rt?0:3),RT-(up?0:3)-(dn?0:3));
    g.fillStyle='#e0b04a';if(!up)g.fillRect(X,Y+5,RT,2);if(!dn)g.fillRect(X,Y+RT-7,RT,2);if(!lf)g.fillRect(X+5,Y,2,RT);if(!rt)g.fillRect(X+RT-7,Y,2,RT)},
  w:(g,X,Y,x,y,up,dn)=>{g.fillStyle='#4a2f45';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='#5e3c57';for(let r=0;r<4;r++)for(let c=0;c<2;c++)g.fillRect(X+(r%2?8:0)+c*16+1,Y+r*8+1,14,6);
    if(dn&&!dn.wall){g.fillStyle='#2a1a2a';g.fillRect(X,Y+RT-4,RT+1,4)}},
  l:(g,X,Y,x,y)=>{plank(g,X,Y,x,y);g.fillStyle=OL;g.beginPath();g.ellipse(X+16,Y+18,9,7,0,0,7);g.fill();g.fillStyle=WOOD_L;g.beginPath();g.ellipse(X+16,Y+17,7,5,0,0,7);g.fill()},
  t:(g,X,Y,x,y)=>{plank(g,X,Y,x,y);box(g,X,Y,26,18,WOOD_D,3,6);g.fillStyle=WOOD_L;g.fillRect(X+3,Y+6,26,5);g.fillStyle='#fff3d6';g.fillRect(X+9,Y+12,6,5);g.fillStyle='#ffcf5a';g.fillRect(X+19,Y+11,4,7)},
  k:(g,X,Y,x,y,up,dn,lf,rt)=>{plank(g,X,Y,x,y);g.fillStyle=OL;g.fillRect(X+(lf&&lf.c==='k'?0:2),Y+6,RT-(lf&&lf.c==='k'?0:2)-(rt&&rt.c==='k'?0:2),24);
    g.fillStyle=WOOD_D;g.fillRect(X+(lf&&lf.c==='k'?0:4),Y+8,RT-(lf&&lf.c==='k'?0:4)-(rt&&rt.c==='k'?0:4),20);g.fillStyle=WOOD_L;g.fillRect(X+(lf&&lf.c==='k'?0:4),Y+8,RT-(lf&&lf.c==='k'?0:4)-(rt&&rt.c==='k'?0:4),5)},
  s:(g,X,Y,x,y)=>{plank(g,X,Y,x,y);box(g,X,Y,28,26,WOOD_D,2,2);g.fillStyle=WOOD_L;g.fillRect(X+2,Y+13,28,3);
    const cols=['#7fd0ff','#ff8a8a','#9dff6e','#ffd54a','#c9a0ff'];for(let i=0;i<4;i++){g.fillStyle=cols[(x*3+y+i)%5];g.fillRect(X+4+i*7,Y+5+(i%2),4,7);g.fillRect(X+5+i*6,Y+18,4,6)}},
  o:(g,X,Y,x,y)=>{plank(g,X,Y,x,y);g.fillStyle=OL;g.beginPath();g.ellipse(X+16,Y+17,11,13,0,0,7);g.fill();g.fillStyle='#9a6532';g.beginPath();g.ellipse(X+16,Y+17,9,11,0,0,7);g.fill();
    g.fillStyle='#5b5b6e';g.fillRect(X+7,Y+10,18,2);g.fillRect(X+7,Y+22,18,2)},
  p:(g,X,Y,x,y,up)=>{plank(g,X,Y,x,y);const top=!(up&&up.c==='p');box(g,X,Y,26,top?28:30,'#6a8fd8',3,top?2:0);if(top){g.fillStyle='#fff';g.fillRect(X+6,Y+5,20,8)}else{g.fillStyle='#5577c0';g.fillRect(X+3,Y+20,26,6)}},
  h:(g,X,Y,x,y)=>{g.fillStyle='#6d6177';g.fillRect(X,Y,RT+1,RT+1);g.fillStyle='#4e4458';g.fillRect(X+2,Y+2,13,8);g.fillRect(X+17,Y+2,13,8);
    g.fillStyle='#1b0f12';g.fillRect(X+5,Y+12,22,18);g.fillStyle='#ff8a2b';g.beginPath();g.moveTo(X+8,Y+30);g.quadraticCurveTo(X+16,Y+10,X+24,Y+30);g.fill();g.fillStyle='#ffe27a';g.beginPath();g.moveTo(X+12,Y+30);g.quadraticCurveTo(X+16,Y+18,X+20,Y+30);g.fill()},
  x:(g,X,Y,x,y)=>{plank(g,X,Y,x,y);g.fillStyle=OL;g.beginPath();g.ellipse(X+16,Y+20,13,10,0,0,7);g.fill();g.fillStyle='#2d2d3a';g.beginPath();g.ellipse(X+16,Y+20,11,8,0,0,7);g.fill();
    g.fillStyle='#7dff6e';g.beginPath();g.ellipse(X+16,Y+15,10,4,0,0,7);g.fill();g.fillStyle='#c6ffb0';g.beginPath();g.arc(X+12,Y+9,3,0,7);g.arc(X+20,Y+6,2,0,7);g.fill()},
  y:(g,X,Y,x,y)=>{plank(g,X,Y,x,y);box(g,X,Y,14,10,'#b8603a',9,19);g.fillStyle='#3f9a3a';g.beginPath();g.arc(X+16,Y+12,9,0,7);g.fill();g.fillStyle='#6cbf4c';g.beginPath();g.arc(X+13,Y+10,5,0,7);g.arc(X+20,Y+13,4,0,7);g.fill()}
};
/* draw a room tile; false when the letter is not a room letter (outdoor tiles are drawn by rpTile) */
function rpTileRoom(g,c,x,y,X,Y){const f=ROOM[c];if(!f||!rp.s||!rp.s.place)return false;
  const at=(dx,dy)=>{const r=rp.grid[y+dy],cc=r&&r[x+dx];return cc?{c:cc,wall:cc==='w'}:null},same=(dx,dy)=>{const a=at(dx,dy);return a&&a.c===c?a:null};
  f(g,X,Y,x,y,c==='r'?same(0,-1):at(0,-1),c==='r'?same(0,1):at(0,1),c==='r'?same(-1,0):at(-1,0),c==='r'?same(1,0):at(1,0));return true}
/* quest things lying on the floor, by their `draw` name in RP_SPOTS */
function rpDrawSpot(sp){const X=sp.x*RT+16,Y=sp.y*RT+22+Math.sin(rp.t*3)*1.5;
  if(sp.draw==='needles'){ctx.lineCap='round';ctx.strokeStyle=OL;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(X-9,Y+2);ctx.lineTo(X+7,Y-12);ctx.moveTo(X-5,Y+4);ctx.lineTo(X+11,Y-8);ctx.stroke();
    ctx.strokeStyle='#d8d8e8';ctx.lineWidth=2.5;ctx.stroke();ctx.fillStyle=OL;ctx.beginPath();ctx.arc(X+2,Y-1,7,0,7);ctx.fill();ctx.fillStyle='#ff7aa8';ctx.beginPath();ctx.arc(X+2,Y-1,5.5,0,7);ctx.fill();
    ctx.strokeStyle='#ffd0e0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(X+2,Y-1,3,0,4);ctx.stroke();return true}
  return false}
export {ROOM,WOOD,WOOD_D,WOOD_L,box,plank,rpDrawSpot,rpTileRoom};
