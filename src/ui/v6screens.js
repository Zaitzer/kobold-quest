/* ---------- Kobold Quest v6: the screens of build step 17 (ui-design.md §6–8) ----------
   The ☰ menu (the pack, the goal, items, the map, the Book, settings, then the rare things), the class pick, the Book (foes, lore and
   the Smiler, places, stamps), the settings, and the Book's own records (foes met and beaten, places seen, festival stamps). */
import {rpBuzz,rpOpt,rpOptSave} from '../core/options.js';
import {feature,menuItems,options} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {CLASSES6} from '../data/v6/classes.js';
import {FOES6} from '../data/v6/foes.js';
import {MAPS6} from '../data/v6/maps.js';
import {KITS6,SKILLS6} from '../data/v6/skills.js';
import {WAVE16} from '../data/v6/story.js';
import {esc2} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {goals} from '../game/story6.js';
import {v6Stats} from '../game/v6sheet.js';
import {w6Pieces} from '../game/world6.js';
import {net} from '../net/core.js';
import {rpBar,rpUI} from './hud.js';

const V6S={book:'foes',item:null,cls:null,page:null};
const bk=()=>{const st=rp.s.w6st;return st.book=st.book||{foes:{},places:{},stamps:[]}};
const flav=c=>String(c.flavour||'').replace(/\s*\(.*\)/,'');

/* ------------------------------------------------------------------ the pack, as portraits (tap one for its sheet) */
function v6PackHtml(){return'<div class="rpparty">'+rp.s.party.map((m,i)=>{const st=v6Stats(m),hp=Math.max(0,m.hp),low=hp<st.hp*.25;
  return'<button class="rpm'+(hp<=0?' down':'')+(low?' low':'')+'" type="button" data-rp="v6sheet" data-v="'+i+'"><b>'+esc2(m.name)+' <small>'+esc2(m.noclass?'':CLASSES6[m.cls].n)+' '+m.lvl+(m.pend>0?' <i class="badge">!</i>':'')+'</small></b>'+
    rpBar(hp,st.hp,hp>st.hp*.5?'#7ad67a':hp>st.hp*.25?'#ffc857':'#ff6b6b')+'<small>'+hp+'/'+st.hp+' HP · '+(m.mp||0)+'/'+st.mp+' MP</small></button>'}).join('')+'</div>'}

/* ------------------------------------------------------------------ the ☰ menu (ui-design.md §4: the rare things live here) */
const USE6={potion:['Potion','35% of max HP'],ether:['Ether','30% of max mana']};
function v6UseOn(m,k){const s=rp.s,st=v6Stats(m);if(!m||!(s.bag[k]>0)||m.hp<=0)return false;
  if(k==='potion'&&m.hp<st.hp){m.hp=Math.min(st.hp,m.hp+Math.round(st.hp*.35))}else if(k==='ether'&&(m.mp||0)<st.mp){m.mp=Math.min(st.mp,(m.mp||0)+Math.round(st.mp*.3))}else return false;
  s.bag[k]--;rpSave();return true}
function v6MenuHtml(){const s=rp.s,G=goals()[0];
  if(V6S.item)return'<div class="rpdlg"><div class="who">'+USE6[V6S.item][0]+' on whom? ('+s.bag[V6S.item]+' left)</div></div>'+v6PackUse()+'<div class="rpcmd"><button class="rpb x" type="button" data-rp="v6use" data-v="">Back</button></div>';
  let h=v6PackHtml()+'<div class="rpdlg">'+(G?'<p><b>'+esc2(G.goal)+'</b><br><small>'+esc2(G.hint)+'</small></p>':'')+'<p><small>'+Math.floor(s.gold)+' gold · '+(s.buns||0)+' ember-buns</small></p></div><div class="rpcmd">';
  h+=Object.keys(USE6).filter(k=>s.bag[k]>0).map(k=>'<button class="rpb it" type="button" data-rp="v6use" data-v="'+k+'">'+USE6[k][0]+' ×'+s.bag[k]+'<small>'+USE6[k][1]+'</small></button>').join('');
  const travel=w6Pieces()>=2&&(s.w6st.fountains||[]).length>1;
  h+='<button class="rpb'+(travel?' go':'')+'" type="button" data-rp="w6fast"'+(travel?'':' disabled')+'>Map<small>'+(travel?'travel to a fountain':'travel opens with the second Smiler piece')+'</small></button>';
  h+='<button class="rpb" type="button" data-rp="v6book" data-v="">The Book<small>foes, the Smiler, places, stamps</small></button><button class="rpb" type="button" data-rp="v6set">Settings<small>sound, motion, colours, text size</small></button>';
  h+=menuItems.map(m=>m.html()).join('');
  return h+'<button class="rpb go" type="button" data-rp="close">Back to the map</button></div>'}
function v6PackUse(){return'<div class="rpcmd">'+rp.s.party.map((m,i)=>{const st=v6Stats(m);return'<button class="rpb go" type="button" data-rp="v6useon" data-v="'+i+'"'+(m.hp<=0?' disabled':'')+'>'+esc2(m.name)+'<small>'+Math.max(0,m.hp)+'/'+st.hp+' HP · '+(m.mp||0)+'/'+st.mp+' MP</small></button>'}).join('')+'</div>'}

/* ------------------------------------------------------------------ the class pick: eight cards; a tap shows more, a second confirms */
function v6ClassHtml(){const c=V6S.cls;
  let h='<div class="rpdlg"><div class="who">Pick up something and show what you are</div><p>'+(c?'Tap '+esc2(CLASSES6[c].n)+' again to be one.':'Tap a card to see more.')+'</p></div><div class="rpcmd">';
  h+=WAVE16.map(id=>{const C=CLASSES6[id],K=KITS6[id],two=[K.start[0],(K.talents[0]||{}).id].filter(Boolean).map(x=>SKILLS6[x].n).join(', ');
    return'<button class="rpb'+(c===id?' go on':'')+'" type="button" data-rp="w6cls" data-v="'+id+'">'+esc2(C.n)+'<small>'+esc2(C.role)+' · '+esc2(two)+'</small></button>'}).join('')+'</div>';
  if(c){const C=CLASSES6[c],K=KITS6[c];h+='<div class="rpdlg"><div class="who">'+esc2(C.n)+', '+esc2(flav(C))+'</div><p>'+esc2(C.role)+'. Fights with '+esc2(C.fam)+'.</p><p><small>'+
    [K.start[0]].concat(K.talents.map(t=>t.id)).slice(0,5).map(x=>'<b>'+esc2(SKILLS6[x].n)+'</b>: '+esc2(SKILLS6[x].d)).join('<br>')+'</small></p><p><small>At 8: '+Object.keys(K.subs).map(esc2).join(' or ')+'.</small></p></div>'}
  return h}

/* ------------------------------------------------------------------ the Book (systems.md §15): Mallow's book, four tabs */
const PIECES=['first','second','third','fourth','fifth'];
function v6BookHtml(){const B=bk(),t=V6S.book,tab=(k,n)=>'<button class="pill'+(t===k?' go':'')+'" type="button" data-rp="v6book" data-v="'+k+'">'+n+'</button>';
  let h='<div class="rpcmd">'+tab('foes','Foes')+tab('lore','The Smiler')+tab('places','Places')+tab('stamps','Stamps')+'</div><div class="rpdlg">';
  if(t==='foes'){const ids=Object.keys(B.foes).sort((a,b)=>(FOES6[a]&&FOES6[a].home||0)-(FOES6[b]&&FOES6[b].home||0));
    if(V6S.page&&FOES6[V6S.page]){const F=FOES6[V6S.page],r=B.foes[V6S.page]||{},k=r.won>0;
      h+='<div class="who">'+esc2(F.n)+'</div><p>Seen at levels '+(r.lo||'?')+(r.hi>r.lo?'–'+r.hi:'')+' · beaten '+(r.won||0)+' times</p><p><small>'+(k?esc2(F.how)+'<br>Found: '+esc2(F.where)+(F.drop&&F.drop!=='—'?'<br>Drops: '+esc2(F.drop):''):'? (beat one to learn how it fights)')+'</small></p></div><div class="rpcmd"><button class="rpb x" type="button" data-rp="v6bookpage" data-v="">Back</button>'}
    else{h+='<div class="who">Foes</div><p>'+(ids.length?ids.length+' met.':'No foes met yet.')+'</p></div><div class="rpcmd">'+ids.map(id=>{const r=B.foes[id];return'<button class="rpb'+(r.won?'':' x')+'" type="button" data-rp="v6bookpage" data-v="'+id+'">'+esc2(FOES6[id]?FOES6[id].n:id)+'<small>'+(r.won?'beaten '+r.won:'met, never beaten')+'</small></button>'}).join('')}}
  else if(t==='lore'){const P=(rp.s.w6st.pieces||[]);h+='<div class="who">The Smiler</div><p>A tube, filling piece by piece. Six pieces; the last is how to put it together.</p><p>'+
    PIECES.map((n,i)=>(P[i]?'▣ <b>the '+esc2(P[i])+'</b>':'▢ a '+n+' piece')).join('<br>')+'<br>'+(P.length>=6?'▣ <b>the instructions</b>':'▢ the instructions (???)')+'</p></div><div class="rpcmd">'}
  else if(t==='places'){const ids=Object.keys(B.places),F=rp.s.w6st.fountains||[];h+='<div class="who">Places</div><p>'+ids.map(p=>'<b>'+esc2(MAPS6[p]?MAPS6[p].title:p)+'</b>'+(F.some(f=>String(f).startsWith(p))?' · fountain ✓':'')).join('<br>')+'</p></div><div class="rpcmd">'}
  else{const st=rp.s.w6st;h+='<div class="who">Stamps</div><p>'+((B.stamps||[]).map(x=>'🎉 '+esc2(x.n)+' <small>'+esc2(x.d)+'</small>').join('<br>')||'No stamps yet. Festivals leave one.')+'</p><p>Helper\'s marks: <b>'+(st.helps||0)+'</b> <small>(for helping friends with fights from their stories)</small></p></div><div class="rpcmd">'}
  return h+'<button class="rpb go" type="button" data-rp="menu">Back</button></div>'}
/* what the Book remembers: every foe met (its levels) and beaten, every place seen, festival stamps */
function v6BookFight(b){if(!b||!b.v6||!rp.s||!rp.s.w6st)return;const B=bk();
  b.units.forEach(u=>{if(u.side!==1||!u.E)return;const id=u.E.id||String(u.key||'').split(':')[1];if(!id||!FOES6[id])return;const L=u.E.L||1,r=B.foes[id]=B.foes[id]||{lo:L,hi:L,won:0};
    r.lo=Math.min(r.lo,L);r.hi=Math.max(r.hi,L);if(b.over==='win')r.won++})}
function v6BookPlace(){if(!rp.s||!rp.s.w6||!rp.s.w6st)return;const B=bk();if(!B.places[rp.s.w6])B.places[rp.s.w6]=Date.now();
  const F=net.festival;if(F&&F.until>Date.now()&&!B.stamps.some(x=>x.id===F.stamp)){B.stamps.push({id:F.stamp,n:F.name,d:new Date().toISOString().slice(0,10)});rpToast('🎉 A '+F.name+' stamp for the Book!')}}

/* ------------------------------------------------------------------ settings (systems.md §13, ui-design.md §10) */
const SET6=[['snd'],['music'],['buzz'],
  ['calm',()=>'Reduced motion '+(rpOpt.calm?'on':'off'),'no screen shake, no confetti, no pulsing'],
  ['cb',()=>'Colour-blind palette '+(rpOpt.cb?'on':'off'),'blue and orange instead of green and red'],
  ['big',()=>'Big text '+(rpOpt.big?'on':'off'),'everything 25% larger'],
  ['hand'],['bspd'],['full']];
function v6SetHtml(){return'<div class="rpdlg"><div class="who">Settings</div></div><div class="rpcmd">'+SET6.map(([id,label,hint])=>{const o=options.find(x=>x.id===id);
  return o?'<button class="rpb" type="button" data-opt="'+id+'">'+o.label()+'<small>'+o.hint+'</small></button>':'<button class="rpb" type="button" data-rp="v6opt" data-v="'+id+'">'+label()+'<small>'+hint+'</small></button>'}).join('')+
  '<button class="rpb go" type="button" data-rp="menu">Back</button></div>'}
function v6ApplyOpts(){if(typeof document==='undefined')return;const c=document.documentElement.classList;c.toggle('calm',!!rpOpt.calm);c.toggle('cb',!!rpOpt.cb);c.toggle('bigtext',!!rpOpt.big)}

feature({id:'v6screens',
  init(){v6ApplyOpts();
    /* the goal bar opens the quest log (ui-design.md §2: one tap) */
    const top=typeof document!=='undefined'&&document.getElementById('rp-top');if(top)top.addEventListener('click',()=>{if(rp.s&&rp.s.w6&&rp.mode==='map'){rp.mode='w6log';rpUI(true)}})},
  on:{'battle:end':b=>v6BookFight(b),'world:apply':()=>v6BookPlace()},
  panels:{v6book:{sig:()=>JSON.stringify([V6S.book,V6S.page,rp.s&&rp.s.w6st&&rp.s.w6st.book]),html:v6BookHtml},v6set:{sig:()=>JSON.stringify(rpOpt),html:v6SetHtml}},
  actions:{
    v6use:d=>{V6S.item=d.v||null},v6useon:d=>{const m=rp.s.party[+d.v];if(!v6UseOn(m,V6S.item))rpToast(m&&m.hp<=0?'Down; a potion can\'t help.':'Already full.');else rpToast(m.name+' feels better.');if(!(rp.s.bag[V6S.item]>0))V6S.item=null},
    v6book:d=>{if(d.v)V6S.book=d.v;V6S.page=null;rp.mode='v6book'},v6bookpage:d=>{V6S.page=d.v||null},
    v6set:()=>{rp.mode='v6set'},v6opt:d=>{rpOpt[d.v]=!rpOpt[d.v];rpOptSave();v6ApplyOpts();if(d.v==='calm'&&!rpOpt.calm)rpBuzz(20)}}});
export {PIECES,SET6,USE6,V6S,bk,flav,v6ApplyOpts,v6BookFight,v6BookHtml,v6BookPlace,v6ClassHtml,v6MenuHtml,v6PackHtml,v6PackUse,v6SetHtml,v6UseOn};
