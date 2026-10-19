const {chromium}=require('playwright');
const SAVE=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'../fixtures/save_v2.json'),'utf8'));
(async()=>{const b=await chromium.launch();
for(const vp of [{n:'p',width:390,height:844},{n:'se',width:375,height:667},{n:'l',width:844,height:390}]){
 const p=await b.newPage({viewport:{width:vp.width,height:vp.height},hasTouch:true,isMobile:true,deviceScaleFactor:2});if(process.env.MOCK){await p.exposeBinding('__relay',async()=>null);await p.addInitScript(require('./netmock.js')('u_alice'))}
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{try{localStorage.setItem('kobold-pit-rpopt',JSON.stringify({}))}catch(e){}});await p.goto('file://'+require('path').join(__dirname,'../../dist/kq_test.html'));await p.addStyleTag({content:'#boot{display:none!important}'});
 await p.evaluate(s=>localStorage.setItem('kobold-pit-rpg',JSON.stringify(s)),SAVE);
 await p.tap('#go-rpg');await p.waitForTimeout(400);await p.evaluate(()=>{__rp.grace=999});
 const cv0=await p.locator('#rpcv').boundingBox();
 const j=await p.locator('#rp-panel [data-joy]').boundingBox();
 const cdp=await p.context().newCDPSession(p);const cx=j.x+j.width/2,cy=j.y+j.height/2;
 const pos0=await p.evaluate(()=>({...__rp.pos}));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy}]});
 for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+i*9,y:cy-i*3}]});
 await p.waitForTimeout(200);await p.screenshot({path:__dirname+'/../out/joy_'+vp.n+'.png'});await p.waitForTimeout(800);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(150);
 const pos1=await p.evaluate(()=>({...__rp.pos}));
 await p.waitForTimeout(300);const pos2=await p.evaluate(()=>({...__rp.pos}));
 // open a dialogue: the board must keep its size
 console.log('mode before',await p.evaluate(()=>__rp.mode),(await p.locator('#rp-panel').innerText()).slice(0,80).replace(/\n/g,' '));await p.evaluate(()=>{__rp.mode='map';__rp.dlg=null;const s=__rp.s;s.x=12;s.y=24;s.face='down'});await p.waitForTimeout(150);
 const cv1=await p.locator('#rpcv').boundingBox();
 await p.tap('#rp-panel [data-rp="act"]');await p.waitForTimeout(300);const cv2=await p.locator('#rpcv').boundingBox();
 await p.screenshot({path:__dirname+'/../out/joy_'+vp.n+'_dlg.png'});
 await p.tap('#rp-panel [data-rp="menu"]',{timeout:1000}).catch(()=>{});
 console.log(vp.n,'walk',pos0.x.toFixed(2),pos0.y.toFixed(2),'->',pos1.x.toFixed(2),pos1.y.toFixed(2),'stopped',pos1.x===pos2.x,'board map',Math.round(cv1.height),'dialog',Math.round(cv2.height),'errors',errs);
 await p.close()}
await b.close()})();
