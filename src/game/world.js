/* The map the hero walks: who stands where, what is solid, and the path to a tapped tile. */
import {rp} from '../core/state.js';
import {s6Npcs} from './story6.js';
import {w6Solid,w6Title} from './world6.js';

function rpArea(){return rp.s&&rp.s.w6?w6Title(rp.s.w6):''}
function rpNpcs(){return rp.s&&rp.s.w6?s6Npcs():[]}
function rpNpcAt(x,y){return rpNpcs().find(n=>n.x===x&&n.y===y)}
function rpSolid(x,y){if(x<0||y<0||!rp.grid[y]||x>=rp.grid[y].length)return true;return w6Solid(rp.grid[y][x],x,y)||!!rpNpcAt(x,y)}
function rpBfs(tx,ty,toNeighbor){
  const s=rp.s,key=(x,y)=>x+','+y,prev={},q=[[s.x,s.y]];let seen=0;prev[key(s.x,s.y)]=null;
  while(q.length){const [x,y]=q.shift();
    if(toNeighbor?Math.abs(x-tx)+Math.abs(y-ty)===1:x===tx&&y===ty){const out=[];let k=key(x,y);while(prev[k]!==null){const [px,py]=prev[k];out.unshift([+k.split(',')[0],+k.split(',')[1]]);k=key(px,py)}return out}
    if(++seen>6000)return null;   /* only search near the hero (taps are always on screen) */
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(k in prev||rpSolid(nx,ny)||Math.abs(nx-s.x)+Math.abs(ny-s.y)>40)continue;prev[k]=[x,y];q.push([nx,ny])}}
  return null}
export {rpArea,rpBfs,rpNpcAt,rpNpcs,rpSolid};
