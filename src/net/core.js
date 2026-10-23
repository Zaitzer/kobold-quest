/* ---------- Kobold Quest online: see each other, fight together, duel, trade, one shared world ----------
   Uses the page's room (live messages and presence), user (names) and db (the shared world doc).
   Everything is optional: without them the game is the same single-player game. */
import {platform} from '../adapters/platform.js';
import {view} from '../core/app.js';
import {hooks,rpUI} from '../core/hooks.js';
import {rpBuzz} from '../core/options.js';
import {actions,feature,netHandlers} from '../core/registry.js';
import {rp} from '../core/state.js';
import {rpToast} from '../game/dialogue.js';
import {rpArea,rpPlace} from '../game/world.js';
import {netGiftTick} from './gift.js';
import {netLobSend} from './lobby.js';
import {netMarketInit} from './market.js';

const net={online:null,   /* the link to the game server (adapters/online.js), made by ui/login.js */
  room:null,user:null,db:null,me:null,myPeer:null,on:false,names:{},partner:null,pk:null,pkPos:null,lastPres:0,presSig:'',
  others:[],pks:{},ops:{},focus:null,bubbles:{},peerNames:{},chatLog:[],market:[],mine:[],mkBusy:false,cloud:null,cloudRef:null,cloudBusy:false,cloudT:0,pickFor:null,mkTab:'buy',mkSell:null,
  lob:null,gifts:{},giftsIn:new Set(),wref:null,wremote:null,wsent:'',wbusy:false,wtimer:0,fx:[],snapN:0,snapSig:'',snapT:0,actN:0,lastOp:null,duelAsk:null};
function netRid(){return Math.random().toString(36).slice(2,9)}
async function netInit(){
  if(!platform.available())return;
  try{
    const [room,user,db]=await Promise.all([platform.use('room'),platform.use('user'),platform.use('db')]);
    net.room=room;net.user=user;net.db=db;
    if(user){try{net.me=await user.id()}catch(e){}}
    if(room){room.on('kq',netMsg,()=>{});room.onPeers(netPeers,()=>{});net.on=true}
    if(db&&net.me){netMarketInit()}
  }catch(e){console.warn('online features unavailable',e)}
}
/* ---------- who's here: everyone in the room who is playing ---------- */
function netPeers(){
  if(!net.room)return;const ps=net.room.peers();const me=ps.find(p=>p.sameTab);if(me)net.myPeer=me.peer;
  const others=ps.filter(p=>!p.isMe&&p.kind==='viewer'&&p.presence&&p.presence.kq);
  const before=new Set((net.others||[]).map(p=>p.peer)),now=new Set(others.map(p=>p.peer));
  const playing=rp.s&&view==='rpg';
  others.forEach(P=>{if(P.by&&!(P.by in net.names)&&net.user){net.names[P.by]='';net.user.profiles([P.by]).then(r=>{net.names[P.by]=(r[P.by]&&r[P.by].name)||'';rp.sig=''}).catch(()=>{})}
    if(!before.has(P.peer)&&playing)setTimeout(()=>{if(rp.mode==='map')rpToast(netName(P)+' is here!')},700);
    const op=P.presence.op||null,lastOp=net.ops[P.peer]||null;if(op&&op!==lastOp&&playing&&rp.mode==='map'){setTimeout(()=>{if(P.presence.op)rpToast(netName(P)+' is in a fight! ⚔ Join')},300);rpBuzz([30,40,30])}net.ops[P.peer]=op});
  (net.others||[]).forEach(P=>{if(!now.has(P.peer)){if(playing)rpToast(netName(P)+' left.');delete net.pks[P.peer];delete net.ops[P.peer]}});
  net.others=others;netFocus();
}
/* the player that "you" means right now: the one I'm fighting/trading with, else the nearest */
function netFocus(){const O=net.others||[];let P=net.focus&&O.find(p=>p.peer===net.focus);
  if(!P&&O.length&&!rp.s)P=O[0];
  if(!P&&rp.s){const s=rp.s;P=O.slice().sort((a,b)=>Math.hypot(a.presence.x-s.x,a.presence.y-s.y)-Math.hypot(b.presence.x-s.x,b.presence.y-s.y))[0]}
  net.partner=P||null;return net.partner}
function netByPeer(peer){return(net.others||[]).find(p=>p.peer===peer)||null}
function netName(p){p=p||net.partner;if(!p)return'Your friend';return(p.by&&net.names[p.by])||p.presence.nm||'Your friend'}
function netNameOf(peer){const p=netByPeer(peer);return p?netName(p):(net.peerNames[peer]||'Your friend')}
function netOnline(){return!!(net.on&&net.others&&net.others.length)}
/* someone free to join a fight: on the map, in the same place */
function netPartnerFree(){return netOnline()&&net.others.some(p=>p.presence.m==='map'&&(p.presence.pl||'world')===rpPlace())&&net.room.connected()}
function netEmit(data){if(!net.room)return;try{net.room.emit('kq',data).catch(()=>{})}catch(e){}}
/* my own presence: where I am and what I'm doing */
function netPresence(force){
  if(!net.room||!rp.s||!rp.s.party[0])return;const now=performance.now();if(!force&&now-net.lastPres<120)return;   /* the heroes screen: nobody to show yet */
  const s=rp.s,m=s.party[0],p=rp.pos||{x:s.x+.5,y:s.y+.5};
  const pr={kq:1,pl:rpPlace(),x:Math.round(p.x*100)/100,y:Math.round(p.y*100)/100,f:s.face,a:rpArea(s.x,s.y),m:rp.mode==='battle'||rp.mode==='lobby'?rp.mode:rp.mode==='map'?'map':'busy',lv:m.lvl,cl:m.cls,w:m.w,
    op:net.lob&&net.lob.host&&!net.lob.duel&&!net.lob.g&&rp.mode==='lobby'?net.lob.id:null,nm:'',pn:s.party.length};
  const sig=JSON.stringify(pr);if(sig===net.presSig&&!force)return;net.presSig=sig;net.lastPres=now;net.room.presence(pr).catch(()=>{});
}
function netLeaveRpg(){if(net.room){net.presSig='';net.room.presence({kq:null,op:null}).catch(()=>{})}}
/* ---------- messages ---------- */
function netMsg(msg){
  const d=msg.data;if(!d||typeof d!=='object'||msg.sameTab)return;
  if(d.to&&d.to!==net.myPeer)return;
  /* each net module registers the message types it answers: feature({net:{gift(d,msg){...}}}) */
  const h=netHandlers[d.t];if(h)h(d,msg);
  if(rp.s&&view==='rpg')rpUI();
}
/* ---------- buttons ---------- */
function netBtn(d){const a=actions['net:'+d.net];if(a)a(d);netPresence(true)}
/* ---------- personal story: nothing in the world is shared any more ---------- */
/* each frame while in the RPG */
function netFrame(dt){if(!net.on||!rp.s)return;netPresence();netGiftTick();if(performance.now()-(net.focusT||0)>1000){net.focusT=performance.now();netFocus()}const L=net.lob;
  if(L&&L.host&&rp.mode==='lobby'&&performance.now()-(L.sent||0)>1500)netLobSend();
  if(L&&!L.host&&rp.mode==='lobby'&&performance.now()-(L.seen||0)>9000){net.lob=null;rp.mode='map';rpToast('Couldn\'t reach '+netName()+'.');rpUI(true)}}

feature({id:'net-buttons',routes:{net:d=>netBtn(d)}});

feature({id:'net-presence-after-battle',on:{'battle:end':()=>setTimeout(()=>netPresence(true),0)}});
feature({id:'net-live',init:()=>netInit(),frame:dt=>netFrame(dt),on:{'game:start':()=>netPresence(true)}});

hooks.partnerName=netName;
export {net,netBtn,netByPeer,netEmit,netFocus,netFrame,netInit,netLeaveRpg,netMsg,netName,netNameOf,netOnline,netPartnerFree,netPeers,netPresence,netRid};
