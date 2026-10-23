/* v6 items (build step 13; items.md, systems.md §8): every chest, shop row and recipe in the documents exists in the game; bonuses,
   sets and uniques change the sheet; drops follow the rule; equipping, selling at 35%, the smith, potions in a fight */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};const ok=(c,m)=>{checks++;if(!c)bad(m)};
const X=require('../lib/game.js')();X.rp.headless=true;X.rp.autoParty=true;
function fresh(cls){X.rp.s=X.rpNewState();X.rp.mode='map';const pack=[X.v6Kobold('Pip',cls||'fighter',5,{hero:1}),X.v6Kobold('Wizzle','sorcerer',5)];X.w6Start(pack,{map:'pebblebrook'});X.rp.s.w6st.seen={};return X.rp.s}
// every chest of systems.md §8: its contents come out
for(const C of X.CHESTS6){fresh();const g0=X.rp.s.gold;const got=X.v6OpenChest(C.name);ok(got.length===C.items.length,'chest "'+C.name+'" gives '+C.items.length+' things: '+got.join(', '));
  if(C.place){const P=C.place;ok(X.w6ChestAt(P,C.x,C.y)||(X.MAPS6[P].rows[C.y]||'')[C.x]==='c','chest "'+C.name+'" stands on its map mark')}}
{fresh();const n0=(X.rp.s.inv6||[]).length;X.w6Go('r1',33,19);X.rpInteractAt(33,20);ok((X.rp.s.inv6||[]).length===n0+1&&X.rp.s.inv6.some(i=>i.n==='Frog boots'),'the pond chest on R1 holds the Frog boots')}
// the shops (systems.md §8): Hearthspire T1, every slot, robe and scout, the wave-1 families; Pebblebrook T2 from level 5 and the feather
{const s=fresh();const H=X.v6ShopStock('hearthspire');ok(H.filter(i=>i.k==='gear').every(i=>i.tier===0),'Hearthspire sells T1');
 for(const slot of ['weapon','armour','shield','helm','boots','cloak','neck','ring'])ok(H.some(i=>i.slot===slot),'Hearthspire sells a '+slot);ok(H.some(i=>i.v==='robe')&&H.some(i=>i.v==='scout'),'robe and scout variants');
 ok(X.WAVE_FAMS.every(f=>H.some(i=>i.fam===f)),'a weapon for each wave-1 family');ok(H.some(i=>i.n==='Potion')&&H.some(i=>i.n==='Ether'),'potions and ethers');
 s.party[0].lvl=4;ok(X.v6ShopStock('pebblebrook').filter(i=>i.k==='gear').every(i=>i.tier===0),'Pebblebrook sells T1 before level 5');s.party[0].lvl=5;
 const P=X.v6ShopStock('pebblebrook');ok(P.filter(i=>i.k==='gear').every(i=>i.tier===1),'and T2 from level 5');ok(P.some(i=>i.n==='Phoenix feather'),'Pebblebrook sells the Phoenix feather');
 s.gold=1000;const i=P.findIndex(i=>i.slot==='armour'&&i.v==='plain'),price=X.v6Price(P[i]);ok(X.v6Buy('pebblebrook',i)&&s.gold===1000-price,'buying costs its price ('+price+')');
 const it=s.inv6[s.inv6.length-1];ok(X.v6Sell(it.id)&&s.gold===1000-price+Math.floor(price*0.35),'selling gives 35%')}
// the smith: every T2 recipe of items.md §8, from materials
{const s=fresh();const R=X.v6Recipes('pebblebrook');ok(R.length===X.RECIPES6.filter(r=>r.tier===2).length&&R.length===4,'the Pebblebrook smith has the four T2 recipes');
 ok(!X.v6Craft('pebblebrook',0),'no materials, no cape');s.mats6={'Moss tuft':5,'Gold scrap':5};const it=X.v6Craft('pebblebrook',0);ok(it&&it.slot==='cloak'&&s.mats6['Moss tuft']===0,'five moss make the Moss cape+');
 ok(R.every(r=>X.needOf(r).length>0),'every recipe\'s needs are understood')}
// wearing: a bonus raises its stat; two set pieces give 40% of the set's regen, three all; the copper-cart wheel cuts ranged damage
{const s=fresh();const m=s.party[0],a0=X.v6Stats(m).atk;X.v6Take(X.v6Piece('ring',1,{aff:['Mighty']}));const id=s.inv6[s.inv6.length-1].id;ok(X.v6Equip6(m,id),'a ring is worn');ok(X.v6Stats(m).atk>a0,'Mighty adds attack');
 for(const [slot,n] of [['helm','Leaf crown'],['cloak','Moss cape']]){X.v6Take(X.v6Piece(slot,0,{n,set:'Mossback regalia'}));X.v6Equip6(m,s.inv6[s.inv6.length-1].id)}
 ok(Math.abs(X.v6Stats(m).regen-0.01)<1e-9,'two Mossback pieces: 40% of 2.5% regen: '+X.v6Stats(m).regen);X.v6Take(X.v6Piece('boots',0,{n:'Frog boots',set:'Mossback regalia'}));X.v6Equip6(m,s.inv6[s.inv6.length-1].id);ok(Math.abs(X.v6Stats(m).regen-0.025)<1e-9,'three: all of it');
 ok(!X.v6Equip6(s.party[1],(X.v6Take(X.v6Piece('weapon',0,{fam:'blades'}))).id),'a sorcerer cannot wield a blade');
 X.v6Take(X.v6Piece('shield',1,{n:'Copper-cart wheel',uniq:'Copper-cart wheel'}));X.v6Equip6(m,s.inv6[s.inv6.length-1].id);ok(X.v6Stats(m).rangedTaken===-0.1,'the copper-cart wheel: −10% ranged damage taken');
 ok(X.v6Unequip(m,'helm')&&!m.gear.helm,'taking a piece off')}
// drops by the rule over many fights: about 40% a material, 8% gear, 6% a consumable; a boss drops its unique once and a fang
{const s=fresh();let mats=0,gear=0,use=0;const N=3000;for(let i=0;i<N;i++){s.mats6={};s.inv6=[];s.bag={};X.rp.s.w6='mine1';const out=X.v6Drops({units:[]});if(Object.keys(s.mats6).length)mats++;if(s.inv6.length)gear++;if(Object.values(s.bag).some(v=>v>0))use++}
 ok(Math.abs(mats/N-0.4)<0.04&&Math.abs(gear/N-0.08)<0.02&&Math.abs(use/N-0.06)<0.02,'drops: '+(mats/N*100).toFixed(0)+'% material, '+(gear/N*100).toFixed(1)+'% gear, '+(use/N*100).toFixed(1)+'% consumable');
 const boss={units:[{E:{v6boss:1,n:'Grubb'}}]};s.inv6=[];X.v6Drops(boss);ok(s.inv6.some(i=>i.n==='Toll pot'),'Grubb drops the Toll pot');X.v6Drops(boss);ok(s.inv6.filter(i=>i.n==='Toll pot').length===1,'once');ok(s.mats6['Boss fang']>=1,'and a boss fang')}
// a potion in a v6 fight heals 35% of max HP
{const s=fresh();s.bag.potion=1;X.rp.autoParty=false;X.w6Fight('r1',X.W6_ENC.r1);const b=X.rp.bt;b.seq=[];b.step=null;const u=b.units.find(u=>u.side===0);u.m.hp=1;u.ap=2;X.tcDo(u,{k:'it',it:'potion',t:u});let k=0;b.cur=u;while((b.seq.length||b.step)&&k<500){b.phase='busy';X.rpBattleStep(1/30);k++}
 ok(u.m.hp===1+Math.round(X.v6Stats(u.m).hp*0.35),'a potion heals 35%: '+u.m.hp);X.rp.bt=null;X.rp.mode='map';X.rp.autoParty=true}
console.log(fails?fails+' failures':'v6 items: '+checks+' checks');process.exitCode=fails?1:0;
