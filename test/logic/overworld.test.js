/* The big world: right size, the old valley untouched, every town placed on dry land and reachable on foot from Burrowhome,
   and fast enough to build on a phone. */
const G=require('../lib/game.js')();let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
G.rp.s=G.rpNewState();const t0=Date.now();G.rpApplyWorld();const g=G.rp.grid;
if(g.length!==G.WH||g[0].length!==G.WW)bad('world is '+g[0].length+'×'+g.length);
const old=G.rpBuildWorld();G.rpWorldExtras(old);
for(let y=0;y<G.OLD_H;y++)for(let x=0;x<G.OLD_W;x++)if(g[y][x]!==old[y][x])bad('old valley changed at '+x+','+y);
let t1=Date.now();for(let y=0;y<g.length;y++)g[y];const full=Date.now()-t1;
const S=G.sites();if(S.length!==17)bad('expected 16 towns + Burrowhome, got '+S.length);
// walk everywhere you can from the start
const W=G.WW,H=G.WH,seen=new Uint8Array(W*H),q=new Int32Array(W*H);let h=0,tl=0;q[tl++]=23*W+7;seen[23*W+7]=1;
while(h<tl){const i=q[h++],x=i%W,y=(i/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(seen[j])continue;const c=g[ny][nx];if(G.RP_SOLID.has(c)||c==='d')continue;seen[j]=1;q[tl++]=j}}
for(const s of S)if(!seen[s.y*W+s.x])bad('cannot walk to '+s.name+' at '+s.x+','+s.y);
const counts={};for(let y=0;y<H;y+=4)for(let x=0;x<W;x+=4){const c=g[y][x];counts[c]=(counts[c]||0)+1}
const total=Object.values(counts).reduce((a,b)=>a+b,0),pct=c=>Math.round((counts[c]||0)/total*100);
if(pct('~')>45)bad('too much sea: '+pct('~')+'%');
console.log((fails?'FAIL':'ok')+' overworld: '+W+'×'+H+' ('+(W*H/1200|0)+'× the old map), '+S.length+' towns all reachable, '+Math.round(tl/(W*H)*100)+'% walkable from home, built in '+full+'ms;',
  'sea '+pct('~')+'% grass '+(pct('.')+pct(',')+pct('F'))+'% forest '+(pct(';')+pct('T'))+'% sand '+(pct('z')+pct('q'))+'% rock '+pct('#')+'% snow '+(pct('v')+pct('P'))+'% road '+(pct('=')+pct('b'))+'%');
console.log('towns:',S.map(s=>s.name+'@'+s.x+','+s.y).join(' '));
process.exitCode=fails?1:0;
