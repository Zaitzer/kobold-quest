const RW=40,RH=30;
function rpBuildWorld(){
  const g=[];for(let y=0;y<RH;y++){g.push([]);for(let x=0;x<RW;x++)g[y].push('.')}
  const set=(x,y,c)=>{if(x>=0&&y>=0&&x<RW&&y<RH)g[y][x]=c};
  const rect=(x0,y0,x1,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,c)};
  const hash=(x,y)=>((x*73856093)^(y*19349663))>>>0;
  // forest (north-west)
  for(let y=1;y<=13;y++)for(let x=1;x<=16;x++)set(x,y,hash(x,y)%5<2?'T':';');
  // north meadow between forest and cave
  rect(17,8,38,14,'.');
  // castle
  rect(17,0,23,7,'W');rect(18,1,22,6,'K');set(20,7,'X');
  // cave block
  rect(24,0,38,12,'#');
  rect(26,2,37,10,'C');
  [[29,4],[30,4],[33,7],[34,7],[28,8],[35,3],[36,9]].forEach(([x,y])=>set(x,y,'#'));
  set(35,3,'C');
  rect(31,11,31,11,'c');
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
  for(let y=8;y<=14;y++)set(20,y,'=');
  for(let x=8;x<=20;x++)set(x,12,'=');
  for(let y=5;y<=12;y++)set(8,y,'=');
  for(let x=20;x<=31;x++)set(x,13,'=');set(31,12,'=');
  for(let y=21;y<=22;y++){set(3,y,'=');set(11,y,'=')}
  set(4,27,'=');
  // witch hut in forest
  house(6,2,4,3,2); // door (8,4)
  rect(5,5,11,6,';');for(let y=5;y<=12;y++)set(8,y,'=');
  // borders
  for(let x=0;x<RW;x++){set(x,0,x>=17&&x<=23?'W':'#');set(x,RH-1,'#')}
  for(let y=0;y<RH;y++){set(0,y,'#');set(RW-1,y,'#')}
  // glowcaps
  [[27,3],[36,5],[29,9]].forEach(([x,y])=>set(x,y,'g'));
  return g;
}
const RP_SOLID=new Set(['T','~','#','H','W','X','S','N','A','M']);
const RP_CHESTS=[{x:13,y:28,it:'sh_lid',gold:10},{x:37,y:27,it:'bt_frog',gold:20},{x:2,y:12,it:'cl_moss',gold:25},{x:37,y:2,it:'am_glow',gold:40},{x:18,y:1,it:'rg_haste',gold:80}];
/* movement */
const RP_DIR={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
/* things lying on the map (rules from core/rules.js).
   Pickups: step on a tile with that letter to take it; the tile turns into `becomes` for good.
   Spots: one quest thing at one place, there while `if` holds; `draw` names how the map shows it. */
const RP_PICKUPS={g:{becomes:'C',do:{add:{glow:1},toast:'Found a glowcap! ({glow} found)',save:true}}};
const RP_SPOTS=[{id:'hat',x:30,y:20,if:{hat:1},do:{set:{hat:2},toast:'Found Pebble\'s hat!',save:true},sfx:'win',draw:'hat'}];
/* map extras: shrine, bounty board, anvil */
function rpWorldExtras(g){g[27][12]='S';g[19][7]='N';g[25][11]='A';g[21][8]='M'}
export {RH,RP_CHESTS,RP_DIR,RP_PICKUPS,RP_SOLID,RP_SPOTS,RW,rpBuildWorld,rpWorldExtras};
