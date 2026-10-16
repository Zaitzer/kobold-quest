const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+require('path').join(__dirname,'../../dist/kq_test.html'));await p.waitForTimeout(2200);await p.screenshot({path:__dirname+'/../out/menu_only.png'});
 const vis=await p.evaluate(()=>[...document.querySelectorAll('#v-menu .mode')].filter(e=>e.offsetParent).map(e=>e.id));
 await p.tap('#go-rpg');await p.waitForTimeout(500);const mode=await p.evaluate(()=>__rp.mode);
 await p.evaluate(()=>{const b=[...document.querySelectorAll('#rp-panel button')].find(x=>x.dataset.rp==='next');b&&b.click()});
 console.log('visible modes',vis,'rpg mode',mode,'errors',errs);await b.close()})();
