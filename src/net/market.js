/* ---------- market board: listings live in the database, so they stay up while the seller is offline ---------- */
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {RP_MATS} from '../data/gear.js';
import {RP_IT,RP_ITEMS} from '../data/items.js';
import {sfx} from '../engine/audio.js';
import {clamp,esc2} from '../engine/util.js';
import {rpSay,rpToast} from '../game/dialogue.js';
import {rpItemTone,rpMats} from '../game/gear.js';
import {rpGive,rpItemDesc} from '../game/items.js';
import {net} from './core.js';
import {rpUI} from '../ui/hud.js';

function netMarketInit(){try{const col=net.db.collection('market');
    col.where('status','==','open').onSnapshot(sn=>{net.market=sn.docs.map(d=>Object.assign({id:d.id},d.data()));const ids=[...new Set(net.market.map(m=>m.seller))].filter(i=>i&&!(i in net.names));
      if(ids.length&&net.user){ids.forEach(i=>net.names[i]='');net.user.profiles(ids).then(r=>{ids.forEach(i=>net.names[i]=(r[i]&&r[i].name)||'')}).catch(()=>{})}rp.sig=''},()=>{});
    col.where('seller','==',net.me).onSnapshot(sn=>{net.mine=sn.docs.map(d=>Object.assign({id:d.id},d.data()));netMarketPayouts();rp.sig=''},()=>{});
  }catch(e){}}
function netMkLabel(m){return m.kind==='item'?(RP_IT[m.val]||{n:'?'}).n:m.kind==='mat'?(RP_MATS[m.val]||{n:'?'}).n:m.kind==='bag'?(RP_ITEMS[m.val]||{n:'?'}).n:'?'}
function netMkValid(m){return m&&Number.isFinite(+m.price)&&+m.price>0&&(m.kind==='item'&&RP_IT[m.val]||m.kind==='mat'&&RP_MATS[m.val]||m.kind==='bag'&&RP_ITEMS[m.val]&&!RP_ITEMS[m.val].keep)}
function netMarketPrice(kind,val){const base=kind==='item'?(RP_IT[val]||{}).price||40:kind==='mat'?12:(RP_ITEMS[val]||{}).price||15;return Math.max(1,Math.round(base*.6))}
function netTake(kind,val){const s=rp.s;if(kind==='gold')return false;if(kind==='mat'){const M=rpMats();if(!(M[val]>0))return false;M[val]--;return true}
  if(kind==='bag'){if(!(s.bag[val]>0))return false;s.bag[val]--;return true}const i=s.inv.indexOf(val);if(i<0)return false;s.inv.splice(i,1);return true}
function netPut(kind,val){const s=rp.s;if(kind==='mat')rpMats()[val]++;else if(kind==='bag')s.bag[val]=(s.bag[val]||0)+1;else rpGive(val)}
async function netMarketList(){const S=net.mkSell;if(!S||net.mkBusy||!net.db)return;if(rp.s.test){rpToast('A test hero can\'t sell on the market.');return}if((net.mine||[]).filter(m=>m.status==='open').length>=8){rpToast('You can have 8 things for sale at once.');return}
  if(!netTake(S.kind,S.val))return;net.mkBusy=true;rpSave();
  try{await net.db.collection('market').add({seller:net.me,kind:S.kind,val:S.val,price:Math.round(S.price),status:'open',buyer:null,t:Date.now()});rpToast(netMkLabel(S)+' is on the market for '+Math.round(S.price)+' gold.');net.mkSell=null;net.mkTab='mine'}
  catch(e){netPut(S.kind,S.val);rpSave();rpToast('Couldn\'t reach the market. Try again.')}net.mkBusy=false;rpUI(true)}
/* buying uses a short lease so two buyers can't both get the same thing */
async function netMarketBuy(id){if(net.mkBusy)return;const m=net.market.find(x=>x.id===id);if(!m||!netMkValid(m)||m.seller===net.me)return;if(rp.s.gold<m.price){rpToast('Not enough gold.');return}
  net.mkBusy=true;rpUI(true);const ref=net.db.collection('market').doc(id);
  try{const L=await ref.acquire({holder:net.me,ttlMs:6000});if(!L.acquired){rpToast('Someone else is buying that right now.')}
    else{const sn=await ref.get();const d=sn.exists&&sn.data();
      if(!d||d.status!=='open'||rp.s.gold<d.price){rpToast('That was just sold.')}
      else{await ref.update({status:'sold',buyer:net.me,soldAt:Date.now()});rp.s.gold-=d.price;netPut(d.kind,d.val);rpSave();if(!rp.headless)sfx('win');rpToast('Bought '+netMkLabel(d)+' for '+d.price+' gold!')}}}
  catch(e){rpToast('Couldn\'t reach the market. Try again.')}net.mkBusy=false;rpUI(true)}
async function netMarketCancel(id){if(net.mkBusy)return;const ref=net.db.collection('market').doc(id);net.mkBusy=true;
  try{const L=await ref.acquire({holder:net.me,ttlMs:6000});if(L.acquired){const sn=await ref.get(),d=sn.exists&&sn.data();
      if(d&&d.status==='open'&&d.seller===net.me){await ref.update({status:'cancel'});netPut(d.kind,d.val);rpSave();rpToast(netMkLabel(d)+' is back in your backpack.');try{await ref.delete()}catch(e){}}}}
  catch(e){}net.mkBusy=false;rpUI(true)}
/* sellers get paid when they're next online */
async function netMarketPayouts(){if(!rp.s||net.paying)return;const s=rp.s;s.mkPaid=s.mkPaid||[];
  /* a listing an admin removed (systems.md §17) comes back to its seller */
  for(const m of (net.mine||[]).filter(m=>m.status==='removed'&&!s.mkPaid.includes(m.id))){s.mkPaid.push(m.id);netPut(m.kind,m.val);rpToast(netMkLabel(m)+' was taken off the market'+(m.why?' ('+m.why+')':'')+'; it is back in your backpack.');try{await net.db.collection('market').doc(m.id).delete()}catch(e){}rpSave()}
  const due=(net.mine||[]).filter(m=>m.status==='sold'&&!s.mkPaid.includes(m.id));if(!due.length)return;net.paying=true;
  for(const m of due){s.mkPaid.push(m.id);if(s.mkPaid.length>200)s.mkPaid.shift();s.gold+=Math.max(0,+m.price||0);rpToast('Your '+netMkLabel(m)+' sold for '+m.price+' gold!');
    try{await net.db.collection('market').doc(m.id).delete()}catch(e){}}
  rpSave();net.paying=false;rp.sig=''}
function netMarketHtml(){
  const s=rp.s,T=net.mkTab,tab=(k,n)=>'<button class="pill'+(T===k?' go':'')+'" type="button" data-net="mktab" data-v="'+k+'">'+n+'</button>';
  let h='<div class="rpdlg"><div class="who">Market board</div><div class="mktabs">'+tab('buy','Buy')+tab('sell','Sell')+tab('mine','My stall')+'<span class="mkgold">'+Math.floor(s.gold)+' gold</span></div></div><div class="rpcmd shop">';
  if(T==='buy'){const L=net.market.filter(m=>netMkValid(m)&&m.seller!==net.me).sort((a,b)=>b.t-a.t);
    h+=L.length?L.map(m=>{const it=m.kind==='item'?m.val:null;return '<button class="rpb'+(it?rpItemTone(it):' go')+'" type="button" data-net="mkbuy" data-id="'+esc2(m.id)+'"'+(s.gold<m.price||net.mkBusy?' disabled':'')+'>'+esc2(netMkLabel(m))+' · '+m.price+'g<small>'+(it?rpItemDesc(it)+' · ':'')+'from '+esc2(net.names[m.seller]||'a friend')+'</small></button>'}).join(''):'<p class="rptip">Nothing for sale yet. Be the first: open the Sell tab.</p>'}
  else if(T==='sell'){
    if(net.mkSell){const S=net.mkSell;h+='<p class="mksell"><b>'+esc2(netMkLabel(S))+'</b> for <b class="hp">'+S.price+' gold</b></p>'+[-50,-10,-1,1,10,50].map(v=>'<button class="pill" type="button" data-net="mkprice" data-v="'+v+'">'+(v>0?'+':'')+v+'</button>').join('')+
      '<button class="rpb go" type="button" data-net="mklist"'+(net.mkBusy?' disabled':'')+'>Put it up for sale<small>Stays up while you\'re away. You get the gold when someone buys it.</small></button><button class="rpb x" type="button" data-net="mktab" data-v="sell">✕ Pick something else</button>'}
    else{const M=rpMats();
      h+=s.inv.map(id=>'<button class="rpb'+rpItemTone(id)+'" type="button" data-net="mkpick" data-k="item" data-v="'+esc2(id)+'">'+esc2(RP_IT[id].n)+'<small>'+rpItemDesc(id)+'</small></button>').join('')+
        Object.keys(RP_MATS).filter(k=>M[k]>0).map(k=>'<button class="rpb" type="button" data-net="mkpick" data-k="mat" data-v="'+k+'">'+RP_MATS[k].n+'<small>You have '+M[k]+'</small></button>').join('')+
        Object.keys(RP_ITEMS).filter(k=>s.bag[k]>0&&!RP_ITEMS[k].keep).map(k=>'<button class="rpb it" type="button" data-net="mkpick" data-k="bag" data-v="'+k+'">'+RP_ITEMS[k].n+'<small>You have '+s.bag[k]+'</small></button>').join('')||'<p class="rptip">Your backpack is empty. Take gear off in ⚔ Gear to sell it.</p>'}}
  else{const L=(net.mine||[]).filter(m=>m.status==='open'&&netMkValid(m));
    h+=L.length?L.map(m=>'<button class="rpb" type="button" data-net="mkcancel" data-id="'+esc2(m.id)+'">'+esc2(netMkLabel(m))+' · '+m.price+'g<small>Tap to take it back</small></button>').join(''):'<p class="rptip">You have nothing for sale.</p>'}
  return h+'<button class="rpb x" type="button" data-net="mkclose">Leave</button></div>'}

feature({id:'market',panels:{market:{sig:()=>net.mkTab+JSON.stringify(net.mkSell)+net.market.length+net.market.map(m=>m.id).join()+(net.mine||[]).length+rp.s.gold+net.mkBusy+rp.s.inv.length+JSON.stringify(rpMats()),html:()=>netMarketHtml()}}});

feature({id:'market-stall',tiles:{M:{use(){if(net.db&&net.me){rp.mode='market';net.mkTab='buy';net.mkSell=null;rpUI(true)}else rpSay([{who:'Market board',text:'An empty trading board. It only works when you play online, on the shared page.'}])}}}});

/* online messages this module answers, and its data-net buttons */
feature({id:'net-market-io',
  actions:{
    'net:market'(d){rp.mode='market';net.mkTab='buy';net.mkSell=null},
    'net:mktab'(d){net.mkTab=d.v;net.mkSell=null},
    'net:mkbuy'(d){netMarketBuy(d.id)},
    'net:mkcancel'(d){netMarketCancel(d.id)},
    'net:mkpick'(d){net.mkSell={kind:d.k,val:d.v,price:netMarketPrice(d.k,d.v)}},
    'net:mkprice'(d){if(net.mkSell)net.mkSell.price=clamp(net.mkSell.price+(+d.v),1,99999)},
    'net:mklist'(d){netMarketList()},
    'net:mkclose'(d){rp.mode='map'}}});
export {netMarketBuy,netMarketCancel,netMarketHtml,netMarketInit,netMarketList,netMarketPayouts,netMarketPrice,netMkLabel,netMkValid,netPut,netTake};
