/* v6 talents, kit, dark versions and leader points (build step 7; skills.md §2, corruption.md §1, balance.md §3) */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};const ok=(c,m)=>{checks++;if(!c)bad(m)};
const X=require('../lib/game.js')();X.rp.headless=true;X.rp.autoParty=true;
// a level from 1: one pick waiting, three cards of three kinds
{const m=X.v6Kobold('T','fighter',1,{passives:[],skills:['fighter_power_bonk'],known:['fighter_power_bonk']});X.v6LevelUp(m);ok(m.lvl===2&&m.pend===1,'level 2 brings one pick');
 const c=X.v6Cards(m);ok(c.map(x=>x.k).join()==='score,skill,passive','three cards, one of each kind: '+c.map(x=>x.k));ok(c[1].opts[0]==='fighter_cleave','the skill card offers Cleave at level 2');
 ok(X.v6Pick(m,'skill','fighter_cleave'),'taking Cleave');ok(m.known.includes('fighter_cleave')&&m.skills.includes('fighter_cleave')&&m.pend===0,'Cleave known and equipped, no pick left');ok(!X.v6Cards(m),'no cards without a pick');
 X.v6LevelUp(m);const STR=m.scores.STR;ok(X.v6Pick(m,'score','STR')&&m.scores.STR===STR+1,'a score card adds 1');
 X.v6LevelUp(m);const hp=X.v6Stats(m).hp;X.v6Pick(m,'passive','Tough');ok(X.v6Stats(m).hp>hp,'Tough raises HP');
 X.v6LevelUp(m);ok(X.v6Cards(m)[1].opts[0]==='fighter_shield_bash','Shield bash waits at 5');X.v6Pick(m,'skill','fighter_shield_bash');X.v6LevelUp(m);const r=X.v6Cards(m).find(x=>x.k==='rank');ok(r&&r.opts.includes('fighter_cleave'),'with no skill waiting the card offers a rank');X.v6Pick(m,'rank','fighter_cleave');ok(m.ranks.fighter_cleave===2,'rank 2');
 ok(Math.abs(X.v6RankMul(m,'fighter_cleave')-1.15)<1e-9,'rank 2 is +15%')}
// the monk's score card points at its lowest score
{const m=X.v6Kobold('M','monk',3);m.pend=1;const c=X.v6Cards(m)[0],low=Object.keys(m.scores).sort((a,b)=>m.scores[a]-m.scores[b])[0];ok(c.opts.length===1&&c.opts[0]===low,'the monk\'s card is its lowest score')}
// the subclass at 8: two skills at 8 and 16
{const m=X.v6Kobold('T','ranger',7);ok(!X.v6SubOptions(m).length,'no subclass before 8');X.v6LevelUp(m);ok(X.v6SubOptions(m).length===2,'two subclasses offered at 8');X.v6ChooseSub(m,'Sniper');ok(m.known.includes('ranger_headshot'),'Headshot at 8');
 ok(!m.known.includes('ranger_long_shot'),'Long shot waits for 16');while(m.lvl<16)X.v6LevelUp(m);ok(m.known.includes('ranger_long_shot'),'Long shot at 16')}
// the kit: four at most, only at rest; dark versions open with corruption
{const m=X.v6Kobold('W','wizard',14);ok(m.skills.length===4,'four equipped');ok(!X.v6Equip(m,'wizard_arcane_shield')||m.skills.length<=4,'never a fifth');
 X.v6Equip(m,'wizard_ice_bolt');ok(!m.skills.includes('wizard_ice_bolt'),'unequip');ok(X.v6Equip(m,'wizard_ice_bolt'),'equip again');
 ok(!X.v6ToggleDark(m,'wizard_fireball'),'no dark version below corruption 10');m.corr=10;ok(X.v6ToggleDark(m,'wizard_fireball')&&m.dark.wizard_fireball,'dark Fireball at 10');
 X.v6LevelUp(m);while(m.lvl<8)X.v6LevelUp(m);}
{const m=X.v6Kobold('W','wizard',8,{sub:'Archmage'});X.v6SubGrant(m);m.corr=10;ok(!X.v6DarkOpen(m,'wizard_meteor'),'subclass dark versions wait for 25');m.corr=25;ok(X.v6DarkOpen(m,'wizard_meteor'),'and open at 25')}
// a dark heal is ×1.25 and adds corruption; a ranked heal is +15%
{X.rp.s=X.rpNewState();X.rpApplyWorld();X.v6Lab.pack=['cleric','fighter',null,null];X.v6Lab.lvl=5;X.v6Lab.place=0;X.v6Lab.ks=null;X.v6LabStart();X.rp.autoParty=false;const b=X.rp.bt,[c,f]=b.units.filter(u=>u.side===0);
 ok(Math.abs(X.v6HealMul(c,{sk:'cleric_heal',dark:1})-1.25)<1e-9,'a dark heal is ×1.25');c.m.ranks={cleric_heal:3};ok(Math.abs(X.v6HealMul(c,{sk:'cleric_heal'})-1.3)<1e-9,'rank 3 heals +30%');X.rp.autoParty=true}
// Pip's leader points: one every second level; Might raises the pack's attack and defence by 1% a point
{const m=X.v6Kobold('Pip','fighter',10,{hero:1,lead:{might:0,wits:0,lead:0}});ok(X.v6LeadTotal(m)===5&&X.v6LeadFree(m)===5,'five points at level 10');ok(X.v6LeadAdd(m,'might'),'spend one');ok(X.v6LeadFree(m)===4,'four left');
 const a=X.v6Kobold('A','fighter',30,{hero:1});ok(X.v6LeadTotal(a)===15&&X.v6LeadFree(a)===0,'the test hero has spent its 15 points');
 X.rp.s=X.rpNewState();X.rpApplyWorld();X.v6Lab.pack=['fighter','rogue',null,null];X.v6Lab.lvl=10;X.v6Lab.place=1;X.v6Lab.ks=null;X.v6LabStart();const b=X.rp.bt,[p,r]=b.units.filter(u=>u.side===0),e=b.units.find(u=>u.side===1);
 p.m.lead={might:0,wits:0,lead:0};const d0=X.v6DmgRange(b,r,e,1,{})[1];p.m.lead={might:10,wits:0,lead:0};const d1=X.v6DmgRange(b,r,e,1,{})[1];ok(d1>d0,'Might makes the whole pack hit harder: '+d1+' vs '+d0);
 p.m.lead={might:0,wits:0,lead:5};ok(Math.abs(X.v6PackMorale(b)-X.v6PackMorale(Object.assign({},b,{units:b.units.map(u=>u===p?Object.assign({},u,{m:Object.assign({},p.m,{lead:{might:0,wits:0,lead:0}})}):u)}))-1)<1e-9,'five Leadership is +1 morale')}
// the sheet screen renders every part
{X.v6Lab.ks=[X.v6Kobold('Pip','fighter',9,{hero:1}),null,null,null];X.v6Lab.ks[0].pend=1;X.v6Lab.ks[0].corr=12;const h=X.v6SheetHtml();
 for(const w of ['Pick a talent','Choose a subclass','Skills','Dark:','Leader points','Defence','Corruption'])ok(h.includes(w),'the sheet shows '+w)}
console.log(fails?fails+' failures':'v6 talents, kit, dark versions, leader points: '+checks+' checks');process.exitCode=fails?1:0;
