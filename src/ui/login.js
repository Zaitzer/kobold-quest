/* Website only (SITE build): log in or make an account on the title screen, then play on the shared server.
   On the Claude page none of this runs; the page's own sign-in is used. */
import {createOnline} from '../adapters/online.js';
import {platform} from '../adapters/platform.js';
import {view} from '../core/app.js';
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {$} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {netInit} from '../net/core.js';

let online=null;
/* a newer version is live: save and reload, but never in the middle of a fight or a lobby */
function updateWhenSafe(){if(rp.s&&(rp.mode==='battle'||rp.mode==='lobby')){setTimeout(updateWhenSafe,3000);return}
  try{if(rp.s&&view==='rpg')rpSave()}catch(e){}if(rp.s&&view==='rpg')rpToast('Updating to the newest version…');setTimeout(()=>location.reload(),view==='rpg'?900:100)}
function wsUrl(){return(location.protocol==='https:'?'wss:':'ws:')+'//'+location.host+'/ws'}
function say(t,bad){const m=$('login-msg');m.textContent=t||'';m.classList.toggle('bad',!!bad)}
function showLoggedOut(){$('login').hidden=false;$('go-rpg').hidden=true;$('tuser').hidden=true;setTimeout(()=>{try{$('login-name').focus()}catch(e){}},50)}
async function loggedIn(me){
  platform.provider=online.provider;
  say('Loading your kobolds…');
  await netInit();
  say('');$('login').hidden=true;$('tuser-name').textContent=me.name;$('tuser').hidden=false;$('go-rpg').hidden=false;$('login-pass').value=''}
async function attempt(kind){
  const name=$('login-name').value.trim(),pass=$('login-pass').value;
  if(!name||!pass){say('Type a name and a password.',true);return}
  $('login-go').disabled=$('login-new').disabled=true;say(kind==='register'?'Making your account…':'Logging in…');
  const code=$('login-code').value.trim();
  try{if(code&&kind==='login'){say('Setting your new password…');await online.account.resetpw(name,code,pass);$('login-code').value='';$('login-code').hidden=true}
    await loggedIn(await online.account[kind](name,pass))}catch(e){say(typeof e==='string'?e:'Can\'t reach the game server.',true)}
  $('login-go').disabled=$('login-new').disabled=false}
feature({id:'site-login',init(){
  if(typeof SITE==='undefined'||!SITE)return;
  online=createOnline(wsUrl());
  online.account.onNewVersion=updateWhenSafe;
  $('login').addEventListener('submit',e=>{e.preventDefault();attempt('login')});
  $('login-new').addEventListener('click',()=>attempt('register'));
  $('login-hascode').addEventListener('click',()=>{const c=$('login-code');c.hidden=false;c.focus();say('Type your name, the code, and the new password you want.')});
  $('logout').addEventListener('click',()=>{online.account.logout();location.reload()});
  $('go-rpg').hidden=true;
  if(online.account.hasToken()){say('Logging in…');$('login').hidden=false;online.account.resume().then(loggedIn).catch(e=>{say(typeof e==='string'?e:'',!!e);showLoggedOut()})}
  else showLoggedOut()}});
export {attempt,loggedIn,online,say,showLoggedOut,updateWhenSafe,wsUrl};
