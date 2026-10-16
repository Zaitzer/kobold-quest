/* The big world: 1280 × 960 tiles, about a thousand times the old map. Burrowhome and its valley (the old 40 × 30 map)
   sit in the north-west corner unchanged; everything else is grown from a seed: sea and beaches, hills and tall grass,
   forests, deserts, mountains with snow, and empty town sites joined by roads. Towns are only clearings for now,
   waiting for content.
   Nothing is stored: a row of tiles is worked out the first time anything looks at it. */
const WW=1280,WH=960,SEED=4207;
const OLD_W=40,OLD_H=30;
function hash2(x,y,s){let h=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1442695041)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296}
function vnoise(x,y,scale,s){const X=x/scale,Y=y/scale,x0=Math.floor(X),y0=Math.floor(Y),fx=X-x0,fy=Y-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=hash2(x0,y0,s),b=hash2(x0+1,y0,s),c=hash2(x0,y0+1,s),d=hash2(x0+1,y0+1,s);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
/* height: high in the middle of the land, sea round the edges; the corner around Burrowhome is always dry land */
function height(x,y){let e=vnoise(x,y,170,SEED)*.55+vnoise(x,y,64,SEED+1)*.3+vnoise(x,y,20,SEED+2)*.15;
  /* the sea is to the east and south; the north and west edges are a mountain wall (see baseTile), like the old valley's rim */
  const edge=Math.min(WW-1-x,WH-1-y)/110;e=e*.82+.2*Math.min(1,edge)-(edge<1?(1-edge)*.32:0);
  const home=Math.hypot(x-20,y-15);if(home<120)e=Math.max(e,.46+.04*(1-home/120));return e}
function wetness(x,y){return vnoise(x,y,140,SEED+7)*.7+vnoise(x,y,36,SEED+8)*.3}
const SEA=.385,SHORE=.405,PEAK=.665,SNOW=.735,DRY=.335,WET=.6;
/* the ground at a spot before roads and towns are laid on top */
function baseTile(x,y){if(x<5||y<5)return hash2(x,y,SEED+23)<.7?'#':'T';const e=height(x,y);
  if(e<SEA)return'~';if(e<SHORE)return'z';
  const r=hash2(x,y,SEED+20);
  if(e>SNOW)return r<.14?'P':'v';
  if(e>PEAK)return r<.25?'#':(vnoise(x,y,9,SEED+21)>.55?'#':',');
  const m=wetness(x,y);
  if(m<DRY)return r<.025?'q':'z';
  if(m>WET)return r<.48?'T':';';
  if(vnoise(x,y,14,SEED+22)>.63)return',';
  return r<.012?'F':'.'}
function biomeName(x,y){const e=height(x,y),m=wetness(x,y);
  if(e<SEA)return'Open Sea';if(e<SHORE)return'Sandy Shore';if(e>SNOW)return'Frostpeak';if(e>PEAK)return'Craggy Highlands';
  if(x<5||y<5)return'Rim Mountains';if(m<DRY)return'Sunscorch Desert';if(m>WET)return'Wildwood';return'Rolling Hills'}
/* town sites: spread out over dry land, far from each other (worked out once) */
const TOWN_NAMES=['Ashvale','Pebblebrook','Mossmere','Saltspray','Emberreach','Thistledown','Glimmerfen','Copperhollow','Brindlecove','Frostwick','Duskmoor','Sunhaven','Wyrmrest','Briarwatch','Larkspur','Gloomhollow'];
let SITES=null,OVERLAY=null;
function sites(){if(SITES)return SITES;const out=[{name:'Burrowhome',x:20,y:22,home:true}];let tries=0,i=0;
  while(out.length<TOWN_NAMES.length+1&&tries<20000){tries++;const x=30+Math.floor(hash2(tries,1,SEED+30)*(WW-60)),y=30+Math.floor(hash2(tries,2,SEED+30)*(WH-60));
    const e=height(x,y);if(e<SHORE+.03||e>PEAK-.03)continue;if(x<OLD_W+20&&y<OLD_H+20)continue;
    if(out.some(s=>Math.hypot(s.x-x,s.y-y)<150))continue;out.push({name:TOWN_NAMES[i++],x,y})}
  return SITES=out}
/* roads (a tree joining every town, plus a few extra loops), town clearings and the two ways out of the old valley */
function overlay(){if(OVERLAY)return OVERLAY;const O=new Map(),put=(x,y,c)=>{if(x<0||y<0||x>=WW||y>=WH)return;if(x<OLD_W&&y<OLD_H)return;O.set(y*WW+x,c)};
  const S=sites();
  const road=(x0,y0,x1,y1,salt)=>{let x=x0,y=y0,n=0;while((x!==x1||y!==y1)&&n++<6000){
      const dx=Math.sign(x1-x),dy=Math.sign(y1-y),wig=hash2(x,y,salt)<.25;
      if(dx&&(!dy||(Math.abs(x1-x)>Math.abs(y1-y))!==wig))x+=dx;else y+=dy;
      for(const [ox,oy] of [[0,0],[1,0],[0,1],[1,1]]){const b=baseTile(x+ox,y+oy);put(x+ox,y+oy,b==='~'?'b':'=')}}};
  // a tree of roads: every town joins the nearest one already joined
  const joined=[S[0]],rest=S.slice(1),edges=[];
  while(rest.length){let best=null;for(const a of joined)for(const b of rest){const d=Math.hypot(a.x-b.x,a.y-b.y);if(!best||d<best.d)best={a,b,d}}
    edges.push(best);joined.push(best.b);rest.splice(rest.indexOf(best.b),1)}
  // and a few loops so it's not all dead ends
  for(let i=1;i<S.length;i+=4){const a=S[i];let best=null;for(const b of S){if(b===a||edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))continue;const d=Math.hypot(a.x-b.x,a.y-b.y);if(!best||d<best.d)best={a,b,d}}if(best&&best.d<320)edges.push(best)}
  for(const e of edges){if(e.a.home){road(OLD_W,22,e.b.x,e.b.y,SEED+40)}else road(e.a.x,e.a.y,e.b.x,e.b.y,SEED+41+edges.indexOf(e))}
  // the south way out of the valley joins the nearest town too
  {let best=null;for(const b of S.slice(1)){const d=Math.hypot(b.x-4,b.y-OLD_H);if(!best||d<best.d)best={b,d}}road(4,OLD_H,best.b.x,best.b.y,SEED+60)}
  // town clearings: open ground in an oval with a ring of flowers
  for(const s of S){if(s.home)continue;for(let y=s.y-8;y<=s.y+8;y++)for(let x=s.x-12;x<=s.x+12;x++){const r=Math.hypot((x-s.x)/12,(y-s.y)/8);
      if(r<=.86)put(x,y,O.get(y*WW+x)==='='?'=':'.');else if(r<=1&&hash2(x,y,SEED+50)<.45)put(x,y,'F');else if(r<=1)put(x,y,'.')}}
  return OVERLAY=O}
/* the town or wild area a spot belongs to, for the top bar */
function overworldArea(x,y){let best=null;for(const s of sites()){const d=Math.hypot(s.x-x,s.y-y);if(!best||d<best.d)best={s,d}}
  if(best&&!best.s.home&&best.d<16)return best.s.name;const b=biomeName(x,y);return b}
/* the whole world as a grid that fills itself in row by row; the old valley comes from rpBuildWorld */
function makeWorldGrid(oldRows){const O=overlay(),rows=new Array(WH);
  const row=y=>{const r=new Array(WW);for(let x=0;x<WW;x++){if(y<OLD_H&&x<OLD_W){r[x]=oldRows[y][x];continue}const o=O.get(y*WW+x);r[x]=o||baseTile(x,y)}return r};
  return new Proxy(rows,{get(t,p){if(typeof p==='string'&&p.charCodeAt(0)>=48&&p.charCodeAt(0)<=57){const y=+p;if(y>=WH||y<0||!Number.isInteger(y))return undefined;return t[y]||(t[y]=row(y))}
    if(p==='length')return WH;return t[p]}})}
export {DRY,OLD_H,OLD_W,OVERLAY,PEAK,SEA,SEED,SHORE,SITES,SNOW,TOWN_NAMES,WET,WH,WW,baseTile,biomeName,hash2,height,makeWorldGrid,overlay,overworldArea,sites,vnoise,wetness};
