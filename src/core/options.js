import {store} from '../adapters/storage.js';
import {rpLayout} from './layout.js';
import {rp} from './state.js';
import {$} from '../engine/util.js';
const RP_OPT_KEY='kobold-pit-rpopt';
const rpOpt=Object.assign({hand:'left',buzz:true},store.get(RP_OPT_KEY,{}));
function rpOptSave(){store.set(RP_OPT_KEY,rpOpt);const v=$('v-rpg');if(v)v.classList.toggle('lefty',rpOpt.hand==='right');rpLayout()}
function rpBuzz(p){if(rp.headless||!rpOpt.buzz)return;try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
export {RP_OPT_KEY,rpBuzz,rpOpt,rpOptSave};
