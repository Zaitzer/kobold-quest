/* The world: towns joined by routes like a handheld adventure's region. The old valley is untouched, every town, route
   and door can be walked to from Burrowhome, every route has a sign at each end, and it is quick to build. */
const G=require('../lib/game.js')();let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
G.rp.s=G.rpNewState();Object.assign(G.rp.s.q,{bc:1,fw:3,lantern:1});/* the story's barriers open (hatching.test.js checks them) */const t0=Date.now();G.rpApplyWorld();const ms=Date.now()-t0;const g=G.rp.grid;
if(g.length!==G.WH||g[0].length!==G.WW)bad('world is '+g[0].length+'×'+g.length);
const old=G.rpBuildWorld();G.rpWorldExtras(old);
for(let y=0;y<G.OLD_H;y++)for(let x=0;x<G.OLD_W;x++)if(g[y][x]!==old[y][x])bad('old valley changed at '+x+','+y);
for(let y=0;y<g.length;y++)for(let x=0;x<g[y].length;x++)if(g[y][x]===undefined||g[y][x]==='o'){bad('hole at '+x+','+y);y=1e9;break}
// walk everywhere you can from the start
const W=G.WW,H=G.WH,seen=new Uint8Array(W*H),q=new Int32Array(W*H);let h=0,tl=0;q[tl++]=23*W+7;seen[23*W+7]=1;
while(h<tl){const i=q[h++],x=i%W,y=(i/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(seen[j])continue;const c=g[ny][nx];if(G.RP_SOLID.has(c)||c==='d')continue;seen[j]=1;q[tl++]=j}}
const S=G.sites();if(S.length!==11)bad('expected 10 towns + Burrowhome, got '+S.length);
for(const s of S)if(!seen[s.y*W+s.x])bad('cannot walk to '+s.name+' at '+s.x+','+s.y);
// nothing walkable is cut off
let cut=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=g[y][x];if(!G.RP_SOLID.has(c)&&c!=="d"&&!seen[y*W+x]&&!(x<G.OLD_W&&y<G.OLD_H))cut++}if(cut)bad(cut+' walkable tiles cannot be reached');
// every door can be walked up to, and leads to a room
for(const [pos,id] of Object.entries(G.RP_DOORS)){const [x,y]=pos.split(',').map(Number);if(!seen[(y+1)*W+x])bad('door '+pos+' ('+id+') cannot be reached');if(!G.RP_PLACES[id])bad('door '+pos+' has no room')}
// every route block has ground you can stand on, and each route is named and has a sign where it meets a town
const R=G.nameRoutes();for(const rt of R.list){for(const [c,r] of rt.cells){let any=false;for(let y=r*G.CELL;y<r*G.CELL+G.CELL&&!any;y++)for(let x=c*G.CELL;x<c*G.CELL+G.CELL;x++)if(seen[y*W+x]){any=true;break}if(!any)bad(rt.name+' block '+c+','+r+' cannot be reached')}
  if(rt.ends.length<2)bad(rt.name+' leads nowhere: '+rt.ends.join(','))}
const signs=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]==='i'){signs.push([x,y]);if(!G.regionSign(x,y)&&!G.VALLEY_SIGNS[x+','+y])bad('sign at '+x+','+y+' says nothing')}
for(const rt of R.list)if(!signs.some(([x,y])=>(G.regionSign(x,y)||'').startsWith(rt.name+' ')))bad(rt.name+' has no sign');
// the top bar names where you are
if(G.overworldArea(S[4].x,S[4].y)!==S[4].name)bad('top bar in '+S[4].name+' says '+G.overworldArea(S[4].x,S[4].y));
if(G.overworldArea(44,24)!=='Route 1')bad('just outside the valley should be Route 1, is '+G.overworldArea(44,24));
// a save standing inside what is now a wall is brought home
G.rp.s=G.rpNewState();G.rpApplyWorld();G.rp.s.x=900;G.rp.s.y=700;G.emit('game:start');if(G.rp.s.x!==7||G.rp.s.y!==23)bad('lost save not brought home: '+G.rp.s.x+','+G.rp.s.y);
// drink from a fountain
G.rp.s.party[0].hp=1;const f=S[1];G.tiles.O.use(f.x,f.y-1);if(G.rp.s.party[0].hp<=1)bad('fountain did not heal');
const counts={};for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2){const c=g[y][x];counts[c]=(counts[c]||0)+1}
console.log((fails?'FAIL':'ok')+' overworld: '+W+'×'+H+', '+S.length+' towns, '+R.list.length+' routes, '+Object.keys(G.RP_DOORS).length+' doors, '+Math.round(tl/(W*H)*100)+'% walkable, built in '+ms+'ms');
console.log('routes:',R.list.map(r=>r.name+' '+r.ends.join('–')).join(' · '));
process.exitCode=fails?1:0;
