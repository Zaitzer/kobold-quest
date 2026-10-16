import {rpBuildWorld,rpWorldExtras} from '../data/world.js';
import {rpMember} from '../game/stats.js';
function rpNewState(){return{v:2,x:7,y:23,face:'down',gold:30,party:[rpMember('Pip','warrior',1)],bag:{potion:3,ether:1,feather:0},inv:[],chests:[],
  q:{q1:0,kills:0,q2:0,glow:0,key:0,gate:0,gorb:0,vexx:0,bork:0,wizzle:0,intro:0,cls:0},taken:[],steps:0}}
/* state */
const rp={grid:null,s:null,mode:'map',dlg:null,bt:null,move:null,path:null,held:null,grace:4,cam:{x:0,y:0},mapImg:null,npcK:{},pk:null,t:0,headless:false,sig:''};
function rpApplyWorld(){rp.grid=rpBuildWorld();rpWorldExtras(rp.grid);rp.s.taken.forEach(([x,y])=>{rp.grid[y][x]='C'});if(rp.s.q.gate)rp.grid[7][20]='K';rp.mapImg=null}
export {rp,rpApplyWorld,rpNewState};
