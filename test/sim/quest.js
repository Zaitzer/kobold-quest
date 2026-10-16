/* whole-game progression with the AI playing every tactical battle */
const {A,rp,fight}=require('./battle.js');
if(process.env.KX)A.setK(JSON.parse(process.env.KX));
const CL=process.env.CL||'warrior',runs=+process.env.RUNS||6,FW=+process.env.FW||6;
function enc(z){const Z=A.RP_ZONE[z],lvl=rp.s.party[0].lvl,ps=rp.s.party.length;let n=ps+(lvl>=2?1:0)-(Math.random()<.4?1:0);n=Math.max(1,Math.min(n,z===','?3:4));const ks=[];for(let i=0;i<n;i++)ks.push(A.wpick(Z.t));return fight(ks,{zone:z}).r}
function upkeep(){const s=rp.s;s.party.forEach(m=>{while(m.pend>0){const o=A.rpOffers(m);m.tal.push(o[0]);m.pend--}if(process.env.SQ&&m.lvl>=8&&!m.adv){const ks=Object.keys(A.RP_ADV).filter(k=>A.RP_ADV[k].base===m.cls);m.adv=ks[Math.random()*ks.length|0]}});
  for(const id of s.inv.slice()){const it=A.RP_IT[id];if(!it||it.slot==='weapon')continue;for(let i=0;i<s.party.length;i++){const m=s.party[i],sl=it.slot==='ring'?(m.eq.ring1?(m.eq.ring2?null:'ring2'):'ring1'):it.slot;if(sl&&!m.eq[sl]&&A.rpCanEquip(m,id)){A.rpEquip(i,id,sl);break}}}}
function inn(){upkeep();const s=rp.s;if(s.gold>=10)s.gold-=10;s.party.forEach(m=>{const st=A.rpStats(m);m.hp=st.hp;m.mp=st.mp})}
function needRest(){return rp.s.party.some(m=>m.hp<A.rpStats(m).hp*.45)||rp.s.party.some(m=>m.mp<A.rpStats(m).mp*.3&&m.cls!=='warrior')}
function shop(){const s=rp.s,b=s.bag;
  const plan={Pip:CL==='ranger'?['popgun','blunder','cannon']:CL==='mage'?['frostrod','firewand','archstaff']:CL==='cleric'?['healwand']:['bone','sword','spear','club'],Bork:['bone','sword','spear','club'],Wizzle:['frostrod','firewand','archstaff']};
  s.party.forEach(m=>{const seq=plan[m.name]||[];const cur=seq.indexOf(m.w);const nx=seq[cur+1];if(nx&&s.gold>=A.RP_W[nx].price+30){s.gold-=A.RP_W[nx].price;m.w=nx}});
  while(b.potion<4&&s.gold>=15+40){s.gold-=15;b.potion++}
  if(!s.q.bork&&s.gold>=50&&s.party.length<3){s.gold-=40;s.q.bork=1;s.party.push(A.rpMember('Bork','warrior',s.party[0].lvl))}}
const tally={};
for(let r=0;r<runs;r++){
  rp.s=A.rpNewState();A.rpApplyWorld();rp.s.party[0]=A.rpMember('Pip',CL,1);rp.s.q.cls=1;
  const log={fights:0,lose:0},stage=[];const L=()=>rp.s.party.map(m=>m.name[0]+m.lvl).join('');let guard=0;
  const go=(z,n)=>{for(let i=0;i<n&&guard++<300;i++){const x=enc(z);log.fights++;if(x==='lose')log.lose++;if(needRest()){inn();shop()}}};
  rp.s.q.q1=1;while(rp.s.q.kills<5&&guard++<200){const x=enc(',');log.fights++;if(x==='lose')log.lose++;if(needRest())inn();shop()}
  rp.s.q.q1=2;rp.s.gold+=60;if(process.env.SQ)A.rpGiveXp(35+40);stage.push('q1@'+log.fights+':'+L());shop();inn();
  go(';',FW);if(process.env.SQ)A.rpGiveXp(90);stage.push('woods@'+log.fights+':'+L());
  rp.s.q.q2=1;go('C',FW);
  rp.s.q.q2=2;rp.s.q.wizzle=1;rp.s.bag.ether+=2;const l=Math.max(2,rp.s.party[0].lvl);if(rp.s.party.length<3)rp.s.party.push(A.rpMember('Wizzle','mage',l));else rp.s.party.splice(2,1,A.rpMember('Wizzle','mage',l));
  if(process.env.SQ)A.rpGiveXp(180+100);upkeep();shop();inn();stage.push('cave@'+log.fights+':'+L());
  let gt=0,g;do{g=fight(['gorb','shaman'],{boss:'gorb'}).r;gt++;inn();if(g!=='win'){go('C',2);inn();shop()}}while(g!=='win'&&gt<8);
  stage.push('gorb x'+gt+':'+L());shop();inn();
  go('K',FW);if(process.env.SQ)A.rpGiveXp(300);upkeep();stage.push('castle@'+log.fights+':'+L());shop();inn();
  let vt=0,v,hp=0;do{const R=fight(['guard','vexx','guard'],{boss:'vexx'});v=R.r;hp=R.hp;vt++;inn();if(v!=='win'){go('K',2);inn();shop()}}while(v!=='win'&&vt<10);
  stage.push('vexx x'+vt+' hp'+hp.toFixed(2)+':'+L()+' losses '+log.lose+' fights '+log.fights);
  console.log(stage.join(' | '));
}
