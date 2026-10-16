import {emit} from '../core/bus.js';
import {feature} from '../core/registry.js';
import {fill,talk,test} from '../core/rules.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {QUEST_LINE,QUEST_LOG,TALK} from '../data/dialogue.js';
import {RP_IT,RP_ITEMS,RP_SHOP2} from '../data/items.js';
import {regionSign} from '../data/overworld.js';
import {RP_BOUNTY} from '../data/quests.js';
import {sfx} from '../engine/audio.js';
import {rpSay,rpToast} from './dialogue.js';
import {rpCanEquip,rpGive,rpItemDesc} from './items.js';
import {rpGiveXp,rpStats} from './stats.js';
import {rpUI} from '../ui/hud.js';
function rpHealAll(){rp.s.party.forEach(m=>{const st=rpStats(m);m.hp=st.hp;m.mp=st.mp})}
/* shop */
function rpBuyItem(k){const it=RP_ITEMS[k];if(rp.s.gold<it.price)return;rp.s.gold-=it.price;rp.s.bag[k]=(rp.s.bag[k]||0)+1;sfx('drop');rpUI(true)}
/* shop: buying puts gear in the backpack */
/* talking: every villager's lines and quest steps are rules in data/dialogue.js */
function rpTalk(id){emit('talk',id);const T=TALK[id];if(T)talk(T.rules,T.who)}
function rpQuestLine(){const r=QUEST_LINE.find(r=>test(r.if));return r?fill(r.text):''}
function rpQuestList(){const q=rp.s.q,L=[];
  for(const e of QUEST_LOG){if(!test(e.show))continue;const t=typeof e.text==='function'?e.text(q):e.text;L.push((e.hint?'·':e.done&&test(e.done)?'✔':'•')+' '+t)}
  const B=RP_BOUNTY[q.bty||0];if(B&&q.btyBase!=null)L.push('• Bounty: '+B.zn+' ('+Math.min(B.n,((q.kz||{})[B.z]||0)-q.btyBase)+'/'+B.n+')');else if(B&&test(B.if))L.push('· New bounty on the board by the inn');
  return L.join('<br>')}
function rpOpenShop(){rp.mode='shop';rp.shopFor=null;rpUI(true)}
function rpBuyGear(id){const it=RP_IT[id];if(!it||rp.s.gold<it.price)return;rp.s.gold-=it.price;rpGive(id);if(!rp.headless)sfx('win');rpToast(it.n+' is in your backpack');rpUI(true)}
/* ---------- moon shrine: forget talents and pick again ---------- */
function rpShrine(){const s=rp.s;
  rpSay([{who:'Moon shrine',text:'The old stone hums. "Give gold, forget what you learned, and learn it anew." (20 gold per level. Your talents are picked again from scratch.)'}],
    s.party.map((m,i)=>({t:m.name+' ('+(m.lvl*20)+'g)',ok:()=>s.gold>=m.lvl*20&&m.lvl>1,fn:()=>{s.gold-=m.lvl*20;m.tal=[];m.pend=m.lvl-1;m.offer=null;const st=rpStats(m);m.hp=Math.min(m.hp,st.hp);m.mp=Math.min(m.mp,st.mp);rpToast(m.name+' forgets everything (in a good way).')}})).concat([{t:'Leave'}]))}
function rpBoard(){const s=rp.s,q=s.q;if(!q.kz)q.kz={};q.bty=q.bty||0;const B=RP_BOUNTY[q.bty];
  if(!B){rpSay([{who:'Bounty board',text:'Every bounty is crossed out, most of them with your name. The village is very proud.'}]);return}
  if(!test(B.if)){rpSay([{who:'Bounty board',text:'The next bounty is for somewhere you can\'t reach yet. Come back later.'}]);return}
  if(q.btyBase==null){q.btyBase=q.kz[B.z]||0;rpSay([{who:'Bounty board',text:'WANTED: knock out '+B.n+' monsters in '+B.zn+'. Reward: '+B.xp+' XP for the whole party and '+B.g+' gold.'}],null,()=>rpToast('New bounty: '+B.zn));return}
  const done=(q.kz[B.z]||0)-q.btyBase;
  if(done<B.n){rpSay([{who:'Bounty board',text:'Bounty: '+B.zn+', '+done+' of '+B.n+' knocked out.'}]);return}
  s.gold+=B.g;const ups=rpGiveXp(B.xp);q.bty++;q.btyBase=null;
  rpSay([{who:'Bounty board',text:'Bounty claimed! +'+B.xp+' XP for everyone and '+B.g+' gold.'+(ups.length?' '+[...new Set(ups)].join(' and ')+' leveled up!':'')}],null,()=>{if(!rp.headless)sfx('win')})}
function rpOpenSmith(){rp.mode='smith';rp.smithRe=false;rpUI(true)}
feature({id:'shop',
  panels:{shop:{sig:()=>rp.s.gold+'|'+JSON.stringify(rp.s.bag)+rp.s.inv.length,html(){const s=rp.s;
    return '<div class="rpdlg"><div class="who">Biscuit the trader</div><p>"Best goods in Burrowhome! Only goods in Burrowhome." You have '+Math.floor(s.gold)+' gold. Gear goes in your backpack.</p></div><div class="rpcmd shop">'+
      Object.keys(RP_ITEMS).map(k=>'<button class="rpb it" type="button" data-rp="buyitem" data-k="'+k+'"'+(s.gold<RP_ITEMS[k].price?' disabled':'')+'>'+RP_ITEMS[k].n+' · '+RP_ITEMS[k].price+'g<small>'+RP_ITEMS[k].d+' · have '+(s.bag[k]||0)+'</small></button>').join('')+
      RP_SHOP2.map(k=>{const it=RP_IT[k],who=s.party.filter(m=>rpCanEquip(m,k)).map(m=>m.name);return '<button class="rpb '+(it.w?'sk':'go')+'" type="button" data-rp="buyg" data-k="'+k+'"'+(s.gold<it.price?' disabled':'')+'>'+it.n+' · '+it.price+'g<small>'+rpItemDesc(k)+(who.length?'':' · nobody in your party can use it')+'</small></button>'}).join('')+'<button class="rpb x" type="button" data-rp="leave">Leave shop</button></div>'}}},
  actions:{buyitem:d=>rpBuyItem(d.k),buyg:d=>rpBuyGear(d.k),leave:()=>{rp.mode='map';rpSave()}}});

feature({id:'town-spots',tiles:{S:{use:()=>rpShrine()},N:{use:()=>rpBoard()},A:{use:()=>rpTalk('clink')},
  /* signs on roads and in towns, and the healing fountain in every town square */
  i:{use:(x,y)=>rpSay([{who:'Sign',text:regionSign(x,y)||'The words have worn away.'}])},
  O:{use:()=>{rpHealAll();rpSay([{who:'',text:'The fountain water is cold and sweet. Everyone feels fresh again.'}]);if(!rp.headless)sfx('pop')}}}});
export {rpBoard,rpBuyGear,rpBuyItem,rpHealAll,rpOpenShop,rpOpenSmith,rpQuestLine,rpQuestList,rpShrine,rpTalk};
