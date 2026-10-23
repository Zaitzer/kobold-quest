/* QA for the systems with no test of their own (build step 21, systems.md §0): the goal bar always has a line along the slice's main
   path, crafting, the Book's records, the settings that change behaviour, the bounties' scenes, and the tap goals still matching the
   count tool (ui-design.md §4 against tools/timecount.js). */
process.emitWarning=()=>{};
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m)}};
const X=require('../lib/game.js')();X.rp.headless=true;const fs=require('fs'),path=require('path'),R=path.join(__dirname,'../..');
X.rp.s=X.rpNewState();X.w6Start([X.v6Kobold('Pip','fighter',5,{hero:1})]);const s=X.rp.s;
/* row 15: the goal bar has a line at every step of the main path (apply each main scene's flags in order) */
{const main=X.SCENES6.filter(sc=>!sc.from&&!/^3\.14|^2\.1/.test(sc.id));let missing=[];
 for(const sc of main){for(const st of sc.steps)if(st[0]==='set')Object.assign(s.q,st[1]);if(!X.s6GoalLine())missing.push(sc.id)}
 ok(missing.length===0,'a goal line after every main scene; missing after '+missing.join(', '))}
/* row 12: crafting at Pebblebrook's smith takes the materials and makes the piece */
{const L=X.v6Recipes('pebblebrook');ok(L.length>0,'Pebblebrook has recipes');s.mats6={};for(const n of X.needOf(L[0]))s.mats6[n.mat]=n.n;s.inv6=[];
 const it=X.v6Craft('pebblebrook',0);ok(it&&s.inv6.length===1&&X.needOf(L[0]).every(n=>s.mats6[n.mat]===0),'crafting uses the materials and gives the piece');ok(!X.v6Craft('pebblebrook',0),'no materials, no craft')}
/* row 26: the Book remembers foes met and beaten, and places */
{s.w6st.book=null;X.v6BookFight({v6:1,over:'win',units:[{side:1,E:{id:'cellar_rat',L:2}},{side:1,E:{id:'cellar_rat',L:1}},{side:0}]});const B=s.w6st.book;
 ok(B.foes.cellar_rat&&B.foes.cellar_rat.won===2&&B.foes.cellar_rat.lo===1&&B.foes.cellar_rat.hi===2,'the Book: foes, their levels and wins '+JSON.stringify(B.foes));
 X.v6BookFight({v6:1,over:'lose',units:[{side:1,E:{id:'copper_beetle',L:4}}]});ok(B.foes.copper_beetle&&B.foes.copper_beetle.won===0,'a foe met but not beaten');
 s.w6='pebblebrook';X.v6BookPlace();ok(!!B.places.pebblebrook,'the Book: places seen');
 X.net.festival={name:'Lantern week',stamp:'f1',until:Date.now()+1e6};X.v6BookPlace();X.v6BookPlace();ok(B.stamps.length===1&&B.stamps[0].n==='Lantern week','one festival stamp');X.net.festival=null}
/* row 18: settings that change behaviour: reduced motion stops the shake and confetti; the colour-blind palette changes the bars */
{X.rpOpt.calm=true;X.rpOptSave();ok(X.set_shake(3)===0,'reduced motion: no shake');X.rpOpt.calm=false;X.rpOptSave();ok(X.set_shake(3)===3,'shake otherwise');X.set_shake(0);
 X.rpOpt.cb=true;ok(/5fb0ff/.test(X.rpBar(5,10,'#7ad67a'))&&/ff9f1c/.test(X.rpBar(1,10,'#ff6b6b')),'colour-blind bars: blue and orange');X.rpOpt.cb=false;ok(/7ad67a/.test(X.rpBar(5,10,'#7ad67a')),'normal bars')}
/* row 8: the bounties: the board's scene sets both, each has its fight and its reward */
{const d=X.SCENES6.find(c=>c.id==='3.14d'),e=X.SCENES6.find(c=>c.id==='3.14e'),f=X.SCENES6.find(c=>c.id==='3.14f');
 ok(d&&d.steps.some(st=>st[0]==='set'&&st[1].bounty_pinch===1&&st[1].bounty_scout===1),'the board posts both bounties');
 for(const [sc,fight] of [[e,'scoutboss'],[f,'pinch']])ok(sc&&sc.steps.some(st=>st[0]==='fight'&&st[1]===fight)&&sc.steps.some(st=>st[0]==='give'&&st[1]==='gold')&&X.SETPIECES6[fight],'the bounty '+fight+': a fight and gold')}
/* row 24: the tap goals in ui-design.md §4 still match what the count tool counts (within 2%) */
{const out=require('child_process').execFileSync('node',[path.join(R,'tools/timecount.js')],{encoding:'utf8'});const m=out.match(/\| \*\*all\*\* \| (\d+) \| \*\*(\d+)\*\*/);
 const doc=fs.readFileSync(path.join(R,'docs/ui-design.md'),'utf8').match(/\| \*\*all\*\* \| (\d+) \| \*\*(\d+)\*\*/);
 ok(m&&doc&&Math.abs(+m[2]-+doc[2])/+doc[2]<=0.02,'taps an hour: the tool counts '+(m&&m[2])+', the design says '+(doc&&doc[2]))}
console.log((fails?'FAIL':'ok')+' QA: '+checks+' checks');process.exitCode=fails?1:0;
