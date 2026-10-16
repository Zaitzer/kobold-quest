import {emit} from '../core/bus.js';
import {feature} from '../core/registry.js';
import {run,test} from '../core/rules.js';
import {rpSave} from '../core/save.js';
import {rp,rpApplyWorld,rpPlace} from '../core/state.js';
import {RP_IT} from '../data/items.js';
import {RP_DOORS,RP_PLACES} from '../data/places.js';
import {RP_NPC} from '../data/quests.js';
import {RP_CHESTS,RP_PICKUPS,RP_SOLID,RP_SPOTS} from '../data/world.js';
import {sfx} from '../engine/audio.js';
import {rpSay} from './dialogue.js';
import {rpGive,rpItemDesc} from './items.js';
function rpArea(x,y){if(rp.s.place&&RP_PLACES[rp.s.place])return RP_PLACES[rp.s.place].name;const c=rp.grid[y][x];if(c==='K'||c==='X')return"Dragon's Hoard";if(c==='C'||c==='g'||c==='c')return'Mushroom Cave';if(x<17&&y<15)return'Whisper Woods';if(y<15)return'North Road';if(x<14&&y>16)return'Burrowhome';return'Bandit Meadow'}
function rpNpcs(){const pl=rpPlace();return RP_NPC.filter(n=>(n.place||'world')===pl&&(!n.show||n.show(rp.s))).map(n=>{const p=n.pos&&n.pos(rp.s);return p?Object.assign({},n,p):n})}
function rpNpcAt(x,y){return rpNpcs().find(n=>n.x===x&&n.y===y)}
function rpSolid(x,y){if(x<0||y<0||!rp.grid[y]||x>=rp.grid[y].length)return true;const c=rp.grid[y][x];return RP_SOLID.has(c)||c==='d'||!!rpNpcAt(x,y)||!!(rp.s&&rp.s.chests&&rpChestAt(x,y))}
/* doors lead into rooms (data/places.js); standing on the way-out tile (e) leads back outside */
function rpDoor(x,y){const id=RP_DOORS[x+','+y];if(id)rpEnterPlace(id)}
function rpEnterPlace(id){const P=RP_PLACES[id],s=rp.s;if(!P)return;let ex=1,ey=1;P.rows.forEach((r,y)=>{const i=r.indexOf('e');if(i>=0){ex=i;ey=y}});
  s.place=id;s.x=ex;s.y=ey-1;s.face='up';rpApplyWorld();rp.pos=null;rp.path=null;rp.held=null;rp.grace=4;if(!rp.headless)sfx('drop');emit('place:enter',id);rpSave()}
function rpLeavePlace(){const s=rp.s,id=s.place;const door=Object.keys(RP_DOORS).find(k=>RP_DOORS[k]===id);delete s.place;
  s.face='down';rpApplyWorld();
  /* step out south of the door, or beside that if someone is standing there */
  if(door){const [x,y]=door.split(',').map(Number);const spot=[[0,1],[-1,1],[1,1],[0,2],[-1,2],[1,2]].find(([dx,dy])=>!rpSolid(x+dx,y+dy))||[0,1];s.x=x+spot[0];s.y=y+spot[1]}
  rp.pos=null;rp.path=null;rp.held=null;rp.grace=4;emit('place:leave',id);rpSave()}
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
/* opened chests are remembered as 'x,y' outdoors and 'room:x,y' inside */
function rpChestKey(c){return(c.place?c.place+':':'')+c.x+','+c.y}
function rpChestAt(x,y){const pl=rpPlace();return RP_CHESTS.find(c=>(c.place||'world')===pl&&c.x===x&&c.y===y&&!rp.s.chests.includes(rpChestKey(c)))}
function rpOpenChest(c){const s=rp.s;s.chests.push(rpChestKey(c));s.gold+=c.gold;rpGive(c.it);rp.mapImg=null;
  rpSay([{who:'',text:'A treasure chest! Inside: '+RP_IT[c.it].n+' and '+c.gold+' gold. ('+rpItemDesc(c.it)+')'},{who:'',text:'Open ☰ Heroes & gear to put it on.'}]);if(!rp.headless)sfx('win')}

feature({id:'doors',tiles:{d:{use:(x,y)=>rpDoor(x,y)},X:{use:()=>rpGate()}}});

/* pickups and quest spots: when Pip steps on a tile (see RP_PICKUPS and RP_SPOTS) */
feature({id:'pickups',on:{'tile:enter'(x,y,c){
  if(c==='e'&&rp.s.place){rpLeavePlace();return}
  const P=RP_PICKUPS[c];if(P){rp.grid[y][x]=P.becomes;rp.s.taken.push([x,y]);rp.mapImg=null;run(P.do)}
  for(const sp of RP_SPOTS)if((sp.place||'world')===rpPlace()&&sp.x===x&&sp.y===y&&test(sp.if)){if(sp.sfx&&!rp.headless)sfx(sp.sfx);run(sp.do)}}}});
export {rpArea,rpBfs,rpChestAt,rpChestKey,rpDoor,rpEnterPlace,rpGate,rpLeavePlace,rpNpcAt,rpNpcs,rpOpenChest,rpSolid};
