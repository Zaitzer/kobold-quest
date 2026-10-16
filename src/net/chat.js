/* ---------- chat ---------- */
import {view} from '../core/app.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {esc2} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {net,netEmit,netNameOf,netOnline} from './core.js';

const NET_SAYS=['Hi! 👋','Need help!','Join my fight?','Duel?','Follow me','Thanks! ❤️','gg','Brb','😂','👍','🎉','⚔️'];
function netCleanText(t){return String(t||'').replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g,'').trim().slice(0,120)}
function netSay(txt){txt=netCleanText(txt);if(!txt||!net.on)return;const now=performance.now();if(now-(net.lastSay||0)<700)return;net.lastSay=now;
  netEmit({t:'chat',txt});net.bubbles.me={txt,t:now};net.chatLog.push({who:'You',txt});if(net.chatLog.length>30)net.chatLog.shift();rp.sig=''}
function netGotChat(d,msg){const txt=netCleanText(d.txt);if(!txt)return;net.bubbles[msg.peer]={txt,t:performance.now()};
  const who=netNameOf(msg.peer);net.chatLog.push({who,txt});if(net.chatLog.length>30)net.chatLog.shift();
  if(rp.mode!=='chat'&&view==='rpg')rpToast(who+': '+(txt.length>40?txt.slice(0,39)+'…':txt));rp.sig=''}
function netChatHtml(){
  let h='<div class="rpdlg"><div class="who">Chat'+(netOnline()?' · '+net.others.length+' online':' · nobody else is here right now')+'</div><div class="chatlog">'+
    (net.chatLog.length?net.chatLog.slice(-8).map(l=>'<p><b>'+esc2(l.who)+':</b> '+esc2(l.txt)+'</p>').join(''):'<p class="rptip">Say hi! Messages pop up over your kobold.</p>')+'</div></div>';
  h+='<div class="chatin"><input id="kq-chat" type="text" maxlength="120" placeholder="Type a message…" autocomplete="off" enterkeyhint="send"><button class="rpb go" type="button" data-net="chatsend">Send</button></div>';
  h+='<div class="says">'+NET_SAYS.map(t=>'<button class="pill" type="button" data-net="say" data-v="'+esc2(t)+'">'+esc2(t)+'</button>').join('')+'</div><div class="tbar"><button class="rpb x" type="button" data-net="chatclose">Done</button></div>';
  return h}

feature({id:'chat',panels:{chat:{sig:()=>net.chatLog.length+'|'+(net.others||[]).length,html:()=>netChatHtml()}}});

/* online messages this module answers, and its data-net buttons */
feature({id:'net-chat-io',
  net:{
    chat(d,msg){const b=rp.bt,L=net.lob;netGotChat(d,msg)}},
  actions:{
    'net:chat'(d){rp.mode='chat'},
    'net:chatclose'(d){rp.mode='map'},
    'net:say'(d){netSay(d.v)},
    'net:chatsend'(d){{const i=document.getElementById('kq-chat');if(i&&i.value.trim()){netSay(i.value);i.value=''}return}}}});
export {NET_SAYS,netChatHtml,netCleanText,netGotChat,netSay};
