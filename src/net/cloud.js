/* ---------- cloud saves: my character lives in my private corner of the page's database ---------- */
import {view} from '../core/app.js';
import {feature} from '../core/registry.js';
import {saveSources} from '../core/save.js';
import {rp} from '../core/state.js';
import {rpToast} from '../game/dialogue.js';
import {rpStart} from '../game/play.js';
import {net} from './core.js';

async function netCloudInit(){try{net.cloudRef=net.db.doc('data/users/'+net.me+'/save');const sn=await net.cloudRef.get();net.cloud=sn.exists?sn.data():null;
    if(net.cloud&&rp.s&&view==='rpg'&&(net.cloud.savedAt||0)>(rp.s.savedAt||0)+2000){rpStart(false);rpToast('Loaded your save from the cloud')}}catch(e){}}
function netCloudSave(){if(!net.cloudRef||!rp.s||rp.headless)return;clearTimeout(net.cloudT);
  net.cloudT=setTimeout(async()=>{if(net.cloudBusy){netCloudSave();return}net.cloudBusy=true;try{const d=JSON.parse(JSON.stringify(rp.s));await net.cloudRef.set(d);net.cloud=d}catch(e){}net.cloudBusy=false},2500)}

feature({id:'cloud-save',on:{save:()=>netCloudSave()}});
/* the cloud copy is one more place a save can come from (core/save.js picks the newest) */
saveSources.push({id:'cloud',get:()=>net.cloud});
export {netCloudInit,netCloudSave};
