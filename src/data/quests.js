/* NPCs */
const RP_NPC=[
  {id:'elder',name:'Elder Mumble',x:5,y:27,team:0,w:'healwand',hat:'flower',face:1},
  {id:'toast',name:'Toast the innkeeper',place:'inn',x:6,y:3,team:0,w:'spoon',hat:'pot',face:-1},
  {id:'biscuit',name:'Biscuit the trader',place:'shop',x:4,y:4,team:0,w:'pan',hat:'cone',face:-1},
  {id:'bork',name:'Bork',x:10,y:26,team:0,w:'bone',hat:'bucket',face:1,show:s=>!s.q.bork},
  {id:'flint',name:'Guard Flint',x:20,y:17,team:0,w:'sword',hat:'pot',face:1,pos:s=>s.q.q1>=2?{x:21,y:17}:null},
  {id:'yarrow',name:'Witch Yarrow',x:9,y:5,team:3,w:'frostrod',hat:'wizard',face:-1},
  {id:'wizzle',name:'Wizzle',x:10,y:6,team:0,w:'frostrod',hat:'wizard',face:-1,show:s=>!s.q.wizzle},
  {id:'scout',name:'Wounded scout',x:33,y:13,team:0,w:'popgun',hat:'leaf',face:-1},
  {id:'gorb',name:'Chief Gorb',x:35,y:3,team:1,w:'club',hat:'pot',face:-1,size:1.3,show:s=>!s.q.gorb},
  {id:'clink',name:'Clink the smith',x:12,y:25,team:0,w:'club',hat:'bucket',face:-1},
  {id:'pebble',name:'Pebble',x:7,y:27,team:0,w:'spoon',hat:'none',face:1,size:.8},
  {id:'vexx',name:'King Vexx',x:20,y:2,team:3,w:'sword',hat:'crown',face:1,size:1.4,show:s=>!s.q.vexx},
  {id:'tikka',name:'Tikka',place:'inn',x:2,y:5,team:2,w:'squirt',hat:'flower',face:1},
  {id:'nettle',name:'Granny Nettle',place:'elder',x:6,y:2,team:0,w:'spoon',hat:'flower',face:-1,size:.9}
];
/* bosses: what beating them does (rules), what they drop, and what is said when the battle closes */
const RP_BOSSES={
  gorb:{win:{set:{gorb:1,key:1}},drops:['ar_gorb'],after:[{who:'',text:'Chief Gorb drops a heavy iron key: the key to the Dragon\'s Hoard! The gate is north of the bridge.'}]},
  vexx:{win:{set:{vexx:1}},drops:['cap_crown'],after:[{who:'King Vexx',text:'Ugh... my beautiful hoard...'},{who:'',text:'King Vexx scurries off into the dark. The stolen gold of Burrowhome is yours to bring home!'},{who:'',text:'THE END. Thanks for playing Kobold Quest! You can keep exploring, and the Elder has something to say.'}]}};
/* kill tallies: winning a fight in `zone` while `if` holds adds the number of foes to quest flag `flag` */
const RP_TALLIES=[{zone:',',if:{q1:1},flag:'kills'}];
/* bounties on the board by the inn, one after another */
const RP_BOUNTY=[
  {z:',',n:8,xp:35,g:20,zn:'Bandit Meadow'},
  {z:';',n:10,xp:90,g:30,if:{q1:{gte:2}},zn:'Whisper Woods'},
  {z:'C',n:10,xp:180,g:40,if:{q2:{gte:1}},zn:'Mushroom Cave'},
  {z:'K',n:10,xp:300,g:60,if:{gate:1},zn:'the Dragon\'s Hoard'}
];
export {RP_BOSSES,RP_BOUNTY,RP_NPC,RP_TALLIES};
