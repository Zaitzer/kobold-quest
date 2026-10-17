/* The vertical slice's systems: route zones (who attacks where, what they drop), fountains (healing, the place you wake
   up after losing, fast travel after the second spark), and losing a fight. */
const G=require('../lib/game.js')();let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const fresh=()=>{G.rp.s=G.rpNewState();Object.assign(G.rp.s.q,{intro:1,cls:1});G.rpApplyWorld();G.rp.mode='map';G.rp.dlg=null};
const town=n=>G.sites().find(s=>s.name===n);
// zones: find a tall-grass tile on Route 1, a forest tile on Route 2, grass on Route 3's grassy part and its mountain pass
fresh();const g=G.rp.grid,found={};
for(let y=0;y<G.WH;y++)for(let x=0;x<G.WW;x++){const c=g[y][x];if(c!==','&&c!==';')continue;const z=G.regionZone(x,y,c);if(!found[z])found[z]=[x,y]}
for(const z of ['r1','r2','r3','r3m'])if(!found[z])bad('no tiles for zone '+z);else if(!G.RP_ZONE[z])bad('zone '+z+' has no monsters');
for(const z of ['r1','r2','r3','r3m'])for(const k in (G.RP_ZONE[z]||{}).t||{})if(!G.RP_E[k])bad(z+' has unknown monster '+k);
if(G.regionZone(20,20,',')!==',')bad('the valley should keep its own zones');
if(G.RP_ZONE.r3m.mat!=='scrap')bad('gold scrap has no home');
if(G.tcTheme('r2')!=='woods'||G.tcTheme('r1')!=='meadow')bad('battle scenery for route zones');
// fountains: drinking heals and is remembered; travel appears after the second spark
fresh();const s=G.rp.s,pb=town('Pebblebrook'),ch=town('Copperhollow');
const drink=(t)=>{G.rp.mode='map';G.tiles.O.use(t.x,t.y-1)};
const choices=()=>{const d=G.rp.dlg;return d&&d.choices?d.choices.map(c=>c.t):[]};
s.party[0].hp=1;drink(pb);if(s.party[0].hp<=1)bad('fountain did not heal');if(!s.fountains||!s.fountains.includes('Pebblebrook'))bad('fountain not remembered');
if(choices().length)bad('travel offered before the second spark');
s.q.seals=2;G.rp.dlg=null;drink(ch);const c=choices();
if(!c.includes('Travel to Pebblebrook')||!c.includes('Travel to Burrowhome')||c.includes('Travel to Copperhollow'))bad('travel choices: '+c.join(', '));
const i=c.indexOf('Travel to Pebblebrook');while(G.rp.mode==='dialog'&&G.rp.dlg.i<G.rp.dlg.lines.length-1)G.rpDlgNext();G.rpChoose(i);
if(s.x!==pb.x||s.y!==pb.y)bad('travel to Pebblebrook landed at '+s.x+','+s.y);
if(G.rpSolid(s.x,s.y))bad('travel landed in something solid');
// losing a fight wakes you at the last fountain, with half your gold
fresh();const s2=G.rp.s;s2.gold=100;G.rp.dlg=null;drink(ch);
G.rpBattle(['scout'],{zone:','});G.rp.bt.over='lose';G.rpEndBattle();
if(s2.x!==ch.x||s2.y!==ch.y||s2.gold!==50)bad('after losing: at '+s2.x+','+s2.y+' with '+s2.gold+' gold');
fresh();const s3=G.rp.s;G.rpBattle(['scout'],{zone:','});G.rp.bt.over='lose';G.rpEndBattle();
if(s3.x!==10||s3.y!==25)bad('first loss should wake you at Burrowhome\'s fountain, got '+s3.x+','+s3.y);
if(G.rpSolid(10,25)||G.rp.grid[24][10]!=='O')bad('Burrowhome fountain missing or blocked');
console.log((fails?'FAIL':'ok')+' slice: 4 route zones, fountains, travel, losing');process.exitCode=fails?1:0;
// the roster: recruits beyond three wait at the inn, the innkeeper swaps them, the bench gets half XP
{fresh();const s=G.rp.s,talk=(id,ch)=>{G.rp.mode='map';G.rpTalk(id);let n=0;while(G.rp.mode==='dialog'&&n++<40){const d=G.rp.dlg;if(d.i<d.lines.length-1||!d.choices)G.rpDlgNext();else G.rpChoose(ch||0)}};
 Object.assign(s.q,{moot:5,pb:3,ch:3,bork:1,wizzle:1});s.party.push(G.rpMember('Bork','warrior',2),G.rpMember('Wizzle','mage',2));
 talk('fennel',0);if(s.q.fennel!==1)bad('Fennel gave no quest');
 const goat=G.RP_NPC.find(n=>n.id==='parsnip');if(G.overworldArea(goat.x,goat.y)!=='Route 1')bad('Parsnip is not on Route 1 but '+G.overworldArea(goat.x,goat.y));
 if(G.RP_SOLID.has(G.rp.grid[goat.y][goat.x]))bad('Parsnip stands in something solid');
 talk('parsnip');if(s.q.fennel!==2)bad('finding Parsnip did not count');
 talk('fennel');if(s.q.fennel!==3||!(s.roster||[]).some(m=>m.name==='Fennel')||s.party.length!==3)bad('Fennel should wait at the inn: party '+s.party.map(m=>m.name)+' inn '+(s.roster||[]).map(m=>m.name));
 talk('nugget');if(!s.roster.some(m=>m.name==='Nugget'))bad('Nugget did not join the roster');
 talk('nugget');if(s.roster.filter(m=>m.name==='Nugget').length!==1)bad('Nugget joined twice');
 talk('toast',1);if(G.rp.mode!=='roster')bad('Toast did not open the roster (mode '+G.rp.mode+')');
 G.actions.rostout({i:'1'});G.actions.rostin({i:'0'});if(s.party[1].name!=='Wizzle'||s.party[2].name!=='Fennel')bad('swap failed: '+s.party.map(m=>m.name));
 G.actions.rostout({i:'0'});if(s.party[0].name!=='Pip')bad('Pip can be sent away');
 const lv=s.roster[0].lvl,xp0=s.roster[0].xp;G.rpBenchXp(40,G.rpXpNeed);if(s.roster[0].xp===xp0&&s.roster[0].lvl===lv)bad('the inn got no XP');
 for(const id of ['keeperA','keeperE']){const n=G.RP_NPC.find(n=>n.id===id);if(!G.RP_PLACES[n.place])bad(id+' is in a room that does not exist: '+n.place)}}
// co-op: level sync brings a strong friend's kobold down to the host's level; bosses count only for players at that step
{const m=G.rpMember('Bork','warrior',12);m.hp=Math.round(G.rpStats(m).hp/2);const c=G.netLevelSync(m,4),a=G.rpStats(m),b=G.rpStats(c);
 if(c.lvl!==4||c.synced!==12||b.hp>=a.hp||b.atk>=a.atk)bad('level sync: '+JSON.stringify({lvl:c.lvl,hp:[a.hp,b.hp],atk:[a.atk,b.atk]}));
 if(Math.abs(c.hp/b.hp-.5)>.05)bad('level sync should keep the share of health: '+c.hp+'/'+b.hp);
 if(G.netLevelSync(G.rpMember('Pip','ranger',3),4).lvl!==3)bad('a weaker kobold should not change');
 const winBoss=pb=>{fresh();const s=G.rp.s;Object.assign(s.q,{moot:5,pb});G.rpBattle(['tollboss'],{boss:'tollboss'});G.rpWin();const r={pb:s.q.pb,dust:s.dust||0,msg:G.rp.bt.msg,drops:G.rp.bt.drops.length};G.rp.bt=null;G.rp.mode='map';return r};
 const ready=winBoss(1),early=winBoss(0),helper=winBoss(3);
 if(ready.pb!==2||!ready.drops)bad('a ready player did not get the boss: '+JSON.stringify(ready));
 if(early.pb!==0||early.drops||!/isn't part of your story/.test(early.msg))bad('a player not at the step got the boss: '+JSON.stringify(early));
 if(helper.pb!==3||helper.dust!==3)bad('a helper past the step got no spark dust: '+JSON.stringify(helper))}
// finds off the path: the route chests stand on open ground you can walk up to
{fresh();Object.assign(G.rp.s.q,{bc:1,fw:3,lantern:1});G.rpApplyWorld();const g=G.rp.grid,W=G.WW,H=G.WH,seen=new Uint8Array(W*H),st=[23*W+7];seen[23*W+7]=1;
 while(st.length){const i=st.pop(),x=i%W,y=(i/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(seen[j]||G.RP_SOLID.has(g[ny][nx])||g[ny][nx]==='d'||G.rpChestAt(nx,ny))continue;seen[j]=1;st.push(j)}}
 const out=G.RP_CHESTS.filter(c=>!c.place&&(c.x>=G.OLD_W||c.y>=G.OLD_H));if(out.length<4)bad('expected 4 chests on the routes, got '+out.length);
 for(const c of out){if(G.RP_SOLID.has(g[c.y][c.x]))bad('chest in something solid at '+c.x+','+c.y);if(![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen[(c.y+dy)*W+c.x+dx]))bad('chest at '+c.x+','+c.y+' ('+G.overworldArea(c.x,c.y)+') cannot be reached')}
 const areas=out.map(c=>G.overworldArea(c.x,c.y));for(const r of ['Route 1','Route 2','Route 3'])if(!areas.includes(r))bad('no chest on '+r+' ('+areas+')')}
console.log((fails?'FAIL':'ok')+' slice: roster, recruits, inns, level sync, shared boss credit, route chests');process.exitCode=fails?1:0;
