/* Loads Joakim's drawings (art/sprites): built into the Claude page as KQ_ART, or fetched from the website's art folder,
   which the server fills from the repo on every update. Drawings that arrive redraw the map. */
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {onSpriteLoad,spritesInit} from '../engine/sprites.js';

feature({id:'art',init(){
  onSpriteLoad(()=>{rp.mapImg=null});
  if(typeof KQ_ART!=='undefined'&&KQ_ART){spritesInit(KQ_ART);return}
  if(typeof SITE!=='undefined'&&SITE&&typeof fetch==='function')
    fetch('art/manifest.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(m=>{const L={};for(const n in m)L[n]='art/'+n+'.png?v='+m[n].v;spritesInit(L)}).catch(()=>{});
}});
