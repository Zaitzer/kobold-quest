/* a fresh game state: the v6 save (core/save6.js) fills it; the story (game/story6.js) starts it */
import {emit} from './bus.js';
import {w6Rows} from '../game/world6.js';

function rpNewState(){return{v:6,x:0,y:0,face:'down',gold:30,party:[],bag:{potion:3,ether:1},inv:[],chests:[],q:{},steps:0}}
/* state */
const rp={grid:null,s:null,mode:'map',dlg:null,bt:null,move:null,path:null,held:null,grace:4,cam:{x:0,y:0},mapImg:null,npcK:{},pk:null,t:0,headless:false,sig:''};
/* which place the hero is in, for meeting others online. v6 phasing (systems.md §12): Hearthspire's morning (act 1, up to the gate)
   is your own copy of the place */
const PHASE=Math.random().toString(36).slice(2,8);
function rpPlace(){if(!rp.s||!rp.s.w6)return'none';return'w6:'+rp.s.w6+((rp.s.q.act||0)<7?':own:'+PHASE:'')}
function rpApplyWorld(){const R=rp.s&&rp.s.w6&&w6Rows(rp.s.w6);if(R)rp.grid=R.map(r=>r.split(''));rp.mapImg=null;emit('world:apply')}
export {PHASE,rp,rpApplyWorld,rpNewState,rpPlace};
