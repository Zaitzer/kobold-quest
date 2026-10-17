/* NPCs. Villagers in the region stand at spots worked out from their town's square (townSpot), or inside a house. */
import {openSpot,townSpot} from './overworld.js';

const atA=(dx,dy)=>townSpot('A',dx,dy),atE=(dx,dy)=>townSpot('E',dx,dy),atD=(dx,dy)=>townSpot('D',dx,dy);
const RP_NPC=[
  {id:'elder',name:'Elder Mumble',x:5,y:27,team:0,w:'healwand',hat:'flower',face:1},
  {id:'toast',name:'Toast the innkeeper',place:'inn',x:6,y:3,team:0,w:'spoon',hat:'pot',face:-1},
  {id:'biscuit',name:'Biscuit the trader',place:'shop',x:4,y:4,team:0,w:'pan',hat:'cone',face:-1},
  {id:'yarrow',name:'Witch Yarrow',x:9,y:5,team:3,w:'frostrod',hat:'wizard',face:-1},
  {id:'wizzle',name:'Wizzle',x:10,y:6,team:0,w:'frostrod',hat:'wizard',face:-1,show:s=>!s.q.wizzle},
  {id:'clink',name:'Clink the smith',x:12,y:25,team:0,w:'club',hat:'bucket',face:-1},
  {id:'pebble',name:'Pebble',x:7,y:27,team:0,w:'spoon',hat:'none',face:1,size:.8},
  {id:'quill',name:'Quill the scribe',place:'inn',x:10,y:3,team:2,w:'healwand',hat:'wizard',face:-1},
  {id:'tikka',name:'Tikka',place:'inn',x:2,y:5,team:2,w:'squirt',hat:'flower',face:1},
  {id:'nettle',name:'Granny Nettle',place:'elder',x:6,y:2,team:0,w:'spoon',hat:'flower',face:-1,size:.9},
  /* Pebblebrook */
  {id:'turnip',name:'Farmer Turnip',...atA(-3,2),team:0,w:'stick',hat:'leaf',face:1},
  {id:'grubb',name:'Grubb the toll boss',...atA(1,-1),team:2,w:'club',hat:'pot',face:-1,size:1.2,show:s=>(s.q.moot||0)>=5&&(s.q.pb||0)<2},
  {id:'bork',name:'Bork',...atA(3,2),team:0,w:'bone',hat:'bucket',face:-1,show:s=>!s.q.bork},
  /* Copperhollow */
  {id:'ruddle',name:'Foreman Ruddle',...atE(-3,2),team:1,w:'pan',hat:'bucket',face:1},
  {id:'snipe',name:'Snipe the copper snatcher',...atE(-2,-2),team:2,w:'blunder',hat:'bucket',face:1,show:s=>(s.q.moot||0)>=5&&(s.q.ch||0)<2},
  {id:'pickett',name:'Pickett',...atE(3,2),team:1,w:'stick',hat:'pot',face:-1},
  {id:'nugget',name:'Nugget',...atE(4,-2),team:1,w:'pan',hat:'none',face:-1,size:.85,show:s=>!s.q.nugget},
  {id:'dusty',name:'Dusty',place:'hE0',x:4,y:5,team:1,w:'club',hat:'pot',face:1},
  {id:'shale',name:'Old Shale',place:'hE1',x:2,y:3,team:1,w:'stick',hat:'none',face:1,size:.9},
  {id:'fennel',name:'Fennel',...atA(-2,-2),team:0,w:'healwand',hat:'flower',face:1,show:s=>(s.q.fennel||0)<3},
  {id:'parsnip',name:'Parsnip the goat',...openSpot(66,12),team:3,w:'stick',hat:'none',face:-1,size:.8,show:s=>s.q.fennel===1},
  {id:'keeperA',name:'Lodge keeper Moss',place:'hA0',x:6,y:3,team:0,w:'spoon',hat:'pot',face:-1},
  {id:'keeperE',name:'Lodge keeper Flint',place:'hE0',x:6,y:3,team:1,w:'pan',hat:'bucket',face:-1},
  /* Thistledown (the story goes on here next) */
  {id:'herald',name:'Thistledown herald',...atD(-3,2),team:3,w:'healwand',hat:'cone',face:1}
];
/* bosses: what beating them does (rules), what they drop, and what is said when the battle closes.
   ready: the story step a player must be at for the win to count for them (friends who help but aren't there yet
   just get the normal rewards); done: a player past it, who gets helper's spark dust for helping */
const RP_BOSSES={
  tollboss:{ready:{pb:1},done:{pb:{gte:2}},win:{set:{pb:2}},drops:['sh_spike'],after:[{who:'Grubb',text:'Ow! My belly! Fine, FINE, drink all you want!'},{who:'',text:'Grubb waddles off towards Thistledown. Farmer Turnip will want to hear about this.'}]},
  collector:{ready:{ch:1,miners:{gte:4}},done:{ch:{gte:2}},win:{set:{ch:2}},drops:['rg_might'],after:[{who:'Snipe',text:'You can\'t rob a kobold who is running away! Ha! ...Wait, that\'s me.'},{who:'',text:'Snipe flees down the mountain. The shift circle can finally sit down. Foreman Ruddle looks very nervous and very happy.'}]}};
/* kill tallies: winning a fight in `zone` while `if` holds adds the number of foes to quest flag `flag` */
const RP_TALLIES=[];
/* bounties on the board by the inn, one after another */
const RP_BOUNTY=[
  {z:',',n:8,xp:35,g:20,zn:'the tall grass'},
  {z:';',n:10,xp:90,g:30,if:{moot:{gte:2}},zn:'Whisper Woods'},
  {z:'C',n:10,xp:180,g:40,if:{lantern:1},zn:'the old tunnel'}
];
export {RP_BOSSES,RP_BOUNTY,RP_NPC,RP_TALLIES,atA,atD,atE};
