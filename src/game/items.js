/* ---------- Kobold Quest v6: items in the slice (build step 13; items.md, systems.md §8) ----------
   Gear pieces as data (slot, tier, variant, family, bonuses, set, unique), their stats by items.md's power points, the backpack,
   equipping, chests (systems.md §8's table), the two shops and the Pebblebrook smith, drops by the rule, selling at 35%. */
import {rp} from '../core/state.js';
import {RP_ITEMS} from '../data/items.js';
import {BASE6,CLASSES6} from '../data/v6/classes.js';
import {AFFIXES6,CONSUMABLES6,GEAR6,PRICES6,RECIPES6,UNIQUES6,WEAPONS6} from '../data/v6/items.js';
import {CHESTS6} from '../data/v6/story.js';
import {V6_TIERS,V6_VARIANT,v6TierFor} from './sheet.js';

const GEAR_SLOTS6=['weapon','armour','shield','helm','boots','cloak','neck','ring1','ring2'];
const slotOf=k=>k.startsWith('ring')?'ring':k;
let uid=1;
const bases=L=>({atk:BASE6.atk[0]+BASE6.atk[1]*(L-1),def:BASE6.def[0]+BASE6.def[1]*(L-1),hp:BASE6.hp[0]+BASE6.hp[1]*(L-1)});
/* a gear piece: tier t is 0-based (T1 is 0), as the sheet's gear */
function v6Piece(slot,t,opt){opt=opt||{};const it={id:'i'+(Date.now()%1e7)+'_'+(uid++),k:'gear',slot,tier:t,v:opt.v||'plain',aff:opt.aff||[],set:opt.set||null,uniq:opt.uniq||null};
  if(slot==='weapon'){it.fam=opt.fam||'blades';it.n=opt.n||(WEAPONS6[it.fam]&&WEAPONS6[it.fam][t]||{}).n||'Weapon'}
  else{const row=(GEAR6[slot][it.v]||GEAR6[slot].plain)[t];it.n=opt.n||(row?row.n:slot)}return it}
/* the name the player sees: the bonuses wrap it (Sturdy Leather vest of the Bear) */
function v6ItemName(it){if(it.k!=='gear')return it.n;const A=it.aff||[];const pre=A.map(a=>AFFIXES6.find(x=>x.n===a)).filter(a=>a&&a.kind!=='suffix').map(a=>a.n),suf=A.map(a=>AFFIXES6.find(x=>x.n===a)).filter(a=>a&&a.kind==='suffix').map(a=>a.n);
  return[...pre,it.n,...suf].join(' ')}
/* what a bonus adds (items.md §1, §4: a prefix 3 pp, a suffix 4 pp, priced at the tier's entry level) */
function affixStats(a,t){const B=bases(V6_TIERS[t]),A=AFFIXES6.find(x=>x.n===a);if(!A)return{};const pp=A.kind==='suffix'?4:3,o={};
  switch(a){case'Sturdy':case'of Thorns':o.def=0.025*pp*B.def;break;case'Swift':o.spd=pp/3;break;case'Mighty':case'of the Boar':o.atk=0.01*pp*B.atk;break;case'Hale':o.hp=0.01*pp*B.hp;break;
    case'Wise':o.mana=pp;break;case'Keen':o.crit=0.02*pp;break;case'Sly':o.dodge=pp;break;case'of the Bear':o.hp=0.02*B.hp;o.def=0.05*B.def;break;case'of the Fox':o.spd=2/3;o.dodge=2;break;
    case'of the Owl':o.mana=2;o.sight=1;break;case'of Mending':o.regen=0.01;break;case'Arcane':o.spa=0.01*pp*B.atk;break;case'Warded':o.sd=0.025*pp*B.def;break;case'Quick':o.init=3;break;
    case'Piercing':o.ap=0.07;break;case'Steady':o.steady=-0.6;break;case'of Fortune':o.luck=1;break;case'of the Rally':o.morale=1;break;case'of Warding':o.res=12;break;case'of Embers':o.burnP=0.06;break;case'of Venom':o.poisonP=0.06;break}
  return o}
/* the extras a kobold's gear gives on top of the pieces' own stats: bonuses, sets (two pieces 40%, three all), uniques */
function v6GearExtras(m){const o={},add=s=>{for(const [k,v] of Object.entries(s))o[k]=(o[k]||0)+v},sets={};
  for(const g of Object.values(m.gear||{})){if(!g)continue;(g.aff||[]).forEach(a=>add(affixStats(a,g.tier||0)));if(g.set)sets[g.set]=(sets[g.set]||0)+1;
    const U=g.uniq&&UNIQUES6.find(u=>u.n===g.uniq);if(U)add(uniqueStats(U))}
  for(const [n,c] of Object.entries(sets)){if(c<2)continue;const f=c>=3?1:0.4;if(/^Mossback/.test(n))add({regen:0.025*f});if(/^Millers/.test(n))add({regen:0.02*f,hpP:0.02*f})}
  return o}
function uniqueStats(U){switch(U.n){case'Toll pot':return{goldP:0.1};case'Copper-cart wheel':return{rangedTaken:-0.1};default:return{}}}
/* prices (items.md: the tier's slot price; consumables from §7) and selling at 35% (systems.md §8) */
function v6Price(it){if(it.k==='use'){const C=CONSUMABLES6.find(c=>c.n===it.n);return C?C.price:0}const P=PRICES6[(it.tier||0)+1]||PRICES6[1];return Math.round((P[it.slot]||15)*(1+0.25*(it.aff||[]).length))}
const v6SellPrice=it=>Math.floor(v6Price(it)*0.35);

/* ------------------------------------------------------------------ the backpack and equipping */
const inv=()=>(rp.s.inv6=rp.s.inv6||[]);
function v6Take(it){inv().push(it);return it}
function v6CanWear(m,it){if(it.k!=='gear')return false;if(it.slot==='weapon')return it.fam===CLASSES6[m.cls].fam;if(it.v!=='plain'&&V6_VARIANT[m.cls]!==it.v)return false;return true}
function v6Equip6(m,id,key){const i=inv().findIndex(x=>x.id===id);if(i<0)return false;const it=inv()[i];if(!v6CanWear(m,it))return false;
  key=key||(it.slot==='ring'?(!m.gear.ring1?'ring1':!m.gear.ring2?'ring2':'ring1'):it.slot);if(slotOf(key)!==it.slot)return false;
  inv().splice(i,1);const old=m.gear[key];if(old){if(!old.id)old.id='i'+(uid++);if(!old.n)old.n=v6PieceName(old,key);old.k='gear';old.slot=slotOf(key);inv().push(old)}m.gear[key]=it;return true}
function v6Unequip(m,key){const g=m.gear[key];if(!g||key==='weapon')return false;if(!g.id)g.id='i'+(uid++);g.k='gear';g.slot=slotOf(key);if(!g.n)g.n=v6PieceName(g,key);inv().push(g);delete m.gear[key];return true}
function v6PieceName(g,key){const s=slotOf(key);if(s==='weapon')return(WEAPONS6[g.fam]||[])[g.tier]?.n||'Weapon';const row=(GEAR6[s][g.v||'plain']||GEAR6[s].plain)[g.tier];return row?row.n:s}

/* ------------------------------------------------------------------ consumables and materials (the bag is counts) */
const USE_KEY={'Potion':'potion','Ether':'ether','Phoenix feather':'feather','Hearty potion':'hpotion','Hearty ether':'hether','Great potion':'gpotion','Great ether':'gether','Golden feather':'gfeather'};
function v6GiveUse(n,c){const k=USE_KEY[n]||n.toLowerCase();rp.s.bag[k]=(rp.s.bag[k]||0)+(c||1)}
/* things that change hands (gifts, the market): 'bag' a potion or an ether, 'mat' a material by name, 'item' a piece from the backpack */
function tradeValid(kind,val){if(kind==='bag')return!!RP_ITEMS[val];if(kind==='mat')return typeof val==='string'&&/^[A-Za-z' -]{2,30}$/.test(val);
  return kind==='item'&&!!val&&typeof val==='object'&&val.k==='gear'&&!!GEAR_SLOTS6.concat(['weapon']).find(x=>x===val.slot||(val.slot==='ring'&&x.startsWith('ring')))}
function tradeLabel(kind,val){return kind==='bag'?RP_ITEMS[val].n:kind==='mat'?val:v6ItemName(val)}
function tradeHas(kind,val){const s=rp.s;return kind==='bag'?(s.bag[val]||0)>0:kind==='mat'?((s.mats6||{})[val]||0)>0:inv().some(i=>i.id===val.id)}
function tradeTake(kind,val){if(!tradeHas(kind,val))return false;const s=rp.s;if(kind==='bag')s.bag[val]--;else if(kind==='mat')s.mats6[val]--;else{const L=inv();L.splice(L.findIndex(i=>i.id===val.id),1)}return true}
function tradePut(kind,val){const s=rp.s;if(kind==='bag')s.bag[val]=(s.bag[val]||0)+1;else if(kind==='mat')v6GiveMat(val);else v6Take(Object.assign({},val,{id:'i'+(Date.now()%1e7)+'_'+(uid++)}))}
function tradePrice(kind,val){return Math.max(1,Math.round(kind==='bag'?RP_ITEMS[val].price*.6:kind==='mat'?12:v6Price(val)*.6))}
/* what this hero can give or sell, as [kind, val, label] */
function tradeList(){const s=rp.s,out=[];for(const k of Object.keys(RP_ITEMS))if((s.bag[k]||0)>0)out.push(['bag',k,RP_ITEMS[k].n+' ×'+s.bag[k]]);
  for(const [m,c] of Object.entries(s.mats6||{}))if(c>0)out.push(['mat',m,m+' ×'+c]);for(const it of inv())if(!it.uniq)out.push(['item',it,v6ItemName(it)]);return out}
function v6GiveMat(n,c){const s=rp.s;s.mats6=s.mats6||{};s.mats6[n]=(s.mats6[n]||0)+(c||1)}

/* ------------------------------------------------------------------ chests (systems.md §8) */
function v6ChestItems(name){const C=CHESTS6.find(c=>c.name===name);return C?C.items:null}
function v6OpenChest(name){const L=v6ChestItems(name),s=rp.s;if(!L)return[];const got=[];
  for(const x of L){if(x.gold){s.gold+=x.gold;got.push(x.gold+' gold')}else if(x.use){v6GiveUse(x.use,x.n);got.push((x.n>1?x.n+' ':'a ')+x.use.toLowerCase()+(x.n>1?'s':''))}
    else if(x.gear){const it=v6Piece(x.slot,x.tier,{n:x.gear,set:x.set,aff:rollAffixes(x.bonuses||0,x.slot)});v6Take(it);got.push(v6ItemName(it))}}
  return got}
function rollAffixes(n,slot){if(!n)return[];const pre=AFFIXES6.filter(a=>a.kind==='prefix'&&a.n!=='Steady'),suf=AFFIXES6.filter(a=>a.kind==='suffix'&&a.n!=='of the Rally');const pick=L=>L[Math.floor(Math.random()*L.length)].n;
  return n>=2?[pick(pre),pick(suf)]:[Math.random()<0.5?pick(pre):pick(suf)]}

/* ------------------------------------------------------------------ drops (systems.md §8): 40% a material, 8% gear (15% of those a tier up), 6% a consumable; bosses their unique */
const ZONE_MAT={r1:'Moss tuft',pebblebrook:'Moss tuft',mine1:'Gold scrap',mine2:'Gold scrap',mine3:'Gold scrap'};
function v6Drops(b){const s=rp.s,out=[],r=Math.random;if(!s||!s.w6)return out;const boss=b.units.find(u=>u.E&&u.E.v6boss);
  if(boss){const U=UNIQUES6.find(u=>u.boss.toLowerCase()===boss.E.n.toLowerCase());if(U&&!(s.uniq6||[]).includes(U.n)){(s.uniq6=s.uniq6||[]).push(U.n);const it=v6Piece(U.slot,U.tier-1,{n:U.n,uniq:U.n});v6Take(it);out.push(it.n)}
    v6GiveMat('Boss fang');out.push('a boss fang');return out}
  const mat=ZONE_MAT[s.w6];if(mat&&r()<0.4){v6GiveMat(mat);out.push('a '+mat.toLowerCase())}
  if(r()<0.08){const L=Math.max(...s.party.map(m=>m.lvl)),t=Math.min(5,v6TierFor(L)+(r()<0.15?1:0)),slots=['armour','shield','helm','boots','cloak','neck','ring','weapon'],slot=slots[Math.floor(r()*slots.length)];
    const who=s.party[Math.floor(r()*s.party.length)],fam=CLASSES6[who.cls].fam,x=r(),aff=rollAffixes(x<0.08?2:x<0.33?1:0,slot);
    const it=v6Piece(slot,t,{fam,v:slot!=='weapon'&&slot!=='shield'&&slot!=='boots'&&slot!=='neck'&&slot!=='ring'&&r()<0.5?(V6_VARIANT[who.cls]||'plain'):'plain',aff});
    if(GEAR6[slot]&&!GEAR6[slot][it.v])it.v='plain';v6Take(it);out.push(v6ItemName(it))}
  if(r()<0.06){const n=r()<0.6?'Potion':'Ether';v6GiveUse(n);out.push('a '+n.toLowerCase())}
  if(boss===undefined&&s.party.some(m=>Object.values(m.gear||{}).some(g=>g&&g.uniq==='Toll pot'))){}
  return out}

/* ------------------------------------------------------------------ shops and the smith (systems.md §8) */
const SHOP6={hearthspire:{tiers:()=>[0],uses:['Potion','Ether']},pebblebrook:{tiers:()=>[((rp.s.party.find(m=>m.hero)||rp.s.party[0]).lvl>=5)?1:0],uses:['Potion','Ether','Phoenix feather']}};
const WAVE_FAMS=['blades','guns','wands','holy','fists','orbs','instruments','daggers'];
function v6ShopStock(town){const S=SHOP6[town];if(!S)return[];const out=[];for(const t of S.tiers()){
    for(const fam of WAVE_FAMS)out.push(v6Piece('weapon',t,{fam}));
    for(const slot of ['armour','helm','cloak'])for(const v of ['plain','robe','scout'])if(GEAR6[slot][v])out.push(v6Piece(slot,t,{v}));
    for(const slot of ['shield','boots','neck','ring'])out.push(v6Piece(slot,t))}
  for(const n of S.uses)out.push({k:'use',n,id:'u_'+n});return out}
function v6Buy(town,i){const it=v6ShopStock(town)[i];if(!it)return false;const p=v6Price(it);if(rp.s.gold<p)return false;rp.s.gold-=p;if(it.k==='use')v6GiveUse(it.n);else v6Take(Object.assign(it,{id:'i'+(uid++)}));return true}
function v6Sell(id){const i=inv().findIndex(x=>x.id===id);if(i<0)return false;const it=inv()[i];rp.s.gold+=v6SellPrice(it);inv().splice(i,1);(rp.s.buyback6=rp.s.buyback6||[]).unshift(it);rp.s.buyback6.length=Math.min(rp.s.buyback6.length,5);return true}
/* the smith's recipes (items.md §8): Pebblebrook makes the tier-2 ones */
const MAT_OF={moss:'Moss tuft','gold scrap':'Gold scrap',fang:'Boss fang','sand glass':'Sand glass',reed:'Reed','frost shard':'Frost shard',pearl:'Pearl'};
function needOf(R){return R.need.split(' and ').map(p=>{const m=p.trim().match(/^(\d+) (.+)$/);return m?{n:+m[1],mat:MAT_OF[m[2]]||m[2]}:null}).filter(Boolean)}
function v6Recipes(town){return town==='pebblebrook'?RECIPES6.filter(R=>R.tier===2):[]}
const RECIPE_PIECE={'Moss cape+':['cloak',{set:'Mossback regalia',aff:['Hale']}],'Copper pot-helm':['helm',{}],'Miller\'s spear':['weapon',{fam:'blades'}],'miller\'s boots':['boots',{set:'Millers\' set'}]};
function v6Craft(town,i){const R=v6Recipes(town)[i];if(!R)return false;const mats=rp.s.mats6||{},N=needOf(R);if(!N.every(x=>(mats[x.mat]||0)>=x.n))return false;N.forEach(x=>mats[x.mat]-=x.n);
  const [slot,opt]=RECIPE_PIECE[R.n]||['ring',{}];const it=v6Piece(slot,R.tier-1,Object.assign({n:R.n.replace(/^m/,'M')},opt,slot==='weapon'?{fam:CLASSES6[rp.s.party[0].cls].fam}:{}));v6Take(it);return it}
export {GEAR_SLOTS6,MAT_OF,RECIPE_PIECE,SHOP6,USE_KEY,WAVE_FAMS,ZONE_MAT,affixStats,bases,inv,needOf,rollAffixes,slotOf,tradeHas,tradeLabel,tradeList,tradePrice,tradePut,tradeTake,tradeValid,uid,uniqueStats,v6Buy,v6CanWear,v6ChestItems,v6Craft,v6Drops,v6Equip6,v6GearExtras,v6GiveMat,v6GiveUse,v6ItemName,v6OpenChest,v6Piece,v6PieceName,v6Price,v6Recipes,v6Sell,v6SellPrice,v6ShopStock,v6Take,v6Unequip};
