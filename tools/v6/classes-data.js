'use strict';
/* The class table (balance.md §3 "The other eleven classes", the special-attack table, the ability scores' priority, class accuracy
   from §4a, initiative bonus and base threat from §3 "The new stats"). Multipliers are on the reference fighter at the same level.
   tools/gen-data.js writes it into src/data/v6/classes.js; test/logic/v6data.test.js checks it against balance.md.                 */
const C={
 fighter:  {n:'Fighter',  fam:'blades',     split:[.30,.50,.20],hp:1.00,atk:1.00,spa:0.50,def:1.00,sd:0.80,spd:1.0, mana:[8,30], acc:5,  init:0,threat:1.00,prio:'STR CON DEX WIS CHA INT',wave:1},
 barbarian:{n:'Barbarian',fam:'axes',       split:[.50,.35,.15],hp:1.10,atk:1.20,spa:0.50,def:0.63,sd:0.50,spd:1.0, mana:[6,24], acc:-5, init:0,threat:0.84,prio:'STR CON DEX WIS CHA INT',wave:2},
 paladin:  {n:'Paladin',  fam:'blades',     split:[.30,.40,.30],hp:0.95,atk:0.95,spa:0.74,def:0.88,sd:0.88,spd:0.9, mana:[8,36], acc:0,  init:0,threat:0.87,prio:'STR CHA CON WIS DEX INT',wave:2},
 ranger:   {n:'Ranger',   fam:'guns',       split:[.45,.20,.35],hp:0.80,atk:1.12,spa:0.60,def:0.69,sd:0.69,spd:1.3, mana:[10,40],acc:10, init:2,threat:0.64,prio:'DEX WIS CON STR INT CHA',wave:1},
 rogue:    {n:'Rogue',    fam:'daggers',    split:[.45,.20,.35],hp:0.75,atk:1.07,spa:0.50,def:0.78,sd:0.62,spd:1.4, mana:[8,36], acc:5,  init:2,threat:0.64,prio:'DEX INT CON CHA WIS STR',wave:1},
 monk:     {n:'Monk',     fam:'fists',      split:[.33,.33,.34],hp:0.90,atk:0.93,spa:0.93,def:0.82,sd:0.82,spd:1.1, mana:[10,46],acc:5,  init:1,threat:0.79,prio:null,wave:1},
 cleric:   {n:'Cleric',   fam:'holy',       split:[.15,.30,.55],hp:0.85,atk:0.60,spa:0.77,def:0.93,sd:1.49,spd:0.9, mana:[14,62],acc:-10,init:0,threat:0.81,prio:'WIS CON STR CHA DEX INT',wave:1},
 druid:    {n:'Druid',    fam:'nature',     split:[.25,.25,.50],hp:0.85,atk:0.60,spa:0.82,def:0.74,sd:1.18,spd:1.0, mana:[14,62],acc:-10,init:0,threat:0.70,prio:'WIS CON DEX INT STR CHA',wave:2},
 bard:     {n:'Bard',     fam:'instruments',split:[.20,.20,.60],hp:0.75,atk:0.60,spa:0.78,def:0.82,sd:1.31,spd:1.1, mana:[12,58],acc:-10,init:0,threat:0.66,prio:'CHA DEX CON WIS INT STR',wave:1},
 wizard:   {n:'Wizard',   fam:'wands',      split:[.55,.10,.35],hp:0.65,atk:0.60,spa:1.09,def:0.67,sd:1.07,spd:0.95,mana:[16,70],acc:0,  init:0,threat:0.51,prio:'INT CON DEX WIS CHA STR',wave:1},
 sorcerer: {n:'Sorcerer', fam:'orbs',       split:[.60,.12,.28],hp:0.70,atk:0.60,spa:1.22,def:0.67,sd:1.07,spd:1.0, mana:[14,64],acc:0,  init:0,threat:0.55,prio:'CHA CON DEX INT WIS STR',wave:1},
 warlock:  {n:'Warlock',  fam:'teapots',    split:[.50,.22,.28],hp:0.80,atk:0.60,spa:1.03,def:0.76,sd:1.22,spd:1.0, mana:[12,52],acc:0,  init:0,threat:0.67,prio:'CHA CON DEX WIS INT STR',wave:2},
};
/* the reference fighter's base lines (balance.md §3), read WITH its scores; base = these ÷ 1.10 */
const BASE={atk:[5,2.2],def:[3,1.8],hp:[44,11]};
/* weapon families (items.md §2): ×power, quick, heavy, steadiness, magic */
const FAM={blades:{p:1.00,reach:1},axes:{p:1.15,heavy:1,spdPen:1.5},guns:{p:0.95,quick:1,ranged:1,steady:[6,5,12,4,3.5,3]},
 daggers:{p:0.85,quick:1,crit:1},fists:{p:0.80,quick:1},wands:{p:1.00,magic:1,steady:3},orbs:{p:1.05,magic:1,steady:4},
 teapots:{p:0.95,magic:1,steady:2.5},holy:{p:0.60,magic:1,steady:5,healBonus:.15},nature:{p:0.85,magic:1,steady:4},instruments:{p:0.60,magic:1,steady:5,songBonus:.15}};
const TIER_POWER=[3,8,15,23,31,39];   // weapon power by tier, ×family power (items.md §2)
module.exports={CLASSES6:C,BASE,FAM,TIER_POWER};
