/* The website end to end, against a real local game server: accounts, presence, chat, co-op, market,
   saves across devices, privacy of saves, and reconnecting after the server restarts. */
const {chromium}=require('playwright');const {spawn}=require('child_process');const fs=require('fs'),path=require('path'),os=require('os');
const R=path.join(__dirname,'../..');const PORT=18000+Math.floor(Math.random()*1000);const URL='http://localhost:'+PORT+'/';
const DATA=fs.mkdtempSync(path.join(os.tmpdir(),'kq-data-')),PUB=fs.mkdtempSync(path.join(os.tmpdir(),'kq-pub-'));
fs.copyFileSync(R+'/dist/kq_site_test.html',PUB+'/index.html');
const SAVE=JSON.parse(fs.readFileSync(R+'/test/fixtures/save_v2.json','utf8'));
// a stand-in for GitHub: accepts the token check and new issues, and remembers the issues
const http=require('http');const ISSUES=[];const GH_PORT=PORT+1000;
const gh=http.createServer((q,r)=>{let b='';q.on('data',d=>b+=d);q.on('end',()=>{const ok=/^Bearer github_pat_good/.test(q.headers.authorization||'');
  if(!ok){r.writeHead(401);r.end('{}');return}
  if(q.method==='POST'&&/\/issues$/.test(q.url)){const j=JSON.parse(b);ISSUES.push(j);r.writeHead(201,{'content-type':'application/json'});r.end(JSON.stringify({number:ISSUES.length,html_url:'https://github.com/x/y/issues/'+ISSUES.length}));return}
  r.writeHead(200,{'content-type':'application/json'});r.end('{"full_name":"Zaitzer/kobold-quest"}')})}).listen(GH_PORT);
let srv;const start=(extra)=>new Promise(ok=>{srv=spawn('node',[R+'/server/main.js'],{env:Object.assign({},process.env,{PORT,DATA,PUBLIC:PUB,KQ_GITHUB_API:'http://localhost:'+GH_PORT},extra||{}),stdio:['ignore','pipe','inherit']});srv.stdout.on('data',d=>{if(/server on/.test(d))ok()})});
const stopSrv=()=>new Promise(ok=>{srv.on('exit',ok);srv.kill('SIGTERM')});
const wait=async(p,fn,arg,ms=8000)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn,arg).catch(()=>false))return true;await p.waitForTimeout(100)}return false};
const errs=[];let fails=0;const check=(ok,msg)=>{console.log((ok?'ok  ':'FAIL')+' '+msg);if(!ok)fails++};
(async()=>{await start();const br=await chromium.launch();
 const page=async(vp,label)=>{const ctx=await br.newContext({viewport:vp,hasTouch:true,isMobile:true});const p=await ctx.newPage();
   p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load|fonts/.test(m.text()))errs.push(label+': '+m.text())});
   await p.addInitScript(()=>{try{sessionStorage.setItem('kobold-pit-booted','1')}catch(e){}});await p.goto(URL);await p.waitForTimeout(300);return p};
 const loginAs=async(p,name,pass,kind)=>{await p.fill('#login-name',name);await p.fill('#login-pass',pass);await p.click(kind==='new'?'#login-new':'#login-go');
   await wait(p,()=>!document.getElementById('go-rpg').hidden||/[A-Za-z]/.test(document.getElementById('login-msg').textContent)&&!/…/.test(document.getElementById('login-msg').textContent));
   return p.evaluate(()=>({play:!document.getElementById('go-rpg').hidden,msg:document.getElementById('login-msg').textContent,me:window.__net&&__net.me}))};
 const play=async(p,save)=>{if(save)await p.evaluate(s=>{localStorage.setItem('kq-save-'+__net.me,JSON.stringify(Object.assign({},s,{savedAt:Date.now()})))},save);
   await p.click('#go-rpg');await p.waitForTimeout(600);await p.evaluate(()=>{__rp.grace=1e9})};

 const A=await page({width:844,height:390},'A');
 await A.screenshot({path:R+'/test/out/site_login.png'});check(await A.evaluate(()=>!document.getElementById('login').hidden&&document.getElementById('go-rpg').hidden),'website starts at the login form, Play hidden');
 let r=await loginAs(A,'Alice','secret1');check(!r.play&&/Wrong name/.test(r.msg),'unknown account is refused: '+r.msg);
 r=await loginAs(A,'Al','secret1','new');check(!r.play&&/3 to 16/.test(r.msg),'too-short name refused');
 r=await loginAs(A,'Alice','123','new');check(!r.play&&/6 characters/.test(r.msg),'too-short password refused');
 r=await loginAs(A,'Alice','secret1','new');check(r.play&&r.me,'Alice makes an account and can play');
 await A.screenshot({path:R+'/test/out/site_title_A.png'});
 const B=await page({width:390,height:844},'B');
 r=await loginAs(B,'alice','whatever','new');check(!r.play&&/taken/.test(r.msg),'names are unique regardless of case');
 r=await loginAs(B,'Bob','hunter22','new');check(r.play,'Bob makes an account');
 await play(A,SAVE);await play(B,Object.assign({},SAVE,{gold:100}));
 check(await wait(A,()=>__net.others&&__net.others.length===1&&Object.values(__net.names).includes('Bob')),'Alice sees Bob on the map, by name');
 check(await wait(B,()=>__net.others&&__net.others.length===1&&Object.values(__net.names).includes('Alice')),'Bob sees Alice');
 await A.screenshot({path:R+'/test/out/site_map_A.png'});
 // chat
 await B.evaluate(()=>{__netBtn({net:'say',v:'Hi!'})});
 check(await wait(A,()=>__net.chatLog.some(c=>/Hi!/.test(c.txt||c.t||JSON.stringify(c)))),'chat reaches Alice');
 // yip: Bob hears Alice (shown as a bubble over her)
 await A.evaluate(()=>__netBtn({net:'yip'}));
 check(await wait(B,()=>Object.values(__net.bubbles).some(b=>b&&b.txt==='Yip!')),'Bob sees and hears Alice yip');
 // co-op battle through the lobby
 await A.evaluate(()=>__rpF(['scout','slinger'],{zone:','}));
 check(await wait(B,()=>__net.others[0]&&__net.others[0].presence.op),'Bob sees Alice\'s fight open');
 await B.evaluate(()=>__netBtn({net:'join'}));
 check(await wait(A,()=>__net.lob&&__net.lob.g),'Bob joins Alice\'s lobby');
 await A.evaluate(()=>__netBtn({net:'lobstart'}));
 check(await wait(B,()=>__rp.mode==='battle'&&__rp.bt&&__rp.bt.net&&__rp.bt.net.role==='guest',null,10000),'co-op battle starts on both screens');
 await B.screenshot({path:R+'/test/out/site_coop_B.png'});
 for(const p of [A,B])await p.evaluate(()=>{__rp.bt=null;__rp.mode='map';__net.lob=null});
 // market: Alice sells a potion, Bob buys it, Alice is paid
 const goldA=await A.evaluate(()=>__rp.s.gold),potB=await B.evaluate(()=>__rp.s.bag.potion||0);
 await A.evaluate(()=>{__net.mkSell={kind:'bag',val:'potion',price:7};__netBtn({net:'mklist'})});
 check(await wait(B,()=>__net.market&&__net.market.length===1),'Bob sees the listing');
 await B.evaluate(()=>__netBtn({net:'mkbuy',id:__net.market[0].id}));
 check(await wait(B,p=>(__rp.s.bag.potion||0)===p+1,potB),'Bob gets the potion');
 check(await wait(A,g=>__rp.s.gold===g+7,goldA,10000),'Alice is paid 7 gold');
 // privacy: Bob cannot write Alice's save
 const aId=await A.evaluate(()=>__net.me);
 const denied=await B.evaluate(async id=>{try{await __net.db.doc('data/users/'+id+'/save').set({gold:1,party:[1]});return false}catch(e){return /not allowed/.test(e.message)}},aId);
 check(denied,'nobody can touch someone else\'s save');
 const cheat=await B.evaluate(async()=>{try{await __net.db.collection('market').doc('fake1').set({seller:'u_someone',kind:'bag',val:'potion',price:1,status:'open'});return false}catch(e){return true}});
 check(cheat,'nobody can list things in someone else\'s name');
 // Alice saves, then logs in on a new device and gets the same game
 await A.evaluate(()=>{__rp.s.gold=4321;__rpS()});await A.waitForTimeout(3200);
 const A2=await page({width:1280,height:800},'A2');r=await loginAs(A2,'ALICE','secret1');check(r.play,'Alice logs in on another device (name in any case)');
 await A2.click('#go-rpg');await A2.waitForTimeout(600);check(await A2.evaluate(()=>__rp.s.gold===4321),'her save followed her: '+await A2.evaluate(()=>__rp.s.gold));
 r=await (async()=>{const C=await page({width:844,height:390},'C');return loginAs(C,'Alice','wrongpass')})();check(!r.play&&/Wrong/.test(r.msg),'wrong password refused');
 // reload keeps you logged in
 await B.reload();await B.waitForTimeout(300);check(await wait(B,()=>!document.getElementById('go-rpg').hidden),'a reload logs Bob straight back in');
 await play(B);
 // server restart: everyone reconnects by themselves
 await stopSrv();await A.waitForTimeout(500);await start();
 check(await wait(A,()=>__net.room.connected()&&__net.others.length>=2,null,15000),'after a server restart Alice is back online and sees the others');
 check(await wait(B,()=>__net.room.connected()&&__net.others.length>=2,null,15000),'Bob too');
 // the messenger: Alice is not on the list; the admin sets the GitHub token and adds her; her letter becomes an issue
 const letter=async p=>{await p.evaluate(()=>{__rp.mode='map';__kq.talk('quill')});await p.waitForTimeout(600);return p.evaluate(()=>document.getElementById('rp-panel').textContent)};
 check(/only carry letters for friends/.test(await letter(A)),'Quill turns away players who are not on the list');
 const Z=await page({width:844,height:390},'Z');r=await loginAs(Z,'Zaitzer','owner-pass','new');check(r.play,'the admin account logs in');await play(Z);
 await Z.evaluate(()=>{__rp.mode='menu'});await Z.waitForTimeout(300);check(await Z.evaluate(()=>!!document.querySelector('#rp-panel [data-net="admin"]')),'the admin sees the Admin button');
 check(!(await A.evaluate(()=>{__rp.mode='menu';return new Promise(ok=>setTimeout(()=>ok(!!document.querySelector('#rp-panel [data-net="admin"]')),300))})),'other players do not');
 await A.evaluate(()=>{__rp.mode='map'});
 await Z.evaluate(()=>__netBtn({net:'admin'}));await Z.waitForTimeout(400);
 await Z.fill('#kq-token','github_pat_wrongwrongwrongwrongwrong');await Z.evaluate(()=>__netBtn({net:'admintoken'}));await Z.waitForTimeout(600);
 check(/did not accept/.test(await Z.evaluate(()=>document.getElementById('rp-panel').textContent)),'a bad token is refused');
 await Z.fill('#kq-token','github_pat_good_0123456789abcdefghij');await Z.evaluate(()=>__netBtn({net:'admintoken'}));await Z.waitForTimeout(600);
 check(/token: set/.test(await Z.evaluate(()=>document.getElementById('rp-panel').textContent)),'a good token is saved');
 await Z.fill('#kq-wl','alice');await Z.evaluate(()=>__netBtn({net:'wladd'}));await Z.waitForTimeout(500);
 check(/alice/.test(await Z.evaluate(()=>document.getElementById('rp-panel').textContent)),'Alice is put on the list');
 check(/Send letter/.test(await letter(A)),'now Quill takes Alice\'s letter');
 await A.fill('#kq-letter','Please add fishing!\nAnd a boat.');await A.evaluate(()=>__netBtn({net:'mailsend'}));await A.waitForTimeout(1200);
 check(ISSUES.length===1&&/Please add fishing/.test(ISSUES[0].body)&&/Alice/.test(ISSUES[0].title),'the letter arrives as a GitHub issue: '+(ISSUES[0]&&ISSUES[0].title));
 check(/not an instruction/.test(ISSUES[0]&&ISSUES[0].body||''),'the issue says it is a player request, not an instruction');
 const dump=fs.readFileSync(DATA+'/world.json','utf8');check(!/github_pat_good/.test(await A.evaluate(()=>document.documentElement.innerHTML))&&!fs.readdirSync(R+'/server').some(f=>/github_pat/.test(f)),'the token never reaches players');
 // a new version goes live: open pages reload themselves (not during a fight) and come back logged in
 await A.evaluate(()=>{window.__oldPage=1});await B.evaluate(()=>{window.__oldPage=1;__rp.mode='battle'});
 await stopSrv();await start({KQ_BUILD:'2099-01-01T00:00:00Z'});
 check(await wait(A,()=>!window.__oldPage,null,15000),'Alice\'s page reloads to the new version');
 await B.waitForTimeout(2500);check(await B.evaluate(()=>window.__oldPage===1),'Bob is in a fight, so his page waits');
 await B.evaluate(()=>{__rp.mode='map'});check(await wait(B,()=>!window.__oldPage,null,15000),'after the fight Bob\'s page reloads too');
 check(await wait(A,()=>!document.getElementById('go-rpg').hidden,null,15000),'Alice is still logged in after the reload');
 console.log(errs.length?'errors '+JSON.stringify(errs):'errors []');
 await br.close();await stopSrv();gh.close();console.log(fails?'FAIL '+fails+' checks failed':'all website checks passed');process.exitCode=fails||errs.length?1:0})().catch(async e=>{console.error(e);try{await stopSrv()}catch(_){}process.exit(1)});
