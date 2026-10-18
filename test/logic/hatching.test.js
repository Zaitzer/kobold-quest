/* The Hatching, played headless: Pip keeps his ember at the Great Nest and reaches the sparks quest, the opening and the first two towns play
   end to end, the story's barriers cut their routes until cleared, and every villager outdoors can be walked up to. */
const G=require('../lib/game.js')();let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const q=()=>G.rp.s.q;
function fresh(){G.rp.s=G.rpNewState();Object.assign(G.rp.s.q,{intro:1,cls:1});G.rpApplyWorld();G.rp.mode='map';G.rp.bt=null}
/* talk to someone, read every line and pick `choice` when asked */
function talk(id,choice){G.rp.mode='map';G.rpTalk(id);let n=0;
  while(G.rp.mode==='dialog'&&n++<40){const d=G.rp.dlg;if(d.i<d.lines.length-1||!d.choices)G.rpDlgNext();else G.rpChoose(choice||0)}}
/* a boss fight started by a choice: check it started, then count it as won */
function win(id){talk(id,0);if(G.rp.mode!=='battle'||!G.rp.bt){bad(id+' did not start a fight (mode '+G.rp.mode+')');return}G.rpWin();G.rp.mode='map';G.rp.bt=null}
/* how much of the world can be walked from the start, as it is now */
function reach(){const g=G.rp.grid,W=G.WW,H=G.WH,seen=new Uint8Array(W*H),st=[23*W+7];seen[23*W+7]=1;
  while(st.length){const i=st.pop(),x=i%W,y=(i/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(seen[j]||G.RP_SOLID.has(g[ny][nx])||g[ny][nx]==='d')continue;seen[j]=1;st.push(j)}}
  return{n:seen.reduce((a,b)=>a+b,0),at:(x,y)=>!!seen[y*W+x],near:(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen[(y+dy)*W+x+dx])}}
const town=n=>G.sites().find(s=>s.name===n);

// Pip keeps his ember, naps by the nest and sees the hatching; the Elder tells the rhyme; Mallow's buns send him east;
// Wizzle finds him at the east road; Turnip's flour brings the buns
{fresh();
  talk('elder');if(q().moot!==1)bad('no ember from the Elder');
  G.rp.mode='map';G.rpTalk('urn');if(G.rp.dlg&&G.rp.dlg.choices)bad('the nest still offers a choice');
  if(!G.rp.dlg||!G.rp.dlg.lines.some(l=>/tiny dragon/.test(l.text)))bad('the hatching is not shown at the nest');while(G.rp.mode==='dialog')G.rpDlgNext();
  if(q().vote!=='skip'||q().moot!==3)bad('the nest gave '+q().vote+' moot '+q().moot);
  talk('elder');if(q().moot!==5)bad('the Elder did not start the sparks quest (moot '+q().moot+')');
  talk('mallow');if(q().buns!==1)bad('Mallow did not send Pip for flour');
  const wz=G.rpNpcs().find(n=>n.id==='wizzle');if(!wz||wz.x!==23||wz.y!==23)bad('Wizzle is not waiting by the east road');
  talk('wizzle');if(!G.rp.s.party.some(m=>m.name==='Wizzle'))bad('Wizzle did not join');
  q().pb=3;talk('mallow');if(q().buns!==2||(G.rp.s.bag.bun||0)!==3)bad('buns: '+G.rp.s.bag.bun+' (want 3 in all)');
  q().pb=0;q().yv=0;talk('yarrow');if(q().yv!==1)bad('Yarrow\'s visit did not happen')}
// ember-buns: heal everything and fill MP; never sold, gifted or put on the market
{fresh();const s=G.rp.s,m=s.party[0],st=G.rpStats(m);s.bag.bun=1;m.hp=1;m.mp=0;G.useOn(m,'bun');
  if(m.hp!==st.hp||m.mp!==st.mp||s.bag.bun!==0)bad('the bun did not fill HP and MP');
  if(!G.RP_ITEMS.bun.keep)bad('buns can be traded');const g=s.gold=999;G.rpBuyItem('bun');if(s.bag.bun)bad('buns can be bought');
  if(G.netMkValid({kind:'bag',val:'bun',price:5}))bad('buns can go on the market')}
// the crowd at the nest: everyone stands on open ground, talks, and says something new after the hatching
{fresh();const ids=Object.keys(G.NEST);
  for(const id of ids){const n=G.RP_NPC.find(n=>n.id===id);if(!n){bad('nobody stands at the nest for '+id);continue}
    if(G.RP_SOLID.has(G.rp.grid[n.y][n.x])||Math.hypot(n.x-17,n.y-26)>6)bad(id+' is not by the nest');}
  const said=id=>{G.rp.dlg=null;G.rp.mode='map';G.rpTalk(id);return G.rp.dlg?G.rp.dlg.lines.map(l=>l.text).join(' '):''};
  const before=ids.map(said);q().moot=5;G.rpApplyWorld();const after=ids.map(said);
  ids.forEach((id,i)=>{if(id!=='stranger'&&before[i]===after[i])bad(id+' says the same after the hatching')});
  if(G.rpNpcs().some(n=>n.id==='stranger'))bad('the stranger with the sack is still at the nest')}

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
talk('grubb');if(G.rp.mode==='battle')bad('Grubb fights before his lookouts are dealt with');
win('lookout1');win('lookout2');if(!q().lk1||!q().lk2)bad('lookouts did not count');
win('grubb');if(q().pb!==2)bad('beating Grubb did not count');
G.tiles.O.use(pf.x,pf.y-1);if(G.rp.s.party[0].hp<=1)bad('Pebblebrook fountain still locked after Grubb');
talk('turnip');if(q().pb!==3||q().seals!==1)bad('no Pebblebrook spark');
talk('bork');if(!G.rp.s.party.some(m=>m.name==='Bork'))bad('Bork did not join');
talk('ruddle');if(q().ch!==1)bad('Ruddle gave no quest');
talk('ruddle');if(q().ch!==1||G.rp.mode==='battle')bad('Ruddle started the meeting with no miners');
for(const m of ['pickett','nugget','dusty','shale'])talk(m);if(q().miners!==4)bad('miners coming: '+q().miners);
talk('pickett');if(q().miners!==4)bad('a miner counted twice');
talk('ruddle');if(q().hearth||G.rp.mode==='battle')bad('the circle met at a cold hearth');
G.rpMats().scrap=3;talk('ruddle');if(!q().hearth||G.rpMats().scrap!==0)bad('gold scrap did not light the hearth');
win('ruddle');if(q().ch!==2)bad('beating Snipe did not count');
talk('ruddle');if(q().ch!==3||q().seals!==2||!q().lantern)bad('no Copperhollow spark or lantern');
G.rpApplyWorld();const lit=reach();const td=town('Thistledown');if(!lit.at(td.x,td.y))bad('the lantern did not open the way to Thistledown');
if(G.rpQuestLine()!=='Sparks 2/8 · tunnel to Thistledown')bad('top bar says '+G.rpQuestLine());

console.log((fails?'FAIL':'ok')+' hatching: Pip keeps his ember, '+Object.keys(G.NEST).length+' kobolds at the nest, '+G.BARRIERS.length+' barriers, '+G.RP_NPC.filter(n=>!n.place).length+' villagers outdoors, 2 towns played through');
process.exitCode=fails?1:0;
