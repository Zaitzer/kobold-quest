import {rpAiTurn} from '../battle/ai.js';
import {v6Move} from '../battle/combat.js';
import {rpFloat,rpRewards,tcCamTo,tcDo,tcEndTurn,tcFloatU} from '../battle/flow.js';
import {tcHome,tcLive,tcPath,tcReach,tcShown,tcT,tcUnitAt,tcVis} from '../battle/grid.js';
import {hooks,rpInputReset,rpUI} from '../core/hooks.js';
import {rpBuzz} from '../core/options.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {RP_SK} from '../data/classes.js';
import {RP_ITEMS} from '../data/items.js';
import {RP_E} from '../data/monsters.js';
import {makeK} from '../engine/art.js';
import {sfx} from '../engine/audio.js';
import {confetti} from '../engine/fx.js';
import {sheetOfFoe,sheetOfKobold} from '../engine/sheets.js';
import {artName} from '../engine/sprites.js';
import {clamp} from '../engine/util.js';
import {rpSay,rpToast} from '../game/dialogue.js';
import {rpMemSkills,v6Stats} from '../game/sheet.js';
import {s6SharedWin} from '../game/story.js';
import {net,netEmit,netFocus,netName,netOnline,netPresence,netRid} from './core.js';
import {netCleanParty,netLobFix,netLobSend,netParty} from './lobby.js';
const NET_TURN_MS=20000,NET_LOST_MS=8000;
/* the tests shorten the waits (window.__kqTurnMs, __kqLostMs in the test build); the game uses the design's */
const turnMs=()=>(typeof TEST!=='undefined'&&TEST&&typeof window!=='undefined'&&window.__kqTurnMs)||NET_TURN_MS,lostMs=()=>(typeof TEST!=='undefined'&&TEST&&typeof window!=='undefined'&&window.__kqLostMs)||NET_LOST_MS;
/* a v6 foe's entry sent with the start (v6 keys are made at run time): numbers and short strings only */
function netClean6E(E){const o={};for(const [k,v] of Object.entries(E))if(typeof v==='number'||typeof v==='boolean'||(typeof v==='string'&&v.length<80)||(v&&typeof v==='object'&&JSON.stringify(v).length<2000))o[k]=v;o.v6=1;o.n=String(E.n||'Foe').slice(0,30);return o}
function netSendStart(b){
  const units=b.units.map(u=>{const o={s:u.side,o:u.own,x:u.x,y:u.y,z:u.sz,hp:u.hp,mx:u.max,aw:u.aware?1:0,pd:u.pod||0};
    if(u.own==='h')o.m=netParty()[rp.s.party.indexOf(u.m)];else if(u.own==='g')o.gi=u.gi!=null?u.gi:b.net.gParty.indexOf(u.m);else{o.k=u.key;o.a=Math.round(u.atk*100)/100;o.d=u.def;o.sp=u.spd;if(b.v6)o.E=RP_E[u.key]}if(b.v6){o.ct=u.ct||0;o.se=u.seat}return o});
  const msg={t:'start',id:b.net.id,to:b.net.peer,duel:b.duel?1:0,W:b.W,H:b.H,th:b.theme,boss:b.boss,zone:b.zone,ex:b.exits?1:0,g:b.g.map(r=>r.join('')).join('|'),u:units,v6:b.v6?1:0,sp:b.v6&&b.boss&&b.story?b.story:null,cap:b.v6?rp.s.party[0].lvl:0,th6:b.theme6||null,dk:b.dark?1:0,xm:b.xpMul||1};
  netEmit(msg);b.net.startMsg=msg;b.net.startT=b.net.startT0=performance.now();
}
/* the joining player builds a copy of the host's battle and then just follows its snapshots */
function netBuildMirror(d,hostPeer){
  const s=rp.s,flip=!!d.duel,W=+d.W,H=+d.H;if(!(W>0&&H>0)||!Array.isArray(d.u))return;
  let rows=String(d.g).split('|');if(rows.length!==H)return;if(flip)rows=rows.reverse();
  const L=net.lob;net.lob=null;
  const b={W,H,g:rows.map(r=>r.split('')),theme:d.th,units:[],vis:new Uint8Array(W*H),queue:[],cur:null,round:0,phase:'place',mode:'move',pend:null,seq:[],step:null,cam:{x:0,y:0},camT:null,over:null,
    boss:d.boss||null,zone:d.zone||null,msg:'',exits:!!d.ex,lastSeen:[],chans:[],img:null,placeSel:null,moveId:0,t:0,duel:!!d.duel,net:{role:'guest',id:d.id,peer:hostPeer,flip,lastSnap:performance.now(),n:0}};
  if(d.v6){b.v6=true;b.theme6=typeof d.th6==='string'?d.th6:null;b.dark=!!d.dk;b.xpMul=clamp(+d.xm||1,1,3);b.syncCap=clamp(+d.cap||0,0,30);b.shared=typeof d.sp==='string'?d.sp.slice(0,40):null}
  d.u.forEach(o=>{const side=flip?1-o.s:o.s,y=flip?H-o.z-o.y:o.y;let u;
    if(o.o==='g'||o.o==='h'){const m=o.o==='g'?s.party[o.gi]:netCleanParty([o.m])[0];if(!m)return;
      u={side,m,name:m.name,x:o.x,y,sz:1,ap:0,stun:0,slow:0,buff:{atk:0,def:0},guard:0,watch:0,chan:null,aware:true,fled:false,own:o.o,ctl:o.o==='g'?'me':'remote',get hp(){return m.hp},set hp(v){m.hp=v},get max(){return v6Stats(m).hp}};
      u.k=makeK({team:o.o==='g'?0:(flip?3:0),name:m.name,art:artName(m.name),weapon:m.w,hp:u.max,size:.62},0,0,true)}
    else{if(d.v6&&!RP_E[o.k]&&/^v6/.test(String(o.k))&&o.E&&typeof o.E==='object')RP_E[o.k]=netClean6E(o.E);const E=RP_E[o.k];if(!E)return;u={side,E,key:o.k,name:E.n,x:o.x,y,sz:o.z,hp:o.hp,max:o.mx,atk:o.a,def:o.d,spd:o.sp,ap:0,stun:0,slow:0,buff:{atk:0,def:0},guard:0,watch:0,chan:null,aware:!!o.aw,pod:o.pd,turns:0,fled:false,own:'e',ctl:'ai'};
      u.k=makeK({team:E.team,name:E.n,art:E.art||o.k,weapon:E.w,hp:E.hp,size:E.boss?1.25:.62*(E.size||1)},0,0,true)}
    if(d.v6){u.ct=+o.ct||0;u.seat=o.se}
    if(u.m&&u.m.v6)u.k.sheetFn=()=>sheetOfKobold(u.m);else if(u.E&&u.E.v6)u.k.sheetFn=()=>sheetOfFoe(u.E);
    u.k.face=side===0?1:-1;const hh=tcHome(u);u.k.x=hh.x;u.k.y=hh.y;b.units.push(u)});
  if(b.units.length!==d.u.length){net.mirrorFail='units '+b.units.length+'/'+d.u.length;return}
  rp.bt=b;rp.mode='battle';rp.path=null;rpInputReset();tcVis(b);tcCamTo(b,b.units.find(u=>u.ctl==='me')||b.units[0],true);
  b.msg=(b.duel?'Duel! ':'')+'Place your kobolds. '+netName()+' starts the battle.';if(!rp.headless)sfx('crit');rpBuzz(40);netPresence(true);rpUI(true);
}
/* host: send the battle state whenever it changes (and a heartbeat) */
function netSnapSig(b){return b.units.map(u=>u.x+','+u.y+','+u.hp+','+u.ap+(u.fled?'f':'')+(u.aware?'a':'')+u.stun+u.slow+u.guard+u.watch+(u.m?u.m.mp:'')+'c'+Math.round(u.ct||0)).join('|')+'#'+(b.cur?b.units.indexOf(b.cur):-1)+b.phase+b.round+b.msg+(b.over||'')+net.fx.length}
function netHostFrame(b,dt){
  const now=performance.now();
  if(b.net.startMsg&&!b.net.ready&&now-b.net.startT>1500&&now-b.net.startT0<30000){netEmit(b.net.startMsg);b.net.startT=now}
  const sig=netSnapSig(b);
  if((sig!==net.snapSig&&now-net.snapT>180)||now-net.snapT>1500){net.snapSig=sig;net.snapT=now;netSendSnap(b)}
  /* the friend vanished: their kobolds fight on by themselves */
  const here=net.room&&net.room.peers().some(p=>p.peer===b.net.peer);
  if(here)b.net.lost=0;else if(!b.net.lost)b.net.lost=now;
  if(b.net.lost&&now-b.net.lost>lostMs()&&!b.net.ai){b.net.ai=1;
    /* v6 (systems.md §12): a player who leaves mid-fight leaves their kobolds guarding until the fight ends */
    if(b.v6){b.units.forEach(u=>{if(u.ctl==='remote')u.ctl='guard'});rpToast(netName()+' left; their kobolds guard until the fight ends.');if(b.phase==='remote'&&b.cur){b.cur.guard=1;tcEndTurn()}}
    else{b.units.forEach(u=>{if(u.ctl==='remote')u.ctl='ai'});rpToast(netName()+' lost connection; their kobolds fight on their own.');if(b.phase==='remote'&&b.cur){b.phase='ai';rpAiTurn(b.cur)}}}
  /* the turn timer (systems.md §12): 20 seconds a turn in a shared fight, then the kobold guards; a warning at 15 */
  const u=b.cur;if(b.v6&&!b.duel&&!b.net.ai&&u&&u.side===0&&(b.phase==='turn'||b.phase==='remote')&&!b.seq.length&&b.turnT){const age=now-b.turnT;
    if(age>turnMs()*.75&&!b.warned){b.warned=1;if(u.ctl==='me'){rpToast('5 seconds left!');rpBuzz([20,40,20])}}
    if(age>turnMs()){u.guard=1;b.msg=u.name+' waited too long and guards.';tcFloatU(u,'guard','#9ad0ff');b.pend=null;tcEndTurn()}}
}
function netSendSnap(b){
  const fx=net.fx.splice(0,40);
  netEmit({t:'snap',id:b.net.id,to:b.net.peer,n:++net.snapN,cur:b.cur?b.units.indexOf(b.cur):-1,ph:b.phase,msg:String(b.msg||'').slice(0,160),rd:b.round,ov:b.over||0,tw:b.warned?1:0,
    u:b.units.map(u=>[u.x,u.y,u.hp,u.m?u.m.mp:0,u.ap,u.stun|0,u.slow|0,u.guard|0,u.watch|0,u.fled?1:0,u.aware?1:0,u.buff.atk|0,u.buff.def|0,Math.round(u.ct||0)]),
    ch:b.chans.map(c=>[b.units.indexOf(c.u),c.cx,c.cy,c.area]),fx});
}
function netFx(o){const b=rp.bt;if(b&&b.net&&b.net.role==='host'){net.fx.push(o);if(net.fx.length>60)net.fx.shift()}}
/* guest: apply a snapshot */
function netApplySnap(b,d){
  if(!Array.isArray(d.u)||d.u.length!==b.units.length)return;if(d.n<=b.net.n)return;b.net.n=d.n;b.net.lastSnap=performance.now();b.net.started=1;
  const H=b.H,fl=b.net.flip;
  d.u.forEach((a,i)=>{const u=b.units[i];const wasLive=tcLive(u);u.x=a[0];u.y=fl?H-u.sz-a[1]:a[1];
    if(u.own==='e'){u.hp=a[2]}else{u.m.hp=a[2];if(u.m)u.m.mp=a[3]}
    u.ap=a[4];u.stun=a[5];u.slow=a[6];u.guard=a[7];u.watch=a[8];u.fled=!!a[9];u.aware=!!a[10];u.buff.atk=a[11];u.buff.def=a[12];if(b.v6)u.ct=+a[13]||0;
    const live=tcLive(u);if(wasLive&&!live&&!u.fled){u.k.state='ko';u.k.rotT=(u.side?1:-1)*Math.PI/2;if(!rp.headless)sfx('ko')}
    if(!wasLive&&live){u.k.state='idle';u.k.rot=0;u.k.rotT=0}});
  b.chans=(d.ch||[]).map(c=>({u:b.units[c[0]],cx:c[1],cy:fl?H-1-c[2]:c[2],area:c[3],side:b.units[c[0]]?b.units[c[0]].side:1}));
  (d.fx||[]).forEach(f=>{const u=b.units[f.u];if(!u)return;if(f.h){u.k.hurt=.3;u.k.squash=1;if(!rp.headless)sfx('hit');return}rpFloat(u.k.x,u.k.y-(f.dy||46*(u.sz>1?1.6:1)),String(f.t).slice(0,20),f.c,f.s||13)});
  const prevCur=b.cur;b.cur=d.cur>=0?b.units[d.cur]:null;b.round=d.rd;
  if(d.tw&&!b.net.warnedT&&d.ph==='remote'&&b.cur&&b.cur.ctl==='me'){b.net.warnedT=1;rpToast('5 seconds left!');rpBuzz([20,40,20])}if(!d.tw)b.net.warnedT=0;
  if(d.ov){if(!b.over){b.over=netOver(b,d.ov);b.phase='end';netGuestEnd(b)}}
  else if(d.ph==='place'){b.phase='place';b.msg='Place your kobolds. '+netName()+' starts the battle.'}
  else if(d.ph==='remote'&&b.cur&&b.cur.ctl==='me'){if(b.phase!=='turn'||prevCur!==b.cur||b.net.waitAct){b.net.waitAct=null;b.phase='turn';b.mode='move';b.pend=null;b.msg=b.cur.name+'\'s turn · '+b.cur.ap+' AP';tcCamTo(b,b.cur);rpBuzz(20)}}
  else{b.phase='wait';b.msg=d.msg;if(b.cur&&prevCur!==b.cur&&tcShown(b,b.cur))tcCamTo(b,b.cur)}
  tcVis(b);rpUI(true);
}
function netOver(b,ov){if(b.duel){return ov==='duelwin'?'duellose':ov==='duellose'?'duelwin':ov}return ov}
function netGuestFrame(b,dt){
  const now=performance.now();
  if(b.net.waitAct&&now-b.net.waitAct.t>2500&&!b.over){b.net.waitAct.t=now;netEmit(b.net.waitAct.msg)}
  if(!b.over&&now-b.net.lastSnap>(b.net.started?12000:20000)){b.over='lost';b.phase='end';b.msg='Lost contact with '+netName()+'. Your kobolds head home.';rpUI(true)}
}
/* guest: send my move to the host */
function netSerAct(b,act){const fl=b.net&&b.net.flip,H=b.H,fy=y=>fl?H-1-y:y,o={k:act.k};
  if(act.path){o.path=act.path.map(([x,y])=>[x,fy(y)]);o.cost=act.cost}if(act.t)o.t=b.units.indexOf(act.t);if(act.f)o.f=b.units.indexOf(act.f);if(act.sk)o.sk=act.sk;if(act.it)o.it=act.it;
  if(act.cx!=null){o.cx=act.cx;o.cy=fy(act.cy)}if(act.ui!=null){o.ui=act.ui;o.x=act.x;o.y=fy(act.y)}return o}
function netSendAct(b,act){const msg={t:'act',id:b.net.id,to:b.net.peer,n:++net.actN,cur:b.cur?b.units.indexOf(b.cur):-1,a:netSerAct(b,act)};netEmit(msg);b.net.waitAct={msg,t:performance.now()};
  if(act.k==='it'&&rp.s.bag[act.it]>0)rp.s.bag[act.it]--;b.phase='wait';b.pend=null;b.msg='…';rpUI(true)}
/* host: a move arrives from the friend */
function netHostAct(b,d){
  if(d.n<=(b.net.lastAct||0)){netSendSnap(b);return}const a=d.a||{};
  if(a.k==='place'){if(b.phase!=='place')return;b.net.lastAct=d.n;const u=b.units[a.ui];if(!u||u.ctl!=='remote')return;const x=a.x|0,y=a.y|0;
    const zone=b.duel?(y<=2):(y>=b.H-3);if(zone&&x>=0&&x<b.W&&!tcT(b.g[y][x]).solid&&!tcUnitAt(b,x,y)){u.x=x;u.y=y;tcVis(b)}return}
  const u=b.cur;if(!u||u.ctl!=='remote'||b.phase!=='remote'||b.units.indexOf(u)!==d.cur){netSendSnap(b);return}
  const act={k:a.k};
  if(a.t!=null){act.t=b.units[a.t];if(!act.t)return}
  if(a.f!=null){act.f=b.units[a.f];if(!act.f)return}
  if(a.sk){if(!RP_SK[a.sk]||!rpMemSkills(u.m).includes(a.sk))return;act.sk=a.sk}
  if(a.it){if(!RP_ITEMS[a.it])return;act.it=a.it}
  if(a.cx!=null){act.cx=a.cx|0;act.cy=a.cy|0}
  if(a.k==='move'){const R=tcReach(b,u,v6Move(u)*(u.ap>=2?2:1)),last=Array.isArray(a.path)&&a.path[a.path.length-1];if(!last)return;const p=tcPath(R,last[0]|0,last[1]|0);if(!p||!p.length)return;
    const d2=R.dist.get(last[1]*b.W+last[0]);act.path=p;act.cost=d2<=v6Move(u)?1:2}
  b.net.lastAct=d.n;
  if(tcDo(u,act)){b.phase='busy';if(!rp.headless)sfx('drop')}else netSendSnap(b);
}
/* guest: battle over, my own rewards */
function netGuestEnd(b){
  if(b.over==='win'){rpRewards(b);if(b.v6)s6SharedWin(b.shared)}
  else if(b.over==='lose')b.msg='Your side fell...';
  else if(b.over==='run')b.msg='You slipped away.';
  else if(b.over==='duelwin'){b.msg='You won the duel against '+netName()+'!';if(!rp.headless)confetti()}
  else if(b.over==='duellose')b.msg=netName()+' won the duel. Good fight!';
  rpUI(true)}
/* ---------- duels ---------- */
function netDuelAsk(){if(!netOnline())return;const id=netRid();net.lob={id,host:true,duel:true,keys:[],opt:{},hsel:rp.s.party.map((m,i)=>m.hp>0?i:-1).filter(i=>i>=0).slice(0,3),g:null};
  netEmit({t:'duel?',id,to:net.partner.peer});rp.mode='lobby';rpUI(true)}
function netDuelAccept(){const A=net.duelAsk;if(!A)return;net.lob={id:A.id,host:false,duel:true,sel:[rp.s.party.findIndex(m=>m.hp>0)].filter(i=>i>=0),hostPeer:A.peer,seen:performance.now()};
  netEmit({t:'duelok',id:A.id,to:A.peer,party:netParty()});rp.mode='lobby';rpUI(true)}

/* online messages this module answers, and its data-net buttons */
feature({id:'net-battle-io',
  net:{
    start(d,msg){const b=rp.bt,L=net.lob;net.lastStart=d;if(b&&b.net&&b.net.id===d.id){netEmit({t:'ready',id:d.id,to:msg.peer});return}if(L&&!L.host&&L.id===d.id&&rp.mode==='lobby'){netBuildMirror(d,msg.peer);netEmit({t:'ready',id:d.id,to:msg.peer})}},
    ready(d,msg){const b=rp.bt,L=net.lob;if(b&&b.net&&b.net.role==='host'&&b.net.id===d.id)b.net.ready=1},
    snap(d,msg){const b=rp.bt,L=net.lob;if(b&&b.net&&b.net.role==='guest'&&b.net.id===d.id)netApplySnap(b,d)},
    act(d,msg){const b=rp.bt,L=net.lob;if(b&&b.net&&b.net.role==='host'&&b.net.id===d.id&&msg.peer===b.net.peer)netHostAct(b,d)},
    'duel?'(d,msg){const b=rp.bt,L=net.lob;if(rp.mode==='map'&&rp.s){net.duelAsk={id:d.id,peer:msg.peer};net.focus=msg.peer;netFocus();rpSay([{who:netName(),text:netName()+' challenges you to a duel! Each picks 1 to 3 kobolds. No one loses gold or gear.'}],[{t:'Accept',fn:()=>netDuelAccept()},{t:'Decline',fn:()=>{netEmit({t:'duelno',id:d.id,to:msg.peer})}}])}else netEmit({t:'duelno',id:d.id,to:msg.peer,busy:1})},
    duelno(d,msg){const b=rp.bt,L=net.lob;if(L&&L.host&&L.duel&&L.id===d.id){net.lob=null;if(rp.mode==='lobby')rp.mode='map';rpToast(netName()+(d.busy?' is busy right now.':' declined the duel.'));rp.sig=''}},
    duelok(d,msg){const b=rp.bt,L=net.lob;if(L&&L.host&&L.duel&&L.id===d.id&&!L.g){{const gp=netCleanParty(d.party);L.g={peer:msg.peer,by:msg.by,party:gp,sel:[Math.max(0,gp.findIndex(m=>m.hp>0))]}}netLobFix(L,'g');netLobSend();rp.sig=''}}},
  actions:{
    'net:duel'(d){netDuelAsk()}}});

Object.assign(hooks,{netFx,hostFrame:netHostFrame,guestFrame:netGuestFrame});
export {NET_LOST_MS,NET_TURN_MS,lostMs,netApplySnap,netBuildMirror,netClean6E,netDuelAccept,netDuelAsk,netFx,netGuestEnd,netGuestFrame,netHostAct,netHostFrame,netOver,netSendAct,netSendSnap,netSendStart,netSerAct,netSnapSig,turnMs};
