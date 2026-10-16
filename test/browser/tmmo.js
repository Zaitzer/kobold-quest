const {chromium}=require('playwright');const mock=require('./netmock.js');
const SAVE=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'../fixtures/save_v2.json'),'utf8'));
(async()=>{const br=await chromium.launch();const pages=[],db={},leases={},pres={};
 const bcast=()=>{for(const q of pages)q.evaluate(()=>window.__mockRecv&&window.__mockRecv({k:'dbchg'})).catch(()=>{})};
 const mk=async(by,save,keepLocal)=>{const ctx=await br.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await ctx.newPage();
   const errs=[];p.on('pageerror',e=>errs.push(by+': '+e.message+' '+(e.stack||'').split('\n')[1]));p.errs=errs;p.by=by;
   await p.exposeBinding('__relay',async(src,m)=>{
     if(m.k==='dbget')return db[m.path]||null;
     if(m.k==='dbcol'){const pre=m.path+'/';return Object.keys(db).filter(k=>k.startsWith(pre)&&!k.slice(pre.length).includes('/')).map(k=>({id:k.slice(pre.length),data:db[k]}))}
     if(m.k==='dbset'){db[m.path]=m.data;bcast();return}
     if(m.k==='dbupd'){if(!db[m.path])return'missing';db[m.path]=Object.assign({},db[m.path],m.data);bcast();return}
     if(m.k==='dbdel'){delete db[m.path];bcast();return}
     if(m.k==='dbacq'){const L=leases[m.path],now=Date.now();if(L&&L.until>now&&L.holder!==m.holder)return{acquired:false};leases[m.path]={holder:m.holder,until:now+m.ttl};return{acquired:true}}
     if(m.k==='pres')pres[m.peer]=m;
     for(const q of pages)if(q!==p)q.evaluate(x=>window.__mockRecv&&window.__mockRecv(x),m).catch(()=>{});
   });
   await p.addInitScript(mock(by));
   await p.goto('file://'+require('path').join(__dirname,'../../dist/kq_test.html'));await p.addStyleTag({content:'#boot{display:none!important}'});
   if(save)await p.evaluate(s=>localStorage.setItem('kobold-pit-rpg',JSON.stringify(s)),save);
   pages.push(p);for(const k in pres)await p.evaluate(x=>window.__mockRecv&&window.__mockRecv(x),pres[k]).catch(()=>{});await p.waitForTimeout(400);await p.tap('#go-rpg');await p.waitForTimeout(500);await p.evaluate(()=>{__rp.grace=9999});return p};
 const sb=JSON.parse(JSON.stringify(SAVE));sb.x=9;sb.y=23;sb.gold=100;sb.inv=['bt_frog#swift','rg_life'];
 const sc=JSON.parse(JSON.stringify(SAVE));sc.x=11;sc.y=23;sc.gold=50;
 const A=await mk('u_alice',SAVE),B=await mk('u_bob',sb),C=await mk('u_cara',sc);
 await A.waitForTimeout(1200);
 const others=async p=>p.evaluate(()=>__net.others.map(o=>__net.names[o.by]||'?').join(','));
 console.log('A sees:',await others(A),'| B sees:',await others(B),'| C sees:',await others(C));
 console.log('A hud row:',(await A.locator('#rp-panel .netrow').innerText()).replace(/\n/g,' '));
 await A.screenshot({path:__dirname+'/../out/mmo_map_A.png'});
 // chat
 await A.evaluate(()=>{__netBtn({net:'chat'})});await A.waitForTimeout(200);await A.fill('#kq-chat','Hello Kobolds!');await A.tap('#rp-panel [data-net="chatsend"]');await A.waitForTimeout(500);
 console.log('B chat log:',await B.evaluate(()=>__net.chatLog.map(l=>l.who+': '+l.txt).join(' | ')),'| C bubble:',await C.evaluate(()=>Object.values(__net.bubbles).map(b=>b.txt).join(',')));
 await A.evaluate(()=>__netBtn({net:'chatclose'}));await B.screenshot({path:__dirname+'/../out/mmo_bubble_B.png'});
 // market: Bob sells his swift frog boots for 25
 await B.evaluate(()=>{__netBtn({net:'market'});__netBtn({net:'mktab',v:'sell'});__netBtn({net:'mkpick',k:'item',v:'bt_frog#swift'})});
 await B.evaluate(()=>{__net.mkSell.price=25;__netBtn({net:'mklist'})});await B.waitForTimeout(800);
 console.log('B inv after listing',await B.evaluate(()=>__rp.s.inv.join(',')),'market docs',Object.keys(db).filter(k=>k.startsWith('market/')).length);
 await A.evaluate(()=>{__netBtn({net:'market'})});await A.waitForTimeout(500);await A.screenshot({path:__dirname+'/../out/mmo_market_A.png'});
 const listing=await A.evaluate(()=>__net.market.map(m=>m.id+':'+m.val+':'+m.price));console.log('A sees market',listing);
 const g0=await A.evaluate(()=>__rp.s.gold),gb0=await B.evaluate(()=>__rp.s.gold);
 const id=listing[0].split(':')[0];
 // Alice and Cara try to buy at the same moment
 await Promise.all([A.evaluate(id=>__netBtn({net:'mkbuy',id}),id),C.evaluate(id=>{__netBtn({net:'market'});__netBtn({net:'mkbuy',id})},id)]);await A.waitForTimeout(1500);
 console.log('A gold',g0,'->',await A.evaluate(()=>__rp.s.gold),'A has boots',await A.evaluate(()=>__rp.s.inv.includes('bt_frog#swift')),'| C has boots',await C.evaluate(()=>__rp.s.inv.includes('bt_frog#swift')),'C gold',await C.evaluate(()=>__rp.s.gold),'| Bob gold',gb0,'->',await B.evaluate(()=>__rp.s.gold),'| market docs left',Object.keys(db).filter(k=>k.startsWith('market/')).length);
 // cloud save
 await A.evaluate(()=>{__rp.s.gold=777;__rpS()});await A.waitForTimeout(3200);console.log('cloud doc for alice gold:',db['data/users/u_alice/save']&&db['data/users/u_alice/save'].gold);
 const A2=await mk('u_alice',null);await A2.waitForTimeout(800);console.log('fresh device for Alice loads gold',await A2.evaluate(()=>__rp.s&&__rp.s.gold),'mode',await A2.evaluate(()=>__rp.mode));
 // personal story: Bob opens a chest, Cara's world is unaffected
 await B.evaluate(()=>{__rp.s.chests.push('13,28');__rpS()});await B.waitForTimeout(1500);console.log('Cara chest still closed:',await C.evaluate(()=>!__rp.s.chests.includes('13,28')));
 console.log('errors',[].concat(A.errs,B.errs,C.errs,A2.errs));
 await br.close()})();
