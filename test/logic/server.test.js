/* The game server's guards (the health check, 23 Oct): a malformed address gets 400 and the server keeps running; one connection can't
   flood the others (chat, presence, messages are rate limited); a page may only keep its heroes and locks under its account, and a
   seller only 20 listings; an owner's name, once its account is pinned, can't be taken by registering it again. */
const {World}=require('../../server/world.js'),{Admin}=require('../../server/admin.js'),{spawn}=require('child_process'),http=require('http'),fs=require('fs'),os=require('os'),path=require('path');
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m)}};
class Mem{constructor(){this.data={}}async get(k){return k in this.data?JSON.parse(JSON.stringify(this.data[k])):null}async put(k,v){this.data[k]=JSON.parse(JSON.stringify(v))}
  async del(k){delete this.data[k]}async list(p){return Object.keys(this.data).filter(k=>k.startsWith(p)).sort().map(key=>({key,val:JSON.parse(JSON.stringify(this.data[key]))}))}}
const get=(port,p)=>new Promise(ok=>{http.get({host:'127.0.0.1',port,path:p},r=>{r.resume();r.on('end',()=>ok(r.statusCode))}).on('error',()=>ok(0))});
(async()=>{
  /* a malformed address */
  {const R=path.join(__dirname,'../..'),D=fs.mkdtempSync(path.join(os.tmpdir(),'kqs-')),P=fs.mkdtempSync(path.join(os.tmpdir(),'kqp-')),port=String(19000+Math.floor(Math.random()*900));fs.writeFileSync(P+'/index.html','hi');
   const srv=spawn('node',[R+'/server/main.js'],{env:Object.assign({},process.env,{PORT:port,DATA:D,PUBLIC:P}),stdio:'ignore'});
   let up=0;for(let i=0;i<40&&up!==200;i++){await new Promise(r=>setTimeout(r,100));up=await get(port,'/health')}
   ok(await get(port,'/%E0%A4%A')===400,'a malformed address is answered 400');await new Promise(r=>setTimeout(r,200));
   ok(await get(port,'/health')===200,'and the server is still running');srv.kill()}
  let T=Date.parse('2026-10-23T12:00:00Z');const store=new Mem(),W=new World(store,{now:()=>T,rate:true,config:{admins:['zaitzer']}});W.admin=new Admin(W,store,{admins:['zaitzer']},{});
  const conn=()=>{const c={ip:'1.1.1.'+Math.random(),out:[],send:o=>c.out.push(o),sendRaw:s=>c.out.push(JSON.parse(s)),end:()=>{}};W.open(c);return c};
  const join=async(name,reg)=>{const c=conn();await W.message(c,JSON.stringify({k:reg?'register':'login',name,pass:'secret1'}));return c};
  const Z=await join('Zaitzer',1),A=await join('Alice',1),B=await join('Bob',1);
  ok(Z.out.some(o=>o.k==='authok'&&o.role==='owner'),'the owner logs in as owner (and is pinned)');
  /* flooding */
  B.out=[];for(let i=0;i<100;i++)await W.message(A,JSON.stringify({k:'emit',topic:'kq',data:{t:'chat',txt:'spam '+i}}));
  const got=B.out.filter(o=>o.k==='emit').length;ok(got>=1&&got<=5,'a burst of 100 chat lines reaches others as at most 5: '+got);
  B.out=[];for(let i=0;i<200;i++)await W.message(A,JSON.stringify({k:'pres',presence:{x:i}}));
  const pr=B.out.filter(o=>o.k==='pres').length;ok(pr>=10&&pr<=30,'presence is capped too: '+pr);
  T+=10000;B.out=[];await W.message(A,JSON.stringify({k:'emit',topic:'kq',data:{t:'chat',txt:'later'}}));ok(B.out.some(o=>o.k==='emit'),'after a pause a player talks again');
  /* what a page may keep */
  let n=0;const db=async(c,op,p,data)=>{T+=1000;await W.message(c,JSON.stringify({k:'db',rid:++n,op,path:p,data}));return c.out.find(o=>o.rid===n)||{}};
  const me=A.out.find(o=>o.k==='authok').id;
  ok((await db(A,'set','data/users/'+me+'/char0',{hero:{name:'Pip'}})).ok,'a hero in slot 0 is kept');
  ok((await db(A,'set','data/users/'+me+'/lock5',{dev:'x'})).ok,'a lock is kept');
  ok((await db(A,'set','data/users/'+me+'/junk1',{x:1})).err==='not allowed','any other document is refused');
  ok((await db(A,'set','data/users/'+me+'/char6',{x:1})).err==='not allowed','a seventh slot is refused');
  ok((await db(A,'set','data/users/'+me+'/char0/x/y',{x:1})).err==='not allowed','deeper paths are refused');
  for(let i=0;i<20;i++)await db(A,'set','market/l'+i,{seller:me,status:'open',kind:'bag',val:'potion',price:5});
  ok((await db(A,'set','market/l20',{seller:me,status:'open',kind:'bag',val:'potion',price:5})).err==='too many listings','a seller keeps at most 20 listings');
  /* the owner's name */
  const zid=Z.out.find(o=>o.k==='authok').id;await W.admin.purge({id:zid,lname:'zaitzer'});
  const Z2=await join('Zaitzer',1);ok(Z2.out.some(o=>o.k==='autherr'&&/taken/.test(o.why)),'a deleted owner\'s name can\'t be registered again');
  const store2=new Mem(),W2=new World(store2,{now:()=>T});const A2=new Admin(W2,store2,{admins:['zaitzer']},{});
  ok(await A2.owner({id:'u_first',lname:'zaitzer'}),'the first account with the owner\'s name is pinned as the owner');
  ok(!(await A2.owner({id:'u_thief',lname:'zaitzer'})),'another account with the owner\'s name is not the owner');
  console.log(fails?fails+' of '+checks+' server checks FAILED':'server: '+checks+' checks');process.exitCode=fails?1:0})();
