/* ---------- Kobold Quest: item bonuses, gear sets, materials, the smith, the shrine,
   promotions and side quests ---------- */
/* random bonuses: dropped gear can come with a prefix, a suffix, or both */
const RP_AFFIX={
  sturdy:{n:'Sturdy',pre:1,st:{def:1.5}},swift:{n:'Swift',pre:1,st:{spd:.8}},mighty:{n:'Mighty',pre:1,st:{atk:1.5}},
  hale:{n:'Hale',pre:1,st:{hp:8}},wise:{n:'Wise',pre:1,st:{mp:4}},keen:{n:'Keen',pre:1,pas:{crit:.04}},sly:{n:'Sly',pre:1,pas:{dodge:.04}},
  bear:{n:'of the Bear',st:{hp:10,def:1}},fox:{n:'of the Fox',st:{spd:.8},pas:{dodge:.03}},owl:{n:'of the Owl',st:{mp:5,sight:1}},
  boar:{n:'of the Boar',st:{atk:2}},thorns:{n:'of Thorns',st:{def:2}},mending:{n:'of Mending',pas:{regen:.02}}
};
const RP_PRE=Object.keys(RP_AFFIX).filter(k=>RP_AFFIX[k].pre),RP_SUF=Object.keys(RP_AFFIX).filter(k=>!RP_AFFIX[k].pre);
/* gear sets: wear every piece on one kobold for a bonus (like HoMM3 combination artifacts) */
const RP_SETS={
  moss:{n:'Mossback regalia',pc:['cap_leaf','cl_moss','bt_frog'],st:{hp:12},pas:{regen:.05},d:'+12 health, regain 5% health each turn'},
  dragon:{n:'Dragonbone',pc:['am_tooth','ar_scale','bt_iron'],st:{atk:4,def:2},d:'+4 attack, +2 defence'},
  glow:{n:'Glowcap mystic',pc:['am_glow','ar_robe','rg_mana'],st:{mp:8,sight:1},pas:{mpregen:1},d:'+8 mana, +1 sight, regain 1 mana each turn'},
  shadow:{n:'Shadow stalker',pc:['cl_shadow','bt_quick','rg_haste'],st:{spd:1.5},pas:{dodge:.08},d:'+1.5 speed, +8% dodge'}
};
/* materials from monsters */
const RP_MATS={moss:{n:'Moss tuft',c:'#7ad65a'},shard:{n:'Frost shard',c:'#9ad0ff'},spore:{n:'Glow spore',c:'#7dffc4'},scrap:{n:'Gold scrap',c:'#ffd54a'},fang:{n:'Boss fang',c:'#fff7e0'}};
const RP_ZONEMAT={',':'moss',';':'shard',C:'spore',g:'spore',K:'scrap'};
/* ---------- Clink the smith ---------- */
const RP_RECIPES=[
  {it:'cl_moss',m:{moss:4},g:15},{it:'sh_spike',m:{moss:3,shard:2},g:40},{it:'w_spear',m:{shard:3},g:50},
  {it:'bt_quick',m:{shard:4},g:60},{it:'cl_shadow',m:{shard:3,spore:2},g:80},{it:'am_glow',m:{spore:4},g:50},
  {it:'ar_scale',m:{spore:3,scrap:2},g:90},{it:'bt_iron',m:{scrap:3},g:60},{it:'rg_haste',m:{scrap:2,fang:1},g:90},{it:'am_tooth',m:{scrap:3,fang:1},g:100}
];
const RP_REFORGE_G=30;
export {RP_AFFIX,RP_MATS,RP_PRE,RP_RECIPES,RP_REFORGE_G,RP_SETS,RP_SUF,RP_ZONEMAT};
