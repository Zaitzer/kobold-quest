/* smoke: boot, title, play, walk, open menu, start a battle; no console errors; screenshots */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html');
(async()=>{const br=await chromium.launch();const errs=[];
 for(const vp of [{width:844,height:390},{width:390,height:844}]){
  const ctx=await br.newContext({viewport:vp,hasTouch:true,isMobile:true});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(vp.width+' pageerror '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(vp.width+' console '+m.text())});
  await p.goto(FILE);await p.evaluate(()=>sessionStorage.setItem('kobold-pit-booted','1'));await p.reload();await p.waitForTimeout(300);
  await p.screenshot({path:__dirname+'/../out/title_'+vp.width+'.png'});
  await p.click('#go-rpg');await p.waitForTimeout(500);
  for(let i=0;i<4;i++){const b=await p.$('#rp-panel button');if(!b)break;const t=await p.evaluate(()=>window.__rp.mode);if(t==='map')break;await b.click().catch(()=>{});await p.waitForTimeout(150)}
  await p.screenshot({path:__dirname+'/../out/play_'+vp.width+'.png'});
  await p.evaluate(()=>{window.__rp.s.party=window.__rp.s.party||[];window.__rpB.battle(['scout','slinger'])});await p.waitForTimeout(600);
  await p.screenshot({path:__dirname+'/../out/battle_'+vp.width+'.png'});
  console.log(vp.width,'mode',await p.evaluate(()=>window.__rp.mode));
  await ctx.close()}
 console.log(errs.length?errs.join('\n'):'no errors');await br.close()})();
