import {openSpot} from './overworld.js';
import {RP_ROOM_SOLID} from './places.js';
const RW=40,RH=30;
function rpBuildWorld(){
  const g=[];for(let y=0;y<RH;y++){g.push([]);for(let x=0;x<RW;x++)g[y].push('.')}
  const set=(x,y,c)=>{if(x>=0&&y>=0&&x<RW&&y<RH)g[y][x]=c};
  const rect=(x0,y0,x1,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,c)};
  const hash=(x,y)=>((x*73856093)^(y*19349663))>>>0;
  // forest (north-west)
  for(let y=1;y<=13;y++)for(let x=1;x<=16;x++)set(x,y,hash(x,y)%5<2?'T':';');
  // Pebble Hills (north-east): open hills with tall grass, boulders and a pond
  rect(17,1,38,14,'.');
  [[18,2,23,5],[27,9,33,12],[33,2,37,5],[24,6,27,8]].forEach(r=>rect(r[0],r[1],r[2],r[3],','));
  [[25,1],[26,1],[25,2],[30,6],[31,6],[30,7],[36,8],[37,8],[37,9],[18,10],[18,11],[34,13],[35,13]].forEach(([x,y])=>set(x,y,'#'));
  rect(28,2,31,4,'~');
  for(let i=0;i<10;i++){const x=17+hash(i,11)%22,y=1+hash(i,13)%14;if(g[y][x]==='.')set(x,y,'F')}
  // river
  rect(1,15,38,16,'~');set(20,15,'b');set(20,16,'b');
  // south meadow
  rect(14,17,38,28,'.');
  [[16,19,22,22],[26,18,33,21],[24,24,30,27],[33,23,37,27],[15,25,20,28]].forEach(r=>rect(r[0],r[1],r[2],r[3],','));
  // village
  rect(1,17,13,28,'.');
  for(let i=0;i<14;i++){const x=1+hash(i,3)%13,y=17+hash(i,7)%12;set(x,y,'F')}
  const house=(x0,y0,w,h,dx)=>{rect(x0,y0,x0+w-1,y0+h-1,'H');set(x0+dx,y0+h-1,'d')};
  house(2,18,4,3,1);   // inn, door (3,20)
  house(9,18,4,3,2);   // shop, door (11,20)
  house(2,24,4,3,2);   // elder, door (4,26)
  // paths
  for(let x=3;x<=20;x++)set(x,22,'=');
  for(let y=17;y<=22;y++)set(20,y,'=');
  for(let y=5;y<=14;y++)set(20,y,'=');
  for(let x=8;x<=20;x++)set(x,12,'=');
  for(let y=5;y<=12;y++)set(8,y,'=');
  for(let y=21;y<=22;y++){set(3,y,'=');set(11,y,'=')}
  set(4,27,'=');
  // witch hut in forest
  house(6,2,4,3,2); // door (8,4)
  rect(5,5,11,6,';');for(let y=5;y<=12;y++)set(8,y,'=');
  // borders
  for(let x=0;x<RW;x++){set(x,0,'#');set(x,RH-1,'#')}
  for(let y=0;y<RH;y++){set(0,y,'#');set(RW-1,y,'#')}
  // ways out to the big world: the village road runs on east, and a track leads south past the elder's house
  for(let x=21;x<RW;x++)set(x,22,'=');set(RW-1,23,'=');set(4,28,'=');set(4,RH-1,'=');
  return g;
}
const RP_SOLID=new Set(['T','~','#','H','W','X','S','N','A','M','P','q','n','i','O','U','Y','R','Z',...RP_ROOM_SOLID]);
const RP_CHESTS=[{x:13,y:28,it:'sh_lid',gold:10},{x:37,y:27,it:'bt_frog',gold:20},{x:2,y:12,it:'cl_moss',gold:25},{x:37,y:2,it:'am_glow',gold:40},{x:18,y:1,it:'rg_haste',gold:80},
  {place:'elder',x:9,y:5,it:'rg_life',gold:15},{place:'hut',x:9,y:6,it:'am_shell',gold:25},
  /* off the path on the first routes (Kobaldia) */
  {...openSpot(83,13),it:'ar_vest',gold:30},{...openSpot(33,62),it:'bt_quick',gold:50},{...openSpot(172,12),it:'rg_mana',gold:60},{...openSpot(237,43),it:'cap_bucket',gold:40}];
/* movement */
const RP_DIR={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
/* things lying on the map (rules from core/rules.js).
   Pickups: step on a tile with that letter to take it; the tile turns into `becomes` for good.
   Spots: one quest thing at one place, there while `if` holds; `draw` names how the map shows it. */
const RP_PICKUPS={};
const RP_SPOTS=[{id:'hat',x:30,y:20,if:{hat:1},do:{set:{hat:2},toast:'Found Pebble\'s hat!',save:true},sfx:'win',draw:'hat'},
  {id:'needles',place:'hut',x:2,y:6,if:{needles:1},do:{set:{needles:2},toast:'Found Granny Nettle\'s knitting needles!',save:true},sfx:'win',draw:'needles'}];
/* map extras: shrine, bounty board, anvil, market, the Moot urn and the valley's signs */
const VALLEY_SIGNS={'14,23':'HATCHING DAY! Three eggs in the Great Nest on the green. Bring your ember and warm the one you like best.',
  '21,5':'Pebble Hills. Lovely view. Lots of tall grass. Watch your tail.','21,14':'North: Pebble Hills. West: Whisper Woods and Witch Yarrow\'s hut.'};
function rpWorldExtras(g){g[27][12]='S';g[19][7]='N';g[25][11]='A';g[21][8]='M';g[26][17]='U';g[24][10]='O';for(const k in VALLEY_SIGNS){const [x,y]=k.split(',').map(Number);g[y][x]='i'}}
export {RH,RP_CHESTS,RP_DIR,RP_PICKUPS,RP_SOLID,RP_SPOTS,RW,VALLEY_SIGNS,rpBuildWorld,rpWorldExtras};
