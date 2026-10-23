/* v6 down, losing, fleeing, retries and recovery (build step 10, systems.md §4, §5): one test for each case. */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};const ok=(c,m)=>{checks++;if(!c)bad(m)};
const X=require('../lib/game.js')();X.rp.headless=true;X.rp.autoParty=true;
function start(place,L){X.rp.s=X.rpNewState();X.rpApplyWorld();X.v6Lab.pack=['fighter','cleric','wizard','rogue'];X.v6Lab.lvl=L||5;X.v6Lab.place=place;X.v6Lab.theme='';X.v6Lab.ks=null;X.v6LabStart();X.rp.autoParty=false;X.rpTacBegin&&0;return X.rp.bt}
const kobs=b=>b.units.filter(u=>u.side===0);
// a fall: −1 streak, and the win is not clean
{const b=start(0);const k=kobs(b)[1];k.m.streak=2;k.hp=0;X.tcKo(k);ok(k.m.streak===1,'a fall should cost 1 streak: '+k.m.streak);ok(b.falls===1,'the fight should count the fall')
 const m0=kobs(b)[0].m;m0.streak=1;m0.mp=0;b.units.filter(u=>u.side===1).forEach(u=>u.hp=0);X.rpWin();ok(m0.streak===1,'no streak for a win where someone fell');
 ok(m0.mp===Math.round(X.v6Stats(m0).mp*0.1),'a win gives 10% mana back: '+m0.mp)}
// a clean win: +1 streak, at most +3; no HP back
{const b=start(0);const [a,c]=kobs(b);a.m.streak=0;c.m.streak=3;a.m.hp=10;b.units.filter(u=>u.side===1).forEach(u=>u.hp=0);X.rpWin();
 ok(a.m.streak===1,'a clean win is +1 streak');ok(c.m.streak===3,'the streak stops at +3');ok(a.m.hp===10,'a win gives no HP back')}
// leaving while a friend is down: +2 corruption to the one who leaves; everyone leaving ends the fight with no reward
{const b=start(0);const [a,c,d,e]=kobs(b);c.hp=0;X.tcKo(c);[a,d,e].forEach(u=>u.ap=2);a.m.corr=0;const g0=X.rp.s.gold;X.tcDo(a,{k:'leave'});ok(a.m.corr===2,'leaving a downed friend is +2 corruption: '+a.m.corr);
 X.tcDo(d,{k:'leave'});X.tcDo(e,{k:'leave'});X.tcCheckEnd();ok(b.over==='run','everyone gone should end the fight as fled: '+b.over);ok(X.rp.s.gold===g0,'fleeing gives no gold');
 X.rpEndBattle();ok(c.m.hp===1,'the downed kobold is carried out and stands with 1 HP')}
// losing a normal fight: half the gold, everyone healed, back at the fountain
{const b=start(0);X.rp.s.gold=101;X.rp.s.w6='r1';X.rp.s.w6st={fountains:[],stables:[],respawn:'hearthspire',chests:[],patrols:{},enc:{},switches:{},campfire:{}};kobs(b).forEach(u=>{u.hp=0;X.tcKo(u)});X.tcCheckEnd();ok(b.over==='lose','everyone down is a loss');ok(!X.v6CanRetry(b),'a normal fight is not retried');
 X.rpEndBattle();ok(X.rp.s.gold===50,'losing keeps half the gold: '+X.rp.s.gold)}
// losing to a boss: 10% softer, and it can be retried at once with HP and mana as they were
{const b=start('b:grubb');const hp0=b.units.find(u=>u.E&&u.E.v6boss).max,ks=kobs(b),before=ks.map(u=>[u.m.hp,u.m.mp]);X.rp.s.bag=X.rp.s.bag||{};X.rp.s.bag.potion=3;
 X.rp.s.bag.potion=1;   // a potion was used in the fight
 ks.forEach(u=>{u.m.mp=0;u.hp=0;X.tcKo(u)});X.tcCheckEnd();ok(b.over==='lose','the boss won');ok(X.rp.s.bossDefeats.grubb===1,'the defeat is counted');ok(X.v6CanRetry(b),'a boss can be retried');
 ok(X.v6Retry(),'the retry starts');const b2=X.rp.bt;ok(b2!==b&&b2.v6,'a new v6 fight');const boss=b2.units.find(u=>u.E&&u.E.v6boss);ok(boss.max===Math.round(hp0*0.9),'the boss is 10% softer: '+boss.max+' vs '+hp0);
 ok(kobs(b2).every((u,i)=>u.m.hp===before[i][0]&&u.m.mp===before[i][1]),'HP and mana as they were at the start');ok(X.rp.s.bag.potion===1,'potions used stay used')}
console.log(fails?fails+' failures':'v6 down, losing, fleeing, recovery: '+checks+' checks');process.exitCode=fails?1:0;
