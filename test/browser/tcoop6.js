/* v6 co-op (build step 15, systems.md §12): two players in the same place share a fight through the lobby. The friend's kobolds
   are level-synced to the host's hero, v6 foes reach the friend's page, both play turns to the end, XP is personal; then a second
   fight where the friend idles (the 20-second timer makes the kobold guard) and leaves (their kobolds guard until the end). */
const {chromium}=require('playwright');const mock=require('./netmock.js');const path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html')+'?v6';
(async()=>{const br=await chromium.launch();const pages=[],out={push:x=>console.log(x)},bad=[];
 const mk=async by=>{const ctx=await br.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await ctx.newPage();
   p.errs=[];p.on('pageerror',e=>p.errs.push(by+': '+e.message+' '+(e.stack||'').split('\n')[1]));
   await p.exposeBinding('__relay',async(src,m)=>{if(m.k==='dbget')return null;if(m.k==='dbcol')return[];if(m.k==='dbset'||m.k==='dbdel'||m.k==='dbupd'||m.k==='dbacq')return true;
     for(const q of pages)if(q!==p&&!q.isClosed())q.evaluate(x=>window.__mockRecv&&window.__mockRecv(x),m).catch(()=>{})});
   await p.addInitScript(mock(by));await p.addInitScript(()=>{try{localStorage.setItem('kobold-pit-rpopt',JSON.stringify({}));sessionStorage.setItem('kobold-pit-booted','1')}catch(e){}});
   await p.goto(FILE);await p.addStyleTag({content:'#boot{display:none!important}'});pages.push(p);
   await p.click('#go-rpg');await p.waitForTimeout(400);return p};
 const check=(ok,msg)=>{out.push((ok?'ok ':'FAIL ')+msg);if(!ok)bad.push(msg)};
 const A=await mk('u_alice'),B=await mk('u_bob');
 await A.evaluate(()=>{__v6.pack([['Pip','fighter',5],['Glint','cleric',5]]);__rp.grace=9999});
 await B.evaluate(()=>{__v6.pack([['Tansy','rogue',7],['Wizzle','wizard',6]]);__rp.grace=9999});
 await A.waitForTimeout(1000);
 check(await A.evaluate(()=>!!__net.partner&&__net.partner.presence.pl===('w6:'+__rp.s.w6)),'Alice sees Bob in the same place');
 /* fight one: Alice opens it, Bob joins */
 const fight=async keys=>{await A.evaluate(k=>__v6.fight(k),keys||null);await A.waitForTimeout(600);
   check(await A.evaluate(()=>__rp.mode)==='lobby','Alice waits in the lobby');
   await B.evaluate(()=>__netBtn({net:'join'}));await B.waitForTimeout(900);
   check(await A.evaluate(()=>!!(__net.lob&&__net.lob.g)),'Bob joins the lobby');
   await A.evaluate(()=>{const L=__net.lob;L.hsel=[0];L.g.sel=[0,1]});
   await A.evaluate(()=>__netBtn({net:'lobstart'}));await A.waitForTimeout(1200)};
 await fight([['nettlenose_scout',1]]);
 const ua=await A.evaluate(()=>__rp.bt&&__rp.bt.units.map(u=>u.name+':'+u.ctl+':'+(u.m?u.m.lvl:'e')).join(','));
 const ub=await B.evaluate(()=>__rp.bt&&{v6:__rp.bt.v6,u:__rp.bt.units.map(u=>u.name+':'+u.ctl).join(','),foes:__rp.bt.units.filter(u=>u.side===1).length});
 out.push('host units '+ua);if(0)out.push('guest dbg '+await B.evaluate(()=>JSON.stringify({mode:__rp.mode,lob:!!__net.lob,start:!!__net.lastStart,fail:__net.mirrorFail,u:__net.lastStart&&__net.lastStart.u.map(o=>o.o+(o.k||'')+(o.E?'E':'')+(o.m?'m':'')+(o.gi!=null?'gi'+o.gi:''))})));out.push('guest '+JSON.stringify(ub));
 check(/Tansy:remote:5/.test(ua||''),'Bob\'s level-7 rogue fights at Alice\'s level 5');
 check(!!(ub&&ub.v6&&ub.foes>0&&/Tansy:me/.test(ub.u)),'Bob\'s page has the v6 battle with its foes');
 check(await A.evaluate(()=>__rp.bt.units.filter(u=>u.side===1).length)===3,'Bob\'s two kobolds add two foes');
 const xp0=await B.evaluate(()=>__rp.s.party.map(m=>m.lvl+':'+m.xp).join(' '));
 await A.evaluate(()=>__rpB.btn({tac:'start'}));
 const play=p=>p.evaluate(()=>{const b=__rp.bt;if(!b||b.phase!=='turn')return 0;const u=b.cur;const foes=b.units.filter(t=>t.side===1&&t.hp>0&&!t.fled);
   for(const t of foes){__rpB.tap(t.x,t.y);if(b.pend&&b.pend.t===t){__rpB.btn({tac:'ok'});return 1}}
   const t=foes[0];if(t&&u.ap>0){const dx=Math.sign(t.x-u.x),dy=Math.sign(t.y-u.y);for(const [ax,ay] of [[dx*2,dy*2],[dx,dy],[0,dy*2],[dx*2,0],[0,dy],[dx,0]]){__rpB.tap(u.x+ax,u.y+ay);if(b.pend&&b.pend.path){__rpB.btn({tac:'ok'});return 2}}}
   __rpB.btn({tac:'mode',v:'end'});__rpB.btn({tac:'ok'});return 3});
 let acts={A:0,B:0},t0=Date.now();
 while(Date.now()-t0<150000){const oa=await A.evaluate(()=>__rp.bt&&__rp.bt.over),ob=await B.evaluate(()=>__rp.bt&&__rp.bt.over);if(oa&&ob)break;
   if(await play(A))acts.A++;if(await play(B))acts.B++;await A.waitForTimeout(200)}
 const ovA=await A.evaluate(()=>__rp.bt&&__rp.bt.over),ovB=await B.evaluate(()=>__rp.bt&&__rp.bt.over);out.push('over '+ovA+'/'+ovB+' acts '+JSON.stringify(acts));
 check(!!ovA&&ovA===ovB,'the fight ends the same on both pages');check(acts.B>0,'Bob played turns');
 const xp1=await B.evaluate(()=>__rp.s.party.map(m=>m.lvl+':'+m.xp).join(' '));out.push('Bob xp '+xp0+' -> '+xp1);
 if(ovA==='win')check(xp1!==xp0&&/^7:/.test(xp1),'Bob\'s own kobolds get their own XP and keep level 7');
 await B.screenshot({path:__dirname+'/../out/coop6_end_B.png'});
 for(const p of [A,B])await p.evaluate(()=>{if(__rp.bt&&__rp.bt.over)__rpB.btn({tac:'cont'});for(let i=0;i<10;i++){const b=document.querySelector('#rp-panel [data-rp="next"]');if(b)b.click()}__rp.mode='map';__rp.dlg=null;
   __rp.s.party.forEach(m=>{m.hp=m.hp>0?m.hp:1})});
 await A.waitForTimeout(800);
 /* fight two: Bob idles until the timer runs out, then leaves */
 await fight();
 check(await B.evaluate(()=>!!(__rp.bt&&__rp.bt.v6)),'second shared fight starts');
 await A.evaluate(()=>__rpB.btn({tac:'start'}));
 t0=Date.now();let waited=null;
 while(Date.now()-t0<90000){await play(A);const st=await A.evaluate(()=>({ph:__rp.bt&&__rp.bt.phase,ctl:__rp.bt&&__rp.bt.cur&&__rp.bt.cur.ctl,over:__rp.bt&&__rp.bt.over}));if(st.over)break;
   if(st.ph==='remote'){const t1=Date.now();while(Date.now()-t1<26000){const c=await A.evaluate(()=>__rp.bt&&__rp.bt.phase==='remote'&&__rp.bt.cur&&__rp.bt.cur.ctl==='remote');if(!c)break;await A.waitForTimeout(500)}waited=(Date.now()-t1)/1000;break}
   await A.waitForTimeout(200)}
 out.push('Bob\'s turn ended after '+waited+' s');check(waited!=null&&waited>15&&waited<25,'the 20-second timer ends an idle turn');
 await B.close();pages.splice(pages.indexOf(B),1);
 /* the mock has no "gone" message for a closed page: tell Alice's room Bob is gone */
 await A.evaluate(()=>{const P=__net.others&&__net.others[0];if(P)window.__mockRecv({k:'gone',peer:P.peer})});
 t0=Date.now();while(Date.now()-t0<60000){await play(A);const g=await A.evaluate(()=>__rp.bt&&__rp.bt.units.some(u=>u.ctl==='guard'));if(g)break;await A.waitForTimeout(300)}
 check(await A.evaluate(()=>__rp.bt&&__rp.bt.units.filter(u=>u.own==='g').every(u=>u.ctl==='guard')),'Bob left: his kobolds guard');
 t0=Date.now();while(Date.now()-t0<90000){if(await A.evaluate(()=>!__rp.bt||__rp.bt.over))break;await play(A);await A.waitForTimeout(150)}
 check(await A.evaluate(()=>!!(__rp.bt&&__rp.bt.over)),'Alice finishes the fight alone');
 const errs=A.errs.concat(B.errs);check(!errs.length,'no page errors '+JSON.stringify(errs).slice(0,300));
 await br.close();process.exitCode=bad.length?1:0})();
