/* ---------- Kobold Quest v6: the character sheet screen (build step 7, ui-design.md "Talent pick") ----------
   Every stat, the three talent cards when a pick is waiting, the subclass at 8, the kit with its dark toggles, Pip's leader points.
   For now it opens from the fight lab; the roster and the inn reach it when the v6 world is built (step 11). */
import {v6Lab} from '../battle/combat.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {CLASSES6} from '../data/v6/classes.js';
import {KITS6,PASSIVES6,SKILLS6} from '../data/v6/skills.js';
import {button} from '../engine/html.js';
import {esc2} from '../engine/util.js';
import {v6CanWear,v6Equip6,v6ItemName,v6PieceName,v6Unequip} from '../game/items.js';
import {v6Stats} from '../game/sheet.js';
import {V6_EQUIP,v6AtRest,v6Cards,v6ChooseSub,v6DarkOpen,v6Equip,v6IsSub,v6Known,v6LeadAdd,v6LeadFree,v6LeadTotal,v6LevelUp,v6Pick,v6SubOptions,v6ToggleDark} from '../game/talents.js';
import {rpBar} from './hud.js';

const sheet={i:0,msg:''};
const pack=()=>rp.s&&rp.s.w6?rp.s.party:(v6Lab.ks||[]);   // the walking pack in the v6 world, the lab's otherwise
const cur=()=>pack()[sheet.i]||null;
const f1=x=>Math.round(x*10)/10;
function v6SheetHtml(){const m=cur();if(!m)return'<div class="rpdlg"><p>No kobold.</p></div><div class="tbar">'+button('v6sheetx','Back',{cls:'x'})+'</div>';
  const st=v6Stats(m),C=CLASSES6[m.cls],K=KITS6[m.cls],k=v6Known(m),tabs=pack().map((x,i)=>x?button('v6sheet',esc2(x.name),{cls:i===sheet.i?'on':'',v:i,sub:esc2(CLASSES6[x.cls].n)+' '+x.lvl+(x.pend>0?' · ✦'+x.pend:''),raw:1}):'').join('');
  const row=(a,b)=>'<div><span>'+a+'</span> <b>'+b+'</b></div>';
  let h='<div class="rpcmd">'+tabs+'</div><div class="rpdlg"><div class="who">'+esc2(m.name)+' · '+esc2(C.n)+(m.sub?' ('+esc2(m.sub)+')':'')+' · level '+m.lvl+'</div>';
  h+='<div class="hh-stats">'+row('HP',m.hp+'/'+st.hp)+row('Mana',(m.mp||0)+'/'+st.mp)+row('Attack',f1(st.atk))+row('Sp. attack',f1(st.spa))+row('Defence',f1(st.def))+row('Sp. defence',f1(st.sd))+
    row('Accuracy',f1(st.acc))+row('Dodge',f1(st.dodge))+row('Resistance',f1(st.res))+row('Initiative',st.init)+row('Move',st.move)+row('Crit',Math.round(st.crit*100)+'% ×'+st.critD)+
    row('Threat',f1(st.threat))+row('Steadiness',st.steady)+row('Bond / streak',(m.bond||0)+' / '+(m.streak||0))+row('Corruption',m.corr||0)+row('Luck',m.luck||0)+(m.cls==='monk'?row('Balance',f1(st.balance)):'')+'</div>';
  /* corruption (ui-design.md §8): the number, a bar to the next threshold (10, 25, 50) and what it costs the pack's morale */
  {const c=m.corr||0,T=[10,25,50].find(t=>c<t),prev=[0,10,25,50].filter(t=>t<=c).pop(),n=Math.max(1,pack().filter(Boolean).length);
    h+='<div class="corr"><span>Corruption <b>'+c+'</b>'+(T?' · next at '+T:' · past every threshold')+'</span>'+rpBar(T?c-prev:1,T?T-prev:1,'#b77dff')+'<small>pack morale −'+(Math.round(c/10/n*10)/10)+(T===10?' · dark skills open at 10':'')+'</small></div>'}
  h+='<p><small>'+Object.entries(m.scores).map(([s,v])=>s+' '+v).join(' · ')+'</small></p>';
  if(m.passives&&m.passives.length){const n={};m.passives.forEach(p=>n[p]=(n[p]||0)+1);h+='<p><small>Passives: '+Object.entries(n).map(([p,c])=>esc2(p)+(c>1?' ×'+c:'')).join(', ')+'</small></p>'}
  /* a waiting pick: three cards, one tap, then a confirm (ui-design.md) */
  const cards=v6Cards(m);
  if(cards){h+='<div class="who">Pick a talent ('+m.pend+' waiting)</div><div class="rpcmd">';
    cards.forEach(c=>c.opts.forEach(o=>{const lab=c.k==='score'?['+1 '+o,'ability score, now '+m.scores[o]]:c.k==='skill'?[SKILLS6[o].n,SKILLS6[o].d+' · '+SKILLS6[o].mp+' mana']:c.k==='rank'?[SKILLS6[o].n+' rank '+(((m.ranks||{})[o]||1)+1),'+15% to its effect, same mana']:[o,((PASSIVES6[m.cls]||[]).find(p=>p.n===o)||{}).d||''];
      const sel=sheet.pick&&sheet.pick[0]===c.k&&sheet.pick[1]===o;h+='<button class="rpb '+(c.k==='score'?'it':c.k==='passive'?'':'sk')+(sel?' on':'')+'" type="button" data-rp="v6pick" data-k="'+c.k+'" data-v="'+esc2(o)+'">'+esc2(lab[0])+'<small>'+esc2(lab[1])+'</small></button>'}));
    h+='</div>'+(sheet.pick?'<div class="tbar">'+button('v6pickok','Take '+esc2(sheet.pick[1]),{cls:'go',raw:1})+'</div>':'')}
  const subs=v6SubOptions(m);
  if(subs.length)h+='<div class="who">Choose a subclass</div><div class="rpcmd">'+subs.map(n=>{const S=K.subs[n];return button('v6sub',esc2(n),{cls:'go',v:esc2(n),sub:S.skills.map(id=>SKILLS6[id].n).join(', ')+'; at 24: '+esc2(S.cap.n),raw:1})}).join('')+'</div>';
  /* the kit: four equipped, dark versions beside them */
  const rest=v6AtRest();h+='<div class="who">Skills ('+(m.skills||[]).length+' of '+V6_EQUIP+' equipped'+(rest?'':', change them at rest')+')</div><div class="rpcmd">';
  k.forEach(id=>{const S=SKILLS6[id];if(!S)return;const on=(m.skills||[]).includes(id),dk=m.dark&&m.dark[id],open=v6DarkOpen(m,id);
    h+=button('v6eq',esc2(dk?S.dark.n:S.n)+(((m.ranks||{})[id]||1)>1?' '+'★'.repeat(m.ranks[id]-1):''),{cls:on?'sk on':'',v:id,disabled:!(rest),sub:(on?'equipped':'not equipped')+' · '+S.mp+' mana · '+(S.ap==='end'?'ends turn':S.ap+' AP'),raw:1});
    if(S.dark)h+=button('v6dark',(dk?'Dark: on':'Dark: off'),{cls:dk?'on':'',v:id,disabled:!(open&&rest),sub:(open?esc2(S.dark.n)+': ×1.25, +1 corruption a cast':'opens at corruption '+(v6IsSub(id)?25:10)),raw:1})});
  h+='</div>';
  /* gear (items.md): what is worn, and the pieces in the backpack this kobold can wear */
  if(rp.s&&rp.s.w6){const S=['weapon','armour','shield','helm','boots','cloak','neck','ring1','ring2'],nm=(g,k)=>g?(g.n?v6ItemName(Object.assign({k:'gear',aff:[]},g)):v6PieceName(g,k)):'—';
    h+='<div class="who">Gear</div><div class="rpcmd">'+S.map(k=>{const g=m.gear[k];return button('v6uneq',esc2(nm(g,k)),{cls:g?'':'x',v:k,disabled:!(g&&k!=='weapon'),sub:k.replace(/\d/,'')+(g&&g.tier!=null?' · T'+(g.tier+1):'')+(g&&g.set?' · '+esc2(g.set):'')+(g&&k!=='weapon'?' · tap to take off':''),raw:1})}).join('')+'</div>';
    const W=(rp.s.inv6||[]).filter(it=>v6CanWear(m,it));if(W.length)h+='<div class="rpcmd">'+W.map(it=>button('v6eqit',esc2(v6ItemName(it)),{cls:'go',v:it.id,sub:'wear it · T'+(it.tier+1)+' '+it.slot,raw:1})).join('')+'</div>';
    const bag=Object.entries(rp.s.bag||{}).filter(([k,v])=>v>0).map(([k,v])=>k+' ×'+v).concat(Object.entries(rp.s.mats6||{}).filter(([k,v])=>v>0).map(([k,v])=>k+' ×'+v));if(bag.length)h+='<p><small>Bag: '+esc2(bag.join(' · '))+'</small></p>'}
  if(m.hero){const L=Object.assign({might:0,wits:0,lead:0},m.lead),free=v6LeadFree(m);h+='<div class="who">Leader points ('+free+' of '+v6LeadTotal(m)+' free)</div><div class="rpcmd">'+
    [['might','Might','pack attack and defence +1% each'],['wits','Wits','pack special attack and defence +1% each'],['lead','Leadership','pack morale +1 per 5']].map(([key,n,d])=>button('v6lead',n+' '+L[key],{cls:free?'go':'',v:key,disabled:!(free),sub:d,raw:1})).join('')+'</div>'}
  if(sheet.msg)h+='<p class="tmsg">'+esc2(sheet.msg)+'</p>';
  return h+'</div><div class="tbar">'+(rp.s&&rp.s.w6?'':button('v6lvl','Level up',{sub:'test'}))+button('v6sheetx','Back',{cls:'x'})+'</div>'}
feature({id:'v6sheet',menu:[{order:5,html:()=>rp.s&&rp.s.w6?button('v6sheet','The pack',{cls:'go',v:'0',sub:'sheets, talents'+(rp.s.party.some(m=>m.pend>0)?' · ✦ a pick waiting':''),raw:1}):''}],panels:{v6sheet:{sig:()=>JSON.stringify([sheet,rp.s&&(rp.s.inv6||[]).length,rp.s&&rp.s.party.map(m=>JSON.stringify(m.gear)).join(''),pack().map(m=>m&&[m.lvl,m.pend,m.scores,m.skills,m.known,m.ranks,m.passives,m.dark,m.lead,m.sub,m.hp,m.corr])]),html:v6SheetHtml}},
  actions:{
    v6sheet:d=>{if(d.v!=null)sheet.i=+d.v;sheet.pick=null;sheet.msg='';rp.mode='v6sheet'},
    v6sheetx:()=>{rp.mode=rp.s&&rp.s.w6?'map':'lab'},
    v6pick:d=>{sheet.pick=[d.k,d.v]},
    v6pickok:()=>{const m=cur();if(m&&sheet.pick){sheet.msg=v6Pick(m,sheet.pick[0],sheet.pick[1])?'Taken.':'That card is gone.';sheet.pick=null}},
    v6sub:d=>{const m=cur();if(m)sheet.msg=v6ChooseSub(m,d.v)?m.name+' is a '+d.v+' now.':''},
    v6eq:d=>{const m=cur();if(m&&!v6Equip(m,d.v))sheet.msg='Four skills at most; unequip one first.'},
    v6dark:d=>{const m=cur();if(m)v6ToggleDark(m,d.v)},
    v6lead:d=>{const m=cur();if(m)v6LeadAdd(m,d.v)},
    v6uneq:d=>{const m=cur();if(m)v6Unequip(m,d.v)},v6eqit:d=>{const m=cur();if(m&&!v6Equip6(m,d.v))sheet.msg='That does not fit.'},
    v6lvl:()=>{const m=cur();if(m&&m.lvl<30){v6LevelUp(m);sheet.msg=m.name+' reached level '+m.lvl+'.'}}}});
export {cur,f1,pack,sheet,v6SheetHtml};
