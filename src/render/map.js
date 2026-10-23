/* Drawing the map: its tiles (below), the people standing on it, Pip, friends, and the "!" over someone with a scene */
import {RPH,RPW,RT,rpDpr,rpS,rpctx,rpcv} from '../core/layout.js';
import {test} from '../core/rules.js';
import {rp} from '../core/state.js';
import {MAPS6,TILES6} from '../data/v6/maps.js';
import {OL,WEAPONS,ctx,drawKobold,makeK,set_ctx} from '../engine/art.js';
import {byBase,sheetOfKobold,sheetOfNpc} from '../engine/sheets.js';
import {artName,sprite} from '../engine/sprites.js';
import {R,clamp,rr,seeded} from '../engine/util.js';
import {s6Marker} from '../game/story.js';
import {isRoom,rpNpcs,w6Flooded,w6Lit,w6Patrols,w6Strength} from '../game/world.js';
import {netDrawTags,netPartnerK} from '../net/draw.js';

/* every tile is drawn by the v6 renderer (map.js) */
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
function rpNpcK(n){let k=rp.npcK[n.id];if(!k){k=makeK({team:n.team,name:n.name,art:artName(n.art||n.id),weapon:n.w,hp:30,size:(n.size||1)*.72},0,0,false);k.face=n.face||1;   /* never undefined: a scale of NaN is skipped by the canvas, which drew people a third too big until Pip came near */
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
  const pk=rp.pk||(rp.pk=makeK({team:0,name:'Pip',art:'pip',weapon:P0.w,hp:30,size:.72},0,0,false));
  if(pk.weapon!==P0.w){pk.weapon=P0.w;pk.W=WEAPONS[pk.weapon]}
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

/* ---------- Kobold Quest v6: drawing the slice's maps (build step 11) ----------
   One small drawing per tile letter of world/tiles.json, in the style guide's palette, until the art/ tiles are loaded (step 19).
   The dark floor is drawn over the map: unlit tiles outside the light are nearly black (systems.md §9). */

/* the tile letters (world/tiles.json): each one's colour, the art/tiles sheet it is drawn with, what a standing thing
   stands on; a letter with no drawn sheet keeps its drawing in code */
const T6=(room,c)=>TILES6[room?'room':'map'][c]||null;
const col6=(room,c,dflt)=>{const t=T6(room,c);return t&&t.colour||dflt};
const tileSheet=c=>{const t=T6(false,c);return t&&t.sheet?byBase(t.sheet):null};
function tileImg(g,key,X,Y){const s=sprite(key);if(!s)return;const sm=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;g.drawImage(s.img,0,0,32,32,X,Y,RT+1,RT+1);g.imageSmoothingEnabled=sm}
const under6=c=>{const t=T6(false,c);return t&&t.under||null};
function w6Tile(g,c,x,y,X,Y){const room=isRoom(rp.s.w6),r=seeded(x*131+y*977),fill=col=>{g.fillStyle=col;g.fillRect(X,Y,RT+1,RT+1)};
  const speck=(col,n)=>{g.fillStyle=col;for(let i=0;i<n;i++)g.fillRect(X+r()*28,Y+r()*28,3,2)};
  if(room){fill(col6(true,c,'#c9a36a'));
    if(c==='q'||c==='e'){speck('rgba(80,40,10,.18)',3);if(c==='e'){g.fillStyle='rgba(255,213,74,.55)';g.fillRect(X+4,Y+4,RT-8,RT-8)}}
    else if(c==='w'){g.fillStyle='rgba(255,255,255,.08)';g.fillRect(X,Y,RT,4)}
    else if(c!=='g'){fill('#c9a36a');g.fillStyle=OL;g.fillRect(X+3,Y+3,RT-6,RT-6);g.fillStyle=col6(true,c,'#7a4f27');g.fillRect(X+5,Y+5,RT-10,RT-10);if(c==='H'){g.fillStyle='#ffd54a';g.fillRect(X+11,Y+10,10,10)}}
    else{g.fillStyle='#2a1808';g.fillRect(X+6,Y+6,RT-12,RT-12)}
    return}
  /* a tile with a sheet (art/tiles, build step 19; a stand-in until drawn): frame 1 of the sheet, pixel for pixel; a standing thing is drawn on its ground first */
  {const key=tileSheet(c);if(key){const under=under6(c),uk=under&&tileSheet(under);if(under&&!uk){fill(col6(false,under,'#6cbf4c'))}else if(uk)tileImg(g,uk,X,Y);tileImg(g,key,X,Y);return}}
  const base=c==='c'&&/mine/.test(rp.s.w6)?'f':under6(c);fill(col6(false,base||c,'#ff00ff'));
  switch(base?base:c){case'.':speck('rgba(30,80,20,.25)',3);break;case'"':g.strokeStyle='#24672d';g.lineWidth=2;for(let i=0;i<5;i++){const a=X+3+r()*26,b=Y+10+r()*20;g.beginPath();g.moveTo(a,b);g.lineTo(a-2,b-8);g.stroke()}break;
    case',':speck('rgba(120,80,40,.25)',3);break;case'M':case'k':g.strokeStyle='rgba(60,40,90,.18)';g.strokeRect(X+.5,Y+.5,RT-1,RT-1);break;case'f':case'R':case'd':speck('rgba(0,0,0,.2)',3);break;
    case'~':case'w':g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;g.beginPath();g.moveTo(X+4,Y+12+(x%2)*6);g.quadraticCurveTo(X+16,Y+6+(x%2)*6,X+28,Y+12+(x%2)*6);g.stroke();break}
  if(c==='R'||c==='S'){g.fillStyle='#4a3a2a';g.fillRect(X,Y+10,RT,3);g.fillRect(X,Y+19,RT,3);g.fillStyle='#8a7360';for(let i=2;i<RT;i+=8)g.fillRect(X+i,Y+8,3,16)}
  const thing=(col,shape)=>{g.fillStyle=OL;shape(2);g.fillStyle=col;shape(0)};
  if(c==='T')thing('#3f7f3a',e=>{g.beginPath();g.arc(X+16,Y+13,12+e,0,7);g.fill();g.fillRect(X+13-e/2,Y+20,6+e,10+e/2)});
  if(c==='r')thing('#7d6c8a',e=>{g.beginPath();g.ellipse(X+16,Y+18,12+e,9+e,0,0,7);g.fill()});
  if(c==='O')thing('#9aa0b0',e=>{g.fillRect(X+10-e,Y+4-e,12+2*e,24+2*e)});
  if(c==='o')thing('#ffd54a',e=>{g.fillRect(X+5-e,Y+6-e,22+2*e,14+2*e);g.fillRect(X+14-e,Y+18,4+2*e,12)});
  if(c==='b')thing('#a8743f',e=>{g.fillRect(X+3-e,Y+14-e,26+2*e,8+2*e)});
  if(c==='F')thing('#7bb6e6',e=>{g.beginPath();g.ellipse(X+16,Y+18,14+e,10+e,0,0,7);g.fill()});
  if(c==='x')thing('#a8743f',e=>{g.fillRect(X+4-e,Y+8-e,24+2*e,16+2*e)});
  if(c==='P')thing('#d98a3a',e=>{g.beginPath();g.moveTo(X+2-e,Y+28+e);g.lineTo(X+16,Y+6-2*e);g.lineTo(X+30+e,Y+28+e);g.fill()});
  if(c==='C')thing('#ff8a3a',e=>{g.beginPath();g.moveTo(X+8-e,Y+26+e);g.lineTo(X+16,Y+6-e);g.lineTo(X+24+e,Y+26+e);g.fill()});
  if(c==='c'){g.fillStyle=OL;g.fillRect(X+5,Y+10,22,17);g.fillStyle='#a0612a';g.fillRect(X+7,Y+12,18,13);g.fillStyle='#c07a3a';g.fillRect(X+7,Y+12,18,5);g.fillStyle='#ffd54a';g.fillRect(X+7,Y+16,18,2);g.fillRect(X+14,Y+15,4,5)}
  if(c==='|')thing('#ffd54a',e=>{g.fillRect(X+8-e,Y+4-e,16+2*e,24+2*e)});
  if(c==='S'){g.fillStyle=OL;g.fillRect(X+12,Y+4,8,24);g.fillStyle='#ffb347';g.fillRect(X+14,Y+6,4,20)}
  if(c==='u'||c==='v'){g.fillStyle=OL;for(let i=0;i<4;i++)g.fillRect(X+4,Y+4+i*7,RT-8,2);g.fillStyle=c==='u'?'#fff3c4':'#2a1808';g.fillRect(X+12,Y+12,8,8)}
  if(c==='B'||c==='K'||c==='#'||c==='X'||c==='t'){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(X,Y+RT-6,RT,6);g.fillStyle='rgba(255,255,255,.1)';g.fillRect(X,Y,RT,3)}
  if(c==='D'||c==='G'||c==='h'){g.fillStyle=OL;g.fillRect(X+6,Y+3,RT-12,RT-3);g.fillStyle=c==='G'?'#ffd54a':'#7a4f27';g.fillRect(X+8,Y+5,RT-16,RT-5)}}
/* the dark floor: tiles out of the light are covered (systems.md §9; sight 3 on the map) */
function w6Overlay(ctx,cx,cy){const p=rp.s.w6,s=rp.s;w6DrawPatrols(ctx,cx,cy,p);w6DrawFlood(ctx,cx,cy,p);w6Weather(ctx,p);if(!(MAPS6[p]&&MAPS6[p].dark))return;const x0=Math.floor(cx/RT),y0=Math.floor(cy/RT),x1=Math.ceil((cx+RPW)/RT),y1=Math.ceil((cy+RPH)/RT);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=rp.grid[y]&&rp.grid[y][x];if(c!=='d')continue;if(w6Lit(p,x,y))continue;const d=Math.hypot(x-s.x,y-s.y);
    ctx.fillStyle='rgba(8,4,14,'+(d<=3?0.25:0.9)+')';ctx.fillRect((x*RT-cx),(y*RT-cy),RT+1,RT+1)}}
/* patrols: a foe with its strength word, facing along the road */
function w6DrawPatrols(ctx,cx,cy,p){for(const t of w6Patrols(p)){const X=t.x*RT-cx,Y=t.y*RT-cy;if(X<-RT||Y<-RT||X>RPW||Y>RPH)continue;
  ctx.fillStyle=OL;ctx.beginPath();ctx.ellipse(X+16,Y+18,13,11,0,0,7);ctx.fill();ctx.fillStyle='#8a2f4a';ctx.beginPath();ctx.ellipse(X+16,Y+18,11,9,0,0,7);ctx.fill();
  const f=t.face==='west'?-1:1;ctx.fillStyle='#fff';ctx.fillRect(X+16+f*5-2,Y+13,4,4);ctx.fillStyle=OL;ctx.fillRect(X+16+f*6-1,Y+14,2,3);
  ctx.font='700 11px "Fredoka",system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=OL;const w=w6Strength(p);ctx.strokeText(w,X+16,Y-2);ctx.fillStyle='#ffd54a';ctx.fillText(w,X+16,Y-2)}}
/* the flooded south road, while the dam is shut */
function w6DrawFlood(ctx,cx,cy,p){const F=MAPS6[p]&&MAPS6[p].flood;if(!F||!w6Flooded(p,F[0][0],F[0][1]))return;ctx.fillStyle='rgba(58,143,217,.85)';
  for(let y=F[0][1];y<=F[1][1];y++){ctx.fillRect(F[0][0]*RT-cx-RT,y*RT-cy,RT*3,RT+1)}}
/* flour dust drifting in Pebblebrook once the mill turns (systems.md §15, flavour only) */
function w6Weather(ctx,p){if(p!=='pebblebrook'||!test({pb:{gte:6}}))return;ctx.fillStyle='rgba(255,250,235,.55)';const t=rp.t||0;
  for(let i=0;i<40;i++){const x=((i*97+t*14*(1+i%3))%RPW+RPW)%RPW,y=((i*53+t*9)%RPH+RPH)%RPH;ctx.fillRect(x,y,2,2)}}
export {CHUNK,CHUNK_KEEP,T6,col6,rpChunk,rpDrawChunks,rpDrawMap,rpMapImage,rpMarker,rpNpcK,rpTile,tileImg,tileSheet,under6,w6DrawFlood,w6DrawPatrols,w6Overlay,w6Tile,w6Weather};
