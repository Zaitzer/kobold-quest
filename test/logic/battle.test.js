/* Parity: whole tactical battles (AI on both sides, same dice) end exactly as they did in v37:
   same winner, rounds, every unit's health and position, and the same rewards. */
const G=require('../lib/game.js')(),O=require('../lib/oldgame.js')();
function seeded(seed,f){const r=Math.random;let x=seed;Math.random=()=>{x=(x*48271)%2147483647;return x/2147483647};try{return f()}finally{Math.random=r}}
function fight(X,seed,setup){return seeded(seed,()=>{
  X.rp.headless=true;X.rp.autoParty=true;X.rp.s=X.rpNewState();X.rpApplyWorld();const s=X.rp.s;
  s.party=setup.party.map(([n,c,l])=>X.rpMember(n,c,l));s.bag={potion:3,ether:1,feather:1};
  X.rpBattle(setup.keys,setup.opt);let steps=0;while(X.rp.bt&&!X.rp.bt.over&&steps<20000){X.rpBattleStep(1/30);steps++}
  const b=X.rp.bt;return JSON.stringify({over:b.over,round:b.round,units:b.units.map(u=>[u.name,u.x,u.y,Math.round(u.hp),u.side]),gold:s.gold,party:s.party.map(m=>[m.lvl,m.xp,m.hp,m.mp]),inv:setup.opt.boss?null:s.inv,msg:setup.opt.boss?b.msg.replace(/ Found: [^!]*!/,""):b.msg})})}  // Gorb and Vexx left the story, so their drops are no longer compared
const CASES=[
  {party:[['Pip','warrior',2]],keys:['scout','slinger'],opt:{zone:','}},
  {party:[['Pip','ranger',4],['Bork','warrior',4]],keys:['apprentice','bruiser','frostbandit'],opt:{zone:';'}},
  {party:[['Pip','mage',6],['Bork','warrior',6],['Wizzle','cleric',6]],keys:['sentry','gunner','shaman'],opt:{zone:'C'}},
  {party:[['Pip','warrior',8],['Bork','warrior',7],['Wizzle','mage',7]],keys:['gorb','shaman'],opt:{boss:'gorb'}},
  {party:[['Pip','ranger',11],['Bork','warrior',11],['Wizzle','mage',11]],keys:['guard','vexx','guard'],opt:{boss:'vexx'}},
  {party:[['Pip','cleric',9],['Bork','warrior',9],['Wizzle','mage',9]],keys:['guard','lancer','cannoneer'],opt:{zone:'K'}}];
let n=0,fails=0;
for(const c of CASES)for(let seed=1;seed<=8;seed++){n++;const a=fight(G,seed*7919,c),b=fight(O,seed*7919,c);
  if(a!==b){fails++;if(fails<3)console.log('DIFF case',JSON.stringify(c.keys),'seed',seed,'\n new',a.slice(0,400),'\n old',b.slice(0,400))}}
console.log(fails?'FAIL':'ok','battle parity:',n,'battles,',fails,'differ');process.exitCode=fails?1:0;
