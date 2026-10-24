/* The v6 screens at four sizes (build step 21; ui-design.md §10): the phone held sideways, a small iPhone SE, a big phone held
   upright, and the smallest the game must work at (568 × 320). Each screen opens without page errors, the panel never scrolls
   sideways, and the buttons people tap are at least 44 px tall (the battle board's own tiles aside). Screenshots go to test/out. */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html')+'?v6';
const SIZES=[['land',844,390],['se',667,375],['tall',390,844],['tiny',568,320]];
(async()=>{const br=await chromium.launch();const fail=[],errs=[];
 for(const [n,w,h] of SIZES){const p=await br.newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:true});p.on('pageerror',e=>errs.push(n+': '+e.message));
  await p.goto(FILE);await p.evaluate(()=>sessionStorage.setItem('kobold-pit-booted','1'));await p.reload();await p.waitForTimeout(300);await p.click('#go-rpg');await p.waitForTimeout(300);
  const look=async(name,set)=>{await p.evaluate(set);await p.waitForTimeout(250);
    const r=await p.evaluate(()=>{const P=document.getElementById('rp-panel');const small=[...P.querySelectorAll('button')].filter(b=>{const R=b.getBoundingClientRect();return R.width>0&&R.height>0&&R.height<43.5}).map(b=>b.textContent.trim().slice(0,12)+":"+Math.round(b.getBoundingClientRect().height)+":"+b.className);
      return{wide:P.scrollWidth>P.clientWidth+2,small,n:P.querySelectorAll('button').length}});
    if(r.wide)fail.push(n+' '+name+': the panel scrolls sideways');if(r.small.length)fail.push(n+' '+name+': small buttons '+JSON.stringify(r.small.slice(0,4)));
    await p.screenshot({path:__dirname+'/../out/smoke6_'+n+'_'+name+'.png'})};
  await look('heroes',()=>{});
  await p.evaluate(()=>{__v6.pack([['Pip','fighter',5],['Glint','cleric',5],['Wizzle','wizard',5],['Bork','bard',5]]);__walker.grace=1e9;__rp.s.hero=__rp.s.hero||{name:'Pip',colour:'orange'}});
  await look('map',()=>{__rp.mode='map'});
  await look('menu',()=>{__rp.mode='menu'});
  await look('sheet',()=>{__rp.mode='v6sheet'});
  await look('book',()=>{__rp.mode='v6book'});
  await look('settings',()=>{__rp.mode='v6set'});
  await look('log',()=>{__rp.mode='w6log'});
  await look('class',()=>{__rp.mode='w6class'});
  await look('shop',()=>{__rp.w6shop='hearthspire';__rp.w6tab='buy';__rp.mode='w6shop'});
  await look('dialog',()=>{__kq.say(['A line of dialogue, about as long as the script allows, which is one hundred and forty characters at most.','Two'],[{t:'Yes'},{t:'No'}])});
  await look('fight',()=>{__rp.dlg=null;__rp.mode='map';__v6.fight()});
  await p.evaluate(()=>__rpB.btn({tac:'auto'}));for(let i=0;i<40;i++){if(await p.evaluate(()=>__rp.bt&&__rp.bt.phase==='turn'))break;await p.waitForTimeout(250)}
  await look('turn',()=>{});
  await p.close()}
 console.log('smoke6 '+(fail.length?fail.join(' | '):'ok')+' errors '+JSON.stringify(errs.slice(0,5)));await br.close();process.exitCode=(fail.length||errs.length)?1:0})();
