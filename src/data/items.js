import {RP_CLS} from './classes.js';
import {WEAPONS} from '../engine/art.js';
import {rpAffixed} from '../game/gear.js';
const RP_W={
  stick:{pow:4,price:0},bone:{pow:6,price:40},pan:{pow:6,price:60,sk:['clang']},sword:{pow:9,price:90},club:{pow:13,price:240,spd:-1.5,sk:['smash']},
  popgun:{pow:6,price:50},blunder:{pow:8,price:110},cannon:{pow:12,price:260,spd:-1,sk:['bigshot']},
  frostrod:{pow:5,price:70},firewand:{pow:7,price:120},archstaff:{pow:11,price:300},healwand:{pow:3,price:80},
  spear:{pow:8,price:120}
};
const RP_SHOP=['bone','pan','popgun','frostrod','healwand','sword','blunder','firewand','club','cannon','archstaff'];
const RP_ITEMS={potion:{n:'Potion',price:15,d:'Heal 45 HP',t:'ally'},ether:{n:'Ether',price:25,d:'Restore 12 MP',t:'ally'},feather:{n:'Phoenix feather',price:60,d:'Revive a fallen friend at half health',t:'down'}};
const RP_SLOTS9=['head','neck','cloak','weapon','armor','shield','ring1','ring2','boots'];
const RP_SLOTNAME={head:'Helm',neck:'Amulet',cloak:'Cloak',weapon:'Weapon',armor:'Armour',shield:'Shield',ring1:'Ring',ring2:'Ring',boots:'Boots'};
const RP_IT_BASE={
  cap_leaf:{n:'Leaf crown',slot:'head',hat:'leaf',st:{spd:1,sight:1},price:30},
  cap_pot:{n:'Iron pot',slot:'head',hat:'pot',st:{def:2},price:35},
  cap_bucket:{n:'Bucket helm',slot:'head',hat:'bucket',st:{def:3.5,spd:-.5,sight:-1},price:60},
  cap_wizard:{n:'Wizard hat',slot:'head',hat:'wizard',st:{mp:6},price:55},
  cap_flower:{n:'Flower crown',slot:'head',hat:'flower',st:{hp:8,mp:3},price:45},
  cap_cone:{n:'Lucky cone',slot:'head',hat:'cone',st:{atk:1,spd:1},pas:{crit:.05},price:70},
  cap_crown:{n:'Crown of Vexx',slot:'head',hat:'crown',st:{atk:4,def:4,hp:20,mp:6},rare:1},
  am_glow:{n:'Glowcap pendant',slot:'neck',st:{hp:10,mp:4,sight:2},price:70},
  am_shell:{n:'Snail shell charm',slot:'neck',st:{def:3},price:60},
  am_tooth:{n:'Dragon tooth',slot:'neck',st:{atk:4},price:120},
  cl_moss:{n:'Moss cape',slot:'cloak',st:{hp:12},price:50},
  cl_shadow:{n:'Shadow cloak',slot:'cloak',st:{spd:1.5},pas:{dodge:.08,stealth:1},price:110},
  cl_scarf:{n:'Cozy scarf',slot:'cloak',st:{hp:12,def:1},price:70},
  cl_ember:{n:'Ember mantle',slot:'cloak',st:{atk:2,mp:4},price:120},
  ar_vest:{n:'Leather vest',slot:'armor',st:{def:2},price:40},
  ar_robe:{n:'Apprentice robe',slot:'armor',st:{mp:8,def:1},price:60},
  ar_scale:{n:'Scale mail',slot:'armor',st:{def:5,spd:-.5},price:130},
  ar_gorb:{n:"Gorb's mushroom plate",slot:'armor',st:{def:6,hp:24},pas:{regen:.03},rare:1},
  sh_lid:{n:'Pot lid',slot:'shield',st:{def:2},price:30},
  sh_spike:{n:'Spiked shield',slot:'shield',st:{def:3,atk:1},price:100},
  sh_tome:{n:'Spell tome',slot:'shield',st:{mp:6,atk:1.5},cls:['mage','cleric'],price:90},
  sh_quiver:{n:'Quiver',slot:'shield',st:{atk:2,spd:.5},cls:['ranger'],price:80},
  rg_might:{n:'Ring of might',slot:'ring',st:{atk:2},price:80},
  rg_life:{n:'Ring of life',slot:'ring',st:{hp:15},price:70},
  rg_mana:{n:'Ring of mana',slot:'ring',st:{mp:6},price:70},
  rg_haste:{n:'Ring of haste',slot:'ring',st:{spd:1.2},price:110},
  bt_frog:{n:'Frog boots',slot:'boots',st:{spd:1,hp:6},price:45},
  bt_quick:{n:'Quick boots',slot:'boots',st:{spd:1.8},price:110},
  bt_iron:{n:'Iron boots',slot:'boots',st:{def:2.5,spd:-.3},price:80}
};
const RP_IT=new Proxy(RP_IT_BASE,{get(t,k){if(k in t)return t[k];if(typeof k==='string'&&k.indexOf('#')>0)return rpAffixed(k);return undefined}});
Object.keys(RP_W).forEach(k=>{RP_IT['w_'+k]={n:WEAPONS[k].n,slot:'weapon',w:k,st:{},price:RP_W[k].price,cls:Object.keys(RP_CLS).filter(c=>RP_CLS[c].wk.includes(k))}});
const RP_LOOT={',':['cap_leaf','cap_pot','ar_vest','sh_lid','rg_life','bt_frog','cap_flower'],';':['cap_wizard','cap_cone','cl_moss','ar_robe','rg_might','rg_mana','sh_quiver','am_shell','w_bone','w_popgun','w_spear'],
  C:['cap_bucket','ar_scale','sh_spike','sh_tome','cl_shadow','bt_quick','am_glow','w_sword','w_firewand','w_blunder'],K:['am_tooth','cl_ember','bt_iron','rg_haste','rg_might','w_club','w_cannon','w_archstaff']};
RP_LOOT.g=RP_LOOT.C;
const RP_SHOP2=['cap_pot','cap_wizard','cap_flower','ar_vest','ar_robe','sh_lid','sh_quiver','sh_tome','rg_life','rg_mana','bt_frog','cl_moss','w_bone','w_pan','w_popgun','w_frostrod','w_healwand','w_sword','w_spear','w_blunder','w_firewand','w_club','w_cannon','w_archstaff'];
export {RP_IT,RP_ITEMS,RP_IT_BASE,RP_LOOT,RP_SHOP,RP_SHOP2,RP_SLOTNAME,RP_SLOTS9,RP_W};
