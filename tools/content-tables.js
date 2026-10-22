#!/usr/bin/env node
'use strict';
/* Kobold Quest: every opponent and every item, derived from the balance rules (balance.md, items.md).
   Arithmetic only: no fights are simulated. Prints the markdown tables used in docs/bestiary.md and docs/items.md.
   Usage: node tools/content-tables.js [foes|items|all]                                                        */
const m=require('./balance-model.js');
const {foe,ref,hitDmg}=m;
const r1=x=>Math.round(x), r10=x=>Math.round(x*10)/10;

/* ------------------------------------------------------------------ roles (multipliers on the level foe)
   hp, atk (or special attack for casters), def, special def, dodge, initiative, move tiles, resistance             */
const ROLE={
  normal:{hp:1.00,atk:1.00,def:1.00,sd:1.0,dodge:10,init:10,move:4,res:0, note:'the yardstick'},
  brute: {hp:1.60,atk:1.20,def:1.60,sd:1.0,dodge:3, init:8, move:3,res:0, note:'slow, hard to hurt, hits hard'},
  quick: {hp:0.70,atk:0.85,def:0.70,sd:0.8,dodge:22,init:12,move:6,res:0, note:'hard to hit, falls fast'},
  ranged:{hp:0.80,atk:0.90,def:0.80,sd:0.8,dodge:10,init:10,move:4,res:0, note:'shoots from afar (steadiness 6)'},
  caster:{hp:0.75,atk:1.10,def:0.60,sd:1.6,dodge:10,init:10,move:4,res:10,note:'uses special attack; resists magic'},
  elite: {hp:2.00,atk:1.25,def:1.30,sd:1.2,dodge:25,init:11,move:4,res:10,note:'a patrol leader: worth more'},
  swarm: {hp:0.40,atk:0.60,def:0.50,sd:0.5,dodge:15,init:11,move:5,res:0, note:'comes in numbers'},
};
/* weight = how much of a fight a foe counts as (sqrt of effective HP x damage, relative to a normal foe);
   XP and gold follow effective HP (XP per basic hit of HP defeated) */
function roleStats(role,L){const R=ROLE[role],f=foe(L),r=ref(L);
  const hp=f.hp*R.hp, def=f.def*R.def, atk=f.atk*R.atk, sd=f.def*R.sd;
  const hitN=(100-10)/100, hitR=(100-R.dodge)/100;
  const ehpRel=(hp/hitDmg(r.atk,1,def)/hitR)/(f.hp/hitDmg(r.atk,1,f.def)/hitN);
  const dprRel=hitDmg(atk,1,r.def)/hitDmg(f.atk,1,r.def);
  const w=Math.sqrt(ehpRel*dprRel);
  const xpFoe=L=>{const need=m.need(L), fights=L===1?2:L===2?3:L<=7?5:L<=12?6:L<=22?7:8;return need/(0.75*fights*m.P.foesPerFight(L))};
  return{hp,atk,def,sd,dodge:R.dodge,init:R.init,move:R.move,res:R.res,w,ehpRel,xp:xpFoe(L)*ehpRel,gold:1.15*(2+0.9*L)*w,hitOnFighter:hitDmg(atk,1,r.def)/r.hp}}

/* ------------------------------------------------------------------ the opponents */
const ELEM={pebble:['earth','storm'],sun:['nature','earth'],ember:['frost','fire'],frost:['fire','frost'],salt:['storm','fire'],none:['—','—']};
const FOES=[
 // name, role, levels, home level, places, element zone, statuses it uses, behaviour, drop
 ['Cellar rat','swarm','1–2',1,'Mallow\'s cellar (set-piece)','none','—','runs at the nearest kobold in twos and threes; flees at low HP','—'],
 ['Guard recruit','normal','2–3',2,'the castle yard drill (set-piece)','none','—','guards (dodge +25) when hurt; a tutorial in cover','—'],
 ['Nettlenose scout','quick','3–30',5,'every road as the story goes on','none','unseen in tall grass','ambushes from grass, hits the most hurt kobold, slips away','moss or the zone\'s material'],
 ['Nettlenose slinger','ranged','3–30',5,'every road','none','—','keeps 5–6 tiles away behind cover; retreats when a kobold comes close','the zone\'s material'],
 ['Snatchclaw\'s guard','normal','8–30',12,'roads, toll gates, barracks, castle','none','—','shield wall: guards an ally beside it; taunts (threat ×2)','gold scrap'],
 ['Guard sergeant','elite','16–30',20,'R4, the castle, patrols','none','weaken (shout)','leads a patrol; shouts weaken at the pack; calls a guard if alone','boss fang (10%)'],
 ['Copper beetle','brute','3–8',5,'R1, the mine','pebble','—','charges in a line; curls up (defence ×2) for a turn when hurt','moss, gold scrap'],
 ['Glow grub','caster','5–8',7,'the mine','pebble','slow (sticky spit)','spits from range at the kobold with the lowest defence; lights the dark tiles','gold scrap'],
 ['Sand skink','quick','8–13',10,'R2, the oasis','sun','poison (bite)','darts in, bites, darts out; hides under sand (unseen) on sand tiles','sand glass'],
 ['Cellar bee','swarm','10–13',11,'the honey cellars','sun','poison (sting)','flies over terrain in a cloud of three; goes for the healer','sand glass, reed'],
 ['Wax golem','brute','11–13',12,'the honey cellars','sun','slow (wax)','plods, leaves wax tiles (slow) behind it; melts (defence ×0.5) when burned','sand glass'],
 ['Rock goat','brute','13–16',14,'R3, the pass','ember','fall (charge)','charges two tiles and knocks the target down (fall); butts kobolds off ledges','gold scrap'],
 ['Stoker','caster','13–18',15,'R3, the crater','ember','burn','throws embers that burn; stokes hot tiles around itself','gold scrap'],
 ['Magma slug','brute','15–18',17,'the crater','ember','burn (hot trail)','leaves a trail of hot tiles (burn on entry); very slow','gold scrap, boss fang (5%)'],
 ['Snow beast','brute','19–22',20,'R5, the snowfield','frost','fall (ice)','stamps ice tiles around it (fall on entry); hugs (root) when adjacent','frost shard'],
 ['Frost guard','normal','19–23',21,'R5, the draft outpost','frost','slow (frost spear)','a guard with a frost spear: reach 2, slows on hit','frost shard'],
 ['Ice mite','swarm','20–23',22,'the ice cellars','frost','fall (slick)','skitters in fours; makes the floor slick where it dies','frost shard'],
 ['Shore crab','brute','23–27',24,'R6, R7, the shipwreck','salt','—','armoured (defence ×1.6); pinches and holds (root) the kobold in front','pearl, reed'],
 ['Smuggler','quick','23–26',24,'R6, the shipwreck','salt','unseen (hides)','hides in crates (unseen), strikes, pockets gold (−1% of the pack\'s gold, given back on defeat)','reed, pearl'],
 ['Sea guard','ranged','25–27',26,'R7, the islands','salt','—','throws harpoons (steadiness 4); pulls a kobold one tile closer on hit','pearl'],
 ['Cave eel','caster','26–27',27,'the island cave','salt','—','storm bolts that chain to one more kobold; lives in water tiles (cover)','pearl'],
 ['Royal guard','elite','27–30',29,'the castle','none','stun (shield bash)','guards Snatchclaw\'s hall in pairs; shield-bash stun; never flees','boss fang (15%)'],
 ['Castle crossbow','ranged','27–30',29,'the castle walls','none','—','fires from the walls (full cover) at 8–10 tiles; steadiness 3','gold scrap'],
];
function foeTable(){
  const out=['| foe | role | levels | where | weak / resists | stats at level (L) | weight | XP | gold | uses | how it fights | drops |','|---|---|---|---|---|---|---|---|---|---|---|---|'];
  for(const [n,role,lv,L,where,z,st,beh,drop] of FOES){const s=roleStats(role,L),[wk,rs]=ELEM[z];
    const stats=role==='caster'?`L${L}: HP ${r1(s.hp)}, sp.atk ${r1(s.atk)} (atk ${r1(s.atk*0.5)}), def ${r1(s.def)}, sp.def ${r1(s.sd)}, dodge ${s.dodge}, init ${s.init}, move ${s.move}, res ${s.res}`
      :`L${L}: HP ${r1(s.hp)}, atk ${r1(s.atk)}, def ${r1(s.def)}, sp.def ${r1(s.sd)}, dodge ${s.dodge}, init ${s.init}, move ${s.move}, res ${s.res}`;
    out.push(`| **${n}** | ${role} | ${lv} | ${where} | ${wk} / ${rs} | ${stats} | ${s.w.toFixed(2)} | ${r1(s.xp)} | ${r1(s.gold)} | ${st} | ${beh} | ${drop} |`)}
  return out.join('\n')}
function roleTable(){
  const out=['| role | HP | attack | defence | sp.def | dodge | init | move | res | weight (D) | XP × (D) | foe hit on the fighter at L18 | note |','|---|---|---|---|---|---|---|---|---|---|---|---|---|'];
  for(const [k,R] of Object.entries(ROLE)){const s=roleStats(k,18);
    out.push(`| ${k} | ×${R.hp.toFixed(2)} | ×${R.atk.toFixed(2)} | ×${R.def.toFixed(2)} | ×${R.sd.toFixed(1)} | ${R.dodge} | ${R.init} | ${R.move} | ${R.res} | ${s.w.toFixed(2)} | ×${s.ehpRel.toFixed(2)} | ${(s.hitOnFighter*100).toFixed(0)}% of HP | ${R.note} |`)}
  return out.join('\n')}

/* ------------------------------------------------------------------ items */
const TIER=[[1,'T1'],[5,'T2'],[10,'T3'],[16,'T4'],[22,'T5'],[28,'T6']];
const bA=L=>5+2.2*(L-1), bD=L=>3+1.8*(L-1), bH=L=>44+11*(L-1), bM=L=>12+1.2*(L-1);
const MAT=['Copper','Honey','Gold-scrap','Ember','Ice','Pearl'];   // the ring ladder's materials name every tier
// pp -> stat amount at a tier level
const PP={atk:(p,L)=>bA(L)*p/100, hp:(p,L)=>bH(L)*p/100, def:(p,L)=>bD(L)*p*2.5/100, spa:(p,L)=>bA(L)*p/100, spd:(p,L)=>bD(L)*p*2.5/100,
  mana:(p,L)=>bM(L)*p/100, speed:p=>p/3, crit:p=>2*p, dodge:p=>p, acc:p=>p, init:p=>p, pierce:p=>2.4*p, res:p=>3*p, luck:p=>p/5, morale:p=>p/7, score:p=>p/2.5, might:p=>p/5.6, wits:p=>p/5.6, lead:p=>p/6.5};
const fmt=(k,v)=>({atk:`+${r10(v)} atk`,hp:`+${r10(v)} HP`,def:`+${r10(v)} def`,spa:`+${r10(v)} sp.atk`,spd:`+${r10(v)} sp.def`,mana:`+${r10(v)} mana`,speed:`+${r10(v)} spd`,crit:`+${r10(v)}% crit`,dodge:`+${r10(v)} dodge`,acc:`+${r10(v)} acc`,init:`+${r1(v)} init`,pierce:`+${r10(v)}% piercing`,res:`+${r1(v)} res`,luck:`+${r1(v)} luck`,morale:`+${r1(v)} morale`,score:`+${r1(v)} to a score`,might:`+${r1(v)} Might`,wits:`+${r1(v)} Wits`,lead:`+${r1(v)} Leadership`})[k];
/* special-stat gear: the slot's whole budget spent on one new stat (integer stats are rounded and the rest goes to HP) */
const SPECIAL=[
 ['Clover ring','ring',10,'luck','luck tilts every roll (balance.md, the new stats)'],
 ['Quickstep anklet','boots',6,'init','acts earlier; speed is the boots\' usual job, so this trades it'],
 ['Pick-charm','neck',11,'pierce','armour piercing: best against brutes and bosses'],
 ['Ward bell','neck',11,'res','resistance: spells and statuses land less often'],
 ['Warding robe','armour',14,'spd','special defence instead of defence: for facing casters'],
 ['Spellband','ring',10,'spa','special attack for casters and the monk'],
 ['Rally drum','neck',11,'morale','one kobold\'s morale (the first point is worth 7 pp)'],
 ['Hunter\'s eyeglass','helm',7,'acc','accuracy, which also adds reach at range'],
 ['Herd bell','neck',11,'threat','threat ×1.5: draw the foes onto the wearer (0 pp: the rest of the budget stays HP)'],
 ['Shadow scarf','cloak',7,'threat-','threat ×0.5: the foes look elsewhere (0 pp)'],
];
function itemsSpecial(){
  const out=['| item (slot) | T1 | T2 | T3 | T4 | T5 | T6 | what it is for |','|---|---|---|---|---|---|---|---|'];
  for(const [n,slot,pp,stat,why] of SPECIAL){const cells=TIER.map(([L],i)=>{
      if(stat==='threat'||stat==='threat-'){return `${MAT[i]} · ${stat==='threat'?'threat ×1.5':'threat ×0.5'}, ${fmt('hp',PP.hp(pp,L))}`}
      const scales=['spd','spa'].includes(stat);const sp=scales?pp:pp/2;   // flat stats take half the budget; the other half is HP, which grows with the tier
      let v=PP[stat](sp,L);const integer=['luck','init','res','morale','score','might','wits','lead'].includes(stat);let used=sp;
      if(integer){const vi=Math.max(1,Math.round(v));used={luck:5,init:1,res:1/3,morale:7,score:2.5,might:5.6,wits:5.6,lead:6.5}[stat]*vi;v=vi}
      const left=pp-used;const rest=left>0.5?`, ${fmt('hp',PP.hp(left,L))}`:'';
      return `${MAT[i]} · ${fmt(stat,v)}${rest}`});
    out.push(`| **${n}** (${slot}) | ${cells.join(' | ')} | ${why} |`)}
  return out.join('\n')}
/* robe and scout variants (half of the defence budget moved) */
const SLOT_DEF={armour:[14,0],helm:[4,3],cloak:[2,5]};   // [def pp, hp pp]
const ROBE={armour:['Apprentice robe','Scribe\'s robe','Sand-silk robe','Ember robe','Frost-weave robe','Pearl robe'],helm:['Cloth cap','Scholar\'s hat','Honey-silk hood','Ember hood','Snow cowl','Pearl cowl'],cloak:['Linen shawl','Reading shawl','Sun shawl','Cinder shawl','Fog shawl','Tide shawl']};
const SCOUT={armour:['Twig jerkin','Runner\'s vest','Sand-scale jerkin','Basalt-lite vest','Snow-scout coat','Shore-scout coat'],helm:['Feather band','Scout\'s cap','Goggles','Ember visor','Fur ear-flaps','Gull-feather cap'],cloak:['Grass cape','Dust cape','Dune cape','Ash cape','White cape','Sea-spray cape']};
function itemsVariants(){
  const out=['| slot · variant | T1 (L1) | T2 (L5) | T3 (L10) | T4 (L16) | T5 (L22) | T6 (L28) |','|---|---|---|---|---|---|---|'];
  for(const slot of Object.keys(SLOT_DEF)){const [dp,hp]=SLOT_DEF[slot];
    out.push(`| ${slot} · **robe** (casters) | `+TIER.map(([L],i)=>`${ROBE[slot][i]} · ${fmt('def',PP.def(dp/2,L))}, ${fmt('mana',PP.mana(dp/2,L))}${hp?', '+fmt('hp',PP.hp(hp,L)):''}`).join(' | ')+' |');
    out.push(`| ${slot} · **scout** (ranger, rogue, monk) | `+TIER.map(([L],i)=>`${SCOUT[slot][i]} · ${fmt('def',PP.def(dp/2,L))}, ${fmt('speed',PP.speed(dp/2))}${hp?', '+fmt('hp',PP.hp(hp,L)):''}`).join(' | ')+' |')}
  return out.join('\n')}
/* caster weapons: their weapon power is special attack; each tier has an element */
const CW={wands:[['Frost rod','frost'],['Fire wand','fire'],['Birch staff','nature'],['Archstaff','storm'],['Frost staff','frost'],['Ember staff','fire']],
 orbs:[['Spark stone','fire'],['Ember stone','fire'],['Cinder orb','fire'],['Flame heart','fire'],['Frost heart','frost'],['Dragon heart','fire']],
 teapots:[['Chipped teapot','fire'],['Brass teapot','fire'],['Copper kettle','storm'],['Silver pot','frost'],['Frost samovar','frost'],['Dragon-glaze urn','fire']],
 holy:[['Healing wand','—'],['Oak crook','—'],['Sun-bell','—'],['Ember censer','—'],['Frost chime','—'],['Hearthspire lantern','—']],
 nature:[['Twig','nature'],['Root staff','earth'],['Moss staff','nature'],['Bramble crook','nature'],['Frost-bark staff','frost'],['Ember-wood staff','earth']],
 instruments:[['Whistle','—'],['Fiddle','—'],['Lute','—'],['Drum','—'],['Frost horn','frost'],['Golden harp','—']]};
function itemsCasterElems(){const out=['| family | T1 | T2 | T3 | T4 | T5 | T6 |','|---|---|---|---|---|---|---|'];
  for(const [f,row] of Object.entries(CW))out.push(`| ${f} | `+row.map(([n,e])=>`${n} (${e})`).join(' | ')+' |');return out.join('\n')}
/* the gambler's gear: free trades on the rewarded-crit table (λ = 0.15) */
function itemsGambler(){return['| item | slot | normal hits | crit chance | crit damage | average | no crit in a 10-round boss fight |','|---|---|---|---|---|---|---|',
 '| **Loaded die** | ring | ×0.50 | (yours, 8%) | ×9.2 | ×1.20 | 43% |',
 '| **Gambler\'s glove** | ring | ×0.50 | (yours, 15% with a flanking build) | ×4.8 | ×1.15 | 20% |',
 '| **Lucky penny** | neck | ×0.25 | sets it to 3% | ×36 | ×1.32 | 74% |',
 '| **Wishing coin** | neck | ×0.25 | sets it to 1% | ×116 | ×1.40 | 90% |'].join('\n')}
/* Pip's regalia and the monk's gear */
function itemsPipMonk(){
  const out=['| item (slot) | T1 | T2 | T3 | T4 | T5 | T6 | note |','|---|---|---|---|---|---|---|---|'];
  const row=(n,slot,pp,stat,note,only)=>out.push(`| **${n}** (${slot}) | `+TIER.map(([L],i)=>{const unit={might:5.6,wits:5.6,lead:6.5,score:2.5}[stat];const vi=Math.max(1,Math.floor((stat==='score'?pp/2:pp)/unit));const left=pp-vi*unit;return `${MAT[i]} · ${fmt(stat,vi)}${stat==='score'?' (your lowest)':''}${left>0.5?', '+fmt('hp',PP.hp(left,L)):''}`}).join(' | ')+` | ${note} |`);
  row('Leader\'s sash','neck',11,'might','Pip only: the whole pack hits and holds harder');
  row('Thinking cap','helm',7,'wits','Pip only: the whole pack\'s spells and magic defence');
  row('Square bell','neck',11,'lead','Pip only: pack morale; strong early, saturates late');
  row('Balance beads','neck',11,'score','the monk: always raises the lowest score, so Balance climbs');
  out.push('| **Ki band** (ring) | '+TIER.map(([L],i)=>`${MAT[i]} · ${fmt('mana',PP.mana(10,L))} ki`).join(' | ')+' | the monk: a bigger ki pool (+10% of base mana) |');
  return out.join('\n')}
/* on-hit status weapons (a weapon variant: 10 pp of its 60 go to the status) */
function itemsStatus(){return['| variant (any weapon family) | what it does | its price inside the weapon\'s 60 pp |','|---|---|---|',
 '| **Ember-coated** | 15% of hits burn (1/16 of HP a turn for 3 turns, and weaken) | 10 pp (the weapon keeps 50 pp of attack) |',
 '| **Venom-tipped** | 15% of hits poison (1/8 of HP a turn for 3 turns) | 10 pp |',
 '| **Pike-hafted** (blades, axes) | reach +1 (the next tile at 75%) | 10 pp |',
 '| **Steady-stocked** (guns) | steadiness −2 points per tile (about +2 tiles of reach) | 10 pp |',
 '| **Heavy-headed** (axes, fists) | 25% armour piercing | 10 pp |'].join('\n')}

module.exports={ROLE,FOES,roleStats,foeTable,roleTable,itemsSpecial,itemsVariants,itemsCasterElems,itemsGambler,itemsPipMonk,itemsStatus};
if(require.main===module){const w=process.argv[2]||'all';
  if(w==='foes'||w==='all'){console.log(roleTable());console.log();console.log(foeTable())}
  if(w==='items'||w==='all'){console.log();console.log(itemsVariants());console.log();console.log(itemsCasterElems());console.log();console.log(itemsSpecial());console.log();console.log(itemsGambler());console.log();console.log(itemsPipMonk());console.log();console.log(itemsStatus())}}

/* ------------------------------------------------------------------ encounter mixes: groups whose weights add up to the
   target foes per fight (a pack of four), within 10%, 3 to 6 foes, at the place's middle level */
const PLACES=[
 ['R1 (the capital gate → Pebblebrook)',4,['Nettlenose scout','Nettlenose slinger','Copper beetle']],
 ['the mine (Pebblebrook)',7,['Copper beetle','Glow grub','Nettlenose scout']],
 ['R2 (→ Sunhaven)',10,['Snatchclaw\'s guard','Sand skink','Nettlenose slinger']],
 ['the honey cellars (Sunhaven)',12,['Cellar bee','Wax golem','Sand skink']],
 ['R3 (→ Emberreach)',15,['Rock goat','Stoker','Nettlenose slinger']],
 ['the crater (Emberreach)',17,['Stoker','Magma slug','Nettlenose scout']],
 ['R4, the bun road',17,['Snatchclaw\'s guard','Guard sergeant','Nettlenose slinger','Nettlenose scout']],
 ['R5 (→ Frostwick)',21,['Snow beast','Frost guard','Nettlenose scout']],
 ['the ice cellars (Frostwick)',22,['Ice mite','Snow beast','Frost guard']],
 ['R6 (→ Saltspray)',24,['Shore crab','Smuggler','Snatchclaw\'s guard']],
 ['the shipwreck (Saltspray)',25,['Shore crab','Smuggler','Nettlenose slinger']],
 ['R7 and the islands',26,['Shore crab','Sea guard']],
 ['the island cave',27,['Cave eel','Shore crab','Sea guard']],
 ['the march and the castle',29,['Royal guard','Castle crossbow','Snatchclaw\'s guard','Guard sergeant']],
];
function mixes(){
  const out=['| place | level | target weight | three typical groups (weight) |','|---|---|---|---|'];
  for(const [place,L,pool] of PLACES){const T=m.P.foesPerFight(L);const ws=pool.map(n=>{const f=FOES.find(x=>x[0]===n);return roleStats(f[1],L).w});
    const found=[];const rec=(i,cnt,acc,sum)=>{if(i===pool.length){const n=cnt.reduce((a,b)=>a+b,0);if(n>=3&&n<=6&&Math.abs(sum-T)/T<=0.10)found.push({cnt:cnt.slice(),sum,n});return}
      for(let k=0;k<=5;k++){cnt[i]=k;rec(i+1,cnt,acc,sum+k*ws[i])}cnt[i]=0};
    rec(0,pool.map(()=>0),0,0);
    found.sort((a,b)=>(b.cnt.filter(x=>x>0).length-a.cnt.filter(x=>x>0).length)||(Math.abs(a.sum-T)-Math.abs(b.sum-T)));
    const pick=[];for(const f of found){if(pick.length===3)break;if(!pick.some(p=>p.cnt.join()===f.cnt.join()))pick.push(f)}
    const txt=pick.map(f=>f.cnt.map((c,i)=>c?`${c} ${pool[i].toLowerCase()}`:null).filter(Boolean).join(' + ')+` (${f.sum.toFixed(2)})`).join('; ');
    out.push(`| ${place} | ${L} | ${T.toFixed(2)} | ${txt} |`)}
  return out.join('\n')}
module.exports.mixes=mixes;module.exports.PLACES=PLACES;
if(require.main===module&&(process.argv[2]==='mixes'||process.argv[2]==='all'))console.log('\n'+mixes());
