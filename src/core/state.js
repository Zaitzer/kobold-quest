/* a fresh game state: the v6 save (core/save.js) fills it; the story (game/story.js) starts it */

function rpNewState(){return{v:6,x:0,y:0,face:'down',gold:30,party:[],bag:{potion:3,ether:1},inv:[],chests:[],q:{},steps:0}}
/* state */
const rp={grid:null,s:null,mode:'map',dlg:null,bt:null,move:null,path:null,held:null,grace:4,cam:{x:0,y:0},mapImg:null,npcK:{},pk:null,t:0,headless:false,sig:''};
/* which place the hero is in, for meeting others online. v6 phasing (systems.md §12): Hearthspire's morning (act 1, up to the gate)
   is your own copy of the place */
const PHASE=Math.random().toString(36).slice(2,8);
export {PHASE,rp,rpNewState};
