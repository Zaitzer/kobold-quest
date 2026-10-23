/* ---------- Kobold Quest v6: drawing the slice's maps (build step 11) ----------
   One small drawing per tile letter of tools/slicemaps.js, in the style guide's palette, until the art/v6 tiles are loaded (step 19).
   The dark floor is drawn over the map: unlit tiles outside the light are nearly black (systems.md §9). */
import {RPH,RPW,RT} from '../core/layout.js';
import {test} from '../core/rules.js';
import {rp} from '../core/state.js';
import {MAPS6} from '../data/v6/maps.js';
import {OL} from '../engine/art.js';
import {seeded} from '../engine/util.js';
import {isRoom,w6Flooded,w6Lit,w6Patrols,w6Strength} from '../game/world6.js';

const OUT6={'.':'#6cbf4c',',':'#c9a36a','"':'#3f8f3a',M:'#d9d2e6',k:'#bcb3cc',N:'#e0b85a','=':'#a8743f',G:'#ffd54a',D:'#7a4f27',h:'#5a3a1a','#':'#4d3f57',K:'#62526d',
  B:'#c4523a',T:'#24672d','~':'#3a8fd9',F:'#7bb6e6',b:'#a8743f',o:'#ffd54a',t:'#8a7a8f',r:'#62526d',O:'#9aa0b0',W:'#7a4f27',f:'#8a7360',R:'#6b5545',d:'#3b2f2a',w:'#4d7fa8',
  X:'#2a1f1d',x:'#a8743f',S:'#ffb347',u:'#ffd54a',v:'#ffd54a',C:'#ff8a3a',P:'#d98a3a'};
const ROOM6={w:'#4d3f57',q:'#c9a36a',e:'#ffd54a',n:'#b0574a',s:'#7a4f27',m:'#4a35b0',p:'#c4523a',l:'#a8743f',z:'#7a4f27',y:'#3f7f3a',c:'#d9a43a',a:'#eee6d0',g:'#5a3a1a',_:'#7a4f27',H:'#b0574a','|':'#ffd54a',o:'#a8743f'};
/* what each standing thing stands on */
const UNDER6={c:'.','|':'k',T:'.',F:'M',b:'M',o:'.',r:'.',O:'.',x:'f',P:'f',S:'R',C:'f',u:'f',v:'f',W:'~'};
function w6Tile(g,c,x,y,X,Y){const room=isRoom(rp.s.w6),r=seeded(x*131+y*977),fill=col=>{g.fillStyle=col;g.fillRect(X,Y,RT+1,RT+1)};
  const speck=(col,n)=>{g.fillStyle=col;for(let i=0;i<n;i++)g.fillRect(X+r()*28,Y+r()*28,3,2)};
  if(room){fill(ROOM6[c]||'#c9a36a');
    if(c==='q'||c==='e'){speck('rgba(80,40,10,.18)',3);if(c==='e'){g.fillStyle='rgba(255,213,74,.55)';g.fillRect(X+4,Y+4,RT-8,RT-8)}}
    else if(c==='w'){g.fillStyle='rgba(255,255,255,.08)';g.fillRect(X,Y,RT,4)}
    else if(c!=='g'){fill('#c9a36a');g.fillStyle=OL;g.fillRect(X+3,Y+3,RT-6,RT-6);g.fillStyle=ROOM6[c]||'#7a4f27';g.fillRect(X+5,Y+5,RT-10,RT-10);if(c==='H'){g.fillStyle='#ffd54a';g.fillRect(X+11,Y+10,10,10)}}
    else{g.fillStyle='#2a1808';g.fillRect(X+6,Y+6,RT-12,RT-12)}
    return}
  const base=c==='c'&&/mine/.test(rp.s.w6)?'f':UNDER6[c];fill(OUT6[base||c]||'#ff00ff');
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
function w6Overlay(ctx,cx,cy){const p=rp.s.w6,s=rp.s;w6DrawPatrols(ctx,cx,cy,p);w6DrawFlood(ctx,cx,cy,p);w6Weather(ctx,p);if(p!=='mine2')return;const x0=Math.floor(cx/RT),y0=Math.floor(cy/RT),x1=Math.ceil((cx+RPW)/RT),y1=Math.ceil((cy+RPH)/RT);
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
export {OUT6,ROOM6,UNDER6,w6DrawFlood,w6DrawPatrols,w6Overlay,w6Tile,w6Weather};
