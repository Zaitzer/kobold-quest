/* v6 battles (build steps 5, 6, 8): the fight lab runs whole fights with the v6 rules; the pieces behave as the design says:
   the timeline's order, a quick weapon's 1-AP attack at ×0.635, statuses and their turns, traps, a big foe hit per overlapped tile,
   no runtime scaling of v6 foes, and the old battles untouched (the parity test). */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};
const X=require('../lib/game.js')();X.rp.headless=true;X.rp.autoParty=true;
function seeded(seed,f){const r=Math.random;let x=seed;Math.random=()=>{x=(x*48271)%2147483647;return x/2147483647};try{return f()}finally{Math.random=r}}
function lab(pack,L,place,seed){return seeded(seed,()=>{X.rp.s=X.rpNewState();X.rpApplyWorld();X.v6Lab.pack=pack;X.v6Lab.lvl=L;X.v6Lab.place=place;X.v6LabStart();
  let s=0;while(X.rp.bt&&!X.rp.bt.over&&s<40000){X.rpBattleStep(1/30);s++}return X.rp.bt})}
// whole fights end, with v6 foes at their bestiary stats
for(const [pack,L,place] of [[['fighter','cleric','wizard','rogue'],5,0],[['ranger','monk','bard','sorcerer'],7,1],[['fighter','fighter','fighter','fighter'],3,0]]){
  const b=lab(pack,L,place,1234);checks++;if(!b||!b.over)bad('a lab fight did not end: '+pack.join('+'));
  for(const u of b.units.filter(u=>u.side===1)){checks++;const F=X.FOES6[u.E.id],s=F.by[u.E.L];if(u.max!==s.hp)bad(u.name+' HP '+u.max+' is not the bestiary\'s '+s.hp+' (no runtime scaling)')}}
// the timeline: a unit with initiative 14 acts before one with 10, and gains turns
{const units=[{id:1,side:1,x:0,hp:1,init:10},{id:2,side:0,x:1,hp:1,init:14}];const order=[];for(let t=0;t<25;t++)X.tick(units).forEach(u=>order.push(u.id));
 checks++;if(order[0]!==2)bad('the faster unit should act first');checks++;if(order.filter(i=>i===2).length!==26)bad('initiative 14 should act 26 times in 25 ticks, got '+order.filter(i=>i===2).length)}
// a quick weapon: the basic attack costs 1 AP and hits ×0.635
seeded(7,()=>{X.rp.s=X.rpNewState();X.rpApplyWorld();X.v6Lab.pack=['rogue',null,null,null];X.v6Lab.lvl=5;X.v6Lab.place=0;X.v6LabStart();const b=X.rp.bt,r=b.units.find(u=>u.side===0),f=b.units.find(u=>u.side===1);
  checks++;if(X.tcActCost(r,{k:'atk'})!==1)bad('a dagger attack should cost 1 AP');
  const full=X.v6DmgRange(b,r,f,1,{}),q=X.v6DmgRange(b,r,f,1,{quick:1});checks++;if(Math.abs(q[1]/full[1]-0.635)>0.03)bad('quick hit should be ×0.635: '+q[1]+' vs '+full[1]);
  const fi=X.v6Kobold('T','fighter',5);checks++;if(X.tcActCost({m:fi},{k:'atk'})!=='end')bad('a sword attack should end the turn');
  // statuses: root stops movement, slow halves it, and they wear off on the unit's own turns
  f.vs={root:2};checks++;if(X.tcMov(f)!==0)bad('a rooted foe cannot move');f.vs={slow:2};const m=X.tcMov(f);checks++;if(m!==Math.ceil(f.E.move/2))bad('slow halves movement: '+m);
  X.v6TurnStart(b,f);X.v6TurnStart(b,f);checks++;if(f.vs.slow)bad('slow should wear off after two of its turns');
  // hex: +25% damage taken
  const plain=X.v6DmgRange(b,r,f,1,{})[1];f.vs={hex:3};const hexed=X.v6DmgRange(b,r,f,1,{})[1];checks++;if(Math.abs(hexed/plain-1.25)>0.03)bad('hex should be +25%: '+hexed+' vs '+plain);f.vs={};
  // a trap springs when a foe steps on it
  b.tiles6=[{x:f.x,y:f.y,k:'trap',side:0,by:r,s:X.SKILLS6.rogue_trap}];const hp0=f.hp;X.v6OnTile(b,f);checks++;if(b.tiles6.length)bad('the trap should spring');
  // hit chance: a stunned foe cannot dodge, and the breakdown says so
  f.stun=1;const H=X.v6Hit(b,r,f,{});checks++;if(!H.parts.includes('cannot dodge'))bad('a stunned foe cannot dodge: '+H.parts.join(', '));f.stun=0});
// every v6 skill is in the engine's tables with a cost and a target
for(const id of Object.keys(X.SKILLS6)){checks++;if(!X.RP_SK[id]||!X.RP_ST[id])bad('skill not registered: '+id);else if(!X.RP_SK[id].t)bad('no target type: '+id)}
// bosses (step 8): stats from the boss table, four attacks a turn, the telegraphed swing, adds on round 4, softening; trials
{const key=X.v6BossKey('grubb'),E=X.RP_E[key],B=X.BOSSES6.grubb;checks++;if(E.hp!==B.hp||E.atk!==B.atk||E.acts!==4)bad('Grubb should carry the boss table\'s stats and four attacks');
 X.rp.s=X.rpNewState();X.rp.s.bossDefeats={grubb:2};checks++;if(X.RP_E[X.v6BossKey('grubb')].hp!==Math.round(B.hp*0.8))bad('two defeats soften Grubb by 20%');
 X.rp.s.bossDefeats={grubb:9};checks++;if(X.RP_E[X.v6BossKey('grubb')].hp!==Math.round(B.hp*0.7))bad('softening stops at 70%')}
{let wins=0,losses=0,swings=0,adds=0;for(let k=0;k<10;k++){const b=seeded(100+k,()=>{X.rp.s=X.rpNewState();X.rpApplyWorld();X.v6Lab.pack=['fighter','cleric','wizard','rogue'];X.v6Lab.lvl=k<6?5:3;X.v6Lab.place='b:grubb';X.v6LabStart();
   const b=X.rp.bt;let s=0,last='';while(b&&!b.over&&s<80000){X.rpBattleStep(1/30);s++;if(b.chans.some(c=>c.sk==='v6_bigswing')&&b.msg!==last){last=b.msg;swings++}}return b});
   if(k<6&&b.over==='win')wins++;if(k>=6&&b.over!=='win')losses++;if(b.units.some(u=>u.side===1&&u.E&&u.E.id==='nettlenose_scout'))adds++}
 checks++;if(!wins||!losses)bad('Grubb should be both won and lost (won at level 5, lost at level 3): '+wins+' wins, '+losses+' losses');
 checks++;if(!swings)bad('Grubb never telegraphed his big swing');checks++;if(adds<3)bad('Grubb\'s scouts should join on round 4 in most fights: '+adds+'/6')}
{const b=lab(['fighter','cleric','wizard','rogue'],8,'b:snipe',5);checks++;if(!b.over)bad('the Snipe fight did not end');
 const sn=b.units.find(u=>u.E&&u.E.trick==='snipe'),r=b.units.find(u=>u.side===0);sn.hp=sn.max;r.hp=r.max;
 const H=X.v6Hit(b,{...r,m:X.v6Kobold('T','ranger',8)},sn,{});checks++;if(!/cover/.test(H.parts.join(' ')))bad('Snipe\'s cart should give cover against shots: '+H.parts.join(', '))}
{const b=lab(['fighter','cleric','wizard','rogue'],8,'t:old_shellback',9);checks++;if(b.over!=='win'&&b.over!=='lose')bad('the Old Shellback trial did not end');
 const sh=b.units.find(u=>u.E&&u.E.trick==='old_shellback'),f=b.units.find(u=>u.side===0);sh.hp=sh.max;sh.curled=false;const a=X.v6DmgRange(b,f,sh,1,{})[1];sh.curled=true;const c=X.v6DmgRange(b,f,sh,1,{})[1];
 checks++;if(Math.abs(c/a-0.5)>0.05)bad('a curled Shellback takes half damage: '+c+' vs '+a)}
// role habits (systems.md §3): a hurt beetle curls up (defence ×2 for a turn), the scout picks the most hurt kobold, the grub the lowest
// defence, a brute the nearest; a foe's status rides on its hits (the grub's sticky spit slows)
seeded(11,()=>{X.rp.s=X.rpNewState();X.rpApplyWorld();X.v6Lab.pack=['fighter','cleric','wizard','rogue'];X.v6Lab.lvl=5;X.v6Lab.place=0;X.v6LabStart();const b=X.rp.bt,ks=b.units.filter(u=>u.side===0);
  const mk=id=>{const key=X.v6FoeKey(id,5),E=X.RP_E[key];return{side:1,E,key,name:E.n,x:5,y:1,sz:1,hp:E.hp,max:E.hp,ap:2,vs:{},vb:[],buff:{atk:0,def:0},aware:true,pod:9,k:{x:0,y:0}}};
  const beetle=mk('copper_beetle');b.units.push(beetle);beetle.hp=Math.floor(beetle.max*0.4);const d0=X.v6DmgRange(b,ks[0],beetle,1,{})[1];X.v6Habit(b,beetle);const d1=X.v6DmgRange(b,ks[0],beetle,1,{})[1];
  checks++;if(Math.abs(d1/d0-0.5)>0.15)bad('a curled beetle (defence ×2) should take much less: '+d1+' vs '+d0);
  ks[2].hp=5;const sc=mk('nettlenose_scout');checks++;if(X.v6HabitFocus(b,sc,ks)!==ks[2])bad('the scout should pick the most hurt kobold');
  const gr=mk('glow_grub'),low=ks.reduce((a,v)=>X.tcStat(v).def<X.tcStat(a).def?v:a);checks++;if(X.v6HabitFocus(b,gr,ks)!==low)bad('the grub should pick the lowest defence');
  checks++;const st=X.v6FoeHitStatus(gr);if(!st||st.k!=='slow')bad('the grub\'s spit should carry slow');
  checks++;if(X.v6FoeHitStatus(mk('cellar_rat')))bad('a rat carries no status');
  const p=X.v6FoeStatusP(gr,ks[0]);checks++;if(!(p>=0.4&&p<=0.8))bad('a foe\'s status lands by the status rule: '+p)});
// a crash scan: every slice place, boss and trial runs to its end without errors
{let errs=0,stuck=0;const sels=X.PLACES6.map((p,i)=>i).filter(i=>X.PLACES6[i].L<=8).concat(['b:grubb','b:snipe','t:old_shellback']);
 for(const sel of sels){try{const b=lab(['ranger','monk','bard','sorcerer'],sel==='b:snipe'||sel==='t:old_shellback'?8:5,sel,77);if(!b.over)stuck++}catch(e){errs++;console.log(sel,e.stack.split('\n').slice(0,3).join(' | '))}}
 checks++;if(errs||stuck)bad('crash scan: '+errs+' errors, '+stuck+' stuck')}
console.log(fails?fails+' failures':'v6 battles: '+checks+' checks');process.exitCode=fails?1:0;
