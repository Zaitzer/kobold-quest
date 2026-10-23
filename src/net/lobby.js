import {rpBattle} from '../battle/flow.js';
import {rpInputReset} from '../core/input.js';
import {rpBuzz} from '../core/options.js';
import {feature} from '../core/registry.js';
import {v6PackKobold} from '../core/save6.js';
import {rp} from '../core/state.js';
import {RP_E} from '../data/monsters.js';
import {CLASSES6} from '../data/v6/classes.js';
import {SKILLS6} from '../data/v6/skills.js';
import {WEAPONS} from '../engine/art.js';
import {clamp,esc2} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {rpStats} from '../game/stats.js';
import {netSendStart} from './battle.js';
import {net,netByPeer,netEmit,netFocus,netName,netPartnerFree,netPresence,netRid} from './core.js';
import {rpUI} from '../ui/hud.js';
function netParty(){return rp.s.party.map(v6PackKobold)}
function netCleanParty(p){return Array.isArray(p)?netClean6(p):[]}
/* a friend's v6 kobolds: only the saved fields (save6.js), checked so a bad message can't break the fight */
function netClean6(p){const num=(v,a,b,d)=>{v=+v;return Number.isFinite(v)?clamp(Math.round(v),a,b):d},obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{},ids=v=>Array.isArray(v)?v.filter(id=>typeof id==='string'&&SKILLS6[id]):[];
  return p.filter(m=>m&&m.v6&&CLASSES6[m.cls]).slice(0,3).map(m=>{const c=v6PackKobold(m);
    Object.assign(c,{v6:1,name:String(m.name||'Kobold').slice(0,16),lvl:num(m.lvl,1,30,1),xp:num(m.xp,0,1e7,0),hp:num(m.hp,0,1e5,0),mp:num(m.mp,0,1e5,0),
      scores:Object.fromEntries(Object.entries(obj(m.scores)).map(([k,v])=>[k,num(v,1,40,10)])),skills:ids(m.skills).slice(0,4),known:ids(m.known),ranks:obj(m.ranks),dark:obj(m.dark),
      gear:obj(m.gear),lead:obj(m.lead),passives:Array.isArray(m.passives)?m.passives.filter(x=>typeof x==='string'):[],w:WEAPONS[m.w]?m.w:'stick',pend:0});
    try{rpStats(c)}catch(e){return null}return c}).filter(Boolean)}
const clsName=c=>(CLASSES6[c]||{n:''}).n;
/* ---------- the lobby before a battle ---------- */
function rpFight(keys,opt){if(netPartnerFree()&&!opt.duel){netOpenLobby(keys,opt)}else rpBattle(keys,opt)}
function netOpenLobby(keys,opt,duel){
  const alive=rp.s.party.map((m,i)=>m.hp>0?i:-1).filter(i=>i>=0);
  net.lob={id:netRid(),host:true,duel:!!duel,keys,opt:opt||{},hsel:alive.slice(0,rp.s.w6?4:3),g:null};
  rp.mode='lobby';rp.path=null;rpInputReset();netPresence(true);netLobSend();rpUI(true);
}
/* each side keeps at least one kobold; together at most 4 (duels: up to 3 each) */
function netLobFix(L,who){
  const H=rp.s.party;if(!L.hsel.length){const i=H.findIndex(m=>m.hp>0);if(i>=0)L.hsel=[i]}
  if(L.g){if(!L.g.sel.length){const i=L.g.party.findIndex(m=>m.hp>0);L.g.sel=[i>=0?i:0]}
    if(!L.duel){while(L.hsel.length+L.g.sel.length>4){if(who==='g'&&L.hsel.length>1)L.hsel.pop();else if(L.g.sel.length>1)L.g.sel.pop();else L.hsel.pop()}}}
}
function netLobSend(){const L=net.lob;if(!L||!L.host)return;
  const sum=p=>p.map(m=>({n:m.name,c:m.cls,l:m.lvl,hp:Math.max(0,m.hp),mx:rpStats(m).hp}));
  netEmit({t:'lob',id:L.id,duel:L.duel,title:netLobTitle(L),hp:sum(rp.s.party),hsel:L.hsel,g:L.g?{peer:L.g.peer,sel:L.g.sel}:null,cap:L.duel?0:rp.s.party[0].lvl});L.sent=performance.now()}
function netLobTitle(L){const o=L.opt||{};return L.duel?'Duel':o.title?o.title:o.boss&&RP_E[o.boss]?RP_E[o.boss].n:'Battle'}
function netLobHtml(){
  const L=net.lob;if(!L)return'';const host=L.host,V=L.view||{};
  const chips=(party,sel,mine,who)=>party.map((m,i)=>{const on=sel.includes(i),hp=m.hp!=null?m.hp:0,mx=m.mx||rpStats(m).hp,dn=hp<=0;
    return '<button class="lobk'+(on?' on':'')+(dn?' dn':'')+'" type="button"'+(mine&&!dn?' data-net="pick" data-who="'+who+'" data-i="'+i+'"':' disabled')+'><b>'+esc2(m.n||m.name)+'</b><small>'+clsName(m.c||m.cls)+' '+(m.l||m.lvl)+' · '+Math.max(0,hp)+' HP</small></button>'}).join('');
  let h='<div class="rpdlg"><div class="who">'+esc2(host?netLobTitle(L):(V.title||'Battle'))+(L.duel?' ⚔':'')+'</div>';
  if(host){const g=L.g;const tot=L.hsel.length+(g?g.sel.length:0);
    h+='<p>'+(L.duel?(g?'Pick 1 to 3 kobolds each, then start.':'Waiting for '+esc2(netName())+' to answer…'):g?'Pick who fights: at least one each, up to 4 together ('+tot+'/4).':'Pick your kobolds. '+esc2(netName())+' can join now, or start without them.')+'</p></div>';
    h+='<div class="lobp"><small>Your party</small>'+chips(rp.s.party,L.hsel,true,'h')+'</div>';
    if(g)h+='<div class="lobp"><small>'+esc2(netName())+'</small>'+chips(g.party.map(m=>({n:m.name,c:m.cls,l:m.lvl,hp:m.hp,mx:rpStats(m).hp})),g.sel,false)+'</div>';
    if(g&&!L.duel&&g.party.some(m=>m.lvl>rp.s.party[0].lvl))h+='<p class="rptip">'+esc2(netName())+'\'s kobolds fight at level '+rp.s.party[0].lvl+' (level sync).</p>';
    h+='<div class="tbar two"><button class="rpb x" type="button" data-net="lobcancel">'+(L.duel?'✕ Cancel duel':'✕ '+(g?'Fight alone':'Back'))+'</button><button class="rpb go" type="button" data-net="lobstart"'+(L.duel&&!g?' disabled':'')+'>Start battle ▸<small>'+(g?'with '+esc2(netName()):'on your own')+'</small></button></div>';
    if(!L.duel&&!g&&L.keys&&L.opt&&!L.opt.boss)h=h.replace('✕ Back','✕ Back');}
  else{
    if(!V.hp){h+='<p>Joining '+esc2(netName())+'…</p></div><div class="tbar"><button class="rpb x" type="button" data-net="lobleave">✕ Leave</button></div>';return h}
    const mySel=L.sel||[0];const tot=(V.hsel||[]).length+mySel.length;
    h+='<p>'+(L.duel?'Pick 1 to 3 kobolds. ':'Pick at least one kobold ('+tot+'/4 together). ')+esc2(netName())+' starts the battle.</p></div>';
    h+='<div class="lobp"><small>'+esc2(netName())+'</small>'+chips(V.hp,V.hsel||[],false)+'</div>';
    h+='<div class="lobp"><small>Your party</small>'+chips(rp.s.party,mySel,true,'g')+'</div>';
    if(V.cap&&rp.s.party.some(m=>m.lvl>V.cap))h+='<p class="rptip">Your kobolds fight at level '+V.cap+' to match '+esc2(netName())+' (level sync). You still get your rewards.</p>';
    h+='<div class="tbar"><button class="rpb x" type="button" data-net="lobleave">✕ Leave</button></div>'}
  return h;
}
function netLobPick(who,i){const L=net.lob;if(!L)return;
  if(who==='h'&&L.host){const s=L.hsel;const j=s.indexOf(i);if(j>=0){if(s.length>1)s.splice(j,1)}else{s.push(i);s.sort()}netLobFix(L,'h');
    if(L.g&&!L.duel&&s.length+L.g.sel.length>4){s.splice(s.indexOf(i),1)}if(L.duel&&s.length>3)s.splice(s.indexOf(i),1);netLobSend()}
  else if(who==='g'&&!L.host){let s=(L.sel||[0]).slice();const j=s.indexOf(i);if(j>=0){if(s.length>1)s.splice(j,1)}else{s.push(i);s.sort()}
    if(L.duel&&s.length>3)s=s.slice(0,3);L.sel=s;netEmit({t:'pick',id:L.id,sel:s,to:L.hostPeer})}
}
/* level sync: a friend's kobolds above the host's level fight as if they were at the host's level (talents beyond it
   rest, promotion only from level 10); health and mana keep the same share they had */
function netLevelSync(m,cap){if(!m||m.lvl<=cap)return m;
  const c=JSON.parse(JSON.stringify(m)),a=rpStats(m);c.lvl=cap;c.synced=m.lvl;const b=rpStats(c);   /* the sheet at the host's level; scores, skills and gear stay */
  c.hp=Math.max(1,Math.round(b.hp*Math.min(1,m.hp/a.hp)));c.mp=Math.round(b.mp*Math.min(1,(m.mp||0)/Math.max(1,a.mp)));return c}
/* ---------- starting a battle together ---------- */
function netStart(){
  const L=net.lob;if(!L||!L.host)return;const s=rp.s;
  const mine=L.hsel.filter(i=>s.party[i]&&s.party[i].hp>0).map(i=>({m:s.party[i],ctl:'me',own:'h'}));if(!mine.length)return;
  const cap=s.party[0].lvl,theirs=L.g?L.g.sel.filter(i=>L.g.party[i]&&L.g.party[i].hp>0).map(i=>({m:L.duel?L.g.party[i]:netLevelSync(L.g.party[i],cap),ctl:'remote',own:'g',gi:i})):[];   /* gi: the friend's own party slot (a synced copy is not in it) */
  net.lob=null;
  if(L.duel){if(!theirs.length)return rpToast('Waiting for '+netName()+'.');rpBattle([],{duel:true,members:mine,foes:theirs,net:L.g.peer,nid:L.id,gParty:L.g.party})}
  else{let keys=L.keys;const o=L.opt||{};
        /* nothing scales with the players (design.md §10) */
    rpBattle(keys,Object.assign({},o,{members:mine.concat(theirs),net:theirs.length?L.g.peer:null,nid:L.id,gParty:L.g?L.g.party:[]}))}
  if(rp.bt&&rp.bt.net)netSendStart(rp.bt);
  netPresence(true);
}

feature({id:'lobby',panels:{lobby:{sig:()=>JSON.stringify(net.lob&&[net.lob.hsel,net.lob.g&&net.lob.g.sel,net.lob.sel,net.lob.view])+netName(),html:()=>netLobHtml()}}});

/* online messages this module answers, and its data-net buttons */
feature({id:'net-lobby-io',
  net:{
    join(d,msg){const b=rp.bt,L=net.lob;if(L&&L.host&&L.id===d.id&&L.g&&L.g.peer!==msg.peer){netEmit({t:'nolob',id:d.id,to:msg.peer,why:'That fight is already full.'});return}
    if(L&&L.host&&L.id===d.id&&rp.mode==='lobby'&&!L.duel&&(!L.g||L.g.peer===msg.peer)){net.focus=msg.peer;netFocus();const gp=netCleanParty(d.party);L.g={peer:msg.peer,by:msg.by,party:gp,sel:L.g?L.g.sel:[Math.max(0,gp.findIndex(m=>m.hp>0))]};netLobFix(L,'g');netLobSend();rpBuzz(30);rpToast(netName()+' joins!');rp.sig=''}},
    leave(d,msg){const b=rp.bt,L=net.lob;if(L&&L.host&&L.id===d.id&&L.g&&L.g.peer===msg.peer){L.g=null;netLobSend();rpToast(netName()+' left the lobby.');rp.sig='';if(L.duel){net.lob=null;rp.mode='map'}}},
    pick(d,msg){const b=rp.bt,L=net.lob;if(L&&L.host&&L.id===d.id&&L.g&&L.g.peer===msg.peer&&Array.isArray(d.sel)){L.g.sel=d.sel.filter(i=>Number.isInteger(i)&&L.g.party[i]&&L.g.party[i].hp>0);netLobFix(L,'g');netLobSend();rp.sig=''}},
    lob(d,msg){const b=rp.bt,L=net.lob;if(L&&!L.host&&L.id===d.id&&rp.mode==='lobby'){L.view=d;L.hostPeer=msg.peer;L.seen=performance.now();if(d.g&&d.g.peer===net.myPeer)L.sel=d.g.sel;rp.sig=''}},
    nolob(d,msg){const b=rp.bt,L=net.lob;if(L&&!L.host&&L.id===d.id){net.lob=null;if(rp.mode==='lobby')rp.mode='map';rpToast(d.why||'The lobby closed.');rp.sig=''}}},
  actions:{
    'net:join'(d){{const P=netByPeer(d.p)||(net.others||[]).find(p=>p.presence.op);if(!P||!P.presence.op||rp.mode!=='map')return;net.focus=P.peer;netFocus();net.lob={id:P.presence.op,host:false,duel:false,sel:[rp.s.party.findIndex(m=>m.hp>0)].filter(i=>i>=0),hostPeer:P.peer,seen:performance.now()};
      netEmit({t:'join',id:P.presence.op,to:P.peer,party:netParty()});rp.mode='lobby';rpInputReset();return}},
    'net:pick'(d){netLobPick(d.who,+d.i)},
    'net:lobstart'(d){netStart()},
    'net:lobcancel'(d){{const L=net.lob;if(!L)return;
      if(L.duel){if(L.g)netEmit({t:'nolob',id:L.id,to:L.g.peer,why:netName()+' cancelled the duel.'});net.lob=null;rp.mode='map';return}
      if(L.g){netEmit({t:'nolob',id:L.id,to:L.g.peer,why:netName()+' went ahead alone.'});L.g=null;netStart();return}
      net.lob=null;rpBattle(L.keys,L.opt);return}},
    'net:lobleave'(d){{const L=net.lob;if(L)netEmit({t:'leave',id:L.id,to:L.hostPeer});net.lob=null;rp.mode='map';return}}}});
export {clsName,netClean6,netCleanParty,netLevelSync,netLobFix,netLobHtml,netLobPick,netLobSend,netLobTitle,netOpenLobby,netParty,netStart,rpFight};
