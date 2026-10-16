/* balance knobs: enemy health and attack multipliers, and the XP multiplier (tuned with test/sim) */
const BAL={xp:1,ehp:1.15,eatk:1.1};
/* weapon reach and range on the grid. r: max range (tiles), o: no-penalty range,
   q: quick (attacking costs 1 AP and does not end the turn), h: heavy (needs both AP) */
const RP_TW={stick:{r:1},spoon:{r:1,q:1},fish:{r:1,q:1},bone:{r:1},pan:{r:1},sword:{r:1},club:{r:1,h:1},spear:{r:2},
  popgun:{r:7,o:5,q:1},squirt:{r:5,o:4,q:1},blunder:{r:4,o:2,close:1},cannon:{r:9,o:7,h:1},
  frostrod:{r:6,o:5},firewand:{r:6,o:5,splash:1},archstaff:{r:7,o:6,splash:1,h:1},healwand:{r:5,o:4,q:1}};
/* skills on the grid. ap: 1, 2 or 'end' (needs 1, uses the rest). spell: never misses.
   area: blast radius around a tile. around: everything in reach. self: allies within n tiles. chan: lands next turn */
const RP_ST={bonk:{ap:'end',rng:'w'},clang:{ap:'end',rng:'w'},bash:{ap:'end',rng:'w'},smite:{ap:'end',rng:3,spell:1},
  smash:{ap:2,around:1},cleave:{ap:'end',around:1},
  volley:{ap:2,rng:'w',area:1},rain:{ap:2,rng:'w',area:1.5},aimed:{ap:2,rng:'w',aim:20},bigshot:{ap:2,rng:'w'},
  ice:{ap:1,rng:6,spell:1},drain:{ap:1,rng:5,spell:1},fireball:{ap:2,rng:6,area:1,spell:1,ff:1},chain:{ap:2,rng:6,spell:1,chain:2},
  meteor:{ap:2,rng:7,area:1.5,spell:1,ff:1,chan:1},
  heal:{ap:1,rng:5},revive:{ap:2,rng:1},mend:{ap:2,self:3},warcry:{ap:1,self:3},bless:{ap:1,self:3},
  shieldwall:{ap:1,self:1},whirl:{ap:'end',around:1},headshot:{ap:2,rng:'w',aim:15},nova:{ap:2,rng:0,area:1.5,spell:1},sanct:{ap:2,self:2},holy:{ap:'end',rng:'w'}
};
/* terrain: mv move cost, cov 1 half / 2 full cover, los blocks sight, grass hides */
const RP_TT={'.':{},';':{},'=':{},'C':{},'K':{},'o':{},',':{grass:1},'~':{mv:2,wet:1},
  'T':{solid:1,cov:2,los:1},'R':{solid:1,cov:2,los:1},'P':{solid:1,cov:2,los:1},'h':{solid:1,cov:1},'m':{solid:1,cov:1},'G':{solid:1,cov:1}};
const TC_DIR8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
export {BAL,RP_ST,RP_TT,RP_TW,TC_DIR8};
