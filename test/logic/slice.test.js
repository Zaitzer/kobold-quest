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
