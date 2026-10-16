/* The website's link to the game server (server/main.js). It offers the same room / user / db services the
   Claude page has, so the rest of the game cannot tell the two apart. Logs in, keeps the login token,
   reconnects by itself and restores presence and subscriptions after a drop. */
import {store} from './storage.js';

const TOKEN_KEY='kq-token';
function createOnline(url){
  const S={ws:null,open:false,token:store.get(TOKEN_KEY,null),me:null,peer:null,others:new Map(),mine:{},handlers:{},peerH:[],connH:[],
    pending:new Map(),seq:0,docSubs:new Map(),colSubs:[],authed:false,authWait:null,retry:0,closing:false,queue:[]};
  /* ---------- socket ---------- */
  function connect(){if(S.ws&&S.ws.readyState<2)return;S.closing=false;const ws=new WebSocket(url);S.ws=ws;
    ws.onopen=()=>{S.open=true;S.retry=0;const q=S.queue;S.queue=[];if(S.token&&!q.some(m=>m.k==='login'||m.k==='register'))send({k:'resume',token:S.token});q.forEach(send)};
    ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}got(m)};
    ws.onclose=()=>{const was=S.authed;S.open=false;S.authed=false;S.others.clear();
      for(const [,p] of S.pending)p.no(new Error('offline'));S.pending.clear();
      if(was){S.connH.forEach(h=>h(false));firePeers()}
      if(S.authWait){S.authWait.no('Can\'t reach the game server.');S.authWait=null}
      if(!S.closing&&S.token){S.retry=Math.min(S.retry+1,6);setTimeout(connect,500*Math.pow(1.8,S.retry))}};
    ws.onerror=()=>{}}
  function send(m){if(S.open&&S.ws.readyState===1)S.ws.send(JSON.stringify(m));else{S.queue.push(m);connect()}}
  function rpc(m){return new Promise((ok,no)=>{const id=++S.seq;S.pending.set(id,{ok,no});send(Object.assign({rid:id},m));
    setTimeout(()=>{if(S.pending.has(id)){S.pending.delete(id);no(new Error('timeout'))}},15000)})}
  function got(m){switch(m.k){
    case 'authok':{S.authed=true;S.me={id:m.id,name:m.name,canMail:!!m.canMail,admin:!!m.admin};S.peer=m.peer;if(m.token){S.token=m.token;store.set(TOKEN_KEY,m.token)}
      S.others.clear();(m.peers||[]).forEach(p=>S.others.set(p.peer,mk(p)));
      if(Object.keys(S.mine).length)send({k:'pres',presence:S.mine});
      if(m.build&&m.build!=='dev'&&typeof BUILD_ID!=='undefined'&&m.build!==BUILD_ID&&account.onNewVersion)account.onNewVersion(m.build);
      if(S.authWait){S.authWait.ok(S.me);S.authWait=null}
      S.connH.forEach(h=>h(true));firePeers();refetch(()=>true);break}
    case 'autherr':if(m.stale){S.token=null;store.set(TOKEN_KEY,null)}if(S.authWait){S.authWait.no(m.why);S.authWait=null}break;
    case 'loggedout':break;
    case 'pres':S.others.set(m.peer,mk(m));firePeers();break;
    case 'gone':S.others.delete(m.peer);firePeers();break;
    case 'emit':(S.handlers[m.topic]||[]).forEach(h=>h({topic:m.topic,data:m.data,peer:m.peer,by:m.by,isMe:false,sameTab:false,kind:'viewer',guest:false}));break;
    case 'dbchg':refetch(p=>p===m.path||m.path.startsWith(p+'/'));break;
    case 'res':{const p=S.pending.get(m.rid);if(!p)break;S.pending.delete(m.rid);if(m.ok===false){const e=new Error(m.err);e.code=m.err==='missing'?'invalid_argument':m.err;p.no(e)}else p.ok(m.val)}}}
  const mk=p=>({peer:p.peer,by:p.by,isMe:false,sameTab:false,kind:'viewer',guest:false,presence:Object.freeze(Object.assign({},p.presence)),updatedAt:Date.now()});
  const meP=()=>({peer:S.peer,by:S.me&&S.me.id,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:S.mine,updatedAt:Date.now()});
  const peers=()=>S.authed?[meP(),...S.others.values()]:[];
  function firePeers(){setTimeout(()=>{const ps=peers();S.peerH.forEach(h=>h({peers:ps,joined:[],left:[],updated:ps}))},0)}
  /* ---------- accounts ---------- */
  function auth(m){return new Promise((ok,no)=>{if(S.authWait)S.authWait.no('cancelled');S.authWait={ok,no};send(m)})}
  const account={
    onNewVersion:null,
    /* server-only requests (the messenger, the admin screen): resolves with the reply's value */
    call:m=>rpc(m),/* set by the page: called when the server runs a newer build than this page */
    get loggedIn(){return S.authed},get me(){return S.me},hasToken:()=>!!S.token,
    resume:()=>S.token?auth({k:'resume',token:S.token}):Promise.reject('Not logged in.'),
    login:(name,pass)=>auth({k:'login',name,pass}),register:(name,pass)=>auth({k:'register',name,pass}),
    logout(){if(S.token)send({k:'logout',token:S.token});S.token=null;store.set(TOKEN_KEY,null);S.closing=true;S.authed=false;S.me=null;try{S.ws&&S.ws.close()}catch(e){}}};
  /* ---------- room / user / db, shaped like the Claude page's ---------- */
  const room={emit:(topic,data)=>{send({k:'emit',topic,data});return Promise.resolve()},
    on:(t,h)=>{(S.handlers[t]=S.handlers[t]||[]).push(h);return()=>{S.handlers[t]=S.handlers[t].filter(x=>x!==h)}},
    presence:p=>{S.mine=Object.assign({},S.mine,p);for(const k in S.mine)if(S.mine[k]===null)delete S.mine[k];if(S.authed)send({k:'pres',presence:S.mine});firePeers();return Promise.resolve()},
    peers,onPeers:h=>{S.peerH.push(h);firePeers();return()=>{S.peerH=S.peerH.filter(x=>x!==h)}},
    connected:()=>S.authed,onConnection:h=>{S.connH.push(h);setTimeout(()=>h(S.authed),0);return()=>{}}};
  const user={id:async()=>S.me&&S.me.id,me:async()=>S.me&&{id:S.me.id,name:S.me.name,avatarUrl:'',color:'#fff',email:null,isOwner:false,canEdit:true},
    profiles:async ids=>{const r=await rpc({k:'profiles',ids:[].concat(ids)});for(const id in r)r[id]=Object.assign({avatarUrl:'',color:'#fff',email:null,isMe:S.me&&id===S.me.id,guest:false},r[id]);return r},
    isOwner:async()=>false,canEdit:async()=>true,can:async()=>true};
  const snapOf=(id,d)=>({id,exists:d!=null,data:()=>d,metadata:{}});
  const colSnap=rows=>({docs:rows.map(r=>snapOf(r.id,r.data)),size:rows.length,empty:!rows.length,docChanges:()=>[],metadata:{}});
  function refetch(match){
    for(const [path,fs] of S.docSubs)if(match(path))rpc({k:'db',op:'get',path}).then(d=>fs.forEach(f=>f(snapOf(path.split('/').pop(),d)))).catch(()=>{});
    for(const q of S.colSubs)if(match(q.path))rpc({k:'db',op:'col',path:q.path,where:q.w}).then(rows=>q.f(colSnap(rows))).catch(e=>q.err&&q.err(e))}
  const newId=()=>Math.random().toString(36).slice(2,12)+Date.now().toString(36).slice(-4);
  const docRef=path=>({path,id:path.split('/').pop(),
    get:async()=>snapOf(path.split('/').pop(),await rpc({k:'db',op:'get',path})),
    set:async data=>{await rpc({k:'db',op:'set',path,data:JSON.parse(JSON.stringify(data))})},
    update:async data=>{await rpc({k:'db',op:'upd',path,data:JSON.parse(JSON.stringify(data))})},
    delete:async()=>{await rpc({k:'db',op:'del',path})},
    acquire:async o=>rpc({k:'db',op:'acq',path,ttl:(o&&o.ttlMs)||30000}),
    onSnapshot:(f,err)=>{if(!S.docSubs.has(path))S.docSubs.set(path,[]);S.docSubs.get(path).push(f);
      rpc({k:'db',op:'get',path}).then(d=>f(snapOf(path.split('/').pop(),d))).catch(e=>err&&err(e));
      return()=>{S.docSubs.set(path,(S.docSubs.get(path)||[]).filter(x=>x!==f))}}});
  const colRef=(path,w)=>({path,where:(f,op,v)=>colRef(path,w.concat([[f,op,v]])),orderBy(){return this},limit(){return this},
    doc:id=>docRef(path+'/'+(id||newId())),
    add:async data=>{const id=newId();await rpc({k:'db',op:'set',path:path+'/'+id,data:JSON.parse(JSON.stringify(data))});return docRef(path+'/'+id)},
    get:async()=>colSnap(await rpc({k:'db',op:'col',path,where:w})),
    onSnapshot:(f,err)=>{const q={path,w,f,err};S.colSubs.push(q);rpc({k:'db',op:'col',path,where:w}).then(r=>f(colSnap(r))).catch(e=>err&&err(e));
      return()=>{S.colSubs=S.colSubs.filter(x=>x!==q)}}});
  const db={doc:docRef,collection:p=>colRef(p,[])};
  return{account,provider:{use:async n=>n==='room'?room:n==='user'?user:n==='db'?db:null}};
}
export {TOKEN_KEY,createOnline};
