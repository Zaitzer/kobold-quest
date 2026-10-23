/* The ☰ menu: party summary, items, settings and anything features add (feature menu:[...] and options:[...]). */
import {show} from '../core/app.js';
import {rpExitFull,rpGoFull} from '../core/layout.js';
import {rpBuzz,rpOpt,rpOptSave} from '../core/options.js';
import {feature,menuItems,options} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp,rpApplyWorld,rpNewState} from '../core/state.js';
import {RP_ITEMS} from '../data/items.js';
import {WEAPONS} from '../engine/art.js';
import {audio,set_soundOn,sfx,soundOn} from '../engine/audio.js';
import {$,esc2} from '../engine/util.js';
import {rpSay} from '../game/dialogue.js';
import {rpMatsLine} from '../game/gear.js';
import {rpQuestList} from '../game/npcs.js';
import {rpIntro} from '../game/play.js';
import {rpStats,rpXpNeed} from '../game/stats.js';
import {netLeaveRpg} from '../net/core.js';
import {rpPartyHtml} from './hud.js';
import {V6S,v6MenuHtml} from './v6screens.js';

const ITEMS_USABLE=['bun','potion','ether','feather'];
function useOn(m,k){const s=rp.s,st=rpStats(m);if(!m||!(s.bag[k]>0))return;
  if(k==='bun'&&m.hp>0&&(m.hp<st.hp||m.mp<st.mp)){m.hp=st.hp;m.mp=st.mp;s.bag[k]--}
  else if(k==='potion'&&m.hp>0&&m.hp<st.hp){m.hp=Math.min(st.hp,m.hp+45);s.bag[k]--}
  else if(k==='ether'&&m.hp>0&&m.mp<st.mp){m.mp=Math.min(st.mp,m.mp+12);s.bag[k]--}
  else if(k==='feather'&&m.hp<=0){m.hp=Math.round(st.hp*.5);s.bag[k]--}
  if(!(s.bag[k]>0))rp.menuSel=null;rpSave()}
function menuHtml(){const s=rp.s;if(s.w6)return v6MenuHtml();
  const stats=s.party.map(m=>{const st=rpStats(m);return '<b>'+esc2(m.name)+'</b> Lv '+m.lvl+' · '+WEAPONS[m.w].n+' · ATK '+Math.round(st.atk)+' DEF '+Math.round(st.def)+' SPD '+st.spd.toFixed(1)+' · XP '+m.xp+'/'+rpXpNeed(m.lvl)}).join('<br>');
  let h=rpPartyHtml()+'<div class="rpmenu"><p>'+stats+'</p><p><b>Materials</b><br><span class="mats">'+rpMatsLine()+'</span></p><p><b>Quests</b><br>'+rpQuestList()+'</p></div><div class="rpcmd">';
  if(rp.menuSel)return h+s.party.map((m,i)=>'<button class="rpb go" type="button" data-rp="useon" data-i="'+i+'">'+esc2(m.name)+'<small>HP '+m.hp+' · MP '+m.mp+'</small></button>').join('')+'<button class="rpb x" type="button" data-rp="menuback">✕ Back</button></div>';
  h+='<button class="rpb sk" type="button" data-rp="hero">⚔ Heroes &amp; gear<small>Equipment, stats and talents</small></button>';
  h+=ITEMS_USABLE.filter(k=>s.bag[k]>0).map(k=>'<button class="rpb it" type="button" data-rp="use" data-k="'+k+'">Use '+RP_ITEMS[k].n+' ×'+s.bag[k]+'</button>').join('');
  h+='<button class="rpb go" type="button" data-rp="close">Back to map</button>';
  h+=options.map(o=>'<button class="rpb" type="button" data-opt="'+o.id+'">'+o.label()+'<small>'+o.hint+'</small></button>').join('');
  h+=menuItems.map(m=>m.html()).join('');
  return h+'<button class="rpb" type="button" data-rp="newgame">New game</button><button class="rpb x" type="button" data-rp="quit">Quit to title</button></div>'}
function soundLabel(){const sb=$('sound');if(sb){sb.setAttribute('aria-pressed',soundOn?'true':'false');sb.textContent=soundOn?'Sound on':'Sound off'}}
feature({id:'menu',
  panels:{menu:{sig:()=>JSON.stringify([V6S.item,rp.s.gold,rp.s.q])+JSON.stringify(rp.s.bag)+rp.s.party.map(m=>m.hp+'/'+m.mp+m.w).join()+rp.menuSel+options.map(o=>o.label()).join(),html:menuHtml}},
  routes:{opt:d=>{const o=options.find(o=>o.id===d.opt);if(o)o.toggle()}},
  actions:{
    menu:()=>{rp.mode='menu';rp.menuSel=null;V6S.item=null},close:()=>{rp.mode='map'},
    use:d=>{rp.menuSel=d.k},menuback:()=>{rp.menuSel=null},
    useon:d=>useOn(rp.s.party[+d.i],rp.menuSel),
    newgame:()=>{rpSay([{who:'',text:'Start a brand new adventure? Your current journey will be lost.'}],[{t:'Yes, start over',fn:()=>{rp.s=rpNewState();rpApplyWorld();rpIntro()}},{t:'Keep playing'}]);return false},
    quit:()=>{rpSave();netLeaveRpg();rpExitFull();show('title');return false}},
  options:[
    {id:'hand',order:10,label:()=>'Joystick on the '+(rpOpt.hand==='left'?'left':'right'),hint:'Tap to swap sides',toggle(){rpOpt.hand=rpOpt.hand==='left'?'right':'left';rpOptSave()}},
    {id:'buzz',order:20,label:()=>'Vibration '+(rpOpt.buzz?'on':'off'),hint:'Shakes on fights and level-ups',toggle(){rpOpt.buzz=!rpOpt.buzz;rpOptSave();if(rpOpt.buzz)rpBuzz(30)}},
    {id:'snd',order:30,label:()=>'Sound '+(soundOn?'on':'off'),hint:'Sound effects and music',toggle(){set_soundOn(!soundOn);soundLabel();if(soundOn){audio();sfx('drop')}}},
    {id:'music',order:40,label:()=>'Music '+(rpOpt.music===false?'off':'on'),hint:'A tune for every area',toggle(){rpOpt.music=rpOpt.music===false;rpOptSave()}},
    {id:'full',order:60,label:()=>'Fullscreen',hint:'Hide the browser bars',toggle(){if(document.fullscreenElement)rpExitFull();else rpGoFull(true)}},
    {id:'bspd',order:70,label:()=>'Enemy turns '+(rpOpt.bspd||1)+'×',hint:'How fast enemies move in battle',toggle(){rpOpt.bspd=(rpOpt.bspd||1)>=4?1:(rpOpt.bspd||1)*2;rpOptSave()}}]});
export {ITEMS_USABLE,menuHtml,soundLabel,useOn};
