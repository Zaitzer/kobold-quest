/* Quill the scribe (in the inn) carries letters to the people who make the game. Website only, and only for players on
   the messenger list. Admins also get an admin screen in the ☰ menu: the GitHub token and the list. */
import {hooks,rpUI} from '../core/hooks.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {sfx} from '../engine/audio.js';
import {button} from '../engine/html.js';
import {esc2} from '../engine/util.js';
import {rpArea} from '../game/world.js';
import {net} from './core.js';

const mail={sending:false,msg:'',admin:null};
function rpOpenLetter(){mail.msg='';rp.mode='letter';rpUI(true);const me=mailMe();
  /* the list may have changed since logging in: ask again */
  if(me)net.online.account.call({k:'mailcheck'}).then(r=>{me.canMail=r.canMail;rp.sig='';rpUI(true)}).catch(()=>{})}
function mailMe(){return net.online&&net.online.account.me}
function letterHtml(){const me=mailMe(),who='<div class="who">Quill the scribe</div>';
  if(!me)return '<div class="rpdlg">'+who+'<p>"My pigeons only fly from the website: joakimskar.no. Log in there and come see me."</p></div><div class="tbar">'+button('net:mailclose','Leave',{cls:'x'})+'</div>';
  if(!me.canMail&&!me.admin)return '<div class="rpdlg">'+who+'<p>"Sorry, little one. I only carry letters for friends of the village. Ask Zaitzer to put your name on my list."</p></div><div class="tbar">'+button('net:mailclose','Leave',{cls:'x'})+'</div>';
  return '<div class="rpdlg">'+who+'<p>"A letter for the makers of this world? Tell them what you\'d like to see, or what went wrong. I\'ll send it by pigeon."</p></div>'+
    '<div class="chatin letter"><textarea id="kq-letter" maxlength="1000" rows="4" placeholder="Dear makers…"></textarea></div>'+
    (mail.msg?'<p class="rptip">'+esc2(mail.msg)+'</p>':'')+
    '<div class="tbar">'+button('net:mailsend',(mail.sending?'Sending…':'Send letter'),{cls:'go',disabled:mail.sending,raw:1})+button('net:mailclose','Leave',{cls:'x'})+'</div>'}
async function mailSend(){const i=document.getElementById('kq-letter'),text=i?i.value.trim():'';if(text.length<3){mail.msg='Write a little more first.';rpUI(true);return}
  mail.sending=true;rpUI(true);
  try{const r=await net.online.account.call({k:'mail',text,where:rpArea(rp.s.x,rp.s.y)});mail.msg=r.delivered?'"Off it goes!" The pigeon flaps away.':'"I\'ll send it as soon as the pigeons are back." (It is saved.)';const j=document.getElementById('kq-letter');if(j)j.value='';if(!rp.headless)sfx('win')}
  catch(e){mail.msg=e.message==='too many'?'"My pigeons are tired. Try again in an hour."':e.message==='not on the list'?'"You are not on my list."':'"The pigeon came back. Try again in a moment."'}
  mail.sending=false;rpUI(true)}
/* admin screen */
function adminHtml(){const A=mail.admin;let h='<div class="rpdlg"><div class="who">Admin: the messenger</div>';
  if(!A)return h+'<p>Loading…</p></div><div class="tbar">'+button('net:adminclose','Back',{cls:'x'})+'</div>';
  h+='<p>GitHub token: <b>'+(A.tokenSet?'set'+(A.tokenAt?' ('+esc2(A.tokenAt.slice(0,10))+')':''):'not set')+'</b>. Letters: '+A.letters+(A.waiting?', '+A.waiting+' waiting to send':'')+'.</p>'+
    '<p>On the list: '+esc2(A.fixed.concat(A.added).join(', ')||'nobody')+'</p></div>'+
    '<div class="chatin"><input id="kq-token" type="password" autocomplete="off" placeholder="Paste a GitHub token">'+button('net:admintoken','Save',{cls:'go'})+'</div>'+
    '<div class="chatin"><input id="kq-wl" type="text" autocomplete="off" autocapitalize="off" placeholder="Player name">'+button('net:wladd','Add')+button('net:wldel','Remove')+'</div>'+
    (mail.msg?'<p class="rptip">'+esc2(mail.msg)+'</p>':'')+'<div class="tbar">'+button('net:adminclose','Back',{cls:'x'})+'</div>';
  return h}
async function adminCall(m){try{mail.admin=await net.online.account.call(Object.assign({k:'admin'},m));mail.msg=m.op==='token'?'Token saved and checked with GitHub.':m.op==='wladd'?'Added.':m.op==='wldel'?'Removed.':''}catch(e){mail.msg=e.message}rpUI(true)}
const val=id=>{const i=document.getElementById(id);const v=i?i.value.trim():'';if(i)i.value='';return v};
feature({id:'messenger',
  panels:{letter:{sig:()=>mail.sending+'|'+mail.msg+'|'+!!mailMe(),html:letterHtml},admin:{sig:()=>JSON.stringify(mail.admin)+mail.msg,html:adminHtml}},
  actions:{
    'net:mailsend'(){mailSend()},'net:mailclose'(){rp.mode='map';mail.msg=''},
    'net:admin'(){rp.mode='admin';mail.msg='';adminCall({op:'state'})},'net:adminclose'(){rp.mode='adm';mail.msg=''},
    'net:admintoken'(){const t=val('kq-token');if(t)adminCall({op:'token',token:t})},
    'net:wladd'(){const n=val('kq-wl');if(n)adminCall({op:'wladd',name:n})},'net:wldel'(){const n=val('kq-wl');if(n)adminCall({op:'wldel',name:n})}}});

hooks.letter=rpOpenLetter;
export {adminCall,adminHtml,letterHtml,mail,mailMe,mailSend,rpOpenLetter,val};
