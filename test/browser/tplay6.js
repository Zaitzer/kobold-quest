/* The first minutes of v6, played through the screen as a player would (build step 21): Play → a new hero → the morning in the
   bakery (tapping through the lines) → walking down to the cellar → the rat fight, played with taps until it is won → Onward.
   Every step is a click on the panel or a tap on a tile; nothing is set by hand. */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html')+'?v6';
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const errs=[],out=[],fail=[];
 p.on('pageerror',e=>errs.push(e.message));
 await p.goto(FILE);await p.evaluate(()=>sessionStorage.setItem('kobold-pit-booted','1'));await p.reload();await p.waitForTimeout(300);
 const E=(f,a)=>p.evaluate(f,a),until=async(f,a,ms=10000)=>{const t=Date.now();while(Date.now()-t<ms){if(await E(f,a).catch(()=>false))return true;await p.waitForTimeout(80)}return false};
 const talk=async()=>{for(let i=0;i<60;i++){const m=await E(()=>__rp.mode);if(m!=='dialog')return;const c=await p.$('#rp-panel [data-rp="choose"]');if(c)await c.click();else await p.click('#rp-panel [data-rp="next"]');await p.waitForTimeout(60)}};
 await p.click('#go-rpg');await p.waitForTimeout(400);
 await p.click('#rp-panel [data-rp="c6new"][data-v="0"]');await p.fill('#c6-new','Tansy');for(const s of ['[data-rp="c6cls"][data-v="fighter"]','[data-rp="c6next"]','[data-rp="c6suggest"]','[data-rp="c6make"]'])await p.click('#rp-panel '+s);await p.waitForTimeout(400);
 await talk();out.push('morning: '+await E(()=>__rp.s.w6+' act '+__rp.s.q.act));if(await E(()=>__rp.s.w6!=='room:bakery'||__rp.s.q.act!==1))fail.push('the morning did not end in the bakery at act 1');
 /* the cellar stairs: tap them, walk there, go down */
 await E(()=>__v6.tile(11,3));const down=await until(()=>__rp.s.w6==='room:cellar'||__rp.mode==='dialog',null,15000);out.push('cellar: '+await E(()=>__rp.s.w6+' '+__rp.mode));if(!down)fail.push('could not walk down to the cellar');
 await talk();const fight=await until(()=>__rp.mode==='battle',null,5000);if(!fight)fail.push('no rat fight');
 /* the scene's two rat fights and the lines between them: a lost set piece is tried again at once (systems.md §4), Auto placement, then each turn attack a rat in reach, else walk toward the
    nearest; if a tap changes nothing (a wall in the way), end the turn; Onward after each win */
 let taps=0,wins=0,tries=0;const t0=Date.now();
 while(Date.now()-t0<150000){const st=await E(()=>{if(__rp.mode==='dialog')return{talk:1};const b=__rp.bt;if(__rp.mode!=='battle'||!b)return{done:1};if(b.over)return{over:b.over};if(b.phase==='place')return{place:1};
     if(b.phase!=='turn'||!b.cur||b.cur.side!==0)return{wait:1};
     const u=b.cur,f=b.units.filter(x=>x.side===1&&x.hp>0&&!x.fled);f.sort((a,c)=>Math.abs(a.x-u.x)+Math.abs(a.y-u.y)-Math.abs(c.x-u.x)-Math.abs(c.y-u.y));
     const near=f.find(x=>Math.max(Math.abs(x.x-u.x),Math.abs(x.y-u.y))<=1);if(near)return{tap:[near.x,near.y]};
     const R=__rpB.reach();if(!R.length||!f.length)return{end:1};const t=f[0];R.sort((a,c)=>Math.hypot(a[0]-t.x,a[1]-t.y)-Math.hypot(c[0]-t.x,c[1]-t.y));return{tap:[R[0][0],R[0][1]]}});
   if(st.done)break;if(st.talk){await talk();continue}if(st.place){await p.click('#rp-panel [data-tac="auto"]');continue}
   if(st.over){if(st.over==='win')wins++;else{if(++tries>12){fail.push('lost the rats twelve times');break}await p.click('#rp-panel [data-tac="retry"]');await p.waitForTimeout(300);continue}await p.screenshot({path:__dirname+'/../out/play6_result.png'});await p.click('#rp-panel [data-tac="cont"]');await p.waitForTimeout(300);continue}
   if(st.wait){await p.waitForTimeout(150);continue}
   if(st.end){await p.click('#rp-panel [data-tac="mode"][data-v="end"]');taps++;continue}
   const moved=await E(([x,y])=>{const b=__rp.bt,u=b.cur,k=u.x+','+u.y+','+u.ap;__rpB.tap(x,y);if(__rp.bt&&__rp.bt.pend)__rpB.tap(x,y);return __rp.bt.phase!=='turn'||u.x+','+u.y+','+u.ap!==k},st.tap);taps++;
   if(!moved)await p.click('#rp-panel [data-tac="mode"][data-v="end"]');await p.waitForTimeout(120)}
 out.push('fights won '+wins+' in '+taps+' taps, '+tries+' tries again');if(wins<2)fail.push('the cellar\'s two rat fights were not both won ('+wins+')');
 out.push('after: '+await E(()=>__rp.mode+' '+__rp.s.w6+' scenes '+Object.keys(__rp.s.w6st.seen||{}).join(',')));
 if(!(await E(()=>!!(__rp.s.w6st.seen||{})['1.2'])))fail.push('the cellar scene did not finish');
 console.log('play6 '+(fail.length?fail.join('; '):'ok')+' · '+out.join(' · ')+' errors '+JSON.stringify(errs));await br.close();process.exitCode=(fail.length||errs.length)?1:0})();
