/* ---------- chat ---------- */
import {view} from '../core/app.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {yip} from '../engine/audio.js';
import {esc2} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {adminReport} from './admin.js';
import {net,netEmit,netNameOf,netOnline} from './core.js';

const NET_SAYS=['Hi! 👋','Need help!','Join my fight?','Duel?','Follow me','Thanks! ❤️','gg','Brb','😂','👍','🎉','⚔️'];
function netCleanText(t){return String(t||'').replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g,'').trim().slice(0,120)}
function netSay(txt){txt=netCleanText(txt);if(!txt||!net.on)return;if(net.muteUntil>Date.now()){rpToast('You can\'t chat until '+new Date(net.muteUntil).toLocaleTimeString().slice(0,5)+'.');return}const now=performance.now();if(now-(net.lastSay||0)<700)return;net.lastSay=now;
  netEmit({t:'chat',txt});net.bubbles.me={txt,t:now};net.chatLog.push({who:'You',txt});if(net.chatLog.length>30)net.chatLog.shift();rp.sig=''}
function netGotChat(d,msg){const txt=netCleanText(d.txt);if(!txt)return;net.bubbles[msg.peer]={txt,t:performance.now()};
  const who=netNameOf(msg.peer);net.chatLog.push({who,txt});if(net.chatLog.length>30)net.chatLog.shift();
  if(rp.mode!=='chat'&&view==='rpg')rpToast(who+': '+(txt.length>40?txt.slice(0,39)+'…':txt));rp.sig=''}
/* yip: everyone on the same map hears it, louder the closer they are, from the side they are on */
const YIP_RANGE=14;
function netYipPitch(id){let h=2166136261;for(const c of String(id||''))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return .85+(h%1000)/1000*.4}
function netYipLevel(me,them){if((them.pl||'world')!==(rp.s.place||'world'))return null;const dx=them.x-me.x,dy=them.y-me.y,d=Math.hypot(dx,dy);
  return{vol:Math.pow(Math.max(0,1-d/YIP_RANGE),1.5),pan:Math.max(-1,Math.min(1,dx/8))}}
function netYip(){const now=performance.now();if(now-(net.lastYip||0)<450)return;net.lastYip=now;
  netEmit({t:'yip'});net.bubbles.me={txt:'Yip!',t:now};yip(.9,0,netYipPitch(net.me))}
function netGotYip(d,msg){const P=(net.others||[]).find(p=>p.peer===msg.peer);if(!P||!rp.s)return;const me=rp.pos||{x:rp.s.x+.5,y:rp.s.y+.5};
  const L=netYipLevel(me,P.presence);if(!L)return;net.bubbles[msg.peer]={txt:'Yip!',t:performance.now()};yip(L.vol,L.pan,netYipPitch(P.by))}
function netChatHtml(){
  let h='<div class="rpdlg"><div class="who">Chat'+(netOnline()?' · '+net.others.length+' online':' · nobody else is here right now')+'</div><div class="chatlog">'+
    (net.chatLog.length?net.chatLog.slice(-8).map(l=>'<p><b>'+esc2(l.who)+':</b> '+esc2(l.txt)+'</p>').join(''):'<p class="rptip">Say hi! Messages pop up over your kobold.</p>')+'</div></div>';
  h+='<div class="chatin"><input id="kq-chat" type="text" maxlength="120" placeholder="Type a message…" autocomplete="off" enterkeyhint="send"><button class="rpb go" type="button" data-net="chatsend">Send</button></div>';
  h+=''+(net.partner&&typeof SITE!=='undefined'&&SITE?'<div class="says"><button class="pill" type="button" data-rp="admreport">⚑ Report '+esc2(netNameOf(net.partner.peer))+'</button></div>':'')+'<div class="says"><button class="pill go" type="button" data-net="yip">🐾 Yip!</button>'+NET_SAYS.map(t=>'<button class="pill" type="button" data-net="say" data-v="'+esc2(t)+'">'+esc2(t)+'</button>').join('')+'</div><div class="tbar"><button class="rpb x" type="button" data-net="chatclose">Done</button></div>';
  return h}

feature({id:'chat',panels:{chat:{sig:()=>net.chatLog.length+'|'+(net.others||[]).length,html:()=>netChatHtml()}}});

/* online messages this module answers, and its data-net buttons */
feature({id:'net-chat-io',
  net:{
    chat(d,msg){const b=rp.bt,L=net.lob;netGotChat(d,msg)},
    yip(d,msg){netGotYip(d,msg)}},
  actions:{
    'net:chat'(d){rp.mode='chat'},
    admreport(){if(net.partner)adminReport(net.partner.peer)},
    'net:chatclose'(d){rp.mode='map'},
    'net:say'(d){netSay(d.v)},
    'net:yip'(d){netYip()},
    'net:chatsend'(d){{const i=document.getElementById('kq-chat');if(i&&i.value.trim()){netSay(i.value);i.value=''}return}}}});
export {NET_SAYS,YIP_RANGE,netChatHtml,netCleanText,netGotChat,netGotYip,netSay,netYip,netYipLevel,netYipPitch};
