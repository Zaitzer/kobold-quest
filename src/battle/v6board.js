/* ---------- Kobold Quest v6: battle boards by theme (systems.md §2, build step 9) ----------
   The engine's generator (tcGen) makes the terrain; a v6 theme picks its base and adds what is new: dark boards (sight 3), flooded
   boards (difficult water), town boards, and for bosses the rule that the 2 × 2 boss can reach every tile a kobold can stand on. */
import {tcBase,tcGen,tcT} from './rules.js';
import {TC_DIR8} from '../data/battle.js';
import {seeded} from '../engine/util.js';

const V6_THEMES={meadow:{base:'meadow'},woods:{base:'woods'},cave:{base:'cave'},town:{base:'castle'},dark:{base:'cave',dark:1},flooded:{base:'cave',flood:1}};
function v6Theme(t){return V6_THEMES[t]||V6_THEMES.meadow}
/* the tiles a 2 × 2 unit can stand on (top-left corners), flooding out from its start */
function v6BigReach(g,W,H,sx,sy){const open=(x,y)=>x>=0&&y>=0&&x+1<W&&y+1<H&&!tcT(g[y][x]).solid&&!tcT(g[y][x+1]).solid&&!tcT(g[y+1][x]).solid&&!tcT(g[y+1][x+1]).solid;
  const seen=new Set();if(!open(sx,sy))return seen;const q=[[sx,sy]];seen.add(sy*W+sx);
  while(q.length){const [x,y]=q.pop();for(const [dx,dy] of TC_DIR8){const nx=x+dx,ny=y+dy,k=ny*W+nx;if(seen.has(k)||!open(nx,ny))continue;seen.add(k);q.push([nx,ny])}}
  return seen}
/* every open tile must be within one step of a tile the boss can cover; where one is not, the rocks around it are cleared */
function v6BossRoom(g,W,H,base){const sx=(W>>1)-1,sy=1;
  for(let it=0;it<200;it++){const R=v6BigReach(g,W,H,sx,sy),near=new Uint8Array(W*H);
    R.forEach(k=>{const x=k%W,y=(k/W)|0;for(let j=-1;j<=2;j++)for(let i=-1;i<=2;i++){const X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<W&&Y<H)near[Y*W+X]=1}});
    let lost=null;for(let y=0;y<H&&!lost;y++)for(let x=0;x<W;x++)if(!tcT(g[y][x]).solid&&!near[y*W+x]){lost=[x,y];break}
    if(!lost)return it;v6Carve(g,W,H,base,lost,R,2)}
  return -1}
/* clear a corridor (2 wide for the boss) from a lost tile toward the nearest tile in reach */
function v6Carve(g,W,H,base,[x,y],R,w){let goal=null,gd=1e9;R.forEach(k=>{const kx=k%W,ky=(k/W)|0,d=Math.hypot(kx-x,ky-y);if(d<gd){gd=d;goal=[kx,ky]}});if(!goal)return;
  const clear=(cx,cy)=>{for(let j=0;j<w;j++)for(let i=0;i<w;i++){const X=Math.min(W-1,cx+i),Y=Math.min(H-1,cy+j);if(tcT(g[Y][X]).solid)g[Y][X]=base}};
  let cx=Math.min(x,W-w),cy=Math.min(y,H-w);clear(cx,cy);while(cx!==goal[0]||cy!==goal[1]){if(cx!==goal[0])cx+=Math.sign(goal[0]-cx);else cy+=Math.sign(goal[1]-cy);clear(cx,cy)}}   // one axis at a time: no diagonal squeezes
/* every open tile reachable on foot from the pack's start (the engine's own pass gives up after 30 tries) */
function v6Reach(g,W,H,base){for(let it=0;it<200;it++){const seen=new Set([(H-1)*W+(W>>1)]),q=[[W>>1,H-1]];
    while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=ny*W+nx;if(nx<0||ny<0||nx>=W||ny>=H||seen.has(k)||tcT(g[ny][nx]).solid)continue;seen.add(k);q.push([nx,ny])}}
    let lost=null;for(let y=0;y<H&&!lost;y++)for(let x=0;x<W;x++)if(!tcT(g[y][x]).solid&&!seen.has(y*W+x)){lost=[x,y];break}
    if(!lost)return it;v6Carve(g,W,H,base,lost,seen,1)}return -1}
function v6Gen(theme,W,H,boss,seed){const T=v6Theme(theme),g=tcGen(T.base,W,H,boss,seed),r=seeded(seed^0x5bd1e995),base=tcBase(T.base);
  if(T.flood){/* wide pools of difficult water (move cost 2) across the middle rows, never on the starting rows */
    for(let i=0;i<3;i++){const cx=r()*W|0,cy=2+(r()*(H-6)|0),R0=1.5+r()*1.5;for(let y=cy-3;y<=cy+3;y++)for(let x=cx-3;x<=cx+3;x++)
      if(x>=0&&y>=0&&x<W&&y<H-3&&Math.hypot(x-cx,y-cy)<=R0&&!tcT(g[y][x]).solid)g[y][x]='~'}}
  if(boss)v6BossRoom(g,W,H,base);
  v6Reach(g,W,H,base);
  return g}
export {V6_THEMES,v6BigReach,v6BossRoom,v6Carve,v6Gen,v6Reach,v6Theme};
