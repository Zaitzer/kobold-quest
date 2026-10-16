/* The world, laid out like a handheld adventure's region: towns joined by routes, each route its own strip of land
   (grassy, forest, desert, mountain, snow, swamp, beach, a cave, bridges over the sea), walled in by forest, cliffs or sea.
   Burrowhome and its valley (the old 40 × 30 map) sit in the north-west corner unchanged.

   REGION is the plan, one letter per 10 × 10 block of tiles:
     walls     .  forest     ^  cliffs     ~  sea     *  snowy peaks
     routes    g  grassy     f  forest     d  desert  m  mountain path  s  snow   k  swamp   b  beach   c  cave   =  bridge
     towns     A-J (see TOWNS)            o  the old valley
   Every route block gets a guaranteed path through its middle to each open neighbour; anything you could not walk to
   is filled in, so the whole world is one piece. Routes are numbered in the order you reach them from Burrowhome.
   Town houses lead into rooms made here (RP_PLACES / RP_DOORS), so every door opens. */
import {RP_DOORS,RP_PLACES} from './places.js';

const CELL=10,SEED=4207,OLD_W=40,OLD_H=30;
const REGION=[
  'oooo.........^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^************',
  'oooo..ggg.AAA^^gggg^^^^^^^^^^^^^^^^^^^^^^^^^^^^^************',
  'ooooggggggAAAggggggggmm^^^^^^^^^^^^^^^mmm^^^^^^^sss*HHH*****',
  'ff...ggg..AAA^^^^^^^^mm^^^^^^^^^^^mmmmmmmmmmGGGsssssHHH*****',
  'ff.........g.^^^^^^^^mmmmmEEE^^^^^mm^^^^^^^^GGG^*ss*HHH*****',
  'ffff.......g.^^^^^^^^mmmmmEEEmmmmmmm^^^^^^^^GGG^*ss*********',
  'ffff......ggg^^^^^^^^^^^^^EEE^^^^^^^^^^^mmmmm^^^************',
  'ffff......ggg^^^^^^^^^^^^^^c^^^^^^^^^^^dd^dd^^^^************',
  'ffff......ggg^^^^^^^^^^^^^^c^^^^^^^^^^^dd^dd^^^^************',
  'ff.........ggggggg^^^^^^^^^c^^^^^^^^^^^dd^^^^^^^.......~~~~~',
  'ff.........ggggggg.........c.^^^^^^^^^FFF^^............~~~~~',
  '.BBB.............g.........c.^^^^^^^^^FFF^^............~~~~~',
  '.BBB.............g.........c.^^^^^ddddFFF^^............~~~~~',
  '.BBBggggggggkk...g.ggg.....c.^^^dddddd^^^^^............~~~~~',
  '..ff...gggg.kk...ggggggg...c.^ddddd^^^^^^^^............~~~~~',
  '..ff...gggg.kk....ggggggDDDDDdddddd^^^^^^^^............~~~~~',
  '..ff........kk..........DDDDD^^^^^^^^^^^^^^............~~~~~',
  '..ff........kk.kkkk.....DDDDD^^^^^^^^^^^^^^............~~~~~',
  '..ff........kk.kkkk.....DDDDDgggggggggggg..............~~~~~',
  '..ff........kkkkkkkkkkkkDDDDDgggggggggggggggg..........~~~~~',
  '..ff......................g..............ggggbbb~~~~~~~~~~~~',
  '..ff......................g..................bbb~~~~~~~~~~~~',
  '..fggg....................g..................bbb~~~~~~~~~~~~',
  '...ggg....................g....~~~~~~~~~~~~~~bbb~~~~~~~~~~~~',
  '...ggg...................kkk...~~~~~~~~~~~~~~bbb~~~~~~~~~~~~',
  '...ggg...................kkk...~~~~~~~~~~~~~~bbb~~~~~~~~~~~~',
  '...gggggg................kkk...~~~~~~~~~~~~~~bbb~~~~~~~~~~~~',
  '.....gggg..............kkk.....~~~~~~~~~~~~~~bbb~~~~~~~~~~~~',
  '.....gggg..............kkk.....~~~~~~~~~~~~~~bbbbbb~~~~~~~~~',
  '........gg............kk.......~~~~~~~~~~~~~~~~~bbb~~~~~~~~~',
  '........CCCC........III........~~~~~~~~~~~~~~~~~~~JJJJ~~~~~~',
  '........CCCCbbbbbbbbIIIbbbbbbbb~~~~~~~~~~bb~~~~~~~JJJJ~~~~~~',
  '........CCCCbbbbbbbbIIIbbbbbbbb==========bb=======JJJJ~~~~~~',
  '~~~~~~~~CCCC~~~~~~~~~~~~~~~~~~~~~~~~~~~~~bb~~~~~~~JJJJ~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'];
const WW=REGION[0].length*CELL,WH=REGION.length*CELL;
/* towns: name and look. ground = what you walk on, wall = the ring round the town, deco = the odd tree or rock */
const TOWNS={
  A:{name:'Pebblebrook',ground:'.',wall:'T',deco:'T',houses:4,gardens:2},
  B:{name:'Mossmere',ground:'.',wall:'T',deco:'T',houses:4,decoRate:.07},
  C:{name:'Saltspray',ground:'.',wall:'T',deco:'T',houses:5,coast:true},
  D:{name:'Thistledown',ground:'.',wall:'T',deco:'T',houses:9,market:true,gardens:1},
  E:{name:'Copperhollow',ground:'u',wall:'#',deco:'#',houses:4},
  F:{name:'Sunhaven',ground:'z',wall:'#',deco:'q',houses:4,pond:true},
  G:{name:'Emberreach',ground:'u',wall:'#',deco:'#',houses:4},
  H:{name:'Frostwick',ground:'v',wall:'P',deco:'P',houses:4},
  I:{name:'Glimmerfen',ground:'.',wall:'T',deco:'~',houses:4,pond:true},
  J:{name:'Brindlecove',ground:'z',wall:'~',deco:'T',houses:5}};
/* routes: the ground, what a solid edge or clump is made of, and how the land inside is grown */
const ROUTES={
  g:{name:'',floor:'.',wall:'T'},f:{name:'woods',floor:';',wall:'T'},d:{name:'desert',floor:'z',wall:'#'},m:{name:'pass',floor:'u',wall:'#'},
  s:{name:'snowfield',floor:'v',wall:'P'},k:{name:'marsh',floor:'.',wall:'T'},b:{name:'shore',floor:'z',wall:'#'},c:{name:'tunnel',floor:'C',wall:'#'},
  '=':{name:'bridge',floor:'~',wall:'~'}};
const SOLID_HERE=new Set(['T','#','~','P','q','H','d','i','n','O','M','W','X','S','N','A']);

function hash2(x,y,s){let h=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1442695041)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296}
function vnoise(x,y,scale,s){const X=x/scale,Y=y/scale,x0=Math.floor(X),y0=Math.floor(Y),fx=X-x0,fy=Y-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=hash2(x0,y0,s),b=hash2(x0+1,y0,s),c=hash2(x0,y0+1,s),d=hash2(x0+1,y0+1,s);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
const cellAt=(c,r)=>(REGION[r]&&REGION[r][c])||'.';
const isTown=ch=>ch>='A'&&ch<='J',isRoute=ch=>!!ROUTES[ch],isOpen=ch=>isTown(ch)||isRoute(ch)||ch==='o';
function voidTile(ch,x,y){return ch==='^'?'#':ch==='~'?'~':ch==='*'?(hash2(x,y,SEED+3)<.55?'P':'#'):'T'}
/* the land inside a route block, before edges and paths */
function routeTile(k,x,y){const r=hash2(x,y,SEED+20),n=(sc,s)=>vnoise(x,y,sc,SEED+s);
  switch(k){
    case 'g':if(n(7,3)>.8)return'~';if(n(4,2)>.74)return'T';if(n(5,1)>.56)return',';return r<.03?'F':'.';
    case 'f':if(n(3,4)>.56)return'T';if(r<.015)return'F';return';';
    case 'd':if(n(4,5)>.76)return'#';return r<.03?'q':'z';
    case 'm':if(n(3,6)>.66)return'#';if(n(6,7)>.66)return',';return'u';
    case 's':if(n(3,8)>.62)return'P';return'v';
    case 'b':return r<.02?'#':r<.035?'T':'z';
    case 'k':if(n(4,9)>.62)return'~';if(n(5,10)>.5)return',';return r<.04?'T':'.';
    case 'c':return n(3,11)>.6?'#':'C';
    default:return'~'}}
/* the old valley's two ways out, and where a route block's path ends for each side */
const VALLEY_EXITS=[{x:40,y:22},{x:4,y:30}];

let BUILT=null;
function build(){if(BUILT)return BUILT;
  const G=[];for(let y=0;y<WH;y++)G.push(new Array(WW));
  const signs={},towns=[],houses=[];
  const C=REGION[0].length,Rn=REGION.length;
  /* 1. fill every block */
  for(let r=0;r<Rn;r++)for(let c=0;c<C;c++){const ch=cellAt(c,r);
    for(let y=r*CELL;y<r*CELL+CELL;y++)for(let x=c*CELL;x<c*CELL+CELL;x++)
      G[y][x]=ch==='o'?'o':isRoute(ch)?routeTile(ch,x,y):isTown(ch)?TOWNS[ch].ground:voidTile(ch,x,y)}
  /* 2. ragged edges where a route meets a wall */
  for(let r=0;r<Rn;r++)for(let c=0;c<C;c++){const ch=cellAt(c,r);if(!isRoute(ch)||ch==='=')continue;
    for(let ly=0;ly<CELL;ly++)for(let lx=0;lx<CELL;lx++){const x=c*CELL+lx,y=r*CELL+ly,depth=1+Math.floor(vnoise(x,y,3,SEED+12)*2.6);
      for(const [dc,dr] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){const nb=cellAt(c+dc,r+dr);if(isOpen(nb))continue;
        const dx=dc<0?lx:dc>0?CELL-1-lx:0,dy=dr<0?ly:dr>0?CELL-1-ly:0,dist=dc&&dr?Math.max(dx,dy):dc?dx:dy;
        if(dist<depth){G[y][x]=nb==='~'&&ch!=='c'?'~':ROUTES[ch].wall;break}}}}
  /* 3. a path through every route block to each open neighbour */
  const carve=(x,y,k,horiz)=>{if(x<0||y<0||x>=WW||y>=WH||G[y][x]==='o')return;
    if(k==='=')G[y][x]=horiz?'j':'b';else if(SOLID_HERE.has(G[y][x]))G[y][x]=ROUTES[k].floor};
  const line=(x0,y0,x1,y1,k)=>{const sx=Math.sign(x1-x0),sy=Math.sign(y1-y0);let x=x0,y=y0;
    while(x!==x1){carve(x,y,k,true);carve(x,y+1,k,true);x+=sx}
    while(y!==y1){carve(x,y,k,false);carve(x+1,y,k,false);y+=sy}carve(x,y,k,!sy);carve(x+1,y,k,!sy);carve(x,y+1,k,!sy);carve(x+1,y+1,k,!sy)};
  for(let r=0;r<Rn;r++)for(let c=0;c<C;c++){const ch=cellAt(c,r);if(!isRoute(ch))continue;const cx=c*CELL+4,cy=r*CELL+4;
    for(const [dc,dr] of [[-1,0],[1,0],[0,-1],[0,1]]){const nb=cellAt(c+dc,r+dr);if(!isOpen(nb))continue;
      if(nb==='o'){const e=VALLEY_EXITS.find(e=>Math.floor(e.x/CELL)===c&&Math.floor(e.y/CELL)===r);
        if(e){if(dc)line(e.x,e.y,cx,e.y,ch),line(cx,e.y,cx,cy,ch);else line(e.x,e.y,e.x,cy,ch),line(e.x,cy,cx,cy,ch)}continue}
      line(cx,cy,dc<0?c*CELL:dc>0?c*CELL+CELL-1:cx,dr<0?r*CELL:dr>0?r*CELL+CELL-1:cy,ch)}}
  /* 4. towns */
  const blocks={};for(let r=0;r<Rn;r++)for(let c=0;c<C;c++){const ch=cellAt(c,r);if(!isTown(ch))continue;const b=blocks[ch]||(blocks[ch]={c0:c,r0:r,c1:c,r1:r});b.c0=Math.min(b.c0,c);b.r0=Math.min(b.r0,r);b.c1=Math.max(b.c1,c);b.r1=Math.max(b.r1,r)}
  for(const L of Object.keys(TOWNS)){const b=blocks[L];if(!b)continue;towns.push(makeTown(G,L,b,signs,houses))}
  /* 5. the edge of the world */
  for(let y=0;y<WH;y++)for(let x=0;x<WW;x++)if((x===0||y===0||x===WW-1||y===WH-1)&&G[y][x]!=='o'&&!SOLID_HERE.has(G[y][x]))G[y][x]=wallOf(x,y);
  /* 6. route names, and signs at the valley's ways out */
  const routes=nameRoutes();
  VALLEY_EXITS.forEach((e,i)=>{const sx=i?e.x+2:e.x+1,sy=i?e.y+1:e.y-1;if(G[sy][sx]!=='o'){G[sy][sx]='i';signs[sx+','+sy]=signText(routes.of(Math.floor(e.x/CELL),Math.floor(e.y/CELL)),'Burrowhome')}});
  for(const t of towns)for(const o of t.openings){const rt=routes.of(o.nc,o.nr);if(G[o.sy]&&G[o.sy][o.sx]==='i')signs[o.sx+','+o.sy]=signText(rt,t.name)}
  /* 7. fill in anything you could not walk to */
  const seen=new Uint8Array(WW*WH),q=[];
  const walk=(x,y)=>x>=0&&y>=0&&x<WW&&y<WH&&G[y][x]!=='o'&&!SOLID_HERE.has(G[y][x]);
  for(const e of VALLEY_EXITS){const x=e.x,y=e.y;if(walk(x,y)){seen[y*WW+x]=1;q.push(y*WW+x)}}
  for(let h=0;h<q.length;h++){const i=q[h],x=i%WW,y=(i/WW)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!walk(nx,ny)||seen[ny*WW+nx])continue;seen[ny*WW+nx]=1;q.push(ny*WW+nx)}}
  for(let y=0;y<WH;y++)for(let x=0;x<WW;x++)if(!seen[y*WW+x]&&walk(x,y))G[y][x]=wallOf(x,y);
  return BUILT={G,signs,towns,houses,routes}}
function wallOf(x,y){const ch=cellAt(Math.floor(x/CELL),Math.floor(y/CELL));return isTown(ch)?(TOWNS[ch].wall==='~'?'T':TOWNS[ch].wall):isRoute(ch)?(ch==='='?'~':ROUTES[ch].wall):voidTile(ch,x,y)}
function signText(rt,from){if(!rt)return'The wilds.';const to=rt.ends.filter(n=>n!==from);return rt.name+(to.length?' · to '+to.join(' and '):'')}

/* routes: each connected run of route blocks is one route, numbered in the order you meet them walking out from Burrowhome */
function nameRoutes(){const C=REGION[0].length,Rn=REGION.length,id=new Map(),list=[];const key=(c,r)=>c+','+r;
  const nameOf=ch=>isTown(ch)?TOWNS[ch].name:'Burrowhome';
  const seen=new Set(['3,2','0,2']),q=[[3,2],[0,2]];  // the east road out of the valley is Route 1
  for(let h=0;h<q.length;h++){const [c,r]=q[h];
    for(const [dc,dr] of [[1,0],[0,1],[-1,0],[0,-1]]){const nc=c+dc,nr=r+dr,ch=cellAt(nc,nr);if(!isOpen(ch)||seen.has(key(nc,nr)))continue;
      if(isRoute(ch)&&!id.has(key(nc,nr))){const rt={name:'Route '+(list.length+1),ends:[],cells:[],kinds:{}};list.push(rt);
        const st=[[nc,nr]];id.set(key(nc,nr),rt);
        while(st.length){const [a,b]=st.pop();rt.cells.push([a,b]);rt.kinds[cellAt(a,b)]=(rt.kinds[cellAt(a,b)]||0)+1;
          for(const [ec,er] of [[1,0],[0,1],[-1,0],[0,-1]]){const xc=a+ec,xr=b+er,c2=cellAt(xc,xr);
            if(isRoute(c2)&&!id.has(key(xc,xr))){id.set(key(xc,xr),rt);st.push([xc,xr])}
            else if((isTown(c2)||c2==='o')&&!rt.ends.includes(nameOf(c2)))rt.ends.push(nameOf(c2))}}}
      seen.add(key(nc,nr));q.push([nc,nr])}}
  return{list,of:(c,r)=>id.get(key(c,r))||null}}

/* a town: a ring of wall with gaps where routes come in, roads to a square with a fountain, houses with doors */
function makeTown(G,L,b,signs,houses){const T=TOWNS[L],x0=b.c0*CELL,y0=b.r0*CELL,x1=b.c1*CELL+CELL-1,y1=b.r1*CELL+CELL-1;
  const cx=(x0+x1)>>1,cy=(y0+y1)>>1,s=SEED+L.charCodeAt(0)*31;
  const set=(x,y,c)=>{G[y][x]=c},get=(x,y)=>G[y][x],ground=T.ground;
  /* gaps: one per neighbouring route block, six tiles wide in its middle */
  const openings=[];
  const side=(nc,nr,horizEdge,ex,ey)=>{if(!isRoute(cellAt(nc,nr)))return;const o={nc,nr};
    if(horizEdge){o.a=nc*CELL+2;o.b=nc*CELL+7;o.edge=ey;o.vert=true}else{o.a=nr*CELL+2;o.b=nr*CELL+7;o.edge=ex;o.vert=false}openings.push(o)};
  for(let c=b.c0;c<=b.c1;c++){side(c,b.r0-1,true,0,y0);side(c,b.r1+1,true,0,y1)}
  for(let r=b.r0;r<=b.r1;r++){side(b.c0-1,r,false,x0,0);side(b.c1+1,r,false,x1,0)}
  const inGap=(x,y)=>openings.some(o=>o.vert?(x>=o.a&&x<=o.b&&Math.abs(y-o.edge)<=2):(y>=o.a&&y<=o.b&&Math.abs(x-o.edge)<=2));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const d=Math.min(x-x0,x1-x,y-y0,y1-y);set(x,y,d<2&&!inGap(x,y)?T.wall:ground)}
  /* the sea along the bottom of a harbour town, with a pier */
  if(T.coast){for(let y=y1-4;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,'~');for(let y=y1-5;y<=y1-1;y++){set(cx-1,y,'b');set(cx,y,'b')}}
  /* roads from each gap to the square */
  const road=(x,y)=>{if(get(x,y)===ground||get(x,y)===T.wall)set(x,y,'=')};
  for(const o of openings){const m=(o.a+o.b>>1);
    if(o.vert){const from=o.edge,dir=from<cy?1:-1;for(let y=from;y!==cy+dir;y+=dir){road(m,y);road(m+1,y)}for(let x=Math.min(m,cx);x<=Math.max(m,cx)+1;x++){road(x,cy);road(x,cy+1)}}
    else{const from=o.edge,dir=from<cx?1:-1;for(let x=from;x!==cx+dir;x+=dir){road(x,m);road(x,m+1)}for(let y=Math.min(m,cy);y<=Math.max(m,cy)+1;y++){road(cx,y);road(cx+1,y)}}}
  /* the square, its fountain (drink to heal) and the town's sign */
  const pw=T.market?6:4;for(let y=cy-3;y<=cy+3;y++)for(let x=cx-pw;x<=cx+pw+1;x++)if(get(x,y)===ground)set(x,y,'=');
  if(T.pond)for(let y=cy-3;y<=cy-2;y++)for(let x=cx-1;x<=cx+2;x++)set(x,y,'~');
  set(cx,cy-1,'O');set(cx-pw,cy-3,'i');signs[(cx-pw)+','+(cy-3)]='Welcome to '+T.name+'!';
  if(T.market)set(cx+pw+1,cy-3,'M');
  /* a sign just inside each gap */
  for(const o of openings){let sx,sy;if(o.vert){sx=o.a;sy=o.edge<cy?y0+2:y1-2}else{sy=o.a;sx=o.edge<cx?x0+2:x1-2}
    if(get(sx,sy)===ground){set(sx,sy,'i');o.sx=sx;o.sy=sy}}
  /* houses (the first is the town's lodge) and fenced gardens, each with a free ring round it */
  const free=(ax,ay,w,h)=>{for(let y=ay-1;y<=ay+h+1;y++)for(let x=ax-1;x<=ax+w;x++){if(x<x0+2||y<y0+2||x>x1-2||y>y1-2)return false;if(get(x,y)!==ground)return false}return true};
  const spots=[];for(let y=y0+3;y<=y1-6;y++)for(let x=x0+3;x<=x1-7;x++)spots.push([x,y,hash2(x,y,s)]);spots.sort((a,b)=>a[2]-b[2]);
  let n=0,gardens=0;const want=T.houses+(T.gardens||0);
  for(const [x,y] of spots){if(n+gardens>=want)break;
    const garden=gardens<(T.gardens||0)&&n>=2,lodge=n===0&&!garden,w=garden?6:lodge?6:4+(hash2(x,y,s+1)<.4?1:0),h=garden?4:lodge?4:3;
    if(!free(x,y,w,h))continue;
    if(garden){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const edge=yy===y||yy===y+h-1||xx===x||xx===x+w-1;set(xx,yy,edge?'n':'F')}set(x+(w>>1),y+h-1,'F');gardens++;continue}
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)set(xx,yy,'H');const dx=x+(w>>1)-(lodge?1:0),dy=y+h-1;set(dx,dy,'d');
    const id='h'+L+n;RP_PLACES[id]={name:lodge?T.name+' lodge':'A house in '+T.name,rows:lodge?LODGE:COTTAGES[n%COTTAGES.length]};RP_DOORS[dx+','+dy]=id;houses.push({id,x:dx,y:dy,town:T.name});
    /* a path from the door to the nearest road below */
    {let yy=dy+1,ok=false;for(;yy<=dy+8;yy++){const t=get(dx,yy);if(t==='='){ok=true;break}if(t!==ground)break}if(ok)for(let k=dy+1;k<yy;k++)set(dx,k,'=')}
    n++}
  /* flowers everywhere, and a tree or rock where it can't wall anything in */
  for(let y=y0+2;y<=y1-2;y++)for(let x=x0+2;x<=x1-2;x++){if(get(x,y)!==ground)continue;const r=hash2(x,y,s+5);
    if(r<(T.decoRate||.025)){let ok=true;for(let dy=-1;dy<=1&&ok;dy++)for(let dx=-1;dx<=1;dx++){const t=get(x+dx,y+dy);if((dx||dy)&&SOLID_HERE.has(t)){ok=false;break}}if(ok)set(x,y,T.deco)}
    else if(r<(T.decoRate||.025)+.035&&ground==='.')set(x,y,'F')}
  return{L,name:T.name,x:cx,y:cy,openings}}

/* rooms behind town doors */
const COTTAGES=[
  ['wwwwwwwww','whffsffpw','wffffffpw','wfftlfffw','wyffrrffw','wffffffow','wwwwewwww'],
  ['wwwwwwwwwww','wpfsssffhfw','wpfffffffyw','wfffftffffw','wffflflfffw','wofrrrrrfow','wwwwwewwwww'],
  ['wwwwwwwwww','wssffffxfw','wffffffffw','wfltlffoow','wffffffffw','wyfrrrrffw','wwwwewwwww']];
const LODGE=['wwwwwwwwwwwww','whfffsssfffow','wfffkkkkkfffw','wffffffffffow','wltlffffltlfw','wffffffffffyw','wffrrrrrrrffw','wffffffffffyw','wwwwwwewwwwww'];

/* Barriers laid across a route until the story clears them (game/world.js lays them; `until` is a rule condition).
   Each rect cuts its route from wall to wall; test/logic/hatching.test.js checks that. */
const BARRIERS=[
  {id:'toll4',tile:'Y',x0:110,x1:119,y0:55,y1:55,until:{bc:1},route:'Route 4'},
  {id:'toll6',tile:'Y',x0:55,x1:55,y0:130,y1:139,until:{bc:1},route:'Route 6'},
  {id:'toll5',tile:'Y',x0:20,x1:39,y0:155,y1:155,until:{bc:1},route:'Route 5'},
  {id:'toll12',tile:'Y',x0:305,x1:305,y0:180,y1:199,until:{bc:1},route:'Route 12'},
  {id:'slide7',tile:'R',x0:315,x1:315,y0:50,y1:59,until:{fw:3},route:'Route 7'},
  {id:'dark8',tile:'Z',x0:270,x1:279,y0:85,y1:85,until:{lantern:1},route:'Route 8'}];
/* a spot near a town's square (dx, dy from the middle of the square), for villagers */
function townSpot(L,dx,dy){const t=build().towns.find(t=>t.L===L);return{x:t.x+dx,y:t.y+dy}}
/* the name for the top bar */
function overworldArea(x,y){const B=build(),c=Math.floor(x/CELL),r=Math.floor(y/CELL),ch=cellAt(c,r);
  if(isTown(ch))return TOWNS[ch].name;const rt=B.routes.of(c,r);return rt?rt.name:'The wilds'}
/* Burrowhome and every town's square, for tests and travel */
function sites(){return[{name:'Burrowhome',x:7,y:23,home:true}].concat(build().towns.map(t=>({name:t.name,x:t.x,y:t.y})))}
function regionSign(x,y){return build().signs[x+','+y]||null}
/* the whole world as a grid; the old valley comes from rpBuildWorld (it changes as you play, so it is passed in) */
function makeWorldGrid(oldRows){const B=build(),rows=new Array(WH);
  for(let y=0;y<WH;y++){const r=B.G[y].slice();if(y<OLD_H)for(let x=0;x<OLD_W;x++)r[x]=oldRows[y][x];rows[y]=r}
  return rows}
build();
export {BARRIERS,BUILT,CELL,COTTAGES,LODGE,OLD_H,OLD_W,REGION,ROUTES,SEED,SOLID_HERE,TOWNS,VALLEY_EXITS,WH,WW,build,cellAt,hash2,isOpen,isRoute,isTown,makeTown,makeWorldGrid,nameRoutes,overworldArea,regionSign,routeTile,signText,sites,townSpot,vnoise,voidTile,wallOf};
