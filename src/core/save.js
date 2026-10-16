/* Saves: one format with a version number. When the format changes, bump SAVE_VERSION and add a migration
   from the previous version to MIGRATIONS, so any older save (local or cloud) is upgraded as it loads.
   Copies of the save come from sources (this browser, the cloud when online); the newest valid one wins. */
import {store} from '../adapters/storage.js';
import {emit} from './bus.js';
import {rp} from './state.js';
import {rpAutoTalents,rpClsOfWeapon,rpStats} from '../game/stats.js';

const SAVE_KEY='kobold-pit-rpg',SAVE_VERSION=2;
/* where this browser keeps its copy: the website keeps one per account */
let saveKey=SAVE_KEY;
function setSaveKey(k){saveKey=k}
const MIGRATIONS={
  /* v1 → v2: classes, talents and equipment arrived; rebuild each kobold at its level */
  1(o){o.inv=[];o.chests=[];o.q.cls=1;o.party.forEach(m=>{m.cls=rpClsOfWeapon(m.w);m.eq={};m.tal=[];m.pend=0;m.offer=null;const l=m.lvl;m.lvl=1;while(m.lvl<l){m.lvl++;rpAutoTalents(m,1)}
    const st=rpStats(m);m.hp=Math.min(m.hp||st.hp,st.hp);m.mp=Math.min(m.mp||st.mp,st.mp);delete m.hat})}
};
const saveSources=[{id:'local',get:()=>store.get(saveKey,null)}];
function migrate(o){
  if(!o||typeof o!=='object'||!Array.isArray(o.party)||!o.party.length||!o.q)return null;
  o=JSON.parse(JSON.stringify(o));o.v=o.v||1;
  while(o.v<SAVE_VERSION){const m=MIGRATIONS[o.v];if(!m)return null;m(o);o.v++}
  if(o.v!==SAVE_VERSION)return null;/* a save from a newer version than this page: leave it alone */
  for(const k of ['inv','chests','taken'])if(!Array.isArray(o[k]))o[k]=[];
  if(!o.bag)o.bag={};return o}
function rpLoad(){let best=null;
  for(const src of saveSources){let o=null;try{o=src.get()}catch(e){}if(o&&o.party&&o.party.length&&(!best||(o.savedAt||0)>(best.savedAt||0)))best=o}
  try{return migrate(best)}catch(e){return null}}
function rpSave(){if(rp.headless)return;rp.s.savedAt=Date.now();store.set(saveKey,rp.s);emit('save',rp.s)}
export {MIGRATIONS,SAVE_KEY,SAVE_VERSION,migrate,rpLoad,rpSave,saveKey,saveSources,setSaveKey};
