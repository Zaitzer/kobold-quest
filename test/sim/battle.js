/* balance: N tactical battles with the AI playing both sides. LVL, Z (zone), N, BOSS, PARTY env vars */
/* tactical battle balance: the AI plays both sides */
const A=require('../lib/game.js')();A.setK=o=>{if(o.xp!=null)A.BAL.xp=o.xp;if(o.hp!=null)A.BAL.ehp=o.hp;if(o.atk!=null)A.BAL.eatk=o.atk};const rp=A.rp;rp.headless=true;rp.autoParty=true;
function fight(keys,opt){
  A.rpBattle(keys,opt);let t=0,steps=0;
  while(rp.bt&&!rp.bt.over&&steps<20000){A.rpBattleStep(1/30);steps++}
  const b=rp.bt,r=b?b.over||'timeout':'?',rounds=b?b.round:0;
  const hp=rp.s.party.reduce((a,m)=>a+Math.max(0,m.hp)/A.rpStats(m).hp,0)/rp.s.party.length;
  if(b){if(r==='lose'){rp.s.gold=Math.floor(rp.s.gold/2);rp.s.party.forEach(m=>{const st=A.rpStats(m);m.hp=st.hp;m.mp=st.mp})}else rp.s.party.forEach(m=>{if(m.hp<=0)m.hp=1});rp.bt=null;rp.mode='map'}
  return{r,rounds,hp};
}
module.exports={A,rp,fight};
if(require.main===module){
  const lvl=+process.env.LVL||4,zone=process.env.Z||',',N=+process.env.N||30,boss=process.env.BOSS||null;
  const stats={win:0,lose:0,run:0,timeout:0},hpl=[],rds=[];
  for(let i=0;i<N;i++){
    rp.s=A.rpNewState();A.rpApplyWorld();
    const cl=(process.env.PARTY||'warrior,warrior,mage').split(','),names=['Pip','Bork','Wizzle'];
    rp.s.party=cl.map((c,j)=>A.rpMember(names[j],c,lvl));
    rp.s.bag={potion:3,ether:1,feather:0};
    let res;
    if(boss)res=fight(boss==='gorb'?['gorb','shaman']:['guard','vexx','guard'],{boss});
    else{const Z=A.RP_ZONE[zone];const n=+process.env.EN||3;const ks=[];for(let j=0;j<n;j++)ks.push(A.wpick(Z.t));res=fight(ks,{zone})}
    stats[res.r]=(stats[res.r]||0)+1;hpl.push(res.hp);rds.push(res.rounds);
  }
  const avg=a=>(a.reduce((x,y)=>x+y,0)/a.length).toFixed(2);
  console.log(JSON.stringify(stats),'avg hp left',avg(hpl),'avg rounds',avg(rds));
}
