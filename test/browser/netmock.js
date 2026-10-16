/* a stand-in for claude.use('room'|'user'|'db') that relays through the test runner */
module.exports=function(by){return `(()=>{
  const by=${JSON.stringify(by)},peer='p_'+by+'_'+Math.random().toString(36).slice(2,6);
  const handlers={},peerH=[],others={};let mine={};const dbSubs={};
  const me=()=>({peer,by,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:mine,updatedAt:Date.now()});
  const peers=()=>[me(),...Object.values(others)];
  const firePeers=()=>setTimeout(()=>{const ps=peers();peerH.forEach(h=>h({peers:ps,joined:[],left:[],updated:ps}))},0);
  window.__mockRecv=m=>{
    if(m.k==='emit'){(handlers[m.topic]||[]).forEach(h=>h({topic:m.topic,data:m.data,peer:m.peer,by:m.by,isMe:false,sameTab:false,kind:'viewer',guest:false}))}
    else if(m.k==='pres'){others[m.peer]={peer:m.peer,by:m.by,isMe:false,sameTab:false,kind:'viewer',guest:false,presence:Object.freeze(Object.assign({},m.presence)),updatedAt:Date.now()};firePeers()}
    else if(m.k==='gone'){delete others[m.peer];firePeers()}
    else if(m.k==='dbchg'){window.__mockDb&&window.__mockDb()}
  };
  const room={emit:(topic,data)=>{window.__relay({k:'emit',topic,data:JSON.parse(JSON.stringify(data)),peer,by});return Promise.resolve()},
    on:(t,h)=>{(handlers[t]=handlers[t]||[]).push(h);return()=>{}},
    presence:p=>{mine=Object.assign({},mine,p);for(const k in mine)if(mine[k]===null)delete mine[k];window.__relay({k:'pres',peer,by,presence:mine});firePeers();return Promise.resolve()},
    peers,onPeers:h=>{peerH.push(h);firePeers();return()=>{}},connected:()=>true,onConnection:h=>{setTimeout(()=>h(true),0);return()=>{}}};
  const user={id:async()=>by,me:async()=>({id:by,name:by,avatarUrl:'',color:'#fff',email:null,isOwner:false,canEdit:true}),
    profiles:async ids=>Object.fromEntries([].concat(ids).map(i=>[i,{id:i,name:i==='u_alice'?'Alice':i==='u_bob'?'Bob':i==='u_cara'?'Cara':'',avatarUrl:'',color:'#fff',email:null,isMe:i===by,guest:false}])),
    isOwner:async()=>false,canEdit:async()=>true,can:async()=>true};
  const docSubs={},qSubs=[];
  const snapOf=(id,d)=>({id,exists:!!d,data:()=>d,metadata:{}});
  const runQ=async q=>{let rows=await window.__relay({k:'dbcol',path:q.path});rows=rows.filter(r=>q.w.every(([f,op,v])=>op==='=='?r.data[f]===v:true));q.f({docs:rows.map(r=>snapOf(r.id,r.data)),size:rows.length,empty:!rows.length,docChanges:()=>[],metadata:{}})};
  window.__mockDb=async()=>{for(const p in docSubs){const d=await window.__relay({k:'dbget',path:p});docSubs[p].forEach(f=>f(snapOf(p.split('/').pop(),d)))}for(const q of qSubs)runQ(q)};
  const docRef=path=>({path,id:path.split('/').pop(),get:async()=>{const d=await window.__relay({k:'dbget',path});return snapOf(path.split('/').pop(),d)},
    set:async data=>{await window.__relay({k:'dbset',path,data:JSON.parse(JSON.stringify(data))})},
    update:async data=>{const r=await window.__relay({k:'dbupd',path,data:JSON.parse(JSON.stringify(data))});if(r==='missing')throw{code:'invalid_argument'}},
    delete:async()=>{await window.__relay({k:'dbdel',path})},
    acquire:async o=>window.__relay({k:'dbacq',path,holder:o.holder,ttl:o.ttlMs||30000}),
    onSnapshot:(f)=>{(docSubs[path]=docSubs[path]||[]).push(f);window.__relay({k:'dbget',path}).then(d=>f(snapOf(path.split('/').pop(),d)));return()=>{}}});
  const colRef=(path,w)=>({path,where:(f,op,v)=>colRef(path,(w||[]).concat([[f,op,v]])),orderBy(){return this},limit(){return this},
    doc:id=>docRef(path+'/'+(id||Math.random().toString(36).slice(2,12))),
    add:async data=>{const id=Math.random().toString(36).slice(2,12);await window.__relay({k:'dbset',path:path+'/'+id,data:JSON.parse(JSON.stringify(data))});return docRef(path+'/'+id)},
    get:async()=>{let rows=await window.__relay({k:'dbcol',path});rows=rows.filter(r=>(w||[]).every(([f,op,v])=>r.data[f]===v));return{docs:rows.map(r=>snapOf(r.id,r.data)),size:rows.length,empty:!rows.length}},
    onSnapshot:(f)=>{const q={path,w:w||[],f};qSubs.push(q);runQ(q);return()=>{}}});
  const db={doc:docRef,collection:p=>colRef(p,[])};
  window.claude={use:async n=>n==='room'?room:n==='user'?user:n==='db'?db:null};
})();`};
