/* v6 combat rules (build step 5): src/battle/v6rules.js against the design's model (tools/balance-model.js) and the numbers
   balance.md states. Every line of `node tools/balance-model.js rules` has a check here. */
process.emitWarning=()=>{};
const path=require('path');let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};
const near=(a,b,eps,what)=>{checks++;if(Math.abs(a-b)>eps)bad(what+': '+a+' vs '+b)};
const M=require('../../tools/balance-model.js');
(async()=>{const V=await import(path.join(__dirname,'../../src/battle/v6rules.js'));
  // 1 the level table's basic hit (9, 44, 119)
  for(const [L,want] of [[1,9],[10,44],[30,119]]){const r=M.ref(L);near(V.damage(r.atk,1,M.foeDef(L),0,0.5),want,1,'basic hit at L'+L)}
  near(V.HF(10,10),1,1e-9,'equal attack and defence');near(V.HF(100,1),1+0.05*40*99/101,1e-9,'factor high');near(V.HF(1,100),0.3,1e-9,'factor floor');
  // 2 the hit formula equals the model's odds() on sampled situations
  for(const c of ['fighter','barbarian','rogue','ranger','wizard','cleric'])for(const sit of [{tiles:1},{tiles:4,cover:1},{tiles:6,unseen:1},{tiles:2,flank:1}]){
    const kind=c==='ranger'?'ranged':['wizard','cleric'].includes(c)&&c==='wizard'?'spell':'melee';const o=M.odds(c,kind,sit,{});
    const x=M.CX[c]||{acc:0};let mine;
    if(kind==='spell')mine=V.spellLand({tiles:sit.tiles,steady:x.steady,unseen:sit.unseen});
    else mine=V.hitChance({kind,acc:100*(x.acc||0),dodge:10,cover:sit.cover?20:0,tiles:sit.tiles,steady:x.steady,unseen:sit.unseen});
    near(mine,o.p,1e-9,c+' '+JSON.stringify(sit)+' hit')}
  near(V.hitChance({kind:'melee',dodge:0}),1,0,'no dodge is a sure hit in melee');
  near(V.hitChance({kind:'ranged',dodge:10,tiles:5,steady:5}),0.70,1e-9,'reed bow at 5 tiles is 70% (balance.md example)');
  near(V.MAP(1,true),4,0,'light weapons −4');near(V.MAP(2,false),10,0,'third attack −10');
  // 3 Balance (100 / 80 / 52 / 93%) and the score modifier
  const sc=v=>Object.fromEntries(V.SCORES.map((k,i)=>[k,v[i]]));
  near(V.balanceOf(sc([12,12,12,12,12,12])),1,1e-9,'Balance 12x6');near(V.balanceOf(sc([15,14,13,12,10,8])),0.80,0.005,'Balance standard array');
  near(V.balanceOf(sc([20,20,10,8,8,6])),0.52,0.005,'Balance stacked');near(V.balanceOf(sc([13,13,12,12,11,11])),0.93,0.005,'Balance 93');
  near(V.modOf(15),2,0,'mod 15');near(V.modOf(8),-1,0,'mod 8');
  // 4 luck (83.4%, 8.7%, foes 78.4%)
  near(V.tilt(0.82,1),0.834,0.001,'luck hit');near(V.tilt(0.08,1),0.087,0.001,'luck crit');near(V.tilt(0.8,-1),0.784,0.001,'luck on being hit');
  // 5 morale (+7.1, 12.5, 16.7, 25, 33.3% actions)
  [[1,7.1],[2,12.5],[3,16.7],[6,25],[12,33.3]].forEach(([m,w])=>near(V.moraleP(m)/2*100,w,0.1,'morale '+m));
  near(V.bondFactor(30),M.foeScale(30),1e-9,'bond factor L30');near(V.bondFactor(10),M.foeScale(10),1e-9,'bond factor L10');
  // 6 the timeline: turns in 100 ticks at initiative 10, 11, 12, 14
  for(const I of [10,11,12,14]){const u=[{id:1,side:0,x:0,hp:1,init:I}];let n=0;for(let t=0;t<100;t++)n+=V.tick(u).length;near(n,90+I,0,'timeline turns at I '+I)}
  {const units=[{id:1,side:1,x:0,hp:1,init:10},{id:2,side:0,x:5,hp:1,init:10},{id:3,side:0,x:2,hp:1,init:12}];const p=V.preview(units,3);
   checks++;if(p.join()!=='3,2,1')bad('timeline order: '+p.join())
   const units2=units.map(u=>Object.assign({},u,{ct:0}));let extra=0;for(let t=0;t<50;t++){const o=V.tick(units2);if(o.filter(u=>u.id===3).length===2)extra++}checks++;if(extra!==1)bad('initiative 12 gains one extra turn in 50 ticks, got '+extra)}
  {const units=[{id:1,side:1,x:0,hp:1,init:10},{id:2,side:0,x:5,hp:1,init:10}];const o=V.tick(units).map(u=>u.id);checks++;if(o.join()!=='2,1')bad('ties: the pack first, got '+o)}
  // 7 crit builds on the board by value (P22): a plain ×1.5 build is unchanged; a jackpot gets a tiny share of a flank
  near(V.critChance({flank:1}),0.23,1e-9,'flanked plain crit');
  near(V.critChance({base:0.01,D:116,beta:0.25,flank:1}),0.01+0.15*0.5/115.75,1e-12,'flanked jackpot crit by value');
  // 8 burn and poison (0.75 and 1.5 basic hits on a standard foe)
  near(V.dotAmount('burn',400,400)*3/100,0.75,1e-9,'burn on a 4-hit foe');near(V.dotAmount('poison',400,400)*3/100,1.5,1e-9,'poison');
  near(V.dotAmount('poison',5000,400),50,1e-9,'a boss takes no more than a standard foe');
  // quick attacks and dark versions
  near(V.QUICK_MUL,0.635,0.001,'quick ×0.635');near(V.darkMul(10),1.25,0,'dark ×1.25');near(V.darkMul(50),1.4,0,'dark ×1.4 at 50');
  near(V.statusLand({}),0.8,1e-9,'status 80%');near(V.statusLand({kind:'boss'}),0.4,1e-9,'boss status 40%');
  console.log(fails?fails+' failures':'v6 rules: '+checks+' checks agree with the model and balance.md');process.exitCode=fails?1:0})();
