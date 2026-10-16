const {chromium}=require('playwright');
const SAVE=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'../fixtures/save_v2.json'),'utf8'));
(async()=>{const b=await chromium.launch();
 const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
 const errs=[];p.on('console',m=>{if(m.text().startsWith('TAP'))console.log(m.text())});p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 await p.addInitScript(()=>{try{localStorage.setItem('kobold-pit-rpopt',JSON.stringify({}))}catch(e){}});await p.goto('file://'+require('path').join(__dirname,'../../dist/kq_test.html'));await p.addStyleTag({content:'#boot{display:none!important}'});
 await p.evaluate(s=>localStorage.setItem('kobold-pit-rpg',JSON.stringify(s)),SAVE);
 await p.tap('#go-rpg');await p.waitForTimeout(300);
 await p.evaluate(()=>__rpB.battle(['sentry','gunner','shaman'],{zone:'C'}));await p.waitForTimeout(300);
 await p.tap('#rp-panel [data-tac="start"]');
 for(let i=0;i<60;i++){if(await p.evaluate(()=>__rp.bt.phase==='turn'))break;await p.waitForTimeout(150)}
 // real touch: tap a tile 2 up from the active kobold, then tap it again to confirm
 await p.evaluate(()=>{window.__ev=[];['pointerdown','pointerup','click'].forEach(t=>document.getElementById('rpcv').addEventListener(t,e=>__ev.push(t+':'+Math.round(e.clientX)+','+Math.round(e.clientY)),true))});
 const box=await p.locator('#rpcv').boundingBox();
 const tileCss=async(x,y)=>p.evaluate(([x,y])=>{const b=__rp.bt;return[(x*40+20-b.cam.x)/360,(y*40+20-b.cam.y)/440]},[x,y]);
 const u0=await p.evaluate(()=>({x:__rp.bt.cur.x,y:__rp.bt.cur.y,n:__rp.bt.cur.name}));
 let target=null;for(const [dx,dy] of [[0,-2],[1,-2],[-1,-2],[0,-1],[1,-1]]){const ok=await p.evaluate(([x,y])=>{const b=__rp.bt;return x>=0&&y>=0&&x<b.W&&y<b.H&&!'TRPhmG'.includes(b.g[y][x])},[u0.x+dx,u0.y+dy]);if(ok){target=[u0.x+dx,u0.y+dy];break}}
 const [fx,fy]=await tileCss(...target);
 await p.touchscreen.tap(box.x+box.width*fx,box.y+box.height*fy);await p.waitForTimeout(200);
 const pend=await p.evaluate(()=>JSON.stringify({tx:__rp.bt.pend&&__rp.bt.pend.tx,ty:__rp.bt.pend&&__rp.bt.pend.ty,cam:__rp.bt.cam}));
 await p.screenshot({path:__dirname+'/../out/tb2_pend.png'});await p.waitForTimeout(700);
 await p.touchscreen.tap(box.x+box.width*fx,box.y+box.height*fy);await p.waitForTimeout(1200);
 console.log('events',await p.evaluate(()=>__ev.join(' ')));console.log('after 2nd tap',await p.evaluate(()=>({pend:!!__rp.bt.pend,msg:__rp.bt.msg,phase:__rp.bt.phase,cam:__rp.bt.cam,seq:__rp.bt.seq.length})));
 const u1=await p.evaluate(n=>{const u=__rp.bt.units.find(u=>u.name===n);return{x:u.x,y:u.y}},u0.n);
 console.log('touch move',u0,'->',u1,'target',target,'pending after 1st tap',pend);
 // drag to pan
 const cam0=await p.evaluate(()=>({...__rp.bt.cam}));
 const cdp=await p.context().newCDPSession(p);const cx=box.x+box.width/2,cy=box.y+box.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx,y:cy+i*15}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await p.waitForTimeout(100);console.log('pan cam',cam0,'->',await p.evaluate(()=>({...__rp.bt.cam})),'phase',await p.evaluate(()=>__rp.bt.phase));
 // let the AI finish the fight for us, grabbing a few frames
 await p.evaluate(()=>{__rp.autoParty=true;const b=__rp.bt;if(b.phase==='turn'){b.phase='ai'}});
 // nudge: the current turn needs an AI call when we switch mid-turn
 await p.evaluate(()=>{const b=__rp.bt;if(b.cur&&b.cur.side===0&&!b.seq.length){b.cur.ap=0}});
 for(let i=0;i<8;i++){await p.waitForTimeout(1500);await p.screenshot({path:__dirname+'/../out/tb2_f'+i+'.png'});if(await p.evaluate(()=>!__rp.bt||!!__rp.bt.over))break}
 for(let i=0;i<120;i++){if(await p.evaluate(()=>!__rp.bt||!!__rp.bt.over))break;await p.waitForTimeout(500)}
 console.log('over',await p.evaluate(()=>__rp.bt&&__rp.bt.over),'msg',await p.evaluate(()=>__rp.bt&&__rp.bt.msg));
 await p.screenshot({path:__dirname+'/../out/tb2_end.png'});
 if(await p.locator('#rp-panel [data-tac="cont"]').count()){await p.tap('#rp-panel [data-tac="cont"]');await p.waitForTimeout(400)}
 await p.screenshot({path:__dirname+'/../out/tb2_back.png'});
 console.log('mode after',await p.evaluate(()=>__rp.mode),'errors',errs);
 await b.close()})();
