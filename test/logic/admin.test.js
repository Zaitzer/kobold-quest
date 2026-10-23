/* The admin tools (build step 16, systems.md §17), on the real World with an in-memory store: every tool is tried, the roles hold,
   each action is in the admin log, and no reply ever carries a password hash, a salt, a session or the GitHub token, nor a private message. */
const {World}=require('../../server/world.js'),{Admin,TOOLS}=require('../../server/admin.js'),fs=require('fs'),os=require('os'),path=require('path');
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m)}};
class Mem{constructor(){this.data={}}async get(k){return k in this.data?JSON.parse(JSON.stringify(this.data[k])):null}async put(k,v){this.data[k]=JSON.parse(JSON.stringify(v))}
  async del(k){delete this.data[k]}async list(p){return Object.keys(this.data).filter(k=>k.startsWith(p)).sort().map(key=>({key,val:JSON.parse(JSON.stringify(this.data[key]))}))}}
let T=Date.parse('2026-10-23T12:00:00Z');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'kqadm-'));fs.mkdirSync(dir+'/backups');
(async()=>{const store=new Mem(),W=new World(store,{now:()=>T,build:'b1'});W.admin=new Admin(W,store,{admins:['zaitzer']},{dir,fs});
  const seen=[];
  const conn=()=>{const c={ip:'1.1.1.'+Math.random(),out:[],ended:false,send:o=>{c.out.push(o);seen.push(JSON.stringify(o))},sendRaw:s=>{c.out.push(JSON.parse(s));seen.push(s)},end:()=>{c.ended=true;W.close(c)}};W.open(c);return c};
  const last=(c,k)=>c.out.filter(o=>!k||o.k===k).slice(-1)[0];
  const join=async(name,pass,reg)=>{const c=conn();await W.message(c,JSON.stringify({k:reg?'register':'login',name,pass:pass||'secret1'}));return c};
  let n=0;const call=async(c,tool,o)=>{await W.message(c,JSON.stringify(Object.assign({k:'adm',rid:++n,tool},o||{})));return c.out.find(x=>x.rid===n)||{}};
  const Z=await join('Zaitzer','owner-pass',1),A=await join('Alice','alice-pass',1),B=await join('Bob','bob-pass',1);
  ok(last(Z,'authok').role==='owner'&&last(Z,'authok').admin,'the owner is named in config');ok(!last(A,'authok').role&&!last(A,'authok').admin,'a player sees no Admin');
  ok((await call(A,'status')).err==='not an admin','a player cannot use the tools');
  ok(Object.keys(TOOLS).length>=30,'the tools are listed');
  /* roles */
  ok((await call(Z,'mods',{op:'add',who:'alice'})).ok,'the owner grants a moderator');
  const A2=await join('Alice','alice-pass');ok(last(A2,'authok').role==='mod','the moderator sees the Admin screen at login');
  ok((await call(A2,'status')).ok,'a moderator may see the status');ok((await call(A2,'motd',{text:'hi'})).err==='owner only','a moderator may not set the message of the day');
  ok((await call(A2,'pwreset',{name:'bob'})).err==='owner only','a moderator may not reset passwords');
  /* the server */
  const st=(await call(Z,'status')).val;ok(st.build==='b1'&&st.online>=3&&st.accounts===3,'status: build, online, accounts '+JSON.stringify(st));
  await call(Z,'motd',{text:'Welcome to the festival weekend!'});const C=await join('Bob','bob-pass');ok(last(C,'authok').motd==='Welcome to the festival weekend!','the message of the day at login');
  await call(A2,'announce',{text:'Server restarts at 8'});ok(last(B,'announce')&&last(B,'announce').text==='Server restarts at 8','announce reaches everyone online');
  await call(Z,'maint',{on:1,now:1});await new Promise(r=>setTimeout(r,20));ok(B.ended&&!A2.ended&&!Z.ended,'maintenance signs players out, not admins');
  const D=await join('Bob','bob-pass');ok(/looked after/.test((last(D,'autherr')||{}).why||''),'no logins during maintenance');
  await call(Z,'maint',{on:0});const E=await join('Bob','bob-pass');ok(last(E,'authok'),'logins again after maintenance');
  /* players: find, a hero, the fixes */
  const bob=await store.get('users/bob');await store.put('docs/data/users/'+bob.id+'/char0',{hero:{name:'Tansy'},party:[{name:'Tansy',cls:'rogue',lvl:6,hp:20,xp:3}],q:{act:7,pb:2},gold:40,w6:'r1',w6st:{respawn:'hearthspire'}});
  await store.put('docs/data/users/'+bob.id+'/lock0',{dev:'x'});
  const f=(await call(A2,'find',{q:'bo'})).val;ok(f&&f[0].name==='Bob'&&f[0].heroes[0].name==='Tansy'&&f[0].online,'find: account, heroes, online');
  const h=(await call(A2,'hero',{name:'bob',slot:0})).val;ok(h&&h.pack[0].lvl===6&&h.flags.pb===2&&h.gold===40,'a hero, read-only');
  ok((await call(A2,'unstuck',{name:'bob',slot:0})).ok&&(await store.get('docs/data/users/'+bob.id+'/char0')).fix[0].k==='unstuck','unstuck: a note the game applies');
  ok((await call(A2,'unlock',{name:'bob',slot:0})).ok&&!(await store.get('docs/data/users/'+bob.id+'/lock0')),'release the lock');
  ok((await call(Z,'flag',{name:'bob',slot:0,flag:'pb',v:5})).err,'a flag moves one step only');ok((await call(Z,'flag',{name:'bob',slot:0,flag:'pb',v:3})).ok,'a flag one step on');
  ok((await call(Z,'compensate',{name:'bob',slot:0,gold:50})).err,'compensation needs a reason');ok((await call(Z,'compensate',{name:'bob',slot:0,gold:50,why:'The cart bug ate your gold.'})).ok,'compensate with a reason');
  ok((await call(A2,'renamehero',{name:'bob',slot:0,to:'Nettle',why:'rude name'})).ok&&(await store.get('docs/data/users/'+bob.id+'/char0')).hero.name==='Nettle','rename a hero');
  ok((await call(A2,'rename',{name:'bob',to:'Bobby',why:'rude name'})).ok&&(await store.get('users/bobby'))&&!(await store.get('users/bob')),'rename an account');
  const Bb=await join('Bobby','bob-pass');ok(last(Bb,'authok')&&/renamed/.test(last(Bb,'authok').warns.join(' ')),'the player is told why at login');
  const code=(await call(Z,'pwreset',{name:'bobby'})).val.code;const R=conn();await W.message(R,JSON.stringify({k:'resetpw',name:'bobby',code:'WRONG',pass:'newpass1'}));ok(last(R,'autherr'),'a wrong code fails');
  await W.message(R,JSON.stringify({k:'resetpw',name:'bobby',code,pass:'newpass1'}));ok(last(R,'pwdone'),'the code sets a new password');
  const P=await join('Bobby','newpass1');ok(last(P,'authok'),'logs in with the new password');const P2=await join('Bobby','bob-pass');ok(last(P2,'autherr'),'the old password is gone');
  await W.message(R,JSON.stringify({k:'resetpw',name:'bobby',code,pass:'again11'}));ok(last(R,'autherr'),'a code works once');
  const ch=await store.get('docs/data/users/'+bob.id+'/char0');ch.deletedAt=T-DAYS(2);await store.put('docs/data/users/'+bob.id+'/char0',ch);
  ok((await call(Z,'restore',{name:'bobby',slot:0})).ok&&!(await store.get('docs/data/users/'+bob.id+'/char0')).deletedAt,'restore a deleted hero');
  fs.writeFileSync(dir+'/backups/world-2026-10-20.json',JSON.stringify({['docs/data/users/'+bob.id+'/char0']:{hero:{name:'Old Tansy'},party:[]}}));
  ok((await call(Z,'backups')).val[0]==='2026-10-20','the backups are listed');
  ok((await call(Z,'restorebackup',{name:'bobby',slot:0,day:'2026-10-20'})).ok&&(await store.get('docs/data/users/'+bob.id+'/char0')).hero.name==='Old Tansy'&&(await store.get('docs/data/users/'+bob.id+'/copy0')).hero.name==='Nettle','restore from a backup, the current save kept as a copy');
  /* moderation */
  await W.message(P,JSON.stringify({k:'emit',topic:'kq',data:{t:'chat',txt:'hello world'}}));await W.message(P,JSON.stringify({k:'emit',topic:'kq',data:{t:'chat',txt:'psst secret',to:A2.peer}}));
  await W.message(A2,JSON.stringify({k:'report',rid:++n,peer:P.peer,why:'spam'}));const rep=(await call(A2,'reports')).val;ok(rep.length===1&&rep[0].about==='Bobby'&&rep[0].lines.some(l=>l.txt==='hello world'),'a report with the chat around it');
  ok(!(await call(A2,'chatlog')).val.some(l=>/secret/.test(l.txt)),'private messages are never in the chat log');
  ok((await call(A2,'closereport',{id:rep[0].id,how:'mute',for:'hour',why:'spam'})).ok,'close a report with a mute');
  await W.message(P,JSON.stringify({k:'emit',topic:'kq',data:{t:'chat',txt:'still here'}}));ok(last(P,'muted')&&!A2.out.some(o=>o.data&&o.data.txt==='still here'),'a muted player\'s chat goes nowhere');
  ok((await call(A2,'undo',{name:'bobby',what:'mute'})).ok,'undo a mute');
  await call(A2,'words',{op:'add',word:'darn'});await W.message(P,JSON.stringify({k:'emit',topic:'kq',data:{t:'chat',txt:'darn it'}}));ok(A2.out.some(o=>o.data&&o.data.txt==='**** it'),'the word filter');
  ok((await call(A2,'warn',{name:'bobby',why:'be kind'})).ok&&last(P,'warned'),'a warning reaches the player');
  ok((await call(A2,'ban',{name:'bobby',for:'day',why:'spam again'})).ok&&P.ended,'a ban signs the player out');const P3=await join('Bobby','newpass1');ok(/banned/.test((last(P3,'autherr')||{}).why||''),'a banned player cannot log in');
  T+=DAYS(2);const P4=await join('Bobby','newpass1');ok(last(P4,'authok'),'a day\'s ban ends');
  ok((await call(A2,'ban',{name:'zaitzer',for:'ever',why:'x'})).err,'nobody bans the owner');
  T+=DAYS(2);ok(!(await call(A2,'chatlog')).val.length,'chat is gone after 24 hours');
  /* the market */
  await store.put('docs/market/L1',{seller:bob.id,kind:'item',val:'potion',price:9,status:'open'});
  ok((await call(A2,'listings')).val[0].seller==='bobby','the listings');ok((await call(A2,'unlist',{id:'L1',why:'mispriced'})).ok&&(await store.get('docs/market/L1')).status==='removed','remove a listing');
  await W.message(P4,JSON.stringify({k:'emit',topic:'kq',data:{t:'gift',to:A2.peer,kind:'gold',val:5}}));ok((await call(Z,'gifts')).val[0].to==='Alice','the gift log');
  /* events, tests, errors, the log */
  ok((await call(Z,'festival',{text:'Lantern week',days:3})).ok&&last(await join('Alice','alice-pass'),'authok').festival.name==='Lantern week','a festival shows at login');
  const z=await store.get('users/zaitzer');await store.put('docs/data/users/'+z.id+'/char1',{hero:{name:'Testy'},party:[]});ok((await call(Z,'testhero',{slot:1})).ok&&(await store.get('docs/data/users/'+z.id+'/char1')).test===1,'mark one\'s own hero test');
  ok((await call(Z,'testhero',{slot:0})).err,'only one\'s own existing hero');
  await W.message(P4,JSON.stringify({k:'err',msg:'x is undefined',build:'b1'}));await W.message(A2,JSON.stringify({k:'err',msg:'x is undefined',build:'b1'}));ok((await call(Z,'errors')).val[0].count===2,'error reports grouped');
  const lg=(await call(Z,'log')).val;ok(lg.some(r=>r.tool==='ban'&&r.on==='Bobby'&&r.why==='spam again')&&lg.some(r=>r.tool==='pwreset'),'the admin log: who, which tool, on whom, why');
  ok((await call(A2,'log')).val.every(r=>r.by==='alice'),'a moderator sees their own log lines');
  ok(!lg.some(r=>JSON.stringify(r).includes(code)),'the reset code is not in the log');
  ok((await call(Z,'delacct',{name:'alice',typed:'nope'})).err,'delete needs the name typed');ok((await call(Z,'delacct',{name:'alice',typed:'alice'})).ok&&/deleted/.test((last(await join('Alice','alice-pass'),'autherr')||{}).why||''),'a deleted account cannot log in');
  T+=DAYS(8);await W.admin.tidy();ok(!(await store.get('users/alice')),'gone after 7 days');
  /* nothing secret ever left */
  await store.put('secrets/github',{token:'ghp_SECRETSECRETSECRETSECRET'});await call(Z,'status');
  const all=seen.join('\n'),hashes=(await store.list('users/')).map(r=>r.val.hash).concat((await store.list('users/')).map(r=>r.val.salt));
  ok(!hashes.some(x=>x&&all.includes(x))&&!all.includes('ghp_SECRET')&&!/"hash"|"salt"/.test(all),'no password hash, salt or token in any reply');
  console.log((fails?'FAIL':'ok')+' admin tools: '+checks+' checks');process.exitCode=fails?1:0;
})().catch(e=>{console.log('FAIL',e.stack);process.exitCode=1});
function DAYS(d){return d*864e5}
