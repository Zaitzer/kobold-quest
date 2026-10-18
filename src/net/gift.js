/* ---------- gifts ---------- */
import {rpBuzz} from '../core/options.js';
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {RP_MATS} from '../data/gear.js';
import {RP_IT,RP_ITEMS} from '../data/items.js';
import {sfx} from '../engine/audio.js';
import {clamp,esc2} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {rpItemTone,rpMats} from '../game/gear.js';
import {rpGive,rpItemDesc} from '../game/items.js';
import {net,netEmit,netName,netNameOf,netOnline,netRid} from './core.js';

function netGive(kind,val){
  if(!netOnline())return;const s=rp.s;let label='';
  if(kind==='gold'){val=Math.min(+val,Math.floor(s.gold));if(val<=0)return;s.gold-=val;label=val+' gold'}
  else if(kind==='mat'){const M=rpMats();if(!(M[val]>0))return;M[val]--;label='a '+RP_MATS[val].n.toLowerCase()}
  else if(kind==='item'){const i=s.inv.indexOf(val);if(i<0)return;s.inv.splice(i,1);label=RP_IT[val].n}
  else if(kind==='bag'){if(!(s.bag[val]>0)||!RP_ITEMS[val]||RP_ITEMS[val].keep)return;s.bag[val]--;label='a '+RP_ITEMS[val].n.toLowerCase()}
  if(!net.partner)return;const gid=netRid();net.gifts[gid]={kind,val,label,t:performance.now(),last:performance.now(),to:net.partner.peer};
  netEmit({t:'gift',gid,to:net.partner.peer,kind,val});rpToast('Sent '+label+' to '+netName()+'.');rpSave();
}
function netGotGift(d,msg){
  if(!rp.s)return;const ack=()=>netEmit({t:'gack',gid:d.gid,to:msg.peer});
  if(net.giftsIn.has(d.gid)){ack();return}const s=rp.s;let label='';
  if(d.kind==='gold'){const v=clamp(+d.val|0,0,100000);s.gold+=v;label=v+' gold'}
  else if(d.kind==='mat'&&RP_MATS[d.val]){rpMats()[d.val]++;label='a '+RP_MATS[d.val].n.toLowerCase()}
  else if(d.kind==='item'&&RP_IT[d.val]){rpGive(d.val);label=RP_IT[d.val].n}
  else if(d.kind==='bag'&&RP_ITEMS[d.val]&&!RP_ITEMS[d.val].keep){s.bag[d.val]=(s.bag[d.val]||0)+1;label='a '+RP_ITEMS[d.val].n.toLowerCase()}
  else return;
  net.giftsIn.add(d.gid);ack();rpSave();rpToast(netName()+' gave you '+label+'!');if(!rp.headless)sfx('win');rpBuzz(30)}
function netGiftTick(){const now=performance.now();for(const gid in net.gifts){const G=net.gifts[gid];
    if(now-G.t>30000){delete net.gifts[gid];/* never arrived: give it back */const s=rp.s;
      if(G.kind==='gold')s.gold+=G.val;else if(G.kind==='mat')rpMats()[G.val]++;else if(G.kind==='item')rpGive(G.val);else if(G.kind==='bag')s.bag[G.val]=(s.bag[G.val]||0)+1;rpToast(G.label+' couldn\'t be delivered, so you kept it.');rpSave();continue}
    if(now-G.last>2000){G.last=now;netEmit({t:'gift',gid,to:G.to,kind:G.kind,val:G.val})}}}
function netTradeHtml(){const s=rp.s,M=rpMats();
  let h='<div class="rpdlg"><div class="who">Give to '+esc2(netName())+'</div><p>Tap to send. It arrives in their backpack right away.</p></div><div class="rpcmd shop">';
  h+=[10,50].map(v=>'<button class="rpb go" type="button" data-net="give" data-k="gold" data-v="'+v+'"'+(s.gold<v?' disabled':'')+'>'+v+' gold<small>You have '+Math.floor(s.gold)+'</small></button>').join('');
  h+=Object.keys(RP_ITEMS).filter(k=>s.bag[k]>0&&!RP_ITEMS[k].keep).map(k=>'<button class="rpb it" type="button" data-net="give" data-k="bag" data-v="'+k+'">'+RP_ITEMS[k].n+'<small>You have '+s.bag[k]+'</small></button>').join('');
  h+=Object.keys(RP_MATS).filter(k=>M[k]>0).map(k=>'<button class="rpb" type="button" data-net="give" data-k="mat" data-v="'+k+'">'+RP_MATS[k].n+'<small>You have '+M[k]+'</small></button>').join('');
  h+=s.inv.map(id=>'<button class="rpb'+rpItemTone(id)+'" type="button" data-net="give" data-k="item" data-v="'+esc2(id)+'">'+esc2(RP_IT[id].n)+'<small>'+rpItemDesc(id)+'</small></button>').join('');
  return h+'<button class="rpb x" type="button" data-net="tradeclose">Done</button></div>'}

feature({id:'trade',panels:{trade:{sig:()=>rp.s.gold+JSON.stringify(rpMats())+rp.s.inv.join()+JSON.stringify(rp.s.bag),html:()=>netTradeHtml()}}});

/* online messages this module answers, and its data-net buttons */
feature({id:'net-gift-io',
  net:{
    gift(d,msg){const b=rp.bt,L=net.lob;netGotGift(d,msg)},
    gack(d,msg){const b=rp.bt,L=net.lob;if(net.gifts[d.gid]){const G=net.gifts[d.gid];delete net.gifts[d.gid];rpToast(netNameOf(G.to)+' got '+G.label+'.')}}},
  actions:{
    'net:trade'(d){rp.mode='trade'},
    'net:tradeclose'(d){rp.mode='map'},
    'net:give'(d){netGive(d.k,d.k==='gold'?+d.v:d.v)}}});
export {netGiftTick,netGive,netGotGift,netTradeHtml};
