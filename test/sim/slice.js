/* The vertical slice played start to finish by the AI: Burrowhome → Route 1 → Pebblebrook (lookouts, Grubb)
   → Route 3 and the pass (gold scrap) → Copperhollow (Snipe). Prints levels, losses, boss tries and a rough
   play time per stage. Env: RUNS, CL (Pip's class), FEN=1 (Fennel found before Grubb), WALK (extra route fights). */
const {A,rp,fight}=require('./battle.js');
const runs=+process.env.RUNS||8,CL=process.env.CL||'warrior',FEN=!!+process.env.FEN,WALK=+process.env.WALK||0;
const UP={warrior:['bone','sword','spear','club'],ranger:['popgun','blunder','cannon'],mage:['frostrod','firewand','archstaff'],cleric:['healwand']};
function upkeep(){const s=rp.s;s.party.forEach(m=>{while(m.pend>0){const o=A.rpOffers(m);m.tal.push(o[0]);m.pend--}});
  for(const id of s.inv.slice()){const it=A.RP_IT[id];if(!it||it.slot==='weapon')continue;for(let i=0;i<s.party.length;i++){const m=s.party[i],sl=it.slot==='ring'?(m.eq.ring1?(m.eq.ring2?null:'ring2'):'ring1'):it.slot;if(sl&&!m.eq[sl]&&A.rpCanEquip(m,id)){A.rpEquip(i,id,sl);break}}}}
function inn(t){upkeep();const s=rp.s;if(s.gold>=10)s.gold-=10;s.party.forEach(m=>{const st=A.rpStats(m);m.hp=st.hp;m.mp=st.mp});t.time+=20}
function shop(){const s=rp.s;s.party.forEach(m=>{const seq=UP[m.cls]||[];const nx=seq[seq.indexOf(m.w)+1];if(nx&&A.RP_W[nx]&&s.gold>=A.RP_W[nx].price+30){s.gold-=A.RP_W[nx].price;m.w=nx}});
  while(s.bag.potion<4&&s.gold>=15+30){s.gold-=15;s.bag.potion++}}
const needRest=()=>rp.s.party.some(m=>m.hp<A.rpStats(m).hp*.45)||rp.s.party.some(m=>m.mp<A.rpStats(m).mp*.3&&m.cls!=='warrior');
/* rough seconds: a fight ~40 s plus 8 s per enemy, walking 4 tiles a second, reading a line ~3 s */
function enc(z,t){const Z=A.RP_ZONE[z],lvl=rp.s.party[0].lvl,ps=rp.s.party.length;let n=ps+(lvl>=2?1:0)-(Math.random()<.4?1:0);n=Math.max(1,Math.min(n,Z.cap||4));
  const ks=[];for(let i=0;i<n;i++)ks.push(A.wpick(Z.t));return story(ks,{zone:z},t)}
function story(ks,opt,t){const r=fight(ks,opt);t.fights++;t.time+=40+8*ks.length;if(r.r==='lose'){t.lose++;rp.s.party.forEach(m=>{const st=A.rpStats(m);m.hp=st.hp;m.mp=st.mp})}
  else{const Z=A.RP_ZONE[opt.zone];if(Z&&Z.mat==='scrap')rp.s.mats.scrap=(rp.s.mats.scrap||0)+ks.filter(()=>Math.random()<.45).length}
  if(needRest())inn(t);return r}
function boss(ks,opt,t,grind){let tries=0,r;do{r=story(ks,opt,t);tries++;inn(t);shop();if(r.r!=='win')for(let i=0;i<2;i++)enc(grind,t)}while(r.r!=='win'&&tries<8);return{tries,hp:r.hp}}
const join=(name,cls,min)=>{const s=rp.s;const m=A.rpMember(name,cls,Math.max(min,s.party[0].lvl));if(s.party.length<3)s.party.push(m);else(s.roster=s.roster||[]).push(m)};
const rows=[];
for(let r=0;r<runs;r++){
  rp.s=A.rpNewState();A.rpApplyWorld();const s=rp.s;s.party=[A.rpMember('Pip',CL,1)];s.q.cls=1;s.mats={moss:0,shard:0,spore:0,scrap:0,fang:0};
  const t={fights:0,lose:0,time:0},st={};const L=()=>s.party.map(m=>m.name[0]+m.lvl).join('');
  t.time+=60+3*30+(30/4);/* intro, the Hatching's talk, walking round the green */
  join('Wizzle','mage',2);s.bag.ether+=2;st.hatch=L()+' '+Math.round(t.time/60)+'m';
  t.time+=113/4;for(let i=0;i<1+WALK;i++)enc('r1',t);
  if(FEN){t.time+=60;join('Fennel','cleric',2);enc('r1',t)}
  story(['scout','slinger'],{zone:'r1'},t);A.rpGiveXp(15);story(['scout','beetle','slinger'],{zone:'r1'},t);A.rpGiveXp(15);t.time+=30;inn(t);shop();
  st.lookouts=L();const g=boss(['tollboss','scout','slinger'],{boss:'tollboss'},t,'r1');
  st.grubb='x'+g.tries+' hp'+g.hp.toFixed(2)+' '+L();join('Bork','warrior',2);A.rpGiveXp(80);s.gold+=50;t.time+=40;upkeep();shop();inn(t);
  st.spark1=Math.round(t.time/60)+'m '+L();
  if(!FEN){join('Fennel','cleric',2)}
  t.time+=190/4;for(let i=0;i<2+WALK;i++)enc('r3',t);let guard=0;while(s.mats.scrap<3&&guard++<20)enc('r3m',t);st.scrap=guard+' pass fights';
  t.time+=90;inn(t);shop();/* miners, hearth */
  const c=boss(['collector','thief','gunner'],{boss:'collector',zone:'C'},t,'r3m');
  st.snipe='x'+c.tries+' hp'+c.hp.toFixed(2)+' '+L();A.rpGiveXp(150);s.gold+=80;
  st.spark2=Math.round(t.time/60)+'m '+L()+' fights '+t.fights+' lost '+t.lose+' gold '+s.gold;
  rows.push(st)}
for(const k of Object.keys(rows[0]))console.log(k.padEnd(9),rows.map(r=>r[k]).join(' | '));
