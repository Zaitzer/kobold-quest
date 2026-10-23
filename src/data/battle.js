/* weapon reach and range on the grid. r: max range (tiles), o: no-penalty range,
   q: quick (attacking costs 1 AP and does not end the turn), h: heavy (needs both AP) */
const RP_TW={stick:{r:1},spoon:{r:1,q:1},fish:{r:1,q:1},bone:{r:1},pan:{r:1},sword:{r:1},club:{r:1,h:1},spear:{r:2},
  popgun:{r:7,o:5,q:1},squirt:{r:5,o:4,q:1},blunder:{r:4,o:2,close:1},cannon:{r:9,o:7,h:1},
  frostrod:{r:6,o:5},firewand:{r:6,o:5,splash:1},archstaff:{r:7,o:6,splash:1,h:1},healwand:{r:5,o:4,q:1}};
/* skills on the grid. ap: 1, 2 or 'end' (needs 1, uses the rest). spell: never misses.
   area: blast radius around a tile. around: everything in reach. self: allies within n tiles. chan: lands next turn */
const RP_ST={};   /* how each skill is cast: filled with the v6 skills (battle/v6battle.js) */
/* terrain: mv move cost, cov 1 half / 2 full cover, los blocks sight, grass hides */
const RP_TT={'.':{},';':{},'=':{},'C':{},'K':{},'o':{},',':{grass:1},'~':{mv:2,wet:1},
  'T':{solid:1,cov:2,los:1},'R':{solid:1,cov:2,los:1},'P':{solid:1,cov:2,los:1},'h':{solid:1,cov:1},'m':{solid:1,cov:1},'G':{solid:1,cov:1}};
const TC_DIR8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
export {RP_ST,RP_TT,RP_TW,TC_DIR8};
