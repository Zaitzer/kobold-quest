import {makeWorldGrid} from '../data/overworld.js';
import {RP_PLACES} from '../data/places.js';
import {rpBuildWorld,rpWorldExtras} from '../data/world.js';
import {rpMember} from '../game/stats.js';
function rpNewState(){return{v:2,x:7,y:23,face:'down',gold:30,party:[rpMember('Pip','warrior',1)],bag:{potion:3,ether:1,feather:0},inv:[],chests:[],
  q:{q1:0,kills:0,q2:0,glow:0,key:0,gate:0,gorb:0,vexx:0,bork:0,wizzle:0,intro:0,cls:0},taken:[],steps:0}}
/* state */
const rp={grid:null,s:null,mode:'map',dlg:null,bt:null,move:null,path:null,held:null,grace:4,cam:{x:0,y:0},mapImg:null,npcK:{},pk:null,t:0,headless:false,sig:''};
/* which map Pip is on: 'world', or a room id from data/places.js */
function rpPlace(){return rp.s&&rp.s.place||'world'}
function rpApplyWorld(){const P=rp.s.place&&RP_PLACES[rp.s.place];if(rp.s.place&&!P)delete rp.s.place;
  if(P)rp.grid=P.rows.map(r=>r.split(''));
  else{const old=rpBuildWorld();rpWorldExtras(old);rp.s.taken.forEach(([x,y])=>{if(old[y])old[y][x]='C'});if(rp.s.q.gate)old[7][20]='K';rp.grid=makeWorldGrid(old)}
  rp.mapImg=null}
export {rp,rpApplyWorld,rpNewState,rpPlace};
