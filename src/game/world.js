import {feature} from '../core/registry.js';
import {run,test} from '../core/rules.js';
import {rp} from '../core/state.js';
import {RP_IT} from '../data/items.js';
import {RP_NPC} from '../data/quests.js';
import {RH,RP_CHESTS,RP_PICKUPS,RP_SOLID,RP_SPOTS,RW} from '../data/world.js';
import {sfx} from '../engine/audio.js';
import {rpSay} from './dialogue.js';
import {rpGive,rpItemDesc} from './items.js';
import {rpTalk} from './npcs.js';
function rpArea(x,y){const c=rp.grid[y][x];if(c==='K'||c==='X')return"Dragon's Hoard";if(c==='C'||c==='g'||c==='c')return'Mushroom Cave';if(x<17&&y<15)return'Whisper Woods';if(y<15)return'North Road';if(x<14&&y>16)return'Burrowhome';return'Bandit Meadow'}
function rpNpcs(){return RP_NPC.filter(n=>!n.show||n.show(rp.s)).map(n=>{const p=n.pos&&n.pos(rp.s);return p?Object.assign({},n,p):n})}
function rpNpcAt(x,y){return rpNpcs().find(n=>n.x===x&&n.y===y)}
function rpSolid(x,y){if(x<0||y<0||x>=RW||y>=RH)return true;const c=rp.grid[y][x];return RP_SOLID.has(c)||c==='d'||!!rpNpcAt(x,y)||!!(rp.s&&rp.s.chests&&rpChestAt(x,y))}
function rpDoor(x,y){
  if(x===3&&y===20)rpTalk('toast');else if(x===11&&y===20)rpTalk('biscuit');else if(x===4&&y===26)rpTalk('elder');
  else if(x===8&&y===4)rpSay([{who:'',text:'Bottles bubble behind the door of the witch\'s hut. Yarrow is outside.'}]);
}
function rpGate(){const q=rp.s.q;if(q.gate)return;
  if(q.key){q.gate=1;rp.grid[7][20]='K';rp.mapImg=null;rpSay([{who:'',text:'Gorb\'s key turns with a groan. The gate of the Dragon\'s Hoard swings open.'}]);sfx('win')}
  else rpSay([{who:'',text:'A huge iron gate. It has a keyhole the size of a fist.'}])}
function rpBfs(tx,ty,toNeighbor){
  const s=rp.s,key=(x,y)=>x+','+y,prev={},q=[[s.x,s.y]];prev[key(s.x,s.y)]=null;
  while(q.length){const [x,y]=q.shift();
    if(toNeighbor?Math.abs(x-tx)+Math.abs(y-ty)===1:x===tx&&y===ty){const out=[];let k=key(x,y);while(prev[k]!==null){const [px,py]=prev[k];out.unshift([+k.split(',')[0],+k.split(',')[1]]);k=key(px,py)}return out}
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(k in prev||rpSolid(nx,ny))continue;prev[k]=[x,y];q.push([nx,ny])}}
  return null;
}
/* chests */
function rpChestAt(x,y){return RP_CHESTS.find(c=>c.x===x&&c.y===y&&!rp.s.chests.includes(x+','+y))}
function rpOpenChest(c){const s=rp.s;s.chests.push(c.x+','+c.y);s.gold+=c.gold;rpGive(c.it);rp.mapImg=null;
  rpSay([{who:'',text:'A treasure chest! Inside: '+RP_IT[c.it].n+' and '+c.gold+' gold. ('+rpItemDesc(c.it)+')'},{who:'',text:'Open ☰ Heroes & gear to put it on.'}]);if(!rp.headless)sfx('win')}

feature({id:'doors',tiles:{d:{use:(x,y)=>rpDoor(x,y)},X:{use:()=>rpGate()}}});

/* pickups and quest spots: when Pip steps on a tile (see RP_PICKUPS and RP_SPOTS) */
feature({id:'pickups',on:{'tile:enter'(x,y,c){
  const P=RP_PICKUPS[c];if(P){rp.grid[y][x]=P.becomes;rp.s.taken.push([x,y]);rp.mapImg=null;run(P.do)}
  for(const sp of RP_SPOTS)if(sp.x===x&&sp.y===y&&test(sp.if)){if(sp.sfx&&!rp.headless)sfx(sp.sfx);run(sp.do)}}}});
export {rpArea,rpBfs,rpChestAt,rpDoor,rpGate,rpNpcAt,rpNpcs,rpOpenChest,rpSolid};
