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
console.log(fails?fails+' failures':'v6 battles: '+checks+' checks');process.exitCode=fails?1:0;
