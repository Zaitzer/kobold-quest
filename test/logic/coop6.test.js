/* v6 co-op rules (build step 15, systems.md §12) that need no second page: revive, buffs that don't stack across players,
   personal XP, a leaver's kobolds guarding, level sync and the friend's party checked as it arrives. The two-page fight is browser/tcoop6. */
process.emitWarning=()=>{};
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m)}};
const X=require('../lib/game.js')();X.rp.headless=true;
function start(){X.rp.s=X.rpNewState();X.rpApplyWorld();X.v6Lab.pack=['fighter','cleric','wizard','rogue'];X.v6Lab.lvl=5;X.v6Lab.place=0;X.v6Lab.theme='';X.v6Lab.ks=null;X.v6LabStart();
  const b=X.rp.bt,k=b.units.filter(u=>u.side===0);k[2].own='g';k[3].own='g';return{b,k}}
// revive: only another player's downed kobold, beside it, 1 AP, 25% HP
{const {b,k}=start();const [a,c,g]=k;g.x=a.x+1;g.y=a.y;g.hp=0;c.hp=0;c.x=a.x-1;c.y=a.y;
 ok(!X.v6ReviveOK(b,a,c),'my own downed kobold cannot be helped up');ok(X.v6ReviveOK(b,a,g),'a friend\'s downed kobold beside me can');
 a.ap=2;ok(X.tcDo(a,{k:'revive',t:g}),'revive works');ok(a.ap===1,'revive costs 1 AP: '+a.ap);ok(g.hp===Math.round(g.max*0.25),'up with 25% HP: '+g.hp+'/'+g.max);
 g.hp=0;g.x=a.x+3;a.ap=2;ok(!X.tcDo(a,{k:'revive',t:g})&&a.ap===2,'too far: nothing, no AP spent')}
// buffs: one player's add up, two players' do not stack
{const {b,k}=start();const u=k[0];u.vb=[{k:'atk',v:2,turns:2,own:'h'},{k:'atk',v:1,turns:2,own:'h'}];ok(X.v6Buff(u,'atk')===3,'one player\'s buffs add up');
 u.vb.push({k:'atk',v:2,turns:2,own:'g'});ok(X.v6Buff(u,'atk')===3,'a second player\'s smaller buff does not stack');
 u.vb.push({k:'atk',v:2,turns:2,own:'g'});ok(X.v6Buff(u,'atk')===4,'the strongest player\'s total counts');
 u.vb=[{k:'def',v:-1,turns:1,own:''},{k:'def',v:2,turns:1,own:'h'}];ok(X.v6Buff(u,'def')===1,'a foe\'s debuff still counts: '+X.v6Buff(u,'def'))}
// XP is personal: only this player's kobolds
{const {b,k}=start();const xs=k.map(u=>u.m.xp);const ups=[];X.v6GiveXp(b,10,ups);ok(k[0].m.xp===xs[0]+10&&k[2].m.xp===xs[2],'the host gives XP to its own kobolds only');
 b.net={role:'guest'};X.v6GiveXp(b,10,ups);ok(k[2].m.xp===xs[2]+10&&k[0].m.xp===xs[0]+10,'the guest gives XP to its own')}
// a leaver's kobold guards on its turn
{const {b,k}=start();const g=k[2];g.ctl='guard';b.queue=[g];b.cur=null;b.over=null;b.phase='busy';b.seq=[];X.tcNext();ok(g.guard===1&&g.ap===0,'a leaver\'s kobold guards: '+g.guard+' '+g.ap)}
// level sync and the friend's party
{const m=X.v6Kobold('Tansy','rogue',9,{});m.hp=Math.round(X.v6Stats(m).hp/2);const c=X.netLevelSync(m,5);ok(c.lvl===5&&c.synced===9&&m.lvl===9,'synced to 5, the real kobold untouched');
 ok(Math.abs(c.hp/X.v6Stats(c).hp-0.5)<0.06,'the same share of HP');
 const p=X.netCleanParty([Object.assign(X.v6PackKobold(m),{skills:['nope'].concat(m.skills),lvl:99,name:'x'.repeat(40)}),{v6:1,cls:'dragon'}]);
 ok(p.length===1&&p[0].lvl===30&&p[0].name.length===16&&!p[0].skills.includes('nope'),'a friend\'s party is checked: '+JSON.stringify(p.map(x=>[x.lvl,x.name.length,x.skills])))}
// XP suited to the real level: a synced kobold gets the same share of its own level
{const {b,k}=start();b.syncCap=5;const m=k[0].m;m.lvl=9;m.xp=0;X.v6GiveXp(b,10,[]);ok(m.xp===Math.round(10*X.v6XpNeed(9)/X.v6XpNeed(5)),'synced XP scaled up: '+m.xp);
 const c=k[1].m;c.xp=0;X.v6GiveXp(b,10,[]);ok(c.xp===10,'an unsynced kobold gets the plain XP: '+c.xp)}
// a shared fight is not retried at once
{const {b}=start();b.over='lose';b.boss='x';b.net={role:'host'};ok(!X.v6CanRetry(b),'no instant retry in a shared fight')}
// boss credit: counts when the friend's story has reached the scene, else a helper's mark
{X.rp.s=X.rpNewState();const pack=['fighter'].map(c=>X.v6Kobold('Pip',c,5,{hero:1}));X.w6Start(pack);const st=X.rp.s.w6st,q=X.rp.s.q;
 const sc=X.SCENES6.find(c=>c.steps.some(x=>x[0]==='fight'&&x[1]==='grubb'));ok(!!sc,'Grubb is fought in a scene');
 Object.keys(q).forEach(k=>delete q[k]);X.s6SharedWin('grubb');ok(st.helps===1&&!(st.beat||{}).grubb,'not reached yet: a helper\'s mark');
 Object.assign(q,sc.when||{});for(const [k,v] of Object.entries(q))if(v&&typeof v==='object')q[k]=v.gte!=null?v.gte:v.lte!=null?v.lte:0;
const due=!st.seen||!st.seen[sc.id];X.s6SharedWin('grubb');ok(due&&st.beat&&st.beat.grubb===1,'reached: it counts '+JSON.stringify(sc.when));
 st.seen=st.seen||{};st.seen[sc.id]=1;delete st.beat.grubb;X.s6SharedWin('grubb');ok(st.helps===2,'already played: a helper\'s mark')}
// phasing: Hearthspire's morning is your own copy of the place
{X.rp.s.q.act=3;const a=X.rpPlace();X.rp.s.q.act=7;const c=X.rpPlace();ok(/:own:/.test(a)&&!/:own/.test(c),'phased in act 1 only: '+a+' / '+c)}
console.log((fails?'FAIL':'ok')+' v6 co-op: '+checks+' checks');process.exitCode=fails?1:0;
