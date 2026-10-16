/* The Hatching, played headless: every choice at the Great Nest reaches the sparks quest, the opening and the first two towns play
   end to end, the story's barriers cut their routes until cleared, and every villager outdoors can be walked up to. */
const G=require('../lib/game.js')();let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const q=()=>G.rp.s.q;
function fresh(){G.rp.s=G.rpNewState();Object.assign(G.rp.s.q,{intro:1,cls:1});G.rpApplyWorld();G.rp.mode='map';G.rp.bt=null}
/* talk to someone, read every line and pick `choice` when asked */
function talk(id,choice){G.rp.mode='map';G.rpTalk(id);let n=0;
  while(G.rp.mode==='dialog'&&n++<40){const d=G.rp.dlg;if(d.i<d.lines.length-1||!d.choices)G.rpDlgNext();else G.rpChoose(choice||0)}}
/* a boss fight started by a choice: check it started, then count it as won */
function win(id,boss){talk(id,0);if(G.rp.mode!=='battle')bad(id+' did not start a fight (mode '+G.rp.mode+')');G.rp.mode='map';G.rp.bt=null;G.run(G.RP_BOSSES[boss].win)}
/* how much of the world can be walked from the start, as it is now */
function reach(){const g=G.rp.grid,W=G.WW,H=G.WH,seen=new Uint8Array(W*H),st=[23*W+7];seen[23*W+7]=1;
  while(st.length){const i=st.pop(),x=i%W,y=(i/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(seen[j]||G.RP_SOLID.has(g[ny][nx])||g[ny][nx]==='d')continue;seen[j]=1;st.push(j)}}
  return{n:seen.reduce((a,b)=>a+b,0),at:(x,y)=>!!seen[y*W+x],near:(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen[(y+dy)*W+x+dx])}}
const town=n=>G.sites().find(s=>s.name===n);

// every way of voting reaches the petition, Wizzle joins on the way
for(const [i,v] of ['spiky','sleepy','shiny','skip'].entries()){fresh();
  talk('elder');if(q().moot!==1)bad(v+': no ember from the Elder');
  talk('urn',i);if(q().vote!==v||q().moot!==2)bad(v+': the nest gave '+q().vote+' moot '+q().moot);
  talk('yarrow');if(q().moot!==3)bad(v+': Yarrow did not move the story on');
  talk('wizzle');if(!G.rp.s.party.some(m=>m.name==='Wizzle'))bad(v+': Wizzle did not join');
  talk('elder');if(q().moot!==5)bad(v+': the hatching did not start the sparks quest (moot '+q().moot+')')}

// barriers: all shut at the start, each one cuts something, and the lantern opens the way to Thistledown
fresh();const shut=reach();
if(!shut.at(town('Copperhollow').x,town('Copperhollow').y))bad('Copperhollow cannot be reached at the start');
if(shut.at(town('Thistledown').x,town('Thistledown').y))bad('Thistledown can be reached before the lantern');
const allOpen={bc:1,fw:3,lantern:1};Object.assign(q(),allOpen);G.rpApplyWorld();const open=reach();
for(const b of G.BARRIERS){fresh();Object.assign(q(),allOpen);for(const k in b.until)q()[k]=0;G.rpApplyWorld();
  let tiles=0;for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++)if(G.rp.grid[y][x]===b.tile)tiles++;
  if(!tiles)bad(b.id+' laid no tiles');if(reach().n>=open.n)bad(b.id+' does not cut '+b.route);
  if(G.overworldArea(b.x0,b.y0)!==b.route)bad(b.id+' is on '+G.overworldArea(b.x0,b.y0)+', not '+b.route)}
// every villager outdoors stands on open ground and can be walked up to (with the way open)
fresh();Object.assign(q(),allOpen,{moot:5});G.rpApplyWorld();const all=reach();
for(const n of G.RP_NPC.filter(n=>!n.place)){const c=G.rp.grid[n.y][n.x];if(G.RP_SOLID.has(c))bad(n.id+' stands in '+c+' at '+n.x+','+n.y);if(!all.near(n.x,n.y))bad(n.id+' cannot be reached at '+n.x+','+n.y)}

// the opening and the first two towns, end to end
fresh();talk('elder');talk('urn',3);talk('yarrow');talk('wizzle');talk('elder');
G.rp.s.party.forEach(m=>m.hp=1);const pf=town('Pebblebrook');G.tiles.O.use(pf.x,pf.y-1);if(G.rp.s.party[0].hp!==1)bad('Pebblebrook fountain heals before Grubb is gone');
talk('turnip');if(q().pb!==1)bad('Turnip gave no quest');
win('grubb','tollboss');if(q().pb!==2)bad('beating Grubb did not count');
G.tiles.O.use(pf.x,pf.y-1);if(G.rp.s.party[0].hp<=1)bad('Pebblebrook fountain still locked after Grubb');
talk('turnip');if(q().pb!==3||q().seals!==1)bad('no Pebblebrook spark');
talk('bork');if(!G.rp.s.party.some(m=>m.name==='Bork'))bad('Bork did not join');
talk('ruddle');if(q().ch!==1)bad('Ruddle gave no quest');
talk('ruddle');if(q().ch!==1)bad('Ruddle started the meeting with no miners');
for(const m of ['pickett','nugget','dusty','shale'])talk(m);if(q().miners!==4)bad('miners coming: '+q().miners);
talk('pickett');if(q().miners!==4)bad('a miner counted twice');
win('ruddle','collector');if(q().ch!==2)bad('beating Snipe did not count');
talk('ruddle');if(q().ch!==3||q().seals!==2||!q().lantern)bad('no Copperhollow spark or lantern');
G.rpApplyWorld();const lit=reach();const td=town('Thistledown');if(!lit.at(td.x,td.y))bad('the lantern did not open the way to Thistledown');
if(G.rpQuestLine()!=='Sparks 2/8 · tunnel to Thistledown')bad('top bar says '+G.rpQuestLine());

console.log((fails?'FAIL':'ok')+' hatching: 4 choices at the nest, '+G.BARRIERS.length+' barriers, '+G.RP_NPC.filter(n=>!n.place).length+' villagers outdoors, 2 towns played through');
process.exitCode=fails?1:0;
