/* ---------- player input ---------- */
import {v6Crit,v6DmgRange,v6Hit,v6InReach,v6LegalTiles,v6Move,v6ReviveOK,v6TogetherOpts} from '../battle/combat.js';
import {v6CanRetry,v6Retry} from '../battle/end.js';
import {rpEndBattle,rpTacBegin,tcDo,tcUpcoming} from '../battle/flow.js';
import {rpTW,tcActCost,tcAt,tcCanPay,tcCheb,tcCover,tcHome,tcLive,tcLosT,tcMelee,tcPath,tcReach,tcShown,tcT,tcTiles,tcUnitAt,tcVis,tcW} from '../battle/grid.js';
import {rpUI} from '../core/hooks.js';
import {BVH,BVW,TT,rpLoc,rpVec,rpcv} from '../core/layout.js';
import {rpOpt,rpOptSave} from '../core/options.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {RP_ST} from '../data/battle.js';
import {RP_SK} from '../data/classes.js';
import {RP_ITEMS} from '../data/items.js';
import {WEAPONS} from '../engine/art.js';
import {sfx} from '../engine/audio.js';
import {clamp,esc2} from '../engine/util.js';
import {rpMemSkills,v6Stats} from '../game/sheet.js';
import {netSendAct,netSerAct} from '../net/battle.js';
import {net,netEmit,netName} from '../net/core.js';
import {rpBar} from './hud.js';

function tcTargets(b,u){
  const m=b.mode;
  if(m==='tog')return[...new Set(v6TogetherOpts(b,u).map(o=>o.t))];
  if(m==='move'||m==='atk')return tcCanPay(u,tcActCost(u,{k:'atk'}))?b.units.filter(t=>t.side===1&&tcLive(t)&&tcShown(b,t)&&v6InReach(b,u,t)):[];
  if(m.startsWith('sk:')){const sk=m.slice(3),S=RP_SK[sk],T=RP_ST[sk]||{};
    if(S.heal&&!T.self)return b.units.filter(t=>t.side===0&&tcLive(t)&&v6InReach(b,u,t,T.rng));
    if(S.revive)return b.units.filter(t=>t.side===0&&!t.fled&&t.hp<=0&&tcCheb(u,t)<=1);
    if(T.area||T.self||T.around)return[];
    return b.units.filter(t=>t.side===1&&tcLive(t)&&tcShown(b,t)&&v6InReach(b,u,t,T.rng))}
  if(m.startsWith('it:')){const it=m.slice(3);return b.units.filter(t=>t.side===0&&!t.fled&&tcCheb(u,t)<=1&&(it==='feather'?t.hp<=0:tcLive(t)))}
  return[];
}
/* the hit chance and a skull when the hit can fell the foe, drawn over every foe the chosen action reaches (ui-design.md §5) */
function tcHitBadge(b,u,t){const sk=b.mode.startsWith('sk:')?b.mode.slice(3):null,T=sk?RP_ST[sk]||{}:{},o=sk?{spell:T.spell,aim:T.aim}:{};if(sk&&RP_SK[sk].heal)return null;
  const h=o.spell?100:v6Hit(b,u,t,o).h,D=v6DmgRange(b,u,t,sk?RP_SK[sk].mul||1:1,o);return{h,kill:D[0]>=t.hp}}
function tcPreviewAttack(b,u,t,act){
  const o=act.k==='sk'?{spell:(RP_ST[act.sk]||{}).spell,aim:(RP_ST[act.sk]||{}).aim}:{};const mul=act.k==='sk'?RP_SK[act.sk].mul||1:1;
  const H=o.spell?{h:100,parts:['spells never miss'],fl:false}:v6Hit(b,u,t,o),D=v6DmgRange(b,u,t,mul,o),cr=Math.round(v6Crit(b,u,t,H.fl)*100);
  const nm=act.k==='sk'?RP_SK[act.sk].n:WEAPONS[tcW(u)].n,c=tcActCost(u,act);
  act=Object.assign({},act,{t});
  return{t,act,info:'<b>'+esc2(nm)+' → '+esc2(t.name)+'</b>: <b class="hp">'+H.h+'%</b> to hit · '+D[0]+'–'+D[1]+' damage · '+cr+'% crit'+(H.parts.length?' <small>('+H.parts.join(', ')+')</small>':'')+' · '+(c==='end'?'ends turn':c+' AP')}}
function rpTacClick(e){
  const b=rp.bt;if(!b||rp.tcPanned)return;
  const L=rpLoc(e,rpcv),x=Math.floor((L.x/L.w*BVW+b.cam.x)/TT),y=Math.floor((L.y/L.h*BVH+b.cam.y)/TT);
  if(x<0||y<0||x>=b.W||y>=b.H)return;rpTacTap(x,y);rpUI(true);
}
/* v6 taps (ui-design.md §3, §7): a move, an attack, a skill on one target, an item or Together happen on the first tap; an area, a move
   that gives foes free hits and leaving the field show a preview and take a second tap */
function rpTacTap(x,y){const b=rp.bt;rpTacTap0(x,y);const P=b&&b.pend;
  if(b&&P&&b.phase==='turn'&&!P.tiles&&!(P.aoo&&P.aoo.length)&&P.act&&P.act.k!=='leave')rpTacConfirm()}
function rpTacTap0(x,y){
  const b=rp.bt;
  if(b.phase==='place'){const who=b.units.find(u=>u.side===0&&(u.ctl||'me')==='me'&&u.x===x&&u.y===y);
    if(who){b.placeSel=b.placeSel===who?null:who;return}
    if(b.placeSel&&y>=b.H-3&&!tcT(b.g[y][x]).solid&&!tcUnitAt(b,x,y)){if(b.net&&b.net.role==='guest')netEmit({t:'act',id:b.net.id,to:b.net.peer,n:++net.actN,a:netSerAct(b,{k:'place',ui:b.units.indexOf(b.placeSel),x,y})});b.placeSel.x=x;b.placeSel.y=y;tcVis(b);if(!rp.headless)sfx('drop');b.placeSel=null}
    return}
  if(b.phase!=='turn')return;const u=b.cur;if(!u||u.side!==0||(u.ctl&&u.ctl!=='me'))return;
  const P=b.pend;
  /* second tap on the same spot confirms */
  if(P&&P.tx===x&&P.ty===y){rpTacConfirm();return}
  const t=tcUnitAt(b,x,y);const m=b.mode;
  if(m.startsWith('sk:')){const sk=m.slice(3),S=RP_SK[sk],T=RP_ST[sk]||{};
    if(T.area){const L=v6LegalTiles(b,u,sk),rng=T.rng==='w'?rpTW(tcW(u)).r:T.rng;if(L?!L.some(([a,c])=>a===x&&c===y):(Math.hypot(x-u.x,y-u.y)>rng+.5||!tcLosT(b,u.x,u.y,x,y)||b.vis[y*b.W+x]===0)){b.msg=T.tile?'Pick a glowing tile: empty, in reach and in sight.':'Out of range or out of sight.';b.pend=null;return}
      const tiles=[];for(let yy=0;yy<b.H;yy++)for(let xx=0;xx<b.W;xx++)if(Math.hypot(xx-x,yy-y)<=T.area+.01)tiles.push([xx,yy]);
      const hits=b.units.filter(v=>tcLive(v)&&tcShown(b,v)&&tcTiles(v).some(([a,c])=>Math.hypot(a-x,c-y)<=T.area+.01));const own=hits.filter(v=>v.side===0);
      b.pend={act:{k:'sk',sk,cx:x,cy:y},tx:x,ty:y,tiles,info:'<b>'+S.n+'</b>: hits '+hits.filter(v=>v.side===1).length+' foe'+(own.length?' and <b class="hp">'+own.length+' friend'+(own.length>1?'s':'')+'!</b>':'s')+(T.chan?' · lands on your next turn, enemies may dodge':'')+' · '+S.mp+' MP · '+(T.ap==='end'?'ends turn':T.ap+' AP')};return}
    if(t&&tcTargets(b,u).includes(t)){if(t.side===1)b.pend=Object.assign(tcPreviewAttack(b,u,t,{k:'sk',sk,t}),{tx:x,ty:y});else b.pend={act:{k:'sk',sk,t},t,tx:x,ty:y,info:'<b>'+S.n+'</b> on '+esc2(t.name)+' · '+S.mp+' MP · '+T.ap+' AP'};return}
    b.msg='Pick a highlighted target.';b.pend=null;return}
  if(m.startsWith('it:')){const it=m.slice(3);if(t&&tcTargets(b,u).includes(t)){b.pend={act:{k:'it',it,t},t,tx:x,ty:y,info:'Use a <b>'+RP_ITEMS[it].n.toLowerCase()+'</b> on '+esc2(t.name)+' · 1 AP'};return}
    b.msg='Items work on yourself or a kobold next to you.';b.pend=null;return}
  if(m==='tog'){const o=t&&v6TogetherOpts(b,u).find(o=>o.t===t);if(!o){b.msg='Pick a foe that you and a friend both stand next to.';b.pend=null;return}
    b.pend={act:{k:'together',f:o.f,t},t,tx:x,ty:y,info:'<b>Together</b> with '+esc2(o.f.name)+' on '+esc2(t.name)+': both attack now, flanking (no cover, better crits); '+esc2(o.f.name)+' spends its next turn · 1 AP · once a fight per pair'};return}
  if(t&&t.side===1&&tcShown(b,t)){
    if(!v6InReach(b,u,t)){b.msg=t.name+' is out of reach. '+(tcMelee(u)?'Walk next to it first.':'Get closer or find a clear line.');b.pend=null;return}
    if(!tcCanPay(u,tcActCost(u,{k:'atk'}))){b.msg='Not enough AP to attack with that weapon.';return}
    b.pend=Object.assign(tcPreviewAttack(b,u,t,{k:'atk',t}),{tx:x,ty:y});return}
  const dn=!t&&b.units.find(v=>v.side===0&&v.m&&v.hp<=0&&!v.fled&&v.x===x&&v.y===y);
  if(dn){if(v6ReviveOK(b,u,dn)&&u.ap>=1)b.pend={act:{k:'revive',t:dn},t:dn,tx:x,ty:y,info:'<b>Help up</b> '+esc2(dn.name)+': gets up with 25% HP · 1 AP'};
    else{b.msg=(dn.own||'h')===(u.own||'h')?dn.name+' is down. In a shared fight a friend\'s kobold can help it up.':'Stand next to '+dn.name+' to help it up (1 AP).';b.pend=null}return}
  if(t&&t.side===0){b.msg=t===u?u.name+' · '+u.ap+' AP left.':t.name+': '+t.hp+'/'+t.max+' HP.';b.pend=null;return}
  /* move */
  const mov=v6Move(u),R2=tcReach(b,u,u.ap>=2?mov*2:mov),d=R2.dist.get(y*b.W+x);
  if(d==null||d===0){b.msg='Can\'t walk there.';b.pend=null;return}
  const cost=d<=mov?1:2,path=tcPath(R2,x,y),aoo=[];let px=u.x,py=u.y;
  path.forEach(([ax,ay])=>{b.units.forEach(o=>{if(o.side!==1||!tcLive(o)||!o.aware||!tcMelee(o)||!tcShown(b,o)||aoo.includes(o))return;const rr=rpTW(tcW(o)).r;if(tcCheb(o,{x:px,y:py,sz:1})<=rr&&tcCheb(o,{x:ax,y:ay,sz:1})>rr)aoo.push(o)});px=ax;py=ay});
  const vis=b.units.filter(o=>o.side===1&&tcLive(o)&&tcShown(b,o));let cover=0;
  if(vis.length){const ox=u.x,oy=u.y;u.x=x;u.y=y;cover=Math.min(...vis.map(o=>tcMelee(o)?0:tcCover(b,u,o.x,o.y).c));u.x=ox;u.y=oy}
  else{for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])cover=Math.max(cover,tcT(tcAt(b,x+dx,y+dy)).cov||0)}
  b.pend={act:{k:'move',path,cost},path,tx:x,ty:y,aoo,cover,info:(cost>1?'<b>Dash</b> (2 AP)':'<b>Move</b> (1 AP)')+(cover?' · '+(cover===2?'full':'half')+' cover there':'')+(tcT(b.g[y][x]).grass?' · hidden in tall grass':'')+(aoo.length?' · <b class="hp">⚠ '+aoo.length+' free hit'+(aoo.length>1?'s':'')+'!</b>':'')+(b.exits&&y===b.H-1?' · you can leave the fight from here':'')};
}
function rpTacConfirm(){const b=rp.bt,P=b.pend,u=b.cur;if(!P||!u||b.phase!=='turn')return;b.pend=null;b.mode='move';
  if(b.net&&b.net.role==='guest'){netSendAct(b,P.act);return}
  /* undo (ui-design.md §1.7): a move can be taken back until the kobold does anything else, if nothing happened on the way */
  b.undo=!b.net&&P.act.k==='move'?{u,x:u.x,y:u.y,ap:u.ap,hp:b.units.map(t=>t.hp).join()}:null;
  if(tcDo(u,P.act)){b.phase='busy';if(!rp.headless)sfx('drop')}}
function rpTacBtn(d){
  const b=rp.bt;if(!b)return;const u=b.cur,v=d.v;
  switch(d.tac){
    case 'start':if(!(b.net&&b.net.role==='guest')){rpTacBegin();if(b.net)b.net.started=1}break;
    case 'cont':rpEndBattle();break;
    case 'retry':v6Retry();rpUI(true);break;
    case 'spd':rpOpt.bspd=(rpOpt.bspd||1)>=4?1:(rpOpt.bspd||1)*2;rpOptSave();break;
    case 'ok':rpTacConfirm();break;
    case 'cancel':b.pend=null;b.mode='move';break;
    case 'undo':{const U=b.undo;if(!U||U.u!==u||b.phase!=='turn'||b.units.map(t=>t.hp).join()!==U.hp){b.undo=null;break}
      u.x=U.x;u.y=U.y;u.ap=U.ap;const h=tcHome(u);u.k.x=h.x;u.k.y=h.y;b.undo=null;b.pend=null;b.mode='move';tcVis(b);b.msg=u.name+' steps back.';break}
    case 'auto':if(b.phase==='place'&&!(b.net&&b.net.role==='guest'))rpTacBegin();break;
    case 'mode':if(b.phase!=='turn'||!u)break;b.pend=null;
      if(v==='watch'||v==='guard'||v==='end'||v==='leave'){b.mode='move';b.pend={act:{k:v==='end'?'end':v},self:1,now:v!=='leave',
          info:v==='watch'?'<b>Watch</b>: shoot the first enemy that moves in range (−15 to hit). Ends turn.':v==='guard'?'<b>Guard</b>: −25 to be hit and 25% less damage until your next turn. Ends turn.':v==='leave'?'<b>Leave</b> the battle. '+esc2(u.name)+' is safe but gets no reward. 1 AP.':'<b>End turn</b> with '+u.ap+' AP unused.'};break}
      if(v.startsWith('sk:')){const sk=v.slice(3),T=RP_ST[sk]||{},S=RP_SK[sk];
        if(T.self||T.around){b.mode='move';const al=T.self?b.units.filter(t=>t.side===0&&tcLive(t)&&tcCheb(u,t)<=T.self):b.units.filter(t=>t.side===1&&tcLive(t)&&tcShown(b,t)&&tcCheb(u,t)<=rpTW(tcW(u)).r);
          b.pend={act:{k:'sk',sk},self:1,now:true,info:'<b>'+S.n+'</b>: '+S.d+' · reaches '+al.length+(T.self?' friend'+(al.length===1?'':'s'):' foe'+(al.length===1?'':'s'))+' · '+S.mp+' MP · '+(T.ap==='end'?'ends turn':T.ap+' AP')};break}}
      b.mode=b.mode===v?'move':v;break;
  }
  if(b.pend&&b.pend.now)rpTacConfirm();
}
function rpTacPanel(){
  const b=rp.bt,s=rp.s,u=b.cur;let sig=netName()+'tac|'+b.phase+'|'+b.mode+'|'+b.msg+'|'+(b.pend?b.pend.info:'')+'|'+(u?u.name+u.ap:'')+'|'+b.units.map(x=>x.hp+(x.fled?'f':'')+(x.aware?'a':'')).join(',')+'|'+JSON.stringify(s.bag)+(rpOpt.bspd||1);
  const up=tcUpcoming(b,7);
  /* the timeline (ui-design.md §8): the next turns left to right, the active one large; in a shared fight each kobold carries its
     owner's colour and the active one counts down its 20 seconds */
  const left=b.net&&!b.duel&&b.turnT&&u&&u.side===0&&(b.phase==='turn'||b.phase==='remote')?Math.max(0,20-Math.floor((performance.now()-b.turnT)/1000)):null;
  let h='<div class="tq">'+up.map((x,i)=>{const hid=x.side===1&&!tcShown(b,x);return '<span class="'+(x.side?'foe':'pal')+(b.net&&x.side===0?(x.own==='g'?' og':' oh'):'')+(i===0&&b.phase!=='place'?' now':'')+'">'+(hid?'?':esc2(x.name.split(' ').pop().slice(0,6)))+(i===0&&left!=null?' <i>'+left+'s</i>':'')+'</span>'}).join('')+'</div>';
  h+='<div class="tparty">'+b.units.filter(x=>x.side===0).map(x=>{const st=v6Stats(x.m);return '<div class="tpm'+(x.hp<=0?' down':'')+(x.fled?' gone':'')+(x===u?' on':'')+(x.ctl==='remote'?' fr':'')+'"><b>'+esc2(x.name)+(x.ctl==='remote'?' <i>'+esc2(netName())+'</i>':'')+'</b>'+rpBar(Math.max(0,x.hp),st.hp,x.hp>st.hp*.5?'#7ad67a':x.hp>st.hp*.25?'#ffc857':'#ff6b6b')+'<small>'+Math.max(0,x.hp)+' HP · '+x.m.mp+' MP'+(x===u&&b.phase!=='place'?' · '+'●'.repeat(Math.max(0,x.ap))+'○'.repeat(Math.max(0,2-x.ap)):'')+'</small></div>'}).join('')+'</div>';
  h+='<div class="rpmsg tmsg">'+(b.pend?b.pend.info:esc2(b.msg))+'</div>';
  if(b.phase==='place'&&!(b.net&&b.net.role==='guest'))h+='<div class="tbar two"><button class="pill" type="button" data-tac="auto">Auto<small>as they stand</small></button><button class="pill go big" type="button" data-tac="start">Start battle ▸</button></div>';
  else if(b.phase==='place')h+=b.net&&b.net.role==='guest'?'<div class="tbar"><p class="rptip">Tap one of your kobolds, then a blue tile to move it. '+esc2(netName())+' starts the battle.</p></div>':'<div class="tbar"><p class="rptip">Tap a kobold, then a blue tile to move it. '+(b.net?esc2(netName())+' can place theirs too.':'Enemies hide in the fog.')+'</p><button class="pill go big" type="button" data-tac="start">Start battle ▸</button></div>';
  else if(b.phase==='end'){   /* the result (ui-design.md §7.8): one card, one button */
    const W=b.over==='win',lines=W?['+'+(b.xp6||0)+' XP each · +'+(b.gold6||0)+' gold'].concat((b.got6||[]).length?['Found: '+b.got6.join(', ')]:[],b.ups6||[]):[b.over==='lose'?'The pack fell. A friendly goat carries everyone to the fountain; half your gold stays behind.':b.over==='run'?'You slipped away.':esc2(b.msg)];
    h=h.replace('<div class="rpmsg tmsg">'+(b.pend?b.pend.info:esc2(b.msg))+'</div>','')+'<div class="rpdlg result'+(W?' win':'')+'"><div class="who">'+(W?'Victory!':b.over==='lose'?'Defeat':'The fight is over')+'</div>'+lines.map(t=>'<p>'+esc2(t)+'</p>').join('')+'</div>'+
      '<div class="tbar">'+(v6CanRetry(b)?'<button class="pill big" type="button" data-tac="retry">Try again</button>':'')+'<button class="pill go big" type="button" data-tac="cont">Onward ▸</button></div>'}
  else if(b.phase==='turn'&&u&&u.side===0){
    if(b.pend)h+='<div class="tbar two"><button class="rpb x" type="button" data-tac="cancel">✕ Cancel</button><button class="rpb go" type="button" data-tac="ok">✓ Confirm<small>or tap the same spot again</small></button></div>';
    else{const m=u.m,w=m.w,TW=rpTW(w),ac=tcActCost(u,{k:'atk'}),on=x=>b.mode===x?' on':'';
      h+='<div class="rpcmd tcmd">'+
        '<button class="rpb go'+on('atk')+'" type="button" data-tac="mode" data-v="atk"'+(tcCanPay(u,ac)?'':' disabled')+'>Attack<small>'+WEAPONS[w].n+' · '+(TW.r>1?'range '+TW.r:'reach 1')+' · '+(ac==='end'?'ends turn':ac+' AP')+'</small></button>'+
        (b.undo&&b.undo.u===u&&!b.net?'<button class="rpb" type="button" data-tac="undo">Undo<small>take the move back</small></button>':'')+
        rpMemSkills(m).map(k=>{const S=RP_SK[k],T=RP_ST[k]||{ap:'end'},dk=!!(m.dark&&m.dark[k]);return '<button class="rpb sk'+(dk?' dark':'')+on('sk:'+k)+'" type="button" data-tac="mode" data-v="sk:'+k+'"'+(m.mp<S.mp||!tcCanPay(u,T.ap)?' disabled':'')+'>'+(dk&&T.v6&&T.v6.dark?T.v6.dark.n:S.n)+'<small>'+S.mp+' MP · '+(T.ap==='end'?'ends turn':T.ap+' AP')+(T.chan?' · next turn':'')+(dk?' · +1 corruption':'')+'</small></button>'}).join('')+
        Object.keys(RP_ITEMS).filter(k=>s.bag[k]>0).map(k=>'<button class="rpb it'+on('it:'+k)+'" type="button" data-tac="mode" data-v="it:'+k+'">'+RP_ITEMS[k].n+' ×'+s.bag[k]+'<small>1 AP · self or adjacent</small></button>').join('')+
        (TW.r>1&&!tcMelee(u)?'<button class="rpb" type="button" data-tac="mode" data-v="watch">Watch<small>Shoot the first mover</small></button>':'')+
        (v6TogetherOpts(b,u).length?'<button class="rpb go'+on('tog')+'" type="button" data-tac="mode" data-v="tog">Together<small>'+[...new Set(v6TogetherOpts(b,u).map(o=>esc2(o.f.name)))].join(', ')+' · 1 AP · both attack</small></button>':'')+
        '<button class="rpb" type="button" data-tac="mode" data-v="guard">Guard<small>Harder to hit</small></button>'+
        (b.exits&&u.y===b.H-1?'<button class="rpb" type="button" data-tac="mode" data-v="leave">Leave<small>Escape the fight</small></button>':'')+
        '<button class="rpb x" type="button" data-tac="mode" data-v="end">End turn</button></div>'}}
  else h+='<div class="tbar"><p class="rptip">'+(u&&u.ctl==='remote'?esc2(netName())+'\'s turn…':u&&u.side===1?'Enemy turn…':'…')+'</p><button class="pill" type="button" data-tac="spd">⏩ Enemy speed '+(rpOpt.bspd||1)+'×</button></div>';
  return{sig,h};
}
feature({id:'battle-input',init(){
(function(){let D=null;
  rpcv.addEventListener('pointerdown',e=>{if(rp.mode!=='battle'||!rp.bt)return;if(rp.bt.camT){rp.bt.cam.x=rp.bt.camT.x;rp.bt.cam.y=rp.bt.camT.y;rp.bt.camT=null}D={id:e.pointerId,x:e.clientX,y:e.clientY,cx:rp.bt.cam.x,cy:rp.bt.cam.y,on:false};rp.tcPanned=false;try{rpcv.setPointerCapture(e.pointerId)}catch(_){}});
  rpcv.addEventListener('pointermove',e=>{if(!D||D.id!==e.pointerId||!rp.bt)return;const v=rpVec(e.clientX-D.x,e.clientY-D.y),dx=v.x,dy=v.y;if(!D.on&&Math.hypot(dx,dy)>10)D.on=true;
    if(D.on){const b=rp.bt,k=BVW/(rpcv.clientWidth||BVW);b.camT=null;b.cam.x=clamp(D.cx-dx*k,0,Math.max(0,b.W*TT-BVW));b.cam.y=clamp(D.cy-dy*k,0,Math.max(0,b.H*TT-BVH));e.preventDefault()}});
  const end=e=>{if(!D||(e&&D.id!==e.pointerId))return;if(D.on){rp.tcPanned=true;setTimeout(()=>{rp.tcPanned=false},0)}D=null};
  rpcv.addEventListener('pointerup',end);rpcv.addEventListener('pointercancel',end);
})();
}});

feature({id:'battle-ui',
  panels:{battle:{sig:()=>rp.bt?rpTacPanel().sig:'',html:()=>rp.bt?rpTacPanel().h:null}},
  routes:{tac:d=>rpTacBtn(d)}});
export {rpTacBtn,rpTacClick,rpTacConfirm,rpTacPanel,rpTacTap,rpTacTap0,tcHitBadge,tcPreviewAttack,tcTargets};
