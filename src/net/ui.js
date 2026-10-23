import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {button} from '../engine/html.js';
import {esc2} from '../engine/util.js';
import {netDuelAsk} from './battle.js';
import {net,netFocus,netName,netOnline} from './core.js';
function netMapRow(){
  if(!netOnline())return'';const O=net.others,open=O.find(p=>p.presence.op&&p.presence.m==='lobby');
  const P=open||netFocus()||O[0];if(!P)return'';const pr=P.presence||{};
  const label=O.length>1?O.length+' friends online':esc2(netName(P))+' · '+(pr.m==='battle'?'in a battle':pr.m==='lobby'?'getting ready to fight':esc2(pr.a||''));
  return '<div class="netrow"><span><i></i>'+label+'</span>'+(open&&rp.mode==='map'?button('net:join','⚔ Join '+esc2(netName(open)),{cls:'go',pill:1,data:{'p':esc2(open.peer)},raw:1}):'')+'</div>'}
function netMenuButtons(){const n=netOnline()?(net.others.length>1?'a friend':esc2(netName())):'';
  let h='';if(net.db&&net.me)h+=button('net:market','Market board',{cls:'go',sub:'Buy and sell with other players'});
  if(net.on)h+=button('net:chat','Chat',{cls:'sk',sub:(netOnline()?'Talk to '+n:'Nobody else is online'),raw:1});
  if(!netOnline())return h;
  h+='<button class="rpb it" type="button" data-net="'+(net.others.length>1?'who" data-for="trade':'trade')+'">Give to '+n+'<small>Items, materials or gold</small></button><button class="rpb sk" type="button" data-net="'+(net.others.length>1?'who" data-for="duel':'duel')+'">Duel '+n+'<small>Your party against theirs</small></button>';
  h+='<p class="rptip online">Online: '+net.others.map(p=>esc2(netName(p))+' (level '+(p.presence.lv||'?')+', '+esc2(p.presence.a||'')+')').join(' · ')+'</p>';
  return h}
function netWhoHtml(){const f=net.pickFor==='duel'?'Duel':'Give to';
  return '<div class="rpdlg"><div class="who">'+f+' who?</div></div><div class="rpcmd">'+(net.others||[]).map(p=>button('net:whopick',esc2(netName(p)),{cls:'go',data:{'p':esc2(p.peer)},sub:'Level '+(p.presence.lv||'?')+' · '+esc2(p.presence.a||''),raw:1})).join('')+button('net:whoback','✕ Back',{cls:'x'})+'</div>'}

feature({id:'who',panels:{who:{sig:()=>''+(net.others||[]).length,html:()=>netWhoHtml()}}});
feature({id:'net-menu',menu:[{order:10,html:()=>netMenuButtons()}]});

/* online messages this module answers, and its data-net buttons */
feature({id:'net-ui-io',
  actions:{
    'net:who'(d){net.pickFor=d.for;rp.mode='who'},
    'net:whopick'(d){net.focus=d.p;netFocus();if(net.pickFor==='duel')netDuelAsk();else rp.mode='trade'},
    'net:whoback'(d){rp.mode='menu'}}});
export {netMapRow,netMenuButtons,netWhoHtml};
