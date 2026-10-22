#!/usr/bin/env node
'use strict';
/* Kobold Quest v6: the vertical slice's maps (Hearthspire, R1, Pebblebrook, the mine's three floors, and the rooms), in the
   engine's format: rows of letters, one letter per tile. Writes docs/maps/*.txt (the maps, with their marks), docs/maps/slice.json
   (the same, as data) and docs/maps/*.png previews; checks that every door, exit and mark can be reached, that R1 is 120 steps,
   that no encounter grass lies within 10 steps of a route's ends, and that each mine floor is about 45 steps stair to stair.
   Usage: node tools/slicemaps.js                                                                                           */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const OUT=path.join(__dirname,'..','docs','maps');fs.mkdirSync(OUT,{recursive:true});

/* ------------------------------------------------------------------ tiles (one legend for all outdoor maps) */
const T={
 '.':['grass','#6cbf4c',0],',':['path','#c9a36a',0],'"':['tall grass (encounters)','#3f8f3a',0],'M':['marble street','#d9d2e6',0],'k':['castle yard','#bcb3cc',0],
 'N':['the Great Nest (straw)','#e0b85a',0],'=':['bridge','#a8743f',0],'G':['gate or exit','#ffd54a',0],'D':['door','#7a4f27',0],'h':['cellar hatch','#5a3a1a',0],
 '#':['wall','#4d3f57',1],'K':['castle wall','#62526d',1],'B':['building','#c4523a',1],'T':['tree','#24672d',1],'~':['water','#3a8fd9',1],'F':['fountain','#7bb6e6',1],
 'b':['bench','#a8743f',1],'o':['board or sign','#ffd54a',1],'t':['tower','#8a7a8f',1],'r':['rock','#62526d',1],'O':['circle stones','#9aa0b0',1],'W':['mill wheel','#7a4f27',1],
 // the mine
 'f':['mine floor','#8a7360',0],'R':['cart rails','#6b5545',0],'d':['unlit floor','#3b2f2a',0],'w':['flooded floor','#4d7fa8',0],'X':['rock wall','#2a1f1d',1],'x':['cart','#a8743f',1],
 'u':['stairs up','#ffd54a',0],'v':['stairs down','#ffd54a',0],'C':['campfire','#ff8a3a',0],'P':['copper pile','#d98a3a',1],
 // rooms (the engine's room letters, plus new ones)
 'q':['floor','#c9a36a',0],'e':['the way out','#ffd54a',0],'n':['oven','#b0574a',1],'k2':['',''],'s':['shelf','#7a4f27',1],'m':['mural','#4a35b0',1],'p':['bed','#c4523a',1],
 'l':['stool','#a8743f',1],'z':['table','#7a4f27',1],'y':['plant','#3f7f3a',1],'c':['chest','#d9a43a',1],'a':['flour sacks','#eee6d0',1],'g':['the flour tunnel (sealed until act 3)','#5a3a1a',0],
 '_':['counter','#7a4f27',1],'H':['hearth','#b0574a',1],'|':['throne (going up in the yard)','#ffd54a',1],
};
const SOLID=ch=>T[ch]&&T[ch][2]===1;

/* ------------------------------------------------------------------ a small drawing kit */
function grid(w,h,fill){const g=[];for(let y=0;y<h;y++)g.push(Array(w).fill(fill));return{w,h,g,
  set(x,y,c){if(x>=0&&y>=0&&x<w&&y<h)this.g[y][x]=c},get(x,y){return(x>=0&&y>=0&&x<w&&y<h)?this.g[y][x]:'#'},
  rect(x,y,ww,hh,c){for(let j=y;j<y+hh;j++)for(let i=x;i<x+ww;i++)this.set(i,j,c)},
  box(x,y,ww,hh,c){for(let i=x;i<x+ww;i++){this.set(i,y,c);this.set(i,y+hh-1,c)}for(let j=y;j<y+hh;j++){this.set(x,j,c);this.set(x+ww-1,j,c)}},
  line(path,c){for(const [x,y] of path)this.set(x,y,c)},rows(){return this.g.map(r=>r.join(''))}}}
/* a Manhattan path through points (every corner listed) */
function walk(pts){const out=[];let [x,y]=pts[0];out.push([x,y]);for(const [tx,ty] of pts.slice(1)){while(x!==tx){x+=Math.sign(tx-x);out.push([x,y])}while(y!==ty){y+=Math.sign(ty-y);out.push([x,y])}}return out}
function bfs(m,sx,sy){const D=new Map();const q=[[sx,sy]];D.set(sx+','+sy,0);while(q.length){const [x,y]=q.shift();const d=D.get(x+','+y);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;const c=m.get(nx,ny);const k=nx+','+ny;if(D.has(k)||nx<0||ny<0||nx>=m.w||ny>=m.h)continue;
    if(SOLID(c)&&c!=='D')continue;D.set(k,d+1);if(c!=='D')q.push([nx,ny])}}return D}

const MAPS={};   // name -> {title, grid, marks:[[x,y,label]], entry:[x,y], notes}
const mark=(M,x,y,label)=>M.marks.push([x,y,label]);

/* ================================================================== Hearthspire (40 × 30) */
{const m=grid(40,30,'.');const M={title:'Hearthspire (the capital)',grid:m,marks:[],entry:[1,16]};
 m.box(0,0,40,30,'#');
 // gates: west (capital gate, R1), north (R5), east (R6), south (R4, the bun road)
 m.set(0,16,'G');m.set(9,0,'G');m.set(39,16,'G');m.set(20,29,'G');
 // the castle compound
 m.box(10,2,20,10,'K');m.rect(11,3,18,8,'k');m.rect(13,3,14,4,'B');m.set(20,6,'D');m.set(27,3,'t');m.set(27,4,'t');m.set(27,5,'t');
 m.rect(17,8,6,2,'N');m.set(20,11,'k');m.set(19,11,'k');m.set(14,9,'|');
 // streets: the main cross and the ring
 m.line(walk([[1,16],[38,16]]),'M');m.line(walk([[20,12],[20,28]]),'M');m.line(walk([[9,1],[9,13]]),'M');m.rect(15,13,11,7,'M');m.line(walk([[3,13],[36,13]]),'M');m.line(walk([[3,22],[36,22]]),'M');
 m.line(walk([[3,13],[3,26]]),'M');m.line(walk([[36,13],[36,26]]),'M');m.line(walk([[3,26],[36,26]]),'M');
 // the square
 m.rect(19,15,2,2,'F');m.set(16,18,'b');m.set(24,14,'o');
 // buildings with doors on a street
 const house=(x,y,w,h,dx,dy)=>{m.rect(x,y,w,h,'B');m.set(dx,dy,'D')};
 house(5,18,6,4,8,21);   // the bakery (Mallow), door south onto the street at y 22? (door tile is part of the wall row)
 m.set(11,19,'h');      // the bakery's cellar hatch (shown in the tutorial; the flour tunnel)
 house(28,18,6,4,30,21); // the inn
 house(28,23,6,3,30,23); // the shop
 house(5,23,6,3,7,23);   // the smithy
 house(13,23,4,3,14,23); // the moon shrine
 house(31,4,5,4,33,7);   // the barracks
 house(4,4,5,4,6,7);house(23,23,4,3,24,23);house(4,9,4,3,5,11);house(33,9,4,3,34,11);   // houses
 // gardens and trees
 for(const [x,y] of [[2,2],[3,3],[37,2],[36,3],[2,27],[37,27],[12,27],[27,27],[2,20],[37,20],[16,27],[24,27]])m.set(x,y,'T');
 m.set(2,15,'o');m.set(37,15,'o');m.set(8,1,'o');m.set(21,28,'o');   // signs at the gates
 for(const [x,y,l] of [[8,21,'bakery (Mallow)'],[11,19,'cellar hatch (flour tunnel)'],[30,21,'inn (rest, roster, campfire chats)'],[30,23,'shop (tier 1)'],[7,23,'smithy'],[14,23,'moon shrine (talent reset)'],[33,7,'barracks'],[20,6,'castle hall (the mural)'],[27,5,'the tower (the tower fire)'],[19,9,'the Great Nest'],[14,9,'the throne (act 2)'],[19,15,'fountain'],[16,18,'Bib\'s bench'],[24,14,'market and note board'],[0,16,'the capital gate → R1'],[9,0,'north gate → R5'],[39,16,'east gate → R6'],[20,29,'south gate → R4']])mark(M,x,y,l);
 M.notes='No random fights. Set-piece fights: the cellar (rats), the yard drill (recruits), the gate. Players meet at the fountain square.';
 MAPS.hearthspire=M}

/* ================================================================== R1: the capital gate → Pebblebrook (100 × 26), 120 steps */
{const m=grid(100,26,'.');const M={title:'R1 (the capital gate → Pebblebrook, 120 steps)',grid:m,marks:[],entry:[0,12]};
 for(let x=0;x<100;x++){m.set(x,0,'T');m.set(x,25,'T')}for(let y=0;y<26;y++){m.set(0,y,'T');m.set(99,y,'T')}
 m.set(0,12,'G');m.set(99,9,'G');
 // the road: winds north of the pond and over the brook; corners chosen so it is exactly 120 steps
 const road=walk([[0,12],[22,12],[22,7],[46,7],[46,16],[64,16],[64,9],[99,9]]);m.line(road,',');
 // the brook and its bridge
 for(let y=1;y<25;y++)m.set(55,y,'~');m.set(55,16,'=');
 // the pond, with a chest behind it (south of the road)
 m.rect(30,14,8,5,'~');m.set(33,20,'c');
 // tall grass, never within 10 steps of either end
 const ok=(x,y)=>{const i=road.findIndex(p=>p[0]===x&&p[1]===y);return true};
 for(const [x,y,w,h] of [[14,8,6,3],[24,9,5,4],[40,9,5,5],[48,10,6,3],[58,16,5,4],[68,10,8,3],[76,5,6,3],[84,11,5,3]])m.rect(x,y,w,h,'"');
 m.line(road,',');m.set(55,16,'=');
 // trees, rocks, the lookout hill, the raptor stable (mill road), the mill road sign
 for(const [x,y] of [[10,5],[11,4],[12,18],[27,4],[38,3],[43,20],[52,4],[60,21],[70,18],[80,16],[90,4],[92,15],[18,20],[8,16]])m.set(x,y,'T');
 m.rect(86,3,6,4,'B');m.set(88,6,'D');            // the raptor stable (shut until the first piece)
 m.set(13,11,'o');m.set(66,8,'o');m.set(95,8,'o');
 m.rect(72,19,3,2,'r');m.set(73,18,'c');           // the lookout's rocks and a chest
 for(const [x,y,l] of [[0,12,'the capital gate'],[99,9,'→ Pebblebrook (the mill road)'],[33,20,'chest behind the pond'],[73,18,'chest on the lookout'],[88,6,'raptor stable (shut until the first piece)'],[55,16,'the brook bridge'],[13,11,'sign: "PEBBLEBROOK 120 steps. Beetles."'],[66,8,'Grubb\'s toll sign'],[60,18,'the runaway goat\'s meadow']])mark(M,x,y,l);
 M.route={road,ends:10};
 M.notes='Grubb\'s toll (boss, L5) stands on the mill road at the Pebblebrook end, after the bridge. Encounters 3% a step on tall grass; none within 10 steps of either end.';
 MAPS.r1=M}

/* ================================================================== Pebblebrook (32 × 24) */
{const m=grid(32,24,'.');const M={title:'Pebblebrook',grid:m,marks:[],entry:[31,12]};
 m.box(0,0,32,24,'T');m.set(31,12,'G');m.set(14,23,'G');
 // the brook from the north, the dam and the mill
 for(let y=0;y<10;y++){m.set(6,y,'~');m.set(7,y,'~')}m.rect(3,2,4,3,'~');m.line(walk([[3,5],[8,5]]),'r');
 m.rect(8,6,5,4,'B');m.set(10,9,'D');m.set(8,10,'W');m.set(9,10,'W');
 // roads
 m.line(walk([[31,12],[3,12]]),',');m.line(walk([[14,12],[14,23]]),',');m.line(walk([[20,12],[20,3]]),',');m.line(walk([[10,12],[10,10]]),',');
 // the circle stones, the fountain
 for(const [x,y] of [[16,15],[18,14],[20,15],[20,17],[18,18],[16,17]])m.set(x,y,'O');m.rect(23,14,2,2,'F');
 // the mine's mouth (north), the inn, the shop, the houses
 m.rect(18,1,5,2,'r');m.set(20,2,',');m.set(20,1,'G');
 const house=(x,y,w,h,dx,dy)=>{m.rect(x,y,w,h,'B');m.set(dx,dy,'D')};
 house(24,7,5,4,26,11);house(24,17,5,3,26,17);house(4,14,5,3,6,14);house(9,17,4,3,10,17);house(26,2,4,3,27,5);
 // the Mossback farms (south-west)
 m.rect(2,19,9,3,'"');m.set(1,20,'.');
 m.set(29,12,'o');m.set(13,11,'o');
 for(const [x,y] of [[2,2],[29,21],[22,21],[30,3],[16,4],[12,2]])m.set(x,y,'T');
 m.set(5,10,'c');
 for(const [x,y,l] of [[31,12,'← R1 (the mill road)'],[14,23,'→ R2 (Sunhaven)'],[20,1,'the mine\'s mouth'],[10,9,'the mill (Ruddle; the loft)'],[8,10,'the mill wheel'],[4,5,'the dam'],[18,16,'the circle stones'],[23,14,'fountain'],[26,11,'inn'],[26,17,'shop (tier 2 from level 5) and smith'],[6,14,'Tansy\'s house'],[10,17,'the brothers\' house'],[27,5,'Old Marl\'s house'],[6,20,'the Mossback farms (seed swap)'],[5,10,'chest by the dam'],[29,12,'welcome sign']])mark(M,x,y,l);
 M.notes='Snipe\'s toll box sits by the mine\'s mouth until the twist. The circle is the meeting place; the note board is by the fountain.';
 MAPS.pebblebrook=M}

/* ================================================================== the mine: three floors (32 × 20 each) */
function mineFloor(n,build){const m=grid(32,20,'X');const M={title:`the mine, floor ${n}`,grid:m,marks:[],entry:null};build(m,M);MAPS['mine'+n]=M}
mineFloor(1,(m,M)=>{M.entry=[2,17];
 m.line(walk([[2,17],[2,10],[12,10],[12,5],[22,5],[22,9],[29,9],[29,3]]),'f');m.rect(1,15,3,4,'f');m.set(2,18,'u');
 m.line(walk([[12,10],[12,16],[26,16]]),'R');m.set(26,16,'x');   // Ore's stuck cart at the end of the rails
 m.rect(5,4,4,3,'f');m.line(walk([[8,5],[12,5]]),'f');m.set(5,4,'c');  // a side room with a chest (a dead end)
 m.rect(16,8,3,3,'f');m.line(walk([[18,9],[22,9]]),'f');
 m.set(29,2,'v');m.set(29,3,'f');
 for(const [x,y,l] of [[2,18,'up: the mine\'s mouth'],[26,16,'Ore\'s stuck cart (challenge step 1)'],[5,4,'chest'],[16,8,'Nugget, haggling over a lantern'],[29,2,'stairs down']])mark(M,x,y,l);
 M.stairs=[[2,18],[29,2]];M.notes='Copper beetles and scouts; Nugget joins here.'});
mineFloor(2,(m,M)=>{M.entry=[29,2];
 m.set(29,2,'u');m.line(walk([[29,3],[29,8],[20,8],[20,3],[10,3],[10,10],[4,10],[4,17]]),'d');
 m.rect(14,11,5,4,'f');m.set(16,13,'C');m.line(walk([[10,10],[10,13],[14,13]]),'d');   // the campfire, half-way
 m.rect(24,12,6,5,'d');m.line(walk([[29,8],[29,12]]),'d');m.set(28,16,'c');            // a dark dead end with a chest
 m.set(4,18,'v');m.set(4,17,'d');
 for(const [x,y,l] of [[29,2,'stairs up'],[16,13,'campfire (one free heal a visit)'],[28,16,'chest in the dark'],[4,18,'stairs down'],[20,5,'glow grubs light the dark tiles']])mark(M,x,y,l);
 M.stairs=[[29,2],[4,18]];M.notes='Unlit tiles (d): glow grubs light the area around them. The bounty: the Nettlenose scout leader.'});
mineFloor(3,(m,M)=>{M.entry=[4,1];
 m.set(4,1,'u');m.line(walk([[4,2],[4,8],[14,8],[14,4],[24,4],[24,12]]),'f');
 m.rect(20,12,9,6,'f');m.set(26,14,'P');m.set(21,13,'x');m.set(22,16,'c');   // Snipe's copper pile, his cart, a chest behind it
 m.rect(2,12,9,6,'w');m.line(walk([[6,8],[6,12]]),'f');m.set(5,15,'c');       // the flooded gallery (the hidden trial: Old Shellback)
 for(const [x,y,l] of [[4,1,'stairs up'],[24,15,'Snipe (boss, L8) on his copper cart'],[26,14,'the copper pile'],[22,16,'chest behind the cart'],[6,14,'the flooded gallery: Old Shellback (hidden trial)'],[5,15,'the trial\'s prize: the flour-dusted apron']])mark(M,x,y,l);
 M.stairs=[[4,1],[24,15]];M.notes='The end of the mine: Snipe, then back up to the circle.'});

/* ================================================================== rooms (the engine's room letters, plus new ones) */
const ROOMS={
 bakery:{title:'Mallow\'s bakery',rows:[
  'wwwwwwwwwwwww',
  'wnnqssqaaqqyw',
  'wqqqqqqqqqqqw',
  'w___qq___qqgw',
  'wqqqqqqqqqqqw',
  'wqzqlqqqzqlqw',
  'wqqqqqqqqqqqw',
  'wwwwwweewwwww'],marks:[['n','the old oven (breaks in the Ordeal)'],['g','the cellar door (the flour carts came in here)'],['a','flour sacks'],['_','the counter; the recipe book on it']]},
 cellar:{title:'the bakery cellar',rows:[
  'wwwwwwwwwwwww',
  'waaqqqqqqqaaw',
  'wqqqqqqqqqqqw',
  'wqqqqnqqqqqqw',
  'wqqqqqqqqqqgw',
  'waqqqqqqqqqqw',
  'wwwwwewwwwwww'],marks:[['g','the flour tunnel (sealed until after the Ordeal)'],['n','where Cinder rebuilds the oven frame (act 3)'],['e','up to the bakery']]},
 castle:{title:'the castle hall',rows:[
  'wwwwwwwwwwwwwwwww',
  'wmmmmmmmmmmmmmmmw',
  'wqqqqqqqqqqqqqqqw',
  'wyqqqqqq|qqqqqqyw',
  'wqqqqqqqqqqqqqqqw',
  'wqqyqqqqqqqqqyqqw',
  'wqqqqqqqqqqqqqqqw',
  'wwwwwwwweewwwwwww'],marks:[['m','the mural of "the dragon smiler" (a tube on a shoulder)'],['|','Snatchclaw\'s seat']]},
 inn:{title:'the Hearthspire inn',rows:[
  'wwwwwwwwwwwww',
  'wHqqqsssqqqow',
  'wqqq_____qqqw',
  'wqqqqqqqqqqow',
  'wlzlqqqqlzlqw',
  'wqqqqqqqqqqyw',
  'wpqpqqqqqpqpw',
  'wwwwwweewwwww'],marks:[['H','the hearth: campfire chats'],['p','beds (rest)'],['o','the roster board']]},
 loft:{title:'the mill loft (Pebblebrook)',rows:[
  'wwwwwwwwwww',
  'waaqqqqqaaw',
  'wqqqqcqqqqw',
  'wqaqqqqqqqw',
  'wqqqqqqqaqw',
  'wwwwweewwww'],marks:[['c','the old vote bag (with a hole in it)'],['a','flour sacks']]},
};
const ROOM_SOLID=['w','n','s','m','p','l','z','y','c','a','_','H','|','o'];

/* ------------------------------------------------------------------ checks */
const problems=[];const report=[];
for(const [k,M] of Object.entries(MAPS)){const D=bfs(M.grid,...M.entry);
  for(const [x,y,l] of M.marks){const c=M.grid.get(x,y);let ok=D.has(x+','+y);
    if(!ok)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(D.has((x+dx)+','+(y+dy)))ok=true;   // a solid mark is reached by standing next to it
    if(!ok)problems.push(`${k}: "${l}" at ${x},${y} cannot be reached`)}
  if(M.stairs){const [a,b]=M.stairs;const Da=bfs(M.grid,...a);let d=Da.get(b[0]+','+b[1]);if(d===undefined)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const v=Da.get((b[0]+dx)+','+(b[1]+dy));if(v!==undefined)d=v+1}
    report.push(`${k}: stairs to stairs ${d} steps (plan: about 45)`);if(d===undefined||d<30||d>60)problems.push(`${k}: stairs to stairs is ${d} steps`)}
  if(M.route){const L=M.route.road.length-1;report.push(`${k}: the road is ${L} steps (plan: 120)`);if(L!==120)problems.push(`${k}: road is ${L} steps, not 120`);
    const near=M.route.road.filter((p,i)=>i<=10||i>=L-10);for(const [x,y] of near)for(const [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(M.grid.get(x+dx,y+dy)==='"')problems.push(`${k}: tall grass within 10 steps of an end at ${x+dx},${y+dy}`)}}
for(const [k,R] of Object.entries(ROOMS)){const w=R.rows[0].length;R.rows.forEach((r,i)=>{if(r.length!==w)problems.push(`room ${k}: row ${i} is ${r.length} wide, not ${w}`)});
  if(!R.rows.some(r=>r.includes('e')))problems.push(`room ${k}: no way out`)}

/* ------------------------------------------------------------------ write: text maps, data, previews */
function pngWrite(file,w,h,px){const CRC=(()=>{const t=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c}return t})();
  const crc=b=>{let c=-1;for(const x of b)c=CRC[(c^x)&255]^(c>>>8);return(c^-1)>>>0};const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])};
  const raw=Buffer.alloc((w*3+1)*h);for(let y=0;y<h;y++){raw[y*(w*3+1)]=0;px.copy(raw,y*(w*3+1)+1,y*w*3,(y+1)*w*3)}const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=2;
  fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',zlib.deflateSync(raw)),ch('IEND',Buffer.alloc(0))]))}
const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const ROOMCOL={w:'#4d3f57',e:'#ffd54a',q:'#c9a36a'};
function render(file,rows,legend,markSet,scale){const h=rows.length,w=rows[0].length,W=w*scale,H=h*scale,px=Buffer.alloc(W*H*3);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ch=rows[y][x];const col=hex((legend(ch))||'#ff00ff');
    for(let j=0;j<scale;j++)for(let i=0;i<scale;i++){const o=((y*scale+j)*W+(x*scale+i))*3;const edge=(i===0||j===0);px[o]=edge?col[0]*0.85:col[0];px[o+1]=edge?col[1]*0.85:col[1];px[o+2]=edge?col[2]*0.85:col[2]}}
  for(const [x,y] of markSet){for(let j=Math.floor(scale*0.3);j<Math.ceil(scale*0.7);j++)for(let i=Math.floor(scale*0.3);i<Math.ceil(scale*0.7);i++){const o=((y*scale+j)*W+(x*scale+i))*3;px[o]=20;px[o+1]=10;px[o+2]=53}}
  pngWrite(file,W,H,px)}
const legendTxt=used=>[...used].filter(c=>T[c]).map(c=>`\`${c}\` ${T[c][0]}${T[c][2]?' (solid)':''}`).join(' · ');
const data={maps:{},rooms:{}};let all='';
for(const [k,M] of Object.entries(MAPS)){const rows=M.grid.rows();const used=new Set(rows.join(''));
  let txt=`# ${M.title}  (${M.grid.w} × ${M.grid.h} tiles)\n# legend: ${[...used].filter(c=>T[c]).map(c=>c+' '+T[c][0]).join(', ')}\n\n${rows.join('\n')}\n\n# marks (x, y: what)\n${M.marks.map(([x,y,l])=>`${x}, ${y}: ${l}`).join('\n')}\n\n# ${M.notes||''}\n`;
  fs.writeFileSync(path.join(OUT,k+'.txt'),txt);render(path.join(OUT,k+'.png'),rows,c=>T[c]&&T[c][1],M.marks.map(m=>[m[0],m[1]]),k==='r1'?8:14);
  data.maps[k]={title:M.title,w:M.grid.w,h:M.grid.h,rows,marks:M.marks,entry:M.entry,notes:M.notes||''};
  all+=`## ${M.title}\n\n![${k}](${k}.png)\n\n${legendTxt(used)}\n\n${M.notes||''}\n\n| x, y | what |\n|---|---|\n${M.marks.map(([x,y,l])=>`| ${x}, ${y} | ${l} |`).join('\n')}\n\n`}
for(const [k,R] of Object.entries(ROOMS)){fs.writeFileSync(path.join(OUT,'room-'+k+'.txt'),`# ${R.title}\n\n${R.rows.join('\n')}\n\n# ${R.marks.map(([c,l])=>c+' '+l).join('; ')}\n`);
  render(path.join(OUT,'room-'+k+'.png'),R.rows,c=>ROOMCOL[c]||(T[c]&&T[c][1]),[],18);data.rooms[k]={title:R.title,rows:R.rows,marks:R.marks,solid:ROOM_SOLID};
  all+=`### Room: ${R.title}\n\n![${k}](room-${k}.png)\n\n\`\`\`\n${R.rows.join('\n')}\n\`\`\`\n\n${R.marks.map(([c,l])=>`\`${c}\` ${l}`).join(' · ')}\n\n`}
fs.writeFileSync(path.join(OUT,'slice.json'),JSON.stringify(data,null,1));
fs.writeFileSync(path.join(OUT,'README.md'),`# The slice's maps (22 Oct 2026)

*Generated by \`node tools/slicemaps.js\`: change the maps there, not here. Each map is rows of letters, one letter per 32 × 32 tile,
the engine's format (\`src/data/places.js\`). The \`.txt\` files are the maps with their marks; \`slice.json\` is the same as data for the
slice to load; the \`.png\` files are previews (one square a tile; a dark dot is a mark). Checks run every time: every door, exit and
mark can be reached; R1 is exactly 120 steps with no encounter grass within 10 steps of either end; each mine floor is about 45
steps stair to stair.*

**Checks:** ${problems.length?'**problems:** '+problems.join('; '):'all pass'}. ${report.join('; ')}.

${all}`);
console.log(problems.length?'PROBLEMS:\n'+problems.join('\n'):'all checks pass');console.log(report.join('\n'));
