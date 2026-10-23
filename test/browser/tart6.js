/* v6 sprite sheets (build step 19): a drawn sheet shows in the game (the test build carries three: Pip, Wizzle and a cellar rat, in
   test/fixtures/art), a character without one keeps its look drawn in code, the hero's sheet takes the hero's colour, and nothing
   errors on the map, in a fight or on a friend's mirror. */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html')+'?v6';
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:844,height:390}});const errs=[],fail=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE);await p.evaluate(()=>sessionStorage.setItem('kobold-pit-booted','1'));await p.reload();await p.waitForTimeout(300);await p.click('#go-rpg');await p.waitForTimeout(300);
  await p.evaluate(()=>{__v6.pack([['Pip','fighter',5],['Wizzle','sorcerer',5],['Glint','bard',5]]);const P=__rp.s.party;P[1].cid='wizzle';P[2].cid='glint';__rp.s.hero=__rp.s.hero||{name:'Pip'};__rp.s.hero.colour='blue';__rp.grace=1e9});
  await p.waitForTimeout(600);
  const S=await p.evaluate(()=>({pip:__v6.sheets.kob(0),wiz:__v6.sheets.kob(1),glint:__v6.sheets.kob(2),rat:__v6.sheets.foe('cellar_rat'),scout:__v6.sheets.foe('nettlenose_scout'),draws:__v6.sheets.draws(),blue:__v6.sheets.blue()}));
  if(S.pip!=='characters/heroes/pip')fail.push('the hero has no sheet: '+S.pip);if(S.wiz!=='characters/companions/wizzle')fail.push('Wizzle has no sheet: '+S.wiz);
  if(S.glint!==null)fail.push('Glint has no drawing, so no sheet: '+S.glint);if(S.rat!=='foes/hearthspire/cellar-rat'||S.scout!==null)fail.push('foes: '+S.rat+' / '+S.scout);
  if(!(S.draws>0))fail.push('no sheet was drawn on the map');if(!S.blue||!(S.blue.b>50)||S.blue.o>0)fail.push('the hero\'s colour: '+JSON.stringify(S.blue));
  const tile=await p.evaluate(()=>{__w6go('r1',10,12);return new Promise(ok=>setTimeout(()=>{const c=document.getElementById('rpcv'),g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]===90&&d[i+1]===200&&d[i+2]===90)n++;ok(n)},700))});
  if(!(tile>1000))fail.push('the drawn grass tile is not on the map: '+tile+' pixels');
  await p.screenshot({path:__dirname+'/../out/art6_map.png'});
  const d0=await p.evaluate(()=>__v6.sheets.draws());await p.evaluate(()=>__v6.fight([['cellar_rat',1],['nettlenose_scout',4]]));await p.waitForTimeout(400);await p.evaluate(()=>__rpB.btn({tac:'auto'}));await p.waitForTimeout(1200);
  const d1=await p.evaluate(()=>__v6.sheets.draws());if(!(d1>d0))fail.push('no sheet drawn in the fight');
  await p.screenshot({path:__dirname+'/../out/art6_fight.png'});
  console.log('art6 '+(fail.length?fail.join('; '):'ok')+' '+JSON.stringify(S),'errors',JSON.stringify(errs));await br.close();process.exitCode=(fail.length||errs.length)?1:0})();
