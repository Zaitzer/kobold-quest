const {chromium}=require('playwright');
const SAVE=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'../fixtures/save_v2.json'),'utf8'));
(async()=>{const b=await chromium.launch();
for(const vp of [{n:'portrait',width:390,height:844},{n:'landscape',width:844,height:390}]){
 const p=await b.newPage({viewport:{width:vp.width,height:vp.height},hasTouch:true,isMobile:true,deviceScaleFactor:2});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{try{localStorage.setItem('kobold-pit-rpopt',JSON.stringify({}))}catch(e){}});await p.goto('file://'+require('path').join(__dirname,'../../dist/kq_test.html'));await p.addStyleTag({content:'#boot{display:none!important}'});
 await p.evaluate(s=>localStorage.setItem('kobold-pit-rpg',JSON.stringify(s)),SAVE);
 await p.tap('#go-rpg');await p.waitForTimeout(400);
 const pos0=await p.evaluate(()=>__rp.s.x+','+__rp.s.y);
 // thumbstick: press on map and drag right, hold
 const box=await p.locator('#rpcv').boundingBox();
 const cdp=await p.context().newCDPSession(p);
 const tp=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
 const x0=box.x+box.width*.5,y0=box.y+box.height*.6;
 const rot=await p.evaluate(()=>__rp.rot);/* sideways view on an upright phone: screen-down is game-right */
 const mv=(d,e)=>rot?tp('touchMove',x0-e,y0+d):tp('touchMove',x0+d,y0+e);
 await tp('touchStart',x0,y0);await p.waitForTimeout(50);await mv(30,2);await mv(45,2);
 await p.waitForTimeout(150);await p.screenshot({path:__dirname+'/../out/hold_'+vp.n+'_stick.png'});await p.waitForTimeout(600);await tp('touchEnd');
 await p.waitForTimeout(300);
 await p.tap('#rp-panel [data-rp="menu"]');await p.waitForTimeout(100);await p.tap('#rp-panel [data-rp="close"]');
 const pos1=await p.evaluate(()=>__rp.s.x+','+__rp.s.y);
 const sw=await p.evaluate(()=>[document.documentElement.scrollWidth,innerWidth,document.documentElement.scrollHeight,innerHeight]);
 console.log(vp.n,'x before',pos0,'after stick',pos1,'dims',sw);
 await p.screenshot({path:__dirname+'/../out/hold_'+vp.n+'_map.png'});
 await p.tap('#rp-panel [data-rp="hero"]');await p.waitForTimeout(250);await p.screenshot({path:__dirname+'/../out/hold_'+vp.n+'_hero.png'});
 await p.locator('#rp-hero [data-hh="close"]').click();
 console.log(vp.n,'errors',errs);await p.close()}
await b.close()})();
