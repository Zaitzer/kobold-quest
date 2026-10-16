const {chromium}=require('playwright');
const SAVE=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'../fixtures/save_v2.json'),'utf8'));
(async()=>{const b=await chromium.launch();
for(const vp of [{n:'p',width:390,height:844},{n:'se',width:375,height:667}]){
 const p=await b.newPage({viewport:{width:vp.width,height:vp.height},hasTouch:true,isMobile:true,deviceScaleFactor:2});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.goto('file://'+require('path').join(__dirname,'../../dist/kq_test.html'));await p.addStyleTag({content:'#boot{display:none!important}'});
 await p.evaluate(s=>localStorage.setItem('kobold-pit-rpg',JSON.stringify(s)),SAVE);
 await p.tap('#go-rpg');await p.waitForTimeout(500);await p.evaluate(()=>{__rp.grace=9999});
 const rot=await p.evaluate(()=>__rp.rot);
 await p.screenshot({path:__dirname+'/../out/rot_'+vp.n+'_map.png'});
 const cdp=await p.context().newCDPSession(p);
 // joystick: drag DOWN on the screen = RIGHT in the turned view
 const j=await p.locator('#rp-panel [data-joy]').boundingBox();const cx=j.x+j.width/2,cy=j.y+j.height/2;
 const pos0=await p.evaluate(()=>({...__rp.pos}));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy}]});for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx,y:cy+i*9}]});
 await p.waitForTimeout(600);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(100);
 const pos1=await p.evaluate(()=>({...__rp.pos}));
 // tap a map tile two to the right of Pip, using view-space -> screen mapping
 const scr=await p.evaluate(()=>{const s=__rp.s,c=document.getElementById('rpcv'),r=c.getBoundingClientRect(),tx=s.x+2,ty=s.y;const cw=c.clientWidth,ch=c.clientHeight,k=320/Math.min(cw,ch),VW=Math.round(cw*k),VH=Math.round(ch*k);const lx=((tx+.5)*32-__rp.cam.x)/VW,ly=((ty+.5)*32-__rp.cam.y)/VH;
   return __rp.rot?{x:r.right-ly*r.width,y:r.top+lx*r.height,tx,ty}:{x:r.left+lx*r.width,y:r.top+ly*r.height,tx,ty}});
 await p.touchscreen.tap(scr.x,scr.y);await p.waitForTimeout(900);
 const tile=await p.evaluate(()=>[__rp.s.x,__rp.s.y]);
 // battle
 await p.evaluate(()=>__rpB.battle(['scout','slinger'],{zone:','}));await p.waitForTimeout(500);await p.screenshot({path:__dirname+'/../out/rot_'+vp.n+'_place.png'});
 await p.evaluate(()=>__rpB.btn({tac:'start'}));for(let i=0;i<60;i++){if(await p.evaluate(()=>__rp.bt.phase==='turn'))break;await p.waitForTimeout(150)}
 const bt=await p.evaluate(()=>{const b=__rp.bt,u=b.cur,c=document.getElementById('rpcv'),r=c.getBoundingClientRect();b.camT=null;const tx=u.x,ty=u.y-2;const lx=((tx+.5)*40-b.cam.x)/360,ly=((ty+.5)*40-b.cam.y)/440;
   return{n:u.name,x0:u.x,y0:u.y,tx,ty,sx:__rp.rot?r.right-ly*r.width:r.left+lx*r.width,sy:__rp.rot?r.top+lx*r.height:r.top+ly*r.height}});
 await p.touchscreen.tap(bt.sx,bt.sy);await p.waitForTimeout(250);await p.screenshot({path:__dirname+'/../out/rot_'+vp.n+'_battle.png'});await p.touchscreen.tap(bt.sx,bt.sy);await p.waitForTimeout(1200);
 const moved=await p.evaluate(n=>{const u=__rp.bt.units.find(u=>u.name===n);return[u.x,u.y]},bt.n);
 await p.evaluate(()=>{__rp.bt=null;__rp.mode='map'});await p.waitForTimeout(300);
 await p.tap('#rp-panel [data-rp="hero"]');await p.waitForTimeout(300);await p.screenshot({path:__dirname+'/../out/rot_'+vp.n+'_hero.png'});await p.locator('#rp-hero [data-hh="close"]').click();
 await p.tap('#rp-panel [data-rp="menu"]');await p.waitForTimeout(200);await p.screenshot({path:__dirname+'/../out/rot_'+vp.n+'_menu.png'});
 const dims=await p.evaluate(()=>[document.documentElement.scrollWidth,innerWidth,document.documentElement.scrollHeight,innerHeight]);
 console.log(vp.n,'rot',rot,'joy',pos0.x.toFixed(2),pos0.y.toFixed(2),'->',pos1.x.toFixed(2),pos1.y.toFixed(2),'| tap to',scr.tx,scr.ty,'now at',tile,'| battle',bt.x0,bt.y0,'->',moved,'target',bt.tx,bt.ty,'| dims',dims,'errors',errs);
 await p.close()}
await b.close()})();
