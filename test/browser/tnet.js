const {chromium}=require('playwright');const mock=require('./netmock.js');
const SAVE=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'../fixtures/save_v2.json'),'utf8'));
const DROP=+(process.env.DROP||0);
(async()=>{const br=await chromium.launch();const pages=[],db={};
 const mk=async(by,save)=>{const ctx=await br.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await ctx.newPage();
   const errs=[];p.on('pageerror',e=>errs.push(by+': '+e.message+' '+(e.stack||'').split('\n')[1]));p.errs=errs;p.by=by;
   await p.exposeBinding('__relay',async(src,m)=>{
     if(m.k==='dbget')return db[m.path]||null;
     if(m.k==='dbcol')return[];
     if(m.k==='dbset'){db[m.path]=m.data;for(const q of pages)q.evaluate(x=>window.__mockRecv&&window.__mockRecv(x),{k:'db',path:m.path,data:m.data}).catch(()=>{});return}
     if(m.k==='emit'&&DROP&&Math.random()<DROP)return;
     for(const q of pages)if(q!==p)q.evaluate(x=>window.__mockRecv&&window.__mockRecv(x),m).catch(()=>{});
   });
   await p.addInitScript(mock(by));
   await p.addInitScript(()=>{try{localStorage.setItem('kobold-pit-rpopt',JSON.stringify({}))}catch(e){}});await p.goto('file://'+require('path').join(__dirname,'../../dist/kq_test.html'));await p.addStyleTag({content:'#boot{display:none!important}'});
   await p.evaluate(s=>localStorage.setItem('kobold-pit-rpg',JSON.stringify(s)),save);
   pages.push(p);await p.tap('#go-rpg');await p.waitForTimeout(400);await p.evaluate(()=>{__rp.grace=9999});return p};
 const sb=JSON.parse(JSON.stringify(SAVE));sb.x=9;sb.y=23;sb.gold=100;sb.chests=[];
 const A=await mk('u_alice',SAVE),B=await mk('u_bob',sb);
 await A.waitForTimeout(800);
 const st=async p=>p.evaluate(()=>({partner:!!__net.partner,name:__net.partner&&(__net.names[__net.partner.by]||''),mode:__rp.mode,gold:__rp.s.gold,xp:__rp.s.party.map(m=>m.lvl+':'+m.xp).join(' '),phase:__rp.bt&&__rp.bt.phase,over:__rp.bt&&__rp.bt.over}));
 console.log('A sees',JSON.stringify(await st(A)),'| B sees',JSON.stringify(await st(B)));
 await A.screenshot({path:__dirname+'/../out/net_map_A.png'});
 // A starts a fight -> lobby
 await A.evaluate(()=>__rpF(['scout','slinger'],{zone:','}));await A.waitForTimeout(500);
 console.log('B panel:',(await B.locator('#rp-panel').innerText()).slice(0,90).replace(/\n/g,' | '));
 await B.tap('#rp-panel [data-net="join"]');await B.waitForTimeout(800);
 await B.screenshot({path:__dirname+'/../out/net_lobby_B.png'});await A.screenshot({path:__dirname+'/../out/net_lobby_A.png'});
 // Bob adds a second kobold
 await B.tap('#rp-panel .lobk:not(.on)[data-net="pick"] >> nth=0').catch(e=>console.log('pick fail',e.message.slice(0,80)));await B.waitForTimeout(600);
 console.log('lobby A:',await A.evaluate(()=>JSON.stringify({h:__net.lob.hsel,g:__net.lob.g&&__net.lob.g.sel})));
 await A.tap('#rp-panel [data-net="lobstart"]');await A.waitForTimeout(1200);
 console.log('after start A',await A.evaluate(()=>__rp.mode+' units '+__rp.bt.units.map(u=>u.name+':'+u.ctl).join(',')),'| B',await B.evaluate(()=>__rp.mode+' '+(__rp.bt?__rp.bt.units.map(u=>u.name+':'+u.ctl).join(','):'')));
 await B.screenshot({path:__dirname+'/../out/net_place_B.png'});
 await A.evaluate(()=>__rpB.btn({tac:'start'}));
 // play: whoever has the turn attacks the first visible enemy in reach, else walks toward one, else ends turn
 const play=async(p)=>p.evaluate(()=>{const b=__rp.bt;if(!b||b.phase!=='turn')return 0;const u=b.cur;
   const foes=b.units.filter(t=>t.side===1&&t.hp>0&&!t.fled);
   const reach=foes.find(t=>{__rpB.btn({tac:'mode',v:'atk'});return false});
   __rpB.btn({tac:'cancel'});
   for(const t of foes){__rpB.tap(t.x,t.y);if(b.pend&&b.pend.t===t){__rpB.btn({tac:'ok'});return 1}}
   const t=foes[0];if(t&&u.ap>0){const dx=Math.sign(t.x-u.x),dy=Math.sign(t.y-u.y);for(const [ax,ay] of [[dx*2,dy*2],[dx,dy],[0,dy*2],[dx*2,0],[0,-1]]){__rpB.tap(u.x+ax,u.y+ay);if(b.pend&&b.pend.path){__rpB.btn({tac:'ok'});return 2}}}
   __rpB.btn({tac:'mode',v:'end'});__rpB.btn({tac:'ok'});return 3});
 let acts={A:0,B:0},t0=Date.now();
 while(Date.now()-t0<90000){const oa=await A.evaluate(()=>__rp.bt&&__rp.bt.over),ob=await B.evaluate(()=>__rp.bt&&__rp.bt.over);if(oa&&ob)break;
   if(await play(A))acts.A++;if(await play(B))acts.B++;await A.waitForTimeout(250)}
 console.log('battle over A',await A.evaluate(()=>__rp.bt&&__rp.bt.over+' | '+__rp.bt.msg),'| B',await B.evaluate(()=>__rp.bt&&__rp.bt.over+' | '+__rp.bt.msg),'actions',JSON.stringify(acts));
 await B.screenshot({path:__dirname+'/../out/net_end_B.png'});
 const xpB0=(await st(B)).xp;
 for(const p of [A,B])await p.evaluate(()=>{if(__rp.bt&&__rp.bt.over)__rpB.btn({tac:'cont'})});await A.waitForTimeout(500);
 for(const p of [A,B])await p.evaluate(()=>{for(let i=0;i<10;i++){const b=document.querySelector('#rp-panel [data-rp="talent"],#rp-panel [data-rp="next"]');if(b)b.click()}});
 console.log('after battle A',JSON.stringify(await st(A)),'B',JSON.stringify(await st(B)));
 // trade: A gives Bob 10 gold
 const g0=(await st(B)).gold;await A.evaluate(()=>__netBtn({net:'give',k:'gold',v:10}));await A.waitForTimeout(800);console.log('gift: Bob gold',g0,'->',(await st(B)).gold);
 // shared world: A opens a chest
 await A.evaluate(()=>{__rp.s.chests.push('13,28');__rpS()});await A.waitForTimeout(2200);console.log('Bob sees chest opened:',await B.evaluate(()=>__rp.s.chests.includes('13,28')));
 // duel
 await A.evaluate(()=>{__rp.mode='map';__rp.dlg=null;__netBtn({net:'duel'})});await A.waitForTimeout(600);
 const bp=(await B.locator('#rp-panel').innerText()).replace(/\n/g,' | ');console.log('B duel prompt:',bp.slice(0,80));
 while(await B.locator('#rp-panel [data-rp="next"]').count())await B.tap('#rp-panel [data-rp="next"]');
 await B.tap('#rp-panel [data-rp="choose"] >> nth=0');await A.waitForTimeout(900);
 await A.tap('#rp-panel [data-net="lobstart"]');await A.waitForTimeout(1200);await A.evaluate(()=>__rpB.btn({tac:'start'}));
 t0=Date.now();acts={A:0,B:0};
 while(Date.now()-t0<90000){const oa=await A.evaluate(()=>__rp.bt&&__rp.bt.over),ob=await B.evaluate(()=>__rp.bt&&__rp.bt.over);if(oa&&ob)break;if(await play(A))acts.A++;if(await play(B))acts.B++;await A.waitForTimeout(250)}
 await B.screenshot({path:__dirname+'/../out/net_duel_B.png'});
 console.log('duel A',await A.evaluate(()=>__rp.bt&&__rp.bt.over),'B',await B.evaluate(()=>__rp.bt&&__rp.bt.over),'acts',JSON.stringify(acts));
 console.log('errors',A.errs.concat(B.errs));
 await br.close()})();
