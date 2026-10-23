import {emit} from './bus.js';
import {makeWorldGrid} from '../data/overworld.js';
import {RP_PLACES} from '../data/places.js';
import {rpBuildWorld,rpWorldExtras} from '../data/world.js';
import {rpMember} from '../game/stats.js';
import {w6Rows} from '../game/world6.js';
function rpNewState(){return{v:2,x:7,y:23,face:'down',gold:30,party:[rpMember('Pip','warrior',1)],bag:{potion:3,ether:1,feather:0},inv:[],chests:[],
  q:{q1:0,kills:0,q2:0,glow:0,key:0,gate:0,gorb:0,vexx:0,bork:0,wizzle:0,intro:0,cls:0,moot:0,seals:0},taken:[],steps:0}}
/* state */
const rp={grid:null,s:null,mode:'map',dlg:null,bt:null,move:null,path:null,held:null,grace:4,cam:{x:0,y:0},mapImg:null,npcK:{},pk:null,t:0,headless:false,sig:''};
/* which map Pip is on: 'world', or a room id from data/places.js */
/* v6 phasing (systems.md §12): Hearthspire's morning (act 1, up to the gate) is your own copy of the place */
const PHASE=Math.random().toString(36).slice(2,8);
function rpPlace(){if(rp.s&&rp.s.w6)return'w6:'+rp.s.w6+((rp.s.q.act||0)<7?':own:'+PHASE:'');return rp.s&&rp.s.place||'world'}
function rpApplyWorld(){if(rp.s.w6){const R=w6Rows(rp.s.w6);if(R){rp.grid=R.map(r=>r.split(''));rp.mapImg=null;emit('world:apply');return}}const P=rp.s.place&&RP_PLACES[rp.s.place];if(rp.s.place&&!P)delete rp.s.place;
  if(P)rp.grid=P.rows.map(r=>r.split(''));
  else{const old=rpBuildWorld();rpWorldExtras(old);rp.grid=makeWorldGrid(old)}
  rp.mapImg=null;emit('world:apply')}
export {PHASE,rp,rpApplyWorld,rpNewState,rpPlace};
